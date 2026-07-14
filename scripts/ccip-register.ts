import hre from "hardhat";
import chalk from "chalk";
import { getNetwork } from "../networks";

/**
 * Self-serve CCT registration for a PropertyToken + pool pair on the
 * connected network (https://docs.chain.link/ccip/concepts/cross-chain-token),
 * plus the token-side wiring a working lane requires:
 *   1. Grant the pool MINTER_ROLE + BURNER_ROLE on the bridged token
 *   2. Exempt the pool in TokenCompliance (the onRamp transfers user tokens
 *      to the pool before lockOrBurn; without exemption that transfer reverts)
 *   3. RegistryModuleOwnerCustom.registerAdminViaGetCCIPAdmin(token)
 *   4. TokenAdminRegistry.acceptAdminRole(token)
 *   5. TokenAdminRegistry.setPool(token, pool)
 * Cross-chain lane wiring (applyChainUpdates) is a separate step once the
 * remote pool exists.
 *
 * The signer (EVM_PRIVATE_KEY) must be the token's CCIP admin (its owner) and
 * the TokenCompliance owner. Steps 1-2 are skipped with a warning if the token
 * is not a role-based bridged token or the signer lacks the rights.
 *
 * Usage: hardhat run --network arc-testnet scripts/ccip-register.ts
 *   env: CCIP_TOKEN=0x...  CCIP_POOL=0x...
 */

const CCIP_ADMIN_ABI = ["function getCCIPAdmin() view returns (address)"];
const ACCESS_CONTROL_ABI = [
	"function MINTER_ROLE() view returns (bytes32)",
	"function BURNER_ROLE() view returns (bytes32)",
	"function hasRole(bytes32 role, address account) view returns (bool)",
	"function grantRole(bytes32 role, address account)",
];
const COMPLIANCE_ABI = [
	"function compliance() view returns (address)",
	"function isExempt(address) view returns (bool)",
	"function setExempt(address target, bool status)",
];
const REGISTRY_MODULE_ABI = [
	"function registerAdminViaGetCCIPAdmin(address token) external",
];
const TOKEN_ADMIN_REGISTRY_ABI = [
	"function acceptAdminRole(address localToken) external",
	"function setPool(address localToken, address pool) external",
	"function getTokenConfig(address token) external view returns (tuple(address administrator, address pendingAdministrator, address tokenPool))",
];

const { ethers, networkName } = await hre.network.connect();
const [signer] = await ethers.getSigners();

if (!process.env.CCIP_TOKEN || !process.env.CCIP_POOL) {
	console.error("Error: CCIP_TOKEN and CCIP_POOL env vars are required.");
	process.exit(1);
}

// Normalize + checksum so later equality checks and reverts are reliable.
let token: string;
let pool: string;
try {
	token = ethers.getAddress(process.env.CCIP_TOKEN);
	pool = ethers.getAddress(process.env.CCIP_POOL);
} catch {
	console.error("Error: CCIP_TOKEN / CCIP_POOL are not valid addresses.");
	process.exit(1);
}

let net;
try {
	net = getNetwork(networkName);
} catch {
	console.error(
		`Error: no config for network '${networkName}'. Run with --network arc-testnet (Hardhat's default network is unnamed and has no CCIP config).`
	);
	process.exit(1);
}
if (!net.ccip) {
	console.error(
		`Error: no CCIP config for network '${networkName}'. Add addresses from https://docs.chain.link/ccip/directory to networks.ts first.`
	);
	process.exit(1);
}

console.log(chalk.bold.blue(`\nCCT registration on ${networkName}`));
console.log(`Signer: ${chalk.yellow(signer.address)}`);
console.log(`Token:  ${chalk.yellow(token)}  Pool: ${chalk.yellow(pool)}`);

// Preflight: the signer must be the token's CCIP admin (owner).
const ccipAdminReader = new ethers.Contract(token, CCIP_ADMIN_ABI, signer);
const tokenAdmin = ethers.getAddress(await ccipAdminReader.getCCIPAdmin());
if (tokenAdmin !== signer.address) {
	console.error(
		`Error: signer ${signer.address} is not the token's CCIP admin (${tokenAdmin}). Run with that key.`
	);
	process.exit(1);
}

// Step 1: grant the pool MINTER_ROLE + BURNER_ROLE (bridged tokens only).
// Only the pre-flight capability probe is allowed to swallow errors; an actual
// grant transaction that reverts is a hard failure (a silent one ships a
// broken lane).
const ac = new ethers.Contract(token, ACCESS_CONTROL_ABI, signer);
let minter: string | null = null;
let burner: string | null = null;
try {
	minter = await ac.MINTER_ROLE();
	burner = await ac.BURNER_ROLE();
} catch {
	console.warn(
		chalk.yellow(
			"Token exposes no MINTER_ROLE/BURNER_ROLE — not a bridged token. Skipping role grants (inbound minting will not work if it should be bridged)."
		)
	);
}
if (minter && burner) {
	for (const [name, role] of [
		["MINTER_ROLE", minter],
		["BURNER_ROLE", burner],
	] as const) {
		if (await ac.hasRole(role, pool)) {
			console.log(`${name}: already granted to pool.`);
		} else {
			console.log(`Granting ${name} to pool...`);
			await (await ac.grantRole(role, pool)).wait();
		}
	}
}

// Step 2: exempt the pool in TokenCompliance so outbound transfers to it pass.
// Reads are best-effort; a setExempt that reverts is a hard failure.
const complianceReader = new ethers.Contract(token, COMPLIANCE_ABI, signer);
let complianceAddr: string | null = null;
try {
	complianceAddr = ethers.getAddress(await complianceReader.compliance());
} catch {
	console.warn(
		chalk.yellow(
			"Token exposes no compliance() — cannot auto-exempt the pool. Ensure the pool is exempt in TokenCompliance manually, or outbound bridging will revert."
		)
	);
}
if (complianceAddr) {
	const compliance = new ethers.Contract(
		complianceAddr,
		COMPLIANCE_ABI,
		signer
	);
	if (await compliance.isExempt(pool)) {
		console.log("Compliance exemption: pool already exempt.");
	} else {
		console.log("Exempting pool in TokenCompliance...");
		await (await compliance.setExempt(pool, true)).wait();
	}
}

// Steps 3-5: CCT admin registration + pool link.
const registryModule = new ethers.Contract(
	net.ccip.registryModuleOwner,
	REGISTRY_MODULE_ABI,
	signer
);
const adminRegistry = new ethers.Contract(
	net.ccip.tokenAdminRegistry,
	TOKEN_ADMIN_REGISTRY_ABI,
	signer
);

const config = await adminRegistry.getTokenConfig(token);
const administrator = ethers.getAddress(config.administrator);
const pendingAdministrator = ethers.getAddress(config.pendingAdministrator);
const currentPool =
	config.tokenPool === ethers.ZeroAddress
		? ethers.ZeroAddress
		: ethers.getAddress(config.tokenPool);

if (administrator === ethers.ZeroAddress) {
	if (
		pendingAdministrator !== ethers.ZeroAddress &&
		pendingAdministrator !== signer.address
	) {
		console.error(
			`Error: admin registration pending for a different wallet (${pendingAdministrator}). Run with that key to accept.`
		);
		process.exit(1);
	}
	if (pendingAdministrator === ethers.ZeroAddress) {
		console.log("Registering admin via getCCIPAdmin()...");
		await (await registryModule.registerAdminViaGetCCIPAdmin(token)).wait();
	}
	console.log("Accepting admin role...");
	await (await adminRegistry.acceptAdminRole(token)).wait();
} else if (administrator !== signer.address) {
	console.error(
		`Error: token admin is ${administrator}, not the signer. Pool linking must run from the admin key.`
	);
	process.exit(1);
} else {
	console.log(`Admin already set: ${administrator}`);
}

if (currentPool !== pool) {
	console.log("Linking pool...");
	await (await adminRegistry.setPool(token, pool)).wait();
} else {
	console.log("Pool already linked.");
}

const finalConfig = await adminRegistry.getTokenConfig(token);
console.log(chalk.bold.green("\nRegistration complete:"));
console.log(`  administrator: ${finalConfig.administrator}`);
console.log(`  tokenPool:     ${finalConfig.tokenPool}`);
console.log(
	"\nNext: deploy the remote pool + token, then wire lanes with applyChainUpdates."
);

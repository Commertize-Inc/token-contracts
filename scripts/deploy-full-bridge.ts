import hre from "hardhat";
import { ethers as ethersLib } from "ethers";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { getNetworkMeta } from "../hardhat.config";

/**
 * Full Bridge Deployment Script (Non-Interactive)
 *
 * Deploys everything end-to-end for a cross-chain bridge between
 * Hedera testnet (home) and Base Sepolia (destination).
 *
 * Phases:
 *   1.  Connect to Hedera testnet, check balances
 *   2.  Deploy PropertyToken via PropertyFactory
 *   3.  Deploy PropertyTokenAdapter
 *   4.  Set adapter as compliance-exempt
 *   5.  Save Hedera deployment JSON
 *   6.  Connect to Base Sepolia via raw ethers
 *   7.  Deploy IdentityRegistry + register deployer
 *   8.  Deploy TokenCompliance
 *   9.  Deploy PropertyTokenOFT
 *  10.  Wire peers (adapter ↔ OFT)
 *  11.  Set enforced options on both sides
 *  12.  Save Base Sepolia deployment JSON
 *
 * Usage:
 *   hardhat run scripts/deploy-full-bridge.ts --network testnet
 */

// ─── Config ───────────────────────────────────────────────────

const PROPERTY_NAME = "Bridge Test Property";
const PROPERTY_SYMBOL = "BTP";
const PROPERTY_SUPPLY = 1_000_000; // 1M tokens (will be parsed to 18 decimals)
const MIN_DST_GAS = 200_000;

// ─── Helper: Load artifact JSON from disk ─────────────────────

function loadArtifact(contractName: string, solPath: string) {
	const artifactPath = path.join(
		import.meta.dirname,
		`../artifacts/src/${solPath}/${contractName}.json`
	);
	if (!fs.existsSync(artifactPath)) {
		throw new Error(`Artifact not found: ${artifactPath}. Run 'hardhat build' first.`);
	}
	return JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
}

// ─── Helper: Load / save deployment JSON ──────────────────────

interface DeploymentConfig {
	contracts: Record<string, string>;
	timestamp?: string;
	network?: {
		name: string;
		chainId: number;
		rpc: string;
		currency: string;
		blockExplorerUrl: string;
	};
	layerZero?: { endpoint: string; eid: number };
	bridgeContracts?: Record<string, Record<string, string>>;
}

function loadDeployment(networkName: string): DeploymentConfig {
	const file = `deployment.${networkName.replace(/-/g, "_")}.json`;
	const filePath = path.join(import.meta.dirname, `../${file}`);
	if (fs.existsSync(filePath)) {
		try {
			return JSON.parse(fs.readFileSync(filePath, "utf-8"));
		} catch {
			console.warn(chalk.yellow(`Could not parse ${file}, starting fresh.`));
		}
	}
	return { contracts: {} };
}

function saveDeployment(networkName: string, config: DeploymentConfig) {
	const file = `deployment.${networkName.replace(/-/g, "_")}.json`;
	const filePath = path.join(import.meta.dirname, `../${file}`);
	config.timestamp = new Date().toISOString();
	fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
	console.log(chalk.green(`  Saved ${file}`));
}

// ─── Helper: Encode enforced options ──────────────────────────

function encodeEnforcedOptions(gasLimit: bigint): string {
	return ethersLib.solidityPacked(
		["uint16", "uint8", "uint16", "uint8", "uint128"],
		[3, 1, 17, 1, gasLimit]
	);
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.blue("\nFull Bridge Deployment — Hedera Testnet ↔ Base Sepolia\n"));

const homeMeta = getNetworkMeta("testnet");
const destMeta = getNetworkMeta("base-sepolia");

if (!homeMeta.lzEndpoint || !homeMeta.lzEid) throw new Error("Missing LZ config for testnet");
if (!destMeta.lzEndpoint || !destMeta.lzEid) throw new Error("Missing LZ config for base-sepolia");

// ═══════════════════════════════════════════════════════════════
// PHASE 1: Connect to Hedera testnet
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 1: Connect to Hedera testnet"));

const { ethers, networkName } = await hre.network.connect();

if (networkName !== "testnet") {
	console.error(chalk.red(`This script must be run with --network testnet (got: ${networkName})`));
	process.exit(1);
}

const [deployer] = await ethers.getSigners();
const homeBalance = await deployer.provider.getBalance(deployer.address);
console.log(`  Deployer: ${chalk.yellow(deployer.address)}`);
console.log(`  Balance:  ${chalk.yellow(ethers.formatEther(homeBalance))} HBAR`);

const homeDeployment = loadDeployment("testnet");
const homeContracts = homeDeployment.contracts;

if (!homeContracts.PropertyFactory) {
	console.error(chalk.red("PropertyFactory not found in deployment.testnet.json. Deploy core contracts first."));
	process.exit(1);
}
if (!homeContracts.TokenCompliance) {
	console.error(chalk.red("TokenCompliance not found in deployment.testnet.json. Deploy core contracts first."));
	process.exit(1);
}

console.log(chalk.green("  ✓ Connected to Hedera testnet\n"));

// ═══════════════════════════════════════════════════════════════
// PHASE 2: Deploy PropertyToken via PropertyFactory
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 2: Deploy PropertyToken via PropertyFactory"));

let propertyTokenAddress: string;

// Check if we already deployed one (idempotent)
if (!homeDeployment.bridgeContracts || Object.keys(homeDeployment.bridgeContracts).length === 0) {
	const factory = await ethers.getContractAt("PropertyFactory", homeContracts.PropertyFactory, deployer);

	console.log(`  Deploying "${PROPERTY_NAME}" (${PROPERTY_SYMBOL}), supply: ${PROPERTY_SUPPLY.toLocaleString()}...`);
	const tx = await factory.deployProperty(
		PROPERTY_NAME,
		PROPERTY_SYMBOL,
		PROPERTY_SUPPLY,
		homeContracts.TokenCompliance
	);
	const receipt = await tx.wait();

	// Find PropertyDeployed event
	const event = receipt!.logs.find((log: any) => {
		try {
			return factory.interface.parseLog(log)?.name === "PropertyDeployed";
		} catch {
			return false;
		}
	});
	if (!event) throw new Error("PropertyDeployed event not found in receipt");
	propertyTokenAddress = factory.interface.parseLog(event!)!.args.property;
	console.log(`  PropertyToken: ${chalk.green(propertyTokenAddress)}`);
} else {
	propertyTokenAddress = Object.keys(homeDeployment.bridgeContracts)[0];
	console.log(`  Already deployed — reusing PropertyToken: ${chalk.green(propertyTokenAddress)}`);
}

console.log(chalk.green("  ✓ PropertyToken ready\n"));

// ═══════════════════════════════════════════════════════════════
// PHASE 3: Deploy PropertyTokenAdapter
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 3: Deploy PropertyTokenAdapter"));

let adapterAddress: string;

const existingAdapter = homeDeployment.bridgeContracts?.[propertyTokenAddress]?.adapter;
if (!existingAdapter) {
	const AdapterFactory = await ethers.getContractFactory("PropertyTokenAdapter");
	console.log(`  Deploying adapter for ${propertyTokenAddress}...`);
	const adapter = await AdapterFactory.deploy(
		propertyTokenAddress,
		homeMeta.lzEndpoint,
		deployer.address,
		homeContracts.TokenCompliance
	);
	await adapter.waitForDeployment();
	adapterAddress = await adapter.getAddress();
	console.log(`  Adapter: ${chalk.green(adapterAddress)}`);
} else {
	adapterAddress = existingAdapter;
	console.log(`  Already deployed — reusing Adapter: ${chalk.green(adapterAddress)}`);
}

console.log(chalk.green("  ✓ Adapter ready\n"));

// ═══════════════════════════════════════════════════════════════
// PHASE 4: Set adapter as compliance-exempt
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 4: Set adapter as compliance-exempt"));

const complianceContract = await ethers.getContractAt("TokenCompliance", homeContracts.TokenCompliance, deployer);
const isExempt = await complianceContract.isExempt(adapterAddress);

if (!isExempt) {
	console.log(`  Setting exempt...`);
	const tx = await complianceContract.setExempt(adapterAddress, true);
	await tx.wait();
	console.log(chalk.green("  ✓ Adapter marked exempt in TokenCompliance"));
} else {
	console.log(chalk.green("  ✓ Already exempt"));
}
console.log();

// ═══════════════════════════════════════════════════════════════
// PHASE 5: Save Hedera deployment JSON
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 5: Save Hedera deployment"));

if (!homeDeployment.bridgeContracts) homeDeployment.bridgeContracts = {};
if (!homeDeployment.bridgeContracts[propertyTokenAddress]) {
	homeDeployment.bridgeContracts[propertyTokenAddress] = {};
}
homeDeployment.bridgeContracts[propertyTokenAddress].adapter = adapterAddress;
homeDeployment.layerZero = { endpoint: homeMeta.lzEndpoint!, eid: homeMeta.lzEid! };
homeDeployment.network = {
	name: homeMeta.name,
	chainId: homeMeta.chainId,
	rpc: homeMeta.rpcUrl,
	currency: homeMeta.currency,
	blockExplorerUrl: homeMeta.blockExplorerUrl,
};
saveDeployment("testnet", homeDeployment);
console.log();

// ═══════════════════════════════════════════════════════════════
// PHASE 6: Connect to Base Sepolia via raw ethers
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 6: Connect to Base Sepolia"));

const destProvider = new ethersLib.JsonRpcProvider(destMeta.rpcUrl);

const privateKey = process.env.EVM_PRIVATE_KEY;
if (!privateKey) {
	console.error(chalk.red("EVM_PRIVATE_KEY not set in environment"));
	process.exit(1);
}
const destSigner = new ethersLib.Wallet(privateKey, destProvider);

const destBalance = await destProvider.getBalance(destSigner.address);
console.log(`  Deployer: ${chalk.yellow(destSigner.address)}`);
console.log(`  Balance:  ${chalk.yellow(ethersLib.formatEther(destBalance))} ETH`);

if (destBalance === 0n) {
	console.error(chalk.red("  ⚠ No ETH on Base Sepolia! Fund from a faucet first."));
	process.exit(1);
}

const destDeployment = loadDeployment("base-sepolia");
const destContracts = destDeployment.contracts;

console.log(chalk.green("  ✓ Connected to Base Sepolia\n"));

// Nonce tracker: Base Sepolia RPCs can return stale nonces, so we track manually
let destNonce = await destProvider.getTransactionCount(destSigner.address, "latest");
console.log(`  Starting nonce: ${destNonce}\n`);

// Helper: save Base Sepolia deployment state (called after each successful deploy)
function saveDestState() {
	destDeployment.contracts = destContracts;
	destDeployment.network = {
		name: destMeta.name,
		chainId: destMeta.chainId,
		rpc: destMeta.rpcUrl,
		currency: destMeta.currency,
		blockExplorerUrl: destMeta.blockExplorerUrl,
	};
	destDeployment.layerZero = { endpoint: destMeta.lzEndpoint!, eid: destMeta.lzEid! };
	saveDeployment("base-sepolia", destDeployment);
}

// ═══════════════════════════════════════════════════════════════
// PHASE 7: Deploy IdentityRegistry on Base Sepolia
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 7: Deploy IdentityRegistry (Base Sepolia)"));

const irArtifact = loadArtifact("IdentityRegistry", "compliance/IdentityRegistry.sol");
let destIRAddress: string;

if (!destContracts.IdentityRegistry) {
	const IRFactory = new ethersLib.ContractFactory(irArtifact.abi, irArtifact.bytecode, destSigner);
	console.log("  Deploying IdentityRegistry...");
	const ir = await IRFactory.deploy(destSigner.address, { nonce: destNonce++ });
	await ir.waitForDeployment();
	destIRAddress = await ir.getAddress();
	console.log(`  IdentityRegistry: ${chalk.green(destIRAddress)}`);
	destContracts.IdentityRegistry = destIRAddress;
	saveDestState(); // persist immediately so re-runs don't re-deploy

	// Fresh deploy — register deployer immediately (no isVerified check needed)
	console.log("  Registering deployer as verified identity...");
	const irContract = new ethersLib.Contract(destIRAddress, irArtifact.abi, destSigner);
	const adminHash = ethersLib.keccak256(ethersLib.toUtf8Bytes("ADMIN"));
	const regTx = await irContract.registerIdentity(destSigner.address, 840, adminHash, { nonce: destNonce++ });
	await regTx.wait();
	console.log(chalk.green("  ✓ Deployer registered"));
} else {
	destIRAddress = destContracts.IdentityRegistry;
	console.log(`  Already deployed: ${chalk.green(destIRAddress)}`);

	// Re-run — check if deployer still needs to be registered
	const irContract = new ethersLib.Contract(destIRAddress, irArtifact.abi, destSigner);
	const isVerified = await irContract.isVerified(destSigner.address);
	if (!isVerified) {
		console.log("  Registering deployer as verified identity...");
		const adminHash = ethersLib.keccak256(ethersLib.toUtf8Bytes("ADMIN"));
		const regTx = await irContract.registerIdentity(destSigner.address, 840, adminHash, { nonce: destNonce++ });
		await regTx.wait();
		console.log(chalk.green("  ✓ Deployer registered"));
	} else {
		console.log(chalk.green("  ✓ Deployer already verified"));
	}
}
console.log();

// ═══════════════════════════════════════════════════════════════
// PHASE 8: Deploy TokenCompliance on Base Sepolia
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 8: Deploy TokenCompliance (Base Sepolia)"));

let destTCAddress: string;

if (!destContracts.TokenCompliance) {
	const tcArtifact = loadArtifact("TokenCompliance", "compliance/TokenCompliance.sol");
	const TCFactory = new ethersLib.ContractFactory(tcArtifact.abi, tcArtifact.bytecode, destSigner);
	console.log("  Deploying TokenCompliance...");
	const tc = await TCFactory.deploy(destIRAddress, destSigner.address, { nonce: destNonce++ });
	await tc.waitForDeployment();
	destTCAddress = await tc.getAddress();
	console.log(`  TokenCompliance: ${chalk.green(destTCAddress)}`);
	destContracts.TokenCompliance = destTCAddress;
	saveDestState();
} else {
	destTCAddress = destContracts.TokenCompliance;
	console.log(`  Already deployed: ${chalk.green(destTCAddress)}`);
}
console.log();

// ═══════════════════════════════════════════════════════════════
// PHASE 9: Deploy PropertyTokenOFT on Base Sepolia
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 9: Deploy PropertyTokenOFT (Base Sepolia)"));

let oftAddress: string;

if (!destContracts.PropertyTokenOFT) {
	const oftArtifact = loadArtifact("PropertyTokenOFT", "tokenization/PropertyTokenOFT.sol");
	const OFTFactory = new ethersLib.ContractFactory(oftArtifact.abi, oftArtifact.bytecode, destSigner);
	console.log(`  Deploying PropertyTokenOFT ("${PROPERTY_NAME}")...`);
	const oft = await OFTFactory.deploy(
		PROPERTY_NAME,
		PROPERTY_SYMBOL,
		destMeta.lzEndpoint,
		destSigner.address,
		0, // Supply = 0 (tokens arrive via bridge only)
		destTCAddress,
		destSigner.address,
		{ nonce: destNonce++ }
	);
	await oft.waitForDeployment();
	oftAddress = await oft.getAddress();
	console.log(`  OFT: ${chalk.green(oftAddress)}`);
	destContracts.PropertyTokenOFT = oftAddress;
	saveDestState();
} else {
	oftAddress = destContracts.PropertyTokenOFT;
	console.log(`  Already deployed: ${chalk.green(oftAddress)}`);
}
console.log();

// ═══════════════════════════════════════════════════════════════
// PHASE 10: Wire peers (adapter ↔ OFT)
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 10: Wire peers"));

const adapterBytes32 = ethersLib.zeroPadValue(adapterAddress, 32);
const oftBytes32 = ethersLib.zeroPadValue(oftAddress, 32);

// Check & set adapter.setPeer(destEid, OFT)
const adapter = await ethers.getContractAt("PropertyTokenAdapter", adapterAddress, deployer);
const currentAdapterPeer = await adapter.peers(destMeta.lzEid);

if (currentAdapterPeer === ethersLib.ZeroHash) {
	console.log(`  Setting adapter peer → OFT (EID ${destMeta.lzEid})...`);
	const tx = await adapter.setPeer(destMeta.lzEid, oftBytes32);
	await tx.wait();
	console.log(chalk.green("  ✓ Adapter peer set"));
} else {
	console.log(chalk.green(`  ✓ Adapter peer already set`));
}

// Check & set OFT.setPeer(homeEid, adapter)
const oftArtifact2 = loadArtifact("PropertyTokenOFT", "tokenization/PropertyTokenOFT.sol");
const oftContract = new ethersLib.Contract(oftAddress, oftArtifact2.abi, destSigner);
const currentOFTPeer = await oftContract.peers(homeMeta.lzEid);

if (currentOFTPeer === ethersLib.ZeroHash) {
	console.log(`  Setting OFT peer → Adapter (EID ${homeMeta.lzEid})...`);
	const tx = await oftContract.setPeer(homeMeta.lzEid, adapterBytes32, { nonce: destNonce++ });
	await tx.wait();
	console.log(chalk.green("  ✓ OFT peer set"));
} else {
	console.log(chalk.green(`  ✓ OFT peer already set`));
}
console.log();

// ═══════════════════════════════════════════════════════════════
// PHASE 11: Set enforced options on both sides
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 11: Set enforced options"));

const gasLimit = BigInt(MIN_DST_GAS);
const optionsHex = encodeEnforcedOptions(gasLimit);

// Adapter enforced options (for messages going to dest)
try {
	console.log(`  Setting enforced options on Adapter (→ EID ${destMeta.lzEid}, ${MIN_DST_GAS} gas)...`);
	const enforcedOpts = [{ eid: destMeta.lzEid, msgType: 1, options: optionsHex }];
	const tx = await adapter.setEnforcedOptions(enforcedOpts);
	await tx.wait();
	console.log(chalk.green("  ✓ Adapter enforced options set"));
} catch (err: any) {
	if (err.message.includes("already set") || err.message.includes("revert")) {
		console.log(chalk.yellow(`  ⚠ Adapter enforced options may already be set: ${err.message.slice(0, 100)}`));
	} else {
		throw err;
	}
}

// OFT enforced options (for messages going to home)
try {
	console.log(`  Setting enforced options on OFT (→ EID ${homeMeta.lzEid}, ${MIN_DST_GAS} gas)...`);
	const enforcedOpts = [{ eid: homeMeta.lzEid, msgType: 1, options: optionsHex }];
	const tx = await oftContract.setEnforcedOptions(enforcedOpts, { nonce: destNonce++ });
	await tx.wait();
	console.log(chalk.green("  ✓ OFT enforced options set"));
} catch (err: any) {
	if (err.message.includes("already set") || err.message.includes("revert")) {
		console.log(chalk.yellow(`  ⚠ OFT enforced options may already be set: ${err.message.slice(0, 100)}`));
	} else {
		throw err;
	}
}
console.log();

// ═══════════════════════════════════════════════════════════════
// PHASE 12: Save Base Sepolia deployment JSON
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.cyan("Phase 12: Save Base Sepolia deployment"));

if (!destDeployment.bridgeContracts) destDeployment.bridgeContracts = {};
if (!destDeployment.bridgeContracts[propertyTokenAddress]) {
	destDeployment.bridgeContracts[propertyTokenAddress] = {};
}
destDeployment.bridgeContracts[propertyTokenAddress].oft = oftAddress;
destDeployment.contracts = destContracts;
destDeployment.layerZero = { endpoint: destMeta.lzEndpoint!, eid: destMeta.lzEid! };
destDeployment.network = {
	name: destMeta.name,
	chainId: destMeta.chainId,
	rpc: destMeta.rpcUrl,
	currency: destMeta.currency,
	blockExplorerUrl: destMeta.blockExplorerUrl,
};
saveDeployment("base-sepolia", destDeployment);

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════

console.log(chalk.bold.blue("\n═══ Deployment Summary ═══\n"));
console.log(chalk.bold("Home Chain (Hedera Testnet):"));
console.log(`  PropertyToken:       ${propertyTokenAddress}`);
console.log(`  PropertyTokenAdapter:${adapterAddress}`);
console.log(`  TokenCompliance:     ${homeContracts.TokenCompliance}`);
console.log(`  LZ Endpoint:         ${homeMeta.lzEndpoint} (EID ${homeMeta.lzEid})`);
console.log();
console.log(chalk.bold("Destination Chain (Base Sepolia):"));
console.log(`  IdentityRegistry:    ${destContracts.IdentityRegistry}`);
console.log(`  TokenCompliance:     ${destContracts.TokenCompliance}`);
console.log(`  PropertyTokenOFT:    ${oftAddress}`);
console.log(`  LZ Endpoint:         ${destMeta.lzEndpoint} (EID ${destMeta.lzEid})`);
console.log();
console.log(chalk.bold("Bridge Wiring:"));
console.log(`  Adapter peer → OFT (EID ${destMeta.lzEid})`);
console.log(`  OFT peer → Adapter (EID ${homeMeta.lzEid})`);
console.log(`  Enforced gas: ${MIN_DST_GAS} for lzReceive`);
console.log();

console.log(chalk.bold.cyan("Next Steps:"));
console.log(`  1. Validate: pnpm test:testnet`);
console.log(`  2. Validate: pnpm test:base-sepolia`);
console.log(`  3. Test cross-chain transfer:`);
console.log(`     - Approve adapter to spend PropertyTokens`);
console.log(`     - adapter.quoteSend() to get fee`);
console.log(`     - adapter.send() to bridge tokens`);
console.log(`     - Track on LayerZero Scan: https://testnet.layerzeroscan.com`);
console.log();

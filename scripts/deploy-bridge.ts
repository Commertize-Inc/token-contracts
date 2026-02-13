import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";
import prompts from "prompts";
import chalk from "chalk";
import { getNetworkMeta } from "../network-meta.js";

/**
 * LayerZero Bridge Deployment Script
 *
 * Deploys PropertyTokenAdapter (home chain) or PropertyTokenOFT (destination chain)
 * and configures peers, enforced options, and compliance exemptions.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-bridge.ts --network testnet       # Home chain (Hedera)
 *   npx hardhat run scripts/deploy-bridge.ts --network base-sepolia  # Destination chain
 */

// Known LayerZero endpoint IDs per network
const LZ_CONFIG: Record<string, { eid: number; endpoint: string }> = {
	testnet: { eid: 40285, endpoint: "0xbD672D1562Dd32C23B563C989d8140122483631d" },
	"base-sepolia": { eid: 40245, endpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f" },
};

// Minimum gas for lzReceive on destination (200k should be sufficient for mint + compliance check)
const MIN_DST_GAS = 200_000;

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
	layerZero?: {
		endpoint: string;
		eid: number;
	};
	bridgeContracts?: Record<string, Record<string, string>>;
}

interface DeployContext {
	deployer: any;
	deploymentConfig: DeploymentConfig;
	deployedAddresses: Record<string, string>;
}

const { ethers, networkName } = await hre.network.connect();

console.log(chalk.bold.blue("\n🌉 Commertize Bridge Deployment CLI\n"));

const [deployer] = await ethers.getSigners();
const chainId = Number(
	(await deployer.provider.getNetwork()).chainId
);
const meta = getNetworkMeta(networkName);
const rpcUrl = (hre.network as any).config?.url || "http://localhost:8545";

console.log(`Deployer: ${chalk.yellow(deployer.address)}`);
const balance = await deployer.provider.getBalance(deployer.address);
console.log(`Balance: ${chalk.yellow(ethers.formatEther(balance))} ${meta.currency || "ETH"}`);
console.log(`Network: ${chalk.magenta(networkName)} (ChainID: ${chainId})\n`);

const lzConfig = meta.LZ_ENDPOINT
	? { eid: meta.LZ_EID!, endpoint: meta.LZ_ENDPOINT }
	: LZ_CONFIG[networkName];

if (!lzConfig) {
	console.error(chalk.red(`No LayerZero config found for network: ${networkName}`));
	process.exit(1);
}

console.log(`LZ Endpoint: ${chalk.cyan(lzConfig.endpoint)}`);
console.log(`LZ EID: ${chalk.cyan(String(lzConfig.eid))}\n`);

// Load existing deployment config
const deploymentFile = `deployment.${networkName.replace(/-/g, "_")}.json`;
const deploymentPath = path.join(import.meta.dirname, `../${deploymentFile}`);
let deploymentConfig: DeploymentConfig = { contracts: {} };

if (fs.existsSync(deploymentPath)) {
	try {
		const raw = fs.readFileSync(deploymentPath, "utf-8");
		deploymentConfig = JSON.parse(raw);
		console.log(chalk.green(`Loaded existing config: ${deploymentFile}`));
	} catch (e) {
		console.warn(chalk.yellow(`Could not parse ${deploymentFile}, starting fresh.`));
	}
}

const context: DeployContext = {
	deployer,
	deploymentConfig,
	deployedAddresses: { ...deploymentConfig.contracts },
};

// Determine if this is home chain or destination
const isHomeChain = networkName === "testnet" || networkName === "mainnet";

if (isHomeChain) {
	await deployHomeChain(context, lzConfig);
} else {
	await deployDestinationChain(context, lzConfig);
}

// Save deployment
context.deploymentConfig.contracts = context.deployedAddresses;
context.deploymentConfig.timestamp = new Date().toISOString();
context.deploymentConfig.network = {
	name: networkName,
	chainId,
	rpc: rpcUrl,
	currency: meta.currency,
	blockExplorerUrl: meta.blockExplorerUrl,
};
context.deploymentConfig.layerZero = {
	endpoint: lzConfig.endpoint,
	eid: lzConfig.eid,
};

fs.writeFileSync(deploymentPath, JSON.stringify(context.deploymentConfig, null, 2));
console.log(chalk.bold.green(`\n✅ Saved to ${deploymentFile}`));

async function deployHomeChain(ctx: DeployContext, lz: { eid: number; endpoint: string }) {
	console.log(chalk.bold("\n📍 Home Chain Deployment (Adapter)\n"));

	const { deployer, deployedAddresses } = ctx;

	// Check prerequisites
	const compliance = deployedAddresses.TokenCompliance;
	if (!compliance) {
		console.error(chalk.red("❌ TokenCompliance not found. Deploy core contracts first."));
		process.exit(1);
	}

	// Ask which PropertyToken to wrap
	const { propertyToken } = await prompts({
		type: "text",
		name: "propertyToken",
		message: "PropertyToken address to wrap with adapter:",
		validate: (v: string) => ethers.isAddress(v) || "Must be a valid address",
	});

	if (!propertyToken) {
		console.log(chalk.yellow("Cancelled."));
		return;
	}

	// Deploy PropertyTokenAdapter
	console.log(chalk.cyan("\nDeploying PropertyTokenAdapter..."));
	const AdapterFactory = await ethers.getContractFactory("PropertyTokenAdapter");
	const adapter = await AdapterFactory.deploy(
		propertyToken,
		lz.endpoint,
		deployer.address,
		compliance
	);
	await adapter.waitForDeployment();
	const adapterAddress = await adapter.getAddress();
	console.log(`  └─ Adapter: ${chalk.green(adapterAddress)}`);
	deployedAddresses.PropertyTokenAdapter = adapterAddress;

	// Store per-property bridge mapping for the dashboard
	if (!ctx.deploymentConfig.bridgeContracts) {
		ctx.deploymentConfig.bridgeContracts = {};
	}
	if (!ctx.deploymentConfig.bridgeContracts[propertyToken]) {
		ctx.deploymentConfig.bridgeContracts[propertyToken] = {};
	}
	ctx.deploymentConfig.bridgeContracts[propertyToken].adapter = adapterAddress;

	// Set adapter as compliance-exempt (CRITICAL: adapter must transfer tokens freely)
	console.log(chalk.cyan("\nSetting adapter as compliance-exempt..."));
	try {
		const complianceContract = await ethers.getContractAt("TokenCompliance", compliance, deployer);
		const tx = await complianceContract.setExempt(adapterAddress, true);
		await tx.wait();
		console.log(`  └─ ${chalk.green("Adapter marked exempt in TokenCompliance")}`);
	} catch (err: any) {
		console.error(chalk.red(`  Failed to exempt adapter: ${err.message}`));
	}

	// Configure peer (requires destination OFT address)
	const { peerAddress } = await prompts({
		type: "text",
		name: "peerAddress",
		message: "Destination OFT address (leave blank to skip peer setup):",
	});

	if (peerAddress && ethers.isAddress(peerAddress)) {
		const { destEid } = await prompts({
			type: "number",
			name: "destEid",
			message: "Destination chain LayerZero EID:",
			initial: 40245, // Base Sepolia default
		});

		await configurePeer(adapter, destEid, peerAddress, "Adapter");
		await configureEnforcedOptions(adapter, destEid, "Adapter");
	} else {
		console.log(chalk.yellow("\n⚠️  Skipping peer setup. Run this script again to configure peers later."));
	}
}

async function deployDestinationChain(ctx: DeployContext, lz: { eid: number; endpoint: string }) {
	console.log(chalk.bold("\n🌐 Destination Chain Deployment (OFT)\n"));

	const { deployer, deployedAddresses } = ctx;

	// Deploy IdentityRegistry on destination (mirror compliance)
	if (!deployedAddresses.IdentityRegistry) {
		console.log(chalk.cyan("Deploying IdentityRegistry (destination)..."));
		const IRFactory = await ethers.getContractFactory("IdentityRegistry");
		const ir = await IRFactory.deploy(deployer.address);
		await ir.waitForDeployment();
		const irAddress = await ir.getAddress();
		console.log(`  └─ IdentityRegistry: ${chalk.green(irAddress)}`);
		deployedAddresses.IdentityRegistry = irAddress;

		// Register deployer as verified
		try {
			const adminHash = ethers.keccak256(ethers.toUtf8Bytes("ADMIN"));
			const tx = await ir.registerIdentity(deployer.address, 840, adminHash);
			await tx.wait();
			console.log(`  └─ ${chalk.green("Deployer registered as verified identity")}`);
		} catch (err: any) {
			console.warn(chalk.yellow(`  ⚠️ Failed to register deployer: ${err.message}`));
		}
	}

	// Deploy TokenCompliance on destination
	if (!deployedAddresses.TokenCompliance) {
		console.log(chalk.cyan("Deploying TokenCompliance (destination)..."));
		const TCFactory = await ethers.getContractFactory("TokenCompliance");
		const tc = await TCFactory.deploy(deployedAddresses.IdentityRegistry, deployer.address);
		await tc.waitForDeployment();
		const tcAddress = await tc.getAddress();
		console.log(`  └─ TokenCompliance: ${chalk.green(tcAddress)}`);
		deployedAddresses.TokenCompliance = tcAddress;
	}

	// Ask for token details
	const tokenDetails = await prompts([
		{
			type: "text",
			name: "name",
			message: "Token name:",
			initial: "Commertize Property",
		},
		{
			type: "text",
			name: "symbol",
			message: "Token symbol:",
			initial: "CPT",
		},
	]);

	if (!tokenDetails.name) {
		console.log(chalk.yellow("Cancelled."));
		return;
	}

	// Deploy PropertyTokenOFT (supply = 0, minted only via bridge)
	console.log(chalk.cyan("\nDeploying PropertyTokenOFT..."));
	const OFTFactory = await ethers.getContractFactory("PropertyTokenOFT");
	const oft = await OFTFactory.deploy(
		tokenDetails.name,
		tokenDetails.symbol,
		lz.endpoint,
		deployer.address,
		0, // Supply = 0 (tokens arrive via bridge only)
		deployedAddresses.TokenCompliance,
		deployer.address
	);
	await oft.waitForDeployment();
	const oftAddress = await oft.getAddress();
	console.log(`  └─ OFT: ${chalk.green(oftAddress)}`);
	deployedAddresses.PropertyTokenOFT = oftAddress;

	// Ask which home-chain PropertyToken this OFT maps to (for per-property tracking)
	const { homePropertyToken } = await prompts({
		type: "text",
		name: "homePropertyToken",
		message: "Home-chain PropertyToken address this OFT represents:",
		validate: (v: string) => ethers.isAddress(v) || "Must be a valid address",
	});

	if (homePropertyToken) {
		if (!ctx.deploymentConfig.bridgeContracts) {
			ctx.deploymentConfig.bridgeContracts = {};
		}
		if (!ctx.deploymentConfig.bridgeContracts[homePropertyToken]) {
			ctx.deploymentConfig.bridgeContracts[homePropertyToken] = {};
		}
		ctx.deploymentConfig.bridgeContracts[homePropertyToken].oft = oftAddress;
		console.log(`  └─ ${chalk.green(`Mapped OFT to PropertyToken ${homePropertyToken}`)}`);
	}

	// Configure peer (requires home chain adapter address)
	const { peerAddress } = await prompts({
		type: "text",
		name: "peerAddress",
		message: "Home chain Adapter address (leave blank to skip peer setup):",
	});

	if (peerAddress && ethers.isAddress(peerAddress)) {
		const { srcEid } = await prompts({
			type: "number",
			name: "srcEid",
			message: "Home chain LayerZero EID:",
			initial: 40285, // Hedera testnet default
		});

		await configurePeer(oft, srcEid, peerAddress, "OFT");
		await configureEnforcedOptions(oft, srcEid, "OFT");
	} else {
		console.log(chalk.yellow("\n⚠️  Skipping peer setup. Run this script again to configure peers later."));
	}

	console.log(chalk.bold.cyan("\n📋 Next Steps:"));
	console.log(`  1. On the home chain, run: adapter.setPeer(${lz.eid}, ${oftAddress})`);
	console.log(`  2. Verify the OFT at ${oftAddress} on the block explorer`);
}

async function configurePeer(contract: any, remoteEid: number, remoteAddress: string, label: string) {
	console.log(chalk.cyan(`\nSetting peer on ${label}...`));
	try {
		// Convert address to bytes32 (left-padded with zeros)
		const peerBytes32 = ethers.zeroPadValue(remoteAddress, 32);
		const tx = await contract.setPeer(remoteEid, peerBytes32);
		await tx.wait();
		console.log(`  └─ ${chalk.green(`Peer set: EID ${remoteEid} → ${remoteAddress}`)}`);
	} catch (err: any) {
		console.error(chalk.red(`  Failed to set peer: ${err.message}`));
	}
}

async function configureEnforcedOptions(contract: any, remoteEid: number, label: string) {
	console.log(chalk.cyan(`Setting enforced options on ${label}...`));
	try {
		// Encode enforced options for SEND message type (msgType = 1)
		const gasLimit = BigInt(MIN_DST_GAS);
		const optionsHex = ethers.solidityPacked(
			["uint16", "uint8", "uint16", "uint8", "uint128"],
			[3, 1, 17, 1, gasLimit]
		);

		// EnforcedOptionParam: { eid, msgType, options }
		const enforcedOptions = [{ eid: remoteEid, msgType: 1, options: optionsHex }];
		const tx = await contract.setEnforcedOptions(enforcedOptions);
		await tx.wait();
		console.log(`  └─ ${chalk.green(`Enforced options set: ${MIN_DST_GAS} gas for lzReceive`)}`);
	} catch (err: any) {
		console.error(chalk.red(`  Failed to set enforced options: ${err.message}`));
	}
}

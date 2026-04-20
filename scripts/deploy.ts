import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";
import prompts from "prompts";
import chalk from "chalk";
import { getNetworkMeta } from "../hardhat.config";

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
}

interface DeployContext {
	deployer: any;
	deploymentConfig: DeploymentConfig;
	deployedAddresses: Record<string, string>;
}

const { ethers, networkName } = await hre.network.connect();

console.log(chalk.bold.blue("\nCommertize Interactive Deployment CLI\n"));

const [deployer] = await ethers.getSigners();
console.log(`Deploying from account: ${chalk.yellow(deployer.address)}`);

const balance = await deployer.provider.getBalance(deployer.address);
console.log(`Balance: ${chalk.yellow(ethers.formatEther(balance))} ETH\n`);

const chainId = Number((await deployer.provider.getNetwork()).chainId);

const meta = getNetworkMeta(networkName);

console.log(`Network: ${chalk.magenta(networkName)} (ChainID: ${chainId})`);

// Convert network name to filename (replace hyphens with underscores)
const deploymentFile = `deployment.${networkName.replace(/-/g, "_")}.json`;
const mainDeploymentPath = path.join(
	import.meta.dirname,
	`../${deploymentFile}`
);

let deploymentConfig: DeploymentConfig = { contracts: {} };

// Try to load existing config
if (fs.existsSync(mainDeploymentPath)) {
	try {
		const raw = fs.readFileSync(mainDeploymentPath, "utf-8");
		deploymentConfig = JSON.parse(raw);
		console.log(
			chalk.green(`Loaded existing config from ${mainDeploymentPath}`)
		);
	} catch (e: any) {
		console.warn(
			chalk.red(`Could not parse ${mainDeploymentPath}: ${e.message}`)
		);
		console.warn(chalk.red(`Starting fresh.`));
	}
}

const context: DeployContext = {
	deployer,
	deploymentConfig,
	deployedAddresses: { ...deploymentConfig.contracts },
};

// USDC is not deployed here; pull the address from network metadata
const usdcAddress = meta.usdcAddress;
if (usdcAddress) {
	context.deployedAddresses.USDC = usdcAddress;
	context.deploymentConfig.contracts = context.deploymentConfig.contracts || {};
	context.deploymentConfig.contracts.USDC = usdcAddress;
	console.log(`USDC Address (from config): ${chalk.green(usdcAddress)}`);
} else {
	console.error(
		chalk.red(`Warning: No USDC_ADDRESS configured for network: ${networkName}`)
	);
}

const contracts = [
	{
		name: "IdentityRegistry",
		title: "1. Identity Registry (CCID-anchored)",
		value: "IdentityRegistry",
	},
	{
		name: "CredentialRegistry",
		title: "2. Credential Registry (KYC/AML/Accreditation with expiry)",
		value: "CredentialRegistry",
	},
	{
		name: "CredentialCheckPolicy",
		title: "3. Credential Check Policy (Requires IdentityRegistry + CredentialRegistry)",
		value: "CredentialCheckPolicy",
	},
	{
		name: "PropertyFactory",
		title: "4. Property Factory",
		value: "PropertyFactory",
	},
	{
		name: "DividendVault",
		title: "5. Dividend Vault (Requires USDC)",
		value: "DividendVault",
	},
];

let selectedContracts = new Set<string>();

// Check for --all or CI
const args = process.argv.slice(2);
if (args.includes("--all") || process.env.CI) {
	console.log(chalk.cyan("Running in CI/All mode. Selected ALL contracts."));
	contracts.forEach((c) => selectedContracts.add(c.value));
} else {
	const response = await prompts({
		type: "multiselect",
		name: "selected",
		message: "Select contracts to deploy (Space to select, Enter to deploy)",
		choices: contracts,
		hint: "- Space to select. Return to submit",
		instructions: false,
		min: 1,
	});

	if (!response.selected || response.selected.length === 0) {
		console.log(chalk.yellow("No contracts selected. Exiting."));
		process.exit(0);
	}
	selectedContracts = new Set(response.selected);
}

console.log(chalk.bold("\n⚡ Starting Deployment...\n"));

// Credential type constants
const KYC_TYPE = ethers.keccak256(ethers.toUtf8Bytes("KYC"));
const AML_TYPE = ethers.keccak256(ethers.toUtf8Bytes("AML"));

// MARK: 1. Identity Registry

if (selectedContracts.has("IdentityRegistry")) {
	await deployContract("IdentityRegistry", [deployer.address], context);

	// Register deployer identity (CCID-anchored)
	try {
		console.log("  Registering deployer identity...");
		const identityRegistry = await ethers.getContractAt(
			"IdentityRegistry",
			context.deployedAddresses.IdentityRegistry,
			deployer
		);
		const adminCcid = ethers.keccak256(
			ethers.solidityPacked(["string", "string"], ["commertize", "ADMIN"])
		);
		const tx = await identityRegistry.registerIdentity(
			adminCcid,
			deployer.address
		);
		await tx.wait();
		console.log(
			`  [OK] Deployer ${chalk.green(deployer.address)} registered (CCID: ADMIN)`
		);
	} catch (err: any) {
		console.warn(
			chalk.yellow(`  Warning: Failed to register deployer: ${err.message}`)
		);
	}
}

// MARK: 2. Credential Registry

if (selectedContracts.has("CredentialRegistry")) {
	const idRegistry = context.deployedAddresses.IdentityRegistry;
	if (!idRegistry) {
		console.error(
			chalk.red("Error: CredentialRegistry requires IdentityRegistry.")
		);
	} else {
		await deployContract(
			"CredentialRegistry",
			[idRegistry, deployer.address],
			context
		);

		// Register deployer credentials (KYC + AML, no expiry)
		try {
			console.log("  Registering deployer credentials...");
			const cr = await ethers.getContractAt(
				"CredentialRegistry",
				context.deployedAddresses.CredentialRegistry,
				deployer
			);
			const adminCcid = ethers.keccak256(
				ethers.solidityPacked(["string", "string"], ["commertize", "ADMIN"])
			);
			const maxExpiry = (1n << 40n) - 1n; // type(uint40).max
			const kycTx = await cr.registerCredential(
				adminCcid,
				KYC_TYPE,
				maxExpiry,
				"0x"
			);
			await kycTx.wait();
			const amlTx = await cr.registerCredential(
				adminCcid,
				AML_TYPE,
				maxExpiry,
				"0x"
			);
			await amlTx.wait();
			console.log(
				`  [OK] Deployer credentials registered (KYC + AML, no expiry)`
			);
		} catch (err: any) {
			console.warn(
				chalk.yellow(`  Warning: Failed to register deployer credentials: ${err.message}`)
			);
		}
	}
}

// MARK: 3. Credential Check Policy

if (selectedContracts.has("CredentialCheckPolicy")) {
	const idRegistry = context.deployedAddresses.IdentityRegistry;
	const credRegistry = context.deployedAddresses.CredentialRegistry;

	if (!idRegistry || !credRegistry) {
		console.error(
			chalk.red(
				"Error: CredentialCheckPolicy requires IdentityRegistry and CredentialRegistry."
			)
		);
	} else {
		await deployContract(
			"CredentialCheckPolicy",
			[idRegistry, credRegistry, [KYC_TYPE, AML_TYPE]],
			context
		);
	}
}

// MARK: 4. Property Factory

if (selectedContracts.has("PropertyFactory")) {
	await deployContract("PropertyFactory", [deployer.address], context);
}

// MARK: 5. Dividend Vault

if (selectedContracts.has("DividendVault")) {
	const usdc = context.deployedAddresses.USDC;
	if (!usdc) {
		console.error(chalk.red("Error: DividendVault requires USDC."));
	} else {
		await deployContract(
			"DividendVault",
			[usdc, deployer.address, deployer.address],
			context
		);
	}
}

// MARK: Save deployment config

context.deploymentConfig.timestamp = new Date().toISOString();
context.deploymentConfig.network = {
	name: networkName,
	chainId: meta.chainId,
	rpc: meta.rpcUrl,
	currency: meta.currency,
	blockExplorerUrl: meta.blockExplorerUrl,
};

fs.writeFileSync(
	mainDeploymentPath,
	JSON.stringify(context.deploymentConfig, null, 2)
);

console.log(chalk.bold.green("\nDeployment Config Updated!"));
console.log(`Updated:  ${chalk.underline(deploymentFile)}`);

async function deployContract(
	infoName: string,
	args: any[],
	ctx: DeployContext,
	aliasKey?: string
) {
	const key = aliasKey || infoName;
	console.log(`Deploying ${chalk.cyan(key)}...`);

	try {
		const Factory = await ethers.getContractFactory(infoName);
		const contract = await Factory.deploy(...args);
		await contract.waitForDeployment();

		const address = await contract.getAddress();
		console.log(`  └─ Address: ${chalk.green(address)}`);

		// Update context
		ctx.deployedAddresses[key] = address;
		ctx.deploymentConfig.contracts[key] = address;
	} catch (err: any) {
		console.error(chalk.red(`  Failed to deploy ${key}: ${err.message}`));
		process.exitCode = 1;
	}
}

const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");
const path = require("path");
const prompts = require("prompts");
const chalk = require("chalk");
const { loadEnv } = require("@commertize/utils/env-server");

// Load environment variables
loadEnv();

async function main() {
	console.log(
		chalk.bold.blue("\n🚀 Commertize Interactive Deployment CLI (MVP)\n")
	);

	const [deployer] = await ethers.getSigners();
	console.log(`Deploying from account: ${chalk.yellow(deployer.address)}`);

	const balance = await deployer.provider.getBalance(deployer.address);
	console.log(`Balance: ${chalk.yellow(ethers.formatEther(balance))} ETH\n`);

	// Get Network Info
	const networkName = hre.network.name;
	const chainId = Number(
		hre.network.config.chainId || (await deployer.provider.getNetwork()).chainId
	);
	// Try to get RPC. Hardhat network config might have 'url', or we use default
	const rpcUrl = hre.network.config.url || "http://localhost:8545";

	// Currency symbol (default ETH/HBAR)
	const currency = hre.network.config.currency;

	// Determine block explorer URL based on network
	const blockExplorerUrl = hre.network.config.blockExplorerUrl;

	console.log(`Network: ${chalk.magenta(networkName)} (ChainID: ${chainId})`);

	// Convert network name to filename (replace hyphens with underscores)
	const deploymentFile = `deployment.${networkName.replace(/-/g, "_")}.json`;
	const mainDeploymentPath = path.join(__dirname, `../${deploymentFile}`);

	let deploymentConfig = { contracts: {} };

	// Try to load existing config
	if (fs.existsSync(mainDeploymentPath)) {
		try {
			deploymentConfig = require(mainDeploymentPath);
			console.log(
				chalk.green(`Loaded existing config from ${mainDeploymentPath}`)
			);
		} catch (e) {
			console.warn(
				chalk.red(`Could not parse ${mainDeploymentPath}: ${e.message}`)
			);
			console.warn(chalk.red(`Starting fresh.`));
		}
	}

	const contracts = [
		{
			name: "IdentityRegistry",
			title: "1. Identity Registry (Compliance)",
			value: "IdentityRegistry",
		},
		{ name: "CREUSD", title: "2. CREUSD (Stablecoin)", value: "CREUSD" },
		{
			name: "CommertizeToken",
			title: "3. Commertize Token (Platform/Governance)",
			value: "CommertizeToken",
		},
		{
			name: "TokenCompliance",
			title: "4. Token Compliance (Requires IdentityRegistry)",
			value: "TokenCompliance",
		},
		{
			name: "PropertyFactory",
			title: "5. Property Factory (Requires Compliance)",
			value: "PropertyFactory",
		},
		{
			name: "StakingPool",
			title: "6. Staking Pool (Requires CTZ & CREUSD)",
			value: "StakingPool",
		},
		{
			name: "DividendVault",
			title: "7. Dividend Vault (Requires CREUSD)",
			value: "DividendVault",
		},
	];

	let selectedContracts = new Set();

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
			return;
		}
		selectedContracts = new Set(response.selected);
	}

	const context = {
		deployer,
		deploymentConfig,
		deployedAddresses: { ...deploymentConfig.contracts },
	};

	console.log(chalk.bold("\n⚡ Starting Deployment...\n"));

	// 1. Identity Registry
	if (selectedContracts.has("IdentityRegistry")) {
		await deployContract("IdentityRegistry", [deployer.address], context);

		// Register Deployer/Admin as Verified Identity (Required for receiving initial mints)
		try {
			console.log("  Authenticating Deployer...");
			const identityRegistry = await ethers.getContractAt(
				"IdentityRegistry",
				context.deployedAddresses.IdentityRegistry,
				deployer
			);
			// Hash "ADMIN" for the deployer identity
			const adminHash = ethers.keccak256(ethers.toUtf8Bytes("ADMIN"));
			const tx = await identityRegistry.registerIdentity(
				deployer.address,
				840,
				adminHash
			); // 840 = US
			await tx.wait();
			console.log(
				`  ✅ Deployer ${chalk.green(deployer.address)} authenticated (Country: 840, Hash: ADMIN)`
			);
		} catch (err) {
			console.warn(
				chalk.yellow(`  ⚠️ Failed to authenticate deployer: ${err.message}`)
			);
		}
	}

	// 2. CREUSD
	if (selectedContracts.has("CREUSD")) {
		await deployContract("CREUSD", [deployer.address], context);
		// Alias USDC
		context.deploymentConfig.contracts.USDC = hre.network.config.USDC_ADDRESS;
	}

	// 3. Commertize Token
	if (selectedContracts.has("CommertizeToken")) {
		await deployContract("CommertizeToken", [deployer.address], context);
	}

	// 4. Token Compliance
	if (selectedContracts.has("TokenCompliance")) {
		const idRegistry = context.deployedAddresses.IdentityRegistry;
		if (!idRegistry) {
			console.error(
				chalk.red("❌ Error: TokenCompliance requires IdentityRegistry.")
			);
		} else {
			await deployContract(
				"TokenCompliance",
				[idRegistry, deployer.address],
				context
			);
		}
	}

	// 5. Property Factory
	if (selectedContracts.has("PropertyFactory")) {
		await deployContract("PropertyFactory", [deployer.address], context);
	}

	// 6. Staking Pool
	if (selectedContracts.has("StakingPool")) {
		const comm = context.deployedAddresses.CommertizeToken;
		const creusd = context.deployedAddresses.CREUSD;
		if (!comm || !creusd) {
			console.error(
				chalk.red("❌ Error: StakingPool requires CommertizeToken and CREUSD.")
			);
		} else {
			await deployContract(
				"StakingPool",
				[comm, creusd, deployer.address],
				context
			);
		}
	}

	// 7. Dividend Vault
	if (selectedContracts.has("DividendVault")) {
		const creusd = context.deployedAddresses.CREUSD;
		if (!creusd) {
			console.error(chalk.red("❌ Error: DividendVault requires CREUSD."));
		} else {
			// Protocol Wallet = Deployer for now
			await deployContract(
				"DividendVault",
				[creusd, deployer.address, deployer.address],
				context
			);
		}
	}

	// Save to deployment.json (Single Source of Truth)
	context.deploymentConfig.timestamp = new Date().toISOString();
	context.deploymentConfig.network = {
		name: networkName,
		chainId: chainId,
		rpc: rpcUrl,
		currency: currency,
		blockExplorerUrl: blockExplorerUrl,
	};

	fs.writeFileSync(
		mainDeploymentPath,
		JSON.stringify(context.deploymentConfig, null, 2)
	);

	console.log(chalk.bold.green("\n✅ Deployment Config Updated!"));
	console.log(`Updated:  ${chalk.underline(deploymentFile)}`);
}

async function deployContract(infoName, args, context, aliasKey) {
	const key = aliasKey || infoName;
	console.log(`Deploying ${chalk.cyan(key)}...`);

	try {
		const Factory = await ethers.getContractFactory(infoName);
		const contract = await Factory.deploy(...args);
		await contract.waitForDeployment();

		const address = contract.target;
		console.log(`  └─ Address: ${chalk.green(address)}`);

		// Update context
		context.deployedAddresses[key] = address;
		context.deploymentConfig.contracts[key] = address;
	} catch (err) {
		console.error(chalk.red(`  Failed to deploy ${key}: ${err.message}`));
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

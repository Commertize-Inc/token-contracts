console.log("Loading Nexus Index Source...");
import { ethers } from "ethers";

// ------------------------------------------------------------------
// ENVIRONMENT DETECTION
// ------------------------------------------------------------------
const isBrowser = typeof window !== "undefined";
const isNode = typeof process !== "undefined" && process.versions?.node;

// ------------------------------------------------------------------
// ARTIFACT IMPORTS
// ------------------------------------------------------------------
// Import Artifacts direct from compilation output
import IdentityRegistryArtifact from "./artifacts/src/compliance/IdentityRegistry.sol/IdentityRegistry.json";
import TokenComplianceArtifact from "./artifacts/src/compliance/TokenCompliance.sol/TokenCompliance.json";
import CREUSDArtifact from "./artifacts/src/core/CREUSD.sol/CREUSD.json";
import CommertizeTokenArtifact from "./artifacts/src/core/CommertizeToken.sol/CommertizeToken.json";
import DividendVaultArtifact from "./artifacts/src/finance/DividendVault.sol/DividendVault.json";
import StakingPoolArtifact from "./artifacts/src/finance/StakingPool.sol/StakingPool.json";
import PropertyFactoryArtifact from "./artifacts/src/tokenization/PropertyFactory.sol/PropertyFactory.json";
import PropertyTokenArtifact from "./artifacts/src/tokenization/PropertyToken.sol/PropertyToken.json";
import ListingEscrowArtifact from "./artifacts/src/finance/ListingEscrow.sol/ListingEscrow.json";

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

export interface DeploymentConfig {
	contracts: {
		IdentityRegistry: string;
		PropertyFactory: string;
		TokenCompliance: string;
		CommertizeToken: string;
		CREUSD: string;
		StakingPool: string;
		DividendVault: string;
	};
	network: {
		name: string;
		chainId: number;
		rpc: string;
		currency: string;
		blockExplorerUrl: string;
	};
	timestamp: string | null;
}

// ------------------------------------------------------------------
// DEPLOYMENT LOADING
// ------------------------------------------------------------------

// Config Loading Logic
const getEnv = (key: string) => {
	if (typeof process !== "undefined" && process.env) {
		// Check standard, VITE_, and NEXT_PUBLIC_ prefixes
		return (
			process.env[key] ||
			process.env[`VITE_${key}`] ||
			process.env[`NEXT_PUBLIC_${key}`]
		);
	}
	// In browser, try to access Vite's import.meta.env
	if (typeof import.meta !== "undefined" && (import.meta as any).env) {
		const env = (import.meta as any).env;
		return env[key] || env[`VITE_${key}`] || env[`NEXT_PUBLIC_${key}`];
	}
	return undefined;
};

/**
 * Load deployment configuration for a specific network.
 * Uses dynamic imports for Node.js modules to be browser-safe.
 */
async function loadDeployment(
	network: string = "testnet"
): Promise<DeploymentConfig | null> {
	// 1. Try from environment variable (works in both browser and Node)
	const envVar = getEnv("DEPLOYMENT_JSON") || getEnv("VITE_DEPLOYMENT_JSON");

	if (envVar) {
		try {
			// If it's a string starting with {, parse it.
			if (typeof envVar === "string" && envVar.trim().startsWith("{")) {
				return JSON.parse(envVar);
			}
			// If it's already an object
			if (typeof envVar === "object") {
				return envVar as DeploymentConfig;
			}
		} catch (e) {
			console.warn(
				"Failed to parse DEPLOYMENT_JSON env var, falling back to file."
			);
		}
	}

	// 2. Browser Mode: Cannot use FS, so we stop here
	if (isBrowser) {
		console.warn(
			"⚠️  No deployment configuration found (browser mode - using VITE_DEPLOYMENT_JSON env var is recommended)"
		);
		return null;
	}

	// 3. Node Mode: Try from files
	if (isNode) {
		try {
			const fs = await import("fs");
			const path = await import("path");
			const { fileURLToPath } = await import("url");

			const getDirName = () => {
				try {
					// @ts-ignore
					return typeof __dirname !== "undefined"
						? __dirname
						: path.dirname(fileURLToPath(import.meta.url));
				} catch (e) {
					return undefined;
				}
			};

			const __dirname_compat = getDirName();
			if (!__dirname_compat) return null;

			const possiblePaths = [
				path.join(__dirname_compat, `./deployment.${network}.json`),
				path.join(__dirname_compat, "./deployment.testnet.json"),
				path.join(__dirname_compat, `../deployment.${network}.json`),
				path.join(__dirname_compat, "../deployment.testnet.json"),
			];

			for (const deploymentPath of possiblePaths) {
				if (fs.existsSync(deploymentPath)) {
					try {
						const content = fs.readFileSync(deploymentPath, "utf-8");
						const data = JSON.parse(content);
						console.log(
							`📦 Loaded deployment from ${path.basename(deploymentPath)}`
						);
						return data;
					} catch (error) {
						console.warn(`⚠️  Failed to parse ${deploymentPath}`);
					}
				}
			}
		} catch (err) {
			console.warn("Error loading deployment in Node environment:", err);
		}
	}

	console.warn("⚠️  No deployment configuration found");
	return null;
}

// Load deployment (defaults to testnet)
const deploymentNetwork = getEnv("EVM_NETWORK") || "testnet";
console.log(`Nexus Config: Using network '${deploymentNetwork}'`);

// This is our final fallback network name when no deployment file is found.
// In browser mode (no filesystem), deploymentConfig will be null, so we rely
// on this value, which in turn is driven by EVM_NETWORK/VITE_EVM_NETWORK.
const DEFAULT_NETWORK = deploymentNetwork;

// USE TOP-LEVEL AWAIT
const deploymentConfig: DeploymentConfig | null =
	await loadDeployment(deploymentNetwork);

// ------------------------------------------------------------------
// Configuration & Addresses
// ------------------------------------------------------------------

export const NETWORK =
	getEnv("NETWORK") || deploymentConfig?.network?.name || DEFAULT_NETWORK;
export const CHAIN_ID = Number(
	getEnv("CHAIN_ID") || deploymentConfig?.network?.chainId || 296
);
export const CURRENCY =
	getEnv("CURRENCY") || deploymentConfig?.network?.currency || "HBAR";
export const RPC_URL =
	getEnv("RPC_URL") ||
	deploymentConfig?.network?.rpc ||
	"https://testnet.hashio.io/api";
export const BLOCK_EXPLORER_URL =
	getEnv("BLOCK_EXPLORER_URL") ||
	deploymentConfig?.network?.blockExplorerUrl ||
	"https://hashscan.io/testnet";

export const CONTRACTS: any = deploymentConfig?.contracts || {};
export const Deployment = deploymentConfig;

// ------------------------------------------------------------------
// ADDRESS CONFIGURATION (Legacy / Helpers)
// ------------------------------------------------------------------

export const USDC_ADDRESS =
	(CONTRACTS as any)?.USDC ||
	(CONTRACTS as any)?.CREUSD ||
	getEnv("USDC_ADDRESS") ||
	"0x0000000000000000000000000000000000068cda";

// ------------------------------------------------------------------
// ABIs
// ------------------------------------------------------------------

export const ABIS = {
	IdentityRegistry: IdentityRegistryArtifact.abi,
	Compliance: TokenComplianceArtifact.abi,
	USDC: CREUSDArtifact.abi,
	CommertizeToken: CommertizeTokenArtifact.abi,
	DividendVault: DividendVaultArtifact.abi,
	StakingPool: StakingPoolArtifact.abi,
	PropertyFactory: PropertyFactoryArtifact.abi,
	PropertyToken: PropertyTokenArtifact.abi,
	ListingEscrow: ListingEscrowArtifact.abi,
};

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

// Contract Instances
export const getIdentityRegistryContract = (runner: ethers.ContractRunner) =>
	new ethers.Contract(
		CONTRACTS.IdentityRegistry,
		ABIS.IdentityRegistry,
		runner
	);
export const getComplianceContract = (runner: ethers.ContractRunner) =>
	new ethers.Contract(CONTRACTS.TokenCompliance, ABIS.Compliance, runner);
export const getUSDCContract = (runner: ethers.ContractRunner) =>
	new ethers.Contract(CONTRACTS.CREUSD || USDC_ADDRESS, ABIS.USDC, runner);
export const getCommertizeTokenContract = (runner: ethers.ContractRunner) =>
	new ethers.Contract(CONTRACTS.CommertizeToken, ABIS.CommertizeToken, runner);
export const getDividendVaultContract = (runner: ethers.ContractRunner) =>
	new ethers.Contract(CONTRACTS.DividendVault, ABIS.DividendVault, runner);
export const getStakingPoolContract = (runner: ethers.ContractRunner) =>
	new ethers.Contract(CONTRACTS.StakingPool, ABIS.StakingPool, runner);
export const getPropertyFactoryContract = (runner: ethers.ContractRunner) =>
	new ethers.Contract(CONTRACTS.PropertyFactory, ABIS.PropertyFactory, runner);
export const getTokenContract = (
	address: string,
	runner: ethers.ContractRunner
) => new ethers.Contract(address, ABIS.PropertyToken, runner);
export const getPropertyTokenContract = getTokenContract; // Alias
export const getEscrowContract = (
	address: string,
	runner: ethers.ContractRunner
) => new ethers.Contract(address, ABIS.ListingEscrow, runner);

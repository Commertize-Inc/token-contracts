console.log("Loading Nexus Index Source...");
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Conditionally import Node.js modules only in Node environment
// In browser, these will be undefined
const isBrowser = typeof window !== "undefined";
const isNode = typeof process !== "undefined" && process.versions?.node;

// Handle __dirname for both CommonJS and ESM (Node only)
const getDirName = (): string | undefined => {
	if (isBrowser) return undefined;
	if (typeof __dirname !== "undefined") return __dirname;
	try {
		return path.dirname(fileURLToPath(import.meta.url));
	} catch (e) {
		return undefined;
	}
};

const __dirname_compat = getDirName();

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

export interface DeploymentData {
	contracts: Record<string, string>;
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
const getEnv = (key: string, viteKey: string) => {
	if (typeof process !== "undefined" && process.env) {
		return process.env[key] || process.env[viteKey];
	}
	// In browser, try to access Vite's import.meta.env
	if (typeof import.meta !== "undefined" && (import.meta as any).env) {
		const env = (import.meta as any).env;
		return env[viteKey] || env[key];
	}
	return undefined;
};

/**
 * Load deployment configuration for a specific network.
 *
 * Priority order:
 * 1. Environment variable (DEPLOYMENT_JSON or VITE_DEPLOYMENT_JSON)
 * 2. deployment.localhost.json (local development - Node only)
 * 3. deployment.{network}.json (specified network - Node only)
 * 4. deployment.testnet.json (default fallback - Node only)
 */
function loadDeployment(network: string = "testnet"): DeploymentData | null {
	// 1. Try from environment variable (works in both browser and Node)
	if (typeof process !== "undefined" && process.env) {
		const envVar =
			process.env.VITE_DEPLOYMENT_JSON || process.env.DEPLOYMENT_JSON;
		if (envVar) {
			try {
				return JSON.parse(envVar);
			} catch (e) {
				console.warn(
					"Failed to parse DEPLOYMENT_JSON env var, falling back to file."
				);
			}
		}
	}

	// In browser, only use env vars (no file system access)
	if (isBrowser || !fs || !path || !__dirname_compat) {
		console.warn(
			"⚠️  No deployment configuration found (browser mode - use VITE_DEPLOYMENT_JSON env var)"
		);
		return null;
	}

	// 2. Try from files in priority order (Node only)
	// 2. Try from files in priority order (Node only)
	// 2. Try from files in priority order (Node only)
	const possiblePaths = [
		path.join(__dirname_compat, `./deployment.${network}.json`),
		path.join(__dirname_compat, "./deployment.testnet.json"),
		// Removing localhost fallback to prevent accidental confusion
		// Fallback: Check parent directory (useful when running from dist/)
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

	console.warn("⚠️  No deployment configuration found");
	return null;
}

// Load deployment (defaults to testnet)
const deploymentNetwork =
	getEnv("EVM_NETWORK", "VITE_EVM_NETWORK") || "testnet";
console.log(`Nexus Config: Using network '${deploymentNetwork}'`);
const DeploymentData: DeploymentData | null = loadDeployment(deploymentNetwork);

// ------------------------------------------------------------------
// Configuration & Addresses
// ------------------------------------------------------------------

export const NETWORK =
	getEnv("NETWORK", "VITE_NETWORK") ||
	DeploymentData?.network?.name ||
	"testnet";
export const CHAIN_ID = Number(
	getEnv("CHAIN_ID", "VITE_CHAIN_ID") || DeploymentData?.network?.chainId || 296
);
export const CURRENCY =
	getEnv("CURRENCY", "VITE_CURRENCY") ||
	DeploymentData?.network?.currency ||
	"HBAR";
export const RPC_URL =
	getEnv("RPC_URL", "VITE_RPC_URL") ||
	DeploymentData?.network?.rpc ||
	"https://testnet.hashio.io/api";

export const CONTRACTS: any = DeploymentData?.contracts || {};
export const DeploymentConfig = DeploymentData;

// ------------------------------------------------------------------
// ADDRESS CONFIGURATION (Legacy / Helpers)
// ------------------------------------------------------------------

export const USDC_ADDRESS =
	(CONTRACTS as any)?.USDC ||
	(CONTRACTS as any)?.CREUSD ||
	getEnv("USDC_ADDRESS", "VITE_USDC_ADDRESS") ||
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

export const getProvider = () => {
	if (!DeploymentConfig) {
		throw new Error(
			"Nexus DeploymentConfig is missing. Check deployment.json or environment variables."
		);
	}
	return new ethers.JsonRpcProvider(DeploymentConfig.network.rpc);
};

export const getWallet = (provider?: ethers.Provider | null) => {
	// Check common private key env var names
	const key =
		getEnv("EVM_PRIVATE_KEY", "VITE_EVM_PRIVATE_KEY") ||
		process.env.EVM_PRIVATE_KEY ||
		process.env.PRIVATE_KEY;
	if (key) {
		return new ethers.Wallet(key, provider || getProvider());
	}
	throw new Error("Private key not found in environment for getWallet");
};

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
export const getFactoryContract = (runner: ethers.ContractRunner) =>
	new ethers.Contract(CONTRACTS.PropertyFactory, ABIS.PropertyFactory, runner);
export const getPropertyFactoryContract = getFactoryContract; // Alias
export const getTokenContract = (
	address: string,
	runner: ethers.ContractRunner
) => new ethers.Contract(address, ABIS.PropertyToken, runner);
export const getPropertyTokenContract = getTokenContract; // Alias
export const getEscrowContract = (
	address: string,
	runner: ethers.ContractRunner
) => new ethers.Contract(address, ABIS.ListingEscrow, runner);

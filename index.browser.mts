console.log("Loading Nexus Index Source (Browser)...");
import { ethers } from "ethers";

// Browser-safe deployment loader - only uses Environment Variables
// Does NOT import 'fs', 'path', or 'url' to prevent Vite build errors

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
 * Load deployment configuration for a specific network (Browser Version).
 * Only supports VITE_DEPLOYMENT_JSON environment variable.
 */
function loadDeployment(network: string = "testnet"): DeploymentData | null {
	// 1. Try from environment variable (works in both browser and Node)
	const envVar = getEnv("DEPLOYMENT_JSON", "VITE_DEPLOYMENT_JSON");
	if (envVar) {
		try {
			// If it's a string starting with {, parse it.
			// Vite sometimes injects the object directly if using specific plugins, but usually string.
			if (typeof envVar === "string" && envVar.trim().startsWith("{")) {
				return JSON.parse(envVar);
			}
			// If it's already an object (rare)
			if (typeof envVar === "object") {
				return envVar as DeploymentData;
			}
		} catch (e) {
			console.warn("Failed to parse DEPLOYMENT_JSON env var.");
		}
	}

	console.warn(
		"⚠️  No deployment configuration found (browser mode - using VITE_DEPLOYMENT_JSON env var is required for contract addresses)"
	);
	return null;
}

// Load deployment (defaults to testnet)
const deploymentNetwork =
	getEnv("EVM_NETWORK", "VITE_EVM_NETWORK") || "testnet";
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
	// In browser, we might get a provider from window.ethereum or just a JsonRpcProvider
	if (
		DeploymentConfig &&
		DeploymentConfig.network &&
		DeploymentConfig.network.rpc
	) {
		return new ethers.JsonRpcProvider(DeploymentConfig.network.rpc);
	}
	// Fallback or potentially user wallet provider handling can be done here or in UI
	return new ethers.JsonRpcProvider(RPC_URL);
};

export const getWallet = (provider?: ethers.Provider | null) => {
	// Browser usually doesn't use getWallet with a private key (unsafe).
	// But if env var is set (e.g. for testing in browser?), we support it.
	const key =
		getEnv("EVM_PRIVATE_KEY", "VITE_EVM_PRIVATE_KEY") ||
		(typeof process !== "undefined" && process.env
			? process.env.EVM_PRIVATE_KEY || process.env.PRIVATE_KEY
			: undefined);

	if (key) {
		return new ethers.Wallet(key, provider || getProvider());
	}
	throw new Error(
		"Private key not found in environment for getWallet (Note: Only safe in Node or local dev)"
	);
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

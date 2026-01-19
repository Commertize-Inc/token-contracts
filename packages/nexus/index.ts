import { ethers } from "ethers";
import Deployment from "./deployment.json";

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

// Config Loading Logic
const getEnv = (key: string, viteKey: string) => {
	if (typeof process !== "undefined" && process.env) {
		return process.env[key] || process.env[viteKey];
	}
	return undefined;
};

// ------------------------------------------------------------------
// Configuration & Addresses
// ------------------------------------------------------------------

// 1. Try Config from Environment Variable (CI/CD/Vercel)
let EnvDeployment: any = null;
if (typeof process !== "undefined" && process.env) {
	const envVar =
		process.env.VITE_DEPLOYMENT_JSON || process.env.DEPLOYMENT_JSON;
	if (envVar) {
		try {
			EnvDeployment = JSON.parse(envVar);
		} catch (e) {
			console.warn(
				"Failed to parse DEPLOYMENT_JSON env var, falling back to local file."
			);
		}
	}
}

// 2. Fallback to Local JSON (Development)
const DeploymentData: any = EnvDeployment || Deployment;

export const HEDERA_TESTNET_CHAIN_ID = Number(
	getEnv("CHAIN_ID", "VITE_CHAIN_ID") || DeploymentData?.network?.chainId || 296
);
export const HEDERA_TESTNET_RPC =
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
	return new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
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

import { ethers } from "ethers";

// Artifact imports
import IdentityRegistryArtifact from "./artifacts/src/compliance/IdentityRegistry.sol/IdentityRegistry.json";
import TokenComplianceArtifact from "./artifacts/src/compliance/TokenCompliance.sol/TokenCompliance.json";
import CommertizeTokenArtifact from "./artifacts/src/core/CommertizeToken.sol/CommertizeToken.json";
import DividendVaultArtifact from "./artifacts/src/finance/DividendVault.sol/DividendVault.json";
import ListingEscrowArtifact from "./artifacts/src/finance/ListingEscrow.sol/ListingEscrow.json";
import StakingPoolArtifact from "./artifacts/src/finance/StakingPool.sol/StakingPool.json";
import PropertyFactoryArtifact from "./artifacts/src/tokenization/PropertyFactory.sol/PropertyFactory.json";
import PropertyTokenArtifact from "./artifacts/src/tokenization/PropertyToken.sol/PropertyToken.json";
import PropertyTokenAdapterArtifact from "./artifacts/src/tokenization/PropertyTokenAdapter.sol/PropertyTokenAdapter.json";
import PropertyTokenOFTArtifact from "./artifacts/src/tokenization/PropertyTokenOFT.sol/PropertyTokenOFT.json";

// Utils imports
import {
	DeploymentConfig,
	getNetworkName,
	getChainId,
	getRpcUrl,
	getCurrency,
	getBlockExplorerUrl,
	getDeploymentJsonEnv,
} from "@commertize/utils/onchain";

export type { DeploymentConfig };

// ------------------------------------------------------------------
// DEPLOYMENT LOADING
// ------------------------------------------------------------------

/**
 * Load deployment configuration for a specific network.
 * Uses dynamic imports which are bundled by tsup for both Node and Browser.
 */
async function loadDeployment(
	network: string = "testnet"
): Promise<DeploymentConfig | null> {
	// 1. Try from environment variable (works in both browser and Node)
	const envVar = getDeploymentJsonEnv();

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
				"Failed to parse DEPLOYMENT_JSON env var, falling back to bundled file."
			);
		}
	}

	// 2. Load bundled deployment JSON based on network
	// Template literal prevents TypeScript from statically resolving the path,
	// so the DTS build won't fail when a file (e.g. deployment.localhost.json) is absent.
	try {
		const mod = await import(`./deployment.${network}.json`);
		return (mod as any).default ?? (mod as any);
	} catch (err) {
		console.warn(`⚠️  Failed to load deployment for network: ${network}`, err);
		return null;
	}
}

const deploymentNetwork = getNetworkName();

// Final fallback network name
const DEFAULT_NETWORK = deploymentNetwork;

// USE TOP-LEVEL AWAIT
let deploymentConfig: DeploymentConfig | null =
	await loadDeployment(deploymentNetwork);

// ------------------------------------------------------------------
// Configuration & Addresses
// ------------------------------------------------------------------

export const NETWORK = deploymentConfig?.network?.name || getNetworkName();
export const CHAIN_ID = Number(
	deploymentConfig?.network?.chainId || getChainId()
);
export const CURRENCY = deploymentConfig?.network?.currency || getCurrency();
export const RPC_URL = deploymentConfig?.network?.rpc || getRpcUrl();
export const BLOCK_EXPLORER_URL =
	deploymentConfig?.network?.blockExplorerUrl || getBlockExplorerUrl();

export const CONTRACTS: any = deploymentConfig?.contracts || {};
export const Deployment = deploymentConfig;

// ------------------------------------------------------------------
// ADDRESS CONFIGURATION (Legacy / Helpers)
// ------------------------------------------------------------------

export const USDC_ADDRESS =
	(CONTRACTS as any)?.USDC ||
	getEnv("USDC_ADDRESS") ||
	"";

// Helper for USDC address fallback which isn't in utils/onchain
function getEnv(key: string) {
	if (typeof process !== "undefined" && process.env) {
		return process.env[key] || process.env[`VITE_${key}`];
	}
	if (typeof import.meta !== "undefined" && (import.meta as any).env) {
		const env = (import.meta as any).env;
		return env[key] || env[`VITE_${key}`];
	}
	return undefined;
}

/** ABI to interact with the existing USDC (or compatible) payment token on Arc. No token is implemented or deployed by this package. */
const ERC20_PERMIT_ABI = [
	{
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "spender", type: "address" },
		],
		name: "allowance",
		outputs: [{ type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ name: "spender", type: "address" },
			{ name: "value", type: "uint256" },
		],
		name: "approve",
		outputs: [{ type: "bool" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ name: "account", type: "address" }],
		name: "balanceOf",
		outputs: [{ type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "decimals",
		outputs: [{ type: "uint8" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "DOMAIN_SEPARATOR",
		outputs: [{ type: "bytes32" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "eip712Domain",
		outputs: [
			{ name: "fields", type: "bytes1" },
			{ name: "name", type: "string" },
			{ name: "version", type: "string" },
			{ name: "chainId", type: "uint256" },
			{ name: "verifyingContract", type: "address" },
			{ name: "salt", type: "bytes32" },
			{ name: "extensions", type: "uint256[]" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "name",
		outputs: [{ type: "string" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ name: "owner", type: "address" }],
		name: "nonces",
		outputs: [{ type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "spender", type: "address" },
			{ name: "value", type: "uint256" },
			{ name: "deadline", type: "uint256" },
			{ name: "v", type: "uint8" },
			{ name: "r", type: "bytes32" },
			{ name: "s", type: "bytes32" },
		],
		name: "permit",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "symbol",
		outputs: [{ type: "string" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "totalSupply",
		outputs: [{ type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ name: "to", type: "address" },
			{ name: "value", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ type: "bool" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ name: "from", type: "address" },
			{ name: "to", type: "address" },
			{ name: "value", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [{ type: "bool" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ indexed: true, name: "owner", type: "address" },
			{ indexed: true, name: "spender", type: "address" },
			{ indexed: false, name: "value", type: "uint256" },
		],
		name: "Approval",
		type: "event",
		anonymous: false,
	},
	{
		inputs: [
			{ indexed: true, name: "from", type: "address" },
			{ indexed: true, name: "to", type: "address" },
			{ indexed: false, name: "value", type: "uint256" },
		],
		name: "Transfer",
		type: "event",
		anonymous: false,
	},
] as const;

/** Contract ABIs (ethers/viem compatible). */
export const ABIS = {
	IdentityRegistry: IdentityRegistryArtifact.abi,
	Compliance: TokenComplianceArtifact.abi,
	USDC: [...ERC20_PERMIT_ABI],
	CommertizeToken: CommertizeTokenArtifact.abi,
	DividendVault: DividendVaultArtifact.abi,
	StakingPool: StakingPoolArtifact.abi,
	PropertyFactory: PropertyFactoryArtifact.abi,
	PropertyToken: PropertyTokenArtifact.abi,
	PropertyTokenAdapter: PropertyTokenAdapterArtifact.abi,
	PropertyTokenOFT: PropertyTokenOFTArtifact.abi,
	ListingEscrow: ListingEscrowArtifact.abi,
};

/** ListingEscrow ABI for deposit/decode (includes SafeERC20FailedOperation and other errors). */
export const ListingEscrowAbi = ListingEscrowArtifact.abi;

/** Full artifacts (ABI + bytecode) for backend deployment via ContractFactory. */
export { default as PropertyTokenAdapterArtifact } from "./artifacts/src/tokenization/PropertyTokenAdapter.sol/PropertyTokenAdapter.json";
export { default as PropertyTokenOFTArtifact } from "./artifacts/src/tokenization/PropertyTokenOFT.sol/PropertyTokenOFT.json";
export { default as IdentityRegistryArtifact } from "./artifacts/src/compliance/IdentityRegistry.sol/IdentityRegistry.json";
export { default as TokenComplianceArtifact } from "./artifacts/src/compliance/TokenCompliance.sol/TokenCompliance.json";

/** Standard Solidity Error(string) ABI for decoding require()/revert() messages. */
export const ErrorStringAbi = [
	{
		type: "error",
		name: "Error",
		inputs: [{ name: "message", type: "string" }],
	},
] as const;

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
	new ethers.Contract(CONTRACTS.USDC || USDC_ADDRESS, ABIS.USDC, runner);
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

// ------------------------------------------------------------------
// LAYERZERO BRIDGE CONFIGURATION
// ------------------------------------------------------------------

/**
 * Configuration for a LayerZero bridge-enabled chain.
 *
 * The home chain (Hedera) holds the canonical PropertyToken and a lock-and-mint
 * adapter, while each destination chain runs a PropertyTokenOFT (mint/burn).
 */
export interface BridgeChainConfig {
	/** Internal identifier used in deployment files (e.g. `"base-sepolia"`). */
	name: string;
	/** Human-readable label shown in the dashboard UI. */
	displayName: string;
	/** EVM chain ID (e.g. 296 for Hedera testnet, 84532 for Base Sepolia). */
	chainId: number;
	/** LayerZero v2 endpoint ID for this chain. */
	lzEid: number;
	/** Address of the LayerZero endpoint contract on this chain. */
	lzEndpoint: string;
	/** JSON-RPC URL used by the backend and dashboard to interact with this chain. */
	rpcUrl: string;
	/** Base URL of the chain's block explorer (no trailing slash). */
	blockExplorerUrl: string;
	/** Native gas token metadata. */
	nativeCurrency: { name: string; symbol: string; decimals: number };
	/** `true` for the home chain where canonical PropertyTokens live. */
	isHome: boolean;
	/** Maps to `SupportedNetwork` enum value (e.g. `"BASE"`). Omitted for the home chain. */
	network?: string;
}

import { NETWORKS } from "./networks";

/** UI-only metadata for bridge chains, keyed by networks.ts key. */
const BRIDGE_UI_META: {
	networkKey: string;
	/** Override name in the bridge config (e.g. "hedera-testnet" instead of "testnet"). */
	bridgeName?: string;
	displayName: string;
	nativeCurrency: { name: string; symbol: string; decimals: number };
	isHome: boolean;
	network?: string;
}[] = [
	{
		networkKey: "testnet",
		bridgeName: "hedera-testnet",
		displayName: "Hedera (Home)",
		nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
		isHome: true,
	},
	{
		networkKey: "base-sepolia",
		displayName: "Base",
		nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
		isHome: false,
		network: "BASE",
	},
];

/**
 * Known bridge-enabled chains. The home chain is always first.
 * Destination chain deployment addresses are loaded separately.
 */
export const BRIDGE_CHAINS: BridgeChainConfig[] = BRIDGE_UI_META.map((ui) => {
	const net = NETWORKS[ui.networkKey];
	if (!net) throw new Error(`Unknown network key "${ui.networkKey}" in BRIDGE_UI_META`);
	if (!net.lzEndpoint || !net.lzEid) throw new Error(`Network "${ui.networkKey}" missing LZ config`);
	return {
		name: ui.bridgeName ?? net.name,
		displayName: ui.displayName,
		chainId: net.chainId,
		lzEid: net.lzEid,
		lzEndpoint: net.lzEndpoint,
		rpcUrl: net.rpcUrl,
		blockExplorerUrl: net.blockExplorerUrl,
		nativeCurrency: ui.nativeCurrency,
		isHome: ui.isHome,
		...(ui.network ? { network: ui.network } : {}),
	};
});

/** Bridge chain name → SupportedNetwork (e.g. "base-sepolia" → "BASE") */
export const CHAIN_TO_NETWORK: Record<string, string> = Object.fromEntries(
	BRIDGE_CHAINS.filter((ch) => ch.network).map((ch) => [ch.name, ch.network!])
);

/** SupportedNetwork → bridge chain name (e.g. "BASE" → "base-sepolia") */
export const NETWORK_TO_CHAIN: Record<string, string> = Object.fromEntries(
	Object.entries(CHAIN_TO_NETWORK).map(([chain, network]) => [network, chain])
);

/** Load a destination chain's deployment config (OFT addresses, compliance, etc.) */
export async function loadBridgeDeployment(
	chainName: string
): Promise<DeploymentConfig | null> {
	try {
		const mod = await import(`./deployment.${chainName.replace(/-/g, "_")}.json`);
		return (mod as any).default ?? (mod as any);
	} catch {
		return null;
	}
}

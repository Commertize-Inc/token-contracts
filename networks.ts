/**
 * Single source of truth for all network configuration.
 * Zero dependencies — imported by both hardhat.config.ts and index.mts.
 */

export interface CCIPConfig {
	router: string;
	chainSelector: string;
	rmnProxy: string;
	linkToken: string;
	tokenAdminRegistry: string;
	registryModuleOwner: string;
	tokenPoolFactory?: string;
}

export interface NetworkConfig {
	name: string;
	chainId: number;
	rpcUrl: string;
	currency: string;
	blockExplorerUrl: string;
	usdcAddress: string;
	// CCIP v1.6 addresses from https://docs.chain.link/ccip/directory —
	// absent means CCIP is not configured for the network.
	ccip?: CCIPConfig;
}

export const DEFAULT_NETWORK = "arc-testnet";

export const NETWORKS: Record<string, NetworkConfig> = {
	localhost: {
		name: "localhost",
		chainId: 5042002,
		rpcUrl: "http://127.0.0.1:8545",
		currency: "USDC",
		blockExplorerUrl: "",
		usdcAddress: "0x3600000000000000000000000000000000000000",
	},
	"arc-testnet": {
		name: "arc-testnet",
		chainId: 5042002,
		rpcUrl: "https://rpc.testnet.arc.network",
		currency: "USDC",
		blockExplorerUrl: "https://testnet.arcscan.app/",
		usdcAddress: "0x3600000000000000000000000000000000000000",
		ccip: {
			router: "0xdE4E7FED43FAC37EB21aA0643d9852f75332eab8",
			chainSelector: "3034092155422581607",
			rmnProxy: "0xD610B8f58689de7755947C05342A2DFaC30ebD57",
			linkToken: "0x3F1f176e347235858DD6Db905DDBA09Eaf25478a",
			tokenAdminRegistry: "0xd3e461C55676B10634a5F81b747c324B85686Dd1",
			registryModuleOwner: "0x524B83ae8208490151339c626fd0E35b964483e3",
			tokenPoolFactory: "0x5aD0A67f4Da0E8665a3fbf15E4215A780407Cf33",
		},
	},
	"ethereum-sepolia": {
		name: "ethereum-sepolia",
		chainId: 11155111,
		rpcUrl: "https://rpc.sepolia.org",
		currency: "ETH",
		blockExplorerUrl: "https://sepolia.etherscan.io/",
		usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
	},
	mainnet: {
		name: "mainnet",
		chainId: 295,
		rpcUrl: "https://mainnet.hashio.io/api",
		currency: "HBAR",
		blockExplorerUrl: "https://hashscan.io/mainnet",
		usdcAddress: "0x000000000000000000000000000000000006f89a",
	},
};

export function getNetwork(name: string): NetworkConfig {
	const net = NETWORKS[name];
	if (!net) {
		throw new Error(
			`No network config found for "${name}". Known networks: ${Object.keys(NETWORKS).join(", ")}`
		);
	}
	return net;
}

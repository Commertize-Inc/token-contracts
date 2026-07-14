/**
 * Single source of truth for all network configuration.
 * Zero dependencies — imported by both hardhat.config.ts and index.mts.
 */

export interface NetworkConfig {
	name: string;
	chainId: number;
	rpcUrl: string;
	currency: string;
	blockExplorerUrl: string;
	usdcAddress: string;
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

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
	lzEndpoint?: string;
	lzEid?: number;
}

export const NETWORKS: Record<string, NetworkConfig> = {
	localhost: {
		name: "localhost",
		chainId: 5042002,
		rpcUrl: "http://127.0.0.1:8545",
		currency: "GO",
		blockExplorerUrl: "",
		usdcAddress: "0x3600000000000000000000000000000000000000",
	},
	testnet: {
		name: "testnet",
		chainId: 296,
		rpcUrl: "https://testnet.hashio.io/api",
		currency: "HBAR",
		blockExplorerUrl: "https://hashscan.io/testnet",
		usdcAddress: "0x24133B19078F362038f3a6fc6631A8286A4eB5f6",
		lzEndpoint: "0xbD672D1562Dd32C23B563C989d8140122483631d",
		lzEid: 40285,
	},
	"arc-testnet": {
		name: "arc-testnet",
		chainId: 5042002,
		rpcUrl: "https://rpc.testnet.arc.network",
		currency: "USDC",
		blockExplorerUrl: "https://testnet.arcscan.app/",
		usdcAddress: "0x3600000000000000000000000000000000000000",
	},
	"base-sepolia": {
		name: "base-sepolia",
		chainId: 84532,
		rpcUrl: "https://sepolia.base.org",
		currency: "ETH",
		blockExplorerUrl: "https://sepolia.basescan.org",
		usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
		lzEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
		lzEid: 40245,
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

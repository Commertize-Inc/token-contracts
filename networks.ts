/**
 * Single source of truth for all network configuration.
 * Zero dependencies — imported by both hardhat.config.ts and index.mts.
 *
 * Topology:
 *   Home chain:        Arbitrum (mainnet) / Arbitrum Sepolia (testnet)
 *   Destination chains: Arc, Base — bridged via Chainlink CCIP
 */

export interface NetworkConfig {
	name: string;
	chainId: number;
	rpcUrl: string;
	currency: string;
	blockExplorerUrl: string;
	usdcAddress: string;
	ccip?: {
		router: string;
		chainSelector: string;
		linkToken: string;
	};
}

export const DEFAULT_NETWORK = "arbitrum-sepolia";

export const NETWORKS: Record<string, NetworkConfig> = {
	localhost: {
		name: "localhost",
		chainId: 421614,
		rpcUrl: "http://127.0.0.1:8545",
		currency: "ETH",
		blockExplorerUrl: "",
		usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
	},

	// MARK: Home Chain

	"arbitrum-sepolia": {
		name: "arbitrum-sepolia",
		chainId: 421614,
		rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
		currency: "ETH",
		blockExplorerUrl: "https://sepolia.arbiscan.io/",
		usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
		ccip: {
			router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
			chainSelector: "3478487238524512106",
			linkToken: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
		},
	},
	arbitrum: {
		name: "arbitrum",
		chainId: 42161,
		rpcUrl: "https://arb1.arbitrum.io/rpc",
		currency: "ETH",
		blockExplorerUrl: "https://arbiscan.io/",
		usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
		ccip: {
			router: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
			chainSelector: "4949039107694359620",
			linkToken: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
		},
	},

	// MARK: Destination Chains (CCIP bridged)

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
			linkToken: "0x3F1f176e347235858DD6Db905DDBA09Eaf25478a",
		},
	},
	"base-sepolia": {
		name: "base-sepolia",
		chainId: 84532,
		rpcUrl: "https://sepolia.base.org",
		currency: "ETH",
		blockExplorerUrl: "https://sepolia.basescan.org/",
		usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
		ccip: {
			router: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
			chainSelector: "10344971235874465080",
			linkToken: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
		},
	},
	base: {
		name: "base",
		chainId: 8453,
		rpcUrl: "https://mainnet.base.org",
		currency: "ETH",
		blockExplorerUrl: "https://basescan.org/",
		usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
		ccip: {
			router: "0x881e3A65B4d4a04dD529061dd0071cf975F58bCD",
			chainSelector: "15971525489660198786",
			linkToken: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196",
		},
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

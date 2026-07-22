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
	"arbitrum-sepolia": {
		name: "arbitrum-sepolia",
		chainId: 421614,
		rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
		currency: "ETH",
		blockExplorerUrl: "https://sepolia.arbiscan.io/",
		// Circle-native USDC
		usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
		ccip: {
			router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
			chainSelector: "3478487238524512106",
			rmnProxy: "0x9527E2d01A3064ef6b50c1Da1C0cC523803BCFF2",
			linkToken: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
			tokenAdminRegistry: "0x8126bE56454B628a88C17849B9ED99dd5a11Bd2f",
			registryModuleOwner: "0xaD417c0611dBD225471D31F056b8B6beC1CBC153",
			tokenPoolFactory: "0xFc28e82F5D0780CF6074D5331Ca34859F92e6E54",
		},
	},
	"arbitrum-one": {
		name: "arbitrum-one",
		chainId: 42161,
		rpcUrl: "https://arb1.arbitrum.io/rpc",
		currency: "ETH",
		blockExplorerUrl: "https://arbiscan.io/",
		// Circle-native USDC (NOT bridged USDC.e 0xFF97...5CC8)
		usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
		ccip: {
			router: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
			chainSelector: "4949039107694359620",
			rmnProxy: "0xC311a21e6fEf769344EB1515588B9d535662a145",
			linkToken: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
			tokenAdminRegistry: "0x39AE1032cF4B334a1Ed41cdD0833bdD7c7E7751E",
			registryModuleOwner: "0x1f1df9f7fc939E71819F766978d8F900B816761b",
			tokenPoolFactory: "0x8A76fe7fA6da27f85a626c5C53730B38D13603d7",
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

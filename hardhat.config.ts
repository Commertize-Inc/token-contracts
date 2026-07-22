import { defineConfig, configVariable } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

import { loadEnv } from "@commertize/utils/server";
loadEnv();

import { NETWORKS, DEFAULT_NETWORK, getNetwork } from "./networks";
import type { NetworkConfig } from "./networks";

// MARK: Re-exports
export { NETWORKS, DEFAULT_NETWORK, getNetwork };
export type { NetworkConfig };

// Backward-compat aliases
export type NetworkMeta = NetworkConfig;
export const NETWORK_META = NETWORKS;
export const getNetworkMeta = getNetwork;

export default defineConfig({
	plugins: [hardhatToolboxMochaEthers],
	solidity: {
		version: "0.8.25",
		settings: {
			optimizer: {
				enabled: true,
				runs: 1,
			},
			viaIR: true,
		},
	},
	paths: {
		// test/contracts holds test-only mocks; their artifacts land under
		// artifacts/test/** which the package `files` glob never publishes.
		sources: ["./src", "./test/contracts"],
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts",
	},
	networks: {
		localhost: {
			type: "http",
			url: NETWORKS.localhost.rpcUrl,
			chainId: NETWORKS.localhost.chainId,
		},
		"arc-testnet": {
			type: "http",
			url: NETWORKS["arc-testnet"].rpcUrl,
			chainId: NETWORKS["arc-testnet"].chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		"ethereum-sepolia": {
			type: "http",
			url: NETWORKS["ethereum-sepolia"].rpcUrl,
			chainId: NETWORKS["ethereum-sepolia"].chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		"arbitrum-sepolia": {
			type: "http",
			url: NETWORKS["arbitrum-sepolia"].rpcUrl,
			chainId: NETWORKS["arbitrum-sepolia"].chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		"arbitrum-one": {
			type: "http",
			url: NETWORKS["arbitrum-one"].rpcUrl,
			chainId: NETWORKS["arbitrum-one"].chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		mainnet: {
			type: "http",
			url: NETWORKS.mainnet.rpcUrl,
			chainId: NETWORKS.mainnet.chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
	},
	test: {
		mocha: {
			timeout: 40_000,
		},
	},
});

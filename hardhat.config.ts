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
		sources: "./src",
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
		"arbitrum-sepolia": {
			type: "http",
			url: NETWORKS["arbitrum-sepolia"].rpcUrl,
			chainId: NETWORKS["arbitrum-sepolia"].chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		arbitrum: {
			type: "http",
			url: NETWORKS.arbitrum.rpcUrl,
			chainId: NETWORKS.arbitrum.chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		"arc-testnet": {
			type: "http",
			url: NETWORKS["arc-testnet"].rpcUrl,
			chainId: NETWORKS["arc-testnet"].chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		"base-sepolia": {
			type: "http",
			url: NETWORKS["base-sepolia"].rpcUrl,
			chainId: NETWORKS["base-sepolia"].chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		base: {
			type: "http",
			url: NETWORKS.base.rpcUrl,
			chainId: NETWORKS.base.chainId,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
	},
	test: {
		mocha: {
			timeout: 40_000,
		},
	},
});

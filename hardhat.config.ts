import { defineConfig, configVariable } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

import { loadEnv } from "@commertize/utils/server";
loadEnv();

import { NETWORKS, getNetwork } from "./networks";
import type { NetworkConfig } from "./networks";

// ─── Re-exports ──────────────────────────────────────────────
// Deploy scripts import from "../hardhat.config.js"
export { NETWORKS, getNetwork };
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
		testnet: {
			type: "http",
			url: NETWORKS.testnet.rpcUrl,
			chainId: NETWORKS.testnet.chainId,
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

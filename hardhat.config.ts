import { defineConfig, configVariable } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

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
			url: "http://127.0.0.1:8545",
			chainId: 5042002,
		},
		testnet: {
			type: "http",
			url: "https://testnet.hashio.io/api",
			chainId: 296,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		"arc-testnet": {
			type: "http",
			url: "https://rpc.testnet.arc.network",
			chainId: 5042002,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		"base-sepolia": {
			type: "http",
			url: "https://sepolia.base.org",
			chainId: 84532,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
		mainnet: {
			type: "http",
			url: "https://mainnet.hashio.io/api",
			chainId: 295,
			accounts: [configVariable("EVM_PRIVATE_KEY")],
		},
	},
	test: {
		mocha: {
			timeout: 40_000,
		},
	},
});

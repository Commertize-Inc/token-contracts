require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
const { loadEnv } = require("@commertize/utils/env-server");

// Load environment variables
loadEnv();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: "0.8.25",
		settings: {
			optimizer: {
				enabled: true,
				runs: 1,
			},
			viaIR: true, // Enable via-IR to fix stack too deep errors
		},
	},
	paths: {
		sources: "./src",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts",
	},
	networks: {
		hardhat: {
			chainId: 31337,
		},
		localhost: {
			url: "http://127.0.0.1:8545",
		},
		testnet: {
			url: "https://testnet.hashio.io/api",
			chainId: 296,
			accounts: [
				process.env.EVM_PRIVATE_KEY,
			].filter((k) => !!k && k.startsWith("0x")),
			USDC_ADDRESS: "0x0000000000000000000000000000000000068cda",
		},
		mainnet: {
			url: "https://mainnet.hashio.io/api",
			chainId: 295,
			accounts: [
				process.env.EVM_PRIVATE_KEY,
			].filter((k) => !!k && k.startsWith("0x")),
			USDC_ADDRESS: "0x000000000000000000000000000000000006f89a",
		},
	},
	mocha: {
		timeout: 40000,
	},
};

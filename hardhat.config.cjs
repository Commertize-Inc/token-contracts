require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config(); // Load from local .env (vendor/token-contracts/.env)
require("dotenv").config({ path: "../../.env" }); // Fallback to root .env

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
		},
		mainnet: {
			url: "https://mainnet.hashio.io/api",
			chainId: 295,
			accounts: [
				process.env.EVM_PRIVATE_KEY,
			].filter((k) => !!k && k.startsWith("0x")),
		},
	},
	mocha: {
		timeout: 40000,
	},
};

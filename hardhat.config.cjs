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
			chainId: 5042002,
			currency: "GO",
			url: "http://127.0.0.1:8545",
			blockExplorerUrl: "",
			USDC_ADDRESS: "0x3600000000000000000000000000000000000000",
		},
		testnet: {
			chainId: 296,
			currency: "HBAR",
			url: "https://testnet.hashio.io/api",
			accounts: [process.env.EVM_PRIVATE_KEY].filter(
				(k) => !!k && k.startsWith("0x")
			),
			blockExplorerUrl: "https://hashscan.io/testnet",
			USDC_ADDRESS: "0x24133B19078F362038f3a6fc6631A8286A4eB5f6",
			LZ_ENDPOINT: "0xbD672D1562Dd32C23B563C989d8140122483631d",
			LZ_EID: 40285,
		},
		"arc-testnet": {
			chainId: 5042002,
			currency: "USDC",
			url: "https://rpc.testnet.arc.network",
			accounts: [process.env.EVM_PRIVATE_KEY].filter(
				(k) => !!k && k.startsWith("0x")
			),
			blockExplorerUrl: "https://testnet.arcscan.app/",
			USDC_ADDRESS: "0x3600000000000000000000000000000000000000",
		},
		"base-sepolia": {
			chainId: 84532,
			currency: "ETH",
			url: "https://sepolia.base.org",
			accounts: [process.env.EVM_PRIVATE_KEY].filter(
				(k) => !!k && k.startsWith("0x")
			),
			blockExplorerUrl: "https://sepolia.basescan.org",
			USDC_ADDRESS: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
			LZ_ENDPOINT: "0x6EDCE65403992e310A62460808c4b910D972f10f",
			LZ_EID: 40245,
		},
		mainnet: {
			chainId: 295,
			currency: "HBAR",
			url: "https://mainnet.hashio.io/api",
			accounts: [process.env.EVM_PRIVATE_KEY].filter(
				(k) => !!k && k.startsWith("0x")
			),
			blockExplorerUrl: "https://hashscan.io/mainnet",
			USDC_ADDRESS: "0x000000000000000000000000000000000006f89a",
		},
	},
	mocha: {
		timeout: 40000,
	},
};

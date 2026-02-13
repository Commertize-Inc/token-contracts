/**
 * Network metadata that HH3 doesn't support as custom fields on network config.
 * Deploy scripts import from here instead of hre.network.config.
 */

export interface NetworkMeta {
	currency: string;
	blockExplorerUrl: string;
	USDC_ADDRESS: string;
	LZ_ENDPOINT?: string;
	LZ_EID?: number;
}

export const NETWORK_META: Record<string, NetworkMeta> = {
	localhost: {
		currency: "GO",
		blockExplorerUrl: "",
		USDC_ADDRESS: "0x3600000000000000000000000000000000000000",
	},
	testnet: {
		currency: "HBAR",
		blockExplorerUrl: "https://hashscan.io/testnet",
		USDC_ADDRESS: "0x24133B19078F362038f3a6fc6631A8286A4eB5f6",
		LZ_ENDPOINT: "0xbD672D1562Dd32C23B563C989d8140122483631d",
		LZ_EID: 40285,
	},
	"arc-testnet": {
		currency: "USDC",
		blockExplorerUrl: "https://testnet.arcscan.app/",
		USDC_ADDRESS: "0x3600000000000000000000000000000000000000",
	},
	"base-sepolia": {
		currency: "ETH",
		blockExplorerUrl: "https://sepolia.basescan.org",
		USDC_ADDRESS: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
		LZ_ENDPOINT: "0x6EDCE65403992e310A62460808c4b910D972f10f",
		LZ_EID: 40245,
	},
	mainnet: {
		currency: "HBAR",
		blockExplorerUrl: "https://hashscan.io/mainnet",
		USDC_ADDRESS: "0x000000000000000000000000000000000006f89a",
	},
};

export function getNetworkMeta(name: string): NetworkMeta {
	const meta = NETWORK_META[name];
	if (!meta) {
		throw new Error(`No network metadata found for "${name}". Known networks: ${Object.keys(NETWORK_META).join(", ")}`);
	}
	return meta;
}

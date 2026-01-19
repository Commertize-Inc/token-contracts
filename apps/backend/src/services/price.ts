/**
 * Price Service
 * Handles currency conversion rates.
 * For MVP/Testnet, we use fixed mock rates to ensure stability.
 */
export class PriceService {
	// Mock Rates (USD base)
	private static RATES: Record<string, number> = {
		USD: 1.0,
		USDC: 1.0, // Stablecoin
		CREUSD: 1.0, // Stablecoin
		HBAR: 0.1, // Mock: 1 HBAR = $0.10
		HBAR_TESTNET: 0.1, // Mock: 1 HBAR = $0.10
	};

	/**
	 * Get current rate for a currency against USD.
	 * @param currency Currency symbol (e.g., 'HBAR')
	 * @returns Rate in USD (e.g., 0.10)
	 */
	static async getRate(currency: string): Promise<number> {
		// IN REAL PROD: Fetch from CoinGecko / Binance API with caching
		const rate = this.RATES[currency.toUpperCase()];
		if (!rate) {
			throw new Error(`Unsupported currency: ${currency}`);
		}
		return rate;
	}

	/**
	 * Convert USD amount to Target Currency
	 * @param amountUsd Amount in USD
	 * @param currency Target Currency
	 * @returns Amount in Target Currency
	 */
	static async convertFromUsd(
		amountUsd: number,
		currency: string
	): Promise<number> {
		const rate = await this.getRate(currency);
		// Amount in Currency = Target USD / Rate
		// e.g. $10 / $0.10 = 100 HBAR
		return amountUsd / rate;
	}

	/**
	 * Validate if a Transaction Value matches the Expected USD Amount
	 * @param txValue Amount in Crypto (from Tx)
	 * @param expectedUsd Amount in USD expected
	 * @param currency Currency used
	 * @param tolerancePct Acceptance tolerance (e.g. 0.01 for 1%)
	 */
	static async validateTransactionValue(
		txValue: number,
		expectedUsd: number,
		currency: string,
		tolerancePct = 0.02
	): Promise<boolean> {
		const rate = await this.getRate(currency);
		const valueInUsd = txValue * rate;

		const diff = Math.abs(valueInUsd - expectedUsd);
		const tolerance = expectedUsd * tolerancePct;

		return diff <= tolerance;
	}
}

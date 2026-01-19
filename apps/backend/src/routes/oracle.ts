import { Hono } from "hono";
import { getEM } from "../db";
import { Listing } from "@commertize/data";
import { HonoEnv } from "../types";

const oracle = new Hono<HonoEnv>();

// Middleware to check API Key (Simplified for MVP)
// In production, use signed headers or IP whitelisting for Functions
const oracleAuth = async (c: any, next: any) => {
	const authHeader = c.req.header("Authorization");
	const validKey = process.env.COMMERTIZE_API_KEY; // Internal Secret

	if (!authHeader || authHeader !== `Bearer ${validKey}`) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	await next();
};

oracle.get("/property/:id", oracleAuth, async (c) => {
	try {
		const id = c.req.param("id");
		const em = await getEM();

		// Find property/listing
		const listing = await em.findOne(Listing, { id });

		if (!listing) {
			return c.json({ error: "Property not found" }, 404);
		}

		// Extract data - fallback to defaults if not set
		// Valuation in cents (User input is USD, storing as decimal? Let's assume input is standard float, we multiply by 100)
		// If listing.financials.valuation is 1,000,000.00 -> 100000000
		// Valuation (purchasePrice -> valuation)
		const valuation = listing.financials?.purchasePrice
			? Math.floor(listing.financials.purchasePrice * 100)
			: 0;

		// Cap Rate in BPS (derivedCapRate is 0-1, e.g. 0.055 -> 550)
		const capRate = listing.derivedCapRate
			? Math.floor(listing.derivedCapRate * 10000)
			: 0;

		// Occupancy in BPS (occupancyRate is 0-1, e.g. 0.95 -> 9500)
		const occupancyRate = listing.financials?.occupancyRate
			? Math.floor(listing.financials.occupancyRate * 10000)
			: 0;

		return c.json({
			valuation,
			capRate,
			occupancyRate,
			timestamp: Date.now(),
		});
	} catch (error) {
		console.error("Oracle Error:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default oracle;

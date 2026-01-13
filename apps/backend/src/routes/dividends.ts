import {
	Dividend,
	Listing,
	User,
	UserRole,
	VerificationStatus,
	createDividendSchema,
} from "@commertize/data";
import { Hono } from "hono";
import { getEM } from "../db";
import { authMiddleware } from "../middleware/auth";
import { HonoEnv } from "../types";
import { z } from "zod";

const dividends = new Hono<HonoEnv>();

dividends.use("*", authMiddleware);

// GET /dividends/:listingId - Fetch dividends for a listing
dividends.get("/:listingId", async (c) => {
	try {
		const listingId = c.req.param("listingId");
		const userId = c.get("userId");

		const em = await getEM();
		const user = await em.findOne(
			User,
			{ privyId: userId },
			{ populate: ["sponsor"] }
		);

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Listing must exist
		const listing = await em.findOne(
			Listing,
			{ id: listingId },
			{ populate: ["sponsor"] }
		);

		if (!listing) {
			return c.json({ error: "Listing not found" }, 404);
		}

		// Check if user is the sponsor of the listing
		// OR user is an investor in the listing (future feature, for now maybe restrict to sponsor)
		// For dashboard, it is the sponsor viewing their listing's dividends.
		if (listing.sponsor.id !== user.id) {
			return c.json({ error: "Unauthorized" }, 403);
		}

		const dividends = await em.find(
			Dividend,
			{ listing: listing },
			{ orderBy: { distributionDate: "DESC" } }
		);

		return c.json(dividends);
	} catch (error) {
		console.error("Error fetching dividends:", error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

// POST /dividends - Issue a new dividend
dividends.post("/", async (c) => {
	try {
		const userId = c.get("userId");
		const body = await c.req.json();
		const result = createDividendSchema.safeParse(body);

		if (!result.success) {
			return c.json(
				{ error: "Invalid Data", details: result.error.format() },
				400
			);
		}

		const { listingId, amount, distributionDate } = result.data;

		const em = await getEM();
		const user = await em.findOne(
			User,
			{ privyId: userId },
			{ populate: ["sponsor"] }
		);

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Verify Sponsor Status
		if (user.sponsor?.status !== VerificationStatus.VERIFIED) {
			return c.json(
				{ error: "Only verified sponsors can issue dividends." },
				403
			);
		}

		const listing = await em.findOne(
			Listing,
			{ id: listingId },
			{ populate: ["sponsor"] }
		);

		if (!listing) {
			return c.json({ error: "Listing not found" }, 404);
		}

		if (listing.sponsor.id !== user.id) {
			return c.json(
				{ error: "Unauthorized: You do not own this listing" },
				403
			);
		}

		// Create Dividend
		const dividend = new Dividend();
		dividend.amount = amount;
		dividend.distributionDate = distributionDate;
		dividend.status = "pending"; // Default
		dividend.listing = listing;

		await em.persist(dividend).flush();

		return c.json({ success: true, dividend });
	} catch (error) {
		console.error("Error issuing dividend:", error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

export default dividends;

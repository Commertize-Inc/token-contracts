import { Hono } from "hono";
import { Waitlist, WaitlistType } from "@commertize/data";
import {
	waitlistInvestorSchema,
	waitlistSponsorSchema,
} from "@commertize/data/schemas";
import { getEM } from "../db";

const waitlist = new Hono();

// POST /waitlist - Add a new waitlist entry
waitlist.post("/", async (c) => {
	const em = await getEM();
	const body = await c.req.json();

	const { type, ...data } = body;

	// Validate based on type
	if (type === "investor") {
		const result = waitlistInvestorSchema.safeParse(data);
		if (!result.success) {
			return c.json(
				{ error: "Invalid investor data", details: result.error.flatten() },
				400
			);
		}

		// Check if email already exists
		const existing = await em.findOne(Waitlist, { email: result.data.email });
		if (existing) {
			return c.json({ error: "This email is already on the waitlist" }, 409);
		}

		const entry = em.create(Waitlist, {
			...result.data,
			type: WaitlistType.INVESTOR,
			createdAt: new Date(),
		});

		await em.persist(entry).flush();
		return c.json({ success: true, id: entry.id }, 201);
	} else if (type === "sponsor") {
		const result = waitlistSponsorSchema.safeParse(data);
		if (!result.success) {
			return c.json(
				{ error: "Invalid sponsor data", details: result.error.flatten() },
				400
			);
		}

		// Check if email already exists
		const existing = await em.findOne(Waitlist, { email: result.data.email });
		if (existing) {
			return c.json({ error: "This email is already on the waitlist" }, 409);
		}

		const entry = em.create(Waitlist, {
			...result.data,
			type: WaitlistType.SPONSOR,
			createdAt: new Date(),
		});

		await em.persist(entry).flush();
		return c.json({ success: true, id: entry.id }, 201);
	} else {
		return c.json(
			{ error: "Invalid type. Must be 'investor' or 'sponsor'" },
			400
		);
	}
});

// GET /waitlist - Get all waitlist entries (admin only - can add auth later)
waitlist.get("/", async (c) => {
	const em = await getEM();
	const entries = await em.findAll(Waitlist, {
		orderBy: { createdAt: "desc" },
	});
	return c.json(entries);
});

// GET /waitlist/stats - Get waitlist statistics
waitlist.get("/stats", async (c) => {
	const em = await getEM();
	const investors = await em.count(Waitlist, { type: WaitlistType.INVESTOR });
	const sponsors = await em.count(Waitlist, { type: WaitlistType.SPONSOR });
	return c.json({
		total: investors + sponsors,
		investors,
		sponsors,
	});
});

export default waitlist;

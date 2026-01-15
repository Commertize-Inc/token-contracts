import { Hono } from "hono";
import { Contact, ContactType } from "@commertize/data";
import {
	contactInvestorSchema,
	contactSponsorSchema,
} from "@commertize/data/schemas";
import { getEM } from "../db";

const contact = new Hono();

// POST /contact - Add a new contact entry
contact.post("/", async (c) => {
	const em = await getEM();
	const body = await c.req.json();

	const { type, ...data } = body;

	// Validate based on type
	if (type === "investor") {
		const result = contactInvestorSchema.safeParse(data);
		if (!result.success) {
			return c.json(
				{ error: "Invalid investor data", details: result.error.flatten() },
				400
			);
		}

		// Check if email already exists
		const existing = await em.findOne(Contact, { email: result.data.email });
		if (existing) {
			return c.json({ error: "This email is already in our contact list" }, 409);
		}

		const entry = em.create(Contact, {
			...result.data,
			type: ContactType.INVESTOR,
			createdAt: new Date(),
		});

		await em.persist(entry).flush();
		return c.json({ success: true, id: entry.id }, 201);
	} else if (type === "sponsor") {
		const result = contactSponsorSchema.safeParse(data);
		if (!result.success) {
			return c.json(
				{ error: "Invalid sponsor data", details: result.error.flatten() },
				400
			);
		}

		// Check if email already exists
		const existing = await em.findOne(Contact, { email: result.data.email });
		if (existing) {
			return c.json({ error: "This email is already in our contact list" }, 409);
		}

		const entry = em.create(Contact, {
			...result.data,
			type: ContactType.SPONSOR,
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

// GET /contact - Get all contact entries (admin only - can add auth later)
contact.get("/", async (c) => {
	const em = await getEM();
	const entries = await em.findAll(Contact, {
		orderBy: { createdAt: "desc" },
	});
	return c.json(entries);
});

// GET /contact/stats - Get contact statistics
contact.get("/stats", async (c) => {
	const em = await getEM();
	const investors = await em.count(Contact, { type: ContactType.INVESTOR });
	const sponsors = await em.count(Contact, { type: ContactType.SPONSOR });
	return c.json({
		total: investors + sponsors,
		investors,
		sponsors,
	});
});

export default contact;

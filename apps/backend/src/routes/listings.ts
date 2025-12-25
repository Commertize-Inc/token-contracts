import {
	createListingSchema,
	Listing,
	updateListingSchema,
	User,
} from "@commertize/data";
import { ListingStatus, VerificationStatus } from "@commertize/data/enums";
import { Hono } from "hono";
import { getEM } from "../db";
import { apiKeyMiddleware } from "../middleware/apiKey";
import { authMiddleware } from "../middleware/auth";
import { HonoEnv } from "../types";

const listings = new Hono<HonoEnv>();

// listings.ts content below...

listings.get("/", apiKeyMiddleware, async (c) => {
	try {
		const activeStatuses = [
			ListingStatus.ACTIVE,
			ListingStatus.FULLY_FUNDED,
			ListingStatus.TOKENIZING,
		];

		const em = await getEM();
		const listings = await em.find(
			Listing,
			{
				status: { $in: activeStatuses },
			},
			{
				fields: [
					"id",
					"name",
					"address",
					"city",
					"state",
					"zipCode",
					"propertyType",
					"financials",
					"offeringType",
					"status",
					"images",
					"sponsor.id",
					"sponsor.firstName",
					"sponsor.lastName",
					"sponsor.email",
					"sponsor.sponsor.businessName",
					"sponsor.sponsor.status",
				],
				populate: ["sponsor"],
			}
		);

		return c.json(listings);
	} catch (error) {
		console.error("Error fetching listings:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

listings.get("/my-listings", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const listings = await em.find(
			Listing,
			{ sponsor: user },
			{
				orderBy: { createdAt: "DESC" },
			}
		);

		return c.json(listings);
	} catch (error) {
		console.error("Error fetching my listings:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

listings.get("/:id", apiKeyMiddleware, async (c) => {
	try {
		const id = c.req.param("id");

		const em = await getEM();
		const listing = await em.findOne(
			Listing,
			{ id },
			{ populate: ["sponsor"] }
		);

		if (!listing) {
			return c.json({ error: "Listing not found" }, 404);
		}

		return c.json(listing);
	} catch (error) {
		console.error("Error fetching listing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

listings.post("/", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Check if user is a verified sponsor directly
		let listingSponsor = user;

		if (user.sponsor?.status !== VerificationStatus.VERIFIED) {
			// Check if user is a voting member of a verified sponsor
			// querying for a user whose sponsor.votingMembers array contains privyId? No, database stores our internal ID usually.
			// sponsor.votingMembers stores internal user IDs (user.id).

			// We need to find a User (Sponsor Owner) where votingMembers (JSON array) contains user.id
			// JSONB query in Postgres: 'votingMembers @> "userId"' or similar.
			// MikroORM might need raw query or specific syntax for JSON array contains.
			// Ideally we fetch all users who have this user in votingMembers.

			// For simplicity and compatibility, we might need a custom query or strict check.
			const sponsors = await em.find(User, {
				sponsor: {
					votingMembers: { $contains: [user.id] }, // MikroORM syntax for JSONB array contains
					status: VerificationStatus.VERIFIED,
				},
			});

			if (sponsors.length === 0) {
				return c.json(
					{
						error:
							"Only verified sponsors or their team members can create listings.",
					},
					403
				);
			}

			// Use the first sponsor found (MVP restriction: assume user is member of one main sponsor or pick first)
			listingSponsor = sponsors[0];
		}

		const body = await c.req.json();
		const validation = createListingSchema.safeParse(body);

		if (!validation.success) {
			return c.json(
				{ error: "Invalid data", details: validation.error.format() },
				400
			);
		}

		const data = validation.data;

		const listing = new Listing();
		listing.sponsor = listingSponsor;
		listing.status = ListingStatus.PENDING_REVIEW;
		listing.name = data.name;
		listing.address = data.address;
		listing.city = data.city;
		listing.state = data.state;
		listing.zipCode = data.zipCode;
		listing.propertyType = data.propertyType;
		listing.financials = data.financials;
		listing.offeringType = data.offeringType;
		listing.entityStructure = data.entityStructure;
		listing.description = data.description;
		listing.constructionYear = data.constructionYear;
		listing.totalUnits = data.totalUnits;

		// Initialize arrays if provided
		if (data.images) listing.images = data.images;
		if (data.documents) listing.documents = data.documents;
		if (data.highlights) listing.highlights = data.highlights;

		await em.persist(listing).flush();

		return c.json({ success: true, listing });
	} catch (error) {
		console.error("Error creating listing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

listings.patch("/:id", authMiddleware, async (c) => {
	try {
		const id = c.req.param("id");
		const privyId = c.get("userId");

		const em = await getEM();
		const user = await em.findOne(User, { privyId });
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const listing = await em.findOne(
			Listing,
			{ id },
			{ populate: ["sponsor"] }
		);
		if (!listing) {
			return c.json({ error: "Listing not found" }, 404);
		}

		// Ensure the user is the owner (sponsor) of the listing
		if (listing.sponsor.id !== user.id) {
			return c.json(
				{ error: "Unauthorized: You do not own this listing" },
				403
			);
		}

		const body = await c.req.json();
		const validation = updateListingSchema.safeParse(body);

		if (!validation.success) {
			return c.json(
				{ error: "Invalid data", details: validation.error.format() },
				400
			);
		}

		const data = validation.data;

		// Update fields
		if (data.name) listing.name = data.name;
		if (data.address) listing.address = data.address;
		if (data.city) listing.city = data.city;
		if (data.state) listing.state = data.state;
		if (data.zipCode) listing.zipCode = data.zipCode;
		if (data.propertyType) listing.propertyType = data.propertyType;
		if (data.financials) {
			// Merge financials or replace? Schema implies full object replacement if provided, or we can merge.
			// Since schema validates the whole object, replacing is safer to ensure validity.
			// However, updateListingSchema is partial, but the `financials` field in it is likely optional but if present, follows the schema.
			// Wait, createListingSchema.partial() makes `financials` optional, but if present, it must be the full object unless we use deep partial.
			// Zod partial() is shallow. So `financials` must be the full object if provided.
			listing.financials = { ...listing.financials, ...data.financials };
		}
		if (data.offeringType) listing.offeringType = data.offeringType;
		if (data.entityStructure) listing.entityStructure = data.entityStructure;
		if (data.description !== undefined) listing.description = data.description;
		if (data.constructionYear !== undefined)
			listing.constructionYear = data.constructionYear;
		if (data.totalUnits !== undefined) listing.totalUnits = data.totalUnits;
		if (data.images) listing.images = data.images;
		if (data.documents) listing.documents = data.documents;
		if (data.highlights) listing.highlights = data.highlights;

		listing.updatedAt = new Date();

		await em.flush();

		return c.json({ success: true, listing });
	} catch (error) {
		console.error("Error updating listing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

listings.patch("/:id/withdraw", authMiddleware, async (c) => {
	try {
		const id = c.req.param("id");
		const privyId = c.get("userId");

		const em = await getEM();
		const user = await em.findOne(User, { privyId });
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const listing = await em.findOne(
			Listing,
			{ id },
			{ populate: ["sponsor"] }
		);
		if (!listing) {
			return c.json({ error: "Listing not found" }, 404);
		}

		// Ensure the user is the owner (sponsor) of the listing
		if (listing.sponsor.id !== user.id) {
			return c.json(
				{ error: "Unauthorized: You do not own this listing" },
				403
			);
		}

		// Only allow withdrawing if not already actively raising funds or funded?
		// Requirement says "sponsors should also be able to withdraw their listing submissions."
		// Usually this means before it goes live.
		if (
			listing.status === ListingStatus.ACTIVE ||
			listing.status === ListingStatus.FULLY_FUNDED ||
			listing.status === ListingStatus.TOKENIZING
		) {
			return c.json(
				{ error: "Cannot withdraw a listing that is active or funded." },
				400
			);
		}

		listing.status = ListingStatus.WITHDRAWN;
		listing.updatedAt = new Date();

		await em.flush();

		return c.json({ success: true, listing });
	} catch (error) {
		console.error("Error withdrawing listing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});
// Resubmit a withdrawn listing
listings.post("/:id/resubmit", authMiddleware, async (c) => {
	try {
		const id = c.req.param("id");
		const privyId = c.get("userId");

		const em = await getEM();
		const user = await em.findOne(User, { privyId });
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const listing = await em.findOne(
			Listing,
			{ id },
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

		if (listing.status !== ListingStatus.WITHDRAWN) {
			return c.json(
				{ error: "Only withdrawn listings can be resubmitted." },
				400
			);
		}

		listing.status = ListingStatus.PENDING_REVIEW;
		listing.updatedAt = new Date();

		await em.flush();

		return c.json({ success: true, listing });
	} catch (error) {
		console.error("Error resubmitting listing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Delete a listing (only if DRAFT, WITHDRAWN, or REJECTED)
listings.delete("/:id", authMiddleware, async (c) => {
	try {
		const id = c.req.param("id");
		const privyId = c.get("userId");

		const em = await getEM();
		const user = await em.findOne(User, { privyId });
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const listing = await em.findOne(
			Listing,
			{ id },
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

		const allowDeleteStatuses = [
			ListingStatus.DRAFT,
			ListingStatus.WITHDRAWN,
			ListingStatus.REJECTED,
		];

		if (!allowDeleteStatuses.includes(listing.status)) {
			return c.json(
				{
					error:
						"Cannot delete this listing. Only Draft, Withdrawn, or Rejected listings can be deleted.",
				},
				400
			);
		}

		// Hard delete or Soft delete? Assuming Hard delete for now as per "Delete" usually implies cleanup.
		// If there are relations like Dividends, Investments etc. we might have issues.
		// Use em.remove(listing).flush();
		// Given we have potential relations (dividends, etc.), if they exist, this might fail unless cascade is set.
		// For now, simple remove.

		await em.remove(listing).flush();

		return c.json({ success: true });
	} catch (error) {
		console.error("Error deleting listing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});
export default listings;

import { Hono } from "hono";
import { HonoEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { getEM } from "../db";
import { ReviewComment, User, EntityType, Listing } from "@commertize/data"; // Ensure ReviewComment is exported from @commertize/data

const reviews = new Hono<HonoEnv>();

reviews.get("/my-reviews", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// 1. Get User-related comments
		// Because ReviewComment stores entityId as string, we can search by that.
		const userComments = await em.find(
			ReviewComment,
			{
				entityId: user.id,
				entityType: {
					$in: [EntityType.KYC, EntityType.INVESTOR, EntityType.SPONSOR],
				},
				isInternal: false,
			},
			{
				populate: ["author"],
				orderBy: { createdAt: "DESC" },
			}
		);

		// 2. Get Listing-related comments
		// First find user's listings
		const listings = await em.find(Listing, { sponsor: user });
		const listingIds = listings.map((l) => l.id);

		let listingComments: any[] = [];
		if (listingIds.length > 0) {
			listingComments = await em.find(
				ReviewComment,
				{
					entityId: { $in: listingIds },
					entityType: EntityType.LISTING,
					isInternal: false,
				},
				{
					populate: ["author"],
					orderBy: { createdAt: "DESC" },
				}
			);
		}

		const allComments = [...userComments, ...listingComments];
		// Sort again to be sure
		allComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return c.json(allComments);
	} catch (error) {
		console.error("Error fetching reviews:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// POST /reviews - User reply
reviews.post("/", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const { entityType, entityId, content } = await c.req.json();
		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		if (!content || !entityType || !entityId) {
			return c.json({ error: "Missing required fields" }, 400);
		}

		// Verify ownership
		let isOwner = false;
		if (
			entityType === EntityType.KYC ||
			entityType === EntityType.INVESTOR ||
			entityType === EntityType.SPONSOR
		) {
			// For User-embedded entities, entityId should correspond to userId
			if (entityId === user.id) {
				isOwner = true;
			}
		} else if (entityType === EntityType.LISTING) {
			const listing = await em.findOne(
				Listing,
				{ id: entityId },
				{ populate: ["sponsor"] }
			);
			if (listing && listing.sponsor.id === user.id) {
				isOwner = true;
			}
		}

		if (!isOwner) {
			return c.json(
				{
					error:
						"Unauthorized: You can only reply to reviews on your own items.",
				},
				403
			);
		}

		const comment = em.create(ReviewComment, {
			entityType,
			entityId,
			author: user,
			content,
			isInternal: false,
			createdAt: new Date(),
		});

		em.persist(comment);
		await em.flush();

		return c.json({ success: true, comment });
	} catch (error) {
		console.error("Error posting review reply:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default reviews;

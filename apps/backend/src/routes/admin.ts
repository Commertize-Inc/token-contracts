import {
	KycStatus,
	Listing,
	ListingStatus,
	NewsArticle,
	ReviewComment,
	User,
	VerificationStatus,
	EntityType,
	SponsorUpdateRequest,
	SponsorUpdateRequestStatus,
	adminReviewSchema,
} from "@commertize/data";
import { Hono } from "hono";
import { getEM } from "../db";
import { authMiddleware } from "../middleware/auth";
import { HonoEnv } from "../types";
import { NotificationService } from "../services/NotificationService";
import { ListingService } from "../services/ListingService";

const admin = new Hono<HonoEnv>();

admin.use("*", authMiddleware);

// Middleware to check for Admin Role
admin.use("*", async (c, next) => {
	const userId = c.get("userId"); // Privy ID
	const em = await getEM();
	const user = await em.findOne(User, { privyId: userId });

	if (!user || !user.isAdmin) {
		return c.json({ error: "Forbidden: Admin access only" }, 403);
	}
	await next();
});

// POST /admin/import-news
admin.post("/import-news", async (c) => {
	try {
		const { articles } = await c.req.json();

		if (!articles || !Array.isArray(articles)) {
			return c.json({ error: "Articles array is required" }, 400);
		}

		const em = await getEM();
		let imported = 0;
		let skipped = 0;

		// Move loop to separate function or keep inline? Inline is fine for now.
		for (const articleData of articles) {
			const slug =
				articleData.slug ||
				articleData.title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, "");
			const readTime =
				articleData.readTime ||
				Math.ceil(
					(articleData.content?.length || articleData.summary.length) / 1000
				) ||
				3;
			const publishedAt = articleData.publishedAt
				? new Date(articleData.publishedAt)
				: new Date();

			try {
				const existing = await em.findOne(NewsArticle, { slug });
				if (existing) {
					skipped++;
					continue;
				}

				const article = em.create(NewsArticle, {
					slug,
					title: articleData.title,
					summary: articleData.summary,
					content: articleData.content || "",
					category: articleData.category,
					imageUrl: articleData.imageUrl,
					readTime,
					publishedAt,
					isGenerated: articleData.isGenerated ?? false,
					isPublished: articleData.isPublished ?? true,
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				em.persist(article);
				imported++;
			} catch (err) {
				console.error("Error inserting article:", err);
				skipped++;
			}
		}

		await em.flush();

		return c.json({
			success: true,
			imported,
			skipped,
			total: articles.length,
		});
	} catch (error: any) {
		console.error("Import news error:", error);
		return c.json(
			{ error: "Failed to import articles", details: error.message },
			500
		);
	}
});

// GET /admin/submissions
admin.get("/submissions", async (c) => {
	try {
		const em = await getEM();
		const includeFinalized = c.req.query("includeFinalized") === "true";

		// 1. Pending KYC
		const pendingKycUsers = await em.find(
			User,
			includeFinalized ? {} : { kycStatus: KycStatus.PENDING },
			{
				fields: [
					"id",
					"firstName",
					"lastName",
					"email",
					"kycStatus",
					"createdAt",
				],
			}
		);

		// 2. Pending Investor Accreditation
		const pendingInvestorUsers = await em.find(
			User,
			includeFinalized
				? {}
				: { investor: { status: VerificationStatus.PENDING } },
			{
				populate: ["investor"],
			}
		);

		// 3. Pending Sponsor Verification
		const pendingSponsorUsers = await em.find(
			User,
			includeFinalized
				? {}
				: { sponsor: { status: VerificationStatus.PENDING } },
			{
				populate: ["sponsor"],
			}
		);

		// 4. Pending Listings
		const pendingListings = await em.find(
			Listing,
			includeFinalized ? {} : { status: ListingStatus.PENDING_REVIEW },
			{
				populate: ["sponsor"],
				fields: [
					"id",
					"name",
					"propertyType",
					"status",
					"createdAt",
					"sponsor.id",
					"sponsor.members",
				],
			}
		);

		const submissions = [
			...pendingKycUsers.map((u) => ({
				id: u.id,
				type: EntityType.KYC,
				status: u.kycStatus,
				submittedAt: u.createdAt, // Or a specific submission timestamp if tracked
				title: `KYC: ${u.firstName} ${u.lastName}`,
				user: {
					id: u.id,
					email: u.email,
					name: `${u.firstName} ${u.lastName}`,
				},
			})),
			...pendingInvestorUsers
				.filter((u) => u.investor) // Ensure investor profile exists
				.map((u) => ({
					id: u.id, // User ID is the entity ID for Investor profile
					type: EntityType.INVESTOR,
					status: u.investor?.status,
					submittedAt: u.investor?.createdAt, // Use verifiedAt or updatedAt?
					title: `Investor Accreditation: ${u.firstName} ${u.lastName}`,
					user: {
						id: u.id,
						email: u.email,
						name: `${u.firstName} ${u.lastName}`,
					},
					details: {
						accreditationType: u.investor?.accreditationType,
						investorType: u.investor?.type,
						investmentExperience: u.investor?.investmentExperience,
						riskTolerance: u.investor?.riskTolerance,
						liquidNetWorth: u.investor?.liquidNetWorth,
						taxCountry: u.investor?.taxCountry,
						accreditationDocuments: u.investor?.accreditationDocuments,
					},
				})),
			...pendingSponsorUsers
				.filter((u) => u.sponsor) // Ensure sponsor profile exists
				.map((u) => ({
					id: u.id, // User ID is the entity ID for Sponsor profile
					type: EntityType.SPONSOR,
					status: u.sponsor?.status,
					submittedAt: u.sponsor?.createdAt,
					title: `Sponsor Verification: ${u.sponsor?.businessName}`,
					user: {
						id: u.id,
						email: u.email,
						name: `${u.firstName} ${u.lastName}`,
					},
					details: {
						businessName: u.sponsor?.businessName,
						ein: u.sponsor?.ein,
						address: u.sponsor?.address,
						bio: u.sponsor?.bio,
						kybData: u.sponsor?.kybData,
						jobTitle: u.jobTitle, // jobTitle is on User entity
					},
				})),
			...pendingListings.map((l) => ({
				id: l.id,
				type: EntityType.LISTING,
				status: l.status,
				submittedAt: l.createdAt,
				title: `Listing: ${l.name}`,
				user: {
					id: l.sponsor.members[0].id,
				},
			})),
		];

		// usage of sort
		submissions.sort(
			(a: any, b: any) =>
				new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
		);

		return c.json({ submissions });
	} catch (error) {
		console.error("Error fetching submissions:", error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

// POST /admin/submissions/:type/:id/review
admin.post("/submissions/:type/:id/review", async (c) => {
	try {
		const type = c.req.param("type").toUpperCase() as EntityType;
		const id = c.req.param("id");
		const body = await c.req.json();
		const { action, comment } = body;

		if (
			![
				"APPROVE",
				"REJECT",
				"REQUEST_INFO",
				"TOKENIZE",
				"FREEZE",
				"UPDATE_STATUS",
			].includes(action)
		) {
			return c.json({ error: "Invalid action" }, 400);
		}

		const em = await getEM();
		const adminUserId = c.get("userId");
		const adminUser = await em.findOne(User, { privyId: adminUserId });

		if (!adminUser) return c.json({ error: "Admin not found" }, 404);

		let targetEntity: any;

		// 1. Handle Status Updates
		if (type === EntityType.KYC) {
			targetEntity = await em.findOne(User, { id });
			if (!targetEntity) return c.json({ error: "User not found" }, 404);

			if (action === "APPROVE") targetEntity.kycStatus = KycStatus.APPROVED;
			else if (action === "REJECT") targetEntity.kycStatus = KycStatus.REJECTED;
			else if (action === "REQUEST_INFO")
				targetEntity.kycStatus = KycStatus.PENDING;
		} else if (type === EntityType.INVESTOR) {
			targetEntity = await em.findOne(User, { id }, { populate: ["investor"] });
			if (!targetEntity || !targetEntity.investor)
				return c.json({ error: "Investor profile not found" }, 404);

			// For embedded entities, we need to wrap them to ensure MikroORM tracks changes
			if (action === "APPROVE")
				targetEntity.investor.status = VerificationStatus.VERIFIED;
			else if (action === "REJECT")
				targetEntity.investor.status = VerificationStatus.REJECTED;
			else if (action === "REQUEST_INFO")
				targetEntity.investor.status = VerificationStatus.PENDING;

			// Explicitly mark the investor as modified since it's an embedded entity
			em.persist(targetEntity);
		} else if (type === EntityType.SPONSOR) {
			targetEntity = await em.findOne(User, { id }, { populate: ["sponsor"] });
			if (!targetEntity || !targetEntity.sponsor)
				return c.json({ error: "Sponsor profile not found" }, 404);

			if (action === "APPROVE")
				targetEntity.sponsor.status = VerificationStatus.VERIFIED;
			else if (action === "REJECT")
				targetEntity.sponsor.status = VerificationStatus.REJECTED;
			else if (action === "REQUEST_INFO")
				targetEntity.sponsor.status = VerificationStatus.PENDING;
		} else if (type === EntityType.LISTING) {
			const listing = await em.findOne(Listing, { id });
			if (!listing) return c.json({ error: "Listing not found" }, 404);
			targetEntity = listing;

			if (action === "TOKENIZE") targetEntity.status = ListingStatus.TOKENIZING;
			else if (action === "FREEZE") targetEntity.status = ListingStatus.FROZEN;
			else if (action === "UPDATE_STATUS") {
				const { newStatus } = body;
				if (newStatus && Object.values(ListingStatus).includes(newStatus)) {
					targetEntity.status = newStatus;
				} else {
					return c.json({ error: "Invalid status provided" }, 400);
				}
			} else if (action === "APPROVE")
				targetEntity.status = ListingStatus.APPROVED;
			else if (action === "REJECT")
				targetEntity.status = ListingStatus.REJECTED;
			else if (action === "REQUEST_INFO")
				targetEntity.status = ListingStatus.PENDING_REVIEW;
		} else {
			return c.json({ error: "Invalid entity type" }, 400);
		}

		if (targetEntity.updatedAt) targetEntity.updatedAt = new Date(); // Update timestamp

		// 2. Create Comment if provided
		if (comment) {
			const reviewComment = em.create(ReviewComment, {
				entityType: type,
				entityId: id,
				author: adminUser,
				content: comment,
				isInternal: false,
				createdAt: new Date(),
			});

			em.persist(reviewComment);
		}

		// 3. Create Notification
		const notificationService = new NotificationService(em);
		await notificationService.createSubmissionUpdateNotification(
			type,
			action as any,
			targetEntity,
			comment
		);

		// 4. Mint tokens if listing is approved
		if (type === EntityType.LISTING && action === "APPROVE") {
			const listingService = new ListingService(em);
			await listingService.mintPropertyToken(targetEntity);
		}

		em.persist(targetEntity);
		await em.flush();

		return c.json({
			success: true,
			status:
				targetEntity.status ||
				targetEntity.kycStatus ||
				targetEntity.investor?.status ||
				targetEntity.sponsor?.status,
		});
	} catch (error) {
		console.error("Error submitting review:", error);
		// @ts-ignore
		return c.json(
			{
				error: "Internal Server Error",
				details: error ? String(error) : "Unknown error",
			},
			500
		);
	}
});

// GET /admin/sponsor-update-requests
admin.get("/sponsor-update-requests", async (c) => {
	try {
		const em = await getEM();

		const requests = await em.find(
			SponsorUpdateRequest,
			{ status: SponsorUpdateRequestStatus.PENDING },
			{
				populate: ["sponsor", "requestedBy"],
				orderBy: { createdAt: "ASC" },
			}
		);

		const formattedRequests = requests.map((req) => ({
			id: req.id,
			sponsorName: req.sponsor.businessName,
			requestedBy: {
				name: `${req.requestedBy.firstName} ${req.requestedBy.lastName}`,
				email: req.requestedBy.email,
			},
			currentValues: {
				businessName: req.sponsor.businessName,
				businessType: req.sponsor.kybData?.businessType,
				ein: req.sponsor.ein,
				address: req.sponsor.address,
			},
			requestedChanges: req.requestedChanges,
			documents: req.documents,
			createdAt: req.createdAt,
			status: req.status,
		}));

		return c.json({ requests: formattedRequests });
	} catch (error) {
		console.error("Error fetching sponsor update requests:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// POST /admin/sponsor-update-requests/:id/approve
admin.post("/sponsor-update-requests/:id/approve", async (c) => {
	try {
		const requestId = c.req.param("id");
		const body = await c.req.json();
		const result = adminReviewSchema.safeParse(body);

		if (!result.success) {
			return c.json(
				{ error: "Invalid data", details: result.error.format() },
				400
			);
		}

		const { adminNotes } = result.data;
		const em = await getEM();

		const updateRequest = await em.findOne(
			SponsorUpdateRequest,
			{ id: requestId },
			{ populate: ["sponsor", "requestedBy"] }
		);

		if (!updateRequest) {
			return c.json({ error: "Update request not found" }, 404);
		}

		if (updateRequest.status !== SponsorUpdateRequestStatus.PENDING) {
			return c.json({ error: "Only pending requests can be approved" }, 400);
		}

		// Apply the requested changes to the sponsor
		const { businessName, businessType, ein, address } =
			updateRequest.requestedChanges;

		if (businessName) updateRequest.sponsor.businessName = businessName;
		if (ein) updateRequest.sponsor.ein = ein;
		if (address) updateRequest.sponsor.address = address;
		if (businessType) {
			updateRequest.sponsor.kybData = {
				...updateRequest.sponsor.kybData,
				businessType,
			};
		}

		// Update request status
		updateRequest.status = SponsorUpdateRequestStatus.APPROVED;
		if (adminNotes) updateRequest.adminNotes = adminNotes;
		updateRequest.updatedAt = new Date();

		await em.flush();

		// TODO: Send notification to sponsor about approval

		return c.json({ success: true, request: updateRequest });
	} catch (error) {
		console.error("Error approving update request:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// POST /admin/sponsor-update-requests/:id/reject
admin.post("/sponsor-update-requests/:id/reject", async (c) => {
	try {
		const requestId = c.req.param("id");
		const body = await c.req.json();
		const result = adminReviewSchema.safeParse(body);

		if (!result.success) {
			return c.json(
				{ error: "Invalid data", details: result.error.format() },
				400
			);
		}

		const { adminNotes } = result.data;
		const em = await getEM();

		const updateRequest = await em.findOne(
			SponsorUpdateRequest,
			{ id: requestId },
			{ populate: ["sponsor", "requestedBy"] }
		);

		if (!updateRequest) {
			return c.json({ error: "Update request not found" }, 404);
		}

		if (updateRequest.status !== SponsorUpdateRequestStatus.PENDING) {
			return c.json({ error: "Only pending requests can be rejected" }, 400);
		}

		// Update request status
		updateRequest.status = SponsorUpdateRequestStatus.REJECTED;
		if (adminNotes) updateRequest.adminNotes = adminNotes;
		updateRequest.updatedAt = new Date();

		await em.flush();

		// TODO: Send notification to sponsor about rejection with feedback

		return c.json({ success: true, request: updateRequest });
	} catch (error) {
		console.error("Error rejecting update request:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default admin;

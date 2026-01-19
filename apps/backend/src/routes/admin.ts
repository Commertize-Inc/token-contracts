import {
	KycStatus,
	Listing,
	ListingStatus,
	NewsArticle,
	ReviewComment,
	User,
	VerificationStatus,
	EntityType,
	Notification,
	NotificationType,
} from "@commertize/data";
import { z } from "zod";
import { Hono } from "hono";
import { getEM } from "../db";
import { authMiddleware } from "../middleware/auth";
import { HonoEnv } from "../types";
import { NotificationService } from "../services/notification";
import { CONTRACTS, HEDERA_TESTNET_RPC } from "@commertize/nexus";
import { TokenService } from "../services/token";
import { ifError } from "assert";

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
					"address",
					"city",
					"state",
					"zipCode",
					"propertyType",
					"financials",
					"tokenomics",
					"offeringType",
					"entityStructure",
					"description",
					"constructionYear",
					"totalUnits",
					"images",
					"documents",
					"highlights",
					"status",
					"createdAt",
					"sponsor.id",
					"sponsor.businessName",
					"sponsor.members:ref",
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
					submittedAt: u.investor?.createdAt || u.createdAt, // Use verifiedAt or updatedAt?
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
					submittedAt: u.sponsor?.createdAt || u.createdAt,
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
					id: l.sponsor.id,
					email: "N/A", // Sponsor entity doesn't have a single email
					name: l.sponsor.businessName,
				},
				details: {
					...l,
					financials: {
						...l.financials,
						// Add missing derived fields expected by UI if any
						targetRaise: l.tokenomics
							? l.tokenomics.tokensForInvestors * l.tokenomics.tokenPrice
							: 0,
					},
				},
				sponsor: {
					id: l.sponsor.id,
					businessName: l.sponsor.businessName,
				},
			})),
		];

		// usage of sort
		submissions.sort((a: any, b: any) => {
			const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
			const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
			return dateB - dateA;
		});

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
		const { action, comment } = body; // action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO'

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
			const listing = await em.findOne(
				Listing,
				{ id },
				{ populate: ["sponsor", "sponsor.members"] }
			);
			if (!listing) return c.json({ error: "Listing not found" }, 404);
			targetEntity = listing;

			if (action === "TOKENIZE") {
				targetEntity.status = ListingStatus.TOKENIZING;
				try {
					const tokenAddress =
						await TokenService.deployPropertyToken(targetEntity);
					targetEntity.tokenContractAddress = tokenAddress;
					targetEntity.status = ListingStatus.ACTIVE;
				} catch (deployError: any) {
					console.error("Deployment failed:", deployError);
					return c.json(
						{ error: "Deployment failed", details: deployError.message },
						500
					);
				}
			} else if (action === "FREEZE")
				targetEntity.status = ListingStatus.FROZEN;
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
	} catch (error: any) {
		console.error("Error submitting review:", error);
		return c.json(
			{
				error: "Internal Server Error",
				details: error?.message || String(error),
			},
			500
		);
	}
});

// Local schema for admin review
const adminReviewSchema = z.object({
	adminNotes: z.string().optional(),
});

// GET /admin/sponsor-update-requests
admin.get("/sponsor-update-requests", async (c) => {
	try {
		const em = await getEM();

		const notifications = await em.find(
			Notification,
			{
				type: NotificationType.SPONSOR_UPDATE,
			},
			{
				populate: ["user", "user.sponsor"], // populate the user and their sponsor
				orderBy: { createdAt: "ASC" },
			}
		);

		// Filter for pending only (in-memory if JSONB query is hard, or use QB)
		// Assuming low volume, filter in memory
		const pendingRequests = notifications.filter(
			(n) => n.metadata?.status === "PENDING"
		);

		const formattedRequests = pendingRequests.map((req) => {
			const user = req.user;
			if (!user || !user.sponsor) {
				return null;
			}
			const sponsor = user.sponsor;
			return {
				id: req.id,
				sponsorName: sponsor?.businessName || "Unknown",
				requestedBy: {
					name: `${user.firstName} ${user.lastName}`,
					email: user.email,
				},
				currentValues: {
					businessName: sponsor?.businessName,
					businessType: sponsor?.kybData?.businessType,
					ein: sponsor?.ein,
					address: sponsor?.address,
				},
				requestedChanges: req.metadata?.requestedChanges,
				documents: req.metadata?.documents,
				createdAt: req.createdAt,
				status: req.metadata?.status,
			};
		});

		return c.json({
			requests: formattedRequests.filter((req) => req !== null),
		});
	} catch (error) {
		console.error("Error fetching sponsor update requests:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// POST /admin/sponsor-update-requests/:id/approve
admin.post("/sponsor-update-requests/:id/approve", async (c) => {
	try {
		const requestId = c.req.param("id"); // Notification ID
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

		const notification = await em.findOne(
			Notification,
			{ id: requestId },
			{ populate: ["user", "user.sponsor"] }
		);

		if (!notification) {
			return c.json({ error: "Update request not found" }, 404);
		}

		if (notification.type !== NotificationType.SPONSOR_UPDATE) {
			return c.json({ error: "Invalid request type" }, 400);
		}

		if (notification.metadata?.status !== "PENDING") {
			return c.json({ error: "Only pending requests can be approved" }, 400);
		}

		const sponsor = notification.user?.sponsor;
		if (!sponsor) {
			return c.json({ error: "Sponsor profile not found" }, 404);
		}

		// Apply the requested changes to the sponsor
		const { businessName, businessType, ein, address } =
			notification.metadata.requestedChanges || {};

		if (businessName) sponsor.businessName = businessName;
		if (ein) sponsor.ein = ein;
		if (address) sponsor.address = address;
		if (businessType) {
			sponsor.kybData = {
				...sponsor.kybData,
				businessType,
			};
		}

		// Update request status in metadata
		notification.metadata = {
			...notification.metadata,
			status: "APPROVED",
			adminNotes,
		};

		// TODO: Send notification to sponsor about approval

		return c.json({
			success: true,
			request: { id: notification.id, status: "APPROVED" },
		});
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

		const notification = await em.findOne(
			Notification,
			{ id: requestId },
			{ populate: ["user"] }
		);

		if (!notification) {
			return c.json({ error: "Update request not found" }, 404);
		}

		if (notification.type !== NotificationType.SPONSOR_UPDATE) {
			return c.json({ error: "Invalid request type" }, 400);
		}

		if (notification.metadata?.status !== "PENDING") {
			return c.json({ error: "Only pending requests can be rejected" }, 400);
		}

		// Update request status
		notification.metadata = {
			...notification.metadata,
			status: "REJECTED",
			adminNotes,
		};

		await em.flush();

		// TODO: Send notification to sponsor about rejection with feedback

		return c.json({
			success: true,
			request: { id: notification.id, status: "REJECTED" },
		});
	} catch (error) {
		console.error("Error rejecting update request:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// GET /admin/contracts
admin.get("/contracts", async (c) => {
	try {
		return c.json({
			contracts: {
				factory: CONTRACTS.CRETokenFactory,
				identityRegistry: CONTRACTS.CREIdentityRegistry,
				compliance: CONTRACTS.ComplianceRegistry,
			},
			network: {
				rpcUrl: HEDERA_TESTNET_RPC,
				explorerUrl: "https://hashscan.io/testnet", // Hardcoded for now or env
			},
		});
	} catch (error) {
		console.error("Error fetching contracts:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// GET /admin/listings (All listings for management)
admin.get("/listings", async (c) => {
	try {
		const em = await getEM();
		const listings = await em.find(
			Listing,
			{}, // Fetch ALL listings
			{
				populate: ["sponsor"],
				orderBy: { createdAt: "DESC" },
			}
		);
		return c.json({ listings });
	} catch (error) {
		console.error("Error fetching admin listings:", error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

// PATCH /admin/listings/:id (Admin update, e.g. Gas Sponsorship)
admin.patch("/listings/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const { isGasSponsored } = body;

		const em = await getEM();
		const listing = await em.findOne(Listing, { id });

		if (!listing) return c.json({ error: "Listing not found" }, 404);

		// Handle specific admin updates
		if (typeof isGasSponsored === "boolean") {
			listing.isGasSponsored = isGasSponsored;
		}

		await em.flush();

		return c.json({ success: true, listing });
	} catch (error) {
		console.error("Error updating admin listing:", error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

export default admin;

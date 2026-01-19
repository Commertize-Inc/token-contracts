import {
	kybSchema,
	Sponsor,
	User,
	VerificationStatus,
	Notification,
	NotificationType,
} from "@commertize/data";
import { z } from "zod";
import { Hono } from "hono";
import { getEM } from "../db";
import { authMiddleware } from "../middleware/auth";
import { HonoEnv } from "../types";

const sponsor = new Hono<HonoEnv>();

sponsor.use("*", authMiddleware);

// POST /sponsor/kyb/submit
sponsor.post("/kyb/submit", async (c) => {
	try {
		const userId = c.get("userId");
		const body = await c.req.json();
		const result = kybSchema.safeParse(body);

		if (!result.success) {
			return c.json(
				{ error: "Invalid Data", details: result.error.format() },
				400
			);
		}

		const { businessName, bio, ...kybData } = result.data;
		const em = await getEM();
		const user = await em.findOne(
			User,
			{ privyId: userId },
			{ populate: ["sponsor"] }
		);

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Logic removed: Do not upgrade role immediately. Wait for admin/manual approval.
		// if (user.role === UserRole.INVESTOR) {
		// 	user.role = UserRole.SPONSOR_INVESTOR;
		// } else if (user.role === UserRole.ADMIN) {
		// 	// Admins keep admin role
		// } else if (user.role !== UserRole.SPONSOR_INVESTOR) {
		// 	user.role = UserRole.SPONSOR;
		// }

		// Check if already verified or pending
		if (user.sponsor) {
			const status = user.sponsor.status;
			if (
				status === VerificationStatus.VERIFIED ||
				status === VerificationStatus.PENDING
			) {
				return c.json(
					{ error: "Application is already being processed or verified." },
					409
				);
			}
		}

		// Check for duplicate EIN
		if (kybData.ein) {
			const existingSponsorWithEin = await em.findOne(Sponsor, {
				ein: kybData.ein,
			});

			// If a sponsor exists with this EIN, and it's NOT the current user's sponsor (in case of re-submission/update of same draft)
			if (
				existingSponsorWithEin &&
				existingSponsorWithEin.id !== user.sponsor?.id
			) {
				return c.json(
					{
						error:
							"This EIN is already registered. Please ask the organization owner to add you as a member.",
					},
					409
				);
			}
		}

		let sponsor: Sponsor;
		if (!user.sponsor) {
			sponsor = em.create(Sponsor, {
				businessName: businessName,
				status: VerificationStatus.PENDING,
				votingMembers: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		} else {
			sponsor = user.sponsor;
		}

		// Update sponsor properties
		sponsor.businessName = businessName;
		if (kybData.ein) sponsor.ein = kybData.ein;
		if (kybData.address) sponsor.address = kybData.address;
		if (bio) sponsor.bio = bio;
		if (result.data.walletAddress)
			sponsor.walletAddress = result.data.walletAddress;
		sponsor.kybData = kybData;
		sponsor.status = VerificationStatus.PENDING;
		sponsor.updatedAt = new Date();

		// Persist sponsor first so it has a valid ID in the database
		await em.persistAndFlush(sponsor);

		// Now assign the persisted sponsor to the user
		user.sponsor = sponsor;
		await em.persistAndFlush(user);

		return c.json({ success: true, status: sponsor.status });
	} catch (error) {
		console.error("Error submitting KYB:", error);
		if (error instanceof Error) {
			console.error("Stack:", error.stack);
		}
		return c.json(
			{
				error: "Internal Server Error",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500
		);
	}
});

// Fetch full sponsor status
sponsor.get("/status", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();

		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		if (!user.sponsor) {
			return c.json({ status: "bg_check_required" }); // Or some other indicator
		}

		// populate member details
		let members: any[] = [];
		if (user.sponsor.votingMembers && user.sponsor.votingMembers.length > 0) {
			const memberUsers = await em.find(User, {
				id: { $in: user.sponsor.votingMembers },
			});
			members = memberUsers.map((u) => ({
				id: u.id,
				firstName: u.firstName,
				lastName: u.lastName,
				email: u.email,
				avatarUrl: u.avatarUrl,
			}));
		}

		return c.json({ ...user.sponsor, votingMembersDetails: members });
	} catch (error) {
		console.error("Error fetching sponsor status:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Update sponsor profile (bio only - critical fields require verification)
sponsor.patch("/profile", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();

		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user || !user.sponsor) {
			return c.json({ error: "Sponsor profile not found" }, 404);
		}

		const body = await c.req.json();

		// Only allow bio updates through this endpoint
		// Critical fields (businessName, ein, address, businessType) require verification
		if (
			body.businessName ||
			body.address ||
			body.ein ||
			body.businessType ||
			body.documents
		) {
			return c.json(
				{
					error:
						"Critical fields require verification. Please use the update request endpoint.",
				},
				400
			);
		}

		if (body.bio !== undefined) {
			user.sponsor.bio = body.bio;
		}

		await em.flush();

		return c.json({ success: true, sponsor: user.sponsor });
	} catch (error) {
		console.error("Error updating profile:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Add a voting member
sponsor.post("/members", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user || !user.sponsor) {
			return c.json({ error: "Only sponsors can add members" }, 403);
		}

		const { email } = await c.req.json();
		if (!email) {
			return c.json({ error: "Email is required" }, 400);
		}

		const memberUser = await em.findOne(User, { email });
		if (!memberUser) {
			return c.json({ error: "User with this email not found" }, 404);
		}

		if (memberUser.id === user.id) {
			return c.json({ error: "Cannot add yourself as a member" }, 400);
		}

		if (user.sponsor.votingMembers.includes(memberUser.id)) {
			return c.json({ error: "User is already a member" }, 400);
		}

		user.sponsor.votingMembers.push(memberUser.id);
		await em.flush();

		return c.json({
			success: true,
			member: {
				id: memberUser.id,
				firstName: memberUser.firstName,
				lastName: memberUser.lastName,
				email: memberUser.email,
				avatarUrl: memberUser.avatarUrl,
			},
		});
	} catch (error) {
		console.error("Error adding member:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Remove a voting member
sponsor.delete("/members/:id", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const memberIdToRemove = c.req.param("id");
		const em = await getEM();
		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user || !user.sponsor) {
			return c.json({ error: "Only sponsors can remove members" }, 403);
		}

		if (!user.sponsor.votingMembers.includes(memberIdToRemove)) {
			return c.json({ error: "Member not found in your team" }, 404);
		}

		user.sponsor.votingMembers = user.sponsor.votingMembers.filter(
			(id) => id !== memberIdToRemove
		);
		await em.flush();

		return c.json({ success: true });
	} catch (error) {
		console.error("Error removing member:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Local schema for sponsor update
const sponsorUpdateRequestSchema = z.object({
	businessName: z.string().optional(),
	businessType: z.string().optional(),
	ein: z.string().optional(),
	address: z.string().optional(),
	documents: z.array(z.string()).optional(),
});

// Create a sponsor update request (as a Notification)
sponsor.post("/profile/update-request", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();

		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user || !user.sponsor) {
			return c.json({ error: "Sponsor profile not found" }, 404);
		}

		const body = await c.req.json();
		const result = sponsorUpdateRequestSchema.safeParse(body);

		if (!result.success) {
			return c.json(
				{ error: "Invalid data", details: result.error.format() },
				400
			);
		}

		const { documents, ...requestedChanges } = result.data;

		// Ensure at least one critical field is being updated
		if (Object.keys(requestedChanges).length === 0) {
			return c.json({ error: "No critical fields provided for update" }, 400);
		}

		// Check if there's already a *pending* request (Notification)
		// We can't easily query JSONB metadata safely across all drivers/versions in one go via criteria,
		// but we can find all SPONSOR_UPDATE notifications for this user and filter in memory since volume is low.
		const existingNotifications = await em.find(Notification, {
			user: user,
			type: NotificationType.SPONSOR_UPDATE,
		});

		const pendingRequest = existingNotifications.find(
			(n) => n.metadata?.status === "PENDING"
		);

		if (pendingRequest) {
			return c.json(
				{
					error:
						"You already have a pending update request. Please wait for it to be reviewed or cancel it first.",
				},
				409
			);
		}

		const metadata = {
			status: "PENDING",
			sponsorId: user.sponsor.id,
			requestedChanges,
			documents: documents || [],
		};

		const notification = em.create(Notification, {
			user: user,
			type: NotificationType.SPONSOR_UPDATE,
			title: `Sponsor Profile Update Request`,
			message: `Request to update profile for ${user.sponsor.businessName}`,
			metadata,
			isRead: false,
			createdAt: new Date(),
		});

		await em.persistAndFlush(notification);

		// TODO: Real-time alert to admins?

		return c.json({
			success: true,
			requestId: notification.id,
			status: "PENDING",
		});
	} catch (error) {
		console.error("Error creating update request:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Get all update requests for the current sponsor
sponsor.get("/update-requests", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();

		const user = await em.findOne(User, { privyId }); // user is the requester

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const notifications = await em.find(
			Notification,
			{
				user: user,
				type: NotificationType.SPONSOR_UPDATE,
			},
			{ orderBy: { createdAt: "DESC" } }
		);

		// Format them to look like requests
		const requests = notifications.map((n) => ({
			id: n.id,
			status: n.metadata?.status || "UNKNOWN",
			requestedChanges: n.metadata?.requestedChanges || {},
			documents: n.metadata?.documents || [],
			adminNotes: n.metadata?.adminNotes,
			createdAt: n.createdAt,
		}));

		return c.json(requests);
	} catch (error) {
		console.error("Error fetching update requests:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Cancel a pending update request
sponsor.delete("/update-requests/:id", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const requestId = c.req.param("id"); // This is now the Notification ID
		const em = await getEM();

		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const notification = await em.findOne(Notification, {
			id: requestId,
			user: user,
			type: NotificationType.SPONSOR_UPDATE,
		});

		if (!notification) {
			return c.json({ error: "Update request not found" }, 404);
		}

		if (notification.metadata?.status !== "PENDING") {
			return c.json({ error: "Only pending requests can be cancelled" }, 400);
		}

		// Update status to CANCELLED in metadata
		notification.metadata = {
			...notification.metadata,
			status: "CANCELLED",
		};

		// Optionally mark read
		notification.isRead = true;

		await em.flush();

		return c.json({ success: true });
	} catch (error) {
		console.error("Error cancelling update request:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Request to delete the sponsor organization
sponsor.delete("/", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user || !user.sponsor) {
			return c.json({ error: "Sponsor profile not found" }, 404);
		}

		// Check if user is an owner/admin of the sponsor (assuming all voting members have rights for now, or check organizationRole)
		// For stricter control, we could check if user.id is in user.sponsor.votingMembers
		if (!user.sponsor.votingMembers.includes(user.id)) {
			return c.json(
				{ error: "You do not have permission to delete this organization." },
				403
			);
		}

		// Check for active listings
		const activeListingsCount = await em.count("Listing", {
			sponsor: user.sponsor,
			status: {
				$in: ["ACTIVE", "FULLY_FUNDED", "PENDING_REVIEW", "APPROVED"],
			},
		});

		if (activeListingsCount > 0) {
			return c.json(
				{
					error:
						"Cannot delete organization with active, approved, or pending listings. Please withdraw or transfer them first.",
				},
				400
			);
		}

		// Check if there is already a pending deletion request
		const existingNotifications = await em.find(Notification, {
			user: user,
			type: NotificationType.SPONSOR_DELETE_REQUEST,
		});

		const pendingRequest = existingNotifications.find(
			(n) => n.metadata?.status === "PENDING"
		);

		if (pendingRequest) {
			return c.json(
				{
					error: "A deletion request is already pending.",
				},
				409
			);
		}

		// Create deletion request notification
		const notification = em.create(Notification, {
			user: user,
			type: NotificationType.SPONSOR_DELETE_REQUEST,
			title: `Sponsor Deletion Request`,
			message: `Request to delete organization: ${user.sponsor.businessName}`,
			metadata: {
				status: "PENDING",
				sponsorId: user.sponsor.id,
				reason: "User requested deletion",
			},
			isRead: false,
			createdAt: new Date(),
		});

		await em.persistAndFlush(notification);

		return c.json({
			success: true,
			message: "Deletion request submitted to admins.",
		});
	} catch (error) {
		console.error("Error requesting sponsor deletion:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default sponsor;

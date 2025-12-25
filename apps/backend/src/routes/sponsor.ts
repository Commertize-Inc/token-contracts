import {
	kybSchema,
	Sponsor,
	User,
	VerificationStatus,
	SponsorUpdateRequest,
	SponsorUpdateRequestStatus,
	sponsorUpdateRequestSchema,
} from "@commertize/data";
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

// Create a sponsor update request for critical fields
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

		// Check if there's already a pending request
		const existingRequest = await em.findOne(SponsorUpdateRequest, {
			sponsor: user.sponsor,
			status: SponsorUpdateRequestStatus.PENDING,
		});

		if (existingRequest) {
			return c.json(
				{
					error:
						"You already have a pending update request. Please wait for it to be reviewed or cancel it first.",
				},
				409
			);
		}

		const updateRequest = em.create(SponsorUpdateRequest, {
			sponsor: user.sponsor,
			requestedBy: user,
			requestedChanges,
			documents: documents || [],
			status: SponsorUpdateRequestStatus.PENDING,
		});

		await em.persistAndFlush(updateRequest);

		// TODO: Send notification to admins

		return c.json({
			success: true,
			requestId: updateRequest.id,
			status: updateRequest.status,
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

		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user || !user.sponsor) {
			return c.json({ error: "Sponsor profile not found" }, 404);
		}

		const requests = await em.find(
			SponsorUpdateRequest,
			{ sponsor: user.sponsor },
			{ populate: ["requestedBy"], orderBy: { createdAt: "DESC" } }
		);

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
		const requestId = c.req.param("id");
		const em = await getEM();

		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user || !user.sponsor) {
			return c.json({ error: "Sponsor profile not found" }, 404);
		}

		const updateRequest = await em.findOne(
			SponsorUpdateRequest,
			{ id: requestId, sponsor: user.sponsor },
			{ populate: ["sponsor"] }
		);

		if (!updateRequest) {
			return c.json({ error: "Update request not found" }, 404);
		}

		if (updateRequest.status !== SponsorUpdateRequestStatus.PENDING) {
			return c.json({ error: "Only pending requests can be cancelled" }, 400);
		}

		updateRequest.status = SponsorUpdateRequestStatus.CANCELLED;
		await em.flush();

		return c.json({ success: true });
	} catch (error) {
		console.error("Error cancelling update request:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default sponsor;

import {
	AccreditationType,
	BankAccount,
	Investor,
	InvestorType,
	KycStatus,
	User,
	UserRole,
	VerificationStatus,
} from "@commertize/data";
import { Hono } from "hono";
import { getEM } from "../db";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { HonoEnv } from "../types";
import { OnboardingService } from "../services/OnboardingService";

const onboarding = new Hono<HonoEnv>();

onboarding.get("/status", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const service = new OnboardingService(em);

		const status = await service.getUserStatus(privyId);

		// Map DTO
		// TODO: Move DTO mapping to service or keep in controller?
		// Keeping here for now to match exact response structure without changing frontend contract too much yet.
		const { user, sponsor, investorQuestionnaire } = status;

		return c.json({
			kycStatus: status.kycStatus,
			hasBankAccount: status.hasBankAccount,
			isAdmin: status.isAdmin,
			role: status.role,
			sponsor: sponsor
				? {
						id: user.id,
						businessName: sponsor.businessName,
						status: sponsor.status,
						ein: sponsor.ein,
						address: sponsor.address,
						bio: sponsor.bio,
						kybData: sponsor.kybData,
						jobTitle: user.jobTitle,
						createdAt: sponsor.createdAt,
					}
				: null,
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				phoneNumber: user.phoneNumber,
				bio: user.bio,
				avatarUrl: user.avatarUrl,
				username: user.username,
			},
			investorQuestionnaire: investorQuestionnaire
				? {
						accreditationType: investorQuestionnaire.accreditationType,
						accreditationDocuments:
							investorQuestionnaire.accreditationDocuments || [],
						status: investorQuestionnaire.status,
						type: investorQuestionnaire.type,
						investmentExperience: investorQuestionnaire.investmentExperience,
						riskTolerance: investorQuestionnaire.riskTolerance,
						liquidNetWorth: investorQuestionnaire.liquidNetWorth,
						taxCountry: investorQuestionnaire.taxCountry,
						createdAt: investorQuestionnaire.createdAt,
					}
				: null,
		});
	} catch (e) {
		console.error("Error checking KYC status:", e);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

onboarding.post("/profile", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const body = await c.req.json();
		const em = await getEM();
		const service = new OnboardingService(em);

		const user = await service.updateUserProfile(privyId, body);

		return c.json({ success: true, user });
	} catch (error: any) {
		console.error("Error updating profile:", error);
		if (error.message === "Username already taken") {
			return c.json({ error: "Username already taken" }, 409);
		}
		if (error.message === "User not found") {
			return c.json({ error: "User not found" }, 404);
		}
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Simulating approval for now
onboarding.post("/submit", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		let user = await em.findOne(User, { privyId });

		if (!user) {
			user = em.create(User, {
				privyId,
				createdAt: new Date(),
				updatedAt: new Date(),
				kycStatus: KycStatus.NOT_STARTED,
				isAdmin: false,
			});
		}

		// Auto-approve for now
		user.kycStatus = KycStatus.APPROVED;
		await em.persist<User>(user).flush();

		return c.json({ success: true });
	} catch (error) {
		console.error("Error submitting KYC:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

onboarding.post("/questionnaire", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const body = await c.req.json();
		const em = await getEM();
		const service = new OnboardingService(em);

		// Map body to service DTO
		const {
			investmentExperience,
			riskTolerance,
			liquidNetWorth,
			taxCountry,
			accreditationType,
			documents,
		} = body;

		await service.updateInvestorProfile(privyId, {
			investmentExperience,
			riskTolerance,
			liquidNetWorth,
			taxCountry,
			accreditationType,
			documents: documents || body.documents,
		});

		return c.json({ success: true });
	} catch (error: any) {
		console.error("Error submitting questionnaire:", error);
		if (error.message?.includes("already being processed")) {
			return c.json({ error: error.message }, 409);
		}
		return c.json(
			{ error: "Internal server error", details: String(error) },
			500
		);
	}
});

onboarding.patch("/questionnaire", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const body = await c.req.json();
		const em = await getEM();
		const service = new OnboardingService(em);

		// Similar to POST, but relies on update logic.
		// TODO: Strictly separation patching vs creating?
		// For now, reuse same service method as it handles "Update or Create but only if allowed".

		await service.updateInvestorProfile(privyId, body);

		return c.json({ success: true });
	} catch (error: any) {
		console.error("Error updating questionnaire:", error);
		if (error.message?.includes("already being processed")) {
			return c.json({ error: error.message }, 409);
		}
		return c.json(
			{ error: "Internal server error", details: String(error) },
			500
		);
	}
});

// GET /onboarding/check-username?username=...
onboarding.get("/check-username", optionalAuthMiddleware, async (c) => {
	try {
		const username = c.req.query("username");
		const privyId = c.get("userId"); // May be undefined if unauthenticated

		if (!username || username.length < 3) {
			return c.json({
				available: false,
				error: "Username too short. Must be at least 3 characters long.",
			});
		}

		const em = await getEM();

		// Check if username exists
		const existingUser = await em.findOne(User, { username });

		if (!existingUser) {
			return c.json({ available: true });
		}

		// If user found, check if it's the *current* user
		if (privyId) {
			const currentUser = await em.findOne(User, { privyId });
			if (currentUser && currentUser.id === existingUser.id) {
				return c.json({ available: true });
			}
		}

		return c.json({ available: false });
	} catch (error) {
		console.error("Error checking username:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default onboarding;

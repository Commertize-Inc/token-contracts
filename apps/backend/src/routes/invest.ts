import {
	Investment,
	InvestmentStatus,
	KycStatus,
	Listing,
	ListingStatus,
	User,
	investIntentSchema,
} from "@commertize/data";
import { Hono } from "hono";
import { getEM } from "../db";
import { authMiddleware } from "../middleware/auth";

import {
	AccreditationVerificationMethod,
	OfferingType,
} from "@commertize/data";
import { LockMode } from "@mikro-orm/core";
import { subDays } from "date-fns";
import { HonoEnv } from "../types";

const invest = new Hono<HonoEnv>();

invest.use("*", authMiddleware);

// POST /invest/intent
invest.post("/intent", async (c) => {
	try {
		const userId = c.get("userId");
		const body = await c.req.json();
		const validation = investIntentSchema.safeParse(body);

		if (!validation.success) {
			return c.json({ error: validation.error.format() }, 400);
		}

		const { propertyId, amount } = validation.data;
		const em = await getEM();

		// 1. Load User & Check Compliance
		const user = await em.findOne(
			User,
			{ privyId: userId }, // Hono authMiddleware sets privyId as userId
			{ populate: ["investor"] }
		);

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		if (user.kycStatus !== KycStatus.APPROVED) {
			return c.json(
				{ error: "KYC Compliance Failed: User is not verified" },
				403
			);
		}

		// Accreditation check is now conditional on Property.offeringType inside the transaction or before it.
		// We'll move strict checks inside, but basic existence check remains.
		if (!user.investor?.accreditationType) {
			return c.json(
				{
					error: "Accreditation Required: User must be an accredited investor",
				},
				403
			);
		}

		// 2. Transactional Block for Investment
		try {
			const result = await em.transactional(async (txEm) => {
				// Lock Property Row to prevent race conditions on funding limits
				const property = await txEm.findOne(
					Listing,
					{ id: propertyId },
					{ lockMode: LockMode.PESSIMISTIC_WRITE }
				);

				if (!property) {
					throw new Error("Property not found");
				}

				if (property.status !== ListingStatus.ACTIVE) {
					throw new Error("Property is not active for investment");
				}

				// REGULATORY COMPLIANCE CHECK
				// If offering is 506(c), we need Proof of Accreditation (not just self-cert)
				if (property.offeringType === OfferingType.RULE_506_C) {
					const investor = user.investor!; // verified above
					if (
						!investor.verificationMethod ||
						investor.verificationMethod ===
						AccreditationVerificationMethod.SELF_CERTIFICATION
					) {
						throw new Error(
							"Regulatory Compliance: This offering (Reg D 506c) requires third-party verification of accreditation. Self-certification is insufficient."
						);
					}

					// Check recency (e.g. within last 90 days)
					const ninetyDaysAgo = subDays(new Date(), 90);
					if (
						!investor.verifiedAt ||
						new Date(investor.verifiedAt) < ninetyDaysAgo
					) {
						throw new Error(
							"Regulatory Compliance: Accreditation verification must be within the last 90 days for 506(c) offerings."
						);
					}
				}
				// If 506(b), existence of accreditationType (Self-Cert) is sufficient (checked above)

				// Calculate Current Funding
				const investments = await txEm.find(Investment, {
					property,
					status: {
						$in: [InvestmentStatus.PENDING, InvestmentStatus.COMPLETED],
					},
				});

				const currentFunding = investments.reduce(
					(sum: number, inv: Investment) => sum + parseFloat(inv.amountUsdc),
					0
				);
				const targetRaise = property.financials.equityRequired;
				const remaining = targetRaise - currentFunding;

				if (amount > remaining) {
					throw new Error(
						`Investment exceeds remaining allocation. Remaining: ${remaining}`
					);
				}

				// Create Investment
				const investment = txEm.create(Investment, {
					user,
					property,
					amountUsdc: amount.toString(),
					tokenCount: Math.floor(amount / property.tokenomics.tokenPrice),
					status: InvestmentStatus.PENDING,
					agreedToTermsAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				await txEm.persist(investment).flush();

				// Check if fully funded
				if (currentFunding + amount >= targetRaise) {
					property.status = ListingStatus.FULLY_FUNDED;
					// txEm auto-persists changes to managed entities on commit/flush
				}

				return investment;
			});

			return c.json(
				{
					investmentId: result.id,
					status: result.status,
					paymentInstructions: {
						method: "USDC",
						address: "0xProtocolWalletAddress...", // Mock
					},
				},
				201
			);
		} catch (txError: any) {
			const errorMessage = txError.message || "Transaction failed";
			if (
				errorMessage.includes("Property not found") ||
				errorMessage.includes("Property is not active")
			) {
				return c.json({ error: errorMessage }, 400);
			}
			if (errorMessage.includes("exceeds remaining allocation")) {
				return c.json({ error: errorMessage }, 409);
			}
			throw txError; // Re-throw to outer catch for 500
		}
	} catch (error) {
		console.error("Error processing investment:", error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

// GET /invest/holdings
invest.get("/holdings", async (c) => {
	try {
		const userId = c.get("userId");
		const em = await getEM();

		const user = await em.findOne(User, { privyId: userId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const investments = await em.find(
			Investment,
			{ user: user.id },
			{
				populate: ["property"],
				orderBy: { createdAt: "DESC" },
			}
		);

		return c.json(
			investments.map((inv) => ({
				id: inv.id,
				amountUsdc: inv.amountUsdc,
				tokenCount: inv.tokenCount,
				status: inv.status,
				createdAt: inv.createdAt,
				property: {
					id: inv.property.id,
					name: inv.property.name,
					tokenContractAddress: inv.property.tokenContractAddress,
				},
			}))
		);
	} catch (error) {
		console.error("Error fetching holdings:", error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

export default invest;

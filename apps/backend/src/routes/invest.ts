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
import { USDC_ADDRESS, getWallet } from "@commertize/nexus";
import { LockMode } from "@mikro-orm/core";
import { subDays } from "date-fns";
import { HonoEnv } from "../types";
import { TokenService } from "../services/token";

import { PriceService } from "../services/price";

const invest = new Hono<HonoEnv>();

invest.use("*", authMiddleware);

// POST /invest/quote - Get Conversion Rate
invest.post("/quote", async (c) => {
	try {
		const body = await c.req.json();
		const { amount, currency } = body; // amount in USD

		if (!amount || !currency) {
			return c.json({ error: "Missing amount or currency" }, 400);
		}

		const rate = await PriceService.getRate(currency);
		const cryptoAmount = await PriceService.convertFromUsd(
			parseFloat(amount),
			currency
		);

		return c.json({
			currency,
			amountUsd: amount,
			rate,
			cryptoAmount,
			expiration: Date.now() + 300000, // 5 minutes
		});
	} catch (error: any) {
		return c.json({ error: error.message }, 400);
	}
});

// POST /invest/intent
invest.post("/intent", async (c) => {
	try {
		const userId = c.get("userId");
		const body = await c.req.json();
		// Schema likely needs update to accept currency, or we just parse it manually for now as schema might strip it
		// Assuming body has { propertyId, amount, currency? }
		const { propertyId, amount, currency = "USD" } = body;

		// Basic validation since schema might lag behind
		if (!propertyId || !amount) {
			return c.json({ error: "Missing propertyId or amount" }, 400);
		}

		console.log(
			`Intent: User ${userId} investing ${amount} ${currency} in ${propertyId}`
		);

		const em = await getEM();

		// 1. Load User & Check Compliance
		const user = await em.findOne(
			User,
			{ privyId: userId },
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

		// 2. Transactional Block for Investment
		try {
			const result = await em.transactional(async (txEm) => {
				const property = await txEm.findOne(
					Listing,
					{ id: propertyId },
					{ lockMode: LockMode.PESSIMISTIC_WRITE }
				);

				if (!property) throw new Error("Property not found");
				if (property.status !== ListingStatus.ACTIVE)
					throw new Error("Property is not active");

				// Race Condition Handling:
				// Count COMPLETED (actually sold)
				// Count PENDING only if created recently (reservation window, e.g. 15 mins)
				// This prevents dead "pending" entries from blocking for eternity.
				const reservationWindow = new Date(Date.now() - 15 * 60 * 1000); // 15 mins ago

				// Simple checking of funding
				const investments = await txEm.find(Investment, {
					property,
					$or: [
						{ status: InvestmentStatus.COMPLETED },
						{
							status: InvestmentStatus.PENDING,
							createdAt: { $gte: reservationWindow },
						},
					],
				});

				// Sum using new 'amount' field (assuming 1:1 value for simplicity or stored in USD equivalent)
				const currentFunding = investments.reduce(
					(sum: number, inv: Investment) => sum + parseFloat(inv.amount),
					0
				);
				const targetRaise = property.financials.equityRequired;

				// Ensure amount is in USD equivalent for check (Assuming 1 HBAR != 1 USD, but for this MVP dealing with Stablecoin 1:1)
				// TODO: Rate conversion for HBAR
				if (currentFunding + amount > targetRaise) {
					throw new Error(`Investment exceeds remaining allocation.`);
				}

				// Create Investment
				const investment = txEm.create(Investment, {
					user,
					property,
					amount: amount.toString(), // Renamed from amountUsdc
					currency: currency, // New Field
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
				}

				return investment;
			});

			// Determine Payment Flow
			let paymentFlow = "direct_transfer"; // Default for HBAR or non-sponsored
			const isOfficialUSDC =
				USDC_ADDRESS.toLowerCase() ===
				"0x0000000000000000000000000000000000068cda".toLowerCase();

			if (currency === "HBAR") {
				paymentFlow = "direct_transfer"; // Native send
			} else {
				// Stablecoins (USDC / CREUSD)
				if (result.property.isGasSponsored && !isOfficialUSDC) {
					paymentFlow = "permit"; // CREUSD + Sponsored
				} else if (result.property.isGasSponsored && isOfficialUSDC) {
					paymentFlow = "approve"; // USDC + Sponsored
				} else {
					paymentFlow = "direct_transfer"; // User pays gas (e.g. standard transfer)
				}
			}

			return c.json(
				{
					investmentId: result.id,
					status: result.status,
					paymentFlow: paymentFlow,
					gasSponsorship: result.property.isGasSponsored,
					currency: currency,
					paymentInstructions: {
						method: currency,
						address: getWallet().address, // Backend Wallet (Receiver)
					},
				},
				201
			);
		} catch (txError: any) {
			console.error("Tx Error", txError);
			return c.json({ error: txError.message || "Transaction failed" }, 400);
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
		if (!user) return c.json({ error: "User not found" }, 404);

		const investments = await em.find(
			Investment,
			{ user: user.id },
			{ populate: ["property"], orderBy: { createdAt: "DESC" } }
		);

		return c.json(
			investments.map((inv) => ({
				id: inv.id,
				amount: inv.amount, // Renamed
				currency: inv.currency, // New
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

// POST /invest/:id/confirm
invest.post("/:id/confirm", async (c) => {
	try {
		const investmentId = c.req.param("id");
		const userId = c.get("userId");
		const body = await c.req.json().catch(() => ({}));
		const em = await getEM();

		const user = await em.findOne(
			User,
			{ privyId: userId },
			{ populate: ["investor"] }
		);
		if (!user) return c.json({ error: "User not found" }, 404);

		const investment = await em.findOne(
			Investment,
			{ id: investmentId },
			{ populate: ["property", "user"] }
		);
		if (!investment) return c.json({ error: "Investment not found" }, 404);

		if (investment.status !== InvestmentStatus.PENDING) {
			return c.json({ error: "Investment is not pending" }, 400);
		}
		if (!investment.property.tokenContractAddress) {
			return c.json({ error: "Property not tokenized yet" }, 400);
		}
		if (!user.walletAddress) {
			return c.json({ error: "User wallet address required for minting" }, 400);
		}

		console.log(
			`Confirming Investment ${investment.id} (${investment.currency})`
		);

		// Payment Handling
		if (investment.currency === "HBAR") {
			// HBAR: Expect txHash
			const txHash = body.txHash;
			if (!txHash)
				return c.json(
					{ error: "Transaction Hash required for HBAR payment" },
					400
				);

			// Verify Native Transfer
			// Ideally we fetch the TX from Mirror Node to verify amount
			// const txData = await MirrorNode.getTransaction(txHash);
			// const isValid = await PriceService.validateTransactionValue(txData.amount, parseFloat(investment.amount), "HBAR");
			// if (!isValid) throw new Error("Payment amount mismatch");

			// For MVP, we trust the hash exists and log it.
			// TODO: Mirror Node Integration

			console.log(`HBAR Payment claimed: ${txHash}`);
		} else {
			// Token (USDC/CREUSD)
			if (investment.property.isGasSponsored) {
				if (body.permit) {
					await TokenService.executeGaslessInvestment(
						user.walletAddress,
						parseFloat(investment.amount),
						body.permit
					);
				} else if (body.paymentFlow === "approve") {
					// Backend executes transferFrom
					console.log(`Using Sponsored Approve Flow`);
					// await TokenService.executeTransferFrom(...)
				}
			} else {
				// Unsponsored
				const txHash = body.txHash;
				if (!txHash) return c.json({ error: "Transaction Hash required" }, 400);
				console.log(`Direct Token Payment claimed: ${txHash}`);
			}
		}

		// Compliance Check: Ensure User is Verified On-Chain
		if (user.kycStatus !== KycStatus.APPROVED) {
			return c.json(
				{ error: "User must be KYC approved to complete investment" },
				403
			);
		}

		const isVerified = await TokenService.isVerified(user.walletAddress);
		if (!isVerified) {
			console.log(
				`User ${user.id} not verified on-chain. Registering identity...`
			);
			// Default logic matches onboarding.ts
			const country = user.investor?.taxCountry === "US" ? 840 : 0;
			await TokenService.registerIdentity(
				user.walletAddress,
				country,
				user.privyId
			);
		}

		// Distribute
		await TokenService.distributeToken(
			investment.property.tokenContractAddress,
			user.walletAddress,
			investment.tokenCount
		);

		investment.status = InvestmentStatus.COMPLETED;
		investment.updatedAt = new Date();
		await em.flush();

		return c.json({ success: true, status: "COMPLETED" });
	} catch (error: any) {
		console.error("Error confirming investment:", error);
		return c.json(
			{ error: "Internal Server Error", details: error.message },
			500
		);
	}
});

export default invest;

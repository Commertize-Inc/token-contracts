import { BankAccount, KycStatus, PlaidItem, User } from "@commertize/data";
import { STAGE } from "@commertize/utils/server";
import { wrap } from "@mikro-orm/postgresql";
import { Hono } from "hono";
import {
	CountryCode,
	ProcessorStripeBankAccountTokenCreateRequest,
	Products,
} from "plaid";
import { getEM } from "../db";
import {
	sanitizeBankAccount,
	sortAccounts,
	transformPlaidAccount,
} from "../lib/plaid";
import { getPlaidClient } from "../lib/plaid/client";
import { handlePlaidWebhook } from "../lib/plaid/webhook_handler";
import { encrypt } from "../lib/security/encryption";
import {
	createStripeBankAccount,
	createStripeCustomer,
} from "../lib/stripe/utils";
import { authMiddleware } from "../middleware/auth";
import { HonoEnv } from "../types";

const plaid = new Hono<HonoEnv>();

plaid.use("*", async (c, next) => {
	if (c.req.path.endsWith("/webhook")) {
		await next();
	} else {
		await authMiddleware(c, next);
	}
});

plaid.post("/create_link_token", async (c) => {
	try {
		const privyId = c.get("userId");
		const body = await c.req.json().catch(() => ({}));
		const flow = c.req.query("flow") || body.flow || "idv";

		const basePayload = {
			user: { client_user_id: privyId },
			client_name: `Commertize-${STAGE}`,
			country_codes: [CountryCode.Us],
			language: "en",
		};

		let requestPayload: any;
		if (flow === "auth") {
			requestPayload = {
				...basePayload,
				products: [Products.Auth],
				webhook: process.env.PLAID_WEBHOOK_URL,
			};
		} else {
			requestPayload = {
				...basePayload,
				products: [Products.IdentityVerification],
				identity_verification: {
					template_id:
						process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID || "",
				},
			};
		}

		const plaidClient = getPlaidClient();
		const response = await plaidClient.linkTokenCreate(requestPayload);

		return c.json({ link_token: response.data.link_token });
	} catch (error: any) {
		console.error("Link Token Create Error:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

plaid.post("/exchange_public_token", async (c) => {
	try {
		const privyId = c.get("userId");
		const { public_token } = await c.req.json();

		if (!public_token) {
			return c.json({ error: "Missing public_token" }, 400);
		}

		const plaidClient = getPlaidClient();
		const exchangeResponse = await plaidClient.itemPublicTokenExchange({
			public_token,
		});
		const { access_token, item_id } = exchangeResponse.data;

		const itemResponse = await plaidClient.itemGet({ access_token });
		const item = itemResponse.data.item;

		const institutionResponse = await plaidClient.institutionsGetById({
			institution_id: item.institution_id!,
			country_codes: [CountryCode.Us],
		});
		const institution = institutionResponse.data.institution;

		const accountsResponse = await plaidClient.accountsGet({ access_token });
		const accounts = accountsResponse.data.accounts;

		const em = await getEM();
		let user = await em.findOne(User, { privyId });

		if (!user) {
			// Auto-create user if missing (legacy behavior support)
			user = em.create(User, {
				privyId,
				createdAt: new Date(),
				updatedAt: new Date(),
				kycStatus: KycStatus.NOT_STARTED,

				isAdmin: false,
			});
			await em.persist(user).flush();
		}

		if (!user.stripeCustomerId) {
			try {
				const customer = await createStripeCustomer(
					user.email || `user-${user.id}@example.com`,
					undefined,
					{ userId: user.id, privyId: user.privyId }
				);
				user.stripeCustomerId = customer.id;
				await em.persist(user).flush();
			} catch (e) {
				console.error("Stripe customer creation failed", e);
			}
		}

		const existingAccountsCount = await em.count(BankAccount, {
			user: user.id,
			status: "active",
		});

		let plaidItem = await em.findOne(PlaidItem, { itemId: item_id });
		if (plaidItem) {
			plaidItem.accessToken = encrypt(access_token);
			plaidItem.status = "active";
			plaidItem.updatedAt = new Date();
		} else {
			plaidItem = em.create(PlaidItem, {
				user,
				itemId: item_id,
				accessToken: encrypt(access_token),
				institutionId: institution.institution_id,
				institutionName: institution.name,
				status: "active",
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}
		await em.persist(plaidItem).flush();

		const bankAccounts: BankAccount[] = [];
		for (let i = 0; i < accounts.length; i++) {
			const plaidAccount = accounts[i];
			let bankAccount = await em.findOne(BankAccount, {
				plaidAccountId: plaidAccount.account_id,
			});

			if (bankAccount) {
				bankAccount.status = "active";
				bankAccount.updatedAt = new Date();
			} else {
				const accountData = transformPlaidAccount(
					plaidAccount,
					institution.name
				);
				const isPrimary = existingAccountsCount === 0 && i === 0;

				bankAccount = em.create(BankAccount, {
					user,
					plaidItem,
					plaidAccountId: accountData.plaidAccountId,
					institutionName: "",
					accountName: accountData.accountName,
					accountType: accountData.accountType,
					accountMask: accountData.accountMask,
					isVerified: true,
					isPrimary,
					status: "active",
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}

			if (user.stripeCustomerId) {
				try {
					const processorTokenRequest: ProcessorStripeBankAccountTokenCreateRequest =
						{
							access_token: access_token,
							account_id: plaidAccount.account_id,
						};
					const processorTokenResponse =
						await plaidClient.processorStripeBankAccountTokenCreate(
							processorTokenRequest
						);
					const bankAccountToken =
						processorTokenResponse.data.stripe_bank_account_token;

					const stripeSource = await createStripeBankAccount(
						user.stripeCustomerId,
						bankAccountToken
					);

					bankAccount.stripeProcessorToken = bankAccountToken;
					bankAccount.stripeBankAccountId = stripeSource.id;
					bankAccount.stripeTokenCreatedAt = new Date();
				} catch (e) {
					console.error("Stripe linking failed", e);
				}
			}
			bankAccounts.push(bankAccount);
		}

		await em.persist(bankAccounts).flush();

		return c.json({
			success: true,
			accounts: bankAccounts.map(sanitizeBankAccount),
		});
	} catch (error: any) {
		console.error("Exchange Token Error:", error);
		return c.json({ error: "Failed to link bank account" }, 500);
	}
});

plaid.get("/accounts", async (c) => {
	try {
		const privyId = c.get("userId");
		const statusFilter = c.req.query("status");
		const primaryFilter = c.req.query("primary");

		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ accounts: [] });
		}

		const filter: any = { user: user.id };
		if (statusFilter) filter.status = statusFilter;
		if (primaryFilter) filter.isPrimary = primaryFilter === "true";

		const accounts = await em.find(BankAccount, filter, {
			populate: ["plaidItem"],
		});
		const sortedAccounts = sortAccounts(accounts);

		return c.json({ accounts: sortedAccounts.map(sanitizeBankAccount) });
	} catch (error) {
		console.error("List Accounts Error:", error);
		return c.json({ error: "Failed to fetch bank accounts" }, 500);
	}
});

plaid.post("/check_idv_status", async (c) => {
	try {
		const privyId = c.get("userId");

		// We trust the user session ID or just query by user ID to be safe

		const plaidClient = getPlaidClient();

		// Fetch the latest verification for this user
		const idvResponse = await plaidClient.identityVerificationList({
			client_user_id: privyId,
			template_id: process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID || "", // Optional filter
		});

		const identityVerifications = idvResponse.data.identity_verifications;
		if (!identityVerifications || identityVerifications.length === 0) {
			return c.json({
				success: false,
				status: "unknown",
				message: "No verification found",
			});
		}

		// Sort by created_at desc (though List usually returns desc)
		const latestVerification = identityVerifications[0];
		const status = latestVerification.status;

		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		let kycStatus = KycStatus.PENDING;
		if (status === "success") {
			kycStatus = KycStatus.APPROVED;
		} else if (
			status === "failed" ||
			status === "expired" ||
			status === "canceled"
		) {
			kycStatus = KycStatus.REJECTED;
		}

		user.kycStatus = kycStatus;
		// Store session ID if useful
		user.plaidIdvSessionId = latestVerification.id;

		if (latestVerification.watchlist_screening_id) {
			user.plaidWatchlistScreeningId =
				latestVerification.watchlist_screening_id;
			// We can fetch the screening status if needed, or rely on webhooks.
			// For now, let's assume if it succeeded without blocking, it might be clear, but IDV status 'success' implies it passed.
			// actually, latestVerification object might have it? Use type definition or just store ID for now.
		}

		// Fallback: If we have missing profile data, try to get it from Plaid
		if (latestVerification.user) {
			const plaidUser = latestVerification.user;

			// Always prioritize verified Plaid data for these fields
			if (plaidUser.name) {
				const nameObj = plaidUser.name as any;

				const updates: any = {};
				if (nameObj.given_name) updates.firstName = nameObj.given_name;
				if (nameObj.family_name) updates.lastName = nameObj.family_name;

				if (Object.keys(updates).length > 0) {
					wrap(user).assign(updates);
					console.debug(
						`[Plaid IDV] User after assign:`,
						JSON.stringify(wrap(user).toPOJO(), null, 2)
					);
				}
			}

			if (plaidUser.phone_number) {
				wrap(user).assign({ phoneNumber: plaidUser.phone_number });
			}

			console.debug(
				"[Plaid IDV] Final user state before flush:",
				JSON.stringify(wrap(user).toPOJO(), null, 2)
			);
		}

		// Fallback: Check documentary_verification if name is still missing
		// This handles cases where the consolidated user object might be incomplete but the ID scan succeeded
		if (
			(!user.firstName || !user.lastName) &&
			latestVerification.documentary_verification
		) {
			const doc = latestVerification.documentary_verification.documents?.[0];
			if (doc?.extracted_data?.name) {
				const docName = doc.extracted_data.name as any;

				const docUpdates: any = {};
				if (!user.firstName && docName.given_name)
					docUpdates.firstName = docName.given_name;
				if (!user.lastName && docName.family_name)
					docUpdates.lastName = docName.family_name;

				if (Object.keys(docUpdates).length > 0) {
					wrap(user).assign(docUpdates);
				}
			}
		}

		// Sandbox Fallback: If we are in development and still don't have PII (e.g. Plaid Sandbox returned empty),
		// fill with mock data so the Read-Only frontend fields are not empty blocking the flow.
		if (STAGE !== "production" && (!user.firstName || !user.lastName)) {
			const mockUpdates: any = {};
			if (!user.firstName) mockUpdates.firstName = "Sandbox-First";
			if (!user.lastName) mockUpdates.lastName = "Sandbox-Last";
			if (!user.phoneNumber) mockUpdates.phoneNumber = "+15555555555";

			if (Object.keys(mockUpdates).length > 0) {
				wrap(user).assign(mockUpdates);
			}
		}

		user.updatedAt = new Date();
		console.debug(
			`[Plaid IDV] Persisting user profile:`,
			JSON.stringify(user, null, 2)
		);

		await em.persist<User>(user).flush();

		return c.json({
			success: kycStatus === KycStatus.APPROVED,
			status: kycStatus,
			plaidStatus: status,
		});
	} catch (error) {
		console.error("Check IDV Status Error:", error);
		return c.json({ error: "Failed to check IDV status" }, 500);
	}
});

/**
 * POST /webhook
 * Public endpoint for Plaid webhooks
 */
plaid.post("/webhook", async (c) => {
	try {
		// TODO: Validate Plaid-Verification header using JWT

		const body = await c.req.json();
		await handlePlaidWebhook(body);

		return c.json({ success: true });
	} catch (error: any) {
		console.error("Webhook Error:", error);
		return c.json({ error: "Webhook processing failed" }, 500);
	}
});

export default plaid;

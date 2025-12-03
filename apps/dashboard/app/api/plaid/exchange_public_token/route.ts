import { NextRequest, NextResponse } from "next/server";
import { privyClient } from "@/lib/privy/client";
import { getPlaidClient } from "@/lib/plaid/client";
import { getEM } from "@/lib/db/orm";
import { User } from "@/lib/db/entities/User";
import { PlaidItem } from "@/lib/db/entities/PlaidItem";
import { BankAccount } from "@/lib/db/entities/BankAccount";
import {
	CountryCode,
	sanitizeBankAccount,
	transformPlaidAccount,
} from "@/lib/plaid";
import { encrypt } from "@/lib/security/encryption";

/**
 * Exchange public token for access token and save bank accounts
 *
 * Flow:
 * 1. Verify authentication
 * 2. Exchange public_token for access_token
 * 3. Get institution details
 * 4. Get account details
 * 5. Create PlaidItem record
 * 6. Create BankAccount records for each account
 * 7. Set first account as primary if user has no other accounts
 *
 * @param request - Request with { public_token: string }
 * @returns Array of linked bank accounts
 */
export async function POST(request: NextRequest) {
	try {
		// Verify authentication
		const privyToken = request.cookies.get("privy-token")?.value;
		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		// Parse request body
		const { public_token } = await request.json();
		if (!public_token) {
			return NextResponse.json(
				{ error: "Missing public_token" },
				{ status: 400 }
			);
		}

		console.log("[Exchange Token] Starting exchange for user:", privyId);

		// Exchange public token for access token
		const plaidClient = getPlaidClient();
		const exchangeResponse = await plaidClient.itemPublicTokenExchange({
			public_token,
		});

		const { access_token, item_id } = exchangeResponse.data;

		console.log("[Exchange Token] Token exchanged successfully:", {
			item_id,
			hasAccessToken: !!access_token,
		});

		// Get item details (institution info)
		const itemResponse = await plaidClient.itemGet({ access_token });
		const item = itemResponse.data.item;

		// Get institution details
		const institutionResponse = await plaidClient.institutionsGetById({
			institution_id: item.institution_id!,
			country_codes: [CountryCode.Us],
		});
		const institution = institutionResponse.data.institution;

		console.log("[Exchange Token] Institution:", {
			name: institution.name,
			institution_id: institution.institution_id,
		});

		// Get account details
		const accountsResponse = await plaidClient.accountsGet({ access_token });
		const accounts = accountsResponse.data.accounts;

		console.log("[Exchange Token] Found accounts:", {
			count: accounts.length,
			types: accounts.map((acc) => acc.type),
		});

		// Database operations
		const em = await getEM();

		// Get or create user
		let user = await em.findOne(User, { privyId });
		if (!user) {
			user = em.create(User, {
				privyId,
				isKycd: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			await em.persistAndFlush(user);
		}

		// Check if user already has any accounts
		const existingAccountsCount = await em.count(BankAccount, {
			user: user.id,
			status: "active",
		});

		// Check if this item already exists
		let plaidItem = await em.findOne(PlaidItem, { itemId: item_id });

		if (plaidItem) {
			// Update existing item (encrypt access token)
			plaidItem.setAccessToken(access_token);
			plaidItem.status = "active";
			plaidItem.updatedAt = new Date();
		} else {
			// Create new PlaidItem (encrypt access token before storing)
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

		await em.persistAndFlush(plaidItem);

		console.log("[Exchange Token] PlaidItem saved:", plaidItem.id);

		// Create BankAccount records for each account
		const bankAccounts: BankAccount[] = [];
		for (let i = 0; i < accounts.length; i++) {
			const plaidAccount = accounts[i];

			// Check if account already exists
			let bankAccount = await em.findOne(BankAccount, {
				plaidAccountId: plaidAccount.account_id,
			});

			if (bankAccount) {
				// Update existing account
				bankAccount.status = "active";
				bankAccount.updatedAt = new Date();
			} else {
				// Transform Plaid account data
				const accountData = transformPlaidAccount(
					plaidAccount,
					institution.name
				);

				// Create new BankAccount
				// Set first account as primary if user has no other accounts
				const isPrimary = existingAccountsCount === 0 && i === 0;

				bankAccount = em.create(BankAccount, {
					user,
					plaidItem,
					plaidAccountId: accountData.plaidAccountId,
					institutionName: "", // Ignored - computed from plaidItem.institutionName
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

			bankAccounts.push(bankAccount);
		}

		await em.persistAndFlush(bankAccounts);

		console.log("[Exchange Token] Created/updated bank accounts:", {
			count: bankAccounts.length,
			ids: bankAccounts.map((acc) => acc.id),
		});

		// Return sanitized account data
		return NextResponse.json({
			success: true,
			accounts: bankAccounts.map(sanitizeBankAccount),
		});
	} catch (error: any) {
		console.error("[Exchange Token] Error:", {
			message: error?.message,
			response: error?.response?.data,
			stack: error?.stack,
		});

		const isDevelopment = process.env.NODE_ENV === "development";
		return NextResponse.json(
			{
				error: "Failed to link bank account",
				...(isDevelopment && {
					details: {
						message: error?.message,
						plaidError: error?.response?.data,
					},
				}),
			},
			{ status: error?.response?.status || 500 }
		);
	}
}

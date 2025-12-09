import { NextRequest, NextResponse } from "next/server";
import { privyClient } from "@/lib/privy/client";
import { getEM } from "@/lib/db/orm";
import { User } from "@commertize/data";
import { BankAccount } from "@commertize/data";
import { sanitizeBankAccount } from "@/lib/plaid";

/**
 * POST: Set a bank account as primary payment method
 *
 * Unsets isPrimary on all other accounts and sets it on this account
 *
 * @param request - Request object
 * @param params - Route params with account id
 * @returns Updated account
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Verify authentication
		const privyToken = request.cookies.get("privy-token")?.value;
		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const { id } = await params;

		// Database operations
		const em = await getEM();

		const user = await em.findOne(User, { privyId });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const account = await em.findOne(
			BankAccount,
			{ id },
			{
				populate: ["plaidItem"],
			}
		);

		if (!account) {
			return NextResponse.json({ error: "Account not found" }, { status: 404 });
		}

		// Verify ownership
		if (account.user.id !== user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Verify account is active
		if (account.status !== "active") {
			return NextResponse.json(
				{ error: "Cannot set inactive account as primary" },
				{ status: 400 }
			);
		}

		// Unset isPrimary on all other accounts
		const otherAccounts = await em.find(
			BankAccount,
			{
				user: user.id,
				isPrimary: true,
			},
			{
				populate: ["plaidItem"],
			}
		);

		for (const otherAccount of otherAccounts) {
			if (otherAccount.id !== id) {
				otherAccount.isPrimary = false;
			}
		}

		// Set this account as primary
		account.isPrimary = true;
		account.updatedAt = new Date();

		await em.persistAndFlush([...otherAccounts, account]);

		console.log("[Set Primary] Primary account updated:", {
			accountId: id,
			userId: user.id,
			previousPrimaries: otherAccounts.map((a) => a.id),
		});

		return NextResponse.json({
			success: true,
			account: sanitizeBankAccount(account),
		});
	} catch (error: any) {
		console.error("[Set Primary] Error:", {
			message: error?.message,
			stack: error?.stack,
		});

		return NextResponse.json(
			{ error: "Failed to set primary account" },
			{ status: 500 }
		);
	}
}

import { NextRequest, NextResponse } from "next/server";
import { privyClient } from "@/lib/privy/client";
import { getEM } from "@/lib/db/orm";
import { User } from "@/lib/db/entities/User";
import { BankAccount } from "@/lib/db/entities/BankAccount";
import { sanitizeBankAccount, sortAccounts } from "@/lib/plaid";

/**
 * GET: List all bank accounts for authenticated user
 *
 * Query params:
 * - status: Filter by status ('active', 'inactive', 'error')
 * - primary: Filter by isPrimary (true/false)
 *
 * @returns Array of bank accounts
 */
export async function GET(request: NextRequest) {
	try {
		// Verify authentication
		const privyToken = request.cookies.get("privy-token")?.value;
		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		// Get query params
		const { searchParams } = new URL(request.url);
		const statusFilter = searchParams.get("status");
		const primaryFilter = searchParams.get("primary");

		// Database query
		const em = await getEM();

		const user = await em.findOne(User, { privyId });
		if (!user) {
			return NextResponse.json({ accounts: [] });
		}

		// Build filter
		const filter: any = { user: user.id };
		if (statusFilter) {
			filter.status = statusFilter;
		}
		if (primaryFilter) {
			filter.isPrimary = primaryFilter === "true";
		}

		// Fetch accounts
		const accounts = await em.find(BankAccount, filter, {
			populate: ["plaidItem"],
		});

		console.log("[List Accounts] Found accounts:", {
			userId: user.id,
			count: accounts.length,
			filter,
		});

		// Sort accounts (primary first, then by date)
		const sortedAccounts = sortAccounts(accounts);

		// Return sanitized data
		return NextResponse.json({
			accounts: sortedAccounts.map(sanitizeBankAccount),
		});
	} catch (error: any) {
		console.error("[List Accounts] Error:", {
			message: error?.message,
			stack: error?.stack,
		});

		return NextResponse.json(
			{ error: "Failed to fetch bank accounts" },
			{ status: 500 }
		);
	}
}

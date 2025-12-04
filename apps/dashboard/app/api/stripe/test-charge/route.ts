import { NextRequest, NextResponse } from "next/server";
import { privyClient } from "@/lib/privy/client";
import { getEM } from "@/lib/db/orm";
import { BankAccount } from "@/lib/db/entities/BankAccount";
import { getStripeClient } from "@/lib/stripe/client";
import { User } from "@/lib/db/entities/User";

export async function POST(request: NextRequest) {
	try {
		// Verify authentication
		const privyToken = request.cookies.get("privy-token")?.value;
		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const { accountId, amount = 100, type = "charge" } = await request.json();

		const em = await getEM();
		const user = await em.findOne(User, { privyId });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const account = await em.findOne(BankAccount, { id: accountId });
		if (!account) {
			return NextResponse.json({ error: "Account not found" }, { status: 404 });
		}

		if (account.user.id !== user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		if (!account.stripeBankAccountId) {
			return NextResponse.json(
				{ error: "Account not linked to Stripe" },
				{ status: 400 }
			);
		}

		const stripe = getStripeClient();

		let result;
		if (type === "charge") {
			// Create a charge (Deposit)
			result = await stripe.charges.create({
				amount, // in cents
				currency: "usd",
				customer: user.stripeCustomerId!,
				source: account.stripeBankAccountId,
				description: "Test Charge from Dashboard",
			});
		} else {
			// Create a payout (Withdrawal)
			// Note: Payouts usually require a balance or specific setup, but we can try
			result = await stripe.payouts.create({
				amount,
				currency: "usd",
				destination: account.stripeBankAccountId,
				description: "Test Payout from Dashboard",
			});
		}

		return NextResponse.json({ success: true, result });
	} catch (error: any) {
		console.error("Stripe Test Error:", error);
		return NextResponse.json(
			{ error: error.message },
			{ status: 500 }
		);
	}
}

import { NextRequest, NextResponse } from "next/server";
import { privyClient } from "@/lib/privy/client";
import { getEM } from "@/lib/db/orm";
import { User } from "@commertize/data";
import { BankAccount } from "@commertize/data";

export async function GET(request: NextRequest) {
	try {
		const privyToken = request.cookies.get("privy-token")?.value;

		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Fetch bank accounts
		const bankAccounts = await em.find(
			BankAccount,
			{ user: user.id, status: "active" },
			{ populate: ["plaidItem"] }
		);

		return NextResponse.json({
			kycStatus: user.kycStatus,
			walletAddress: user.walletAddress,
			email: user.email,
			privyId: user.privyId,
			stripeCustomerId: user.stripeCustomerId,
			bankAccounts: bankAccounts.map((account) => ({
				id: account.id,
				institutionName: account.institutionName,
				accountName: account.accountName,
				accountMask: account.accountMask,
				accountType: account.accountType,
				isPrimary: account.isPrimary,
				status: account.status,
				isStripeLinked: !!account.stripeBankAccountId,
			})),
		});
	} catch (error) {
		console.error("Error fetching profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

import { NextRequest, NextResponse } from "next/server";
import { getEM } from "@/lib/db/orm";
import { User } from "@commertize/data";
import { BankAccount } from "@commertize/data";
import { KycStatus } from "@/lib/types/onboarding";
import { privyClient } from "@/lib/privy/client";

export async function GET(request: NextRequest) {
	try {
		const authToken = request.headers
			.get("authorization")
			?.replace("Bearer ", "");

		let privyId: string | null = null;

		if (!authToken) {
			const privyToken = request.cookies.get("privy-token")?.value;
			if (!privyToken) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			}
			try {
				const claims = await privyClient.verifyAuthToken(privyToken);
				privyId = claims.userId;
			} catch (verifyError) {
				console.error("Token verification error:", verifyError);
				return NextResponse.json({ error: "Invalid token" }, { status: 401 });
			}
		} else {
			const claims = await privyClient.verifyAuthToken(authToken);
			privyId = claims.userId;
		}

		const em = await getEM();
		let user = await em.findOne(User, { privyId });

		if (!user) {
			// Create user if doesn't exist
			user = em.create(User, {
				privyId,
				createdAt: new Date(),
				updatedAt: new Date(),
				kycStatus: KycStatus.NOT_STARTED,
			});
			await em.persistAndFlush(user);
		}

		// Check for active bank accounts
		const activeBankAccountsCount = await em.count(BankAccount, {
			user: user.id,
			status: "active",
		});

		return NextResponse.json({
			kycStatus: user.kycStatus,
			hasBankAccount: activeBankAccountsCount > 0,
		});
	} catch (error) {
		console.error("Error checking KYC status:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

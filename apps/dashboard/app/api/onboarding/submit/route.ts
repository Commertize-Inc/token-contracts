import { User } from "@commertize/data";
import { KycStatus } from "@/lib/types/onboarding";
import { getEM } from "@/lib/db/orm";
import { NextRequest, NextResponse } from "next/server";
import { privyClient } from "@/lib/privy/client";

export async function POST(request: NextRequest) {
	try {
		const privyToken = request.cookies.get("privy-token")?.value;

		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const em = await getEM();
		let user = await em.findOne(User, { privyId });

		if (!user) {
			user = em.create(User, {
				privyId,
				createdAt: new Date(),
				updatedAt: new Date(),
				kycStatus: KycStatus.NOT_STARTED,
			});
		}

		// This route was used to "skip" KYC in dev.
		// Now we should just set kycStatus to APPROVED.
		user.kycStatus = KycStatus.APPROVED;
		await em.persistAndFlush(user);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error submitting KYC:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

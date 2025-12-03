import { NextRequest, NextResponse } from "next/server";
import { getEM } from "@/lib/db/orm";
import { User } from "@/lib/db/entities/User";
import { privyClient } from "@/lib/privy/client";

export async function GET(request: NextRequest) {
	try {
		const authToken = request.headers
			.get("authorization")
			?.replace("Bearer ", "");

		if (!authToken) {
			// In client-side requests, Privy handles auth differently
			// We'll check cookies instead
			const privyToken = request.cookies.get("privy-token")?.value;

			if (!privyToken) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			}

			try {
				const claims = await privyClient.verifyAuthToken(privyToken);
				const privyId = claims.userId;

				const em = await getEM();
				let user = await em.findOne(User, { privyId });

				if (!user) {
					// Create user if doesn't exist
					user = em.create(User, {
						privyId,
						isKycd: false,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
					await em.persistAndFlush(user);
				}

				return NextResponse.json({
					isKycd: user.isKycd,
					kycCompletedAt: user.kycCompletedAt,
				});
			} catch (verifyError) {
				console.error("Token verification error:", verifyError);
				return NextResponse.json({ error: "Invalid token" }, { status: 401 });
			}
		}

		const claims = await privyClient.verifyAuthToken(authToken);
		const privyId = claims.userId;

		const em = await getEM();
		let user = await em.findOne(User, { privyId });

		if (!user) {
			// Create user if doesn't exist
			user = em.create(User, {
				privyId,
				isKycd: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			await em.persistAndFlush(user);
		}

		return NextResponse.json({
			isKycd: user.isKycd,
			kycCompletedAt: user.kycCompletedAt,
		});
	} catch (error) {
		console.error("Error checking KYC status:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

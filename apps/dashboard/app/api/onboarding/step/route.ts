import { NextRequest, NextResponse } from "next/server";
import { getEM } from "@/lib/db/orm";
import { User } from "@/lib/db/entities/User";
import { OnboardingStep } from "@/lib/types/onboarding";
import { privyClient } from "@/lib/privy/client";

export async function POST(request: NextRequest) {
	try {
		const privyToken = request.cookies.get("privy-token")?.value;

		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const { step }: { step: OnboardingStep } = await request.json();

		if (!step || !Object.values(OnboardingStep).includes(step)) {
			return NextResponse.json({ error: "Invalid step" }, { status: 400 });
		}

		const em = await getEM();
		let user = await em.findOne(User, { privyId });

		if (!user) {
			user = em.create(User, {
				privyId,
				isKycd: step === OnboardingStep.COMPLETE,
				createdAt: new Date(),
				updatedAt: new Date(),
				onboardingStep: step,
			});
		} else {
			user.onboardingStep = step;
			user.updatedAt = new Date();
		}

		await em.persistAndFlush(user);

		return NextResponse.json({ success: true, step: user.onboardingStep });
	} catch (error) {
		console.error("Error updating onboarding step:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

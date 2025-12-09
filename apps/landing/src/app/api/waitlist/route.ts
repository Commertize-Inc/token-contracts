import { NextRequest, NextResponse } from "next/server";
import { createWaitlistEntry } from "../../../../lib/db/waitlist";
import { WaitlistType } from "@commertize/data";

export async function POST(request: NextRequest) {
	try {
		const data = await request.json();

		if (!data.email || !data.type) {
			return NextResponse.json(
				{ success: false, message: "Email and type are required" },
				{ status: 400 }
			);
		}

		if (
			data.type !== WaitlistType.INVESTOR &&
			data.type !== WaitlistType.SPONSOR
		) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid type. Must be 'investor' or 'sponsor'",
				},
				{ status: 400 }
			);
		}

		// Construct fullName from firstName and lastName if provided (for Investor form)
		let fullName = data.fullName;
		if (!fullName && data.firstName && data.lastName) {
			fullName = `${data.firstName} ${data.lastName}`;
		}

		await createWaitlistEntry({
			email: data.email,
			type: data.type,
			fullName: fullName,
			phone: data.phone,
			country: data.country,
			city: data.city,
			investmentAmount: data.investmentAmount,
			investmentTimeframe: data.investmentTimeframe,
			propertyTypes: data.propertyTypes,
			experience: data.experience,
			company: data.company,
			propertyName: data.propertyName,
			propertyLocation: data.propertyLocation,
			assetType: data.assetType,
			estimatedValue: data.estimatedValue,
			capitalNeeded: data.capitalNeeded,
			timeline: data.timeline,
			hearAboutUs: data.hearAboutUs,
			additionalInfo: data.additionalInfo,
			message: data.message,
		});

		return NextResponse.json({
			success: true,
			message: "Successfully joined waitlist",
		});
	} catch (error: any) {
		console.error("Error processing waitlist submission:", error);
		// check for unique constraint violation (Postgres error code 23505)
		if (error.code === "23505") {
			return NextResponse.json(
				{ success: false, message: "Email already on waitlist" },
				{ status: 409 }
			);
		}
		return NextResponse.json(
			{ success: false, message: "Failed to process submission" },
			{ status: 500 }
		);
	}
}

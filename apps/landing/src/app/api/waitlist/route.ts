import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const data = await request.json();

		console.log("Waitlist submission:", {
			type: data.type,
			email: data.email,
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json({
			success: true,
			message: "Successfully joined waitlist",
		});
	} catch (error) {
		console.error("Error processing waitlist submission:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to process submission" },
			{ status: 500 }
		);
	}
}

import { NextRequest, NextResponse } from "next/server";
import { xScheduler } from "../../../../schedulers/xScheduler";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { text, media, scheduledTime } = body;

		if (!text || typeof text !== "string") {
			return NextResponse.json({ error: "Text is required" }, { status: 400 });
		}

		if (text.length > 280) {
			return NextResponse.json(
				{ error: "Text exceeds 280 character limit" },
				{ status: 400 }
			);
		}

		if (scheduledTime) {
			const scheduleDate = new Date(scheduledTime);
			if (scheduleDate <= new Date()) {
				return NextResponse.json(
					{ error: "Scheduled time must be in the future" },
					{ status: 400 }
				);
			}

			const postId = xScheduler.schedulePost(text, scheduleDate, media);
			return NextResponse.json({
				success: true,
				scheduled: true,
				postId,
				scheduledTime: scheduleDate.toISOString(),
			});
		}

		const result = await xScheduler.postNow(text, media);
		return NextResponse.json({
			success: true,
			posted: true,
			tweetId: result.data.id,
		});
	} catch (error: unknown) {
		console.error("X post error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to post" },
			{ status: 500 }
		);
	}
}

export async function GET() {
	const status = xScheduler.getStatus();
	const scheduled = xScheduler.getScheduledPosts();

	return NextResponse.json({
		...status,
		scheduledPosts: scheduled,
	});
}

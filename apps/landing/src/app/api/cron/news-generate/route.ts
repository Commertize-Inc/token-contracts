import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret) {
		return NextResponse.json(
			{ error: "CRON_SECRET not configured" },
			{ status: 500 }
		);
	}

	if (authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const now = new Date();
	const dayOfWeek = now.getUTCDay();
	const hour = now.getUTCHours();

	const isScheduledDay = [1, 3, 5].includes(dayOfWeek);
	const isScheduledHour = hour === 14;

	if (!isScheduledDay) {
		return NextResponse.json({
			message: "Not a scheduled day",
			currentDay: dayOfWeek,
			scheduledDays: "Monday (1), Wednesday (3), Friday (5)",
			skipped: true,
		});
	}

	if (!isScheduledHour) {
		return NextResponse.json({
			message: "Not the scheduled hour",
			currentHour: hour,
			scheduledHour: "14 (2PM UTC)",
			skipped: true,
		});
	}

	try {
		const baseUrl =
			process.env.NEXT_PUBLIC_APP_URL ||
			`https://${request.headers.get("host")}`;

		const response = await fetch(`${baseUrl}/api/news/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ count: 1, saveToDb: true }),
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || "Failed to generate article");
		}

		return NextResponse.json({
			success: true,
			message: "Scheduled news article generated",
			timestamp: now.toISOString(),
			dayOfWeek,
			isScheduledHour,
			article: result.articles?.[0]
				? {
						title: result.articles[0].title,
						category: result.articles[0].category,
						slug: result.articles[0].slug,
					}
				: null,
		});
	} catch (error) {
		console.error("Cron news generation error:", error);
		return NextResponse.json(
			{
				error: "Failed to generate scheduled article",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	return GET(request);
}

import { NextRequest, NextResponse } from "next/server";
import { automatedPostService } from "../../../../services/automatedPostService";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}));
		const { action = "scheduled" } = body;

		const authHeader = request.headers.get("authorization");
		const cronSecret = process.env.CRON_SECRET;
		const adminSecret = process.env.ADMIN_SECRET || cronSecret;

		const isCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;
		const isAdminAuth = adminSecret && authHeader === `Bearer ${adminSecret}`;
		const isLocalRequest =
			request.headers.get("host")?.includes("localhost") ||
			request.headers.get("x-forwarded-host")?.includes("replit");

		if (action === "scheduled") {
			if (cronSecret && !isCronAuth) {
				return NextResponse.json(
					{ error: "Unauthorized - cron secret required" },
					{ status: 401 }
				);
			}

			const result = await automatedPostService.runScheduledPost();
			return NextResponse.json(result);
		}

		if (action === "preview") {
			if (!isLocalRequest && adminSecret && !isAdminAuth) {
				return NextResponse.json(
					{ error: "Unauthorized - admin access required" },
					{ status: 401 }
				);
			}

			const preview = await automatedPostService.previewPost();
			return NextResponse.json({
				success: true,
				preview,
			});
		}

		if (action === "force") {
			if (!isLocalRequest && adminSecret && !isAdminAuth) {
				return NextResponse.json(
					{ error: "Unauthorized - admin access required for force posting" },
					{ status: 401 }
				);
			}

			const result = await automatedPostService.forcePost();
			return NextResponse.json(result);
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	} catch (error: unknown) {
		console.error("Automated post error:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to process automated post",
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		const status = automatedPostService.getStatus();
		const history = automatedPostService.getPostHistory(5);

		return NextResponse.json({
			status,
			recentPosts: history,
		});
	} catch (error: unknown) {
		console.error("Status check error:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Failed to get status",
			},
			{ status: 500 }
		);
	}
}

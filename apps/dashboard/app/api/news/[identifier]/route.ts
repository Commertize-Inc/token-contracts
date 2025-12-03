import { NextRequest, NextResponse } from "next/server";
import { getEM } from "@/lib/db/orm";
import { NewsArticle } from "@/lib/db/entities/NewsArticle";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ identifier: string }> }
) {
	try {
		const { identifier } = await params;

		const em = await getEM();
		const article = await em.findOne(NewsArticle, {
			$or: [{ slug: identifier }, { id: identifier }],
			isPublished: true,
		});

		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		return NextResponse.json({ data: article });
	} catch (error) {
		console.error("Error fetching article:", error);
		return NextResponse.json(
			{ error: "Failed to fetch article" },
			{ status: 500 }
		);
	}
}

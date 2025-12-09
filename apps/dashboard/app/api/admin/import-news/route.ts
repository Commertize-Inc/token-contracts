import { NextRequest, NextResponse } from "next/server";
import { getEM } from "@/lib/db/orm";
import { NewsArticle } from "@commertize/data";

interface ArticleInput {
	slug?: string;
	title: string;
	summary: string;
	content?: string;
	category: string;
	tags?: string[];
	imageUrl?: string;
	readTime?: number;
	publishedAt?: string;
	isGenerated?: boolean;
	isPublished?: boolean;
}

export async function POST(request: NextRequest) {
	try {
		const { articles } = await request.json();

		if (!articles || !Array.isArray(articles)) {
			return NextResponse.json(
				{ error: "Articles array is required" },
				{ status: 400 }
			);
		}

		const em = await getEM();
		let imported = 0;
		let skipped = 0;

		for (const articleData of articles as ArticleInput[]) {
			const slug =
				articleData.slug ||
				articleData.title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, "");
			const readTime =
				articleData.readTime ||
				Math.ceil(
					(articleData.content?.length || articleData.summary.length) / 1000
				) ||
				3;
			const publishedAt = articleData.publishedAt
				? new Date(articleData.publishedAt)
				: new Date();
			const isGenerated = articleData.isGenerated ?? false;
			const isPublished = articleData.isPublished ?? true;

			try {
				// Check if article with this slug already exists
				const existing = await em.findOne(NewsArticle, { slug });

				if (existing) {
					skipped++;
					continue;
				}

				const article = new NewsArticle();
				article.slug = slug;
				article.title = articleData.title;
				article.summary = articleData.summary;
				article.content = articleData.content || "";
				article.category = articleData.category;
				article.imageUrl = articleData.imageUrl;
				article.readTime = readTime;
				article.publishedAt = publishedAt;
				article.isGenerated = isGenerated;
				article.isPublished = isPublished;

				em.persist(article);
				imported++;
			} catch (err: unknown) {
				console.error("Error inserting article:", err);
				skipped++;
			}
		}

		await em.flush();

		return NextResponse.json({
			success: true,
			imported,
			skipped,
			total: articles.length,
		});
	} catch (error: unknown) {
		console.error("Import news error:", error);
		return NextResponse.json(
			{
				error: "Failed to import articles",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

import { NextRequest, NextResponse } from "next/server";
import { getEM } from "@/lib/db/orm";
import { NewsArticle } from "@/lib/db/entities/NewsArticle";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "10");
		const onlyPublished = searchParams.get("published") !== "false";

		const em = await getEM();
		const query: Record<string, unknown> = {};

		if (onlyPublished) {
			query.isPublished = true;
		}

		const articles = await em.find(NewsArticle, query, {
			orderBy: { createdAt: "DESC" },
			limit,
		});

		return NextResponse.json({
			articles,
			total: articles.length,
		});
	} catch (error) {
		console.error("Error fetching news articles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch articles" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { articles } = body;

		if (!Array.isArray(articles) || articles.length === 0) {
			return NextResponse.json(
				{ error: "Articles array is required" },
				{ status: 400 }
			);
		}

		const em = await getEM();
		const savedArticles: NewsArticle[] = [];

		for (const articleData of articles) {
			const article = new NewsArticle();
			article.slug = articleData.slug;
			article.title = articleData.title;
			article.summary = articleData.summary;
			article.content = articleData.content;
			article.category = articleData.category;
			article.imageUrl = articleData.imageUrl;
			article.readTime = articleData.readTime || 5;
			article.publishedAt =
				articleData.publishedAt ||
				new Date().toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				});
			article.isGenerated = true;
			article.isPublished = true;

			em.persist(article);
			savedArticles.push(article);
		}

		await em.flush();

		return NextResponse.json({
			success: true,
			message: `Saved ${savedArticles.length} articles`,
			articles: savedArticles,
		});
	} catch (error) {
		console.error("Error saving news articles:", error);
		return NextResponse.json(
			{ error: "Failed to save articles" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const articleId = searchParams.get("id");

		const em = await getEM();

		if (articleId) {
			const article = await em.findOne(NewsArticle, { id: articleId });
			if (article) {
				await em.removeAndFlush(article);
				return NextResponse.json({
					success: true,
					message: `Deleted article ${articleId}`,
				});
			}
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		} else {
			const generated = await em.find(NewsArticle, { isGenerated: true });
			await em.removeAndFlush(generated);
			return NextResponse.json({
				success: true,
				message: `Cleared ${generated.length} generated articles`,
			});
		}
	} catch (error) {
		console.error("Error deleting news articles:", error);
		return NextResponse.json(
			{ error: "Failed to delete articles" },
			{ status: 500 }
		);
	}
}

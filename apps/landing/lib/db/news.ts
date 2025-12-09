import { getEM } from "./index";
import { NewsArticle } from "@commertize/data";
import { FilterQuery } from "@mikro-orm/core";

// Re-export entity type for consumers
export type { NewsArticle };

export async function getNewsArticles(
	limit: number = 10,
	category?: string
): Promise<NewsArticle[]> {
	const em = await getEM();

	const where: FilterQuery<NewsArticle> = {
		isPublished: true,
	};

	if (category) {
		where.category = category;
	}

	try {
		const articles = await em.find(NewsArticle, where, {
			orderBy: { createdAt: "DESC" },
			limit: limit,
		});
		return articles;
	} catch (error) {
		console.error("Error fetching news articles:", error);
		return [];
	}
}

export async function getNewsArticleBySlug(
	slug: string
): Promise<NewsArticle | null> {
	const em = await getEM();

	try {
		// Try finding by slug first, then by ID if it matches UUID format (optional, keeping logical parity)
		// Or using an OR condition like before
		const article = await em.findOne(NewsArticle, {
			$or: [{ slug: slug }, { id: slug }],
			isPublished: true
		});
		return article;
	} catch (error) {
		console.error("Error fetching news article:", error);
		return null;
	}
}

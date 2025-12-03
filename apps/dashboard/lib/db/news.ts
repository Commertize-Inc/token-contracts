import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
	if (!pool) {
		pool = new Pool({
			connectionString: process.env.DATABASE_URL,
			ssl: {
				rejectUnauthorized: false,
			},
		});
	}
	return pool;
}

export interface NewsArticle {
	id: string;
	slug: string;
	title: string;
	summary: string;
	content?: string;
	category: string;
	tags?: string[];
	image_url?: string;
	read_time: number;
	published_at: string;
	is_generated: boolean;
	is_published: boolean;
	created_at: Date;
	updated_at: Date;
}

export async function getNewsArticles(
	limit: number = 10,
	category?: string
): Promise<NewsArticle[]> {
	const pool = getPool();

	let query = `
    SELECT id, slug, title, summary, content, category,
           image_url as "imageUrl", read_time as "readTime",
           published_at as "publishedAt", is_generated as "isGenerated",
           is_published as "isPublished", created_at as "createdAt",
           updated_at as "updatedAt"
    FROM news_article
    WHERE is_published = true
  `;

	const params: (string | number)[] = [];

	if (category) {
		params.push(category);
		query += ` AND category = $${params.length}`;
	}

	query += ` ORDER BY created_at DESC`;

	params.push(limit);
	query += ` LIMIT $${params.length}`;

	try {
		const result = await pool.query(query, params);
		return result.rows;
	} catch (error) {
		console.error("Error fetching news articles:", error);
		return [];
	}
}

export async function getNewsArticleBySlug(
	slug: string
): Promise<NewsArticle | null> {
	const pool = getPool();

	const query = `
    SELECT id, slug, title, summary, content, category,
           image_url as "imageUrl", read_time as "readTime",
           published_at as "publishedAt", is_generated as "isGenerated",
           is_published as "isPublished", created_at as "createdAt",
           updated_at as "updatedAt"
    FROM news_article
    WHERE (slug = $1 OR id = $1) AND is_published = true
    LIMIT 1
  `;

	try {
		const result = await pool.query(query, [slug]);
		return result.rows[0] || null;
	} catch (error) {
		console.error("Error fetching news article:", error);
		return null;
	}
}

import { getNewsArticles, getNewsArticleBySlug } from "../lib/db/news";
import { getORM } from "../lib/db";
import { config as dotenvConfig } from "dotenv";
import { expand } from "dotenv-expand";
import path from "path";
import { NewsArticle } from "@commertize/data";

// Load env
const env = dotenvConfig({ path: path.resolve(__dirname, "../../.env") });
expand(env);

async function test() {
	try {
		const orm = await getORM();

		// Seed a test article if none exist
		const em = orm.em.fork();
		const existing = await em.count(NewsArticle);
		if (existing === 0) {
			console.log("Seeding test article...");
			const article = em.create(NewsArticle, {
				slug: "test-article",
				title: "Test Article",
				summary: "This is a test article.",
				content: "Content of the test article.",
				category: "Test",
				imageUrl: "https://example.com/image.jpg",
				readTime: 5,
				publishedAt: new Date(),
				isPublished: true,
				isGenerated: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			await em.persistAndFlush(article);
		}

		console.log("Testing getNewsArticles...");
		const articles = await getNewsArticles(5);
		console.log(`Fetched ${articles.length} articles`);
		if (articles.length > 0) {
			console.log("First article:", articles[0]);
		}

		console.log("Testing getNewsArticleBySlug...");
		if (articles.length > 0) {
			const slug = articles[0].slug;
			const article = await getNewsArticleBySlug(slug);
			console.log(`Fetched article by slug '${slug}':`, article ? "Found" : "Not Found");
		}

		await orm.close();
		process.exit(0);
	} catch (e) {
		console.error("Test failed:", e);
		process.exit(1);
	}
}

test();

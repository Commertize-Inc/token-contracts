import { Hono } from "hono";
import OpenAI from "openai";
import { getFeatureFlag } from "@commertize/utils/server";
import { PostHogFeatureFlags } from "@commertize/utils/server";
import { HonoEnv } from "../types";

const news = new Hono<HonoEnv>();

const categories = [
	"Tokenization",
	"Markets",
	"Technology",
	"Regulation",
	"DeFi",
	"Infrastructure",
];

const topics = [
	"commercial real estate tokenization trends",
	"blockchain in property investment",
	"fractional ownership opportunities",
	"AI-powered real estate valuation",
	"DeFi lending for property investors",
	"regulatory updates for digital assets",
	"institutional adoption of tokenized real estate",
	"sustainable infrastructure investments",
	"data center real estate boom",
	"multifamily housing tokenization",
	"REIT vs tokenized property comparison",
	"cross-border real estate investment",
];

// POST /generate - Admin/server-only endpoint for AI news generation
// Requires valid API_SECRET_KEY in x-api-key header (server-to-server auth)
news.post("/generate", async (c) => {
	try {
		// Check for server-to-server authentication
		const isServerCall = c.get("isServerCall");
		if (!isServerCall) {
			return c.json(
				{ error: "Unauthorized: This endpoint requires server authentication" },
				401
			);
		}

		const body = await c.req.json().catch(() => ({ count: 3 }));
		const { count = 3 } = body;

		// Check PostHog feature flag
		const isAiNewsEnabled = await getFeatureFlag(
			PostHogFeatureFlags.NEWS_GENERATION,
			"system" // Using 'system' as the distinct ID for server-side feature flags
		);

		if (!isAiNewsEnabled) {
			return c.json(
				{
					error: "AI news generation is currently disabled",
					message:
						"This feature is not available at the moment. Please check back later.",
				},
				503
			);
		}

		if (!process.env.OPENAI_API_KEY) {
			return c.json({ error: "OpenAI API key not configured" }, 500);
		}

		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});

		const articles = [];
		const numArticles = Math.min(count, 6);

		for (let i = 0; i < numArticles; i++) {
			const topic = topics[Math.floor(Math.random() * topics.length)];
			const category =
				categories[Math.floor(Math.random() * categories.length)];

			const completion = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: [
					{
						role: "system",
						content: `You are a professional financial journalist specializing in commercial real estate, blockchain technology, and tokenization. Write engaging, informative content for sophisticated investors.`,
					},
					{
						role: "user",
						content: `Write a news article about ${topic}.

Return a JSON object with the following structure:
{
  "title": "A compelling headline (max 80 characters)",
  "summary": "A brief summary (2-3 sentences, max 200 characters)",
  "content": "Full article content (3-4 paragraphs, professional tone)",
  "readTime": estimated reading time in minutes (number)
}

Focus on current trends, market insights, and actionable information for investors interested in tokenized real estate.`,
					},
				],
				response_format: { type: "json_object" },
				temperature: 0.7,
				max_tokens: 1000,
			});

			const content = completion.choices[0].message.content || "{}";
			const articleData = JSON.parse(content);

			const slug = articleData.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "")
				.substring(0, 60);

			const article = {
				id: `gen-${Date.now()}-${i}`,
				title: articleData.title,
				slug,
				summary: articleData.summary,
				content: articleData.content,
				category,
				readTime: articleData.readTime || 5,
				publishedAt: new Date().toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				}),
				generatedAt: new Date().toISOString(),
			};

			articles.push(article);
		}

		return c.json({
			success: true,
			articles,
			message: `Generated ${articles.length} news articles`,
		});
	} catch (error) {
		console.error("Error generating news articles:", error);
		return c.json({ error: `Failed to generate news articles: ${error}` }, 500);
	}
});

news.get("/", (c) => {
	return c.json({
		message: "News article generation API",
		usage: "POST with optional { count: number } to generate articles",
		categories,
		topics: topics.slice(0, 5),
	});
});

export default news;

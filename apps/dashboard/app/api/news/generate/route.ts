import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(request: NextRequest) {
	try {
		const { count = 3 } = await request.json().catch(() => ({ count: 3 }));

		if (!process.env.OPENAI_API_KEY) {
			return NextResponse.json(
				{ error: "OpenAI API key not configured" },
				{ status: 500 }
			);
		}

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

			const articleData = JSON.parse(
				completion.choices[0].message.content || "{}"
			);

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

		return NextResponse.json({
			success: true,
			articles,
			message: `Generated ${articles.length} news articles`,
		});
	} catch (error) {
		console.error("Error generating news articles:", error);
		return NextResponse.json(
			// { error: 'Failed to generate news articles' },
			// DEBUG: Surface error to the landing page
			{ error: `Failed to generate news articles: ${error}` },
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		message: "News article generation API",
		usage: "POST with optional { count: number } to generate articles",
		categories,
		topics: topics.slice(0, 5),
	});
}

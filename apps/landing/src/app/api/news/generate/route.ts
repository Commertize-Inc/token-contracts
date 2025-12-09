import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getEM } from "../../../../../lib/db";
import { EntityManager } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const NEWS_CATEGORIES = [
	{ id: "CRE", name: "CRE", description: "Commercial Real Estate market news" },
	{
		id: "Tokenization",
		name: "Tokenization",
		description: "Asset tokenization trends & developments",
	},
	{ id: "RWA", name: "RWA", description: "Real World Assets on blockchain" },
	{
		id: "Crypto",
		name: "Crypto",
		description: "Cryptocurrency market updates",
	},
	{ id: "DeFi", name: "DeFi", description: "Decentralized Finance news" },
	{
		id: "CREUSD",
		name: "CREUSD",
		description: "Commertize stablecoin updates",
	},
	{
		id: "Digital Assets",
		name: "Digital Assets",
		description: "Digital asset ecosystem news",
	},
	{
		id: "Regulation",
		name: "Regulation",
		description: "SEC, legal, compliance updates",
	},
	{
		id: "Technology",
		name: "Technology",
		description: "PropTech & blockchain innovation",
	},
	{
		id: "Markets",
		name: "Markets",
		description: "Financial markets & investment trends",
	},
	{
		id: "Datacenters",
		name: "Datacenters",
		description: "Data center real estate & infrastructure",
	},
	{
		id: "Green Energy Infrastructure",
		name: "Green Energy Infrastructure",
		description: "Renewable energy investments",
	},
	{
		id: "Solar Farms",
		name: "Solar Farms",
		description: "Solar energy asset tokenization",
	},
	{
		id: "Wind Farms",
		name: "Wind Farms",
		description: "Wind energy infrastructure",
	},
	{
		id: "OmniGrid",
		name: "OmniGrid",
		description: "Green infrastructure network",
	},
];

async function getRecentCategories(
	em: EntityManager,
	limit: number = 3
): Promise<string[]> {
	try {
		const result = await em.getConnection().execute(
			`SELECT category FROM news_category_history ORDER BY used_at DESC LIMIT ?`,
			[limit]
		);
		return (result as any[]).map((row) => row.category);
	} catch (error) {
		console.error("Error fetching recent categories:", error);
		return [];
	}
}

async function recordCategoryUsage(
	em: EntityManager,
	category: string
): Promise<void> {
	try {
		await em.getConnection().execute(
			`INSERT INTO news_category_history (category, used_at) VALUES (?, NOW())`,
			[category]
		);
		await em.getConnection().execute(
			`DELETE FROM news_category_history WHERE id NOT IN (
        SELECT id FROM news_category_history ORDER BY used_at DESC LIMIT 10
      )`
		);
	} catch (error) {
		console.error("Error recording category usage:", error);
	}
}

function selectCategory(
	recentCategories: string[]
): (typeof NEWS_CATEGORIES)[0] {
	const availableCategories = NEWS_CATEGORIES.filter(
		(cat) => !recentCategories.includes(cat.id)
	);

	if (availableCategories.length === 0) {
		return NEWS_CATEGORIES[Math.floor(Math.random() * NEWS_CATEGORIES.length)];
	}

	return availableCategories[
		Math.floor(Math.random() * availableCategories.length)
	];
}

async function generateArticleImage(
	title: string,
	category: string
): Promise<string | null> {
	try {
		const response = await openai.images.generate({
			model: "dall-e-3",
			prompt: `Professional, modern photograph representing ${category} news in the context of commercial real estate and blockchain technology. Theme: "${title}". Style: Clean, corporate, premium quality, suitable for a financial news article. No text or logos in the image.`,
			n: 1,
			size: "1792x1024",
			quality: "standard",
		});

		return response.data?.[0]?.url || null;
	} catch (error) {
		console.error("Error generating image:", error);
		return null;
	}
}

async function saveArticle(
	em: EntityManager,
	article: {
		id: string;
		slug: string;
		title: string;
		summary: string;
		content: string;
		category: string;
		imageUrl: string | null;
		readTime: number;
		publishedAt: string;
	}
): Promise<boolean> {
	try {
		await em.getConnection().execute(
			`INSERT INTO news_article (id, slug, title, summary, content, category, image_url, read_time, published_at, is_generated, is_published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, true, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         summary = EXCLUDED.summary,
         content = EXCLUDED.content,
         image_url = EXCLUDED.image_url,
         updated_at = NOW()`,
			[
				article.id,
				article.slug,
				article.title,
				article.summary,
				article.content,
				article.category,
				article.imageUrl,
				article.readTime,
				article.publishedAt,
			]
		);
		return true;
	} catch (error) {
		console.error("Error saving article:", error);
		return false;
	}
}

export async function POST(request: NextRequest) {
	try {
		const { count = 1, saveToDb = true } = await request
			.json()
			.catch(() => ({ count: 1, saveToDb: true }));

		if (!process.env.OPENAI_API_KEY) {
			return NextResponse.json(
				{ error: "OpenAI API key not configured" },
				{ status: 500 }
			);
		}

		const em = await getEM();
		const articles = [];
		const numArticles = Math.min(count, 5);
		let recentCategories = await getRecentCategories(em, 3);

		for (let i = 0; i < numArticles; i++) {
			const selectedCategory = selectCategory(recentCategories);

			const completion = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: [
					{
						role: "system",
						content: `You are a professional financial journalist specializing in commercial real estate, blockchain technology, tokenization, and sustainable infrastructure. Write engaging, informative content for sophisticated investors. Focus on the Commertize platform context where relevant.`,
					},
					{
						role: "user",
						content: `Write a news article about ${selectedCategory.description}. Category: ${selectedCategory.name}

Return a JSON object with the following structure:
{
  "title": "A compelling headline (max 100 characters)",
  "summary": "A brief summary (2-3 sentences, max 250 characters)",
  "content": "Full article content (4-5 paragraphs, professional tone, approximately 500-700 words)",
  "readTime": estimated reading time in minutes (number between 3-8)
}

Focus on current trends, market insights, and actionable information for investors interested in tokenized real estate and sustainable infrastructure. Make the content timely and relevant.`,
					},
				],
				response_format: { type: "json_object" },
				temperature: 0.8,
				max_tokens: 2000,
			});

			const articleData = JSON.parse(
				completion.choices[0].message.content || "{}"
			);

			const slug = articleData.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "")
				.substring(0, 80);

			let imageUrl: string | null = null;
			try {
				imageUrl = await generateArticleImage(
					articleData.title,
					selectedCategory.name
				);
			} catch (imgError) {
				console.error(
					"Image generation failed, continuing without image:",
					imgError
				);
			}

			const article = {
				id: uuidv4(),
				title: articleData.title,
				slug: `${slug}-${Date.now()}`,
				summary: articleData.summary,
				content: articleData.content,
				category: selectedCategory.name,
				imageUrl,
				readTime: articleData.readTime || 5,
				publishedAt: new Date().toISOString(),
			};

			if (saveToDb) {
				await saveArticle(em, article);
				await recordCategoryUsage(em, selectedCategory.id);
			}

			recentCategories = [selectedCategory.id, ...recentCategories.slice(0, 2)];

			articles.push({
				...article,
				generatedAt: new Date().toISOString(),
			});
		}

		return NextResponse.json({
			success: true,
			articles,
			message: `Generated ${articles.length} news article(s)`,
			categoriesUsed: articles.map((a) => a.category),
		});
	} catch (error) {
		console.error("Error generating news articles:", error);
		return NextResponse.json(
			{
				error: "Failed to generate news articles",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	const em = await getEM();
	const recentCategories = await getRecentCategories(em, 3);
	const availableCategories = NEWS_CATEGORIES.filter(
		(cat) => !recentCategories.includes(cat.id)
	);

	return NextResponse.json({
		message: "Enhanced News Article Generation API",
		usage:
			"POST with optional { count: number, saveToDb: boolean } to generate articles",
		totalCategories: NEWS_CATEGORIES.length,
		categories: NEWS_CATEGORIES.map((c) => ({
			id: c.id,
			description: c.description,
		})),
		recentlyUsed: recentCategories,
		availableForNext: availableCategories.map((c) => c.id),
		schedule: "Monday, Wednesday, Friday at 2PM UTC",
	});
}

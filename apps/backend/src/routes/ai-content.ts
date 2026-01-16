import { Hono } from "hono";
import OpenAI from "openai";
import { HonoEnv } from "../types";

const aiContent = new Hono<HonoEnv>();

const COMMERTIZE_TOPICS = [
	"real estate tokenization",
	"RWA (Real World Assets) tokenization",
	"AI-powered real estate investing",
	"commercial real estate innovation",
	"fractional property ownership",
	"blockchain in real estate",
	"democratizing real estate investment",
	"institutional-grade CRE access",
	"DeFi meets traditional real estate",
	"smart contract property management",
	"tokenized property liquidity",
	"digital asset real estate",
	"Commertize platform innovation",
	"next-generation CRE investing",
	"transparent property investment",
];

const COMMERTIZE_HASHTAGS = [
	"#RealEstateTokenization",
	"#RWA",
	"#CommercialRealEstate",
	"#DeFi",
	"#Blockchain",
	"#PropTech",
	"#Tokenization",
	"#Commertize",
	"#AIInvesting",
	"#FractionalOwnership",
	"#DigitalAssets",
	"#CRE",
	"#InvestSmart",
	"#RealEstate",
	"#Web3",
];

interface GeneratedContent {
	text: string;
	topic: string;
	imagePrompt: string;
}

// In-memory store for used topics for simple rotation (per instance)
const usedTopics: Set<string> = new Set();
let lastResetDate: string = new Date().toDateString();

function resetTopicsIfNewWeek(): void {
	const today = new Date();
	const dayOfWeek = today.getDay();

	if (dayOfWeek === 1 && lastResetDate !== today.toDateString()) {
		usedTopics.clear();
		lastResetDate = today.toDateString();
	}
}

function getRandomTopic(): string {
	resetTopicsIfNewWeek();

	const availableTopics = COMMERTIZE_TOPICS.filter(
		(t) => !usedTopics.has(t)
	);

	if (availableTopics.length === 0) {
		usedTopics.clear();
		return COMMERTIZE_TOPICS[
			Math.floor(Math.random() * COMMERTIZE_TOPICS.length)
		];
	}

	const topic =
		availableTopics[Math.floor(Math.random() * availableTopics.length)];
	usedTopics.add(topic);
	return topic;
}

function getRandomHashtags(count: number = 3): string[] {
	const shuffled = [...COMMERTIZE_HASHTAGS].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

async function generateImagePrompt(
	openai: OpenAI,
	topic: string,
	tweetText: string
): Promise<string> {
	const systemPrompt = `You are an expert at creating DALL-E image prompts for professional corporate content. Create prompts that result in clean, modern, and sophisticated visuals suitable for a premium real estate investment platform.

Style guidelines:
- Professional and corporate aesthetic
- Clean, minimalist design
- Gold (#D4A024) and white color scheme preferred
- Modern architecture and technology themes
- Abstract representations of concepts
- High-end, luxurious feel
- No text or logos in the image
- Photorealistic or high-quality 3D render style`;

	const userPrompt = `Create a DALL-E image prompt for a tweet about: ${topic}

Tweet content for context: "${tweetText}"

The image should:
1. Be visually striking and professional
2. Represent the concept abstractly or through modern architecture/technology
3. Use a color palette of white, gold, and subtle grays
4. Feel premium and trustworthy
5. Be suitable for a financial/real estate brand

Respond with ONLY the DALL-E prompt, nothing else. Keep it under 200 characters.`;

	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			max_tokens: 100,
			temperature: 0.7,
		});

		return (
			completion.choices[0].message.content?.trim() ||
			"Modern glass skyscraper with golden hour lighting, minimalist architecture, white and gold color scheme, professional corporate photography"
		);
	} catch (error) {
		console.error("Failed to generate image prompt:", error);
		return "Modern commercial real estate building, golden sunlight, clean minimalist design, professional corporate photography";
	}
}

aiContent.post("/tweet", async (c) => {
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});

	try {
		const topic = getRandomTopic();
		const hashtags = getRandomHashtags(3);

		const systemPrompt = `You are a professional social media manager for Commertize, a premium real estate investment platform that enables tokenized property investments. Your tone is professional, corporate, and authoritative while being accessible.

Key brand messages:
- Commertize is transforming commercial real estate through tokenization
- We democratize access to institutional-grade real estate investments
- Our AI-powered platform provides smart investment insights
- We bridge traditional finance with DeFi through RWA tokenization
- We offer fractional ownership, enhanced liquidity, and diversification

Writing guidelines:
- Professional and corporate tone
- Confident but not arrogant
- Educational and informative
- Forward-thinking and innovative
- Never use emojis
- Keep tweets concise and impactful`;

		const userPrompt = `Write a single tweet (max 240 characters to leave room for hashtags) about: ${topic}

The tweet should:
1. Be thought-provoking and valuable
2. Position Commertize as an industry leader
3. Appeal to sophisticated investors
4. Be original and engaging

Do NOT include hashtags in your response - they will be added separately.
Do NOT use emojis.
Respond with ONLY the tweet text, nothing else.`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			max_tokens: 150,
			temperature: 0.8,
		});

		let tweetText = completion.choices[0].message.content?.trim() || "";
		tweetText = tweetText.replace(/^["']|["']$/g, "");

		const hashtagString = hashtags.join(" ");
		const maxTextLength = 280 - hashtagString.length - 2;

		if (tweetText.length > maxTextLength) {
			tweetText = tweetText.substring(0, maxTextLength - 3) + "...";
		}

		const fullTweet = `${tweetText}\n\n${hashtagString}`;

		const imagePrompt = await generateImagePrompt(openai, topic, tweetText);

		return c.json({
			text: fullTweet,
			topic,
			imagePrompt,
		} as GeneratedContent);
	} catch (error: any) {
		console.error("Failed to generate tweet content:", error);
		return c.json(
			{ error: "Failed to generate content", details: error.message },
			500
		);
	}
});

export default aiContent;

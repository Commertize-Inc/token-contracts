import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import OpenAI from "openai";
import { HonoEnv } from "../types";

const chat = new Hono<HonoEnv>();

// Protect all chat routes - requires Privy JWT token
chat.use("*", authMiddleware);

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(userId: string): {
	allowed: boolean;
	retryAfter?: number;
} {
	const now = Date.now();
	const userLimit = rateLimitMap.get(userId);

	if (!userLimit || now > userLimit.resetTime) {
		rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return { allowed: true };
	}

	if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
		const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
		return { allowed: false, retryAfter };
	}

	userLimit.count++;
	return { allowed: true };
}

// Cleanup interval
setInterval(() => {
	const now = Date.now();
	for (const [key, value] of rateLimitMap.entries()) {
		if (now > value.resetTime) {
			rateLimitMap.delete(key);
		}
	}
}, 60 * 1000);

const SYSTEM_PROMPT = `You are RUNE.CTZ, an AI assistant for Commertize - a tokenized commercial real estate platform.

You help users understand:
- Investment opportunities in commercial real estate
- How tokenization works (fractional ownership via blockchain)
- Market trends and analysis
- The benefits of fractional ownership
- Regulatory framework and compliance
- Portfolio diversification strategies

Be helpful, professional, and concise. Use clear language that both experienced and new investors can understand.
When discussing investments, always remind users that all investments carry risk and to do their own research.`;

function generateSuggestedActions(
	userMessage: string,
	assistantResponse: string
): string[] {
	const lowerMessage = userMessage.toLowerCase();
	const lowerResponse = assistantResponse.toLowerCase();

	if (lowerMessage.includes("invest") || lowerMessage.includes("buy")) {
		return ["View listings", "Risk assessment", "How to start"];
	}
	if (lowerMessage.includes("token") || lowerMessage.includes("blockchain")) {
		return ["Benefits of tokenization", "How it works", "Security"];
	}
	if (lowerMessage.includes("market") || lowerMessage.includes("trend")) {
		return ["Current opportunities", "Market analysis", "Sector breakdown"];
	}
	if (
		lowerResponse.includes("portfolio") ||
		lowerResponse.includes("diversif")
	) {
		return ["Diversification tips", "Asset allocation", "Risk management"];
	}
	return ["Learn more", "View listings", "Contact support"];
}

chat.post("/", async (c) => {
	const userId = c.get("userId"); // userId is already typed as string by HonoEnv generic

	// Rate Limit Check
	const rateLimit = checkRateLimit(userId);
	if (!rateLimit.allowed) {
		return c.json(
			{
				error: `Too many requests. Please wait ${rateLimit.retryAfter} seconds.`,
			},
			429,
			{ "Retry-After": String(rateLimit.retryAfter) }
		);
	}

	try {
		const body = await c.req.json();
		const { message, context } = body;

		if (!message || typeof message !== "string") {
			return c.json({ error: "Message is required" }, 400);
		}
		if (message.length > 2000) {
			return c.json({ error: "Message too long (max 2000 characters)" }, 400);
		}

		const validRoles = ["user", "assistant"];
		const contextMessages: ChatMessage[] = (
			Array.isArray(context) ? context : []
		)
			.filter(
				(msg: unknown): msg is ChatMessage =>
					typeof msg === "object" &&
					msg !== null &&
					"role" in msg &&
					"content" in msg &&
					typeof (msg as any).role === "string" &&
					typeof (msg as any).content === "string" &&
					validRoles.includes((msg as any).role)
			)
			.slice(-5)
			.map((msg) => ({
				role: msg.role as "user" | "assistant",
				content: msg.content.substring(0, 2000),
			}));

		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				...(contextMessages as any),
				{ role: "user", content: message },
			],
			max_tokens: 500,
			temperature: 0.7,
		});

		const assistantMessage =
			response.choices[0]?.message?.content ||
			"I apologize, but I couldn't generate a response. Please try again.";

		const suggestedActions = generateSuggestedActions(
			message,
			assistantMessage
		);

		return c.json({
			response: assistantMessage,
			suggestedActions,
		});
	} catch (error: any) {
		console.error("Chat API error:", error);
		if (error?.code === "insufficient_quota") {
			return c.json(
				{ error: "API quota exceeded. Please try again later." },
				503
			);
		}
		return c.json(
			{ error: "Failed to process your message. Please try again." },
			500
		);
	}
});

export default chat;

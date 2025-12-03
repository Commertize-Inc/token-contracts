import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { privyClient } from "@/lib/privy/client";

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

export async function POST(request: NextRequest) {
	try {
		const privyToken = request.cookies.get("privy-token")?.value;

		if (!privyToken) {
			return NextResponse.json(
				{ error: "Unauthorized - Please sign in to use the chat" },
				{ status: 401 }
			);
		}

		let privyId: string;
		try {
			const claims = await privyClient.verifyAuthToken(privyToken);
			privyId = claims.userId;
		} catch (verifyError) {
			console.error("Token verification error:", verifyError);
			return NextResponse.json(
				{ error: "Invalid session - Please sign in again" },
				{ status: 401 }
			);
		}

		const rateLimit = checkRateLimit(privyId);
		if (!rateLimit.allowed) {
			return NextResponse.json(
				{
					error: `Too many requests. Please wait ${rateLimit.retryAfter} seconds.`,
				},
				{
					status: 429,
					headers: { "Retry-After": String(rateLimit.retryAfter) },
				}
			);
		}

		let body;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 }
			);
		}

		const { message, context } = body;

		if (!message || typeof message !== "string") {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 }
			);
		}

		if (message.length > 2000) {
			return NextResponse.json(
				{ error: "Message too long (max 2000 characters)" },
				{ status: 400 }
			);
		}

		const validRoles = ["user", "assistant"];
		const contextMessages = (Array.isArray(context) ? context : [])
			.filter(
				(msg: unknown): msg is { role: string; content: string } =>
					typeof msg === "object" &&
					msg !== null &&
					"role" in msg &&
					"content" in msg &&
					typeof (msg as { role: unknown }).role === "string" &&
					typeof (msg as { content: unknown }).content === "string" &&
					validRoles.includes((msg as { role: string }).role)
			)
			.slice(-5)
			.map((msg) => ({
				role: msg.role as "user" | "assistant",
				content: msg.content.substring(0, 2000),
			}));

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				...contextMessages,
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

		return NextResponse.json({
			response: assistantMessage,
			suggestedActions,
		});
	} catch (error: unknown) {
		console.error("Chat API error:", error);

		if (error && typeof error === "object" && "code" in error && error.code === "insufficient_quota") {
			return NextResponse.json(
				{ error: "API quota exceeded. Please try again later." },
				{ status: 503 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to process your message. Please try again." },
			{ status: 500 }
		);
	}
}

function generateSuggestedActions(
	userMessage: string,
	assistantResponse: string
): string[] {
	const lowerMessage = userMessage.toLowerCase();
	const lowerResponse = assistantResponse.toLowerCase();

	if (lowerMessage.includes("invest") || lowerMessage.includes("buy")) {
		return ["View properties", "Risk assessment", "How to start"];
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

	return ["Learn more", "View properties", "Contact support"];
}

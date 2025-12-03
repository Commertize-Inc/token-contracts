import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function getClientIP(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	const realIP = request.headers.get("x-real-ip");
	return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
}

function checkRateLimit(clientId: string): {
	allowed: boolean;
	retryAfter?: number;
} {
	const now = Date.now();
	const clientLimit = rateLimitMap.get(clientId);

	if (!clientLimit || now > clientLimit.resetTime) {
		rateLimitMap.set(clientId, {
			count: 1,
			resetTime: now + RATE_LIMIT_WINDOW,
		});
		return { allowed: true };
	}

	if (clientLimit.count >= MAX_REQUESTS_PER_WINDOW) {
		const retryAfter = Math.ceil((clientLimit.resetTime - now) / 1000);
		return { allowed: false, retryAfter };
	}

	clientLimit.count++;
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

export async function POST(request: NextRequest) {
	try {
		const clientIP = getClientIP(request);
		const rateLimit = checkRateLimit(clientIP);

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

		const { message } = body;

		if (!message || typeof message !== "string") {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 }
			);
		}

		if (message.length > 500) {
			return NextResponse.json(
				{ error: "Message too long (max 500 characters)" },
				{ status: 400 }
			);
		}

		let response = "";
		let suggestedActions: string[] = [];

		const messageLower = message.toLowerCase();

		if (
			messageLower.includes("defi") ||
			messageLower.includes("nexus") ||
			messageLower.includes("lending") ||
			messageLower.includes("borrow")
		) {
			response = `💎 Commertize Nexus - CRE-Focused DeFi

Commertize Nexus is our advanced DeFi lending and borrowing platform:

• Supply Liquidity: Lend stablecoins (USDC/USDT) and earn yield
• Borrow Against Properties: Use tokenized CRE as collateral
• Automated Yield Distribution: Smart contracts distribute rental income
• Multi-Chain Support: Ethereum & Hedera blockchain

How It Works:
1. Supply stablecoins to earn 8-12% APY
2. Borrow against tokenized property tokens
3. Participate in governance with CTZ tokens

Ready to explore Nexus DeFi?`;
			suggestedActions = [
				"Visit Nexus DeFi",
				"Supply liquidity",
				"View governance",
				"Check APY rates",
			];
		} else if (
			messageLower.includes("omnigrid") ||
			messageLower.includes("green") ||
			messageLower.includes("solar") ||
			messageLower.includes("renewable")
		) {
			response = `🌱 OmniGrid - Green Infrastructure

OmniGrid is Commertize's renewable energy vertical:

• Solar Farms: Utility-scale solar installations
• Data Centers: Renewable-powered computing facilities
• Wind Farms: Large-scale wind energy projects
• Battery Storage: Grid-scale energy storage

Why OmniGrid?
• Invest in clean energy transition
• Earn from renewable revenue streams
• Portfolio diversification with green infrastructure`;
			suggestedActions = [
				"View OmniGrid projects",
				"Solar farm opportunities",
				"Data center assets",
			];
		} else if (
			messageLower.includes("creusd") ||
			messageLower.includes("stablecoin")
		) {
			response = `💵 CREUSD - Stablecoin for Real Estate

CREUSD is Commertize's stablecoin for commercial real estate:

• CRE-Optimized: For property transactions and yield
• Overcollateralized: Backed by tokenized assets
• Transparent: Real-time attestations
• Bridge to TradFi: Seamless USDC/USDT conversion

Use Cases:
• Property investments and yield payments
• DeFi vault deposits (Nexus platform)
• Cross-border real estate transactions`;
			suggestedActions = [
				"CREUSD vs USDC",
				"Stablecoin mechanics",
				"Investment use cases",
			];
		} else if (
			messageLower.includes("tokeniz") ||
			messageLower.includes("how") ||
			messageLower.includes("work")
		) {
			response = `⚙️ How Tokenization Works

Commertize transforms real estate into digital tokens:

1. Property Selection: Vetted commercial properties
2. Legal Structure: SEC-compliant SPV creation
3. Token Issuance: ERC-3643 compliant tokens
4. Investor Access: Fractional ownership from $1,000
5. Yield Distribution: Automated rental income

Benefits:
• Fractional ownership (no $1M+ minimums)
• 24/7 liquidity on secondary markets
• Transparent blockchain tracking`;
			suggestedActions = [
				"View properties",
				"Start investing",
				"Security tokens explained",
			];
		} else if (
			messageLower.includes("invest") ||
			messageLower.includes("opportunit") ||
			messageLower.includes("propert")
		) {
			response = `🏢 Investment Opportunities

Commertize offers tokenized commercial real estate:

• Office Buildings: Class A properties in major metros
• Industrial: Warehouses and logistics centers
• Retail: Shopping centers and mixed-use
• Multifamily: Large apartment complexes

Target Returns: 8-12% annual yield
Minimum Investment: $1,000
Liquidity: Secondary market trading`;
			suggestedActions = [
				"View marketplace",
				"Property analysis",
				"Start KYC process",
			];
		} else if (
			messageLower.includes("market") ||
			messageLower.includes("trend") ||
			messageLower.includes("cap rate")
		) {
			response = `📊 CRE Market Insights

Current market highlights:

• Cap Rates: 6-8% across major markets
• Occupancy: Office recovering, industrial strong
• Investment Volume: $400B+ annually in U.S.
• Tokenization Growth: Digital real estate expanding
• Yield Opportunities: 8-12% target returns

Want property-specific analysis?`;
			suggestedActions = [
				"Property analysis",
				"Market comparisons",
				"Investment calculator",
			];
		} else if (
			messageLower.includes("qualify") ||
			messageLower.includes("requirement") ||
			messageLower.includes("kyc")
		) {
			response = `✅ Investment Qualification

Our tokenized approach makes investing accessible:

• Minimum Investment: $1,000 to start
• Accreditation: Required for Reg D offerings
• Simple KYC: Basic identity verification
• Payment Methods: USD, USDC, other digital assets
• Global Access: Invest from anywhere with compliance

Ready to start your investment journey?`;
			suggestedActions = [
				"Start KYC process",
				"View properties",
				"Payment options",
			];
		} else if (
			messageLower.includes("regulat") ||
			messageLower.includes("compliance") ||
			messageLower.includes("sec")
		) {
			response = `⚖️ Regulatory Framework

Commertize operates within robust frameworks:

• Reg D 506(c) compliant tokenized securities
• Proper investor accreditation and KYC/AML
• SEC-compliant transfer restrictions
• Global standards (U.S., EU MiCA, Singapore MAS)
• Regular third-party audits

Trust and transparency are our foundation.`;
			suggestedActions = [
				"GENIUS Act details",
				"Investor requirements",
				"Audit reports",
			];
		} else {
			response = `👋 Hello! I'm RUNE.CTZ, your AI guide to Commertize.

I can help you explore:

• 🏢 Tokenized commercial real estate investments
• 💎 Nexus DeFi (lending & borrowing)
• 🌱 OmniGrid green infrastructure
• 📊 Market trends and analysis
• ⚖️ Regulatory compliance

What interests you most?`;
			suggestedActions = [
				"Investment opportunities",
				"How tokenization works",
				"Nexus DeFi",
				"OmniGrid projects",
			];
		}

		return NextResponse.json({ response, suggestedActions });
	} catch (error: unknown) {
		console.error("Chat API error:", error);
		return NextResponse.json(
			{
				response:
					"I apologize, but I'm experiencing technical difficulties. Please try again.",
				suggestedActions: ["Try again", "Contact support"],
			},
			{ status: 500 }
		);
	}
}

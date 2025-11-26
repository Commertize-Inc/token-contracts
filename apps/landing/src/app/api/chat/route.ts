import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai/client';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

function checkRateLimit(clientId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const clientLimit = rateLimitMap.get(clientId);

  if (!clientLimit || now > clientLimit.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
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

const SYSTEM_PROMPT = `You are RUNE.CTZ, an AI assistant for Commertize - a tokenized commercial real estate platform.

You help users understand:
- Investment opportunities in commercial real estate
- How tokenization works (fractional ownership via blockchain)
- Benefits of the Commertize platform
- Basic information about the real estate market
- How to get started with investing

Be helpful, professional, and concise. Use clear language that both experienced and new investors can understand.
When discussing investments, always remind users that all investments carry risk and to do their own research.
Keep responses focused and under 150 words for a better chat experience.`;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateLimit.retryAfter} seconds.` },
        { 
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter) }
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

    if (!message || typeof message !== 'string') {
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

    const validRoles = ['user', 'assistant'];
    const contextMessages = (Array.isArray(context) ? context : [])
      .filter((msg: unknown): msg is { role: string; content: string } => 
        typeof msg === 'object' &&
        msg !== null &&
        'role' in msg &&
        'content' in msg &&
        typeof (msg as { role: unknown }).role === 'string' &&
        typeof (msg as { content: unknown }).content === 'string' &&
        validRoles.includes((msg as { role: string }).role)
      )
      .slice(-3)
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content.substring(0, 500),
      }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...contextMessages,
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    return NextResponse.json({
      response: assistantMessage,
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    
    if (error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process your message. Please try again." },
      { status: 500 }
    );
  }
}

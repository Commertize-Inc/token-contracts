// import { NextRequest, NextResponse } from 'next/server';
// import { getNewsArticles } from '../../../../lib/db'; // Missing dependency, commented out

// Mock types for Vite environment since 'next/server' is not available
type NextRequest = any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NextResponse = {
	json: (body: any, _init?: any) => body,
};

// Mock db for now since lib/db might also be missing or different
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewsArticles = async (_limit: number, _category?: string) => [];

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "10");
		const category = searchParams.get("category") || undefined;

		const articles = await getNewsArticles(limit, category);

		return NextResponse.json({
			data: articles,
			total: articles.length,
		});
	} catch (error) {
		console.error("Error fetching news articles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch articles", data: [] }
			// { status: 500 }
		);
	}
}

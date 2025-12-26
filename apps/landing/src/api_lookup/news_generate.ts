// import { NextRequest, NextResponse } from 'next/server';

// Mock types for Vite environment since 'next/server' is not available
type NextRequest = any;
const NextResponse = {
	json: (body: any, _init?: any) => body,
};

export async function POST(_request: NextRequest) {
	return NextResponse.json({
		success: true,
		message:
			"This is a stub for the news generation API. Migration to backend required.",
		articles: [],
	});
}

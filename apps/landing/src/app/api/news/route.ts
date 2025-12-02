import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticles } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;

    const articles = await getNewsArticles(limit, category);

    return NextResponse.json({
      data: articles,
      total: articles.length,
    });
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles', data: [] },
      { status: 500 }
    );
  }
}

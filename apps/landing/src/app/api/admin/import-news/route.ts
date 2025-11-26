import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../lib/db';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface ArticleInput {
  slug?: string;
  title: string;
  summary: string;
  content?: string;
  category: string;
  tags?: string[];
  imageUrl?: string;
  readTime?: number;
  publishedAt?: string;
  isGenerated?: boolean;
  isPublished?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { articles } = await request.json();

    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json(
        { error: 'Articles array is required' },
        { status: 400 }
      );
    }

    const pool = getPool();
    let imported = 0;
    let skipped = 0;

    for (const article of articles as ArticleInput[]) {
      const id = generateUUID();
      const slug = article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const readTime = article.readTime || Math.ceil((article.content?.length || article.summary.length) / 1000) || 3;
      const publishedAt = article.publishedAt || new Date().toISOString();
      const isGenerated = article.isGenerated ?? false;
      const isPublished = article.isPublished ?? true;

      try {
        await pool.query(
          `INSERT INTO news_article (id, slug, title, summary, content, category, tags, image_url, read_time, published_at, is_generated, is_published, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
           ON CONFLICT (slug) DO NOTHING`,
          [
            id,
            slug,
            article.title,
            article.summary,
            article.content || '',
            article.category,
            article.tags || [],
            article.imageUrl || null,
            readTime,
            publishedAt,
            isGenerated,
            isPublished
          ]
        );
        imported++;
      } catch (err: any) {
        if (err.code === '23505') {
          skipped++;
        } else {
          console.error('Error inserting article:', err);
          skipped++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      imported,
      skipped,
      total: articles.length 
    });

  } catch (error: any) {
    console.error('Import news error:', error);
    return NextResponse.json(
      { error: 'Failed to import articles', details: error.message },
      { status: 500 }
    );
  }
}

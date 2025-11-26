import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  category: string;
  imageUrl: string;
  readTime: number;
  publishedAt: string;
  generatedAt?: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'news-articles.json');

const defaultArticles: Article[] = [
  {
    id: "1",
    title: "Tokenization Revolutionizes Commercial Real Estate",
    slug: "tokenization-revolutionizes-cre",
    summary: "How blockchain technology is transforming property investment and ownership.",
    content: "The commercial real estate industry is undergoing a fundamental transformation as tokenization technology enables fractional ownership of premium properties. This shift is democratizing access to institutional-grade investments that were previously reserved for high-net-worth individuals and large institutions.\n\nBlockchain-based tokenization allows properties to be divided into digital tokens, each representing a fraction of ownership. This innovation reduces minimum investment thresholds from hundreds of thousands of dollars to as little as $100, opening doors for retail investors.\n\nIndustry experts predict that tokenized real estate could reach $1.4 trillion by 2027, driven by increased liquidity, transparency, and 24/7 trading capabilities that traditional real estate lacks.",
    category: "Tokenization",
    imageUrl: "/assets/building-modern.jpg",
    readTime: 5,
    publishedAt: "Nov 25, 2025"
  },
  {
    id: "2",
    title: "The Future of Fractional Property Investment",
    slug: "future-fractional-investment",
    summary: "Exploring how fractional ownership is democratizing real estate access.",
    content: "Fractional real estate investment is rapidly gaining momentum as technology platforms make it easier than ever to own shares in commercial properties. This democratization of real estate ownership is reshaping how investors build diversified portfolios.\n\nUnlike traditional REITs, fractional ownership through tokenization provides direct exposure to specific properties, giving investors more control and transparency over their investments. Smart contracts automate dividend distributions and governance, reducing operational costs.\n\nThe convergence of DeFi protocols with real estate tokenization is creating new opportunities for yield generation, including staking, lending, and liquidity provision backed by real-world assets.",
    category: "Markets",
    imageUrl: "/assets/building-tall.jpg",
    readTime: 4,
    publishedAt: "Nov 24, 2025"
  },
  {
    id: "3",
    title: "AI-Powered Property Valuation Models",
    slug: "ai-property-valuation",
    summary: "Machine learning is changing how we assess commercial property values.",
    content: "Artificial intelligence is revolutionizing commercial real estate valuation, enabling more accurate and timely property assessments. Machine learning algorithms now analyze thousands of data points including market trends, comparable sales, economic indicators, and even satellite imagery.\n\nThese AI-powered models can identify patterns and correlations that human analysts might miss, providing investors with deeper insights into property performance and risk factors. Real-time valuation updates help tokenized property platforms maintain accurate pricing.\n\nThe integration of AI with blockchain oracles ensures that on-chain property valuations reflect current market conditions, enhancing investor confidence in tokenized real estate markets.",
    category: "Technology",
    imageUrl: "/assets/building-curved.jpg",
    readTime: 6,
    publishedAt: "Nov 23, 2025"
  },
];

const imageUrls = [
  "/assets/building-modern.jpg",
  "/assets/building-tall.jpg", 
  "/assets/building-curved.jpg",
];

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readArticles(): Promise<Article[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeArticles(articles: Article[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(articles, null, 2));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeGenerated = searchParams.get('includeGenerated') !== 'false';
  const limit = parseInt(searchParams.get('limit') || '6');
  
  const generatedArticles = await readArticles();
  
  let articles: Article[] = [];
  
  if (includeGenerated && generatedArticles.length > 0) {
    articles = [...generatedArticles, ...defaultArticles];
  } else {
    articles = [...defaultArticles];
  }
  
  return NextResponse.json({
    articles: articles.slice(0, limit),
    total: articles.length,
    hasGenerated: generatedArticles.length > 0,
    generatedCount: generatedArticles.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { articles } = await request.json();
    
    if (Array.isArray(articles)) {
      const articlesToSave: Article[] = articles.map((article, index) => ({
        ...article,
        imageUrl: article.imageUrl || imageUrls[index % imageUrls.length],
      }));
      
      const existingArticles = await readArticles();
      const allArticles = [...articlesToSave, ...existingArticles];
      
      await writeArticles(allArticles);
      
      return NextResponse.json({
        success: true,
        message: `Saved ${articlesToSave.length} articles (total: ${allArticles.length})`,
        articles: allArticles,
      });
    }
    
    return NextResponse.json({ error: 'Invalid articles data' }, { status: 400 });
  } catch (error) {
    console.error('Error saving articles:', error);
    return NextResponse.json({ error: 'Failed to store articles' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('id');
  
  try {
    if (articleId) {
      const articles = await readArticles();
      const filtered = articles.filter(a => a.id !== articleId);
      await writeArticles(filtered);
      return NextResponse.json({ success: true, message: `Deleted article ${articleId}` });
    } else {
      await writeArticles([]);
      return NextResponse.json({ success: true, message: 'Cleared all generated articles' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete articles' }, { status: 500 });
  }
}

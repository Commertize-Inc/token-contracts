"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const articlesData: Record<string, {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
  readTime: number;
  publishedAt: string;
}> = {
  "tokenization-revolutionizes-cre": {
    id: "1",
    title: "Tokenization Revolutionizes Commercial Real Estate",
    slug: "tokenization-revolutionizes-cre",
    summary: "How blockchain technology is transforming property investment and ownership.",
    content: `
      <p>The commercial real estate industry is undergoing a fundamental transformation. Tokenization—the process of converting real estate assets into digital tokens on a blockchain—is reshaping how properties are bought, sold, and managed.</p>
      
      <h2>What is Real Estate Tokenization?</h2>
      <p>Real estate tokenization involves creating digital tokens that represent ownership shares in a property. These tokens are stored on a blockchain, providing transparent, immutable records of ownership and transactions.</p>
      
      <h2>Key Benefits</h2>
      <p><strong>Fractional Ownership:</strong> Investors can purchase small portions of high-value properties, lowering the barrier to entry from millions to thousands of dollars.</p>
      <p><strong>Increased Liquidity:</strong> Unlike traditional real estate investments with long lock-up periods, tokenized assets can be traded on secondary markets.</p>
      <p><strong>Global Access:</strong> Blockchain technology enables investors worldwide to participate in previously inaccessible markets.</p>
      <p><strong>Transparency:</strong> All transactions are recorded on an immutable ledger, reducing fraud and increasing trust.</p>
      
      <h2>The Future of CRE Investment</h2>
      <p>As regulatory frameworks mature and institutional adoption increases, tokenization is poised to become the standard for commercial real estate investment. Platforms like Commertize are leading this transformation, making institutional-grade real estate accessible to a broader investor base.</p>
    `,
    category: "Tokenization",
    tags: ["Blockchain", "Real Estate", "Investment", "DeFi"],
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop",
    readTime: 5,
    publishedAt: "Jan 15, 2025"
  },
  "future-fractional-investment": {
    id: "2",
    title: "The Future of Fractional Property Investment",
    slug: "future-fractional-investment",
    summary: "Exploring how fractional ownership is democratizing real estate access.",
    content: `
      <p>Fractional property investment is democratizing access to commercial real estate, allowing everyday investors to participate in markets once reserved for institutions and ultra-high-net-worth individuals.</p>
      
      <h2>Breaking Down Barriers</h2>
      <p>Traditional commercial real estate investments typically require minimum investments of $1 million or more. Fractional ownership through tokenization reduces this to as little as $25,000, opening doors for accredited investors seeking portfolio diversification.</p>
      
      <h2>How It Works</h2>
      <p>Properties are divided into digital shares or tokens. Each token represents a proportional ownership stake in the underlying asset. Token holders receive their share of rental income and benefit from property appreciation.</p>
      
      <h2>Market Growth</h2>
      <p>The fractional real estate market is projected to grow significantly over the next decade. Analysts estimate the tokenized real estate market could reach $1.4 trillion by 2030, driven by increasing investor demand for alternative assets and improved regulatory clarity.</p>
      
      <h2>Considerations for Investors</h2>
      <p>While fractional ownership offers exciting opportunities, investors should consider factors such as platform reputation, underlying asset quality, fee structures, and liquidity options before investing.</p>
    `,
    category: "Markets",
    tags: ["Fractional Ownership", "Investment", "Accessibility"],
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop",
    readTime: 4,
    publishedAt: "Jan 10, 2025"
  },
  "ai-property-valuation": {
    id: "3",
    title: "AI-Powered Property Valuation Models",
    slug: "ai-property-valuation",
    summary: "Machine learning is changing how we assess commercial property values.",
    content: `
      <p>Artificial intelligence is revolutionizing property valuation, bringing unprecedented accuracy and speed to one of real estate's most critical processes.</p>
      
      <h2>Traditional vs. AI Valuation</h2>
      <p>Traditional property appraisals rely heavily on comparable sales and manual analysis, a process that can take weeks and be subject to human bias. AI-powered models can analyze thousands of data points in seconds, providing more consistent and objective valuations.</p>
      
      <h2>Data-Driven Insights</h2>
      <p>Modern AI valuation models incorporate diverse data sources including:</p>
      <p>• Historical transaction data<br/>
      • Market trends and economic indicators<br/>
      • Property characteristics and condition<br/>
      • Location analytics and demographics<br/>
      • Satellite imagery and environmental factors</p>
      
      <h2>Benefits for Investors</h2>
      <p><strong>Real-Time Valuations:</strong> Track property values continuously rather than relying on periodic appraisals.</p>
      <p><strong>Risk Assessment:</strong> AI models can identify potential risks and opportunities that human analysts might miss.</p>
      <p><strong>Portfolio Optimization:</strong> Make data-driven decisions about when to buy, hold, or sell assets.</p>
      
      <h2>The Commertize Approach</h2>
      <p>At Commertize, we leverage advanced AI models to provide our investors with accurate, real-time property valuations, ensuring transparency and informed decision-making across our tokenized real estate offerings.</p>
    `,
    category: "Technology",
    tags: ["AI", "Machine Learning", "Valuation", "PropTech"],
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop",
    readTime: 6,
    publishedAt: "Jan 5, 2025"
  }
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Tokenization': 'bg-purple-100 text-purple-800 border-purple-200',
    'Markets': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Technology': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const article = articlesData[slug];

  const handleShare = async () => {
    if (!article) return;
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">Article Not Found</h1>
          <Link href="/" className="inline-flex items-center gap-2 text-[#D4A024] hover:underline font-light">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#D4A024] text-[#D4A024] rounded-lg hover:bg-[#D4A024]/10 transition-colors font-light"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <button 
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-[#D4A024] hover:text-[#D4A024] transition-colors font-light"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>

          <article className="bg-white rounded-2xl border-2 border-[#D4A024] shadow-xl overflow-hidden">
            {article.imageUrl && (
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                </div>
              </div>
            )}

            <div className="p-6 md:p-10">
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1 px-3 py-1 bg-[#D4A024]/10 rounded-full">
                  <Calendar size={14} className="text-[#D4A024]" />
                  <span className="font-light">{article.publishedAt}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-[#D4A024]/10 rounded-full">
                  <Clock size={14} className="text-[#D4A024]" />
                  <span className="font-light">{article.readTime} min read</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              <p className="text-lg text-gray-700 font-light leading-relaxed mb-8 p-4 bg-[#D4A024]/5 border-l-4 border-[#D4A024] rounded-r-lg">
                {article.summary}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-light border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div 
                className="prose prose-lg max-w-none
                  prose-headings:font-light prose-headings:text-gray-900
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[#D4A024]/20 prose-h2:pb-2
                  prose-p:text-gray-700 prose-p:font-light prose-p:leading-relaxed
                  prose-strong:text-gray-900 prose-strong:font-medium
                  prose-a:text-[#D4A024] prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-12 pt-8 border-t border-[#D4A024]/20 bg-[#D4A024]/5 -mx-6 md:-mx-10 px-6 md:px-10 pb-6 rounded-b-lg">
                <div className="text-center">
                  <div className="w-16 h-px bg-[#D4A024] mx-auto mb-4" />
                  <p className="text-sm text-gray-600 font-light">
                    Information is for educational purposes and should not be considered financial advice.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </motion.div>
      </div>
    </div>
  );
}

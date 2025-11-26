"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ArrowRight, Loader2, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content?: string;
  category: string;
  tags?: string[];
  imageUrl?: string;
  readTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Tokenization': 'bg-purple-100 text-purple-700',
    'Markets': 'bg-yellow-100 text-yellow-700',
    'Technology': 'bg-indigo-100 text-indigo-700',
    'Regulation': 'bg-red-100 text-red-700',
    'DeFi': 'bg-cyan-100 text-cyan-700',
    'RWA': 'bg-green-100 text-green-700',
    'Crypto': 'bg-orange-100 text-orange-700',
    'Infrastructure': 'bg-teal-100 text-teal-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const fallbackArticles: NewsArticle[] = [
  {
    id: "1",
    slug: "tokenization-revolutionizes-cre",
    title: "Tokenization Revolutionizes Commercial Real Estate",
    summary: "How blockchain technology is transforming property investment and ownership.",
    category: "Tokenization",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    readTime: 5,
    publishedAt: "Jan 15, 2025",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "2",
    slug: "future-fractional-investment",
    title: "The Future of Fractional Property Investment",
    summary: "Exploring how fractional ownership is democratizing real estate access.",
    category: "Markets",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    readTime: 4,
    publishedAt: "Jan 10, 2025",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "3",
    slug: "ai-property-valuation",
    title: "AI-Powered Property Valuation Models",
    summary: "Machine learning is changing how we assess commercial property values.",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
    readTime: 6,
    publishedAt: "Jan 5, 2025",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "4",
    slug: "understanding-rwa-tokenization",
    title: "Understanding Real-World Asset (RWA) Tokenization",
    summary: "A comprehensive guide to how real-world assets are being brought on-chain.",
    category: "Tokenization",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop",
    readTime: 7,
    publishedAt: "Dec 28, 2024",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "5",
    slug: "institutional-defi-real-estate",
    title: "The Rise of Institutional DeFi in Real Estate",
    summary: "How traditional institutions are embracing decentralized finance for property investments.",
    category: "Markets",
    imageUrl: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=600&h=400&fit=crop",
    readTime: 5,
    publishedAt: "Dec 20, 2024",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "6",
    slug: "smart-contracts-cre",
    title: "Smart Contracts in Commercial Real Estate Transactions",
    summary: "Automating complex property transactions with blockchain technology.",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop",
    readTime: 6,
    publishedAt: "Dec 15, 2024",
    createdAt: "",
    updatedAt: ""
  }
];

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/news?limit=12');
        if (!response.ok) throw new Error('Failed to fetch articles');
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          setArticles(result.data);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticles();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-[#D4A024]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#D4A024] text-[#D4A024] rounded-lg hover:bg-[#D4A024]/10 transition-colors font-light"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 flex items-center justify-center gap-3">
              News & <span className="text-[#D4A024]">Insights</span>
              <div className="relative">
                <div className="w-3 h-2 bg-[#D4A024] rounded-sm animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-2 bg-[#D4A024]/50 rounded-sm animate-ping"></div>
              </div>
            </h1>
            <div className="w-24 h-1 bg-[#D4A024] mx-auto mb-6 rounded-full" />
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Stay informed with the latest developments in commercial real estate and tokenization
            </p>
            {articles[0]?.publishedAt && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-light mt-4">
                <Calendar size={14} />
                Last updated: {formatDate(articles[0].publishedAt)}
              </div>
            )}
          </div>

          {error ? (
            <div className="text-center py-16">
              <p className="text-gray-600 font-light">{error}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-[#D4A024] shadow-lg p-12 text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 mb-6 rounded-full bg-[#D4A024]/10 flex items-center justify-center mx-auto"
              >
                <Newspaper className="h-8 w-8 text-[#D4A024]" />
              </motion.div>
              <h3 className="text-xl font-light text-gray-900 mb-2">No Articles Available</h3>
              <p className="text-gray-600 font-light max-w-md mx-auto">
                New articles are published daily. Check back soon for the latest insights on commercial real estate and tokenization.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/news/${article.slug}`}>
                    <div className="bg-white rounded-2xl shadow-sm border-2 border-[#D4A024] overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                      <div className="cursor-pointer h-full flex flex-col">
                        <div className="relative h-48 overflow-hidden flex-shrink-0 bg-gray-200">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Newspaper className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-light ${getCategoryColor(article.category)}`}>
                              {article.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-lg font-light text-gray-900 mb-3 line-clamp-2 group-hover:text-[#D4A024] transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm font-light mb-4 flex-1 line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{formatDate(article.publishedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{article.readTime} min</span>
                            </div>
                          </div>
                          <div className="mt-4 text-[#D4A024] flex items-center gap-2 text-sm font-light group-hover:gap-3 transition-all">
                            Read More <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

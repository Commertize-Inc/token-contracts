"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const allArticles = [
  {
    id: "1",
    title: "Tokenization Revolutionizes Commercial Real Estate",
    slug: "tokenization-revolutionizes-cre",
    summary: "How blockchain technology is transforming property investment and ownership.",
    category: "Tokenization",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    readTime: 5,
    publishedAt: "Jan 15, 2025"
  },
  {
    id: "2",
    title: "The Future of Fractional Property Investment",
    slug: "future-fractional-investment",
    summary: "Exploring how fractional ownership is democratizing real estate access.",
    category: "Markets",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    readTime: 4,
    publishedAt: "Jan 10, 2025"
  },
  {
    id: "3",
    title: "AI-Powered Property Valuation Models",
    slug: "ai-property-valuation",
    summary: "Machine learning is changing how we assess commercial property values.",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
    readTime: 6,
    publishedAt: "Jan 5, 2025"
  },
  {
    id: "4",
    title: "Understanding Real-World Asset (RWA) Tokenization",
    slug: "understanding-rwa-tokenization",
    summary: "A comprehensive guide to how real-world assets are being brought on-chain.",
    category: "Tokenization",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop",
    readTime: 7,
    publishedAt: "Dec 28, 2024"
  },
  {
    id: "5",
    title: "The Rise of Institutional DeFi in Real Estate",
    slug: "institutional-defi-real-estate",
    summary: "How traditional institutions are embracing decentralized finance for property investments.",
    category: "Markets",
    imageUrl: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=600&h=400&fit=crop",
    readTime: 5,
    publishedAt: "Dec 20, 2024"
  },
  {
    id: "6",
    title: "Smart Contracts in Commercial Real Estate Transactions",
    slug: "smart-contracts-cre",
    summary: "Automating complex property transactions with blockchain technology.",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop",
    readTime: 6,
    publishedAt: "Dec 15, 2024"
  }
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Tokenization': 'bg-purple-100 text-purple-700',
    'Markets': 'bg-yellow-100 text-yellow-700',
    'Technology': 'bg-indigo-100 text-indigo-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

export default function NewsPage() {
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
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              News & <span className="text-[#D4A024]">Insights</span>
            </h1>
            <div className="w-24 h-1 bg-[#D4A024] mx-auto mb-6 rounded-full" />
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Stay informed with the latest developments in commercial real estate and tokenization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allArticles.map((article, index) => (
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
                        {article.imageUrl && (
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
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
                            <span>{article.publishedAt}</span>
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
        </motion.div>
      </div>
    </div>
  );
}

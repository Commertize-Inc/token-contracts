"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Share2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

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
    'Tokenization': 'bg-purple-100 text-purple-800 border-purple-200',
    'Markets': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Technology': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Regulation': 'bg-red-100 text-red-800 border-red-200',
    'DeFi': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'RWA': 'bg-green-100 text-green-800 border-green-200',
    'Crypto': 'bg-orange-100 text-orange-800 border-orange-200',
    'Infrastructure': 'bg-teal-100 text-teal-800 border-teal-200',
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      
      try {
        const response = await fetch(`/api/news/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Article not found');
          } else {
            throw new Error('Failed to fetch article');
          }
          return;
        }
        const result = await response.json();
        setArticle(result.data);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  const handleShare = async () => {
    if (!article) return;
    
    const shareData = {
      title: article.title,
      text: article.summary,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    }
  };

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

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-gray-900 mb-4">{error || 'Article Not Found'}</h1>
          <Link 
            href="/news" 
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#D4A024] text-[#D4A024] rounded-lg hover:bg-[#D4A024]/10 transition-colors font-light"
          >
            <ArrowLeft size={16} />
            Back to News
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
              href="/news" 
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#D4A024] text-[#D4A024] rounded-lg hover:bg-[#D4A024]/10 transition-colors font-light"
            >
              <ArrowLeft size={16} />
              Back to News
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
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop';
                  }}
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
                  <span className="font-light">{formatDate(article.publishedAt)}</span>
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

              {article.tags && article.tags.length > 0 && (
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
              )}

              {article.content && (
                <div 
                  className="prose prose-lg max-w-none
                    prose-headings:font-light prose-headings:text-gray-900
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[#D4A024]/20 prose-h2:pb-2
                    prose-p:text-gray-700 prose-p:font-light prose-p:leading-relaxed
                    prose-strong:text-gray-900 prose-strong:font-medium
                    prose-a:text-[#D4A024] prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}

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

      <Footer />
    </div>
  );
}

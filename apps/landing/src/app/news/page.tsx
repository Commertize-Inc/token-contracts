"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

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

const getCategoryColor = () => {
	return "bg-[#D4A024]";
};

const formatDate = (dateString: string) => {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString;
		return date.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
};

const formatLastUpdated = (dateString: string) => {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString;
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateString;
	}
};

const fallbackArticles: NewsArticle[] = [
	{
		id: "1",
		slug: "commercial-real-estate-institutional-stability",
		title:
			"Commercial Real Estate Market Demonstrates Institutional-Grade Stability",
		summary:
			"Comprehensive analysis reveals that commercial real estate markets are exhibiting sophisticated adaptive mechanisms in response to evolving economic conditions.",
		category: "CRE",
		imageUrl:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
		readTime: 8,
		publishedAt: new Date().toISOString(),
		createdAt: "",
		updatedAt: "",
	},
	{
		id: "2",
		slug: "financial-markets-tokenization-trends",
		title: "Financial Markets Adapt to Real Estate Tokenization Trends",
		summary:
			"Traditional financial markets are evolving to accommodate real estate tokenization, with new infrastructure developments enabling seamless integration.",
		category: "Tokenization",
		imageUrl:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
		readTime: 5,
		publishedAt: new Date().toISOString(),
		createdAt: "",
		updatedAt: "",
	},
	{
		id: "3",
		slug: "cre-market-institutional-grade",
		title:
			"Commercial Real Estate Market Demonstrates Institutional-Grade Performance",
		summary:
			"Comprehensive analysis reveals that commercial real estate markets are exhibiting sophisticated adaptive mechanisms in response to evolving economic conditions.",
		category: "CRE",
		imageUrl:
			"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=500&fit=crop",
		readTime: 8,
		publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: "",
		updatedAt: "",
	},
	{
		id: "4",
		slug: "blockchain-property-ownership",
		title: "Blockchain Technology Transforms Property Ownership Records",
		summary:
			"Blockchain-based property registries are revolutionizing how ownership is recorded and transferred, bringing transparency to real estate transactions.",
		category: "Technology",
		imageUrl:
			"https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800&h=500&fit=crop",
		readTime: 7,
		publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: "",
		updatedAt: "",
	},
	{
		id: "5",
		slug: "defi-protocols-real-estate",
		title: "DeFi Protocols Enable New Real Estate Investment Models",
		summary:
			"Decentralized finance protocols are creating innovative pathways for real estate investment, offering enhanced liquidity and accessibility.",
		category: "DeFi",
		imageUrl:
			"https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=500&fit=crop",
		readTime: 6,
		publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: "",
		updatedAt: "",
	},
	{
		id: "6",
		slug: "institutional-investors-tokenized",
		title: "Institutional Investors Embrace Tokenized Real Estate Assets",
		summary:
			"Major institutional investors are increasingly allocating capital to tokenized real estate, signaling mainstream adoption of digital property ownership.",
		category: "CRE",
		imageUrl:
			"https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=500&fit=crop",
		readTime: 5,
		publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: "",
		updatedAt: "",
	},
];

export default function NewsPage() {
	const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
	const [lastUpdated, setLastUpdated] = useState<string>("");

	useEffect(() => {
		async function fetchArticles() {
			try {
				const response = await fetch("/api/news?limit=50");
				if (!response.ok) throw new Error("Failed to fetch articles");
				const result = await response.json();
				if (result.data && result.data.length > 0) {
					setArticles(result.data);
					setLastUpdated(formatLastUpdated(result.data[0].publishedAt));
				} else {
					setLastUpdated(formatLastUpdated(new Date().toISOString()));
				}
			} catch (err) {
				console.error("Error fetching articles:", err);
				setLastUpdated(formatLastUpdated(new Date().toISOString()));
			}
		}
		fetchArticles();
	}, []);

	return (
		<div className="min-h-screen bg-white font-logo">
			<Navbar />

			<main className="pt-24 pb-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="mb-8"
					>
						<div className="flex items-center gap-3 mb-2">
							<div className="w-8 h-[1px] bg-[#D4A024]"></div>
							<span className="text-xs tracking-[0.2em] text-[#D4A024] uppercase">
								Insights & Updates
							</span>
						</div>
						<h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">
							Latest News
						</h1>
						<div className="flex items-center gap-4">
							<p className="text-gray-500 font-light text-sm">
								Real estate tokenization, DeFi, and digital infrastructure.
							</p>
							{lastUpdated && (
								<div className="flex items-center gap-1.5 text-[#D4A024] text-xs font-light">
									<Calendar size={12} />
									<span>{lastUpdated}</span>
								</div>
							)}
						</div>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{articles.map((article, index) => (
							<motion.article
								key={article.id}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.08 }}
								className="group cursor-pointer"
							>
								<Link href={`/news/${article.slug}`}>
									<div className="bg-white rounded-xl overflow-hidden border border-[#D4A024] hover:shadow-lg transition-all duration-300 h-full flex flex-col">
										<div className="relative h-44 overflow-hidden">
											<img
												src={
													article.imageUrl ||
													"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop"
												}
												alt={article.title}
												className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
												onError={(e) => {
													const target = e.target as HTMLImageElement;
													target.src =
														"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop";
												}}
											/>
											<div className="absolute top-3 left-3">
												<span
													className={`px-3 py-1 rounded-full text-xs font-normal text-white ${getCategoryColor()}`}
												>
													{article.category}
												</span>
											</div>
										</div>

										<div className="p-5 flex flex-col flex-1 bg-white">
											<h2 className="text-base font-normal text-gray-900 mb-2 line-clamp-2 leading-tight">
												{article.title}
											</h2>
											<p className="text-gray-500 text-sm font-light mb-4 line-clamp-3 flex-1 leading-relaxed">
												{article.summary}
											</p>
											<div className="flex items-center gap-4 text-[#D4A024] text-xs">
												<div className="flex items-center gap-1.5">
													<Calendar size={12} />
													<span>{formatDate(article.publishedAt)}</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Clock size={12} />
													<span>{article.readTime} min read</span>
												</div>
											</div>
										</div>
									</div>
								</Link>
							</motion.article>
						))}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}

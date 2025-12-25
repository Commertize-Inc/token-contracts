import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import { PageHeader } from "@commertize/ui";
import { useFeatureFlag } from "@commertize/utils/client";
import { PostHogFeatureFlags } from "@commertize/utils/client";

// Navbar and Footer are in App.tsx

import { fallbackArticles, NewsArticle } from "../data/news";
import { api } from "../lib/api";

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

export default function News() {
	const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
	const [lastUpdated, setLastUpdated] = useState<string>("");

	// Check PostHog feature flag
	const isAiNewsEnabled = useFeatureFlag(PostHogFeatureFlags.NEWS_GENERATION);
	useEffect(() => {
		async function fetchArticles() {
			try {
				const result = await api.get("/news?limit=50");

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
		if (isAiNewsEnabled !== false) {
			fetchArticles();
		}
	}, [isAiNewsEnabled]);

	// If flag is explicitly false, redirect to home
	if (isAiNewsEnabled === false) {
		return <Navigate to="/" replace />;
	}

	return (
		<div className="min-h-screen bg-white font-sans">
			<SEO
				title="News & Insights - Real Estate Tokenization"
				description="Stay updated with the latest news in commercial real estate, blockchain technology, and DeFi markets."
			/>
			<main className="pb-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="mb-8"
					>
						<PageHeader
							title="Latest News"
							subtitle="Real estate tokenization, DeFi, and digital infrastructure."
							breadcrumbs={
								<div className="flex items-center gap-3 mb-2">
									<div className="w-8 h-[1px] bg-[#D4A024]"></div>
									<span className="text-xs tracking-[0.2em] text-[#D4A024] uppercase">
										Insights & Updates
									</span>
								</div>
							}
							actions={
								lastUpdated && (
									<div className="flex items-center gap-1.5 text-[#D4A024] text-xs font-light bg-[#D4A024]/10 px-3 py-1.5 rounded-full">
										<Calendar size={12} />
										<span>Updated: {lastUpdated}</span>
									</div>
								)
							}
						/>
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
								<Link to={`/news/${article.slug}`}>
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
		</div>
	);
}

import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useFeatureFlag } from "@commertize/utils/client";
import { PostHogFeatureFlags } from "@commertize/utils/client";

interface NewsArticle {
	id: string;
	slug: string;
	title: string;
	summary: string;
	category: string;
	imageUrl?: string;
	readTime: number;
	publishedAt: string;
}

const fallbackArticles: NewsArticle[] = [
	{
		id: "1",
		title: "Tokenization Revolutionizes Commercial Real Estate",
		slug: "tokenization-revolutionizes-cre",
		summary:
			"How blockchain technology is transforming property investment and ownership.",
		category: "Tokenization",
		imageUrl:
			"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
		readTime: 5,
		publishedAt: "Jan 15, 2025",
	},
	{
		id: "2",
		title: "The Future of Fractional Property Investment",
		slug: "future-fractional-investment",
		summary:
			"Exploring how fractional ownership is democratizing real estate access.",
		category: "Markets",
		imageUrl:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
		readTime: 4,
		publishedAt: "Jan 10, 2025",
	},
	{
		id: "3",
		title: "AI-Powered Property Valuation Models",
		slug: "ai-property-valuation",
		summary:
			"Machine learning is changing how we assess commercial property values.",
		category: "Technology",
		imageUrl:
			"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
		readTime: 6,
		publishedAt: "Jan 5, 2025",
	},
];

const formatNewsDate = (dateString: string) => {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString;
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
};

const LatestNews = () => {
	const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);

	// Check PostHog feature flag
	const isAiNewsEnabled = useFeatureFlag(PostHogFeatureFlags.NEWS_GENERATION);
	// If flag is explicitly false, don't render the section at all
	const showNews = isAiNewsEnabled !== false; // Show if true or undefined (loading/default)

	useEffect(() => {
		async function fetchNews() {
			try {
				const result = await api.get("news?limit=3");
				if (result.data && result.data.length > 0) {
					setArticles(result.data.slice(0, 3));
				}
			} catch (error) {
				console.error("Failed to fetch news:", error);
			}
		}
		if (showNews) {
			fetchNews();
		}
	}, [showNews]);

	// If feature flag is disabled, don't render anything
	if (!showNews) {
		return null;
	}

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			CRE: "bg-[#D4A024]",
			Tokenization: "bg-purple-500",
			Markets: "bg-yellow-500",
			Technology: "bg-blue-500",
			Regulation: "bg-red-500",
			DeFi: "bg-cyan-500",
			RWA: "bg-green-500",
			Crypto: "bg-orange-500",
			Infrastructure: "bg-teal-500",
		};
		return colors[category] || "bg-gray-500";
	};

	return (
		<section className="py-24 bg-gradient-to-br from-gray-50/50 to-white relative overflow-hidden">
			<div className="container mx-auto px-4 relative z-10 mb-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center"
				>
					<h2 className="text-3xl md:text-5xl font-light text-gray-900">
						Latest News & <span className="text-[#D4A024]">Insights</span>
					</h2>
				</motion.div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<div className="w-24 h-1 bg-gradient-to-r from-[#D4A024] to-yellow-600 rounded-full mx-auto mb-6"></div>
						<p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
							Stay informed with the latest developments in commercial real
							estate and tokenization
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{articles.map((article, index) => (
							<motion.article
								key={article.id}
								className="w-full group cursor-pointer"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<Link to={`/news/${article.slug}`}>
									<div className="bg-white rounded-xl border border-[#D4A024] hover:shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col">
										<div className="relative h-44 overflow-hidden flex-shrink-0">
											<img
												src={
													article.imageUrl ||
													"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop"
												}
												alt={article.title}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
											/>
											<div className="absolute top-3 left-3">
												<span
													className={`px-3 py-1 rounded-full text-xs font-normal text-white ${getCategoryColor(article.category)}`}
												>
													{article.category}
												</span>
											</div>
										</div>

										<div className="p-5 flex-grow flex flex-col bg-white">
											<h3 className="text-base font-normal text-gray-900 mb-2 line-clamp-2 leading-tight">
												{article.title}
											</h3>

											<p className="text-gray-500 text-sm font-light mb-4 line-clamp-3 flex-grow leading-relaxed">
												{article.summary}
											</p>

											<div className="flex items-center gap-4 text-[#D4A024] text-xs">
												<div className="flex items-center gap-1.5">
													<Calendar size={12} />
													<span>{formatNewsDate(article.publishedAt)}</span>
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

					<div className="text-center mt-12">
						<Link to="/news">
							<button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D4A024] to-yellow-600 text-white rounded-xl font-light hover:shadow-lg transition-all">
								<span>View All News & Insights</span>
								<ArrowRight size={18} />
							</button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default LatestNews;

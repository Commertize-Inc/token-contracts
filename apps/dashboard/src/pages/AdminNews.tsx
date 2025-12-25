import { useState } from "react";
import { motion } from "framer-motion";
import {
	Sparkles,
	RefreshCw,
	Trash2,
	ArrowLeft,
	Check,
	AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Article {
	id: string;
	title: string;
	slug: string;
	summary: string;
	content?: string;
	category: string;
	readTime: number;
	publishedAt: string;
}

export default function AdminNewsPage() {
	const [articles, setArticles] = useState<Article[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [articleCount, setArticleCount] = useState(3);

	const generateArticles = async () => {
		setIsGenerating(true);
		setMessage(null);

		try {
			const response = await fetch("/api/news/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ count: articleCount }),
			});

			const data = await response.json();

			if (data.success && data.articles) {
				setArticles(data.articles);
				setMessage({
					type: "success",
					text: `Generated ${data.articles.length} articles!`,
				});
			} else {
				setMessage({
					type: "error",
					text: data.error || "Failed to generate articles",
				});
			}
		} catch {
			setMessage({ type: "error", text: "Network error. Please try again." });
		} finally {
			setIsGenerating(false);
		}
	};

	const saveArticles = async () => {
		if (articles.length === 0) return;

		setIsSaving(true);
		try {
			const response = await fetch("/api/admin/import-news", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ articles }),
			});

			const data = await response.json();

			if (data.success) {
				setMessage({
					type: "success",
					text: `Saved ${data.imported} articles! (${data.skipped} skipped)`,
				});
			} else {
				setMessage({ type: "error", text: "Failed to save articles" });
			}
		} catch {
			setMessage({ type: "error", text: "Network error. Please try again." });
		} finally {
			setIsSaving(false);
		}
	};

	const clearArticles = () => {
		setArticles([]);
		setMessage({ type: "success", text: "Generated articles cleared" });
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<Link
					to="/"
					className="inline-flex items-center gap-2 text-gray-600 hover:text-[#D4A024] mb-8 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					<span className="font-light">Back to Dashboard</span>
				</Link>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-12 h-12 bg-[#D4A024] rounded-xl flex items-center justify-center">
							<Sparkles className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-logo font-light text-gray-900">
								AI News Generator
							</h1>
							<p className="text-gray-500 font-light">
								Generate real estate & tokenization articles
							</p>
						</div>
					</div>

					{message && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
								message.type === "success"
									? "bg-green-50 text-green-700 border border-green-200"
									: "bg-red-50 text-red-700 border border-red-200"
							}`}
						>
							{message.type === "success" ? (
								<Check className="w-5 h-5" />
							) : (
								<AlertCircle className="w-5 h-5" />
							)}
							<span className="font-light">{message.text}</span>
						</motion.div>
					)}

					<div className="flex flex-wrap gap-4 mb-8">
						<div className="flex items-center gap-3">
							<label className="text-gray-600 font-light">
								Number of articles:
							</label>
							<select
								value={articleCount}
								onChange={(e) => setArticleCount(Number(e.target.value))}
								className="px-4 py-2 border border-gray-200 rounded-xl font-light focus:outline-none focus:border-[#D4A024]"
							>
								{[1, 2, 3, 4, 5, 6].map((n) => (
									<option key={n} value={n}>
										{n}
									</option>
								))}
							</select>
						</div>

						<button
							onClick={generateArticles}
							disabled={isGenerating}
							className="flex items-center gap-2 px-6 py-2 bg-[#D4A024] text-white rounded-xl font-light hover:bg-[#B8881C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isGenerating ? (
								<RefreshCw className="w-4 h-4 animate-spin" />
							) : (
								<Sparkles className="w-4 h-4" />
							)}
							{isGenerating ? "Generating..." : "Generate Articles"}
						</button>

						{articles.length > 0 && (
							<>
								<button
									onClick={saveArticles}
									disabled={isSaving}
									className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl font-light hover:bg-green-700 transition-colors disabled:opacity-50"
								>
									{isSaving ? (
										<RefreshCw className="w-4 h-4 animate-spin" />
									) : (
										<Check className="w-4 h-4" />
									)}
									Save to Site
								</button>

								<button
									onClick={clearArticles}
									className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-600 rounded-xl font-light hover:bg-gray-50 transition-colors"
								>
									<Trash2 className="w-4 h-4" />
									Clear
								</button>
							</>
						)}
					</div>

					{articles.length > 0 && (
						<div className="space-y-4">
							<h2 className="text-lg font-logo font-light text-gray-700">
								Generated Articles
							</h2>
							{articles.map((article, index) => (
								<motion.div
									key={article.id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className="p-6 border border-gray-200 rounded-xl hover:border-[#D4A024] transition-colors"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1">
											<span className="inline-block px-3 py-1 text-xs font-light rounded-full bg-[#D4A024]/10 text-[#D4A024] mb-2">
												{article.category}
											</span>
											<h3 className="text-lg font-logo font-light text-gray-900 mb-2">
												{article.title}
											</h3>
											<p className="text-gray-600 font-light text-sm mb-3">
												{article.summary}
											</p>
											{article.content && (
												<details className="text-sm">
													<summary className="cursor-pointer text-[#D4A024] hover:underline font-light">
														View full content
													</summary>
													<p className="mt-3 text-gray-600 font-light whitespace-pre-wrap">
														{article.content}
													</p>
												</details>
											)}
										</div>
										<div className="text-right text-sm text-gray-500 font-light flex-shrink-0">
											<div>{article.readTime} min read</div>
											<div>{article.publishedAt}</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					)}

					{articles.length === 0 && !isGenerating && (
						<div className="text-center py-12 text-gray-500">
							<Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
							<p className="font-light">
								Click &quot;Generate Articles&quot; to create AI-powered news
								content
							</p>
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	Filter,
	Building2,
	Globe,
	Users,
	BarChart3,
	X,
	AlertTriangle,
} from "lucide-react";
import { ListingCard } from "@commertize/ui";
import { ListingStatus } from "@commertize/data/enums"; // Assuming this is available
import ChatGPTWidget from "../components/ChatGPTWidget";
import SEO from "../components/SEO";
import { api } from "../lib/api";
// Navbar and Footer will be in the layout (App.tsx), but original included them.
// In App.tsx I wrapped routes with Navbar and Footer, so I don't need to include them here.
// But wait, the original page included them. If I include them here, I'll have double navbars.
// In App.tsx:
// <Navbar />
// <Routes> ... </Routes>
// <Footer />
// So I should NOT include Navbar/Footer in these page components if they form the main content.

function SkeletonCard() {
	return (
		<div className="bg-white rounded-2xl border-2 border-[#D4A024]/30 overflow-hidden animate-pulse">
			<div className="h-48 bg-gray-200" />
			<div className="p-5">
				<div className="flex items-start justify-between gap-2 mb-3">
					<div className="h-6 bg-gray-200 rounded w-3/4" />
					<div className="h-6 bg-gray-200 rounded w-16" />
				</div>
				<div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
				<div className="mb-3">
					<div className="h-3 bg-gray-200 rounded w-16 mb-1" />
					<div className="h-4 bg-gray-200 rounded w-1/2" />
				</div>
				<div className="flex justify-between mb-3">
					<div className="h-4 bg-gray-200 rounded w-1/4" />
					<div className="h-4 bg-gray-200 rounded w-8" />
				</div>
				<div className="h-1.5 bg-gray-200 rounded-full mb-4" />
				<div className="text-center mb-4">
					<div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-1" />
					<div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
				</div>
				<div className="flex justify-center mb-4">
					<div className="h-8 bg-gray-200 rounded-xl w-24" />
				</div>
				<div className="h-12 bg-gray-200 rounded-xl" />
			</div>
		</div>
	);
}

export default function Marketplace() {
	const [status, setStatus] = useState<string>("all");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [listings, setlistings] = useState<any[]>([]);
	const [propertyType, setPropertyType] = useState<string>("all");
	const [propertyClass, setPropertyClass] = useState<string>("all");
	const [riskLevel, setRiskLevel] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [sortBy, setSortBy] = useState<string>("name");
	const [showFilters, setShowFilters] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [userName, setUserName] = useState<string>("");

	useEffect(() => {
		const fetchlistings = async () => {
			try {
				const data = await api.get("/listings");

				// Map API data to Shared ListingCard Props
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const mappedlistings: any[] = data.map((p: any) => ({
					id: p.id,
					name: p.name,
					address: p.address,
					city: p.city,
					state: p.state,
					status: p.status,
					images: p.images || [],
					financials: {
						targetRaise: p.financials?.targetRaise || 0,
						tokenPrice: p.financials?.tokenPrice || 0,
						capRate: p.financials?.capRate || 0,
						noi: p.financials?.noi || 0,
						occupancyRate: p.financials?.occupancyRate || 0,
					},
					propertyType: p.propertyType,
					sponsor: p.sponsor,
					tokenContractAddress: p.tokenContractAddress,
				}));
				setlistings(mappedlistings);
			} catch (error) {
				console.error("Failed to load listings", error);
				setlistings([]);
			} finally {
				setIsLoading(false);
				setUserName("Investor");
			}
		};

		fetchlistings();
	}, []);

	const filteredlistings = listings
		.filter((property) => {
			if (status !== "all" && property.status !== status) return false;
			if (propertyType !== "all" && property.propertyType !== propertyType)
				return false;

			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				if (
					!property.name.toLowerCase().includes(query) &&
					!(property.city + ", " + property.state)
						.toLowerCase()
						.includes(query) &&
					!property.propertyType?.toLowerCase().includes(query)
				) {
					return false;
				}
			}
			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.name.localeCompare(b.name);
				case "price":
					return (
						(a.financials?.tokenPrice || 0) - (b.financials?.tokenPrice || 0)
					);
				case "irr":
					return (b.financials?.capRate || 0) - (a.financials?.capRate || 0);
				case "location":
					return (a.city || "").localeCompare(b.city || "");
				default:
					return 0;
			}
		});

	const clearAllFilters = () => {
		setStatus("all");
		setPropertyType("all");
		setPropertyClass("all");
		setRiskLevel("all");
		setSearchQuery("");
		setSortBy("name");
	};

	const hasActiveFilters =
		status !== "all" ||
		propertyType !== "all" ||
		propertyClass !== "all" ||
		riskLevel !== "all" ||
		searchQuery.trim() !== "";

	return (
		<>
			<SEO
				title="Marketplace - Invest in Tokenized Real Estate"
				description="Browse exclusive commercial real estate investment opportunities. Tokenized assets offering fractional ownership and liquidity."
				keywords={[
					"Marketplace",
					"Real Estate Investment",
					"Tokenized Assets",
					"CRE",
				]}
			/>
			{/* Navbar is in App Layout */}
			<div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-amber-50/20">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Hero Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center mb-12"
					>
						<div className="flex items-center justify-center mb-4">
							<h1 className="text-4xl md:text-5xl font-light">
								Discover{" "}
								<span className="bg-gradient-to-r from-[#D4A024] to-[#B8860B] bg-clip-text text-transparent">
									Tokenized listings
								</span>
							</h1>
						</div>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
							className="text-lg text-gray-600 max-w-3xl mx-auto"
						>
							Transform the Way You Invest in Commercial Real Estate
						</motion.p>
					</motion.div>

					{/* Welcome Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.6 }}
						className="mb-8"
					>
						<div className="bg-gradient-to-br from-[#D4A024]/5 to-[#D4A024]/10 border-2 border-[#D4A024] rounded-2xl p-6">
							<div className="flex items-center mb-4">
								<Users className="w-6 h-6 text-[#D4A024] mr-3" />
								<h2 className="text-2xl font-light">
									Welcome{userName ? `, ${userName}` : " to the Marketplace"}!
								</h2>
							</div>
							<p className="mb-4 text-gray-700">
								At Commertize, you&apos;re not just a member — you&apos;re part
								of a network shaping the future of commercial real estate. Gain
								priority access to exclusive investment opportunities,
								cutting-edge insights, and advanced tools designed to give you
								an edge. Explore our curated portfolio, harness our powerful
								analytics, and grow your holdings with confidence.
							</p>
							<div className="grid md:grid-cols-2 gap-4 mb-4">
								<div className="flex items-center text-sm text-gray-700">
									<BarChart3 className="w-4 h-4 text-[#D4A024] mr-2" />
									<span>Proprietary analytics and insights</span>
								</div>
								<div className="flex items-center text-sm text-gray-700">
									<Globe className="w-4 h-4 text-[#D4A024] mr-2" />
									<span>Global real estate opportunities</span>
								</div>
							</div>
							<p className="text-xs text-gray-500 italic">
								Disclaimer: Projected returns are estimates and may be subject
								to adjustment. Need assistance? Our dedicated sales agents are
								here to help.
							</p>
						</div>
					</motion.div>

					{/* Search and Filter Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.6 }}
						className="mb-8"
					>
						<div className="bg-white border-2 border-[#D4A024] rounded-2xl p-6 shadow-lg">
							{/* Search Bar */}
							<div className="flex flex-col lg:flex-row gap-4 mb-6">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
									<input
										type="text"
										placeholder="Search listings by name, location, or type..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full pl-10 pr-4 py-3 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50 focus:border-[#D4A024]"
									/>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => setShowFilters(!showFilters)}
										className={`flex items-center gap-2 px-6 py-3 border rounded-xl transition-colors ${showFilters
											? "bg-[#D4A024] text-white border-[#D4A024]"
											: "border-gray-200 hover:bg-gray-50"
											}`}
									>
										<Filter className="w-4 h-4" />
										Filters
									</button>
									{hasActiveFilters && (
										<button
											onClick={clearAllFilters}
											className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
										>
											<X className="w-4 h-4" />
											Clear All
										</button>
									)}
								</div>
							</div>

							{/* Advanced Filters */}
							<AnimatePresence>
								{showFilters && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.3 }}
										className="border-t border-gray-100 pt-6"
									>
										<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
											<select
												value={status}
												onChange={(e) => setStatus(e.target.value)}
												className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
											>
												<option value="all">All Status</option>
												{Object.values(ListingStatus).map((s) => (
													<option key={s} value={s}>
														{s.replace(/_/g, " ")}
													</option>
												))}
											</select>

											<select
												value={propertyType}
												onChange={(e) => setPropertyType(e.target.value)}
												className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
											>
												<option value="all">All Types</option>
												<option value="Apartments">Apartments</option>
												<option value="Office">Office</option>
												<option value="Retail">Retail</option>
												<option value="Hospitality">Hospitality</option>
												<option value="Industrial">Industrial</option>
												<option value="Mixed Use">Mixed Use</option>
											</select>

											<select
												value={propertyClass}
												onChange={(e) => setPropertyClass(e.target.value)}
												className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
											>
												<option value="all">All Classes</option>
												<option value="A">Class A</option>
												<option value="B">Class B</option>
												<option value="C">Class C</option>
											</select>

											<select
												value={riskLevel}
												onChange={(e) => setRiskLevel(e.target.value)}
												className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
											>
												<option value="all">All Risk Levels</option>
												<option value="low">Low Risk</option>
												<option value="moderate">Moderate Risk</option>
												<option value="high">High Risk</option>
											</select>

											<select
												value={sortBy}
												onChange={(e) => setSortBy(e.target.value)}
												className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
											>
												<option value="name">Sort by Name</option>
												<option value="price">Sort by Price</option>
												<option value="irr">Sort by IRR</option>
												<option value="location">Sort by Location</option>
											</select>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>

					{/* Results Summary */}
					<div className="mb-6 flex items-center justify-between">
						<p className="text-gray-600">
							Showing{" "}
							<span className="font-medium text-[#D4A024]">
								{isLoading ? "..." : filteredlistings.length}
							</span>{" "}
							listings
							{searchQuery && (
								<span className="ml-2">
									for &quot;<span className="font-medium">{searchQuery}</span>
									&quot;
								</span>
							)}
						</p>
						{hasActiveFilters && (
							<p className="text-sm text-gray-500">Filters applied</p>
						)}
					</div>

					{/* Loading State */}
					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[...Array(3)].map((_, i) => (
								<SkeletonCard key={i} />
							))}
						</div>
					) : (
						<>
							{/* Property Cards Grid */}
							{filteredlistings.length > 0 ? (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.2 }}
									className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
								>
									{filteredlistings.map((property, index) => (
										<ListingCard
											key={property.id}
											listing={property}
											index={index}
											currentFunding={0} // Default funding
										/>
									))}
								</motion.div>
							) : (
								/* Empty State */
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200"
								>
									<Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
									<h3 className="text-xl font-medium text-gray-700 mb-2">
										No listings Found
									</h3>
									<p className="text-gray-500 mb-6 max-w-md mx-auto">
										We couldn&apos;t find any listings matching your criteria.
										Try adjusting your filters or search query.
									</p>
									<button
										onClick={clearAllFilters}
										className="px-6 py-3 bg-[#D4A024] text-white rounded-xl hover:bg-[#D4A024]/90 transition-colors"
									>
										Clear All Filters
									</button>
								</motion.div>
							)}
						</>
					)}

					{/* Disclaimer Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
						className="mt-12"
					>
						<div className="bg-gradient-to-r from-[#D4A024]/10 via-[#D4A024]/5 to-[#D4A024]/10 border border-[#D4A024]/30 rounded-2xl p-6">
							<div className="flex items-start gap-4">
								<div className="w-10 h-10 bg-[#D4A024]/20 rounded-lg flex items-center justify-center flex-shrink-0">
									<AlertTriangle className="w-5 h-5 text-[#D4A024]" />
								</div>
								<div>
									<h4 className="font-medium text-gray-900 mb-2">
										Investment Notice
									</h4>
									<p className="text-sm text-gray-600 leading-relaxed">
										All investments involve risk, including the potential loss
										of principal. Past performance does not guarantee future
										results. Projected returns are estimates based on current
										market conditions and may vary. Securities offered through
										Commertize are subject to regulatory requirements under
										Regulation D (506(b)/506(c)). Please review all offering
										documents carefully before investing.
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* RUNE.CTZ Chatbot */}
			<ChatGPTWidget />
		</>
	);
}

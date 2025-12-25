import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
	Search,
	Filter,
	Building2,
	BarChart3,
	Globe,
	Users,
	X,
	AlertTriangle,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { ListingCard, PageHeader } from "@commertize/ui";
import { Button } from "@commertize/ui"; // Keep UI button for specific uses if needed, or replace
import { ListingStatus } from "@commertize/data/enums";
import { useListings } from "../hooks/useListings";

// Skeleton Component equivalent
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
				<div className="h-12 bg-gray-200 rounded-xl" />
			</div>
		</div>
	);
}

export default function MarketplacePage() {
	const navigate = useNavigate();

	const { data: listings = [], isLoading: loading } = useListings();

	// Filters
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [listingType, setListingType] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [sortBy, setSortBy] = useState<string>("name");
	const [showFilters, setShowFilters] = useState<boolean>(false);

	// User info (mock or real)
	const [userName] = useState<string>("Investor");

	const filteredListings = listings
		.filter((listing) => {
			// Status Filter
			if (statusFilter !== "all" && listing.status !== statusFilter)
				return false;

			// Type Filter
			if (listingType !== "all" && listing.propertyType !== listingType)
				return false;

			// Search
			if (searchQuery.trim()) {
				const term = searchQuery.toLowerCase();
				return (
					listing.name.toLowerCase().includes(term) ||
					listing.city.toLowerCase().includes(term) ||
					listing.state.toLowerCase().includes(term)
				);
			}
			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.name.localeCompare(b.name);
				case "price":
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					return (a.tokenomics?.tokenPrice || 0) - (b.tokenomics?.tokenPrice || 0);
				case "capRate":
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					return (b.financials?.exitCapRate || 0) - (a.financials?.exitCapRate || 0);
				default:
					return 0;
			}
		});

	const clearAllFilters = () => {
		setStatusFilter("all");
		setListingType("all");
		setSearchQuery("");
		setSortBy("name");
	};

	const hasActiveFilters =
		statusFilter !== "all" ||
		listingType !== "all" ||
		searchQuery.trim() !== "";

	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />

			{/* Main Content with Landing Styling */}
			<div className="bg-gradient-to-br from-white via-gray-50 to-amber-50/20 pb-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Page Header */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<PageHeader
							title={
								<>
									Discover{" "}
									<span className="bg-gradient-to-r from-[#D4A024] to-[#B8860B] bg-clip-text text-transparent">
										Tokenized listings
									</span>
								</>
							}
							subtitle="Transform the Way You Invest in Commercial Real Estate"
							className="mb-8"
						/>
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
								<h2 className="text-2xl font-light text-slate-900">
									Welcome{userName ? `, ${userName}` : " to the Marketplace"}!
								</h2>
							</div>
							<p className="mb-4 text-gray-700">
								Gain priority access to exclusive investment opportunities.
								Explore our curated portfolio, harness our powerful analytics,
								and grow your holdings with confidence.
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
										placeholder="Search listings by name, user, city..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full pl-10 pr-4 py-3 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50 focus:border-[#D4A024] text-slate-900 placeholder:text-slate-400"
									/>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => setShowFilters(!showFilters)}
										className={`flex items-center gap-2 px-6 py-3 border rounded-xl transition-colors ${showFilters
											? "bg-[#D4A024] text-white border-[#D4A024]"
											: "border-gray-200 hover:bg-gray-50 text-slate-700"
											}`}
									>
										<Filter className="w-4 h-4" />
										Filters
									</button>
									{hasActiveFilters && (
										<button
											onClick={clearAllFilters}
											className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-slate-700"
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
										<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
											<select
												value={statusFilter}
												onChange={(e) => setStatusFilter(e.target.value)}
												className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50 text-slate-700"
											>
												<option value="all">All Status</option>
												{Object.values(ListingStatus).map((s) => {
													let label = s
														.replace(/_/g, " ")
														.toLowerCase()
														.replace(/\b\w/g, (c) => c.toUpperCase());
													if (s === ListingStatus.ACTIVE) label = "Live";
													return (
														<option key={s} value={s}>
															{label}
														</option>
													);
												})}
											</select>

											<select
												value={listingType}
												onChange={(e) => setListingType(e.target.value)}
												className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50 text-slate-700"
											>
												<option value="all">All Types</option>
												<option value="Commercial">Commercial</option>
												<option value="Multi-Family">Multi-Family</option>
												<option value="Office">Office</option>
												<option value="Industrial">Industrial</option>
												<option value="Retail">Retail</option>
												<option value="Hospitality">Hospitality</option>
												<option value="Mixed Use">Mixed Use</option>
											</select>

											<select
												value={sortBy}
												onChange={(e) => setSortBy(e.target.value)}
												className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50 text-slate-700"
											>
												<option value="name">Sort by Name</option>
												<option value="price">Sort by Tok. Price</option>
												<option value="capRate">Sort by Cap Rate</option>
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
								{loading ? "..." : filteredListings.length}
							</span>{" "}
							listings
						</p>
					</div>

					{/* Grid */}
					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{[...Array(3)].map((_, i) => (
								<SkeletonCard key={i} />
							))}
						</div>
					) : filteredListings.length > 0 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
						>
							{filteredListings.map((listing, index) => (
								<motion.div
									key={listing.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 * index }}
								>
									<ListingCard
										key={listing.id}
										listing={listing as any}
										currentFunding={0}
										onViewDetails={() => navigate(`/listing/${listing.id}`)}
									/>
								</motion.div>
							))}
						</motion.div>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200"
						>
							<Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
							<h3 className="text-xl font-medium text-gray-700 mb-2">
								No Listings Found
							</h3>
							<p className="text-gray-500 mb-6 max-w-md mx-auto">
								We couldn&apos;t find any listings matching your criteria.
							</p>
							<Button
								variant="text"
								className="mt-2 text-[#D4A024]"
								onClick={clearAllFilters}
							>
								Clear All Filters
							</Button>
						</motion.div>
					)}

					{/* Disclaimer */}
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
										All investments involve risk. Securities offered through
										Commertize are subject to regulatory requirements. Please
										review all offering documents carefully before investing.
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}

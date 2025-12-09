"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	Filter,
	Building2,
	Globe,
	Users,
	BarChart3,
	MapPin,
	X,
	AlertTriangle,
} from "lucide-react";
import { PROPERTY_STATUS } from "@/lib/propertyStatus";
import ChatGPTWidget from "@/components/ChatGPTWidget";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Property {
	id: string;
	name: string;
	location: string;
	imageUrl: string;
	propertyValue: number;
	minInvestment: number;
	targetedIRR: number;
	capRate: number;
	status: string;
	type: string;
	propertyClass: string;
	riskFactor: string;
	holdPeriod: number;
	tokensSold: number;
	totalTokens: number;
	sponsor: string;
	units: number;
	comingSoon: boolean;
}

const SAMPLE_PROPERTIES: Property[] = [
	{
		id: "1",
		name: "DoubleTree Hilton Head Inn",
		location: "36 S Forest Beach Dr, Hilton Head Island, SC",
		imageUrl: "/assets/doubletree-hilton-head.jpg",
		propertyValue: 15000000,
		minInvestment: 1000,
		targetedIRR: 14.5,
		capRate: 7.8,
		status: "Coming Soon",
		type: "Hotel",
		propertyClass: "Class A",
		riskFactor: "moderate",
		holdPeriod: 5,
		tokensSold: 0,
		totalTokens: 150000,
		sponsor: "Hilton Hotels & Resorts",
		units: 102,
		comingSoon: true,
	},
	{
		id: "2",
		name: "Boardwalk Suites Lafayette",
		location: "1605 N University Ave Lafayette, LA",
		imageUrl: "/assets/boardwalk-suites-lafayette.jpg",
		propertyValue: 12000000,
		minInvestment: 1000,
		targetedIRR: 13.8,
		capRate: 7.2,
		status: "Coming Soon",
		type: "Hotel",
		propertyClass: "Class A",
		riskFactor: "moderate",
		holdPeriod: 5,
		tokensSold: 0,
		totalTokens: 120000,
		sponsor: "Boardwalk Hospitality Group",
		units: 86,
		comingSoon: true,
	},
	{
		id: "3",
		name: "National Hotel under conversion to Hilton",
		location: "2 Water St Jackson, CA",
		imageUrl: "/assets/national-hotel-hilton.jpg",
		propertyValue: 8000000,
		minInvestment: 1000,
		targetedIRR: 15.2,
		capRate: 8.1,
		status: "Coming Soon",
		type: "Hotel",
		propertyClass: "Class B",
		riskFactor: "moderate",
		holdPeriod: 5,
		tokensSold: 0,
		totalTokens: 80000,
		sponsor: "Hilton Hotels & Resorts",
		units: 54,
		comingSoon: true,
	},
];

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
	const [propertyType, setPropertyType] = useState<string>("all");
	const [propertyClass, setPropertyClass] = useState<string>("all");
	const [riskLevel, setRiskLevel] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [sortBy, setSortBy] = useState<string>("name");
	const [showFilters, setShowFilters] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [userName, setUserName] = useState<string>("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
			setUserName("Investor");
		}, 800);
		return () => clearTimeout(timer);
	}, []);

	const filteredProperties = SAMPLE_PROPERTIES.filter((property) => {
		if (status !== "all" && property.status !== status) return false;
		if (propertyType !== "all" && property.type !== propertyType) return false;
		if (
			propertyClass !== "all" &&
			!property.propertyClass.includes(propertyClass)
		)
			return false;
		if (riskLevel !== "all" && property.riskFactor !== riskLevel.toLowerCase())
			return false;
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			if (
				!property.name.toLowerCase().includes(query) &&
				!property.location.toLowerCase().includes(query) &&
				!property.type.toLowerCase().includes(query)
			) {
				return false;
			}
		}
		return true;
	}).sort((a, b) => {
		switch (sortBy) {
			case "name":
				return a.name.localeCompare(b.name);
			case "price":
				return a.minInvestment - b.minInvestment;
			case "irr":
				return b.targetedIRR - a.targetedIRR;
			case "location":
				return a.location.localeCompare(b.location);
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

	const _formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	const hasActiveFilters =
		status !== "all" ||
		propertyType !== "all" ||
		propertyClass !== "all" ||
		riskLevel !== "all" ||
		searchQuery.trim() !== "";

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-amber-50/20 pt-16">
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
									Tokenized Properties
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
								At Commertize, you're not just a member — you're part of a
								network shaping the future of commercial real estate. Gain
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
										placeholder="Search properties by name, location, or type..."
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
												{Object.values(PROPERTY_STATUS).map((s) => (
													<option key={s} value={s}>
														{s}
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
								{isLoading ? "..." : filteredProperties.length}
							</span>{" "}
							properties
							{searchQuery && (
								<span className="ml-2">
									for "<span className="font-medium">{searchQuery}</span>"
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
							{filteredProperties.length > 0 ? (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.2 }}
									className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
								>
									{filteredProperties.map((property, index) => (
										<motion.div
											key={property.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.1 * index }}
											className="bg-white rounded-2xl border-2 border-[#D4A024] overflow-hidden hover:shadow-xl transition-all duration-300"
										>
											{/* Image */}
											<div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
												{property.imageUrl ? (
													<img
														src={property.imageUrl}
														alt={property.name}
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<Building2
															size={64}
															className="text-[#D4A024]/30"
														/>
													</div>
												)}
												{property.comingSoon && (
													<div className="absolute top-4 left-4 px-3 py-1 bg-[#F59E0B] text-white text-xs font-light rounded-[0.75rem]">
														COMING SOON
													</div>
												)}
											</div>

											{/* Content */}
											<div className="p-5">
												<div className="flex items-start justify-between gap-2 mb-3">
													<h3
														className="text-lg font-light text-gray-900 leading-tight"
														style={{ fontFamily: "Space Grotesk, sans-serif" }}
													>
														{property.name}
													</h3>
													<span className="px-3 py-1 bg-white text-[#92710A] text-xs font-medium rounded-[0.75rem] whitespace-nowrap border-2 border-[#D4A024]">
														{property.type}
													</span>
												</div>
												<div className="flex items-center gap-1 text-sm text-gray-900 mb-4">
													<MapPin size={14} className="text-[#D4A024]" />
													<span className="font-light">
														{property.location}
													</span>
												</div>

												<div className="mb-3">
													<div className="text-xs text-gray-900 font-light">
														Sponsor
													</div>
													<div className="text-sm text-gray-900 font-light">
														{property.sponsor}
													</div>
												</div>

												<div className="flex items-center justify-between mb-3">
													<span className="text-sm text-gray-900 font-light">
														{property.status}
													</span>
													<span className="text-sm text-gray-900 font-light">
														{Math.round(
															(property.tokensSold / property.totalTokens) * 100
														)}
														%
													</span>
												</div>
												<div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
													<div
														className="h-full bg-[#D4A024] rounded-full transition-all duration-500"
														style={{
															width: `${(property.tokensSold / property.totalTokens) * 100}%`,
														}}
													/>
												</div>

												<div className="text-center mb-4">
													<div className="text-sm text-gray-900 font-light">
														More Details Coming Soon
													</div>
													<div className="text-xs text-gray-900 font-light">
														Investment details available shortly.
													</div>
												</div>

												<div className="flex items-center justify-center mb-4">
													<span className="px-4 py-1.5 bg-white border-2 border-[#D4A024] text-[#92710A] text-sm font-medium rounded-[0.75rem]">
														{property.units} Units
													</span>
												</div>

												<button
													className="w-full py-3 bg-gray-300 text-gray-600 text-sm font-light rounded-[0.75rem] cursor-not-allowed"
													disabled
												>
													Coming Soon
												</button>
											</div>
										</motion.div>
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
										No Properties Found
									</h3>
									<p className="text-gray-500 mb-6 max-w-md mx-auto">
										We couldn't find any properties matching your criteria. Try
										adjusting your filters or search query.
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

			{/* Footer */}
			<Footer />

			{/* RUNE.CTZ Chatbot */}
			<ChatGPTWidget />
		</>
	);
}

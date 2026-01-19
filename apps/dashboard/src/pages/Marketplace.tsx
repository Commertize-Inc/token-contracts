import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart3, Globe, Users, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { ListingCard, PageHeader } from "@commertize/ui";
// Keep UI button for specific uses if needed, or replace
import { ListingStatus, PropertyType } from "@commertize/data/enums";
import { useListings } from "../hooks/useListings";

import {
	DataTable,
	DataTableToolbar,
	DataTableColumnHeader,
} from "@commertize/ui";
import { ColumnDef } from "@tanstack/react-table";
import type { Listing } from "@commertize/data"; // Import Listing type
import { usePostHog } from "@commertize/utils/client";

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

import { Badge } from "@commertize/ui";

// Helper to capital case enum strings
const toTitleCase = (str: string) => {
	if (!str) return "";
	return str
		.replace(/_/g, " ")
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function MarketplacePage() {
	const navigate = useNavigate();
	const posthog = usePostHog();

	const { data: listings = [], isLoading: loading } = useListings();

	const [userName] = useState<string>("Investor");
	const [view, setView] = useState<"table" | "grid">("grid");

	useEffect(() => {
		if (posthog) {
			posthog.capture("marketplace_viewed");
		}
	}, [posthog]);

	const columns: ColumnDef<Listing>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Property Name" />
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "propertyType",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Type" />
			),
			filterFn: "arrIncludesSome",
			cell: ({ row }) => {
				const type = row.getValue("propertyType") as string;
				return (
					<Badge variant="outline" className="font-medium bg-white">
						{toTitleCase(type)}
					</Badge>
				);
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			filterFn: "arrIncludesSome",
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				let variant: "default" | "secondary" | "destructive" | "outline" =
					"default";
				let className = "";

				switch (status) {
					case ListingStatus.ACTIVE:
						variant = "default";
						className = "bg-green-600 hover:bg-green-700";
						break;
					case ListingStatus.DRAFT:
					case ListingStatus.PENDING_REVIEW:
					case ListingStatus.APPROVED: // Maybe amber/orange?
						variant = "secondary";
						className = "bg-amber-100 text-amber-800 hover:bg-amber-200";
						break;
					case ListingStatus.REJECTED:
					case ListingStatus.WITHDRAWN:
					case ListingStatus.FROZEN:
						variant = "destructive";
						break;
					case ListingStatus.FULLY_FUNDED:
						variant = "secondary";
						className = "bg-blue-100 text-blue-800 hover:bg-blue-200";
						break;
					case ListingStatus.TOKENIZING:
						variant = "secondary";
						className = "bg-purple-100 text-purple-800 hover:bg-purple-200";
						break;
					default:
						variant = "outline";
				}

				return (
					<Badge variant={variant} className={className}>
						{status === "ACTIVE" ? "Live" : toTitleCase(status)}
					</Badge>
				);
			},
		},
		{
			id: "tokenPrice",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Token Price" />
			),
			accessorFn: (row) => row.tokenomics?.tokenPrice ?? 0,
			cell: ({ row }) => {
				const price = row.getValue("tokenPrice") as number;
				const currency = row.original.fundingCurrency;
				const symbol = currency === "HBAR" ? "ℏ" : "$";
				return (
					<span className="text-sm">
						{price > 0 ? `${symbol}${price.toLocaleString()}` : "TBD"}
					</span>
				);
			},
		},
		{
			id: "capRate",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Cap Rate" />
			),
			accessorFn: (row) => row.financials?.exitCapRate ?? 0,
			cell: ({ row }) => {
				const rate = row.getValue("capRate") as number;
				return (
					<span className="text-sm">
						{rate > 0 ? `${rate.toFixed(2)}%` : "TBD"}
					</span>
				);
			},
		},
	];

	return (
		<DashboardLayout>
			{/* Main Content with Landing Styling */}
			<div className="bg-white pb-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
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

					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{[...Array(3)].map((_, i) => (
								<SkeletonCard key={i} />
							))}
						</div>
					) : (
						<div className="space-y-4">
							{/* Notion-style Toolbar */}
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
								{/* Left: View Tabs */}
								<div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
									<button
										onClick={() => setView("table")}
										className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === "table"
												? "bg-white text-gray-900 shadow-sm"
												: "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
											}`}
									>
										<span className="w-4 h-4">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M3 3h18v18H3z" />
												<path d="M21 9H3" />
												<path d="M21 15H3" />
												<path d="M12 3v18" />
											</svg>
										</span>
										Table
									</button>
									<button
										onClick={() => setView("grid")}
										className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === "grid"
												? "bg-white text-gray-900 shadow-sm"
												: "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
											}`}
									>
										<span className="w-4 h-4">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<rect width="7" height="7" x="3" y="3" rx="1" />
												<rect width="7" height="7" x="14" y="3" rx="1" />
												<rect width="7" height="7" x="14" y="14" rx="1" />
												<rect width="7" height="7" x="3" y="14" rx="1" />
											</svg>
										</span>
										Gallery
									</button>
								</div>
							</div>

							<DataTable
								columns={columns}
								data={listings}
								currentView={view}
								onViewChange={setView}
								onRowClick={(listing) => navigate(`/listing/${listing.id}`)}
								renderGridItem={(listing, table) => (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className="h-full w-full"
									>
										<ListingCard
											listing={listing as Listing}
											currentFunding={0}
											visibleColumns={table.getState().columnVisibility}
											onViewDetails={() => navigate(`/listing/${listing.id}`)}
										/>
									</motion.div>
								)}
								renderToolbar={(table) => (
									<div className="mb-4">
										<DataTableToolbar
											table={table}
											filterColumn="name"
											searchPlaceholder="Search listings..."
											filters={[
												{
													column: "status",
													title: "Status",
													options: Object.values(ListingStatus).map((s) => ({
														label:
															s === ListingStatus.ACTIVE
																? "Live"
																: toTitleCase(s),
														value: s,
													})),
												},
												{
													column: "propertyType",
													title: "Type",
													options: Object.values(PropertyType).map((t) => ({
														label: toTitleCase(t),
														value: t,
													})),
												},
											]}
										/>
									</div>
								)}
							/>
						</div>
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
		</DashboardLayout>
	);
}

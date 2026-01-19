import { motion } from "framer-motion";
import { MapPin, Building2, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { ListingStatus } from "@commertize/data/enums";
import type { Listing } from "@commertize/data";

import type { VisibilityState } from "@tanstack/react-table";

export interface ListingCardProps {
	listing: Listing;
	index?: number;
	className?: string;
	onViewDetails?: () => void;
	currentFunding?: number;
	visibleColumns?: VisibilityState;
}

const toTitleCase = (str: string) => {
	if (!str) return "";
	return str
		.replace(/_/g, " ")
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
};

export const ListingCard = ({
	listing,
	index = 0,
	className = "",
	onViewDetails,
	currentFunding = 0,
	visibleColumns = {},
}: ListingCardProps) => {
	const isColumnVisible = (columnId: string) => {
		// If key is undefined, it's visible by default. If false, it's hidden.
		return visibleColumns[columnId] !== false;
	};

	const handleViewDetails = () => {
		if (onViewDetails) {
			onViewDetails();
		} else {
			window.location.href = "/marketplace";
		}
	};

	const targetRaise =
		listing.impliedEquityValuation ??
		(listing.tokenomics?.tokensForInvestors && listing.tokenomics?.tokenPrice
			? listing.tokenomics.tokensForInvestors * listing.tokenomics.tokenPrice
			: null);

	const fundingProgress =
		targetRaise && targetRaise > 0
			? Math.min((currentFunding / targetRaise) * 100, 100)
			: 0;

	// Determine Badge Variant for Status
	let statusVariant: "default" | "secondary" | "destructive" | "outline" =
		"default";
	let statusClassName = "";

	switch (listing.status) {
		case ListingStatus.ACTIVE:
			statusVariant = "default";
			statusClassName =
				"bg-green-600 hover:bg-green-700 border-transparent text-white";
			break;
		case ListingStatus.DRAFT:
		case ListingStatus.PENDING_REVIEW:
		case ListingStatus.APPROVED:
			statusVariant = "secondary";
			statusClassName =
				"bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent";
			break;
		case ListingStatus.REJECTED:
		case ListingStatus.WITHDRAWN:
		case ListingStatus.FROZEN:
			statusVariant = "destructive";
			break;
		case ListingStatus.FULLY_FUNDED:
			statusVariant = "secondary";
			statusClassName =
				"bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent";
			break;
		case ListingStatus.TOKENIZING:
			statusVariant = "secondary";
			statusClassName =
				"bg-purple-100 text-purple-800 hover:bg-purple-200 border-transparent";
			break;
		default:
			statusVariant = "outline";
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			onClick={handleViewDetails}
			className={`group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#D4A024]/50 transition-all duration-300 cursor-pointer flex flex-col h-full ${className}`}
		>
			{/* Image Section */}
			<div className="relative h-48 bg-gray-100 overflow-hidden">
				{listing.images && listing.images.length > 0 ? (
					<img
						src={listing.images[0]}
						alt={listing.name}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gray-50">
						<Building2 size={48} className="text-gray-300" />
					</div>
				)}
				<div className="absolute top-3 left-3 flex gap-2">
					{isColumnVisible("status") && (
						<Badge variant={statusVariant} className={statusClassName}>
							{listing.status === ListingStatus.ACTIVE
								? "Live"
								: toTitleCase(listing.status)}
						</Badge>
					)}
				</div>
			</div>

			{/* Content Section */}
			<div className="p-5 flex flex-col flex-grow">
				<div className="flex justify-between items-start mb-2">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1 group-hover:text-[#D4A024] transition-colors">
							{listing.name}
						</h3>
						<div className="flex items-center text-sm text-gray-500">
							<MapPin size={14} className="mr-1 text-gray-400" />
							{listing.city}, {listing.state}
						</div>
					</div>
					{isColumnVisible("propertyType") && (
						<Badge
							variant="outline"
							className="text-xs font-normal text-gray-600 bg-gray-50/50"
						>
							{listing.propertyType
								? toTitleCase(listing.propertyType)
								: "Commercial"}
						</Badge>
					)}
				</div>

				<div className="mt-auto space-y-3">
					{isColumnVisible("capRate") && (
						<div className="flex justify-between items-center text-sm">
							<span className="text-gray-500 font-light flex items-center gap-1">
								<TrendingUp size={14} /> Cap Rate
							</span>
							<span className="font-medium text-gray-900">
								{listing.financials?.exitCapRate
									? `${listing.financials.exitCapRate.toFixed(2)}%`
									: "TBD"}
							</span>
						</div>
					)}
					{isColumnVisible("tokenPrice") && (
						<div className="flex justify-between items-center text-sm">
							<span className="text-gray-500 font-light flex items-center gap-1">
								<DollarSign size={14} /> Token Price
							</span>
							<span className="font-medium text-gray-900">
								{listing.tokenomics?.tokenPrice
									? `${listing.fundingCurrency === "HBAR" ? "ℏ" : "$"
									}${listing.tokenomics.tokenPrice.toLocaleString()} ${listing.fundingCurrency === "HBAR" ? "" : ""
									}`
									: "TBD"}
							</span>
						</div>
					)}
				</div>

				{/* Progress Bar (Only for funding stages) */}
				<div className="mt-5 pt-4 border-t border-gray-100">
					<div className="flex justify-between text-xs text-gray-600 mb-1.5">
						<span>Funded</span>
						<span className="font-medium text-gray-900">
							{fundingProgress.toFixed(0)}%
						</span>
					</div>
					<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
						<div
							className="h-full bg-[#D4A024] rounded-full transition-all duration-1000 ease-out"
							style={{ width: `${fundingProgress}%` }}
						/>
					</div>
					<div className="flex justify-between text-xs text-gray-400 mt-1.5">
						<span>
							Target:{" "}
							{targetRaise
								? `${listing.fundingCurrency === "HBAR" ? "ℏ" : "$"
								}${targetRaise.toLocaleString()}`
								: "TBD"}
						</span>
					</div>
				</div>

				<div className="mt-5">
					<Button
						onClick={(e) => {
							e.stopPropagation();
							handleViewDetails();
						}}
						className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
					>
						View Details
					</Button>
				</div>
			</div>
		</motion.div>
	);
};

export default ListingCard;

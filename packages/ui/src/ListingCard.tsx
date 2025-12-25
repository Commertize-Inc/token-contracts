import { motion } from "framer-motion";
import { MapPin, Building2 } from "lucide-react";
import Button from "./Button";

export interface ListingData {
	id: string;
	name: string;
	address?: string; // Optional as per template usage
	city: string;
	state: string;
	status: string;
	images: string[];
	financials: {
		targetRaise: number;
		tokenPrice: number;
		capRate?: number;
		noi?: number;
		occupancyRate?: number;
	};
	tokenContractAddress?: string;
	propertyType?: string;
	sponsor?: {
		businessName?: string;
		firstName?: string;
		email?: string;
	};
}

export interface ListingCardProps {
	listing: ListingData;
	index?: number;
	className?: string;
	onViewDetails?: () => void;
	currentFunding?: number;
}

export const ListingCard = ({
	listing,
	index = 0,
	className = "",
	onViewDetails,
	currentFunding = 0,
}: ListingCardProps) => {
	const handleViewDetails = () => {
		if (onViewDetails) {
			onViewDetails();
		} else {
			window.location.href = "/marketplace";
		}
	};

	const fundingProgress = listing.financials?.targetRaise
		? Math.min((currentFunding / listing.financials.targetRaise) * 100, 100)
		: 0;

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, delay: index * 0.1 }}
			className={`bg-white rounded-2xl border-2 border-[#D4A024] overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
		>
			<div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
				{listing.images && listing.images.length > 0 ? (
					<img
						src={listing.images[0]}
						alt={listing.name}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<Building2 size={64} className="text-[#D4A024]/30" />
					</div>
				)}
				<div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold rounded-full tracking-wide shadow-sm">
					{listing.status === "ACTIVE"
						? "FUNDING OPEN"
						: listing.status.replace(/_/g, " ")}
				</div>
			</div>
			<div className="p-5">
				<div className="flex items-start justify-between gap-2 mb-3">
					<h3 className="text-lg font-logo font-light text-gray-900 leading-tight">
						{listing.name}
					</h3>
					<span className="px-3 py-1 bg-white text-[#92710A] text-xs font-medium rounded-[0.75rem] whitespace-nowrap border-2 border-[#D4A024]">
						{listing.propertyType || "Commercial"}
					</span>
				</div>
				<div className="flex items-center gap-1 text-sm text-gray-900 mb-4">
					<MapPin size={14} className="text-[#D4A024]" />
					<span className="font-light">
						{listing.city}, {listing.state}
					</span>
				</div>

				<div className="mb-3">
					<div className="text-xs text-gray-900 font-light">Sponsor</div>
					<div className="text-sm text-gray-900 font-light">
						{listing.sponsor?.businessName ||
							listing.sponsor?.firstName ||
							"Commertize"}
					</div>
				</div>

				<div className="flex items-center justify-between mb-3">
					<span className="text-sm text-gray-900 font-light">
						{listing.status === "ACTIVE" ? "Funding Open" : listing.status}
					</span>
					<span className="text-sm text-gray-900 font-light">
						{fundingProgress.toFixed(0)}%
					</span>
				</div>
				<div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
					<div
						className="h-full bg-[#D4A024] rounded-full transition-all duration-500"
						style={{ width: `${fundingProgress}%` }}
					/>
				</div>

				<div className="text-center mb-4">
					<div className="text-sm text-gray-900 font-light">
						Target Raise: $
						{listing.financials?.targetRaise?.toLocaleString() || "TBD"}
					</div>
					<div className="text-xs text-gray-900 font-light">
						Min. Investment: $
						{listing.financials?.tokenPrice?.toLocaleString() || "TBD"}
					</div>
				</div>

				<Button width="full" variant="primary" onClick={handleViewDetails}>
					View Details
				</Button>
			</div>
		</motion.div>
	);
};

export default ListingCard;

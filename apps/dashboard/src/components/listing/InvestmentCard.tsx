import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@commertize/ui";
import { Share2 } from "lucide-react";
import { ListingStatus } from "@commertize/data/enums";

interface InvestmentCardProps {
	listingId: string;
	minInvestment: number;
	targetReturn: number;
	holdPeriod: number;
	raisedAmount?: number;
	targetAmount?: number;
	status: ListingStatus;
	canInvest?: boolean;
}

export const InvestmentCard = ({
	listingId,
	minInvestment,
	raisedAmount,
	targetAmount,
	status,
	canInvest = false,
}: InvestmentCardProps) => {
	const navigate = useNavigate();

	const tokenPrice = 50; // default or we need to pass it.
	const displayMinExec = minInvestment || 500;

	const [isCopied, setIsCopied] = useState(false);

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
			<h2 className="text-xl font-semibold mb-2">Invest in this Asset</h2>
			<p className="text-sm text-slate-500 mb-6">
				Minimum investment: ${displayMinExec.toLocaleString()}
			</p>

			<div className="space-y-4 mb-6">
				<div className="flex justify-between items-center py-2 border-b border-slate-100">
					<span className="text-slate-600">Price per Token</span>
					<span className="font-medium">${tokenPrice}</span>
				</div>
				<div className="flex justify-between items-center py-2 border-b border-slate-100">
					<span className="text-slate-600">Available Tokens</span>
					<span className="font-medium">
						{targetAmount && raisedAmount
							? Math.floor(
									(targetAmount - raisedAmount) / tokenPrice
								).toLocaleString()
							: "—"}
					</span>
				</div>
				<div className="flex justify-between items-center py-2 border-b border-slate-100">
					<span className="text-slate-600">Asset Class</span>
					<span className="font-medium">Commercial</span>
				</div>
			</div>

			<Button
				className="w-full mb-3 py-6 text-lg"
				disabled={status !== ListingStatus.ACTIVE}
				onClick={() => {
					if (status === ListingStatus.ACTIVE && !canInvest) {
						navigate("/onboarding");
					} else {
						navigate(`/invest/${listingId}`);
					}
				}}
			>
				{(() => {
					if (status === ListingStatus.ACTIVE && !canInvest) {
						return "Complete Profile to Invest";
					}
					switch (status) {
						case ListingStatus.ACTIVE:
							return "Invest Now";
						case ListingStatus.FULLY_FUNDED:
							return "Investment Closed";
						case ListingStatus.PENDING_REVIEW:
							return "Pending Review";
						case ListingStatus.APPROVED:
							return "Coming Soon";
						case ListingStatus.TOKENIZING:
							return "Tokenizing";
						case ListingStatus.DRAFT:
							return "Draft";
						case ListingStatus.REJECTED:
							return "Rejected";
						default:
							return "Coming Soon";
					}
				})()}
			</Button>

			<Button variant="outlined" className="w-full gap-2" onClick={handleShare}>
				{isCopied ? (
					<>
						<Share2 className="w-4 h-4 text-green-600" />
						<span className="text-green-600">Copied Link!</span>
					</>
				) : (
					<>
						<Share2 className="w-4 h-4" /> Share Opportunity
					</>
				)}
			</Button>

			<p className="text-xs text-slate-400 text-center mt-4">
				Investment involves risk. Please read the offering circular before
				investing.
			</p>
		</div>
	);
};

import type { Listing } from "@commertize/data";
import { BadgeDollarSign, TrendingUp, Wallet, PieChart } from "lucide-react";

export function ListingFinancials({
	financials,
	tokenomics,
}: {
	financials: Listing["financials"];
	tokenomics?: Listing["tokenomics"];
}) {
	const metrics = [
		{
			label: "Net Operating Income (NOI)",
			value: `$${financials.noi?.toLocaleString() || "0"}`,
			icon: Wallet,
			description: "Annual income after operating expenses",
		},
		{
			label: "Cap Rate",
			value: financials.exitCapRate ? `${financials.exitCapRate}%` : "",
			icon: TrendingUp,
			description: "Expected annual return on investment",
			highlight: true,
		},
		{
			label: "Token Price",
			value: tokenomics?.tokenPrice
				? `$${tokenomics.tokenPrice.toLocaleString()}`
				: "",
			icon: BadgeDollarSign,
			description: "Price per fractional share",
		},
		{
			label: "Occupancy Rate",
			value: `${financials.occupancyRate}%`,
			icon: PieChart,
			description: "Percentage of rented units",
		},
	];

	return (
		<div className="space-y-6">
			<div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
				<div className="flex justify-between items-end mb-2">
					<h3 className="text-sm font-medium text-slate-500">Target Raise</h3>
					<span className="text-lg font-bold text-slate-900">
						${financials.equityRequired?.toLocaleString() || "0"}
					</span>
				</div>
				{/* Simple progress bar simulation */}
				<div className="h-2 bg-slate-200 rounded-full overflow-hidden">
					<div className="h-full bg-primary-500 w-[0%]"></div>
				</div>
				<p className="text-xs text-slate-400 mt-2">0% funded</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{metrics.map((metric) => (
					<div
						key={metric.label}
						className={`p-4 rounded-lg border ${metric.highlight
								? "bg-amber-50 border-amber-100"
								: "bg-white border-slate-100"
							}`}
					>
						<div className="flex items-center gap-3 mb-2">
							<div
								className={`p-2 rounded-md ${metric.highlight
										? "bg-amber-100 text-amber-700"
										: "bg-slate-100 text-slate-600"
									}`}
							>
								<metric.icon className="w-5 h-5" />
							</div>
							<span className="font-medium text-slate-700">{metric.label}</span>
						</div>
						<p className="text-2xl font-bold text-slate-900 pl-[3.25rem]">
							{metric.value}
						</p>
						<p className="text-xs text-slate-500 pl-[3.25rem] mt-1">
							{metric.description}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

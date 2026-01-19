import { ExternalLink, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useState } from "react";

interface SubmissionDetailsProps {
	type: "KYC" | "INVESTOR" | "SPONSOR" | "LISTING";
	details: any;
}

export function SubmissionDetails({ type, details }: SubmissionDetailsProps) {
	const [showRaw, setShowRaw] = useState(false);

	if (!details) {
		return (
			<div className="text-sm italic text-muted-foreground">
				No additional details available.
			</div>
		);
	}

	const formatEnum = (value: string) => {
		if (!value) return "N/A";
		// Handle specific known enums
		if (value === "RULE_506_B") return "Rule 506(b)";
		if (value === "RULE_506_C") return "Rule 506(c)";
		if (value === "REG_CF") return "Reg CF";
		if (value === "REG_A") return "Reg A+";
		if (value === "REG_S") return "Reg S";
		if (value === "LLC") return "LLC";
		if (value === "C_CORP") return "C-Corp";
		if (value === "S_CORP") return "S-Corp";
		if (value === "LP") return "LP";
		if (value === "REIT") return "REIT";

		// Default: Replace underscores with spaces and Title Case
		return value
			.replace(/_/g, " ")
			.toLowerCase()
			.replace(/\b\w/g, (char) => char.toUpperCase());
	};

	const formatCurrency = (value: number | string) => {
		if (value === undefined || value === null) return "N/A";
		const num = Number(value);
		if (isNaN(num)) return String(value);
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(num);
	};

	const formatPercent = (value: number | string) => {
		if (value === undefined || value === null) return "N/A";
		let num = Number(value);
		if (isNaN(num)) return String(value);

		// If value is small (e.g. 0.05), assume it needs x100
		// If value is large (e.g. 5), assume it is already a percent
		// This is a heuristic, adjust based on actual data usage
		// Based on screenshots, 0.95 -> 95%, so x100 is likely needed for decimals
		// But let's check if it's likely a decimal representation
		if (num <= 1 && num > 0) {
			num = num * 100;
		}

		return `${num}%`;
	};

	const renderField = (
		label: string,
		value: any,
		formatter?: (v: any) => string
	) => {
		if (value === undefined || value === null || value === "") return null;

		const displayValue = formatter ? formatter(value) : String(value);

		return (
			<div className="space-y-1">
				<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
					{label}
				</label>
				<div className="text-sm text-foreground">{displayValue}</div>
			</div>
		);
	};

	const renderDocumentList = (
		documents: string[] | undefined,
		label = "Documents",
		isImage = false
	) => {
		if (!documents || documents.length === 0) return null;

		return (
			<div className="space-y-2 mt-4">
				<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
					{label}
				</label>

				{isImage ? (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{documents.map((url, idx) => (
							<a
								key={idx}
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden border hover:border-primary transition-all"
							>
								<img
									src={url}
									alt={`${label} ${idx + 1}`}
									className="w-full h-full object-cover"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											"https://placehold.co/400x300?text=Error+Loading";
									}}
								/>
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
									<ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
								</div>
							</a>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-2">
						{documents.map((url, idx) => (
							<a
								key={idx}
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center p-2 rounded-md border bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-colors group"
							>
								<div className="bg-white p-1.5 rounded border mr-3">
									<FileText className="h-4 w-4 text-blue-500" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium text-foreground truncate">
										Document {idx + 1}
									</div>
									<div className="text-xs text-muted-foreground truncate opacity-70 group-hover:opacity-100">
										{url}
									</div>
								</div>
								<ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary ml-2 flex-shrink-0" />
							</a>
						))}
					</div>
				)}
			</div>
		);
	};

	const renderInvestorDetails = () => {
		return (
			<div className="space-y-4">
				<h4 className="font-semibold text-sm border-b pb-2">
					Investor Information
				</h4>

				<div className="grid grid-cols-2 gap-4">
					{renderField("Investor Type", details.type, formatEnum)}
					{renderField(
						"Investment Experience",
						details.investmentExperience,
						formatEnum
					)}
					{renderField("Risk Tolerance", details.riskTolerance, formatEnum)}
					{renderField(
						"Liquid Net Worth",
						details.liquidNetWorth,
						formatCurrency
					)}
					{renderField("Tax Country", details.taxCountry)}
					{renderField(
						"Accreditation Type",
						details.accreditationType,
						formatEnum
					)}
					{renderField(
						"Verification Method",
						details.verificationMethod,
						formatEnum
					)}
				</div>

				{renderDocumentList(
					details.accreditationDocuments,
					"Accreditation Documents"
				)}
			</div>
		);
	};

	const renderSponsorDetails = () => {
		return (
			<div className="space-y-4">
				<h4 className="font-semibold text-sm border-b pb-2">
					Sponsor Information
				</h4>

				<div className="grid grid-cols-2 gap-4">
					{renderField("Business Name", details.businessName)}
					{renderField(
						"Business Type",
						details.kybData?.businessType,
						formatEnum
					)}
					{renderField("EIN", details.ein)}
					{renderField("Address", details.address)}
				</div>

				{details.bio && (
					<div className="space-y-1">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Bio
						</label>
						<div className="text-sm text-foreground bg-slate-50 rounded p-3 border">
							{details.bio}
						</div>
					</div>
				)}

				{renderDocumentList(details.kybData?.documents, "Business Documents")}
			</div>
		);
	};

	const renderListingDetails = () => {
		return (
			<div className="space-y-4">
				<h4 className="font-semibold text-sm border-b pb-2">
					Property Information
				</h4>

				<div className="grid grid-cols-2 gap-4">
					{renderField("Name", details.name)}
					{renderField("Property Type", details.propertyType, formatEnum)}
					{renderField("Address", details.address)}
					{renderField("City", details.city)}
					{renderField("State", details.state)}
					{renderField("Zip Code", details.zipCode)}
					{renderField("Construction Year", details.constructionYear)}
					{renderField("Total Units", details.totalUnits)}
				</div>

				{details.description && (
					<div className="space-y-1 mt-4">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Description
						</label>
						<div className="text-sm text-foreground bg-slate-50 rounded p-3 border whitespace-pre-wrap">
							{details.description}
						</div>
					</div>
				)}

				{details.highlights && details.highlights.length > 0 && (
					<div className="space-y-2 mt-4">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
							Highlights
						</label>
						<ul className="list-none space-y-2 text-sm bg-slate-50 p-3 rounded border">
							{details.highlights.map((highlight: string, idx: number) => (
								<li key={idx} className="flex gap-2">
									<span className="text-primary font-bold">•</span>
									<span>{highlight}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{details.financials && (
					<>
						<h4 className="font-semibold text-sm border-b pb-2 mt-6">
							Financials
						</h4>
						<div className="grid grid-cols-2 gap-4 mt-4">
							{renderField(
								"Target Raise",
								details.financials.targetRaise,
								formatCurrency
							)}
							{renderField(
								"Token Price",
								details.financials.tokenPrice,
								formatCurrency
							)}
							{renderField(
								"Cap Rate",
								details.financials.capRate,
								formatPercent
							)}
							{renderField("NOI", details.financials.noi, formatCurrency)}
							{renderField(
								"Occupancy Rate",
								details.financials.occupancyRate,
								formatPercent
							)}
						</div>
					</>
				)}

				<h4 className="font-semibold text-sm border-b pb-2 mt-6">
					Offering Details
				</h4>
				<div className="grid grid-cols-2 gap-4 mt-4">
					{renderField("Offering Type", details.offeringType, formatEnum)}
					{renderField("Entity Structure", details.entityStructure, formatEnum)}
				</div>

				{renderDocumentList(details.images, "Property Images", true)}
				{renderDocumentList(details.documents, "Offering Documents")}
			</div>
		);
	};

	return (
		<div className="space-y-4">
			{type === "INVESTOR" && renderInvestorDetails()}
			{type === "SPONSOR" && renderSponsorDetails()}
			{type === "LISTING" && renderListingDetails()}
			{type === "KYC" && (
				<div className="text-sm text-muted-foreground italic">
					KYC verification handled by Plaid. No additional details to display.
				</div>
			)}

			{/* Raw Data Toggle */}
			<div className="pt-4 border-t mt-6">
				<button
					onClick={() => setShowRaw(!showRaw)}
					className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
				>
					{showRaw ? (
						<ChevronUp className="h-3 w-3" />
					) : (
						<ChevronDown className="h-3 w-3" />
					)}
					{showRaw ? "Hide" : "Show"} Raw Data
				</button>

				{showRaw && (
					<div className="bg-slate-100 rounded-lg p-4 border font-mono text-xs overflow-x-auto mt-2">
						<pre className="whitespace-pre-wrap">
							{JSON.stringify(details, null, 2)}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
}

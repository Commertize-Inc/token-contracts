import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
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

	const renderField = (label: string, value: any) => {
		if (value === undefined || value === null || value === "") return null;

		return (
			<div className="space-y-1">
				<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
					{label}
				</label>
				<div className="text-sm text-foreground">{String(value)}</div>
			</div>
		);
	};

	const renderDocumentList = (
		documents: string[] | undefined,
		label = "Documents"
	) => {
		if (!documents || documents.length === 0) return null;

		return (
			<div className="space-y-2">
				<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
					{label}
				</label>
				<div className="space-y-1">
					{documents.map((url, idx) => (
						<a
							key={idx}
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
						>
							<ExternalLink className="h-3 w-3 flex-shrink-0" />
							<span className="truncate">{url}</span>
						</a>
					))}
				</div>
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
					{renderField("Investor Type", details.type)}
					{renderField("Investment Experience", details.investmentExperience)}
					{renderField("Risk Tolerance", details.riskTolerance)}
					{renderField(
						"Liquid Net Worth",
						details.liquidNetWorth ? `$${details.liquidNetWorth}` : null
					)}
					{renderField("Tax Country", details.taxCountry)}
					{renderField("Accreditation Type", details.accreditationType)}
					{renderField("Verification Method", details.verificationMethod)}
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
					{renderField("Business Type", details.kybData?.businessType)}
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
					{renderField("Property Type", details.propertyType)}
					{renderField("Address", details.address)}
					{renderField("City", details.city)}
					{renderField("State", details.state)}
					{renderField("Zip Code", details.zipCode)}
					{renderField("Construction Year", details.constructionYear)}
					{renderField("Total Units", details.totalUnits)}
				</div>

				{details.description && (
					<div className="space-y-1">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Description
						</label>
						<div className="text-sm text-foreground bg-slate-50 rounded p-3 border">
							{details.description}
						</div>
					</div>
				)}

				{details.highlights && details.highlights.length > 0 && (
					<div className="space-y-2">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
							Highlights
						</label>
						<ul className="list-disc list-inside space-y-1 text-sm">
							{details.highlights.map((highlight: string, idx: number) => (
								<li key={idx}>{highlight}</li>
							))}
						</ul>
					</div>
				)}

				{details.financials && (
					<>
						<h4 className="font-semibold text-sm border-b pb-2 mt-4">
							Financials
						</h4>
						<div className="grid grid-cols-2 gap-4">
							{renderField(
								"Target Raise",
								details.financials.targetRaise
									? `$${details.financials.targetRaise.toLocaleString()}`
									: null
							)}
							{renderField(
								"Token Price",
								details.financials.tokenPrice
									? `$${details.financials.tokenPrice}`
									: null
							)}
							{renderField(
								"Cap Rate",
								details.financials.capRate
									? `${details.financials.capRate}%`
									: null
							)}
							{renderField(
								"NOI",
								details.financials.noi
									? `$${details.financials.noi.toLocaleString()}`
									: null
							)}
							{renderField(
								"Occupancy Rate",
								details.financials.occupancyRate
									? `${details.financials.occupancyRate}%`
									: null
							)}
						</div>
					</>
				)}

				<h4 className="font-semibold text-sm border-b pb-2 mt-4">
					Offering Details
				</h4>
				<div className="grid grid-cols-2 gap-4">
					{renderField("Offering Type", details.offeringType)}
					{renderField("Entity Structure", details.entityStructure)}
				</div>

				{renderDocumentList(details.images, "Images")}
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
			<div className="pt-4 border-t">
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

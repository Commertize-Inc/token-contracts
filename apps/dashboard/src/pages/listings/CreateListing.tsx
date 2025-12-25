import { EntityStructure, OfferingType, PropertyType } from "@commertize/data/enums";
import { createListingSchema } from "@commertize/data/schemas/property";
import type { SubNavbarItem } from "@commertize/ui";
import { Button, Input, SubNavbar } from "@commertize/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAccessToken } from "@privy-io/react-auth";
import {
	Building2,
	CheckCircle2,
	DollarSign, // Used in SectionTitle icon
	FileText,
	Image as ImageIcon,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Navbar } from "../../components/Navbar";
import { Tooltip } from "../../components/Tooltip";
import { api } from "../../lib/api";

// Extend shared schema for form-specific structures (RHF generic field arrays prefer objects)
const formSchema = createListingSchema.extend({
	images: z
		.array(z.object({ value: z.string().url("Must be a valid URL") }))
		.optional()
		.default([{ value: "" }]),
	documents: z
		.array(z.object({ value: z.string().url("Must be a valid URL") }))
		.optional()
		.default([{ value: "" }]),
	highlights: z
		.array(z.object({ value: z.string().min(1, "Highlight cannot be empty") }))
		.optional()
		.default([{ value: "" }]),
});

type CreateListingFormData = z.infer<typeof formSchema>;

// Property type labels for display
const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
	[PropertyType.MULTIFAMILY]: "Multifamily",
	[PropertyType.OFFICE]: "Office",
	[PropertyType.RETAIL]: "Retail",
	[PropertyType.INDUSTRIAL]: "Industrial",
	[PropertyType.MIXED_USE]: "Mixed-Use",
	[PropertyType.HOSPITALITY]: "Hospitality",
	[PropertyType.DATA_CENTERS]: "Data Centers",
	[PropertyType.SPECIAL_PURPOSE]: "Special Purpose",
	[PropertyType.OTHER]: "Other",
};

export default function CreateListing() {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// SubNavbar configuration
	const navItems: SubNavbarItem[] = [
		{ id: "listing-details", label: "Details" },
		{ id: "deal-economics", label: "Economics" },
		{ id: "debt-terms", label: "Debt" },
		{ id: "sources-uses", label: "Sources" },
		{ id: "operating-history", label: "Operating" },
		{ id: "pro-forma-exit", label: "Exit" },
		{ id: "return-targets", label: "Returns" },
		{ id: "distribution-policy", label: "Distribution" },
		{ id: "tokenomics", label: "Tokenomics" },
		{ id: "offering-structure", label: "Offering" },
		{ id: "images-highlights", label: "Media" },
		{ id: "documents", label: "Documents" },
	];

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateListingFormData>({
		resolver: zodResolver(formSchema as any),
		defaultValues: {
			offeringType: OfferingType.RULE_506_B,
			images: [{ value: "" }],
			documents: [{ value: "" }],
			highlights: [{ value: "" }],
			financials: {
				purchasePrice: 0,
				totalCapitalization: 0,
				loanAmount: 0,
				loanToValue: 0,
				interestRate: 0,
				loanTermYears: 0,
				equityRequired: 0,
				closingCosts: 0,
				acquisitionFee: 0,
				capexBudget: 0,
				workingCapital: 0,
				reservesInitial: 0,
				effectiveGrossIncome: 0,
				operatingExpenses: 0,
				noi: 0,
				occupancyRate: 0,
				annualRentGrowth: 0,
				annualExpenseGrowth: 0,
				holdPeriodYears: 0,
				exitCapRate: 0,
				exitSalePrice: 0,
				targetCoCYear1: 0,
				targetAvgCoC: 0,
				targetIRR: 0,
				targetEquityMultiple: 0,
				preferredReturn: 0,
				sponsorPromote: 0,
				payoutRatioOfFCF: 0,
				distributionFrequency: "QUARTERLY" as const,
			},
			tokenomics: {
				totalTokenSupply: 0,
				tokensForInvestors: 0,
				tokensForSponsor: 0,
				tokensForTreasury: 0,
				tokenPrice: 0,
				minInvestmentTokens: 0,
				transferRestricted: false,
			},
		},
	});

	// Field arrays for dynamic inputs
	const {
		fields: imageFields,
		append: appendImage,
		remove: removeImage,
	} = useFieldArray({
		control,
		name: "images",
	});

	const {
		fields: documentFields,
		append: appendDocument,
		remove: removeDocument,
	} = useFieldArray({
		control,
		name: "documents",
	});

	const {
		fields: highlightFields,
		append: appendHighlight,
		remove: removeHighlight,
	} = useFieldArray({
		control,
		name: "highlights",
	});

	const onSubmit = async (data: CreateListingFormData) => {
		setIsSubmitting(true);
		setServerError(null);

		try {
			// Transform object arrays back to string arrays for the API
			const cleanData = {
				...data,
				images:
					data.images?.map((i) => i.value).filter((i) => i.trim() !== "") || [],
				documents:
					data.documents?.map((d) => d.value).filter((d) => d.trim() !== "") ||
					[],
				highlights:
					data.highlights?.map((h) => h.value).filter((h) => h.trim() !== "") ||
					[],
			};

			const token = await getAccessToken();
			const response = await api.post("/listings", cleanData, token);
			if (response.success) {
				// Redirect to a success page or the new listing
				// For now, let's go back to the dashboard or listings list
				navigate("/sponsor/dashboard", { state: { listingCreated: true } });
			}
		} catch (error: any) {
			console.error("Submission error:", error);
			setServerError(
				error.response?.data?.error ||
				"Failed to create listing. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const SectionTitle = ({
		icon: Icon,
		title,
	}: {
		icon: any;
		title: string;
	}) => (
		<div className="flex items-center space-x-2 border-b border-slate-200 pb-2 mb-6 mt-8 First:mt-0">
			<Icon className="w-5 h-5 text-[#C59B26]" />
			<h3 className="text-lg font-semibold text-slate-800">{title}</h3>
		</div>
	);

	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />
			<div className="flex gap-8 max-w-[90rem] mx-auto py-10 px-4 sm:px-6 lg:px-8">
				{/* Vertical SubNavbar Sidebar */}
				<SubNavbar
					items={navItems}
					variant="vertical"
					offset={100}
					className="hidden lg:flex"
				/>

				<div className="flex-1 max-w-4xl">
					<div className="mb-10 text-center">
						<h1 className="text-3xl font-bold text-slate-900">New Listing</h1>
						<p className="mt-2 text-slate-600">
							Submit a new property for tokenization and marketplace listing.
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="bg-white shadow-xl rounded-2xl p-8 border border-slate-100"
					>
						{serverError && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
								{serverError}
							</div>
						)}

						<div id="listing-details">
							<SectionTitle icon={Building2} title="Listing Details" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700">
									Listing Name
								</label>
								<Input
									{...register("name")}
									placeholder="e.g. Crypto.com Arena"
									className={errors.name ? "border-red-500" : ""}
								/>
								{errors.name && (
									<p className="text-xs text-red-500">{errors.name.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700">
									Asset Type
								</label>
								<select
									{...register("propertyType")}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C59B26] bg-white h-10"
								>
									<option value="">Select Asset Type...</option>
									{Object.values(PropertyType).map((type) => (
										<option key={type} value={type}>
											{PROPERTY_TYPE_LABELS[type]}
										</option>
									))}
								</select>
								{errors.propertyType && (
									<p className="text-xs text-red-500">
										{errors.propertyType.message}
									</p>
								)}
							</div>

							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium text-slate-700">
									Address
								</label>
								<Input
									{...register("address")}
									placeholder="Street Address"
									className={errors.address ? "border-red-500" : ""}
								/>
								{errors.address && (
									<p className="text-xs text-red-500">{errors.address.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700">City</label>
								<Input
									{...register("city")}
									placeholder="City"
									className={errors.city ? "border-red-500" : ""}
								/>
								{errors.city && (
									<p className="text-xs text-red-500">{errors.city.message}</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-700">
										State
									</label>
									<Input
										{...register("state")}
										placeholder="NY"
										className={errors.state ? "border-red-500" : ""}
									/>
									{errors.state && (
										<p className="text-xs text-red-500">{errors.state.message}</p>
									)}
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-700">
										Zip Code
									</label>
									<Input
										{...register("zipCode")}
										placeholder="10001"
										className={errors.zipCode ? "border-red-500" : ""}
									/>
									{errors.zipCode && (
										<p className="text-xs text-red-500">
											{errors.zipCode.message}
										</p>
									)}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-700">
										Construction Year
									</label>
									<Input
										type="number"
										{...register("constructionYear", { valueAsNumber: true })}
										placeholder="YYYY"
									/>
									{errors.constructionYear && (
										<p className="text-xs text-red-500">
											{errors.constructionYear.message}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-700">
										Total Units
									</label>
									<Input
										type="number"
										{...register("totalUnits", { valueAsNumber: true })}
										placeholder="e.g. 24"
									/>
									{errors.totalUnits && (
										<p className="text-xs text-red-500">
											{errors.totalUnits.message}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium text-slate-700">
									Description
								</label>
								<textarea
									{...register("description")}
									rows={4}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C59B26] focus:border-transparent sm:text-sm"
								/>
							</div>
						</div>

						<div id="deal-economics">
							<SectionTitle icon={DollarSign} title="Deal Economics" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Purchase Price ($)
									<Tooltip content="Total acquisition price of the property." />
								</label>
								<Input
									type="number"
									{...register("financials.purchasePrice", { valueAsNumber: true })}
									placeholder="5000000"
									className={
										errors.financials?.purchasePrice ? "border-red-500" : ""
									}
								/>
								{errors.financials?.purchasePrice && (
									<p className="text-xs text-red-500">
										{errors.financials.purchasePrice.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Total Capitalization ($)
									<Tooltip content="Total equity + debt, including all fees and reserves." />
								</label>
								<Input
									type="number"
									{...register("financials.totalCapitalization", { valueAsNumber: true })}
									placeholder="6000000"
									className={
										errors.financials?.totalCapitalization ? "border-red-500" : ""
									}
								/>
								{errors.financials?.totalCapitalization && (
									<p className="text-xs text-red-500">
										{errors.financials.totalCapitalization.message}
									</p>
								)}
							</div>
						</div>

						<div id="debt-terms">
							<SectionTitle icon={DollarSign} title="Debt Terms" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Loan Amount ($)
									<Tooltip content="Total amount of debt financing." />
								</label>
								<Input
									type="number"
									{...register("financials.loanAmount", { valueAsNumber: true })}
									placeholder="3500000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Loan-to-Value (LTV)
									<Tooltip content="Loan amount as a fraction of property value (0-1, e.g., 0.70 for 70%)." />
								</label>
								<Input
									type="number"
									step="0.01"
									{...register("financials.loanToValue", { valueAsNumber: true })}
									placeholder="0.70"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Interest Rate
									<Tooltip content="Annual interest rate as a decimal (e.g., 0.045 for 4.5%)." />
								</label>
								<Input
									type="number"
									step="0.001"
									{...register("financials.interestRate", { valueAsNumber: true })}
									placeholder="0.045"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Loan Term (Years)
									<Tooltip content="Total term of the loan in years." />
								</label>
								<Input
									type="number"
									{...register("financials.loanTermYears", { valueAsNumber: true })}
									placeholder="10"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Amortization Period (Years)
									<Tooltip content="Amortization schedule in years (optional)." />
								</label>
								<Input
									type="number"
									{...register("financials.amortizationYears", { valueAsNumber: true })}
									placeholder="30"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Interest-Only Period (Years)
									<Tooltip content="Number of years with interest-only payments (optional)." />
								</label>
								<Input
									type="number"
									{...register("financials.interestOnlyYears", { valueAsNumber: true })}
									placeholder="3"
								/>
							</div>
						</div>

						<div id="sources-uses">
							<SectionTitle icon={DollarSign} title="Sources & Uses" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Equity Required ($)
									<Tooltip content="Total equity capital needed from investors." />
								</label>
								<Input
									type="number"
									{...register("financials.equityRequired", { valueAsNumber: true })}
									placeholder="2500000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Closing Costs ($)
									<Tooltip content="Transaction closing costs and fees." />
								</label>
								<Input
									type="number"
									{...register("financials.closingCosts", { valueAsNumber: true })}
									placeholder="150000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Acquisition Fee ($)
									<Tooltip content="Fee paid to sponsor for acquiring the property." />
								</label>
								<Input
									type="number"
									{...register("financials.acquisitionFee", { valueAsNumber: true })}
									placeholder="100000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									CapEx Budget ($)
									<Tooltip content="Capital expenditure budget for improvements." />
								</label>
								<Input
									type="number"
									{...register("financials.capexBudget", { valueAsNumber: true })}
									placeholder="200000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Working Capital ($)
									<Tooltip content="Operating cash reserves for ongoing expenses." />
								</label>
								<Input
									type="number"
									{...register("financials.workingCapital", { valueAsNumber: true })}
									placeholder="50000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Initial Reserves ($)
									<Tooltip content="Initial reserve funds for contingencies." />
								</label>
								<Input
									type="number"
									{...register("financials.reservesInitial", { valueAsNumber: true })}
									placeholder="100000"
								/>
							</div>
						</div>

						<div id="operating-history">
							<SectionTitle icon={DollarSign} title="Operating History" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Effective Gross Income ($)
									<Tooltip content="Total rental income before operating expenses." />
								</label>
								<Input
									type="number"
									{...register("financials.effectiveGrossIncome", { valueAsNumber: true })}
									placeholder="500000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Operating Expenses ($)
									<Tooltip content="Annual operating expenses (excluding debt service)." />
								</label>
								<Input
									type="number"
									{...register("financials.operatingExpenses", { valueAsNumber: true })}
									placeholder="200000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									NOI ($)
									<Tooltip content="Net Operating Income: Annual income after operating expenses." />
								</label>
								<Input
									type="number"
									{...register("financials.noi", { valueAsNumber: true })}
									placeholder="300000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Occupancy Rate
									<Tooltip content="Percentage of units/space currently occupied (0-1, e.g., 0.95 for 95%)." />
								</label>
								<Input
									type="number"
									step="0.01"
									{...register("financials.occupancyRate", {
										valueAsNumber: true,
									})}
									placeholder="0.95"
								/>
							</div>
						</div>

						<div id="pro-forma-exit">
							<SectionTitle icon={DollarSign} title="Pro Forma & Exit Strategy" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Annual Rent Growth
									<Tooltip content="Expected annual rent growth rate (0-1, e.g., 0.03 for 3%)." />
								</label>
								<Input
									type="number"
									step="0.001"
									{...register("financials.annualRentGrowth", { valueAsNumber: true })}
									placeholder="0.03"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Annual Expense Growth
									<Tooltip content="Expected annual expense growth rate (0-1, e.g., 0.02 for 2%)." />
								</label>
								<Input
									type="number"
									step="0.001"
									{...register("financials.annualExpenseGrowth", { valueAsNumber: true })}
									placeholder="0.02"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Hold Period (Years)
									<Tooltip content="Expected investment hold period before exit." />
								</label>
								<Input
									type="number"
									{...register("financials.holdPeriodYears", { valueAsNumber: true })}
									placeholder="7"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Exit Cap Rate
									<Tooltip content="Expected capitalization rate at exit (0-1, e.g., 0.055 for 5.5%)." />
								</label>
								<Input
									type="number"
									step="0.001"
									{...register("financials.exitCapRate", { valueAsNumber: true })}
									placeholder="0.055"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Exit Sale Price ($)
									<Tooltip content="Projected sale price at exit." />
								</label>
								<Input
									type="number"
									{...register("financials.exitSalePrice", { valueAsNumber: true })}
									placeholder="6500000"
								/>
							</div>
						</div>

						<div id="return-targets">
							<SectionTitle icon={DollarSign} title="Return Targets" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Target CoC Year 1
									<Tooltip content="Target cash-on-cash return for year 1 (0-1, e.g., 0.08 for 8%)." />
								</label>
								<Input
									type="number"
									step="0.001"
									{...register("financials.targetCoCYear1", { valueAsNumber: true })}
									placeholder="0.08"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Target Average CoC
									<Tooltip content="Target average cash-on-cash return over hold period (0-1)." />
								</label>
								<Input
									type="number"
									step="0.001"
									{...register("financials.targetAvgCoC", { valueAsNumber: true })}
									placeholder="0.09"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Target IRR
									<Tooltip content="Target internal rate of return (0-1, e.g., 0.15 for 15%)." />
								</label>
								<Input
									type="number"
									step="0.001"
									{...register("financials.targetIRR", { valueAsNumber: true })}
									placeholder="0.15"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Target Equity Multiple
									<Tooltip content="Target equity multiple at exit (e.g., 2.0 for 2x return)." />
								</label>
								<Input
									type="number"
									step="0.1"
									{...register("financials.targetEquityMultiple", { valueAsNumber: true })}
									placeholder="2.0"
								/>
							</div>
						</div>

						<div id="distribution-policy">
							<SectionTitle icon={DollarSign} title="Distribution Policy" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Preferred Return
									<Tooltip content="Investor preferred return rate before sponsor promote (0-1, e.g., 0.08 for 8%)." />
								</label>
								<Input
									type="number"
									step="0.001"
									{...register("financials.preferredReturn", { valueAsNumber: true })}
									placeholder="0.08"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Sponsor Promote
									<Tooltip content="Sponsor's share of profits above preferred return (0-1, e.g., 0.20 for 20%)." />
								</label>
								<Input
									type="number"
									step="0.01"
									{...register("financials.sponsorPromote", { valueAsNumber: true })}
									placeholder="0.20"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Payout Ratio of FCF
									<Tooltip content="Percentage of free cash flow distributed to investors (0-1, e.g., 0.90 for 90%)." />
								</label>
								<Input
									type="number"
									step="0.01"
									{...register("financials.payoutRatioOfFCF", { valueAsNumber: true })}
									placeholder="0.90"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Distribution Frequency
									<Tooltip content="How often distributions are paid to investors." />
								</label>
								<select
									{...register("financials.distributionFrequency")}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C59B26] bg-white h-10"
								>
									<option value="MONTHLY">Monthly</option>
									<option value="QUARTERLY">Quarterly</option>
									<option value="ANNUAL">Annual</option>
								</select>
							</div>
						</div>

						<div id="tokenomics">
							<SectionTitle icon={DollarSign} title="Tokenomics" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Total Token Supply
									<Tooltip content="Total number of tokens to be minted for this property." />
								</label>
								<Input
									type="number"
									{...register("tokenomics.totalTokenSupply", { valueAsNumber: true })}
									placeholder="100000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Tokens for Investors
									<Tooltip content="Number of tokens available for investor purchase." />
								</label>
								<Input
									type="number"
									{...register("tokenomics.tokensForInvestors", { valueAsNumber: true })}
									placeholder="80000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Tokens for Sponsor
									<Tooltip content="Number of tokens reserved for the sponsor/GP." />
								</label>
								<Input
									type="number"
									{...register("tokenomics.tokensForSponsor", { valueAsNumber: true })}
									placeholder="15000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Tokens for Treasury
									<Tooltip content="Number of tokens reserved for platform/treasury." />
								</label>
								<Input
									type="number"
									{...register("tokenomics.tokensForTreasury", { valueAsNumber: true })}
									placeholder="5000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Token Price ($)
									<Tooltip content="Price per individual token in USD." />
								</label>
								<Input
									type="number"
									step="0.01"
									{...register("tokenomics.tokenPrice", { valueAsNumber: true })}
									placeholder="50.00"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Min Investment (Tokens)
									<Tooltip content="Minimum number of tokens an investor must purchase." />
								</label>
								<Input
									type="number"
									{...register("tokenomics.minInvestmentTokens", { valueAsNumber: true })}
									placeholder="10"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Max Investment (Tokens)
									<Tooltip content="Maximum number of tokens an investor can purchase (optional)." />
								</label>
								<Input
									type="number"
									{...register("tokenomics.maxInvestmentTokens", { valueAsNumber: true })}
									placeholder="5000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Lockup Period (Months)
									<Tooltip content="Number of months tokens are locked before transfer (optional)." />
								</label>
								<Input
									type="number"
									{...register("tokenomics.lockupMonths", { valueAsNumber: true })}
									placeholder="12"
								/>
							</div>

							<div className="space-y-2 md:col-span-2">
								<label className="flex items-center gap-2 text-sm font-medium text-slate-700">
									<input
										type="checkbox"
										{...register("tokenomics.transferRestricted")}
										className="rounded border-slate-300 text-[#C59B26] focus:ring-[#C59B26]"
									/>
									Transfer Restricted
									<Tooltip content="Check if token transfers are restricted (e.g., for Reg D compliance)." />
								</label>
							</div>
						</div>

						<div id="offering-structure">
							<SectionTitle icon={Building2} title="Offering Structure" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Offering Type
									<Tooltip content="Regulatory exemption structure (e.g., Rule 506(b) vs 506(c))." />
								</label>
								<select
									{...register("offeringType")}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C59B26] bg-white h-10"
								>
									{Object.values(OfferingType).map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 flex items-center gap-1">
									Entity Structure
									<Tooltip content="Legal structure of the property ownership entity (e.g., LLC, LP)." />
								</label>
								<select
									{...register("entityStructure")}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C59B26] bg-white h-10"
								>
									<option value="">Select Structure...</option>
									{Object.values(EntityStructure).map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
							</div>
						</div>

						<div id="images-highlights">
							<SectionTitle icon={ImageIcon} title="Images & Highlights" />
						</div>

						<div className="space-y-6">
							<div className="space-y-3">
								<label className="text-sm font-medium text-slate-700 block">
									Listing Images (URLs)
								</label>
								{imageFields.map((field: any, index: number) => (
									<div key={field.id} className="flex gap-2">
										<Input
											{...register(`images.${index}.value` as const)}
											placeholder="https://..."
											className="flex-1"
										/>
										<button
											type="button"
											onClick={() => removeImage(index)}
											className="p-2 text-slate-400 hover:text-red-500 transition-colors"
										>
											<Trash2 className="w-5 h-5" />
										</button>
									</div>
								))}
								<Button
									type="button"
									variant="outlined"
									onClick={() => appendImage({ value: "" })}
									className="mt-2 text-sm"
									icon={Plus}
								>
									Add Image URL
								</Button>
							</div>

							<div className="space-y-3">
								<label className="text-sm font-medium text-slate-700 block">
									Investment Highlights
								</label>
								{highlightFields.map((field: any, index: number) => (
									<div key={field.id} className="flex gap-2">
										<Input
											{...register(`highlights.${index}.value` as const)}
											placeholder="e.g. 'Located in high-growth Opportunity Zone'"
											className="flex-1"
										/>
										<button
											type="button"
											onClick={() => removeHighlight(index)}
											className="p-2 text-slate-400 hover:text-red-500 transition-colors"
										>
											<Trash2 className="w-5 h-5" />
										</button>
									</div>
								))}
								<Button
									type="button"
									variant="outlined"
									onClick={() => appendHighlight({ value: "" })}
									className="mt-2 text-sm"
									icon={Plus}
								>
									Add Highlight
								</Button>
							</div>
						</div>

						<div id="documents">
							<SectionTitle icon={FileText} title="Documents & Compliance" />
						</div>

						<div className="space-y-3">
							<label className="text-sm font-medium text-slate-700 block">
								Offering Documents (URLs)
							</label>
							<p className="text-xs text-slate-500 mb-2">
								Please provide links to the Offering Memorandum, Subscription
								Agreement, and external compliance documents.
							</p>
							{documentFields.map((field: any, index: number) => (
								<div key={field.id} className="flex gap-2">
									<Input
										{...register(`documents.${index}.value` as const)}
										placeholder="https://..."
										className="flex-1"
									/>
									<button
										type="button"
										onClick={() => removeDocument(index)}
										className="p-2 text-slate-400 hover:text-red-500 transition-colors"
									>
										<Trash2 className="w-5 h-5" />
									</button>
								</div>
							))}
							<Button
								type="button"
								variant="outlined"
								onClick={() => appendDocument({ value: "" })}
								className="mt-2 text-sm"
								icon={Plus}
							>
								Add Document URL
							</Button>
						</div>

						<div className="mt-10 pt-6 border-t border-slate-200 flex justify-end gap-3">
							<Button
								type="button"
								variant="secondary"
								onClick={() => navigate("/dashboard")}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="min-w-[150px]"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Submitting...
									</>
								) : (
									<>
										<CheckCircle2 className="w-4 h-4 mr-2" />
										Submit Listing
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

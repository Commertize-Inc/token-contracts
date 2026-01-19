import {
	EntityStructure,
	OfferingType,
	PropertyType,
	SupportedNetwork,
	SupportedCurrency,
} from "@commertize/data/enums";
import { createListingSchema } from "@commertize/data/schemas/property";
import type { SubNavbarItem } from "@commertize/ui";
import {
	Button,
	Input,
	SubNavbar,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
	FileUpload,
	ErrorModal,
	Switch,
	MultiSelect,
} from "@commertize/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAccessToken } from "@privy-io/react-auth";
import {
	Activity,
	Building2,
	CheckCircle2,
	Coins,
	DollarSign, // Used in SectionTitle icon
	FileText,
	Flag,
	FolderOpen,
	Image as ImageIcon,
	Landmark,
	Loader2,
	PieChart,
	Plus,
	Scroll,
	Share2,
	Trash2,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Tooltip } from "../../components/Tooltip";
import { api } from "../../lib/api";
import { useOnboardingStatus } from "../../hooks/useOnboardingStatus";
import { usePostHog } from "@commertize/utils/client";

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

const CurrencySymbol: Record<SupportedCurrency, string> = {
	[SupportedCurrency.USD]: "$",
	[SupportedCurrency.USDC]: "USDC",
	[SupportedCurrency.HBAR]: "ℏ",
	[SupportedCurrency.ETH]: "Ξ",
	[SupportedCurrency.AVAX]: "AVAX",
	[SupportedCurrency.MATIC]: "MATIC",
	[SupportedCurrency.USDT]: "USDT",
	[SupportedCurrency.DAI]: "DAI",
	[SupportedCurrency.CREUSD]: "CREUSD",
};

export default function CreateListing() {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorModalOpen, setErrorModalOpen] = useState(false);
	const posthog = usePostHog();

	// SubNavbar configuration
	const navItems: SubNavbarItem[] = [
		{ id: "listing-details", label: "Details", icon: FileText },
		{ id: "deal-economics", label: "Economics", icon: DollarSign },
		{ id: "debt-terms", label: "Debt", icon: Landmark },
		{ id: "sources-uses", label: "Sources", icon: PieChart },
		{ id: "operating-history", label: "Operating", icon: Activity },
		{ id: "pro-forma-exit", label: "Exit", icon: Flag },
		{ id: "return-targets", label: "Returns", icon: TrendingUp },
		{ id: "distribution-policy", label: "Distribution", icon: Share2 },
		{ id: "tokenomics", label: "Tokenomics", icon: Coins },
		{ id: "offering-structure", label: "Offering", icon: Scroll },
		{ id: "images-highlights", label: "Media", icon: ImageIcon },
		{ id: "documents", label: "Documents", icon: FolderOpen },
	];

	const { data: onboardingStatus } = useOnboardingStatus();

	const form = useForm<CreateListingFormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			offeringType: OfferingType.RULE_506_B,
			fundingCurrency: SupportedCurrency.USDC,
			images: [{ value: "" }],
			documents: [{ value: "" }],
			highlights: [{ value: "" }],
			financials: {
				distributionFrequency: "QUARTERLY" as const,
			},
			tokenomics: {
				transferRestricted: false,
			},
			crossChainConfig: {
				enabled: false,
				subsidized: false,
			},
		},
	});

	const { control, handleSubmit, setValue } = form;
	const selectedCurrency = form.watch("fundingCurrency") || SupportedCurrency.USDC;


	// Pre-fill Offering Structure details from Sponsor info if available
	useEffect(() => {
		if (onboardingStatus?.sponsor) {
			const { kybData } = onboardingStatus.sponsor;

			if (kybData?.businessType) {
				// Normalize businessType to EntityStructure enum if possible
				const normalizedType = kybData.businessType.toUpperCase();
				if (Object.values(EntityStructure).includes(normalizedType as any)) {
					setValue("entityStructure", normalizedType as EntityStructure, {
						shouldDirty: false,
					});
				}
			}
		}
	}, [onboardingStatus, setValue]);

	// Auto-calculation logic
	const [
		loanAmount,
		purchasePrice,
		effectiveGrossIncome,
		operatingExpenses,
		annualRentGrowth,
		annualExpenseGrowth,
		holdPeriodYears,
		exitCapRate,
	] = form.watch([
		"financials.loanAmount",
		"financials.purchasePrice",
		"financials.effectiveGrossIncome",
		"financials.operatingExpenses",
		"financials.annualRentGrowth",
		"financials.annualExpenseGrowth",
		"financials.holdPeriodYears",
		"financials.exitCapRate",
	]);

	// Calculate LTV
	useEffect(() => {
		if (purchasePrice && purchasePrice > 0 && loanAmount !== undefined) {
			const ltv = loanAmount / purchasePrice;
			// Only update if difference is significant to avoid loops
			const currentLTV = form.getValues("financials.loanToValue");
			if (!currentLTV || Math.abs(currentLTV - ltv) > 0.0001) {
				setValue("financials.loanToValue", ltv, {
					shouldValidate: true,
					shouldDirty: true,
				});
			}
		}
	}, [loanAmount, purchasePrice, setValue, form]);

	// Calculate NOI
	useEffect(() => {
		if (effectiveGrossIncome !== undefined && operatingExpenses !== undefined) {
			const noi = Math.max(0, effectiveGrossIncome - operatingExpenses);
			const currentNOI = form.getValues("financials.noi");
			if (currentNOI !== noi) {
				setValue("financials.noi", noi, {
					shouldValidate: true,
					shouldDirty: true,
				});
			}
		}
	}, [effectiveGrossIncome, operatingExpenses, setValue, form]);

	// Calculate Exit Sale Price
	useEffect(() => {
		if (
			effectiveGrossIncome !== undefined &&
			operatingExpenses !== undefined &&
			annualRentGrowth !== undefined &&
			annualExpenseGrowth !== undefined &&
			holdPeriodYears &&
			exitCapRate &&
			exitCapRate > 0
		) {
			// Simple compound growth model
			const futureIncome =
				effectiveGrossIncome * Math.pow(1 + annualRentGrowth, holdPeriodYears);
			const futureExpense =
				operatingExpenses * Math.pow(1 + annualExpenseGrowth, holdPeriodYears);
			const futureNOI = Math.max(0, futureIncome - futureExpense);
			const projectedSalePrice = Math.round(futureNOI / exitCapRate);

			const currentSalePrice = form.getValues("financials.exitSalePrice");
			if (currentSalePrice !== projectedSalePrice) {
				setValue("financials.exitSalePrice", projectedSalePrice, {
					shouldValidate: true,
					shouldDirty: true,
				});
			}
		}
	}, [
		effectiveGrossIncome,
		operatingExpenses,
		annualRentGrowth,
		annualExpenseGrowth,
		holdPeriodYears,
		exitCapRate,
		setValue,
		form,
	]);

	useEffect(() => {
		if (posthog) {
			posthog.capture("listing_creation_started");
		}
	}, [posthog]);

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

	const onInvalid = (errors: any) => {
		console.log("Form errors:", errors);
		// Find the first error and scroll to it
		// We need to flatten the errors or find the first one in DOM order
		// A simple heuristic: iterate through the registered fields order or just Object.keys
		// React Hook Form errors object structure matches the form data structure.

		// Helper to find first error key in deep object
		const getFirstErrorKey = (errorObj: any, prefix = ""): string | null => {
			for (const key in errorObj) {
				if (errorObj[key]?.message) {
					return prefix + key;
				}
				if (typeof errorObj[key] === "object") {
					const result = getFirstErrorKey(
						errorObj[key],
						prefix ? `${prefix}.${key}.` : `${key}.`
					);
					if (result) return result;
				}
			}
			return null;
		};

		const firstErrorKey = getFirstErrorKey(errors);
		if (firstErrorKey) {
			// Try to find element by name
			// Note: This relies on inputs having the correct name attribute
			const element = document.querySelector(`[name="${firstErrorKey}"]`);
			if (element) {
				element.scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "nearest",
				});
				// Small delay to focus
				setTimeout(() => {
					(element as HTMLElement).focus();
				}, 500);
			} else {
				// Fallback: try to find by id if name selector fails (sometimes used for checkboxes etc)
				// Or check for field arrays
				console.warn(`Could not find element with name: ${firstErrorKey}`);
			}
		}
	};
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
				if (posthog) {
					posthog.capture("listing_created", {
						listing_name: cleanData.name,
						property_type: cleanData.propertyType,
					});
				}
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
			setErrorModalOpen(true);
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
		<DashboardLayout>
			<ErrorModal
				isOpen={errorModalOpen}
				onClose={() => setErrorModalOpen(false)}
				title="Creation Failed"
				message={serverError || "An unexpected error occurred."}
			/>
			<div className="flex gap-8 max-w-[90rem] mx-auto py-10 px-4 sm:px-6 lg:px-8">
				{/* Vertical SubNavbar Sidebar */}
				<SubNavbar items={navItems} offset={80} className="hidden lg:flex" />
				{/* Mobile SubNavbar (Horizontal) */}
				<SubNavbar
					items={navItems}
					offset={80}
					orientation="horizontal"
					className="lg:hidden px-4"
				/>

				<div className="flex-1 max-w-4xl">
					<div className="mb-10 text-center">
						<h1 className="text-3xl font-bold text-slate-900">New Listing</h1>
						<p className="mt-2 text-slate-600">
							Submit a new property for tokenization and marketplace listing.
						</p>
					</div>

					<Form {...form}>
						<form
							onSubmit={handleSubmit(onSubmit, onInvalid)}
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
								<FormField
									control={control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>Listing Name</FormLabel>
											<FormControl>
												<Input placeholder="e.g. Crypto.com Arena" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="propertyType"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>Asset Type</FormLabel>
											<FormControl>
												<select
													{...field}
													className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C59B26] bg-white h-10"
												>
													<option value="">Select Asset Type...</option>
													{Object.values(PropertyType).map((type) => (
														<option key={type} value={type}>
															{PROPERTY_TYPE_LABELS[type]}
														</option>
													))}
												</select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="space-y-2 md:col-span-2">
									<FormField
										control={control}
										name="address"
										render={({ field }) => (
											<FormItem>
												<FormLabel required>Address</FormLabel>
												<FormControl>
													<Input placeholder="Street Address" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>City</FormLabel>
											<FormControl>
												<Input placeholder="City" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={control}
										name="state"
										render={({ field }) => (
											<FormItem>
												<FormLabel required>State</FormLabel>
												<FormControl>
													<Input placeholder="NY" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name="zipCode"
										render={({ field }) => (
											<FormItem>
												<FormLabel required>Zip Code</FormLabel>
												<FormControl>
													<Input placeholder="10001" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={control}
										name="constructionYear"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Construction Year</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="YYYY"
														{...field}
														onChange={(e) =>
															field.onChange(e.target.valueAsNumber)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name="totalUnits"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Total Units</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="e.g. 24"
														{...field}
														onChange={(e) =>
															field.onChange(e.target.valueAsNumber)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="space-y-2 md:col-span-2">
									<FormField
										control={control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description</FormLabel>
												<FormControl>
													<textarea
														{...field}
														rows={4}
														className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C59B26] focus:border-transparent sm:text-sm"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<div id="deal-economics">
								<SectionTitle icon={DollarSign} title="Deal Economics" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">


								<FormField
									control={control}
									name="financials.purchasePrice"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Purchase Price ($)
												<Tooltip content="Total acquisition price of the property." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="5000000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.totalCapitalization"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Total Capitalization ($)
												<Tooltip content="Total equity + debt, including all fees and reserves." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="6000000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div id="debt-terms">
								<SectionTitle icon={DollarSign} title="Debt Terms" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={control}
									name="financials.loanAmount"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Loan Amount ($)
												<Tooltip content="Total amount of debt financing." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="3500000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.loanToValue"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Loan-to-Value (LTV %)
												<Tooltip content="Loan amount as a fraction of property value. Calculated automatically." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="70.0"
													readOnly
													className="bg-slate-100"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? (field.value * 100).toFixed(2)
															: ""
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.interestRate"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Interest Rate (%)
												<Tooltip content="Annual interest rate." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													placeholder="4.5"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.loanTermYears"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Loan Term (Years)
												<Tooltip content="Total term of the loan in years." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="10"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.amortizationYears"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-1">
												Amortization Period (Years)
												<Tooltip content="Amortization schedule in years (optional)." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="30"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.interestOnlyYears"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-1">
												Interest-Only Period (Years)
												<Tooltip content="Number of years with interest-only payments (optional)." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="3"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div id="sources-uses">
								<SectionTitle icon={DollarSign} title="Sources & Uses" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={control}
									name="financials.equityRequired"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Equity Required ($)
												<Tooltip content="Total equity capital needed from investors." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="2500000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.closingCosts"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Closing Costs ($)
												<Tooltip content="Transaction closing costs and fees." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="150000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.acquisitionFee"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Acquisition Fee ($)
												<Tooltip content="Fee paid to sponsor for acquiring the property." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="100000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.capexBudget"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												CapEx Budget ($)
												<Tooltip content="Capital expenditure budget for improvements." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="200000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.workingCapital"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Working Capital ($)
												<Tooltip content="Operating cash reserves for ongoing expenses." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="50000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.reservesInitial"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Initial Reserves ($)
												<Tooltip content="Initial reserve funds for contingencies." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="100000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div id="operating-history">
								<SectionTitle icon={DollarSign} title="Operating History" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={control}
									name="financials.effectiveGrossIncome"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Effective Gross Income ($)
												<Tooltip content="Total rental income before operating expenses." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="500000"
													{...field}
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.operatingExpenses"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Operating Expenses ($)
												<Tooltip content="Annual operating expenses (excluding debt service)." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="200000"
													{...field}
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.noi"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												NOI ($)
												<Tooltip content="Net Operating Income: Annual income after operating expenses. Calculated automatically." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="300000"
													readOnly
													className="bg-slate-100"
													{...field}
													value={field.value ?? ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.occupancyRate"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Occupancy Rate (%)
												<Tooltip content="Percentage of units/space currently occupied." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="95.0"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div id="pro-forma-exit">
								<SectionTitle
									icon={DollarSign}
									title="Pro Forma & Exit Strategy"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={control}
									name="financials.annualRentGrowth"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Annual Rent Growth (%)
												<Tooltip content="Expected annual rent growth rate." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="3.0"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.annualExpenseGrowth"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Annual Expense Growth (%)
												<Tooltip content="Expected annual expense growth rate." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="2.0"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.holdPeriodYears"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Hold Period (Years)
												<Tooltip content="Expected investment hold period before exit." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="7"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.exitCapRate"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Exit Cap Rate (%)
												<Tooltip content="Expected capitalization rate at exit." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="5.5"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.exitSalePrice"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Exit Sale Price ($)
												<Tooltip content="Projected sale price at exit. Calculated automatically." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="6500000"
													readOnly
													className="bg-slate-100"
													{...field}
													value={field.value ?? ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div id="return-targets">
								<SectionTitle icon={DollarSign} title="Return Targets" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={control}
									name="financials.targetCoCYear1"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Target CoC Year 1 (%)
												<Tooltip content="Target cash-on-cash return for year 1." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="8.0"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.targetAvgCoC"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Target Average CoC (%)
												<Tooltip content="Target average cash-on-cash return over hold period." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="9.0"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.targetIRR"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Target IRR (%)
												<Tooltip content="Target internal rate of return." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="15.0"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.targetEquityMultiple"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Target Equity Multiple
												<Tooltip content="Target equity multiple at exit (e.g., 2.0 for 2x return)." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="2.0"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div id="distribution-policy">
								<SectionTitle icon={DollarSign} title="Distribution Policy" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={control}
									name="financials.preferredReturn"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Preferred Return (%)
												<Tooltip content="Annual preferred return to investors." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="8.0"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.sponsorPromote"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Sponsor Promote (%)
												<Tooltip content="Sponsor's share of profits after preferred return." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="20.0"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.payoutRatioOfFCF"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Payout Ratio of FCF (%)
												<Tooltip content="Percentage of Free Cash Flow to be distributed." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="1"
													placeholder="100"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.distributionFrequency"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Distribution Frequency
												<Tooltip content="How often distributions are paid out." />
											</FormLabel>
											<FormControl>
												<select
													{...field}
													className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C59B26] bg-white h-10"
												>
													<option value="MONTHLY">Monthly</option>
													<option value="QUARTERLY">Quarterly</option>
													<option value="SEMI_ANNUALLY">Semi-Annually</option>
													<option value="ANNUALLY">Annually</option>
												</select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div id="tokenomics">
								<SectionTitle icon={DollarSign} title="Tokenomics" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={control}
									name="fundingCurrency"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>Funding Currency</FormLabel>
											<FormControl>
												<select
													{...field}
													className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C59B26] bg-white h-10"
												>
													{Object.values(SupportedCurrency).map((currency) => (
														<option key={currency} value={currency}>
															{currency} ({CurrencySymbol[currency as SupportedCurrency]})
														</option>
													))}
												</select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="financials.effectiveGrossIncome"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Effective Gross Income ($)
												<Tooltip content="Total rental income before operating expenses." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="500000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.operatingExpenses"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Operating Expenses ($)
												<Tooltip content="Annual operating expenses (excluding debt service)." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="200000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.noi"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												NOI ($)
												<Tooltip content="Net Operating Income: Annual income after operating expenses. Calculated automatically." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="300000"
													readOnly
													className="bg-slate-100"
													{...field}
													value={field.value ?? ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="financials.occupancyRate"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Occupancy Rate (%)
												<Tooltip content="Percentage of units/space currently occupied." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="95.0"
													{...field}
													value={
														field.value !== undefined && field.value !== null
															? field.value * 100
															: ""
													}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														field.onChange(isNaN(val) ? undefined : val / 100);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="tokenomics.totalTokenSupply"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Total Token Supply
												<Tooltip content="Total number of tokens to be minted for this property." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="100000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="tokenomics.tokensForInvestors"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Tokens for Investors
												<Tooltip content="Number of tokens available for investor purchase." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="80000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="tokenomics.tokensForSponsor"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Tokens for Sponsor
												<Tooltip content="Number of tokens reserved for the sponsor/GP." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="15000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="tokenomics.tokensForTreasury"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Tokens for Treasury
												<Tooltip content="Number of tokens reserved for platform/treasury." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="5000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="tokenomics.tokenPrice"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Token Price ({CurrencySymbol[selectedCurrency]})
												<Tooltip content="Price per individual token in USD." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													placeholder="50.00"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="tokenomics.minInvestmentTokens"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Min Investment (Tokens)
												<Tooltip content="Minimum number of tokens an investor must purchase." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="10"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="tokenomics.maxInvestmentTokens"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-1">
												Max Investment (Tokens)
												<Tooltip content="Maximum number of tokens an investor can purchase (optional)." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="5000"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="tokenomics.lockupMonths"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-1">
												Lockup Period (Months)
												<Tooltip content="Number of months tokens are locked before transfer (optional)." />
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="12"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="space-y-2 md:col-span-2">
									<FormField
										control={control}
										name="tokenomics.transferRestricted"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
												<FormControl>
													<input
														type="checkbox"
														checked={field.value}
														onChange={field.onChange}
														className="rounded border-slate-300 text-[#C59B26] focus:ring-[#C59B26]"
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Transfer Restricted</FormLabel>
													<FormDescription>
														Check if token transfers are restricted (e.g., for
														Reg D compliance).
													</FormDescription>
												</div>
											</FormItem>
										)}
									/>
								</div>

								<div className="space-y-4 md:col-span-2 pt-4">
									<h4 className="text-sm font-medium text-slate-900 border-b pb-2 mb-4">
										Cross-Chain Integration (LayerZero)
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={control}
											name="crossChainConfig.enabled"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">
															Enable Cross-Chain Support
														</FormLabel>
														<FormDescription>
															Allow tokens to be bridged to other supported
															networks via LayerZero.
														</FormDescription>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="crossChainConfig.subsidized"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">
															Subsidize Bridging
														</FormLabel>
														<FormDescription>
															Sponsor pays gas fees for cross-chain token
															transfers.
														</FormDescription>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
															disabled={!form.watch("crossChainConfig.enabled")}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
									{form.watch("crossChainConfig.enabled") && (
										<div className="mt-4">
											<FormField
												control={control}
												name="crossChainConfig.targetNetworks"
												render={({ field }) => (
													<FormItem>
														<FormLabel required>Target Networks</FormLabel>
														<FormDescription>
															Select the blockchain networks where this token
															should be available.
														</FormDescription>
														<FormControl>
															<MultiSelect
																selected={field.value || []}
																options={Object.values(SupportedNetwork).map(
																	(network) => ({
																		label: network,
																		value: network,
																	})
																)}
																onChange={field.onChange}
																placeholder="Select networks..."
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									)}
								</div>
							</div>

							<div id="offering-structure">
								<SectionTitle icon={Building2} title="Offering Structure" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={control}
									name="offeringType"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Offering Type
												<Tooltip content="Regulatory exemption structure (e.g., Rule 506(b) vs 506(c))." />
											</FormLabel>
											<FormControl>
												<select
													{...field}
													className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C59B26] bg-white h-10"
												>
													{Object.values(OfferingType).map((type) => (
														<option key={type} value={type}>
															{type}
														</option>
													))}
												</select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="entityStructure"
									render={({ field }) => (
										<FormItem>
											<FormLabel required className="flex items-center gap-1">
												Entity Structure
												<Tooltip content="Legal structure of the property ownership entity (e.g., LLC, LP)." />
											</FormLabel>
											<FormControl>
												<select
													{...field}
													className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C59B26] bg-white h-10"
												>
													<option value="">Select Structure...</option>
													{Object.values(EntityStructure).map((type) => (
														<option key={type} value={type}>
															{type}
														</option>
													))}
												</select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div id="images-highlights">
								<SectionTitle icon={ImageIcon} title="Images & Highlights" />
							</div>

							<div className="space-y-6">
								<div className="space-y-3">
									<FormLabel>Listing Images</FormLabel>
									{imageFields.map((field: any, index: number) => (
										<div key={field.id} className="flex gap-2 items-start">
											<FormField
												control={control}
												name={`images.${index}.value`}
												render={({ field }) => (
													<FormItem className="flex-1">
														<FormControl>
															<FileUpload
																value={field.value}
																onChange={field.onChange}
																placeholder="Upload image or enter URL"
																accept="image/*"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<button
												type="button"
												onClick={() => removeImage(index)}
												className="p-2 text-slate-400 hover:text-red-500 transition-colors mt-0.5"
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
										Add Image
									</Button>
								</div>

								<div className="space-y-3">
									<FormLabel>Investment Highlights</FormLabel>
									{highlightFields.map((field: any, index: number) => (
										<div key={field.id} className="flex gap-2 items-start">
											<FormField
												control={control}
												name={`highlights.${index}.value`}
												render={({ field }) => (
													<FormItem className="flex-1">
														<FormControl>
															<Input
																placeholder="e.g. 'Located in high-growth Opportunity Zone'"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<button
												type="button"
												onClick={() => removeHighlight(index)}
												className="p-2 text-slate-400 hover:text-red-500 transition-colors mt-0.5"
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
								<FormLabel>Offering Documents</FormLabel>
								<p className="text-xs text-slate-500 mb-2">
									Upload or provide links to the Offering Memorandum,
									Subscription Agreement, and external compliance documents.
								</p>
								{documentFields.map((field: any, index: number) => (
									<div key={field.id} className="flex gap-2 items-start">
										<FormField
											control={control}
											name={`documents.${index}.value`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormControl>
														<FileUpload
															value={field.value}
															onChange={field.onChange}
															placeholder="Upload PDF or enter URL"
															accept="application/pdf"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<button
											type="button"
											onClick={() => removeDocument(index)}
											className="p-2 text-slate-400 hover:text-red-500 transition-colors mt-0.5"
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
									Add Document
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
					</Form>
				</div>
			</div>
		</DashboardLayout >
	);
}

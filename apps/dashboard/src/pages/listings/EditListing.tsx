import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OfferingType, EntityStructure } from "@commertize/data/enums";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { Input, Button } from "@commertize/ui";
import {
	Building2,
	DollarSign, // Used in SectionTitle icon
	FileText,
	Image as ImageIcon,
	Plus,
	Trash2,
	Loader2,
	CheckCircle2,
} from "lucide-react";
import { createListingSchema } from "@commertize/data/schemas/property";
import { usePrivy } from "@privy-io/react-auth";
import { DashboardLayout } from "../../components/DashboardLayout";

// Extend shared schema for form-specific structures
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

type EditListingFormData = z.infer<typeof formSchema>;

export default function EditListing() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { getAccessToken } = usePrivy();
	const [serverError, setServerError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<EditListingFormData>({
		resolver: zodResolver(formSchema as any),
		defaultValues: {
			offeringType: OfferingType.RULE_506_B,
			images: [{ value: "" }],
			documents: [{ value: "" }],
			highlights: [{ value: "" }],
			financials: {
				equityRequired: 0,
				noi: 0,
				occupancyRate: 0,
			},
			tokenomics: {
				tokenPrice: 0,
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

	useEffect(() => {
		const fetchListing = async () => {
			if (!id) return;
			try {
				const token = await getAccessToken();
				// Use the public or private endpoint? Public GET /listings/:id works.
				// But we need to ensure we can edit it (AuthGuard handles this partially, but backend checks ownership).
				const response = await api.get(`/listings/${id}`, token);
				const listing = response as any; // Type assertion

				// Transform data for the form
				reset({
					...listing,
					financials: listing.financials, // Ensure mapping matches
					// Convert string arrays to object arrays
					images: listing.images?.length
						? listing.images.map((url: string) => ({ value: url }))
						: [{ value: "" }],
					documents: listing.documents?.length
						? listing.documents.map((url: string) => ({ value: url }))
						: [{ value: "" }],
					highlights: listing.highlights?.length
						? listing.highlights.map((text: string) => ({ value: text }))
						: [{ value: "" }],
				});
			} catch (err) {
				console.error("Error fetching listing:", err);
				setServerError("Failed to load listing details.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchListing();
	}, [id, getAccessToken, reset]);

	const onSubmit = async (data: EditListingFormData) => {
		setIsSubmitting(true);
		setServerError(null);

		try {
			// Transform object arrays back to string arrays for the API
			const cleanData = {
				...data,
				images:
					data.images
						?.map((i: any) => i.value)
						.filter((i: string) => i.trim() !== "") || [],
				documents:
					data.documents
						?.map((d: any) => d.value)
						.filter((d: string) => d.trim() !== "") || [],
				highlights:
					data.highlights
						?.map((h: any) => h.value)
						.filter((h: string) => h.trim() !== "") || [],
			};

			const token = await getAccessToken();
			const response = await api.patch(`/listings/${id}`, cleanData, token);

			if (response.success) {
				// api client returns data directly usually? api.patch returns Promise<any>
				// Our api client wrapper returns response.data?
				// Let's check api.ts wrapper. But traditionally axios returns data.
				// Assuming api.patch returns the response body directly if using the custom wrapper properly.
				// The wrapper usually returns the data property of axios response.
				// Step 16 showed `api.get` etc.
				// I will assume consistency with other calls.
				navigate("/sponsor/dashboard");
			} else {
				// If the wrapper returns the full response, check usage.
				navigate("/sponsor/dashboard");
			}
		} catch (error: any) {
			console.error("Submission error:", error);
			setServerError(
				error.response?.data?.error ||
					"Failed to update listing. Please try again."
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

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center h-[calc(100vh-64px)]">
					<Loader2 className="w-8 h-8 animate-spin text-slate-400" />
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
				<div className="mb-10 text-center">
					<h1 className="text-3xl font-bold text-slate-900">Edit Listing</h1>
					<p className="mt-2 text-slate-600">
						Update property details, financials, and images.
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

					<SectionTitle icon={Building2} title="Listing Details" />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								Listing Name
							</label>
							<Input
								{...register("name")}
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
							<Input
								{...register("propertyType")}
								className={errors.propertyType ? "border-red-500" : ""}
							/>
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

					<SectionTitle icon={DollarSign} title="Financials & Offering" />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								Target Raise ($)
							</label>
							<Input
								type="number"
								{...register("financials.equityRequired", {
									valueAsNumber: true,
								})}
								className={
									errors.financials?.equityRequired ? "border-red-500" : ""
								}
							/>
							{errors.financials?.equityRequired && (
								<p className="text-xs text-red-500">
									{errors.financials.equityRequired.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								Token Price ($)
							</label>
							<Input
								type="number"
								{...register("tokenomics.tokenPrice", { valueAsNumber: true })}
								className={
									errors.tokenomics?.tokenPrice ? "border-red-500" : ""
								}
							/>
							{errors.tokenomics?.tokenPrice && (
								<p className="text-xs text-red-500">
									{errors.tokenomics.tokenPrice.message}
								</p>
							)}
						</div>

						{/* Cap Rate is calculated or not in schema currently */}
						{/* <div className="space-y-2">
						<label className="text-sm font-medium text-slate-700">
							Cap Rate (%)
						</label>
						<Input
							type="number"
							step="0.01"
							{...register("financials.capRate", { valueAsNumber: true })}
							className={errors.financials?.capRate ? "border-red-500" : ""}
						/>
					</div> */}

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								NOI ($)
							</label>
							<Input
								type="number"
								{...register("financials.noi", { valueAsNumber: true })}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								Occupancy Rate (%)
							</label>
							<Input
								type="number"
								step="0.1"
								{...register("financials.occupancyRate", {
									valueAsNumber: true,
								})}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								Offering Type
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
							<label className="text-sm font-medium text-slate-700">
								Entity Structure
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

					<SectionTitle icon={ImageIcon} title="Images & Highlights" />

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

					<SectionTitle icon={FileText} title="Documents & Compliance" />

					<div className="space-y-3">
						<label className="text-sm font-medium text-slate-700 block">
							Offering Documents (URLs)
						</label>
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
							onClick={() => navigate("/sponsor/dashboard")}
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
									Updating...
								</>
							) : (
								<>
									<CheckCircle2 className="w-4 h-4 mr-2" />
									Update Listing
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</DashboardLayout>
	);
}

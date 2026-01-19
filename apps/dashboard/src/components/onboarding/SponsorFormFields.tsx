import React, { useState } from "react";
import { Input } from "@commertize/ui";
import {
	Plus,
	X,
	Upload,
	Loader2,
	ChevronDown,
	ChevronRight,
} from "lucide-react";

interface SponsorFormFieldsProps {
	formData: {
		businessName: string;
		businessType: string;
		ein: string;
		address: string;
		documents: string[];
		bio?: string;
		walletAddress?: string;
	};
	fieldErrors: Record<string, string>;
	newDocUrl: string;
	onChange: (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => void;
	onAddDocument: () => void;
	onRemoveDocument: (index: number) => void;
	setNewDocUrl: (url: string) => void;
	readonly?: boolean;
	onUploadFile?: (file: File) => Promise<string>;
}

export const SponsorFormFields: React.FC<SponsorFormFieldsProps> = ({
	formData,
	fieldErrors,
	newDocUrl,
	onChange,
	onAddDocument,
	onRemoveDocument,
	setNewDocUrl,
	readonly = false,
	onUploadFile,
}) => {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [showAdvanced, setShowAdvanced] = useState(false);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !onUploadFile) return;

		setIsUploading(true);
		setUploadError(null);

		try {
			const url = await onUploadFile(file);
			// Add the uploaded file URL to documents
			setNewDocUrl(url);
			onAddDocument();
			// Reset file input
			e.target.value = "";
		} catch (error) {
			setUploadError(
				error instanceof Error ? error.message : "Failed to upload file"
			);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<label className="block text-sm font-medium text-slate-700">
					Business Legal Name <span className="text-red-500">*</span>
				</label>
				<Input
					name="businessName"
					value={formData.businessName}
					onChange={onChange}
					placeholder="Acme Capital LLC"
					required
					disabled={readonly}
				/>
				{fieldErrors.businessName && (
					<p className="text-sm text-red-500 mt-1">
						{fieldErrors.businessName}
					</p>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-700">
						Business Type <span className="text-red-500">*</span>
					</label>
					<select
						name="businessType"
						value={formData.businessType}
						onChange={onChange}
						disabled={readonly}
						className="w-full px-4 py-2 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
					>
						<option value="LLC">LLC</option>
						<option value="C_CORP">C-Corp</option>
						<option value="S_CORP">S-Corp</option>
						<option value="PARTNERSHIP">Partnership</option>
						<option value="SOLE_PROP">Sole Proprietorship</option>
					</select>
				</div>

				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-700">
						EIN / Tax ID <span className="text-red-500">*</span>
					</label>
					<Input
						name="ein"
						value={formData.ein}
						onChange={onChange}
						placeholder="12-3456789"
						required
						disabled={readonly}
					/>
					{fieldErrors.ein && (
						<p className="text-sm text-red-500 mt-1">{fieldErrors.ein}</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<label className="block text-sm font-medium text-slate-700">
					Registered Address <span className="text-red-500">*</span>
				</label>
				<Input
					name="address"
					value={formData.address}
					onChange={onChange}
					placeholder="123 Wall St, New York, NY"
					required
					disabled={readonly}
				/>
				{fieldErrors.address && (
					<p className="text-sm text-red-500 mt-1">{fieldErrors.address}</p>
				)}
			</div>

			<div className="space-y-2">
				<label className="block text-sm font-medium text-slate-700">Bio</label>
				<textarea
					name="bio"
					value={formData.bio || ""}
					onChange={onChange}
					placeholder="Tell us about your firm..."
					rows={4}
					disabled={readonly}
					className="w-full px-4 py-2 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
				/>
			</div>

			<div className="space-y-4 pt-2">
				<h4 className="font-medium text-slate-900 border-b border-slate-200 pb-2">
					Business Documents
				</h4>

				{formData.documents.map((doc, idx) => (
					<div
						key={idx}
						className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
					>
						<a
							href={doc}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-[80%]"
						>
							{doc}
						</a>
						{!readonly && (
							<button
								type="button"
								onClick={() => onRemoveDocument(idx)}
								className="text-slate-400 hover:text-red-500 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						)}
					</div>
				))}

				{!readonly && (
					<>
						<div className="flex gap-2">
							<div className="flex-grow">
								<Input
									name="newDocUrl"
									value={newDocUrl}
									onChange={(e) => setNewDocUrl(e.target.value)}
									placeholder="https://..."
									className="mb-0"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											if (newDocUrl) {
												onAddDocument();
											}
										}
									}}
								/>
							</div>
							<button
								type="button"
								onClick={onAddDocument}
								disabled={!newDocUrl}
								className="bg-slate-100 text-slate-600 px-4 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-0 h-[42px] self-end"
							>
								<Plus className="w-5 h-5" />
							</button>
						</div>

						{/* File Upload Option */}
						{onUploadFile && (
							<div className="relative">
								<div className="text-center text-sm text-slate-500 my-3">
									or upload a PDF file
								</div>
								<label className="flex items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg py-4 px-4 cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-colors">
									<Upload className="w-5 h-5 text-slate-500" />
									<span className="text-sm font-medium text-slate-600">
										{isUploading ? "Uploading..." : "Choose PDF File"}
									</span>
									{isUploading && (
										<Loader2 className="w-4 h-4 animate-spin text-blue-600" />
									)}
									<input
										type="file"
										accept="application/pdf"
										onChange={handleFileUpload}
										disabled={isUploading}
										className="hidden"
									/>
								</label>
								{uploadError && (
									<p className="text-sm text-red-500 mt-2">{uploadError}</p>
								)}
							</div>
						)}
					</>
				)}
			</div>
			<div className="pt-4 border-t border-slate-200">
				<button
					type="button"
					onClick={() => setShowAdvanced(!showAdvanced)}
					className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
				>
					{showAdvanced ? (
						<ChevronDown className="w-4 h-4 mr-1" />
					) : (
						<ChevronRight className="w-4 h-4 mr-1" />
					)}
					Advanced Options
				</button>

				{showAdvanced && (
					<div className="mt-4 space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Wallet Address
						</label>
						<Input
							name="walletAddress"
							value={formData.walletAddress || ""}
							onChange={onChange}
							placeholder="0x..."
							disabled={readonly}
						/>
						<p className="text-xs text-slate-500">
							The wallet address that will receive funds raised. Defaults to
							your connected wallet.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

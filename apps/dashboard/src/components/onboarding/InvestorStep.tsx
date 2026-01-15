import React, { useState } from "react";
import { TrendingUp, Loader2, Plus, X, Upload } from "lucide-react";
import { StepView, Input } from "@commertize/ui";
import {
	InvestmentExperience,
	RiskTolerance,
	AccreditationType,
	InvestorType,
	AccreditationVerificationMethod,
} from "@commertize/data/enums";

interface InvestorStepProps {
	investorProfile: {
		type: InvestorType;
		investmentExperience: InvestmentExperience;
		riskTolerance: RiskTolerance;
		liquidNetWorth: string;
		taxCountry: string;
		accreditationType: AccreditationType;
		verificationMethod?: AccreditationVerificationMethod;
		documents: string[];
	};
	fieldErrors: Record<string, string>;
	newDocUrl: string;
	loading: boolean;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
	onSubmit: (e: React.FormEvent) => Promise<void>;
	onClear: () => void;
	onAddDocument: () => void;
	onRemoveDocument: (index: number) => void;
	setNewDocUrl: (url: string) => void;
	submissionIntent: "finish" | "continue";
	setSubmissionIntent: (intent: "finish" | "continue") => void;
	onSkipToSponsor?: () => void;
	onSkip: () => void;
	onUploadFile?: (file: File) => Promise<string>; // Returns URL of uploaded file
}

export const InvestorStep: React.FC<InvestorStepProps> = ({
	investorProfile,
	fieldErrors,
	newDocUrl,
	loading,
	onChange,
	onSubmit,
	onClear,
	onAddDocument,
	onRemoveDocument,
	setNewDocUrl,
	submissionIntent,
	setSubmissionIntent,
	onSkipToSponsor,
	onSkip,
	onUploadFile,
}) => {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

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
		<StepView
			title="Investor Profile"
			description="Help us customize your investment opportunities."
			icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
		>
			<form onSubmit={onSubmit} className="space-y-6">
				<div className="flex justify-between items-center">
					{onSkipToSponsor && (
						<button
							type="button"
							onClick={onSkipToSponsor}
							className="text-sm text-blue-600 hover:text-blue-800"
						>
							Skip verification for now
						</button>
					)}
					<button
						type="button"
						onClick={onClear}
						className="text-sm text-slate-500 hover:text-slate-700 underline"
					>
						Clear Form
					</button>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Investor Type <span className="text-red-500">*</span>
						</label>
						<select
							name="type"
							value={investorProfile.type}
							onChange={onChange}
							className="w-full px-4 py-2 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
						>
							<option value={InvestorType.INDIVIDUAL}>Individual</option>
							<option value={InvestorType.INSTITUTIONAL}>
								Institutional/Entity
							</option>
						</select>
						{fieldErrors.type && (
							<p className="text-sm text-red-500 mt-1">{fieldErrors.type}</p>
						)}
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Investment Experience <span className="text-red-500">*</span>
						</label>
						<select
							name="investmentExperience"
							value={investorProfile.investmentExperience}
							onChange={onChange}
							className="w-full px-4 py-2 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
						>
							<option value={InvestmentExperience.NONE}>None</option>
							<option value={InvestmentExperience.LIMITED}>
								Limited (1-3 years)
							</option>
							<option value={InvestmentExperience.GOOD}>
								Good (3-5 years)
							</option>
							<option value={InvestmentExperience.EXTENSIVE}>
								Extensive (5+ years)
							</option>
						</select>
						{fieldErrors.investmentExperience && (
							<p className="text-sm text-red-500 mt-1">
								{fieldErrors.investmentExperience}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Risk Tolerance <span className="text-red-500">*</span>
						</label>
						<select
							name="riskTolerance"
							value={investorProfile.riskTolerance}
							onChange={onChange}
							className="w-full px-4 py-2 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
						>
							<option value={RiskTolerance.LOW}>Low</option>
							<option value={RiskTolerance.MEDIUM}>Medium</option>
							<option value={RiskTolerance.HIGH}>High</option>
						</select>
						{fieldErrors.riskTolerance && (
							<p className="text-sm text-red-500 mt-1">
								{fieldErrors.riskTolerance}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Liquid Net Worth (USD) <span className="text-red-500">*</span>
						</label>
						<Input
							name="liquidNetWorth"
							value={investorProfile.liquidNetWorth}
							onChange={onChange}
							placeholder="e.g. 100000"
							type="number"
							min="0"
							required
						/>
						{fieldErrors.liquidNetWorth && (
							<p className="text-sm text-red-500 mt-1">
								{fieldErrors.liquidNetWorth}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Tax Country <span className="text-red-500">*</span>
						</label>
						<Input
							name="taxCountry"
							value={investorProfile.taxCountry}
							onChange={onChange}
							placeholder="US"
							required
						/>
						{fieldErrors.taxCountry && (
							<p className="text-sm text-red-500 mt-1">
								{fieldErrors.taxCountry}
							</p>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-700">
						Accreditation Status <span className="text-red-500">*</span>
					</label>
					<select
						name="accreditationType"
						value={investorProfile.accreditationType}
						onChange={onChange}
						className="w-full px-4 py-2 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
					>
						{/* <option value={AccreditationType.NONE}>Not Accredited</option> */}
						<option value={AccreditationType.REG_D}>
							Reg D (Net worth $1M+ or Income $200k+)
						</option>
						<option value={AccreditationType.REG_S}>
							Reg S (Non-US Person)
						</option>
						{/* <option value={AccreditationType.QUALIFIED_PURCHASER}>
							Qualified Purchaser ($5M+ Investments)
						</option> */}
					</select>
					{fieldErrors.accreditationType && (
						<p className="text-sm text-red-500 mt-1">
							{fieldErrors.accreditationType}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-700">
						Verification Method (Optional)
					</label>
					<select
						name="verificationMethod"
						value={investorProfile.verificationMethod || ""}
						onChange={onChange}
						className="w-full px-4 py-2 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
					>
						<option value="">Select method...</option>
						<option value={AccreditationVerificationMethod.SELF_CERTIFICATION}>
							Self-Certification
						</option>
						<option value={AccreditationVerificationMethod.THIRD_PARTY_LETTER}>
							Third-Party Letter (CPA, Attorney, etc.)
						</option>
						<option value={AccreditationVerificationMethod.INCOME_PROOF}>
							Income Proof (Tax Returns, W-2s)
						</option>
						<option value={AccreditationVerificationMethod.NET_WORTH_PROOF}>
							Net Worth Proof (Bank Statements, Appraisals)
						</option>
					</select>
					{fieldErrors.verificationMethod && (
						<p className="text-sm text-red-500 mt-1">
							{fieldErrors.verificationMethod}
						</p>
					)}
				</div>

				<div className="space-y-4 pt-2">
					<h4 className="font-medium text-slate-900 border-b border-slate-200 pb-2">
						Accreditation Documents (Optional)
					</h4>

					{investorProfile.documents.map((doc, idx) => (
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
							<button
								type="button"
								onClick={() => onRemoveDocument(idx)}
								className="text-slate-400 hover:text-red-500 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					))}

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
							className="bg-slate-100 text-slate-600 px-4 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-0 h-[42px] self-end" // self-end to align with input
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
				</div>

				<div className="pt-4 flex flex-col space-y-3">
					<button
						type="submit"
						onClick={() => setSubmissionIntent("continue")}
						disabled={loading}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading && submissionIntent === "continue" ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							"Save & Continue to Sponsor Profile"
						)}
					</button>
					<button
						type="button"
						onClick={onSkip}
						disabled={loading}
						className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Skip & Finish
					</button>
				</div>
			</form>
		</StepView>
	);
};

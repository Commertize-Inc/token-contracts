import React from "react";
import { Building2, Loader2 } from "lucide-react";
import { StepView } from "@commertize/ui";
import { SponsorFormFields } from "./SponsorFormFields";

interface SponsorStepProps {
	sponsorFormData: {
		businessName: string;
		businessType: string;
		ein: string;
		address: string;
		documents: string[];
	};
	fieldErrors: Record<string, string>;
	newDocUrl: string; // Reusing state from Coordinator or local? Coordinator passed down
	loading: boolean;
	onChange: (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => void;
	onSubmit: (e: React.FormEvent) => Promise<void>;
	onClear: () => void;
	onSkip: () => void;
	onAddDocument: () => void;
	onRemoveDocument: (index: number) => void;
	setNewDocUrl: (url: string) => void;
	onUploadFile?: (file: File) => Promise<string>;
}

export const SponsorStep: React.FC<SponsorStepProps> = ({
	sponsorFormData,
	fieldErrors,
	newDocUrl,
	loading,
	onChange,
	onSubmit,
	onClear,
	onSkip,
	onAddDocument,
	onRemoveDocument,
	setNewDocUrl,
	onUploadFile,
}) => {
	return (
		<StepView
			title="Sponsor Verification"
			description="If you plan to raise capital, tell us about your business."
			icon={<Building2 className="w-8 h-8 text-blue-600" />}
		>
			<form onSubmit={onSubmit} className="space-y-6">
				<div className="flex justify-between items-center">
					<button
						type="button"
						onClick={onSkip}
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						I&apos;m just an investor, skip this step
					</button>
					<button
						type="button"
						onClick={onClear}
						className="text-sm text-slate-500 hover:text-slate-700 underline"
					>
						Clear Form
					</button>
				</div>

				<SponsorFormFields
					formData={sponsorFormData}
					fieldErrors={fieldErrors}
					newDocUrl={newDocUrl}
					onChange={onChange}
					onAddDocument={onAddDocument}
					onRemoveDocument={onRemoveDocument}
					setNewDocUrl={setNewDocUrl}
					onUploadFile={onUploadFile}
				/>

				<div className="pt-4">
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							"Submit Sponsor Application"
						)}
					</button>
				</div>
			</form>
		</StepView>
	);
};

import React from "react";
import { ShieldCheck, User as UserIcon } from "lucide-react";
import { StepView } from "@commertize/ui";
import { PlaidLinkOnExit, PlaidLinkOnSuccess } from "react-plaid-link";
import { PlaidLauncher } from "../PlaidLauncher";

interface IdentityStepProps {
	linkToken: string | null;
	onSuccess: PlaidLinkOnSuccess;
	onExit: PlaidLinkOnExit;
	onStartPlaid: () => void;
	loading: boolean;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({
	linkToken,
	onSuccess,
	onExit,
	onStartPlaid,
	loading,
}) => {
	return (
		<>
			<PlaidLauncher token={linkToken} onSuccess={onSuccess} onExit={onExit} />
			<StepView
				title="Identity Verification"
				description="We need to verify your identity to comply with regulations."
				icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
			>
				<div className="space-y-6">
					<div className="p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
						<div className="p-2 bg-blue-100 rounded-full">
							<UserIcon className="w-5 h-5 text-blue-600" />
						</div>
						<div>
							<h3 className="font-medium text-blue-900">
								Government ID Required
							</h3>
							<p className="text-sm text-blue-700 mt-1">
								You&apos;ll need to upload a photo of your driver&apos;s license
								or passport.
							</p>
						</div>
					</div>

					<button
						onClick={onStartPlaid}
						disabled={loading}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Initializing..." : "Start Verification"}
					</button>

					{/* Skip for dev - removed or handled by prop if needed */}
				</div>
			</StepView>
		</>
	);
};

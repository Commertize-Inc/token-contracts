import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Chip, Button } from "@commertize/ui";
import { KycStatus, VerificationStatus } from "@commertize/data/enums";
import { useNavigate } from "react-router-dom";

interface VerificationStatusCardProps {
	profile: {
		id: string; // User ID
		kycStatus: KycStatus;
		kycCompletedAt?: string;
		investorStatus?: VerificationStatus;
		sponsorStatus?: VerificationStatus;
		sponsor?: {
			id: string;
			businessName: string;
			status: VerificationStatus;
		};
	};
}

export const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({
	profile,
}) => {
	const navigate = useNavigate();

	// Re-derive statuses if needed, or rely on top-level profile properties
	// In Profile.tsx, profile.sponsorStatus seems to be derived or passed directly.
	// The profile object passed here should match ProfileData structure.

	return (
		<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
			<div className="flex items-center space-x-4 mb-6">
				<div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
					<CheckCircle className="w-6 h-6 text-[#D4A024]" />
				</div>
				<div>
					<h2 className="text-lg font-normal text-slate-900 mb-0.5">
						Verification Status
					</h2>
					<p className="text-sm text-slate-500 font-light">KYC & Compliance</p>
				</div>
			</div>

			<div className="space-y-4">
				{/* Identity (KYC) */}
				<div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
					<div>
						<p className="text-sm font-medium text-slate-900">Identity (KYC)</p>
						{profile.kycCompletedAt && (
							<p className="text-xs text-slate-400 mt-0.5">
								{new Date(profile.kycCompletedAt).toLocaleDateString()}
							</p>
						)}
					</div>
					{profile.kycStatus === KycStatus.APPROVED && (
						<Chip
							active={true}
							className="!bg-green-100 !text-green-700 !border-green-200 uppercase text-[10px] font-bold tracking-wider px-3"
						>
							<span className="flex items-center">
								<CheckCircle className="w-3 h-3 mr-1.5" /> VERIFIED
							</span>
						</Chip>
					)}
					{profile.kycStatus === KycStatus.PENDING && (
						<Chip
							active={true}
							className="!bg-amber-50 !text-amber-700 !border-amber-200 uppercase text-[10px] font-bold tracking-wider px-3"
						>
							<span className="flex items-center">
								<Clock className="w-3 h-3 mr-1.5" /> PENDING
							</span>
						</Chip>
					)}
					{(profile.kycStatus === KycStatus.NOT_STARTED ||
						profile.kycStatus === KycStatus.REJECTED) && (
							<Button
								variant="outlined"
								className="!py-1.5 !px-3 !text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
								onClick={() => navigate("/onboarding")}
							>
								<XCircle className="w-3 h-3 mr-1.5" />
								Verify
							</Button>
						)}
				</div>

				{/* Investor */}
				<div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
					<div>
						<p className="text-sm font-medium text-slate-900">Investor</p>
					</div>
					{profile.investorStatus === VerificationStatus.VERIFIED ? (
						<Chip
							active={true}
							className="!bg-green-100 !text-green-700 !border-green-200 uppercase text-[10px] font-bold tracking-wider px-3"
						>
							<span className="flex items-center">
								<CheckCircle className="w-3 h-3 mr-1.5" /> VERIFIED
							</span>
						</Chip>
					) : profile.investorStatus === VerificationStatus.PENDING ? (
						<Chip
							active={true}
							className="!bg-amber-50 !text-amber-700 !border-amber-200 uppercase text-[10px] font-bold tracking-wider px-3"
						>
							<span className="flex items-center">
								<Clock className="w-3 h-3 mr-1.5" /> PENDING
							</span>
						</Chip>
					) : profile.investorStatus === VerificationStatus.REJECTED ? (
						<div className="flex flex-col items-end gap-2">
							<Chip
								active={true}
								className="!bg-red-50 !text-red-700 !border-red-200 uppercase text-[10px] font-bold tracking-wider px-3"
							>
								<span className="flex items-center">
									<XCircle className="w-3 h-3 mr-1.5" /> REJECTED
								</span>
							</Chip>
							<div className="flex items-center gap-3">
								<button
									onClick={() => navigate("/submissions")}
									className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-2 transition-colors uppercase font-medium"
								>
									View Submissions
								</button>
							</div>
						</div>
					) : (
						<Button
							variant="outlined"
							className="!py-1.5 !px-3 !text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
							onClick={() => navigate("/onboarding?step=investor_profile")}
						>
							<XCircle className="w-3 h-3 mr-1.5" />
							Verify
						</Button>
					)}
				</div>

				{/* Sponsor */}
				<div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[80px]">
					<div className="self-start mt-2">
						<p className="text-sm font-medium text-slate-900">Sponsor</p>
					</div>
					{profile.sponsorStatus === VerificationStatus.VERIFIED ? (
						<Chip
							active={true}
							className="!bg-green-100 !text-green-700 !border-green-200 uppercase text-[10px] font-bold tracking-wider px-3"
						>
							<span className="flex items-center">
								<CheckCircle className="w-3 h-3 mr-1.5" /> VERIFIED
							</span>
						</Chip>
					) : profile.sponsorStatus === VerificationStatus.PENDING ? (
						<Chip
							active={true}
							className="!bg-amber-50 !text-amber-700 !border-amber-200 uppercase text-[10px] font-bold tracking-wider px-3"
						>
							<span className="flex items-center">
								<Clock className="w-3 h-3 mr-1.5" /> PENDING
							</span>
						</Chip>
					) : profile.sponsorStatus === VerificationStatus.REJECTED ? (
						<div className="flex flex-col items-end gap-3">
							<Chip
								active={true}
								className="!bg-red-50 !text-red-700 !border-red-200 uppercase text-[10px] font-bold tracking-wider px-3"
							>
								<span className="flex items-center">
									<XCircle className="w-3 h-3 mr-1.5" /> REJECTED
								</span>
							</Chip>
							<div className="flex items-center gap-4">
								<button
									onClick={() => navigate("/submissions")}
									className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-2 transition-colors uppercase font-medium"
								>
									VIEW SUBMISSIONS
								</button>
							</div>
						</div>
					) : (
						<Button
							variant="outlined"
							className="!py-1.5 !px-3 !text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
							onClick={() => navigate("/onboarding?step=sponsor_kyb")}
						>
							<XCircle className="w-3 h-3 mr-1.5" />
							Verify
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

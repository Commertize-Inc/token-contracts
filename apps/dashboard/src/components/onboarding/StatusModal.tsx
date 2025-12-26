import React, { useEffect } from "react";
import {
	X,
	Clock,
	AlertTriangle,
	Loader2,
	RefreshCcw,
	MessageSquare,
	Edit,
} from "lucide-react";
import { KycStatus, VerificationStatus } from "@commertize/data/enums";
import { SupportOptions } from "../SupportOptions";

interface StatusModalProps {
	isOpen: boolean;
	status: KycStatus | VerificationStatus;
	title?: string;
	message?: string;
	onClose: () => void;
	onRefresh?: () => void;
	onViewFeedback?: () => void;
	onEdit?: () => void;
	loading: boolean;
	userId?: string | null;
	privyUserId?: string;
}

export const StatusModal: React.FC<StatusModalProps> = ({
	isOpen,
	status,
	title,
	message,
	onClose,
	onRefresh,
	onViewFeedback,
	onEdit,
	loading,
	userId,
	privyUserId,
}) => {
	const isPending =
		status === KycStatus.PENDING || status === VerificationStatus.PENDING;
	const isRejected =
		status === KycStatus.REJECTED || status === VerificationStatus.REJECTED;

	const isActionRequired = status === VerificationStatus.ACTION_REQUIRED;

	// ESC key handler for closing modal (only when not pending)
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen && !isPending && !isActionRequired) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, isPending, onClose]);

	if (!isOpen) return null;

	if (!isPending && !isRejected && !isActionRequired) return null;

	const defaultTitle = isPending
		? "Verification Pending"
		: isActionRequired
			? "Action Required"
			: "Verification Failed";

	const defaultMessage = isPending
		? "Your verification is currently pending manual review. Please check back later."
		: isActionRequired
			? "Your verification requires attention. Please check the feedback below."
			: "We were unable to verify your information. Please check the feedback or contact support.";

	return (
		<div className="fixed inset-0 z-[50] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm pt-20">
			<div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
				{!isPending && (
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				)}

				<div className="flex flex-col items-center text-center">
					<div
						className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isPending ? "bg-orange-100" : "bg-red-100"} `}
					>
						{isPending ? (
							<Clock
								className={`w-8 h-8 ${isPending ? "text-orange-600" : "text-red-600"} `}
							/>
						) : isActionRequired ? (
							<AlertTriangle className="w-8 h-8 text-orange-600" />
						) : (
							<AlertTriangle className="w-8 h-8 text-red-600" />
						)}
					</div>

					<h3 className="text-xl font-bold text-slate-900 mb-2">
						{title || defaultTitle}
					</h3>

					<p className="text-slate-600 mb-6">{message || defaultMessage}</p>

					<div className="flex flex-col space-y-3 w-full">
						{(isRejected || isActionRequired) && onViewFeedback && (
							<button
								onClick={onViewFeedback}
								className={`w-full ${isActionRequired ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"} border py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center`}
							>
								<MessageSquare className="w-4 h-4 mr-2" />
								View Feedback
							</button>
						)}

						{(isRejected || isActionRequired) && onEdit && (
							<button
								onClick={onEdit}
								className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
							>
								<Edit className="w-4 h-4 mr-2" />
								Edit & Resubmit
							</button>
						)}

						<SupportOptions
							userId={userId || undefined}
							privyUserId={privyUserId}
						/>

						{onRefresh && (
							<>
								<div className="relative flex py-2 items-center">
									<div className="flex-grow border-t border-slate-200"></div>
									<span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase">
										Or
									</span>
									<div className="flex-grow border-t border-slate-200"></div>
								</div>

								<button
									onClick={onRefresh}
									disabled={loading}
									className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center"
								>
									{loading ? (
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
									) : (
										<RefreshCcw className="w-4 h-4 mr-2" />
									)}
									Refresh Status
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

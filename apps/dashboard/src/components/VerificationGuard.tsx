import { VerificationStatus } from "@commertize/data/enums";
import { Button } from "@commertize/ui";
import { Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

interface VerificationGuardProps {
	children: React.ReactNode;
	status: VerificationStatus;
	fallbackPath?: string;
}

export function VerificationGuard({
	children,
	status,
	fallbackPath = "/profile",
}: VerificationGuardProps) {
	const { data: profile, isLoading, error } = useProfile();
	const navigate = useNavigate();

	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		if (isLoading || !profile || isRedirecting) return;

		let allowed = true;

		// Check KYC
		if (status && !status.includes(profile.kycStatus)) {
			allowed = false;
		}

		if (!allowed) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsRedirecting(true);
			// Small delay to show the "Access Denied" state or just redirect immediately
			// For better UX, we might want to show WHY it's denied before redirecting
			// But user requested gating. Let's redirect to profile so they can fix it.
			navigate(fallbackPath);
		}
	}, [profile, isLoading, status, navigate, fallbackPath, isRedirecting]);

	if (isLoading || isRedirecting) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
				<Loader2 className="w-8 h-8 animate-spin text-[#D4A024]" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
				<div className="text-center p-6 bg-white rounded-xl shadow-sm border border-red-100">
					<p className="text-red-500 mb-4">Failed to verify identity status</p>
					<Button onClick={() => window.location.reload()}>Retry</Button>
				</div>
			</div>
		);
	}

	// Double check render condition to prevent flash of content
	if (!profile) return null;

	// Permission Denied View (Optional, if we didn't redirect immediately)
	const denied = status && !status.includes(profile.kycStatus);

	if (denied) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
				<div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
					<div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-400">
						<Lock className="w-6 h-6" />
					</div>
					<h2 className="text-lg font-normal text-gray-900 mb-2">
						Access Restricted
					</h2>
					<p className="text-sm text-gray-500 font-light mb-6">
						You need to verify your identity to access this section.
					</p>
					<Button onClick={() => navigate("/profile")}>Go to Profile</Button>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}

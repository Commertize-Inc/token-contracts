import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { VerificationStatus } from "@commertize/data/enums";
import { Loader2 } from "lucide-react";

interface SponsorGuardProps {
	children: ReactNode;
}

export const SponsorGuard = ({ children }: SponsorGuardProps) => {
	const { data: profile, isLoading } = useProfile();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<Loader2 className="w-8 h-8 animate-spin text-[#C59B26]" />
			</div>
		);
	}

	if (
		!profile?.sponsor ||
		profile.sponsor.status !== VerificationStatus.VERIFIED
	) {
		// Redirect to sponsor onboarding if not verified
		return <Navigate to="/onboarding?step=sponsor_kyb" replace />;
	}

	return <>{children}</>;
};

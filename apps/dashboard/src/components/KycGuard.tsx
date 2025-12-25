import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { KycStatus } from "@commertize/data/enums";
import { Loader2 } from "lucide-react";

interface KycGuardProps {
	children: ReactNode;
}

export const KycGuard = ({ children }: KycGuardProps) => {
	const { data: profile, isLoading } = useProfile();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<Loader2 className="w-8 h-8 animate-spin text-[#C59B26]" />
			</div>
		);
	}

	if (!profile || profile.kycStatus !== KycStatus.APPROVED) {
		return <Navigate to="/onboarding" replace />;
	}

	return <>{children}</>;
};

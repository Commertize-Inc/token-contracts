import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, ChevronRight } from "lucide-react";

import { useOnboardingStatus } from "../hooks/useOnboardingStatus";

export const IncompleteProfileBanner = () => {
	const location = useLocation();
	const { data: status, isLoading } = useOnboardingStatus();

	if (location.pathname.startsWith("/onboarding")) {
		return null;
	}

	if (!status || isLoading) return null;

	let missingType: "investor" | "sponsor" | null = null;

	// If they haven't done Investor Profile
	if (!status.investorQuestionnaire) {
		missingType = "investor";
	}

	if (!missingType) return null;

	return (
		<div className="bg-amber-50 border-b border-amber-200 px-4 py-3 relative">
			<div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
				<div className="flex items-center gap-3 text-amber-800">
					<AlertTriangle className="w-5 h-5 shrink-0" />
					<p className="text-sm font-medium">
						{missingType === "investor"
							? "Your investor profile is incomplete. You currently cannot make investments."
							: "Your profile is incomplete."}
					</p>
				</div>
				<Link
					to="/onboarding"
					className="flex items-center gap-1 text-sm font-bold text-amber-900 hover:text-amber-950 whitespace-nowrap"
				>
					Complete Setup <ChevronRight className="w-4 h-4" />
				</Link>
			</div>
		</div>
	);
};

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { api } from "../lib/api";
import { KycStatus, VerificationStatus } from "@commertize/data/enums";

export interface OnboardingStatusData {
	kycStatus: KycStatus;
	hasBankAccount: boolean;
	isAdmin: boolean;
	role?: string;
	sponsor?: {
		id: string;
		businessName: string;
		status: VerificationStatus | string;
		ein?: string;
		address?: string;
		bio?: string;
		kybData?: any;
	};
	user?: {
		id: string;
		firstName?: string;
		lastName?: string;
		phoneNumber?: string;
		bio?: string;
		avatarUrl?: string;
		username?: string;
	};
	investorQuestionnaire?: {
		accreditationType: string;
		accreditationDocuments: string[];
	};
}

export function useOnboardingStatus() {
	const { getAccessToken, authenticated, ready } = usePrivy();

	return useQuery({
		queryKey: ["onboarding-status"],
		queryFn: async () => {
			const token = await getAccessToken();
			if (!token) throw new Error("No access token");
			return api.get(
				"onboarding/status",
				token
			) as Promise<OnboardingStatusData>;
		},
		enabled: ready && authenticated,
		retry: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

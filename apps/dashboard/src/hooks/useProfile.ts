import { KycStatus, VerificationStatus } from "@commertize/data/enums";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface ProfileData {
	kycStatus: KycStatus;
	kycCompletedAt?: string;
	walletAddress?: string;
	email?: string;
	privyId: string;
	stripeCustomerId?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	bankAccounts: any[]; // Define specific type if needed shared
	isAdmin: boolean;
	sponsor?: {
		id: string;
		businessName: string;
		status: VerificationStatus; // Or VerificationStatus, keeping type consistent with previous but renamed
	};
	firstName?: string;
	lastName?: string;
	username?: string;
	phoneNumber?: string;
	bio?: string;
	avatarUrl?: string;
	createdAt: string;
}

export function useProfile() {
	const { getAccessToken, authenticated, ready } = usePrivy();

	return useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			const token = await getAccessToken();
			if (!token) throw new Error("No access token");
			return api.get("/profile", token) as Promise<ProfileData>;
		},
		enabled: ready && authenticated,
		retry: false,
		staleTime: 0,
	});
}

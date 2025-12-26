import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from "@commertize/utils/client";

import { PostHogIdentity } from "./components/PostHogIdentity";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	// Debug: Check if env vars are loaded
	console.debug("VITE_PRIVY_APP_ID:", import.meta.env.VITE_PRIVY_APP_ID);
	console.debug("VITE_PRIVY_CLIENT_ID:", import.meta.env.VITE_PRIVY_CLIENT_ID);
	console.debug("All env:", import.meta.env);

	return (
		<PostHogProvider>
			<PrivyProvider
				appId={import.meta.env.VITE_PRIVY_APP_ID!}
				clientId={import.meta.env.VITE_PRIVY_CLIENT_ID!}
				config={{
					loginMethods: ["email", "wallet", "google"],
					appearance: {
						theme: "light",
						accentColor: "#C59B26",
						logo: "/assets/logo.png",
					},
					embeddedWallets: {
						createOnLogin: "users-without-wallets",
						requireUserPasswordOnCreate: true,
						noPromptOnSignature: true,
						showWalletUIs: true,
						waitForTransactionConfirmation: true,
					},
				}}
			>
				<PostHogIdentity />
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</PrivyProvider>
		</PostHogProvider>
	);
}

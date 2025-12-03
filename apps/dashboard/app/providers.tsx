"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { AuthGuard } from "@/components/AuthGuard";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent SSR issues with Privy
	if (!mounted) {
		return <>{children}</>;
	}

	return (
		<PrivyProvider
			appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
			clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || ""}
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
			<AuthGuard>{children}</AuthGuard>
		</PrivyProvider>
	);
}

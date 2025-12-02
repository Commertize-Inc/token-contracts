"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { AuthGuard } from "@/components/AuthGuard";

export function Providers({ children }: { children: React.ReactNode }) {
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
                                        createOnLogin: 'users-without-wallets',
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

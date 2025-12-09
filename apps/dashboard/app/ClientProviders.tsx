"use client";

import { Providers } from "./providers";

/**
 * Client-only wrapper to ensure Privy/WalletConnect dependencies
 * are never part of the server component graph
 */
export default function ClientProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	return <Providers>{children}</Providers>;
}

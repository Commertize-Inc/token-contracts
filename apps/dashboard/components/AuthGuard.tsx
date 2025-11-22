"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
	children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
	const { ready, authenticated } = usePrivy();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// Don't redirect if we're already on the auth page
		if (pathname === "/auth") {
			return;
		}

		// Redirect to auth page if not authenticated
		if (ready && !authenticated) {
			router.push("/auth");
		}
	}, [ready, authenticated, router, pathname]);

	// Show loading state while Privy is initializing
	if (!ready) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
					<p className="text-slate-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Show loading state while redirecting
	if (!authenticated && pathname !== "/auth") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
					<p className="text-slate-600">Redirecting to login...</p>
				</div>
			</div>
		);
	}

	// User is authenticated, render children
	return <>{children}</>;
}

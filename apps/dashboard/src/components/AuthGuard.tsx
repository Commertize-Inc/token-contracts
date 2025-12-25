import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { usePostHog } from "@commertize/utils/client";

// Mock STAGE for now, or get from env
const STAGE = import.meta.env.MODE || "development";

interface AuthGuardProps {
	children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
	const { ready, authenticated, user } = usePrivy();
	const navigate = useNavigate();
	const location = useLocation();
	const posthog = usePostHog();

	useEffect(() => {
		// Don't redirect if we're already on the auth page
		if (location.pathname === "/auth") {
			return;
		}

		// Redirect to auth page if not authenticated
		if (ready && !authenticated) {
			navigate("/auth");
		}

		// Identify user in PostHog
		if (ready && authenticated && user) {
			posthog?.identify(user.id, {
				email: user.email?.address,
				wallet: user.wallet?.address,
				STAGE,
			});
		}
	}, [ready, authenticated, navigate, location, user, posthog]);

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
	if (!authenticated && location.pathname !== "/auth") {
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

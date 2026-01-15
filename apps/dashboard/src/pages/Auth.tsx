import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@commertize/ui";
import BackgroundSlider from "../components/BackgroundSlider";

import { usePostHog } from "@commertize/utils/client";

export default function AuthPage() {
	const { login, ready, authenticated } = usePrivy();
	const navigate = useNavigate();
	const posthog = usePostHog();

	useEffect(() => {
		if (posthog) {
			posthog.capture("auth_page_viewed");
		}
	}, [posthog]);

	useEffect(() => {
		if (ready && authenticated) {
			navigate("/");
		}
	}, [ready, authenticated, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center relative">
			<BackgroundSlider />

			<div className="relative z-10 p-10 bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
				<div className="mb-8">
					<img
						src="/assets/logo.png"
						alt="Commertize"
						className="h-12 mx-auto mb-4"
					/>
					<h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
						Welcome Back
					</h1>
					<p className="text-slate-600 text-sm">
						Sign in to manage your real estate portfolio
					</p>
				</div>

				<Button
					onClick={login}
					className="w-full py-6 text-lg font-medium bg-[#C59B26] hover:bg-[#C59B26]/90 text-white border-0 shadow-lg shadow-[#C59B26]/20"
				>
					Sign In
				</Button>

				<div className="mt-6 pt-6 border-t border-slate-200">
					<p className="text-xs text-slate-500">
						By signing in, you agree to our{" "}
						<a
							href="https://commertize.com/terms"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#C59B26] hover:text-[#C59B26]/80 hover:underline transition-colors"
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							href="https://commertize.com/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#C59B26] hover:text-[#C59B26]/80 hover:underline transition-colors"
						>
							Privacy Policy
						</a>
						.
					</p>
				</div>
			</div>
		</div>
	);
}

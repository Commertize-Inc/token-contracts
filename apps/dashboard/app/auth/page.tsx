"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Building, Loader2 } from "lucide-react";

export default function AuthPage() {
	const { ready, authenticated, login } = usePrivy();
	const router = useRouter();

	useEffect(() => {
		if (ready && authenticated) {
			// User is authenticated, redirect to dashboard
			router.push("/");
		}
	}, [ready, authenticated, router]);

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

	if (authenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
					<p className="text-slate-600">Redirecting...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg">
				<div className="text-center">
					<Building className="w-12 h-12 mx-auto mb-4 text-[#C59B26]" />
					<h1 className="text-3xl font-bold text-slate-900 mb-2">
						Welcome to Commertize
					</h1>
					<p className="text-slate-600 mb-8">
						Sign in to access your investor dashboard
					</p>
					<button
						onClick={login}
						className="w-full bg-[#C59B26] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#B08B20] transition-colors"
					>
						Sign In
					</button>
				</div>
			</div>
		</div>
	);
}

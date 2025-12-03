"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import {
	usePlaidLink,
	PlaidLinkOptions,
	PlaidLinkOnSuccess,
} from "react-plaid-link";

export default function KYCPage() {
	const { user } = usePrivy();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [linkToken, setLinkToken] = useState<string | null>(null);

	useEffect(() => {
		const createLinkToken = async () => {
			try {
				const response = await fetch("/api/plaid/create_link_token", {
					method: "POST",
				});
				const data = await response.json();
				setLinkToken(data.link_token);
			} catch (error) {
				console.error("Error creating link token:", error);
			}
		};

		if (user) {
			createLinkToken();
		}
	}, [user]);

	const onSuccess = useCallback<PlaidLinkOnSuccess>(
		async (public_token, metadata) => {
			setLoading(true);
			try {
				// For IDV, we use the link_session_id from metadata (or just call the check endpoint which looks up by user)
				const response = await fetch("/api/plaid/check_idv_status", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ link_session_id: metadata.link_session_id }),
				});

				const data = await response.json();

				if (response.ok && data.success) {
					setSuccess(true);
					setTimeout(() => {
						router.push("/");
					}, 2000);
				} else {
					console.error("IDV Verification failed or pending:", data);
					// Handle failure or pending state - for now just log
				}
			} catch (error) {
				console.error("Error checking IDV status:", error);
			} finally {
				setLoading(false);
			}
		},
		[router]
	);

	const config: PlaidLinkOptions = {
		token: linkToken,
		onSuccess,
	};

	const { open, ready } = usePlaidLink(config);

	const handleSkipKYC = async () => {
		setLoading(true);
		try {
			// For dev/skip, we just hit the old submit endpoint which marks as KYCd
			// Or we can create a specific skip endpoint, but the old one just sets isKycd=true
			// which is what we want for skipping.
			const response = await fetch("/api/kyc/submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				setSuccess(true);
				setTimeout(() => {
					router.push("/");
				}, 2000);
			}
		} catch (error) {
			console.error("Error skipping KYC:", error);
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg text-center">
					<CheckCircle className="w-16 h-16 mx-auto text-green-500" />
					<h1 className="text-2xl font-bold text-slate-900">
						KYC Verification Complete!
					</h1>
					<p className="text-slate-600">Redirecting you to the dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />

			<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="bg-white rounded-2xl shadow-lg p-8">
					<div className="text-center mb-8">
						<div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<ShieldCheck className="w-8 h-8 text-blue-600" />
						</div>
						<h1 className="text-3xl font-bold text-slate-900 mb-2">
							Identity Verification
						</h1>
						<p className="text-slate-600">
							Please verify your identity to continue using Commertize.
						</p>
					</div>

					<div className="space-y-6">
						<div className="bg-slate-50 rounded-lg p-4">
							<h3 className="font-semibold text-slate-900 mb-2">
								Why is this required?
							</h3>
							<p className="text-sm text-slate-600">
								To comply with financial regulations and ensure the security of
								our platform, we require all users to complete identity
								verification.
							</p>
						</div>

						<div className="space-y-4">
							<button
								onClick={() => open()}
								disabled={!ready || loading}
								className="w-full bg-[#C59B26] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#B08B20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
							>
								{loading ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin mr-2" />
										Processing...
									</>
								) : (
									"Verify with Plaid"
								)}
							</button>

							{process.env.NODE_ENV !== "production" && (
								<button
									onClick={handleSkipKYC}
									disabled={loading}
									className="w-full bg-slate-200 text-slate-700 py-3 px-6 rounded-lg font-semibold hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Skip KYC (Dev Only)
								</button>
							)}
						</div>

						<p className="text-xs text-center text-slate-500">
							Secured by Plaid. Your data is encrypted and never stored on our
							servers.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}

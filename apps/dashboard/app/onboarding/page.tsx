"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
	CheckCircle,
	Loader2,
	ShieldCheck,
	Landmark,
	ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import {
	PlaidLinkOnSuccess,
	PlaidLinkOnExit,
} from "react-plaid-link";
import { PlaidLauncher } from "@/components/PlaidLauncher";
import { OnboardingStep } from "@/lib/types/onboarding";



export default function KYCPage() {
	const { user } = usePrivy();
	const router = useRouter();
	const [step, setStep] = useState<OnboardingStep>(OnboardingStep.KYC);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [linkToken, setLinkToken] = useState<string | null>(null);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const response = await fetch("/api/kyc/status");
				const data = await response.json();
				if (data.onboardingStep) {
					setStep(data.onboardingStep);
				}
			} catch (error) {
				console.error("Error fetching onboarding status:", error);
			}
		};

		if (user) {
			fetchStatus();
		}
	}, [user]);

	const [shouldOpenPlaid, setShouldOpenPlaid] = useState(false);

	// Fetch link token based on current step
	const createLinkToken = useCallback(
		async (flow: "idv" | "auth") => {
			try {
				const response = await fetch(
					`/api/plaid/create_link_token?flow=${flow}`,
					{
						method: "POST",
					}
				);
				const data = await response.json();
				setLinkToken(data.link_token);
			} catch (error) {
				console.error("Error creating link token:", error);
				setLoading(false);
				setShouldOpenPlaid(false);
			}
		},
		[]
	);

	// Reset state when step changes
	useEffect(() => {
		if (user) {
			setLinkToken(null);
			setShouldOpenPlaid(false);
		}
	}, [user, step]);

	const updateStep = async (newStep: OnboardingStep) => {
		try {
			await fetch("/api/onboarding/step", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ step: newStep }),
			});

			if (newStep !== OnboardingStep.COMPLETE) {
				setStep(newStep);
			}
		} catch (error) {
			console.error("Error updating step:", error);
		}
	};

	const onKycSuccess = useCallback<PlaidLinkOnSuccess>(
		async (public_token, metadata) => {
			setLoading(true);
			try {
				const response = await fetch("/api/plaid/check_idv_status", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ link_session_id: metadata.link_session_id }),
				});

				const data = await response.json();

				if (response.ok && data.success) {
					// Move to next step and persist
					await updateStep(OnboardingStep.ACH);
				} else {
					console.error("IDV Verification failed or pending:", data);
				}
			} catch (error) {
				console.error("Error checking IDV status:", error);
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const onAchSuccess = useCallback<PlaidLinkOnSuccess>(
		async (public_token, metadata) => {
			setLoading(true);
			try {
				const response = await fetch("/api/plaid/exchange_public_token", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ public_token }),
				});

				const data = await response.json();

				if (response.ok && data.success) {
					await updateStep(OnboardingStep.COMPLETE);
					setSuccess(true);
					setTimeout(() => {
						router.push("/");
					}, 2000);
				} else {
					console.error("Failed to link bank account:", data);
				}
			} catch (error) {
				console.error("Error linking bank account:", error);
			} finally {
				setLoading(false);
			}
		},
		[router]
	);

	const handlePlaidExit: PlaidLinkOnExit = useCallback(() => {
		setShouldOpenPlaid(false);
		setLoading(false);
	}, []);

	const handleStartPlaid = () => {
		setLoading(true);
		setShouldOpenPlaid(true);
		if (!linkToken) {
			if (step === OnboardingStep.KYC) {
				createLinkToken("idv");
			} else if (step === OnboardingStep.ACH) {
				createLinkToken("auth");
			}
		}
	};

	const handleSkipKYC = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/kyc/submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				await updateStep(OnboardingStep.ACH);
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
						Onboarding Complete!
					</h1>
					<p className="text-slate-600">
						Your identity is verified and bank account is connected.
					</p>
					<p className="text-slate-500 text-sm mt-2">
						Redirecting to dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />

			<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{shouldOpenPlaid && linkToken && (
					<PlaidLauncher
						token={linkToken}
						onSuccess={step === OnboardingStep.KYC ? onKycSuccess : onAchSuccess}
						onExit={handlePlaidExit}
					/>
				)}
				{/* Progress Steps */}
				<div className="mb-8">
					<div className="flex items-center justify-center space-x-4">
						<div
							className={`flex items-center space-x-2 ${step === OnboardingStep.KYC ? "text-blue-600" : "text-green-600"
								}`}
						>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === OnboardingStep.KYC
									? "border-blue-600 bg-blue-50"
									: "border-green-600 bg-green-50"
									}`}
							>
								{step === OnboardingStep.ACH ? (
									<CheckCircle className="w-5 h-5" />
								) : (
									<span className="font-bold">1</span>
								)}
							</div>
							<span className="font-medium">Identity</span>
						</div>
						<div className="w-12 h-0.5 bg-slate-200" />
						<div
							className={`flex items-center space-x-2 ${step === OnboardingStep.ACH ? "text-blue-600" : "text-slate-400"
								}`}
						>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === OnboardingStep.ACH
									? "border-blue-600 bg-blue-50"
									: "border-slate-200 bg-white"
									}`}
							>
								<span className="font-bold">2</span>
							</div>
							<span className="font-medium">Bank Link</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-8">
					{step === OnboardingStep.KYC ? (
						<>
							<div className="text-center mb-8">
								<div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<ShieldCheck className="w-8 h-8 text-blue-600" />
								</div>
								<h1 className="text-3xl font-bold text-slate-900 mb-2">
									Identity Verification
								</h1>
								<p className="text-slate-600">
									Please verify your identity to continue.
								</p>
							</div>

							<div className="space-y-6">
								<div className="bg-slate-50 rounded-lg p-4">
									<h3 className="font-semibold text-slate-900 mb-2">
										Why is this required?
									</h3>
									<p className="text-sm text-slate-600">
										To comply with financial regulations and ensure the security
										of our platform, we require all users to complete identity
										verification.
									</p>
								</div>

								<div className="space-y-4">
									<button
										onClick={handleStartPlaid}
										disabled={loading}
										className="w-full bg-[#C59B26] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#B08B20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
									>
										{loading ? (
											<>
												<Loader2 className="w-5 h-5 animate-spin mr-2" />
												Processing...
											</>
										) : (
											"Verify Identity"
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
							</div>
						</>
					) : (
						<>
							<div className="text-center mb-8">
								<div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<Landmark className="w-8 h-8 text-blue-600" />
								</div>
								<h1 className="text-3xl font-bold text-slate-900 mb-2">
									Connect Bank Account
								</h1>
								<p className="text-slate-600">
									Link your bank account to start investing.
								</p>
							</div>

							<div className="space-y-6">
								<div className="bg-slate-50 rounded-lg p-4">
									<h3 className="font-semibold text-slate-900 mb-2">
										Secure & Private
									</h3>
									<p className="text-sm text-slate-600">
										We use Plaid to securely connect your bank account. Your
										credentials are never stored on our servers.
									</p>
								</div>

								<div className="space-y-4">
									<button
										onClick={handleStartPlaid}
										disabled={loading}
										className="w-full bg-[#C59B26] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#B08B20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
									>
										{loading ? (
											<>
												<Loader2 className="w-5 h-5 animate-spin mr-2" />
												Connecting...
											</>
										) : (
											<>
												Connect with Plaid
												<ArrowRight className="w-5 h-5 ml-2" />
											</>
										)}
									</button>
								</div>
							</div>
						</>
					)}

					<p className="text-xs text-center text-slate-500 mt-6">
						Secured by Plaid. Your data is encrypted and never stored on our
						servers.
					</p>
				</div>
			</main>
		</div>
	);
}

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
import { OnboardingStep, KycStatus } from "@/lib/types/onboarding";



export default function KYCPage() {
	const { user } = usePrivy();
	const router = useRouter();
	const [step, setStep] = useState<OnboardingStep>(OnboardingStep.KYC);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [linkToken, setLinkToken] = useState<string | null>(null);
	const [isCheckingStatus, setIsCheckingStatus] = useState(true);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const response = await fetch("/api/onboarding/status");
				const data = await response.json();

				// Priority Logic:
				// 1. If status is NOT APPROVED -> Force KYC step
				// 2. If status is APPROVED -> Check if has bank account
				if (data.kycStatus === KycStatus.APPROVED) {
					if (data.hasBankAccount) {
						// Already done
						setStep(OnboardingStep.COMPLETE);
						setSuccess(true);
						setTimeout(() => {
							router.push("/");
						}, 2000);
					} else {
						// Needs bank account
						setStep(OnboardingStep.ACH);
					}
				} else {
					// User is not verified (NOT_STARTED, PENDING, REJECTED)
					// Force them to KYC step to see status/verify
					setStep(OnboardingStep.KYC);
				}
			} catch (error) {
				console.error("Error fetching onboarding status:", error);
			} finally {
				setIsCheckingStatus(false);
			}
		};

		if (user) {
			fetchStatus();
		}
	}, [user, router]);

	// const [shouldOpenPlaid, setShouldOpenPlaid] = useState(false);

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
			}
		},
		[]
	);

	// Reset state when step changes
	useEffect(() => {
		if (user) {
			setLinkToken(null);
		}
	}, [user, step]);


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
					// Move to next step (ACH) purely on client state for now.
					// The user's kycStatus should be updated in DB by check_idv_status.
					setStep(OnboardingStep.ACH);
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
					setStep(OnboardingStep.COMPLETE);
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
		setLinkToken(null);
		setLoading(false);
	}, []);

	const handleStartPlaid = () => {
		setLoading(true);
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
			const response = await fetch("/api/onboarding/submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				setStep(OnboardingStep.ACH);
			}
		} catch (error) {
			console.error("Error skipping KYC:", error);
		} finally {
			setLoading(false);
		}
	};

	if (isCheckingStatus) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
					<p className="text-slate-600">Checking account status...</p>
				</div>
			</div>
		);
	}

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
				<PlaidLauncher
					token={linkToken}
					onSuccess={step === OnboardingStep.KYC ? onKycSuccess : onAchSuccess}
					onExit={handlePlaidExit}
				/>
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
												Connect
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
			</main >
		</div >
	);
}

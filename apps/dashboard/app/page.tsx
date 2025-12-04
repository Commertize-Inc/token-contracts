"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { OnboardingStep } from "@/lib/types/onboarding";

export default function DashboardHome() {
	const router = useRouter();
	const [kycStatus, setKycStatus] = useState<{
		loading: boolean;
		onboardingStep: OnboardingStep | null;
		isKycd: boolean;
	}>({ loading: true, onboardingStep: null, isKycd: false });

	const checkKycStatus = useCallback(async () => {
		setKycStatus((prev) => ({ ...prev, loading: true }));
		try {
			const response = await fetch("/api/kyc/status");
			const data = await response.json();
			setKycStatus({
				loading: false,
				onboardingStep: data.onboardingStep,
				isKycd: data.isKycd,
			});

			if (data.onboardingStep !== OnboardingStep.COMPLETE) {
				// Redirect to KYC flow
				router.push("/onboarding");
			}
		} catch (error) {
			console.error("Error checking KYC status:", error);
			setKycStatus({ loading: false, onboardingStep: null, isKycd: false });
		}
	}, [router]);

	useEffect(() => {
		// Check KYC status on mount - this is a legitimate data fetching pattern
		// eslint-disable-next-line react-hooks/set-state-in-effect
		checkKycStatus();
	}, [checkKycStatus]);

	if (kycStatus.loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
					<p className="text-slate-600">Verifying your account...</p>
				</div>
			</div>
		);
	}

	if (kycStatus.onboardingStep !== OnboardingStep.COMPLETE) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-slate-900 mb-4">
							KYC Verification Required
						</h1>
						<p className="text-slate-600 mb-6">
							To access the dashboard and invest in properties, you need to
							complete KYC verification.
						</p>
						<button
							onClick={() => router.push("/onboarding")}
							className="w-full bg-[#C59B26] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#B08B20] transition-colors"
						>
							Start KYC Verification
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (
		kycStatus.onboardingStep === OnboardingStep.COMPLETE &&
		!kycStatus.isKycd
	) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg">
					<div className="text-center">
						<div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
						</div>
						<h1 className="text-2xl font-bold text-slate-900 mb-4">
							Account Pending Review
						</h1>
						<p className="text-slate-600 mb-6">
							Your account is currently under review. We will notify you once your
							identity verification is complete.
						</p>
						<button
							onClick={() => window.location.reload()}
							className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
						>
							Check Status
						</button>
					</div>
				</div>
			</div>
		);
	}

	// User is authenticated and KYC'd
	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-slate-900 mb-2">
						Welcome back!
					</h1>
					<p className="text-slate-600">
						Your account is verified and ready to invest.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
						<h3 className="text-sm font-medium text-slate-500 mb-2">
							Portfolio Value
						</h3>
						<p className="text-2xl font-bold text-slate-900">$0.00</p>
					</div>
					<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
						<h3 className="text-sm font-medium text-slate-500 mb-2">
							Active Investments
						</h3>
						<p className="text-2xl font-bold text-slate-900">0</p>
					</div>
					<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
						<h3 className="text-sm font-medium text-slate-500 mb-2">
							Total Returns
						</h3>
						<p className="text-2xl font-bold text-slate-900">$0.00</p>
					</div>
				</div>
			</main>
		</div>
	);
}

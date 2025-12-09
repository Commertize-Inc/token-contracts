"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { KycStatus } from "@/lib/types/onboarding";

export default function DashboardHome() {
	const router = useRouter();
	const [kycStatus, setKycStatus] = useState<{
		loading: boolean;
		hasBankAccount: boolean;
		kycStatus: KycStatus;
	}>({ loading: true, hasBankAccount: false, kycStatus: KycStatus.NOT_STARTED });

	const checkKycStatus = useCallback(async () => {
		setKycStatus((prev) => ({ ...prev, loading: true }));
		try {
			// First fetch current status
			const response = await fetch("/api/onboarding/status");
			const data = await response.json();

			let currentStatus = {
				hasBankAccount: data.hasBankAccount,
				kycStatus: data.kycStatus,
			};

			// If status is PENDING, try to refresh from Plaid
			if (currentStatus.kycStatus === KycStatus.PENDING) {
				try {
					const plaidResponse = await fetch("/api/plaid/check_idv_status", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
					});

					if (plaidResponse.ok) {
						// Re-fetch status after update
						const updatedResponse = await fetch("/api/onboarding/status");
						const updatedData = await updatedResponse.json();
						currentStatus = {
							hasBankAccount: updatedData.hasBankAccount,
							kycStatus: updatedData.kycStatus,
						};
					}
				} catch (plaidError) {
					console.error("Error refreshing Plaid status:", plaidError);
				}
			}

			setKycStatus({
				loading: false,
				hasBankAccount: currentStatus.hasBankAccount,
				kycStatus: currentStatus.kycStatus,
			});

			// STRICT REDIRECT LOGIC
			// If not approved or not complete (bank not linked), redirect to onboarding
			if (
				currentStatus.kycStatus !== KycStatus.APPROVED ||
				!currentStatus.hasBankAccount
			) {
				router.push("/onboarding");
			}
		} catch (error) {
			console.error("Error checking KYC status:", error);
			setKycStatus({ loading: false, hasBankAccount: false, kycStatus: KycStatus.NOT_STARTED });
		}
	}, [router]);

	useEffect(() => {
		// Check KYC status on mount
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

	// This component now strictly renders ONLY if initialized and approved.
	// Any other state should have been redirected by the effect above.
	// We render a fallback loading state or null here just in case the redirect takes a messure
	if (
		kycStatus.kycStatus !== KycStatus.APPROVED ||
		!kycStatus.hasBankAccount
	) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
					<p className="text-slate-600">Redirecting to onboarding...</p>
				</div>
			</div>
		);
	}

	// User is authenticated, KYC'd (APPROVED), and Onboarding Complete
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

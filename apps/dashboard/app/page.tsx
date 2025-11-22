"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function DashboardHome() {
	const router = useRouter();
	const [kycStatus, setKycStatus] = useState<{
		loading: boolean;
		isKycd: boolean | null;
	}>({ loading: true, isKycd: null });

	useEffect(() => {
		// Check KYC status on mount
		checkKycStatus();
	}, []);

	const checkKycStatus = async () => {
		setKycStatus({ loading: true, isKycd: null });
		try {
			const response = await fetch("/api/kyc/status");
			const data = await response.json();
			setKycStatus({ loading: false, isKycd: data.isKycd });

			if (!data.isKycd) {
				// Redirect to KYC flow
				router.push("/kyc");
			}
		} catch (error) {
			console.error("Error checking KYC status:", error);
			setKycStatus({ loading: false, isKycd: null });
		}
	};

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

	if (kycStatus.isKycd === false) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-slate-900 mb-4">
							KYC Verification Required
						</h1>
						<p className="text-slate-600 mb-6">
							To access the dashboard and invest in properties, you need to complete KYC verification.
						</p>
						<button
							onClick={() => router.push("/kyc")}
							className="w-full bg-[#C59B26] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#B08B20] transition-colors"
						>
							Start KYC Verification
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

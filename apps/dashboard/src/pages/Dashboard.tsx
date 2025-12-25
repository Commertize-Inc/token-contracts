import { KycStatus, VerificationStatus } from "@commertize/data/enums";
import { Button, ListingCard, PageHeader } from "@commertize/ui";
import { usePrivy } from "@privy-io/react-auth";
import { AlertTriangle, Loader2, PlusCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatWidget } from "../components/ChatWidget";
import { InvestmentList } from "../components/InvestmentList";
import { Navbar } from "../components/Navbar";
import { useListings } from "../hooks/useListings";
import { useProfile } from "../hooks/useProfile";
import { api } from "../lib/api";

export default function DashboardHome() {
	const navigate = useNavigate();
	const { getAccessToken, user } = usePrivy();
	const { data: profile, isLoading: isProfileLoading } = useProfile();

	const { data: listings = [] } = useListings();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [investments, setInvestments] = useState<any[]>([]);

	const isKycApproved = profile?.kycStatus === KycStatus.APPROVED;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = await getAccessToken();
				const invData = await api.get("/invest/holdings", token);
				setInvestments(invData);
			} catch (err) {
				console.error("Error fetching dashboard data", err);
			}
		};

		if (!isProfileLoading) {
			fetchData();
		}
	}, [isProfileLoading, getAccessToken]);

	if (isProfileLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
					<p className="text-slate-600">Loading your profile...</p>
				</div>
			</div>
		);
	}

	// Quick calc for stats
	const portfolioValue = investments.reduce(
		(acc, inv) => acc + parseFloat(inv.amountUsdc || "0"),
		0
	);
	const activeInvestmentCount = investments.filter(
		(i) => i.status === "PENDING" || i.status === "COMPLETED"
	).length;

	return (
		<div className="min-h-screen bg-slate-50 pb-20">
			<Navbar />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Global KYC Banner for Unverified Users */}
				{!isKycApproved && (
					<div className="mb-8 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start sm:items-center justify-between gap-4">
						<div className="flex gap-3">
							<AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
							<div>
								<h3 className="text-sm font-medium text-red-800">
									Account Verification Required
								</h3>
								<p className="mt-1 text-sm text-red-700">
									You must verify your identity to invest in listings or list
									assets. Verification usually takes less than 2 minutes.
								</p>
							</div>
						</div>
						<Button
							variant="outlined"
							className="shrink-0 bg-white border-red-200 text-red-700 hover:bg-red-50"
							onClick={() => navigate("/onboarding")}
						>
							Verify Now
						</Button>
					</div>
				)}

				<PageHeader
					title="Dashboard"
					subtitle={
						<>
							Welcome back,{" "}
							{user?.google?.name || user?.email?.address || "Investor"}
						</>
					}
					actions={
						<div className="flex gap-3">
							{profile?.sponsor?.status === VerificationStatus.VERIFIED && (
								<Button
									className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
									onClick={() => navigate("/sponsor/dashboard")}
								>
									<PlusCircle className="w-4 h-4" />
									Manage Listings
								</Button>
							)}
							<Button
								variant="outlined"
								onClick={() => navigate("/marketplace")}
								className="gap-2"
							>
								<TrendingUp className="w-4 h-4" />
								Browse Marketplace
							</Button>
						</div>
					}
					className="mb-8"
				/>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
						<h3 className="text-sm font-medium text-slate-500 mb-2">
							Portfolio Value
						</h3>
						<p className="text-2xl font-bold text-slate-900">
							${portfolioValue.toLocaleString()}
						</p>
					</div>
					<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
						<h3 className="text-sm font-medium text-slate-500 mb-2">
							Active Investments
						</h3>
						<p className="text-2xl font-bold text-slate-900">
							{activeInvestmentCount}
						</p>
					</div>
					<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
						<h3 className="text-sm font-medium text-slate-500 mb-2">
							Total Returns
						</h3>
						<p className="text-2xl font-bold text-slate-900">$0.00</p>
					</div>
				</div>

				<div className="space-y-12">
					<section>
						<h2 className="text-xl font-semibold mb-4 text-slate-900">
							Your Portfolio
						</h2>
						<InvestmentList investments={investments} />
					</section>

					<section>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold text-slate-900">
								Featured Opportunities
							</h2>
							<Button
								variant="text"
								className="text-primary"
								onClick={() => navigate("/marketplace")}
							>
								View Marketplace
							</Button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
							{listings.slice(0, 3).map((listing: any, index: number) => (
								<ListingCard
									key={listing.id}
									listing={listing}
									index={index}
									currentFunding={0}
									onViewDetails={() => navigate(`/listing/${listing.id}`)}
								/>
							))}
							{listings.length === 0 && (
								<p className="text-muted-foreground col-span-3 text-center py-8">
									No active opportunities available right now.
								</p>
							)}
						</div>
					</section>
				</div>
			</main>
			<ChatWidget />
		</div>
	);
}

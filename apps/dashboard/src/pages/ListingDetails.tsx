import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { usePrivy } from "@privy-io/react-auth";
import { KycStatus } from "@commertize/data/enums";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Button, SubNavbar, ScrollToTopButton } from "@commertize/ui";
import {
	Loader2,
	MapPin,
	Building2,
	ArrowLeft,
	LayoutDashboard,
	DollarSign,
	FileText,
} from "lucide-react";
import { ListingStatus } from "@commertize/data/enums";
import { ListingFinancials } from "../components/listing/ListingFinancials";
import { ListingLocation } from "../components/listing/ListingLocation";
import { ListingDocuments } from "../components/listing/ListingDocuments";
import { ListingSponsor } from "../components/listing/ListingSponsor";
import { InvestmentCard } from "../components/listing/InvestmentCard";
import { SupportOptions } from "../components/SupportOptions";
import { Listing } from "@commertize/data";

interface ListingWithStats extends Listing {
	stats?: {
		currentFunding: number;
		targetRaise: number;
		percentageFunded: number;
		investorsCount: number;
	};
}

export default function ListingDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [listing, setListing] = useState<ListingWithStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { getAccessToken } = usePrivy();
	const [canInvest, setCanInvest] = useState(false);

	useEffect(() => {
		const fetchListingAndUserStatus = async () => {
			try {
				const token = await getAccessToken();
				const [listingData, userStatus] = await Promise.all([
					api.get(`/listings/${id}`),
					token ? api.get("onboarding/status", token) : Promise.resolve(null),
				]);

				console.log(`Listing Data: `, listingData);

				setListing(listingData);

				if (
					userStatus &&
					userStatus.kycStatus === KycStatus.APPROVED &&
					userStatus.investorQuestionnaire
				) {
					setCanInvest(true);
				}
			} catch (err) {
				setError("Failed to load listing details");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchListingAndUserStatus();
		}
	}, [id, getAccessToken]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<Loader2 className="w-8 h-8 animate-spin text-[#D4A024]" />
			</div>
		);
	}

	if (error || !listing) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
					<p className="text-slate-500 mb-4">{error || "Listing not found"}</p>
					<Button onClick={() => navigate("/marketplace")}>
						Back to Marketplace
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
			<Navbar />

			<main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
				<div className="flex flex-col lg:flex-row gap-8 relative">
					{/* Left Sidebar: SubNavbar (Vertical) */}
					<SubNavbar
						items={[
							{
								id: "overview",
								label: "Overview",
								icon: LayoutDashboard,
							},
							{
								id: "financials",
								label: "Financials",
								icon: DollarSign,
							},
							{
								id: "location",
								label: "Location",
								icon: MapPin,
							},
							{
								id: "documents",
								label: "Documents",
								icon: FileText,
							},
							{
								id: "sponsor",
								label: "Sponsor",
								icon: Building2,
							},
						]}
						offset={100}
						className="hidden lg:flex"
					/>

					{/* Middle Column: Main Content */}
					<div className="flex-1 min-w-0 space-y-8">
						{/* Breadcrumb / Back Navigation */}
						<button
							id="overview"
							onClick={() => navigate(-1)}
							className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
						>
							<ArrowLeft className="w-4 h-4" /> Back
						</button>

						{/* Main Image */}
						<div className="aspect-video relative rounded-2xl overflow-hidden bg-slate-200 scroll-mt-32">
							{listing.images && listing.images[0] ? (
								<img
									src={listing.images[0]}
									alt={listing.name}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-slate-400">
									<Building2 className="w-12 h-12" />
								</div>
							)}

							<div className="absolute top-4 left-4">
								<div className="px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold rounded-full tracking-wide shadow-sm uppercase">
									{listing.status === ListingStatus.ACTIVE
										? "RAISING FUNDS"
										: listing.status.replace(/_/g, " ")}
								</div>
							</div>
						</div>

						{/* Title and Address */}
						<div className="mb-2">
							<h1 className="text-3xl font-bold text-slate-900 mb-2">
								{listing.name}
							</h1>
							<div className="flex items-center text-slate-600 mb-4">
								<MapPin className="w-4 h-4 mr-1" />
								<span>
									{listing.address}, {listing.city}, {listing.state}{" "}
									{listing.zipCode}
								</span>
							</div>
						</div>

						{/* Sections */}
						<div className="space-y-12 pb-12">
							{/* Overview */}
							<section className="scroll-mt-32">
								<div className="prose prose-slate max-w-none">
									<p className="text-slate-700 leading-relaxed text-lg">
										{listing.description}
									</p>

									<div className="mt-8">
										<h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
										<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
											<div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
												<p className="text-sm text-slate-500">Target Raise</p>
												<p className="font-semibold text-slate-900">
													$
													{listing.financials?.equityRequired?.toLocaleString() ||
														"0"}
												</p>
											</div>
											<div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
												<p className="text-sm text-slate-500">Cap Rate</p>
												<p className="font-semibold text-green-600">
													{listing.financials?.exitCapRate}%
												</p>
											</div>
											<div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
												<p className="text-sm text-slate-500">Min Investment</p>
												<p className="font-semibold text-slate-900">
													$
													{listing.tokenomics?.minInvestmentTokens &&
													listing.tokenomics?.tokenPrice
														? (
																listing.tokenomics.minInvestmentTokens *
																listing.tokenomics.tokenPrice
															).toLocaleString()
														: "—"}
												</p>
											</div>
											<div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
												<p className="text-sm text-slate-500">Property Type</p>
												<p className="font-semibold text-slate-900">
													{listing.propertyType}
												</p>
											</div>
										</div>
									</div>
								</div>
							</section>

							{/* Financials */}
							<section id="financials" className="scroll-mt-32">
								<h3 className="text-xl font-bold text-slate-900 mb-4">
									Financials
								</h3>
								<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
									{listing.financials ? (
										<ListingFinancials
											financials={listing.financials}
											tokenomics={listing.tokenomics}
										/>
									) : (
										<p className="text-slate-500 italic">
											Financial details not available.
										</p>
									)}
								</div>
							</section>

							{/* Location */}
							<section id="location" className="scroll-mt-32">
								<h3 className="text-xl font-bold text-slate-900 mb-4">
									Location
								</h3>
								<div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
									<ListingLocation
										address={listing.address}
										city={listing.city}
										state={listing.state}
										zipCode={listing.zipCode}
									/>
								</div>
							</section>

							{/* Documents */}
							<section id="documents" className="scroll-mt-32">
								<h3 className="text-xl font-bold text-slate-900 mb-4">
									Documents
								</h3>
								<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
									<ListingDocuments documents={listing.documents} />
								</div>
							</section>

							{/* Sponsor */}
							<section id="sponsor" className="scroll-mt-32">
								<h3 className="text-xl font-bold text-slate-900 mb-4">
									Sponsor
								</h3>
								<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
									<ListingSponsor sponsor={listing.sponsor} />
								</div>
							</section>
						</div>
					</div>

					{/* Right Sidebar: Investment Card */}
					<div className="hidden lg:block w-96 shrink-0 space-y-8 sticky top-24 self-start">
						<InvestmentCard
							listingId={listing.id}
							minInvestment={
								(listing.tokenomics?.minInvestmentTokens || 0) *
								(listing.tokenomics?.tokenPrice || 0)
							}
							targetReturn={listing.financials?.targetIRR || 0}
							holdPeriod={listing.financials?.holdPeriodYears || 0}
							raisedAmount={listing.stats?.currentFunding}
							targetAmount={listing.financials?.equityRequired}
							status={
								listing.status === "ACTIVE"
									? ListingStatus.ACTIVE
									: ListingStatus.APPROVED
							}
							canInvest={canInvest}
						/>

						{/* Quick Stats or Contact */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
							<h3 className="font-medium text-slate-900 mb-4">Need Help?</h3>
							<p className="text-sm text-slate-500 mb-4">
								Contact our investor relations team for more information.
							</p>
							<SupportOptions
								subject={`Inquiry regarding: ${listing.name}`}
								body={`Hi Commertize Team,\n\nI have a question about ${listing.name} (${listing.id}).\n\n`}
								className="w-full"
							/>
						</div>
					</div>
				</div>
			</main>

			{/* Scroll to Top Button */}
			<ScrollToTopButton />
		</div>
	);
}

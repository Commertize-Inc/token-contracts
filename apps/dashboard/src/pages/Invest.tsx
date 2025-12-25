import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Button } from "@commertize/ui";
import { Loader2, ArrowLeft, ShieldCheck, Info } from "lucide-react";
import { Progress } from "@commertize/ui";

export default function Invest() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [listing, setListing] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [investAmount, setInvestAmount] = useState<string>("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchListing = async () => {
			try {
				const data = await api.get(`listings/${id}`);
				setListing(data);
				// Suggest minimum investment or based on token price
				if (data?.tokenomics?.minInvestmentTokens && data?.tokenomics?.tokenPrice) {
					const minUsd =
						data.tokenomics.minInvestmentTokens * data.tokenomics.tokenPrice;
					setInvestAmount(minUsd.toString());
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		if (id) fetchListing();
	}, [id]);

	const handleInvest = async () => {
		if (!listing || !id) return;
		setError(null);
		setSubmitting(true);

		try {
			const amount = parseFloat(investAmount);
			if (isNaN(amount) || amount <= 0) {
				throw new Error("Please enter a valid investment amount.");
			}

			// Call backend intent endpoint
			const res = await api.post("invest/intent", {
				json: {
					propertyId: id,
					amount: amount,
				},
			});

			const result = await res.json();

			if (!res.ok) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				throw new Error((result as any).error || "Investment failed");
			}

			// Redirect to holdings or success page (for now, maybe back to listing with success toast?)
			// Or maybe the backend returns payment instructions we should show?
			// The backend returns: { investmentId, status, paymentInstructions }
			// For MVP, lets alert and go back.
			alert("Investment intent registered! Check your email for payment instructions.");
			navigate("/marketplace");
		} catch (err: any) {
			console.error(err);
			setError(err.message || "An error occurred.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50">
				<Navbar />
				<div className="flex items-center justify-center h-[calc(100vh-64px)]">
					<Loader2 className="w-8 h-8 animate-spin text-[#D4A024]" />
				</div>
			</div>
		);
	}

	if (!listing) return null;

	const { stats, tokenomics } = listing;
	const tokenPrice = tokenomics?.tokenPrice || 0;
	const minInvestment =
		(tokenomics?.minInvestmentTokens || 1) * tokenPrice;

	const percent = stats?.percentageFunded || 0;
	const raised = stats?.currentFunding || 0;
	const target = stats?.targetRaise || 1;
	const remaining = target - raised;

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
			<Navbar />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<button
					onClick={() => navigate(-1)}
					className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Listing
				</button>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column: Offering Details */}
					<div className="lg:col-span-2 space-y-6">
						<div>
							<h1 className="text-3xl font-bold text-slate-900 mb-2">
								Invest in {listing.name}
							</h1>
							<div className="flex items-center gap-2 text-slate-500">
								<span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
									{listing.offeringType?.replace("_", " ") || "REG D"}
								</span>
								<span>•</span>
								<span>{listing.city}, {listing.state}</span>
							</div>
						</div>

						{/* Highlights / Description Summary */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
							<h3 className="font-semibold text-lg mb-4">Investment Highlights</h3>
							<ul className="list-disc list-inside space-y-2 text-slate-600">
								{listing.highlights?.map((h: string, i: number) => (
									<li key={i}>{h}</li>
								)) || (
										<li>Detailed property financials available in data room.</li>
									)}
							</ul>
						</div>

						<div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex gap-4">
							<Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
							<div className="text-sm text-blue-800">
								<p className="font-semibold mb-1">Primary Market Offering</p>
								<p>
									You are subscribing to a new issuance of tokens directly from the issuer.
									Funds will be held in escrow until the minimum funding goal is met.
								</p>
							</div>
						</div>
					</div>

					{/* Right Column: Investment Card */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-24">
							<div className="mb-6">
								<div className="flex justify-between text-sm mb-2">
									<span className="font-medium text-slate-700">Funded</span>
									<span className="font-bold text-slate-900">
										{percent.toFixed(1)}%
									</span>
								</div>
								<Progress value={percent} className="h-2 mb-2" />
								<div className="flex justify-between text-xs text-slate-500">
									<span>${raised.toLocaleString()} raised</span>
									<span>Goal: ${target.toLocaleString()}</span>
								</div>
							</div>

							<div className="space-y-4 mb-6">
								<div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
									<p className="text-xs text-slate-500 uppercase font-semibold mb-1">
										Token Price
									</p>
									<p className="text-2xl font-mono font-bold text-slate-900">
										${tokenPrice.toFixed(2)}
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1.5">
										Investment Amount (USDC)
									</label>
									<input
										type="number"
										value={investAmount}
										onChange={(e) => setInvestAmount(e.target.value)}
										className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A024] focus:border-transparent font-mono"
										placeholder={`Min: $${minInvestment}`}
										min={minInvestment}
										max={remaining}
									/>
									<p className="text-xs text-slate-500 mt-1">
										Minimum: ${minInvestment.toLocaleString()} • Max: ${remaining.toLocaleString()}
									</p>
								</div>
							</div>

							{error && (
								<div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
									{error}
								</div>
							)}

							<Button
								onClick={handleInvest}
								disabled={submitting || remaining <= 0}
								className="w-full py-6 text-lg font-bold bg-[#D4A024] hover:bg-[#B8860B] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{submitting ? (
									<span className="flex items-center gap-2">
										<Loader2 className="w-5 h-5 animate-spin" /> Processing...
									</span>
								) : remaining <= 0 ? (
									"Sold Out"
								) : (
									"Invest Now"
								)}
							</Button>

							<div className="mt-6 pt-6 border-t border-slate-100">
								<div className="flex items-center gap-2 justify-center text-xs text-slate-500">
									<ShieldCheck className="w-4 h-4 text-green-600" />
									<span>Secure Transaction via Smart Contract</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

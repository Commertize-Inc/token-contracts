import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Button } from "@commertize/ui";
import { Loader2, ArrowLeft, TrendingUp } from "lucide-react";

// Mock Data Generators
const generateOrderBook = (
	basePrice: number,
	count: number,
	type: "ask" | "bid"
) => {
	const orders = [];
	let currentPrice = basePrice;
	for (let i = 0; i < count; i++) {
		const priceChange = Math.random() * 0.05;
		currentPrice =
			type === "ask" ? currentPrice + priceChange : currentPrice - priceChange;
		orders.push({
			price: currentPrice,
			amount: Math.floor(Math.random() * 500) + 10,
			total: 0, // Calculated later
		});
	}
	return orders.sort((a, b) =>
		type === "ask" ? a.price - b.price : b.price - a.price
	);
};

export default function Invest() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [listing, setListing] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	// trading state
	const [orderType, setOrderType] = useState<"market" | "limit">("market");
	const [side, setSide] = useState<"buy" | "sell">("buy");
	const [amount, setAmount] = useState<string>("");
	const [limitPrice, setLimitPrice] = useState<string>("");

	useEffect(() => {
		// Mock fetching listing (or real fetch if API is ready)
		const fetchListing = async () => {
			try {
				const data = await api.get(`listings/${id}`);
				setListing(data);
				// Initialize limit price with base price
				if (data?.financials?.tokenPrice) {
					setLimitPrice(data.financials.tokenPrice.toString());
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		if (id) fetchListing();
	}, [id]);

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

	const currentPrice = listing.financials?.tokenPrice || 50.0;
	const asks = generateOrderBook(currentPrice, 10, "ask");
	const bids = generateOrderBook(currentPrice, 10, "bid");

	const totalCost =
		orderType === "market"
			? parseFloat(amount || "0") * currentPrice
			: parseFloat(amount || "0") * parseFloat(limitPrice || "0");

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
			<Navbar />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
				{/* Top Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<button
							onClick={() => navigate(-1)}
							className="text-slate-500 hover:text-slate-900 transition-colors"
						>
							<ArrowLeft className="w-6 h-6" />
						</button>
						<div>
							<h1 className="text-2xl font-bold text-slate-900">
								{listing.name}
							</h1>
							<div className="flex items-center gap-2 text-sm text-slate-500">
								<span>{listing.ticker || "TCKN"}</span>
								<span>•</span>
								<span>Fractional Real Estate</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-8 text-right">
						<div>
							<p className="text-sm text-slate-500">Last Price</p>
							<p className="text-2xl font-mono font-medium">
								${currentPrice.toFixed(2)}
							</p>
						</div>
						<div>
							<p className="text-sm text-slate-500">24h Change</p>
							<p className="text-lg font-mono font-medium text-green-600 flex items-center justify-end gap-1">
								<TrendingUp className="w-4 h-4" /> +2.45%
							</p>
						</div>
						<div>
							<p className="text-sm text-slate-500">24h Volume</p>
							<p className="text-lg font-mono font-medium text-slate-700">
								$124.5k
							</p>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Left Column: Order Book (8 cols) */}
					<div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
						<div className="p-4 border-b border-slate-100 flex justify-between items-center">
							<h2 className="font-semibold text-lg">Order Book</h2>
							<div className="text-xs text-slate-400 flex items-center gap-1">
								<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
								Live Data
							</div>
						</div>

						<div className="flex-1 overflow-y-auto font-mono text-sm relative">
							{/* Header */}
							<div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-50 sticky top-0 z-10">
								<div>Price (USD)</div>
								<div className="text-right">Amount (Tokens)</div>
								<div className="text-right">Total (USD)</div>
							</div>

							{/* Asks (Sellers) - Reverse order typically displayed from high to low going UP from spread, but for simple list we list them normally */}
							<div className="flex flex-col-reverse justify-end pb-2">
								{asks.map((order, i) => (
									<div
										key={`ask-${i}`}
										className="grid grid-cols-3 px-4 py-1 hover:bg-red-50 cursor-pointer transition-colors group"
									>
										<div className="text-red-500 font-medium group-hover:font-bold">
											{order.price.toFixed(2)}
										</div>
										<div className="text-right text-slate-600">
											{order.amount}
										</div>
										<div className="text-right text-slate-400">
											{(order.price * order.amount).toFixed(2)}
										</div>
									</div>
								))}
							</div>

							{/* Spread / Current Price Indicator */}
							<div className="sticky py-2 px-4 bg-slate-50 border-y border-slate-100 flex justify-between items-center my-1 z-10">
								<span className="text-lg font-bold text-slate-800">
									${currentPrice.toFixed(2)}
								</span>
								<span className="text-xs text-slate-500">Spread: 0.15%</span>
							</div>

							{/* Bids (Buyers) */}
							<div className="pt-2">
								{bids.map((order, i) => (
									<div
										key={`bid-${i}`}
										className="grid grid-cols-3 px-4 py-1 hover:bg-green-50 cursor-pointer transition-colors group"
									>
										<div className="text-green-600 font-medium group-hover:font-bold">
											{order.price.toFixed(2)}
										</div>
										<div className="text-right text-slate-600">
											{order.amount}
										</div>
										<div className="text-right text-slate-400">
											{(order.price * order.amount).toFixed(2)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Right Column: Trading Interface (4 cols) */}
					<div className="lg:col-span-4 space-y-6">
						{/* Trade Panel */}
						<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
							<h2 className="font-semibold text-xl mb-6">
								Trade {listing.ticker}
							</h2>

							{/* Buy / Sell Tabs */}
							<div className="grid grid-cols-2 bg-slate-100 p-1 rounded-lg mb-6">
								<button
									onClick={() => setSide("buy")}
									className={`py-2 text-sm font-semibold rounded-md transition-all ${
										side === "buy"
											? "bg-green-600 text-white shadow-sm"
											: "text-slate-500 hover:text-slate-700"
									}`}
								>
									Buy
								</button>
								<button
									onClick={() => setSide("sell")}
									className={`py-2 text-sm font-semibold rounded-md transition-all ${
										side === "sell"
											? "bg-red-500 text-white shadow-sm"
											: "text-slate-500 hover:text-slate-700"
									}`}
								>
									Sell
								</button>
							</div>

							{/* Order Type Toggle */}
							<div className="flex items-center gap-4 mb-6 text-sm">
								<button
									onClick={() => setOrderType("market")}
									className={`flex items-center gap-1 pb-1 border-b-2 transition-colors ${
										orderType === "market"
											? "border-[#D4A024] text-slate-900 font-medium"
											: "border-transparent text-slate-500"
									}`}
								>
									Market
								</button>
								<button
									onClick={() => setOrderType("limit")}
									className={`flex items-center gap-1 pb-1 border-b-2 transition-colors ${
										orderType === "limit"
											? "border-[#D4A024] text-slate-900 font-medium"
											: "border-transparent text-slate-500"
									}`}
								>
									Limit
								</button>
							</div>

							{/* Inputs */}
							<div className="space-y-4 mb-6">
								<div>
									<label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">
										Limit Price (USD)
									</label>
									<div className="relative">
										<input
											type="number"
											value={
												orderType === "market" ? "Market Price" : limitPrice
											}
											disabled={orderType === "market"}
											onChange={(e) => setLimitPrice(e.target.value)}
											className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50 focus:border-[#D4A024] disabled:bg-slate-100 disabled:text-slate-400 font-mono"
											placeholder="0.00"
										/>
										<div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
											$
										</div>
									</div>
								</div>
								<div>
									<label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase flex justify-between">
										<span>Amount (Shares)</span>
										<span className="text-[#D4A024] cursor-pointer">Max</span>
									</label>
									<input
										type="number"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50 focus:border-[#D4A024] font-mono"
										placeholder="0"
									/>
								</div>
							</div>

							{/* Summary */}
							<div className="bg-slate-50 rounded-lg p-4 space-y-2 mb-6 border border-slate-100">
								<div className="flex justify-between text-sm text-slate-500">
									<span>Subtotal</span>
									<span className="font-mono">${totalCost.toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-sm text-slate-500">
									<span>Fees (0.5%)</span>
									<span className="font-mono">
										${(totalCost * 0.005).toFixed(2)}
									</span>
								</div>
								<div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
									<span>Total Cost</span>
									<span className="font-mono">
										${(totalCost * 1.005).toFixed(2)}
									</span>
								</div>
							</div>

							{/* Action Button */}
							<Button
								className={`w-full py-6 text-lg font-bold shadow-lg shadow-orange-500/20 ${
									side === "sell"
										? "bg-red-500 hover:bg-red-600"
										: "bg-[#D4A024] hover:bg-[#B8860B]"
								}`}
							>
								{side === "buy" ? "Place Buy Order" : "Place Sell Order"}
							</Button>

							<p className="text-center text-xs text-slate-400 mt-4">
								By placing an order, you agree to the{" "}
								<span className="underline cursor-pointer">
									Terms of Service
								</span>
								.
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

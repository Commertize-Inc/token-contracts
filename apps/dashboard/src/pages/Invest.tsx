import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button, Alert, Progress } from "@commertize/ui";
import { Loader2, ArrowLeft, ShieldCheck, Info } from "lucide-react";
import { usePostHog } from "@commertize/utils/client";
import {
	USDC_ADDRESS,
	HEDERA_TESTNET_CHAIN_ID,
	HEDERA_TESTNET_RPC,
} from "@commertize/nexus";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
	createWalletClient,
	createPublicClient,
	custom,
	http,
	parseAbi,
	parseUnits,
	parseSignature,
} from "viem";

export default function Invest() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const posthog = usePostHog();
	const { getAccessToken } = usePrivy();
	const { wallets } = useWallets();

	const [listing, setListing] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [tokenCount, setTokenCount] = useState<string>("");
	const [currency, setCurrency] = useState<string>("USDC");
	const [agreedToTerms, setAgreedToTerms] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [investmentId, setInvestmentId] = useState<string | null>(null);
	const [paymentAddress, setPaymentAddress] = useState<string | null>(null);
	const [step, setStep] = useState<"intent" | "payment">("intent");
	const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
	const [paymentFlow, setPaymentFlow] = useState<
		"permit" | "approve" | "direct_transfer"
	>("permit");

	// Select first wallet by default
	useEffect(() => {
		if (wallets.length > 0 && !selectedWallet) {
			setSelectedWallet(wallets[0].address);
		}
	}, [wallets, selectedWallet]);

	const [alertState, setAlertState] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		type: "success" | "error" | "info" | "warning";
	}>({
		isOpen: false,
		title: "",
		message: "",
		type: "info",
	});

	useEffect(() => {
		const fetchListing = async () => {
			try {
				const data = await api.get(`listings/${id}`);
				setListing(data);
				// Suggest minimum investment
				if (
					data?.tokenomics?.minInvestmentTokens &&
					data?.tokenomics?.tokenPrice
				) {
					const minTokens = data.tokenomics.minInvestmentTokens;
					setTokenCount(minTokens.toString());
				}
				// Set default currency from listing configuration if available
				if (data.fundingCurrency) {
					setCurrency(data.fundingCurrency);
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		if (id) fetchListing();
	}, [id]);

	// New State for Display Price
	const [unitPrice, setUnitPrice] = useState<number>(0);
	const [unitCurrency, setUnitCurrency] = useState<string>("USD");

	// Fetch Unit Price Quote when currency changes
	useEffect(() => {
		const fetchQuote = async () => {
			if (!listing?.tokenomics?.tokenPrice) return;
			const usdPrice = listing.tokenomics.tokenPrice;

			if (currency === "USD" || currency === "USDC" || currency === "CREUSD") {
				setUnitPrice(usdPrice);
				setUnitCurrency("USD");
				return;
			}

			// If HBAR or other, get quote for 1 unit
			try {
				const quoteRes: any = await api.post(
					"invest/quote",
					{
						amount: usdPrice.toString(),
						currency: currency,
					},
					await getAccessToken()
				);

				setUnitPrice(parseFloat(quoteRes.cryptoAmount));
				setUnitCurrency(currency);
			} catch (err) {
				console.error("Failed to fetch unit quote", err);
				// Fallback
				setUnitPrice(usdPrice);
				setUnitCurrency("USD");
			}
		};

		if (listing && currency) {
			fetchQuote();
		}
	}, [listing, currency, getAccessToken]);

	useEffect(() => {
		if (listing && id && posthog) {
			posthog.capture("investment_started", {
				listing_id: id,
				listing_name: listing.name,
			});
		}
	}, [listing, id, posthog]);

	const handleInvest = async () => {
		if (!listing || !id) return;
		setError(null);
		setSubmitting(true);

		try {
			const count = parseFloat(tokenCount);
			if (isNaN(count) || count <= 0) {
				throw new Error("Please enter a valid number of tokens.");
			}

			if (!agreedToTerms) {
				throw new Error("You must agree to the terms to proceed.");
			}

			// Calculate Amount in USD
			const amount = count * (listing.tokenomics?.tokenPrice || 0);

			// Get auth token
			const token = await getAccessToken();

			// Call backend intent endpoint
			const res: any = await api.post(
				"invest/intent",
				{
					propertyId: id,
					amount: amount,
					currency: currency,
					agreedToTerms: true,
				},
				token
			);

			// Intent registered, immediately move to payment step
			setInvestmentId(res.investmentId);
			setPaymentAddress(res.paymentInstructions?.address);

			// Set payment flow from backend or default to permit
			if (res.paymentFlow) {
				setPaymentFlow(res.paymentFlow);
			}

			setStep("payment");

			// Chain payment automatically
			await handlePayment(res.investmentId, res.paymentInstructions?.address);
		} catch (err: any) {
			console.error(err);
			setError(err.message || "An error occurred.");
			setSubmitting(false);
		}
	};

	const handlePayment = async (
		overrideInvestmentId?: string,
		overridePaymentAddress?: string
	) => {
		const targetInvId = overrideInvestmentId || investmentId;
		const targetPaymentAddr = overridePaymentAddress || paymentAddress;

		if (!targetInvId || !selectedWallet) {
			setError("Please select a wallet.");
			return;
		}
		setError(null);

		// Quote Logic for HBAR
		let finalAmount = "0";

		const count = parseFloat(tokenCount);
		const usdAmount = count * (listing?.tokenomics?.tokenPrice || 0);

		if (currency === "HBAR") {
			try {
				const quoteRes: any = await api.post(
					"invest/quote",
					{
						amount: usdAmount.toString(),
						currency: "HBAR",
					},
					await getAccessToken()
				);
				// Quote returns { cryptoAmount, rate }
				finalAmount = quoteRes.cryptoAmount.toString();
				console.log(
					`Quote: ${usdAmount} USD = ${finalAmount} HBAR (Rate: ${quoteRes.rate})`
				);
			} catch (qErr: any) {
				setError("Failed to get price quote.");
				setSubmitting(false);
				return;
			}
		}

		setSubmitting(true);

		try {
			if (selectedWallet === "balance") {
				setError(
					"Spend Balance integration is currently in preview. Please use a crypto wallet."
				);
				setSubmitting(false);
				return;
			}
			const wallet = wallets.find((w) => w.address === selectedWallet);
			if (!wallet) throw new Error("Selected wallet not found.");

			// Switch to Hedera Testnet
			await wallet.switchChain(HEDERA_TESTNET_CHAIN_ID);

			const provider = await wallet.getEthereumProvider();
			const walletClient = createWalletClient({
				account: wallet.address as `0x${string}`,
				chain: {
					id: HEDERA_TESTNET_CHAIN_ID,
					name: "Hedera Testnet",
					network: "hedera-testnet",
					nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
					rpcUrls: { default: { http: [HEDERA_TESTNET_RPC] } },
				},
				transport: custom(provider),
			});

			const publicClient = createPublicClient({
				chain: {
					id: HEDERA_TESTNET_CHAIN_ID,
					name: "Hedera Testnet",
					nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
					rpcUrls: { default: { http: [HEDERA_TESTNET_RPC] } },
				},
				transport: http(),
			});

			let signaturePayload: any = null;
			let txHash: string | null = null;

			// Handle different Currencies
			if (currency === "HBAR") {
				// NATIVE HBAR TRANSFER
				// Use quoted finalAmount
				const amountVal = parseFloat(finalAmount);
				const value = parseUnits(amountVal.toString(), 18); // HBAR 18 decimals

				console.log(`Sending ${amountVal} HBAR to ${targetPaymentAddr}`);
				const hash = await walletClient.sendTransaction({
					to: targetPaymentAddr as `0x${string}`,
					value: value,
				});
				console.log("HBAR Transaction Hash:", hash);
				await publicClient.waitForTransactionReceipt({ hash });
				txHash = hash;
			} else {
				// ERC20 TOKENS (USDC or CREUSD)
				// Determine Address based on Currency
				// If USDC -> Official Address
				// If CREUSD -> Platform Address (which is currently aliased to USDC_ADDRESS in index.ts for testnet MVP?)
				// Ideally nexus exports both.
				// For now, if currency is CREUSD, we use the `nexus` export. If USDC, use Official.

				let tokenAddress = USDC_ADDRESS; // Default to the one configured in env
				if (currency === "USDC") {
					tokenAddress = "0x0000000000000000000000000000000000068cda"; // Official Testnet USDC
				}
				// Else CREUSD uses the one from Enviroment/Deployment.

				// Else CREUSD uses the one from Enviroment/Deployment.

				const amount = usdAmount; // Calculated above
				const value = parseUnits(amount.toString(), 6); // USDC 6 decimals
				const spenderAddress =
					targetPaymentAddr || "0xBEeFD60707328B02005080927D4C82A2E68307D2";

				if (paymentFlow === "approve") {
					// STANDARD APPROVE FLOW (Sponsored)
					// User approves, Backend pulls via transferFrom
					const { request } = await publicClient.simulateContract({
						address: tokenAddress as `0x${string}`,
						abi: parseAbi([
							"function approve(address spender, uint256 amount) public returns (bool)",
						]),
						functionName: "approve",
						args: [spenderAddress as `0x${string}`, value],
						account: wallet.address as `0x${string}`,
					});

					const hash = await walletClient.writeContract(request);
					console.log("Approval Transaction Hash:", hash);
					await publicClient.waitForTransactionReceipt({ hash });
				} else if (paymentFlow === "direct_transfer") {
					// DIRECT TRANSFER (Unsponsored)
					// User pushes funds to backend wallet
					const { request: transferReq } = await publicClient.simulateContract({
						address: tokenAddress as `0x${string}`,
						abi: parseAbi([
							"function transfer(address to, uint256 amount) public returns (bool)",
						]),
						functionName: "transfer",
						args: [spenderAddress as `0x${string}`, value],
						account: wallet.address as `0x${string}`,
					});

					const tHash = await walletClient.writeContract(transferReq);
					console.log("Transfer Transaction Hash:", tHash);
					await publicClient.waitForTransactionReceipt({ hash: tHash });
					txHash = tHash;
				} else {
					// GASLESS PERMIT FLOW (For CREUSD or supported tokens)
					const deadline = Math.floor(Date.now() / 1000) + 3600;

					const nonces = await publicClient.readContract({
						address: tokenAddress as `0x${string}`,
						abi: parseAbi(["function nonces(address) view returns (uint256)"]),
						functionName: "nonces",
						args: [wallet.address as `0x${string}`],
					});

					const name = await publicClient.readContract({
						address: tokenAddress as `0x${string}`,
						abi: parseAbi(["function name() view returns (string)"]),
						functionName: "name",
					});

					const signature = await walletClient.signTypedData({
						domain: {
							name: name as string,
							version: "1",
							chainId: 296,
							verifyingContract: tokenAddress as `0x${string}`,
						},
						types: {
							Permit: [
								{ name: "owner", type: "address" },
								{ name: "spender", type: "address" },
								{ name: "value", type: "uint256" },
								{ name: "nonce", type: "uint256" },
								{ name: "deadline", type: "uint256" },
							],
						},
						primaryType: "Permit",
						message: {
							owner: wallet.address as `0x${string}`,
							spender: spenderAddress as `0x${string}`,
							value: value,
							nonce: nonces as bigint,
							deadline: BigInt(deadline),
						},
					});

					const sig = parseSignature(signature);
					signaturePayload = {
						deadline,
						v: Number(sig.v),
						r: sig.r,
						s: sig.s,
					};
				}
			}

			const token = await getAccessToken();

			// Construct body based on flow
			const confirmBody: any = { paymentFlow };
			if (signaturePayload) confirmBody.permit = signaturePayload;
			if (txHash) confirmBody.txHash = txHash;

			await api.post(`invest/${targetInvId}/confirm`, confirmBody, token);

			setAlertState({
				isOpen: true,
				title: "Investment Successful",
				message: `Tokens have been minted to your wallet!`,
				type: "success",
			});

			if (posthog) {
				posthog.capture("investment_completed", {
					listing_id: id,
					amount: usdAmount,
					tokens: count,
					currency: currency,
				});
			}
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Payment failed.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center h-[calc(100vh-64px)]">
					<Loader2 className="w-8 h-8 animate-spin text-[#D4A024]" />
				</div>
			</DashboardLayout>
		);
	}

	if (!listing) return null;

	const { stats, tokenomics } = listing;
	const tokenPrice = tokenomics?.tokenPrice || 0;

	const percent = stats?.percentageFunded || 0;
	const raised = stats?.currentFunding || 0;
	const target = stats?.targetRaise || 1;
	const remaining = target - raised;

	return (
		<DashboardLayout className="text-slate-900 font-sans">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<button
					onClick={() => navigate(-1)}
					className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Listing
				</button>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
								<span>
									{listing.city}, {listing.state}
								</span>
							</div>
						</div>

						<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
							<h3 className="font-semibold text-lg mb-4">
								Investment Highlights
							</h3>
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
									You are subscribing to a new issuance of tokens directly from
									the issuer. Funds will be held in escrow until the minimum
									funding goal is met.
								</p>
							</div>
						</div>
					</div>

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
										{unitCurrency !== "USD"
											? `${unitPrice} ${unitCurrency}`
											: `$${unitPrice.toFixed(2)}`}
									</p>
									{unitCurrency !== "USD" && (
										<p className="text-sm text-slate-500">
											(~${tokenPrice.toFixed(2)} USD)
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1.5">
										Payment Method
									</label>
									{listing.fundingCurrency ? (
										<div className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed">
											{listing.fundingCurrency === "USDC"
												? "USDC (Official)"
												: listing.fundingCurrency === "CREUSD"
													? "CREUSD (Platform)"
													: "Hedera (Native HBAR)"}{" "}
											(Required)
										</div>
									) : (
										<select
											value={currency}
											onChange={(e) => setCurrency(e.target.value)}
											disabled={step === "payment"}
											className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
										>
											<option value="USDC">USDC (Official)</option>
											<option value="CREUSD">CREUSD (Platform)</option>
											<option value="HBAR">Hedera (Native HBAR)</option>
										</select>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1.5">
										Number of Tokens
									</label>
									<div className="relative">
										<input
											type="number"
											value={tokenCount}
											onChange={(e) => setTokenCount(e.target.value)}
											className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A024] focus:border-transparent font-mono"
											placeholder={`Min: ${listing.tokenomics.minInvestmentTokens}`}
											min={listing.tokenomics.minInvestmentTokens}
											max={remaining / tokenPrice}
											disabled={step === "payment"}
										/>
										<div className="absolute right-3 top-3 text-xs text-slate-400">
											TOKENS
										</div>
									</div>
									<div className="mt-2 p-3 bg-slate-100 rounded-lg flex flex-col gap-1">
										<div className="flex justify-between items-center">
											<span className="text-sm text-slate-600">
												Total Cost:
											</span>
											<span className="text-lg font-bold text-slate-900">
												{unitCurrency !== "USD"
													? `${(parseInt(tokenCount || "0") * unitPrice).toFixed(4)} ${unitCurrency}`
													: `$${(parseInt(tokenCount || "0") * unitPrice).toLocaleString()}`}
											</span>
										</div>
										{unitCurrency !== "USD" && (
											<div className="flex justify-end text-xs text-slate-500">
												(~$
												{(
													parseInt(tokenCount || "0") * tokenPrice
												).toLocaleString()}{" "}
												USD)
											</div>
										)}
									</div>
									<p className="text-xs text-slate-500 mt-1">
										1 Token ={" "}
										{unitCurrency !== "USD"
											? `${unitPrice} ${unitCurrency}`
											: `$${tokenPrice}`}{" "}
										• Min: {listing.tokenomics.minInvestmentTokens} Tokens
									</p>
								</div>
							</div>

							<div className="flex items-start gap-2 mb-6">
								<input
									type="checkbox"
									id="agree-terms"
									checked={agreedToTerms}
									onChange={(e) => setAgreedToTerms(e.target.checked)}
									disabled={step === "payment"}
									className="mt-1 rounded border-slate-300 text-[#D4A024] focus:ring-[#D4A024]"
								/>
								<label htmlFor="agree-terms" className="text-sm text-slate-600">
									I agree to the{" "}
									<a href="#" className="underline hover:text-slate-900">
										Subscription Agreement
									</a>{" "}
									and{" "}
									<a href="#" className="underline hover:text-slate-900">
										Terms of Service
									</a>
									. I understand this investment involves risk.
								</label>
							</div>

							{step === "payment" && (
								<div className="mb-6">
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Select Payment Source
									</label>

									<div className="space-y-3">
										{/* Account Balance Option */}
										<div
											onClick={() => setSelectedWallet("balance")}
											className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
												selectedWallet === "balance"
													? "border-[#D4A024] bg-[#D4A024]/5"
													: "border-slate-200 hover:border-[#D4A024]/50"
											}`}
										>
											<div className="flex items-center gap-3">
												<div className="bg-green-100 p-2 rounded-full">
													<ShieldCheck className="w-4 h-4 text-green-600" />
												</div>
												<div>
													<div className="text-sm font-semibold text-slate-900">
														Spend Balance
													</div>
													<div className="text-xs text-slate-500">
														Available: $0.00 (Via Stripe)
													</div>
												</div>
											</div>
											{selectedWallet === "balance" && (
												<div className="w-2 h-2 rounded-full bg-[#D4A024]" />
											)}
										</div>

										<div className="text-xs text-slate-400 font-semibold uppercase px-1">
											Crypto Wallets
										</div>

										{wallets.length === 0 ? (
											<p className="text-sm text-slate-500 italic px-2">
												No crypto wallets connected.
											</p>
										) : (
											wallets.map((w) => (
												<div
													key={w.address}
													onClick={() => setSelectedWallet(w.address)}
													className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
														selectedWallet === w.address
															? "border-[#D4A024] bg-[#D4A024]/5"
															: "border-slate-200 hover:border-[#D4A024]/50"
													}`}
												>
													<div className="flex items-center gap-3">
														{/* Icon based on wallet type? For now generic */}
														<div className="bg-slate-100 p-2 rounded-full">
															<Loader2 className="w-4 h-4 text-slate-600" />
														</div>
														<div>
															<div className="text-sm font-semibold text-slate-900">
																{w.meta.name || "Wallet"}
															</div>
															<div className="text-xs font-mono text-slate-500">
																{w.address.slice(0, 6)}...{w.address.slice(-4)}
															</div>
														</div>
													</div>
													{selectedWallet === w.address && (
														<div className="w-2 h-2 rounded-full bg-[#D4A024]" />
													)}
												</div>
											))
										)}
									</div>
								</div>
							)}

							{error && (
								<div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex justify-between items-center gap-2">
									<span>{error}</span>
									{step === "payment" && (
										<button
											onClick={() => {
												setError(null);
												setStep("intent");
												setInvestmentId(null);
											}}
											className="text-xs font-semibold underline hover:text-red-900 whitespace-nowrap"
										>
											Edit / Retry
										</button>
									)}
								</div>
							)}

							<Button
								onClick={
									step === "intent" ? handleInvest : () => handlePayment()
								}
								disabled={
									submitting ||
									remaining <= 0 ||
									(step === "payment" && !selectedWallet)
								}
								className="w-full py-6 text-lg font-bold bg-[#D4A024] hover:bg-[#B8860B] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{submitting ? (
									<span className="flex items-center gap-2">
										<Loader2 className="w-5 h-5 animate-spin" />{" "}
										{step === "intent"
											? "Registering..."
											: "Processing Payment..."}
									</span>
								) : remaining <= 0 ? (
									"Sold Out"
								) : step === "intent" ? (
									error ? (
										"Try Again"
									) : (
										"Proceed to Payment"
									)
								) : (
									"Confirm Payment"
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
			</div>

			<Alert
				isOpen={alertState.isOpen}
				onClose={() => {
					setAlertState((prev) => ({ ...prev, isOpen: false }));
					if (alertState.type === "success") {
						navigate("/marketplace");
					}
				}}
				title={alertState.title}
				message={alertState.message}
				type={alertState.type}
			/>
		</DashboardLayout>
	);
}

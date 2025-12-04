"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Button, Chip } from "@commertize/ui";
import { motion } from "framer-motion";
import {
	ShieldCheck,
	Wallet,
	CreditCard,
	Building2,
	CheckCircle,
	XCircle,
	Loader2,
	ExternalLink,
	Plus,
} from "lucide-react";
import {
	usePlaidLink,
	PlaidLinkOptions,
	PlaidLinkOnSuccess,
} from "react-plaid-link";
import { usePrivy } from "@privy-io/react-auth";

interface BankAccount {
	id: string;
	institutionName: string;
	accountName: string;
	accountMask: string;
	accountType: string;
	isPrimary: boolean;
	status: string;
	isStripeLinked: boolean;
}

interface ProfileData {
	kycStatus: boolean;
	kycCompletedAt?: string;
	walletAddress?: string;
	email?: string;
	privyId: string;
	stripeCustomerId?: string;
	bankAccounts: BankAccount[];
}

export default function ProfilePage() {
	const { user } = usePrivy();
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [linkToken, setLinkToken] = useState<string | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

	const fetchProfile = async () => {
		try {
			const response = await fetch("/api/profile");
			const data = await response.json();
			setProfile(data);
		} catch (error) {
			console.error("Error fetching profile:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	// Create Link Token for Auth flow
	const createLinkToken = useCallback(async () => {
		if (!user) return;
		try {
			const response = await fetch("/api/plaid/create_link_token?flow=auth", {
				method: "POST",
			});
			const data = await response.json();
			setLinkToken(data.link_token);
		} catch (error) {
			console.error("Error creating link token:", error);
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			createLinkToken();
		}
	}, [user, createLinkToken]);

	const onSuccess = useCallback<PlaidLinkOnSuccess>(
		async (public_token, metadata) => {
			setIsConnecting(true);
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
					// Refresh profile to show new account
					await fetchProfile();
					// Get a fresh link token for next time
					createLinkToken();
				} else {
					console.error("Failed to link bank account:", data);
				}
			} catch (error) {
				console.error("Error linking bank account:", error);
			} finally {
				setIsConnecting(false);
			}
		},
		[createLinkToken]
	);

	const handleDisconnect = async (accountId: string) => {
		if (!confirm("Are you sure you want to disconnect this account?")) return;

		setDisconnectingId(accountId);
		try {
			const response = await fetch(`/api/plaid/accounts/${accountId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				await fetchProfile();
			} else {
				console.error("Failed to disconnect account");
			}
		} catch (error) {
			console.error("Error disconnecting account:", error);
		} finally {
			setDisconnectingId(null);
		}
	};

	const handleTestCharge = async (accountId: string) => {
		if (!confirm("This will simulate a $1.00 charge. Proceed?")) return;

		try {
			const response = await fetch("/api/stripe/test-charge", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ accountId, type: "charge", amount: 100 }),
			});

			const data = await response.json();
			if (response.ok) {
				alert("Test charge successful! Check Stripe dashboard.");
			} else {
				alert(`Charge failed: ${data.error}`);
			}
		} catch (error) {
			console.error("Test charge error:", error);
			alert("Failed to execute test charge");
		}
	};

	const config: PlaidLinkOptions = {
		token: linkToken,
		onSuccess,
	};

	const { open, ready } = usePlaidLink(config);

	// Landing page inspired styles
	const cardStyle = {
		background: "white",
		border: "1px solid #e5e7eb", // lighter border
		borderRadius: "1rem", // rounded-2xl
		boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)", // very subtle shadow
	};

	const iconContainerStyle = {
		background: "rgba(212, 160, 36, 0.1)", // Gold with low opacity
		color: "#D4A024", // Gold color
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#fafafa]">
				<Navbar />
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-8 h-8 animate-spin text-[#D4A024]" />
					</div>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-[#fafafa]">
				<Navbar />
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="text-center py-20">
						<p className="text-gray-500 font-light text-lg">Failed to load profile</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#fafafa]">
			<Navbar />

			<main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="mb-8 text-center"
				>
					<h1 className="text-3xl sm:text-4xl font-light text-gray-900 mb-2 tracking-tight">
						Your <span className="text-[#D4A024]">Profile</span>
					</h1>
					<p className="text-base text-gray-500 font-light max-w-2xl mx-auto">
						Manage your account connections, verification status, and payment methods.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Identity Verification */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
						className="p-6 transition-all duration-300 hover:shadow-lg hover:border-[#D4A024]/30 h-full flex flex-col justify-center"
						style={cardStyle}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4 min-w-0">
								<div
									className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
									style={iconContainerStyle}
								>
									<ShieldCheck className="w-6 h-6" />
								</div>
								<div className="min-w-0">
									<h2 className="text-lg font-normal text-gray-900 mb-0.5 truncate">
										Identity Verification
									</h2>
									<p className="text-sm text-gray-500 font-light mb-1 truncate">
										KYC verification status
									</p>
									{profile.kycCompletedAt && (
										<p className="text-xs text-gray-400 font-light truncate">
											Verified on{" "}
											{new Date(profile.kycCompletedAt).toLocaleDateString()}
										</p>
									)}
								</div>
							</div>
							<div className="flex-shrink-0 ml-4">
								<Chip
									active={profile.kycStatus}
									className={
										profile.kycStatus
											? "!bg-green-100 !text-green-800 !border-green-200"
											: "!bg-red-50 !text-red-600 !border-red-100"
									}
								>
									{profile.kycStatus ? (
										<span className="flex items-center font-medium">
											<CheckCircle className="w-3 h-3 mr-1.5" />
											Verified
										</span>
									) : (
										<span className="flex items-center font-medium">
											<XCircle className="w-3 h-3 mr-1.5" />
											Not Verified
										</span>
									)}
								</Chip>
							</div>
						</div>
					</motion.div>

					{/* Connected Wallet */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
						className="p-6 transition-all duration-300 hover:shadow-lg hover:border-[#D4A024]/30 h-full flex flex-col"
						style={cardStyle}
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center space-x-4 min-w-0">
								<div
									className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
									style={iconContainerStyle}
								>
									<Wallet className="w-6 h-6" />
								</div>
								<div className="min-w-0">
									<h2 className="text-lg font-normal text-gray-900 mb-0.5 truncate">
										Connected Wallet
									</h2>
									<p className="text-sm text-gray-500 font-light truncate">
										Your Privy-managed wallet
									</p>
								</div>
							</div>
						</div>

						<div className="mt-auto">
							{/* Privy DID */}
							<div className="mb-3">
								<p className="text-xs text-gray-400 font-light mb-1">Privy ID</p>
								<div className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-between">
									<span className="text-xs font-mono text-gray-600 truncate mr-2 max-w-[180px]">
										{profile.privyId}
									</span>
									<Button
										variant="text"
										className="!p-0 !h-auto text-[#D4A024] hover:text-[#B8881C] font-normal flex-shrink-0 text-xs"
										onClick={() => {
											navigator.clipboard.writeText(profile.privyId);
										}}
									>
										Copy
									</Button>
								</div>
							</div>

							{/* Wallet Address */}
							<div className="mb-3">
								<p className="text-xs text-gray-400 font-light mb-1">Wallet Address</p>
								{profile.walletAddress ? (
									<div className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-between">
										<span className="text-xs font-mono text-gray-600 truncate mr-2 max-w-[180px]">
											{profile.walletAddress}
										</span>
										<Button
											variant="text"
											className="!p-0 !h-auto text-[#D4A024] hover:text-[#B8881C] font-normal flex-shrink-0 text-xs"
											onClick={() => {
												navigator.clipboard.writeText(profile.walletAddress || "");
											}}
										>
											Copy
										</Button>
									</div>
								) : (
									<p className="text-xs text-gray-400 font-light">No wallet connected</p>
								)}
							</div>
							{/* Email */}
							{profile.email && (
								<div>
									<p className="text-xs text-gray-400 font-light mb-1">Email</p>
									<div className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-between">
										<span className="text-xs text-gray-600 truncate mr-2">
											{profile.email}
										</span>
									</div>
								</div>
							)}
						</div>
					</motion.div>

					{/* Bank Accounts */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
						className="p-6 transition-all duration-300 hover:shadow-lg hover:border-[#D4A024]/30 h-full flex flex-col"
						style={cardStyle}
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center space-x-4 min-w-0">
								<div
									className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
									style={iconContainerStyle}
								>
									<Building2 className="w-6 h-6" />
								</div>
								<div className="min-w-0">
									<h2 className="text-lg font-normal text-gray-900 mb-0.5 truncate">
										Bank Accounts
									</h2>
									<p className="text-sm text-gray-500 font-light truncate">
										Connected via Plaid for ACH payments
									</p>
								</div>
							</div>
							<div className="flex-shrink-0 ml-4">
								<Button
									variant="outlined"
									className="!py-1.5 !px-3 !text-xs border-[#D4A024] text-[#D4A024] hover:bg-[#D4A024]/5"
									onClick={() => open()}
									disabled={!ready || isConnecting}
								>
									{isConnecting ? (
										<Loader2 className="w-3 h-3 animate-spin" />
									) : (
										<>
											<Plus className="w-3 h-3 mr-1.5" />
											Connect
										</>
									)}
								</Button>
							</div>
						</div>

						{profile.bankAccounts.length > 0 ? (
							<div className="mt-auto space-y-3">
								{profile.bankAccounts.map((account) => (
									<div
										key={account.id}
										className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#D4A024]/20"
									>
										<div className="min-w-0 mr-3">
											<p className="font-medium text-gray-900 text-base truncate">
												{account.institutionName}
											</p>
											<p className="text-xs text-gray-500 font-light truncate">
												{account.accountName} (...{account.accountMask})
											</p>
										</div>
										<div className="flex items-center space-x-2 flex-shrink-0">
											{account.isStripeLinked && (
												<Button
													variant="text"
													className="!p-1.5 !h-auto text-xs text-blue-600 hover:bg-blue-50"
													onClick={() => handleTestCharge(account.id)}
													title="Test Stripe Charge"
												>
													Test Charge
												</Button>
											)}
											<span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${account.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
												{account.status.charAt(0).toUpperCase() + account.status.slice(1)}
											</span>
											<button
												onClick={() => handleDisconnect(account.id)}
												disabled={disconnectingId === account.id}
												className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
												title="Disconnect account"
											>
												{disconnectingId === account.id ? (
													<Loader2 className="w-4 h-4 animate-spin" />
												) : (
													<XCircle className="w-4 h-4" />
												)}
											</button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="mt-auto">
								<p className="text-xs text-gray-400 font-light pl-16">
									No bank accounts connected
								</p>
							</div>
						)}
					</motion.div>


				</div>
			</main>
		</div>
	);
}

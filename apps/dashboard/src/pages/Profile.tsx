import { KycStatus, VerificationStatus } from "@commertize/data/enums";
import { Alert, Button, Input, PageHeader } from "@commertize/ui";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
	AlertTriangle,
	Building2,
	CheckCircle,
	Edit2,
	Info,
	Loader2,
	Plus,
	Save,
	Mail,
	Phone,
	Wallet,
	Trash2,
	ShieldCheck,
	User as UserIcon,
	X,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";

import { VerificationStatusCard } from "../components/VerificationStatusCard";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
	PlaidLinkOnSuccess,
	PlaidLinkOptions,
	usePlaidLink,
} from "react-plaid-link";
import { api } from "../lib/api";
import { usePostHog } from "@commertize/utils/client";

interface ProfileData {
	id: string;
	kycStatus: KycStatus;
	kycCompletedAt?: string;
	walletAddress?: string;
	email?: string;
	privyId: string;
	stripeCustomerId?: string;
	bankAccounts: any[];
	isAdmin: boolean;
	isInvestor?: boolean;
	isSponsor?: boolean;
	investorStatus?: VerificationStatus;
	sponsorStatus?: VerificationStatus;
	sponsor?: {
		id: string;
		businessName: string;
		status: VerificationStatus; // Remapped from backend
	};
	firstName?: string;
	lastName?: string;
	username?: string;
	phoneNumber?: string;
	bio?: string;
	avatarUrl?: string;
	createdAt: string;
}

export default function ProfilePage() {
	const {
		user,
		logout,
		getAccessToken,
		linkEmail,
		linkPhone,
		linkWallet,
		unlinkEmail,
		unlinkPhone,
		unlinkWallet,
	} = usePrivy();
	const { wallets } = useWallets();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [linkToken, setLinkToken] = useState<string | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const posthog = usePostHog();

	const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [alertState, setAlertState] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		type: "success" | "error" | "info" | "warning";
		onConfirm?: () => void;
		confirmText?: string;
		cancelText?: string;
		autoClose?: boolean;
	}>({
		isOpen: false,
		title: "",
		message: "",
		type: "info",
	});

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editForm, setEditForm] = useState({
		username: "",
		email: "",
		bio: "",
		// avatarUrl: "", // Not implemented in UI yet
	});

	const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
		null
	);
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);

	// Sync edit form with profile data when profile loads
	useEffect(() => {
		if (profile) {
			setEditForm({
				username: profile.username || "",
				email: profile.email || "",
				bio: profile.bio || "",
			});
		}
	}, [profile]);

	useEffect(() => {
		const checkUsername = async () => {
			if (!editForm.username || editForm.username.length < 3) {
				setUsernameAvailable(null);
				return;
			}

			if (editForm.username === profile?.username) {
				setUsernameAvailable(true);
				return;
			}

			setIsCheckingUsername(true);
			try {
				const token = await getAccessToken();
				const { available } = await api.get(
					`/onboarding/check-username?username=${editForm.username}`,
					token
				);
				setUsernameAvailable(available);
			} catch (error) {
				console.error("Error checking username:", error);
				setUsernameAvailable(false); // Assume unavailable on error or handle differently
			} finally {
				setIsCheckingUsername(false);
			}
		};

		const timeoutId = setTimeout(checkUsername, 500);
		return () => clearTimeout(timeoutId);
	}, [editForm.username, profile?.username, getAccessToken]);

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const token = await getAccessToken();
			const updatedUser = await api.put("/profile", editForm, token);

			// Update local profile state
			setProfile((prev) => (prev ? { ...prev, ...updatedUser.user } : null));

			setIsEditModalOpen(false);

			setAlertState({
				isOpen: true,
				title: "Profile Updated",
				message: "Your profile has been successfully updated.",
				type: "success",
			});

			if (posthog) {
				posthog.capture("profile_updated");
			}
		} catch (error: any) {
			console.error("Error updating profile:", error);
			setAlertState({
				isOpen: true,
				title: "Update Failed",
				message: error.message || "Failed to update profile",
				type: "error",
			});
		}
	};

	const fetchProfile = useCallback(async () => {
		try {
			const token = await getAccessToken();
			const data = await api.get("/profile", token);
			setProfile(data);
		} catch (error) {
			console.error("Error fetching profile:", error);
		} finally {
			setLoading(false);
		}
	}, [getAccessToken]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	// Create Link Token for Auth flow
	const createLinkToken = useCallback(async () => {
		if (!user) return;
		try {
			const token = await getAccessToken();

			const data = await api.post(
				"/plaid/create_link_token?flow=auth",
				{},
				token
			);
			setLinkToken(data.link_token);
		} catch (error) {
			console.error("Error creating link token:", error);
		}
	}, [user, getAccessToken]);

	useEffect(() => {
		if (user) {
			createLinkToken();
		}
	}, [user, createLinkToken]);

	const onSuccess = useCallback<PlaidLinkOnSuccess>(
		async (public_token: string, _metadata: unknown) => {
			setIsConnecting(true);
			try {
				const token = await getAccessToken();

				const data = await api.post(
					"/plaid/exchange_public_token",
					{ public_token },
					token
				);

				if (data.success || data.accounts) {
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
		[createLinkToken, fetchProfile, getAccessToken]
	);

	const handleDisconnect = async (accountId: string) => {
		setAlertState({
			isOpen: true,
			title: "Disconnect Account",
			message: "Are you sure you want to disconnect this bank account?",
			type: "warning",
			confirmText: "Disconnect",
			onConfirm: async () => {
				setDisconnectingId(accountId);
				try {
					const token = await getAccessToken();
					await api.delete(`/plaid/accounts/${accountId}`, token);
					await fetchProfile();
				} catch (error) {
					console.error("Error disconnecting account:", error);
				} finally {
					setDisconnectingId(null);
				}
			},
		});
	};

	const handleTestCharge = async (accountId: string) => {
		setAlertState({
			isOpen: true,
			title: "Test Stripe Charge",
			message:
				"This will simulate a $1.00 charge to your connected account. Proceed?",
			type: "info",
			confirmText: "Charge",
			onConfirm: async () => {
				try {
					const token = await getAccessToken();

					const data = await api.post(
						"/stripe/test-charge",
						{ accountId, type: "charge", amount: 100 },
						token
					);

					if (data) {
						setAlertState({
							isOpen: true,
							title: "Test Charge Successful",
							message: "Test charge successful! Check Stripe dashboard.",
							type: "success",
						});
					} else {
						setAlertState({
							isOpen: true,
							title: "Charge Failed",
							message: `Charge failed: ${data.error}`,
							type: "error",
						});
					}
				} catch (error) {
					console.error("Test charge error:", error);
					setAlertState({
						isOpen: true,
						title: "Error",
						message: "Failed to execute test charge",
						type: "error",
					});
				}
			},
		});
	};

	const handleDeleteAccount = async () => {
		const deleteLogic = async () => {
			try {
				const wallet =
					wallets.find((w) => w.walletClientType === "privy") || wallets[0];

				if (!wallet) {
					throw new Error(
						"No connected wallet found. Please verify your account setup."
					);
				}

				const message = `I confirm that I want to permanently delete my account. Timestamp: ${Date.now()}`;
				await wallet.sign(message);

				setIsDeleting(true);
				const token = await getAccessToken();
				await api.delete("/profile", token);

				await logout();
				window.location.href = "/";
			} catch (error: any) {
				console.error("Error deleting account:", error);
				// Check if error is user rejection
				if (error?.message?.includes("User rejected")) {
					setAlertState({
						isOpen: true,
						title: "Verification Cancelled",
						message: "Account deletion cancelled.",
						type: "info",
					});
				} else if (
					error?.status === 409 &&
					error?.code === "LAST_SPONSOR_USER"
				) {
					setAlertState({
						isOpen: true,
						title: "Cannot Delete Account",
						message:
							"You are the last user in your sponsor organization. You must delete the organization first.",
						type: "error",
						confirmText: "Go to Sponsor Dashboard",
						onConfirm: () => navigate("/sponsor"),
						cancelText: "Cancel",
					});
				} else {
					setAlertState({
						isOpen: true,
						title: "Error Deleting Account",
						message: `Failed to delete account: ${error.message || "Unknown error"}`,
						type: "error",
					});
				}
				setIsDeleting(false);
			}
		};

		setAlertState({
			isOpen: true,
			title: "Delete Account?",
			message:
				"Are you absolutely sure?\n\nThis will permanently delete your account, wallet connection, and all associated data. This action cannot be undone.",
			type: "error",
			confirmText: "Delete Forever",
			autoClose: false,
			onConfirm: () => {
				// Double confirmation (chained)
				setAlertState({
					isOpen: true,
					title: "Final Confirmation",
					message: "Please confirm again to PERMANENTLY DELETE your account.",
					type: "error",
					confirmText: "YES, DELETE IT",
					onConfirm: deleteLogic,
				});
			},
		});
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
		boxShadow:
			"0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)", // very subtle shadow
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
						<p className="text-gray-500 font-light text-lg">
							Failed to load profile
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#fafafa]">
			<Navbar />

			<main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				>
					<PageHeader
						title={
							<>
								Your <span className="text-[#D4A024]">Profile</span>
							</>
						}
						subtitle="Manage your account connections, verification status, and payment methods."
						className="mb-8"
					/>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Column 1: Personal Info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
						className="space-y-6"
					>
						{/* Personal Details Card */}
						<div className="p-6 h-full flex flex-col relative" style={cardStyle}>
							<div className="flex items-center space-x-4 mb-6">
								<div
									className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
									style={iconContainerStyle}
								>
									<UserIcon className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-lg font-normal text-gray-900 mb-0.5">
										Personal Details
									</h2>
									<p className="text-sm text-gray-500 font-light">
										Identity Information
									</p>
								</div>
								<div className="absolute top-6 right-6">
									<Button
										variant="text"
										className="!p-2 text-gray-400 hover:text-[#D4A024]"
										onClick={() => setIsEditModalOpen(true)}
									>
										<Edit2 className="w-5 h-5" />
									</Button>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<p className="text-xs text-gray-400 font-light mb-1">
										Full Name
									</p>
									<p className="text-sm text-gray-900 font-medium">
										{profile.firstName && profile.lastName
											? `${profile.firstName} ${profile.lastName}`
											: "Not set"}
									</p>
								</div>

								<div>
									<p className="text-xs text-gray-400 font-light mb-1">
										Username
									</p>
									<p className="text-sm text-gray-900 font-medium">
										{profile.username ? `@${profile.username}` : "Not set"}
									</p>
								</div>

								<div>
									<p className="text-xs text-gray-400 font-light mb-1">Phone</p>
									<p className="text-sm text-gray-900 font-medium">
										{profile.phoneNumber || "Not set"}
									</p>
								</div>

								<div>
									<p className="text-xs text-gray-400 font-light mb-1">Email</p>
									<p className="text-sm text-gray-900 font-medium">
										{profile.email || "Not set"}
									</p>
								</div>

								<div>
									<p className="text-xs text-gray-400 font-light mb-1">Bio</p>
									<p className="text-sm text-gray-900 font-light italic">
										{profile.bio || "No bio added"}
									</p>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Column 2: Account & Security */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
						className="space-y-6"
					>
						{/* Account Info Card */}
						<div className="p-6 h-full flex flex-col" style={cardStyle}>
							<div className="flex items-center space-x-4 mb-6">
								<div
									className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
									style={iconContainerStyle}
								>
									<ShieldCheck className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-lg font-normal text-gray-900 mb-0.5">
										Account & Security
									</h2>
									<p className="text-sm text-gray-500 font-light">
										Privy & access details
									</p>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<p className="text-xs text-gray-400 font-light mb-1">
										Member Since
									</p>
									<p className="text-sm text-gray-900 font-medium">
										{new Date(profile.createdAt).toLocaleDateString(undefined, {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</p>
								</div>

								<div className="pt-2 border-t border-gray-100">
									<p className="text-xs text-gray-400 font-light mb-1">
										Privy ID
									</p>
									<div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
										<span className="text-xs font-mono text-gray-600 truncate max-w-[140px]">
											{profile.privyId}
										</span>
										<Button
											variant="text"
											className="!p-0 !h-auto text-[#D4A024] text-xs"
											onClick={() =>
												navigator.clipboard.writeText(profile.privyId)
											}
										>
											Copy
										</Button>
									</div>
								</div>

								<div>
									<p className="text-xs text-gray-400 font-light mb-3">
										Linked Login Methods
									</p>
									<div className="space-y-2">
										{/* Email */}
										<div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
											<div className="flex items-center space-x-3 overflow-hidden">
												<div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
													<Mail className="w-4 h-4 text-gray-500" />
												</div>
												<div className="truncate">
													<p className="text-sm font-medium text-gray-900">
														Email
													</p>
													{user?.email?.address ? (
														<p className="text-xs text-gray-500 truncate">
															{user.email.address}
														</p>
													) : (
														<p className="text-xs text-gray-400">
															Not connected
														</p>
													)}
												</div>
											</div>
											{user?.email?.address ? (
												<Button
													variant="text"
													className="!p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
													onClick={() => {
														if (user.linkedAccounts.length <= 1) {
															setAlertState({
																isOpen: true,
																title: "Cannot Disconnect",
																message:
																	"You must have at least one linked login method.",
																type: "warning",
															});
															return;
														}
														setAlertState({
															isOpen: true,
															title: "Disconnect Email",
															message:
																"Are you sure you want to disconnect this email?",
															type: "warning",
															confirmText: "Disconnect",
															onConfirm: () => unlinkEmail(user.email!.address),
														});
													}}
													disabled={
														user.wallet?.address === user.email.address // specific case if wallet is treated as email? unlikely but good check
													}
													title="Disconnect"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											) : (
												<Button
													variant="text"
													className="!px-3 !py-1 text-xs font-medium text-[#D4A024] hover:bg-[#D4A024]/5"
													onClick={linkEmail}
												>
													Connect
												</Button>
											)}
										</div>

										{/* Google - Removed as per request */}

										{/* Phone */}
										<div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
											<div className="flex items-center space-x-3 overflow-hidden">
												<div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
													<Phone className="w-4 h-4 text-gray-500" />
												</div>
												<div className="truncate">
													<p className="text-sm font-medium text-gray-900">
														Phone
													</p>
													{user?.phone?.number ? (
														<p className="text-xs text-gray-500 truncate">
															{user.phone.number}
														</p>
													) : (
														<p className="text-xs text-gray-400">
															Not connected
														</p>
													)}
												</div>
											</div>
											{user?.phone?.number ? (
												<Button
													variant="text"
													className="!p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
													onClick={() => {
														if (user.linkedAccounts.length <= 1) {
															setAlertState({
																isOpen: true,
																title: "Cannot Disconnect",
																message:
																	"You must have at least one linked login method.",
																type: "warning",
															});
															return;
														}
														setAlertState({
															isOpen: true,
															title: "Disconnect Phone",
															message:
																"Are you sure you want to disconnect this phone number?",
															type: "warning",
															confirmText: "Disconnect",
															onConfirm: () => unlinkPhone(user.phone!.number),
														});
													}}
													title="Disconnect"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											) : (
												<Button
													variant="text"
													className="!px-3 !py-1 text-xs font-medium text-[#D4A024] hover:bg-[#D4A024]/5"
													onClick={linkPhone}
												>
													Connect
												</Button>
											)}
										</div>

										{/* Wallet */}
										<div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
											<div className="flex items-center space-x-3 overflow-hidden">
												<div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
													<Wallet className="w-4 h-4 text-gray-500" />
												</div>
												<div className="truncate">
													<p className="text-sm font-medium text-gray-900">
														Wallet
													</p>
													{user?.wallet?.address ? (
														<p className="text-xs text-gray-500 truncate font-mono">
															{user.wallet.address.slice(0, 6)}...
															{user.wallet.address.slice(-4)}
														</p>
													) : (
														<p className="text-xs text-gray-400">
															Not connected
														</p>
													)}
												</div>
											</div>
											{user?.wallet?.address ? (
												<Button
													variant="text"
													className="!p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
													onClick={() => {
														if (user.linkedAccounts.length <= 1) {
															setAlertState({
																isOpen: true,
																title: "Cannot Disconnect",
																message:
																	"You must have at least one linked login method.",
																type: "warning",
															});
															return;
														}
														setAlertState({
															isOpen: true,
															title: "Disconnect Wallet",
															message:
																"Are you sure you want to disconnect this wallet?",
															type: "warning",
															confirmText: "Disconnect",
															onConfirm: () =>
																unlinkWallet(user.wallet!.address),
														});
													}}
													title="Disconnect"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											) : (
												<Button
													variant="text"
													className="!px-3 !py-1 text-xs font-medium text-[#D4A024] hover:bg-[#D4A024]/5"
													onClick={linkWallet}
												>
													Connect
												</Button>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Column 3: Verification & Status */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
						className="space-y-6"
					>
						{/* Verification Card */}
						{profile && <VerificationStatusCard profile={profile} />}
					</motion.div>
				</div>

				<div className="mt-6">
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

						{profile.bankAccounts && profile.bankAccounts.length > 0 ? (
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
											<span
												className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${account.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
											>
												{account.status.charAt(0).toUpperCase() +
													account.status.slice(1)}
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

				{/* Danger Zone */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
					className="mt-12 pt-12 border-t border-gray-200"
				>
					<h2 className="text-xl font-light text-red-600 mb-4 flex items-center">
						<AlertTriangle className="w-5 h-5 mr-2" />
						Danger Zone
					</h2>
					<div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between">
						<div className="mb-4 sm:mb-0">
							<h3 className="text-lg font-medium text-red-900">
								Delete Account
							</h3>
							<p className="text-sm text-red-700 mt-1 max-w-md">
								Permanently delete your account and all associated data. This
								action cannot be undone.
							</p>
						</div>
						<Button
							className="shrink-0 bg-red-600 hover:bg-red-700 text-white"
							onClick={handleDeleteAccount}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete Account"
							)}
						</Button>
					</div>
				</motion.div>
			</main>
			<Alert
				isOpen={alertState.isOpen}
				onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
				title={alertState.title}
				message={alertState.message}
				type={alertState.type}
				onConfirm={alertState.onConfirm}
				confirmText={alertState.confirmText}
				cancelText={alertState.cancelText}
			/>

			{/* Edit Profile Modal */}
			{isEditModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
					>
						<div className="flex items-center justify-between p-6 border-b border-gray-100">
							<h3 className="text-lg font-medium text-gray-900">
								Edit Profile
							</h3>
							<button
								onClick={() => setIsEditModalOpen(false)}
								className="text-gray-400 hover:text-gray-500"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Username
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 -mt-[2px] text-gray-400 leading-none">
										@
									</span>
									<Input
										value={editForm.username}
										onChange={(e) =>
											setEditForm({ ...editForm, username: e.target.value })
										}
										className="!pl-8 !pr-10"
										placeholder="username"
									/>
									<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
										{isCheckingUsername ? (
											<Loader2 className="w-5 h-5 animate-spin text-gray-400" />
										) : usernameAvailable === true ? (
											<CheckCircle className="w-5 h-5 text-green-500" />
										) : usernameAvailable === false ? (
											<XCircle className="w-5 h-5 text-red-500" />
										) : null}
									</div>
								</div>
								{usernameAvailable === false && (
									<p className="mt-1 text-xs text-red-500 font-medium">
										Username is already taken
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<Input
									type="email"
									value={editForm.email}
									onChange={(e) =>
										setEditForm({ ...editForm, email: e.target.value })
									}
									placeholder="your@email.com"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Bio
								</label>
								<textarea
									value={editForm.bio}
									onChange={(e) =>
										setEditForm({ ...editForm, bio: e.target.value })
									}
									className="w-full rounded-lg border border-gray-200 focus:border-[#D4A024] focus:ring-[#D4A024] text-sm min-h-[100px] p-3"
									placeholder="Tell us about yourself..."
								/>
							</div>

							<div className="pt-2">
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-3">
									<Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
									<p className="text-sm text-blue-700">
										Name and Phone Number are verified and cannot be changed
										here.
									</p>
								</div>
							</div>

							<div className="flex justify-between pt-4">
								<Button
									variant="text"
									type="button"
									onClick={() => setIsEditModalOpen(false)}
									className="text-gray-500"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="bg-[#D4A024] hover:bg-[#b08d35]"
								>
									<Save className="w-4 h-4 mr-2" />
									Save Changes
								</Button>
							</div>
						</form>
					</motion.div>
				</div>
			)}

			<Alert
				isOpen={alertState.isOpen}
				onClose={() => setAlertState({ ...alertState, isOpen: false })}
				title={alertState.title}
				message={alertState.message}
				type={alertState.type}
				onConfirm={alertState.onConfirm}
				confirmText={alertState.confirmText}
				cancelText={alertState.cancelText}
				autoClose={alertState.autoClose}
			/>
		</div>
	);
}

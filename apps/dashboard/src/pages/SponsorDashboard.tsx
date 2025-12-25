import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Alert } from "@commertize/ui";
// import {
// 	Table,
// 	TableBody,
// 	TableCell,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// } from "@commertize/ui";
import { Navbar } from "../components/Navbar";
import { api } from "../lib/api";
import { SponsorFormFields } from "../components/onboarding/SponsorFormFields";
import { usePrivy } from "@privy-io/react-auth";
import {
	Plus,
	Edit,
	ExternalLink,
	Loader2,
	AlertCircle,
	Building2,
	DollarSign,
	Trash2,
	RefreshCw,
	MoreVertical,
} from "lucide-react";
import type { Listing } from "@commertize/data";
import { ListingStatus, EntityType } from "@commertize/data/enums";
import { DividendModal } from "../components/DividendModal";
import { FeedbackModal } from "../components/FeedbackModal";
import { DataTable, DataTableColumnHeader } from "@commertize/ui";
import type { ColumnDef } from "@tanstack/react-table";

interface ListingWithFunding extends Listing {
	amountFunded?: number;
}

export default function SponsorDashboard() {
	const navigate = useNavigate();
	const location = useLocation();
	const { getAccessToken } = usePrivy();
	const [listings, setListings] = useState<ListingWithFunding[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dividendModalOpen, setDividendModalOpen] = useState(false);
	const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [actionId, setActionId] = useState<string | null>(null);
	const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
	const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
	const [activeTab, setActiveTab] = useState<"listings" | "profile" | "team">(
		"listings"
	);

	// Profile State
	const [profileData, setProfileData] = useState({
		businessName: "",
		businessType: "LLC",
		ein: "",
		address: "",
		documents: [] as string[],
		bio: "",
	});
	const [newDocUrl, setNewDocUrl] = useState("");
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileError, setProfileError] = useState<string | null>(null);
	const [profileSaving, setProfileSaving] = useState(false);
	const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

	// Team State
	const [members, setMembers] = useState<any[]>([]);
	const [newMemberEmail, setNewMemberEmail] = useState("");
	const [memberActionLoading, setMemberActionLoading] = useState(false);
	const [memberError, setMemberError] = useState<string | null>(null);

	const [feedbackModal, setFeedbackModal] = useState({
		isOpen: false,
		entityType: EntityType.LISTING,
		entityId: "",
		title: "",
	});

	const openFeedback = (id: string, title: string) => {
		setFeedbackModal({
			isOpen: true,
			entityType: EntityType.LISTING,
			entityId: id,
			title,
		});
	};

	// Fetch Sponsor Profile
	useEffect(() => {
		const fetchProfile = async () => {
			setProfileLoading(true);
			try {
				const token = await getAccessToken();
				if (!token) return;
				const data = await api.get("sponsor/status", token);
				if (data) {
					setProfileData({
						businessName: data.businessName || "",
						businessType: data.kybData?.businessType || "LLC",
						ein: data.ein || "",
						address: data.address || "",
						documents: data.kybData?.documents || [],
						bio: data.bio || "",
					});
					if (data.votingMembersDetails) {
						setMembers(data.votingMembersDetails);
					}
				}
			} catch (err) {
				console.error("Error fetching sponsor profile", err);
				setProfileError("Failed to load profile data.");
			} finally {
				setProfileLoading(false);
			}
		};
		// Only fetch active tab is profile or team? Or just fetch on mount?
		// Fetch on mount is safer for now as we might switch tabs.
		fetchProfile();
	}, [getAccessToken]);

	const handleSaveProfile = async () => {
		setProfileSaving(true);
		setProfileSaveSuccess(false);
		setProfileError(null);
		try {
			const token = await getAccessToken();
			if (!token) return;
			await api.patch("sponsor/profile", profileData, token);
			setProfileSaveSuccess(true);
			setTimeout(() => setProfileSaveSuccess(false), 3000);
		} catch (err) {
			console.error("Error saving profile", err);
			setProfileError("Failed to save changes.");
		} finally {
			setProfileSaving(false);
		}
	};

	const handleAddMember = async () => {
		if (!newMemberEmail) return;
		setMemberActionLoading(true);
		setMemberError(null);
		try {
			const token = await getAccessToken();
			if (!token) return;
			const res = await api.post(
				"sponsor/members",
				{ email: newMemberEmail },
				token
			);
			setMembers((prev) => [...prev, res.member]);
			setNewMemberEmail("");
		} catch (err: any) {
			console.error("Error adding member", err);
			setMemberError(err.message || "Failed to add member.");
		} finally {
			setMemberActionLoading(false);
		}
	};

	const handleRemoveMember = async (id: string) => {
		if (!confirm("Are you sure you want to remove this member?")) return;
		setMemberActionLoading(true);
		setMemberError(null);
		try {
			const token = await getAccessToken();
			if (!token) return;
			await api.delete(`sponsor/members/${id}`, token);
			setMembers((prev) => prev.filter((m) => m.id !== id));
		} catch (err: any) {
			console.error("Error removing member", err);
			setMemberError(err.message || "Failed to remove member.");
		} finally {
			setMemberActionLoading(false);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				openActionMenuId &&
				!(event.target as Element).closest(".action-menu-portal") &&
				!(event.target as Element).closest(".action-menu-trigger")
			) {
				setOpenActionMenuId(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [openActionMenuId]);

	useEffect(() => {
		if (location.state?.listingCreated) {
			setShowSuccessAlert(true);
			// Clear the state so the alert doesn't show again on refresh (if history persists)
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [location, navigate]);

	useEffect(() => {
		const fetchListings = async () => {
			try {
				const token = await getAccessToken();
				if (!token) return;

				const data = (await api.get(
					"/listings/my-listings",
					token
				)) as ListingWithFunding[];
				setListings(data);
			} catch (err) {
				console.error("Error fetching listings", err);
				setError("Failed to load your listings.");
			} finally {
				setLoading(false);
			}
		};

		fetchListings();
	}, [getAccessToken]);

	const getStatusBadge = (status: ListingStatus) => {
		const styles = {
			[ListingStatus.DRAFT]: "bg-slate-100 text-slate-700",
			[ListingStatus.PENDING_REVIEW]: "bg-yellow-100 text-yellow-800",
			[ListingStatus.APPROVED]: "bg-blue-100 text-blue-800",
			[ListingStatus.ACTIVE]: "bg-green-100 text-green-800",
			[ListingStatus.FULLY_FUNDED]: "bg-purple-100 text-purple-800",
			[ListingStatus.REJECTED]: "bg-red-100 text-red-800",
			[ListingStatus.WITHDRAWN]: "bg-gray-100 text-gray-500",
		};
		// fallback
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		const style = (styles as any)[status] || "bg-slate-100 text-slate-700";

		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
			>
				{status.replace(/_/g, " ")}
			</span>
		);
	};

	const handleWithdraw = async (listingId: string) => {
		try {
			setActionId(listingId);
			const token = await getAccessToken();
			if (!token) return;

			await api.patch(`/listings/${listingId}/withdraw`, {}, token);

			// Update state locally
			setListings((prev) =>
				prev.map((l) =>
					l.id === listingId
						? ({ ...l, status: ListingStatus.WITHDRAWN } as ListingWithFunding)
						: l
				)
			);
		} catch (err) {
			console.error("Failed to withdraw listing", err);
			// You might want a toast here
		} finally {
			setActionId(null);
		}
	};

	const handleResubmit = async (listingId: string) => {
		try {
			setActionId(listingId);
			const token = await getAccessToken();
			if (!token) return;

			await api.post(`/listings/${listingId}/resubmit`, {}, token);

			// Update state locally
			setListings((prev) =>
				prev.map((l) =>
					l.id === listingId
						? ({
							...l,
							status: ListingStatus.PENDING_REVIEW,
						} as ListingWithFunding)
						: l
				)
			);
		} catch (err) {
			console.error("Failed to resubmit listing", err);
		} finally {
			setActionId(null);
		}
	};

	const handleDelete = async (listingId: string) => {
		try {
			setActionId(listingId);
			const token = await getAccessToken();
			if (!token) return;

			await api.delete(`/listings/${listingId}`, token);

			// Update state locally
			setListings((prev) => prev.filter((l) => l.id !== listingId));
		} catch (err) {
			console.error("Failed to delete listing", err);
		} finally {
			setActionId(null);
		}
	};

	const columns: ColumnDef<ListingWithFunding>[] = [
		{
			id: "images",
			header: "Image",
			cell: ({ row }) => (
				<div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
					{row.original.images?.[0] ? (
						<img
							src={row.original.images[0]}
							alt={row.original.name}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Building2 className="w-5 h-5 text-slate-300" />
						</div>
					)}
				</div>
			),
		},
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Property Name" />
			),
			cell: ({ row }) => (
				<div
					className="cursor-pointer font-medium"
					onClick={() => navigate(`/listings/${row.original.id}/edit`)}
				>
					{row.original.name}
					<div className="text-xs text-slate-500 mt-0.5">
						{row.original.propertyType}
					</div>
				</div>
			),
		},
		{
			accessorKey: "location",
			header: "Location",
			cell: ({ row }) => (
				<div>
					{row.original.city}, {row.original.state}
				</div>
			),
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => getStatusBadge(row.original.status),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			id: "funded",
			header: "Funded",
			cell: ({ row }) => {
				const listing = row.original;
				return (
					<div className="flex flex-col items-end">
						<span className="font-mono text-sm">
							${(listing.amountFunded || 0).toLocaleString()}
						</span>
						<div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
							<div
								className="h-full bg-green-500 rounded-full"
								style={{
									width: `${Math.min(
										100,
										((listing.amountFunded || 0) /
											listing.financials.equityRequired) *
										100
									)}%`,
								}}
							/>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "equityRequired",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Target Raise" />
			),
			cell: ({ row }) => (
				<div className="text-right font-mono">
					${row.original.financials.equityRequired.toLocaleString()}
				</div>
			),
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const listing = row.original;
				return (
					<div className="relative flex justify-end">
						<Button
							variant="text"
							className="text-slate-400 hover:text-slate-600 action-menu-trigger"
							onClick={(e) => {
								e.stopPropagation();
								const rect = (
									e.currentTarget as HTMLButtonElement
								).getBoundingClientRect();
								setMenuPosition({
									top: rect.bottom + window.scrollY,
									right: window.innerWidth - rect.right,
								});
								setOpenActionMenuId(
									openActionMenuId === listing.id ? null : listing.id
								);
							}}
						>
							<MoreVertical className="w-5 h-5" />
						</Button>
					</div>
				);
			},
		},
	];

	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-slate-900">
							Sponsor Dashboard
						</h1>
						<p className="mt-2 text-slate-600">
							Manage your property listings and offerings.
						</p>
					</div>
					<Button onClick={() => navigate("/listings/new")} icon={Plus}>
						Create Listing
					</Button>
				</div>

				<div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden min-h-[600px]">
					<div className="border-b border-slate-200 px-6">
						<div className="flex gap-6">
							<button
								onClick={() => setActiveTab("listings")}
								className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "listings"
									? "border-blue-600 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700"
									}`}
							>
								Sponsor
							</button>
							<button
								onClick={() => setActiveTab("profile")}
								className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "profile"
									? "border-blue-600 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700"
									}`}
							>
								Sponsor Profile
							</button>
							<button
								onClick={() => setActiveTab("team")}
								className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "team"
									? "border-blue-600 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700"
									}`}
							>
								Team
							</button>
						</div>
					</div>

					{activeTab === "listings" && (
						<div className="p-0 m-0">
							{loading ? (
								<div className="p-12 flex justify-center">
									<Loader2 className="w-8 h-8 animate-spin text-slate-400" />
								</div>
							) : error ? (
								<div className="p-12 text-center text-red-600 flex flex-col items-center">
									<AlertCircle className="w-8 h-8 mb-2" />
									<p>{error}</p>
								</div>
							) : (
								<div className="p-6">
									<DataTable
										columns={columns}
										data={listings}
										view="table"
										filterColumnName="name"
										searchPlaceholder="Filter listings..."
									/>
								</div>
							)}
						</div>
					)}

					{activeTab === "profile" && (
						<div className="p-6">
							<div className="max-w-3xl">
								<h3 className="text-lg font-medium text-slate-900 mb-6">
									Edit Sponsor Profile
								</h3>
								{profileLoading ? (
									<div className="flex justify-center py-12">
										<Loader2 className="w-8 h-8 animate-spin text-slate-400" />
									</div>
								) : (
									<div className="space-y-6">
										<SponsorFormFields
											formData={profileData}
											fieldErrors={profileError ? { form: profileError } : {}}
											newDocUrl={newDocUrl}
											onChange={(e) =>
												setProfileData((prev) => ({
													...prev,
													[e.target.name]: e.target.value,
												}))
											}
											onAddDocument={() => {
												if (newDocUrl) {
													setProfileData((prev) => ({
														...prev,
														documents: [...prev.documents, newDocUrl],
													}));
													setNewDocUrl("");
												}
											}}
											onRemoveDocument={(idx) => {
												setProfileData((prev) => ({
													...prev,
													documents: prev.documents.filter((_, i) => i !== idx),
												}));
											}}
											setNewDocUrl={setNewDocUrl}
										/>
										<div className="flex items-center gap-4 pt-4 border-t border-slate-100">
											<Button
												onClick={handleSaveProfile}
												disabled={profileSaving}
											>
												{profileSaving ? (
													<>
														<Loader2 className="w-4 h-4 mr-2 animate-spin" />
														Saving...
													</>
												) : (
													"Save Changes"
												)}
											</Button>
											{profileSaveSuccess && (
												<span className="text-sm text-green-600 font-medium animate-in fade-in slide-in-from-left-2">
													Changes saved successfully!
												</span>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{activeTab === "team" && (
						<div className="p-6">
							<div className="max-w-3xl">
								<h3 className="text-lg font-medium text-slate-900 mb-1">
									Team Management
								</h3>
								<p className="text-slate-500 mb-8">
									Grant other users permission to create listings on your
									behalf.
								</p>

								{/* Add Member */}
								<div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
									<h4 className="text-sm font-medium text-slate-900 mb-3">
										Add Team Member
									</h4>
									<div className="flex gap-3">
										<div className="flex-1">
											<input
												type="email"
												placeholder="Enter email address"
												className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
												value={newMemberEmail}
												onChange={(e) => setNewMemberEmail(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleAddMember();
												}}
											/>
										</div>
										<Button
											onClick={handleAddMember}
											disabled={memberActionLoading}
										>
											{memberActionLoading ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												"Invite"
											)}
										</Button>
									</div>
									{memberError && (
										<p className="text-red-600 text-sm mt-2">{memberError}</p>
									)}
								</div>

								{/* Member List */}
								<div className="space-y-4">
									<h4 className="text-sm font-medium text-slate-900">
										Voting Members
									</h4>

									{members.length === 0 ? (
										<div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
											<p className="text-slate-500 text-sm">
												No team members yet.
											</p>
										</div>
									) : (
										<div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
											{members.map((member) => (
												<div
													key={member.id}
													className="p-4 flex justify-between items-center bg-white"
												>
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
															{member.avatarUrl ? (
																<img
																	src={member.avatarUrl}
																	alt={member.firstName || ""}
																	className="w-full h-full object-cover"
																/>
															) : (
																<span className="text-slate-500 font-medium text-sm">
																	{(
																		member.firstName?.[0] ||
																		member.email?.[0] ||
																		"?"
																	).toUpperCase()}
																</span>
															)}
														</div>
														<div>
															<div className="text-sm font-medium text-slate-900">
																{member.firstName} {member.lastName}
															</div>
															<div className="text-xs text-slate-500">
																{member.email}
															</div>
														</div>
													</div>
													<Button
														variant="outlined"
														className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 text-xs"
														onClick={() => handleRemoveMember(member.id)}
														disabled={memberActionLoading}
													>
														Remove
													</Button>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{openActionMenuId &&
				(() => {
					const listing = listings.find((l) => l.id === openActionMenuId);
					if (!listing) return null;
					return createPortal(
						<div
							className="fixed w-56 bg-white rounded-lg shadow-xl z-[9999] border border-slate-100 py-1 text-left action-menu-portal"
							style={{
								top: menuPosition.top + 4,
								right: menuPosition.right,
							}}
						>
							<button
								className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
								onClick={(e) => {
									e.stopPropagation();
									setOpenActionMenuId(null);
									navigate(`/listings/${listing.id}/edit`);
								}}
							>
								<Edit className="w-4 h-4" /> Edit Listing
							</button>

							<button
								className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
								onClick={(e) => {
									e.stopPropagation();
									setOpenActionMenuId(null);
									navigate(`/listing/${listing.id}`);
								}}
							>
								<ExternalLink className="w-4 h-4" /> View Public Page
							</button>

							{(listing.status === ListingStatus.ACTIVE ||
								listing.status === ListingStatus.FULLY_FUNDED) && (
									<button
										className="w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
										onClick={(e) => {
											e.stopPropagation();
											setOpenActionMenuId(null);
											setSelectedListing(listing);
											setDividendModalOpen(true);
										}}
									>
										<DollarSign className="w-4 h-4" /> Issue Dividend
									</button>
								)}

							{(listing.status === ListingStatus.PENDING_REVIEW ||
								listing.status === ListingStatus.APPROVED ||
								listing.status === ListingStatus.DRAFT) && (
									<button
										className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
										disabled={actionId === listing.id}
										onClick={(e) => {
											e.stopPropagation();
											setOpenActionMenuId(null);
											if (
												confirm("Are you sure you want to withdraw this listing?")
											) {
												handleWithdraw(listing.id);
											}
										}}
									>
										{actionId === listing.id ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<div className="flex items-center gap-2">
												<AlertCircle className="w-4 h-4" /> Withdraw
											</div>
										)}
									</button>
								)}

							{listing.status === ListingStatus.WITHDRAWN && (
								<button
									className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
									disabled={actionId === listing.id}
									onClick={(e) => {
										e.stopPropagation();
										setOpenActionMenuId(null);
										if (
											confirm("Are you sure you want to resubmit this listing?")
										) {
											handleResubmit(listing.id);
										}
									}}
								>
									{actionId === listing.id ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<div className="flex items-center gap-2">
											<RefreshCw className="w-4 h-4" /> Resubmit
										</div>
									)}
								</button>
							)}

							{(listing.status === ListingStatus.DRAFT ||
								listing.status === ListingStatus.WITHDRAWN ||
								listing.status === ListingStatus.REJECTED) && (
									<>
										{listing.status === ListingStatus.REJECTED && (
											<button
												className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
												onClick={(e) => {
													e.stopPropagation();
													setOpenActionMenuId(null);
													openFeedback(listing.id, "Listing Feedback");
												}}
											>
												<AlertCircle className="w-4 h-4" /> View Feedback
											</button>
										)}
										<button
											className="w-full px-4 py-2 text-sm text-slate-500 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 border-t border-slate-100"
											disabled={actionId === listing.id}
											onClick={(e) => {
												e.stopPropagation();
												setOpenActionMenuId(null);
												if (
													confirm(
														"Are you sure you want to delete this listing? This action cannot be undone."
													)
												) {
													handleDelete(listing.id);
												}
											}}
										>
											{actionId === listing.id ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<div className="flex items-center gap-2">
													<Trash2 className="w-4 h-4" /> Delete
												</div>
											)}
										</button>
									</>
								)}
						</div>,
						document.body
					);
				})()}
			<DividendModal
				isOpen={dividendModalOpen}
				onClose={() => setDividendModalOpen(false)}
				listingId={selectedListing?.id || ""}
				listingName={selectedListing?.name || ""}
				onSuccess={() => { }}
			/>
			<FeedbackModal
				isOpen={feedbackModal.isOpen}
				onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
				entityType={feedbackModal.entityType}
				entityId={feedbackModal.entityId}
				title={feedbackModal.title}
			/>
			<Alert
				isOpen={showSuccessAlert}
				onClose={() => setShowSuccessAlert(false)}
				title="Listing Submitted"
				message="Your listing has been successfully submitted and is pending review. It will be live once approved by an administrator."
				type="success"
				duration={8000}
			/>
		</div>
	);
}

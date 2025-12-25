import { usePrivy } from "@privy-io/react-auth";
import { Badge, Button } from "@commertize/ui";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Loader2, MessageSquare, Eye, Filter, X } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StatusItem {
	type: "KYC" | "INVESTOR" | "SPONSOR" | "LISTING";
	id: string; // Entity ID (UserId for profiles, ListingId for listings)
	title: string;
	status: string;
	updatedAt?: string;
	details?: any;
}

interface ReviewComment {
	id: string;
	entityType: string;
	entityId: string;
	content: string;
	createdAt: string;
	author: {
		firstName: string;
		lastName: string;
	};
}

export default function Submissions() {
	const { user, getAccessToken } = usePrivy();
	const [filterType, setFilterType] = useState<string>("ALL");
	const [selectedSubmission, setSelectedSubmission] =
		useState<StatusItem | null>(null);
	const navigate = useNavigate();

	// Fetch Overall Status
	const { data: onboardingStatus, isLoading: isLoadingStatus } = useQuery({
		queryKey: ["onboardingStatus"],
		queryFn: async () => {
			const token = await getAccessToken();
			const res = await api.get("/onboarding/status", token);
			return res;
		},
	});

	// Fetch My Listings
	const { data: myListings, isLoading: isLoadingListings } = useQuery({
		queryKey: ["myListings"],
		queryFn: async () => {
			const token = await getAccessToken();
			const res = await api.get("/listings/my-listings", token);
			return res;
		},
		enabled: !!user,
	});

	// Fetch Reviews/Comments
	const { data: reviews, isLoading: isLoadingReviews } = useQuery({
		queryKey: ["myReviews"],
		queryFn: async () => {
			const token = await getAccessToken();
			const res = await api.get("/reviews/my-reviews", token);
			return res as ReviewComment[];
		},
		enabled: !!user,
	});

	if (isLoadingStatus || isLoadingListings || isLoadingReviews) {
		return (
			<div className="min-h-screen bg-slate-50 flex flex-col">
				<Navbar />
				<div className="flex-1 flex justify-center items-center">
					<Loader2 className="animate-spin h-8 w-8 text-primary" />
				</div>
			</div>
		);
	}

	const submissions: StatusItem[] = [];

	if (onboardingStatus) {
		submissions.push({
			type: "KYC",
			id: onboardingStatus.user.id,
			title: "Identity Verification",
			status: onboardingStatus.kycStatus,
			updatedAt: onboardingStatus.user.createdAt, // fallback
			details: onboardingStatus.user,
		});

		if (onboardingStatus.investorQuestionnaire) {
			submissions.push({
				type: "INVESTOR",
				id: onboardingStatus.user.id,
				title: "Investor Accreditation",
				status: onboardingStatus.investorQuestionnaire.status,
				updatedAt: onboardingStatus.investorQuestionnaire.createdAt,
				details: onboardingStatus.investorQuestionnaire,
			});
		}

		if (onboardingStatus.sponsor) {
			submissions.push({
				type: "SPONSOR",
				id: onboardingStatus.user.id,
				title: "Sponsor Verification",
				status: onboardingStatus.sponsor.status,
				updatedAt: onboardingStatus.sponsor.createdAt,
				details: onboardingStatus.sponsor,
			});
		}
	}

	if (myListings) {
		myListings.forEach((listing: any) => {
			submissions.push({
				type: "LISTING",
				id: listing.id,
				title: `Listing: ${listing.name}`,
				status: listing.status,
				updatedAt: listing.updatedAt,
				details: listing,
			});
		});
	}

	const getCommentsFor = (type: string, id: string) => {
		if (!reviews) return [];
		return reviews.filter(
			(r: ReviewComment) => r.entityType === type && r.entityId === id
		);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "APPROVED":
			case "VERIFIED":
			case "ACTIVE":
			case "FULLY_FUNDED":
				return "default";
			case "PENDING":
			case "PENDING_REVIEW":
			case "TOKENIZING":
				return "secondary";
			case "REJECTED":
			case "FAILED":
			case "WITHDRAWN":
				return "destructive";
			case "DRAFT":
				return "outline";
			default:
				return "secondary";
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(new Date(dateString));
	};

	const formatDateTime = (dateString: string) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		}).format(new Date(dateString));
	};

	const filteredSubmissions = submissions.filter((item) => {
		if (filterType !== "ALL" && item.type !== filterType) return false;
		return true;
	});

	const handleResubmit = (submission: StatusItem) => {
		switch (submission.type) {
			case "KYC":
				navigate("/onboarding");
				break;
			case "INVESTOR":
				navigate("/onboarding?step=investor_profile");
				break;
			case "SPONSOR":
				navigate("/onboarding?step=sponsor_kyb");
				break;
			case "LISTING":
				navigate(`/listings/${submission.id}/edit`);
				break;
		}
	};

	// Sort by updatedAt desc
	filteredSubmissions.sort((a, b) => {
		const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
		const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
		return dateB - dateA;
	});

	return (
		<div className="min-h-screen bg-slate-50 pb-20">
			<Navbar />
			<div className="container mx-auto py-8">
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">My Submissions</h1>
					<div className="mt-4 md:mt-0 flex items-center gap-4">
						<div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border shadow-sm">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<select
								className="bg-transparent border-none text-sm focus:ring-0 outline-none"
								value={filterType}
								onChange={(e) => setFilterType(e.target.value)}
							>
								<option value="ALL">All Types</option>
								<option value="KYC">KYC</option>
								<option value="INVESTOR">Investor</option>
								<option value="SPONSOR">Sponsor</option>
								<option value="LISTING">Listing</option>
							</select>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-left">
							<thead className="bg-slate-50 text-muted-foreground border-b font-medium">
								<tr>
									<th className="px-6 py-4">Title</th>
									<th className="px-6 py-4">Type</th>
									<th className="px-6 py-4">Status</th>
									<th className="px-6 py-4">Last Updated</th>
									<th className="px-6 py-4">Feedback</th>
									<th className="px-6 py-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{filteredSubmissions.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className="px-6 py-12 text-center text-muted-foreground"
										>
											No submissions found.
										</td>
									</tr>
								) : (
									filteredSubmissions.map((item, idx) => {
										const finalVariant = getStatusColor(item.status) as any;
										const comments = getCommentsFor(item.type, item.id);
										const commentCount = comments.length;

										return (
											<tr
												key={`${item.type}-${item.id}-${idx}`}
												className="hover:bg-slate-50/50 transition-colors"
											>
												<td className="px-6 py-4 font-medium text-foreground">
													{item.title}
												</td>
												<td className="px-6 py-4">
													<Badge
														variant="outline"
														className="font-mono text-xs"
													>
														{item.type}
													</Badge>
												</td>
												<td className="px-6 py-4">
													<Badge variant={finalVariant}>
														{item.status
															? item.status.replace(/_/g, " ")
															: "UNKNOWN"}
													</Badge>
												</td>
												<td className="px-6 py-4 text-muted-foreground">
													{formatDate(item.updatedAt)}
												</td>
												<td className="px-6 py-4">
													{commentCount > 0 ? (
														<div className="flex items-center text-amber-600 gap-1 font-medium">
															<MessageSquare className="h-4 w-4" />
															{commentCount}
														</div>
													) : (
														<span className="text-muted-foreground text-xs">
															-
														</span>
													)}
												</td>
												<td className="px-6 py-4 text-right">
													<div className="flex items-center justify-end gap-2">
														<Button
															variant="text"
															className="text-primary hover:text-primary/80 hover:bg-primary/5 text-sm px-2 py-1"
															onClick={() => setSelectedSubmission(item)}
														>
															<Eye className="h-4 w-4 mr-2" />
															View
														</Button>
														{(item.status.toUpperCase() === "REJECTED" ||
															item.status.toUpperCase() === "PENDING" ||
															item.status.toUpperCase() === "PENDING_REVIEW") && (
																<Button
																	variant="outlined"
																	className="text-sm px-3 py-1"
																	onClick={() => handleResubmit(item)}
																>
																	{item.status.toUpperCase() === "REJECTED" ? "Resubmit" : "Edit"}
																</Button>
															)}
													</div>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Details Modal */}
			{selectedSubmission && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								{selectedSubmission.title}
								<Badge
									variant={getStatusColor(selectedSubmission.status) as any}
								>
									{selectedSubmission.status}
								</Badge>
							</h3>
							<button
								onClick={() => setSelectedSubmission(null)}
								className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-slate-200/50 transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto p-6 space-y-6">
							{/* Admin Feedback Section */}
							{getCommentsFor(selectedSubmission.type, selectedSubmission.id)
								.length > 0 && (
									<div className="space-y-3">
										<h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
											Review Feedback
										</h4>
										<div className="space-y-3">
											{getCommentsFor(
												selectedSubmission.type,
												selectedSubmission.id
											).map((comment) => (
												<div
													key={comment.id}
													className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900"
												>
													<div className="flex items-center justify-between mb-2">
														<span className="font-semibold text-amber-700">
															{comment.author.firstName} {comment.author.lastName}
														</span>
														<span className="text-xs text-amber-600/70">
															{formatDateTime(comment.createdAt)}
														</span>
													</div>
													<p>{comment.content}</p>
												</div>
											))}
										</div>
									</div>
								)}

							{/* Metadata Section */}
							<div className="space-y-3">
								<h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
									Submission Details
								</h4>
								<div className="bg-slate-50 rounded-lg border p-4 font-mono text-xs overflow-x-auto">
									<pre className="whitespace-pre-wrap">
										{JSON.stringify(selectedSubmission.details, null, 2)}
									</pre>
								</div>
							</div>
						</div>

						<div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
							<Button
								variant="outlined"
								onClick={() => setSelectedSubmission(null)}
							>
								Close
							</Button>
							{(selectedSubmission.status.toUpperCase() === "REJECTED" ||
								selectedSubmission.status.toUpperCase() === "PENDING" ||
								selectedSubmission.status.toUpperCase() === "PENDING_REVIEW") && (
									<Button onClick={() => handleResubmit(selectedSubmission)}>
										{selectedSubmission.status.toUpperCase() === "REJECTED" ? "Resubmit" : "Edit Submission"}
									</Button>
								)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

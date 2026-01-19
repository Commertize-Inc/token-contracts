import { usePrivy } from "@privy-io/react-auth";
import {
	Badge,
	Button,
	DataTable,
	DataTableColumnHeader,
} from "@commertize/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { api } from "../lib/api";
import {
	Loader2,
	MessageSquare,
	Eye,
	Filter,
	X,
	Bell,
	Send,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// --- Types ---
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

interface Notification {
	id: string;
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error" | "action_required";
	isRead: boolean;
	link?: string;
	createdAt: string;
}

export default function NotificationsPage() {
	const { user, getAccessToken, ready, authenticated } = usePrivy();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// View state: "inbox" | "outbox"
	const [activeTab, setActiveTab] = useState<"inbox" | "outbox">("inbox");

	const [selectedSubmission, setSelectedSubmission] =
		useState<StatusItem | null>(null);

	// --- Queries for OUTBOX (Submissions) ---
	const { data: onboardingStatus, isLoading: isLoadingStatus } = useQuery({
		queryKey: ["onboardingStatus"],
		queryFn: async () => {
			const token = await getAccessToken();
			const res = await api.get("/onboarding/status", token);
			return res;
		},
		enabled: !!user,
	});

	const { data: myListings, isLoading: isLoadingListings } = useQuery({
		queryKey: ["myListings"],
		queryFn: async () => {
			const token = await getAccessToken();
			const res = await api.get("/listings/my-listings", token);
			return res;
		},
		enabled: !!user,
	});

	const { data: reviews, isLoading: isLoadingReviews } = useQuery({
		queryKey: ["myReviews"],
		queryFn: async () => {
			const token = await getAccessToken();
			const res = await api.get("/reviews/my-reviews", token);
			return res as ReviewComment[];
		},
		enabled: !!user,
	});

	// --- Queries for INBOX (Notifications) ---
	const { data: notifications = [], isLoading: isLoadingNotifications } =
		useQuery<Notification[]>({
			queryKey: ["notifications"],
			queryFn: async () => {
				const token = await getAccessToken();
				if (!token) return [];
				const res = await api.get("/notifications", token);
				return res || [];
			},
			enabled: ready && authenticated,
			refetchInterval: 30000,
		});

	const markReadMutation = useMutation({
		mutationFn: async (id: string) => {
			const token = await getAccessToken();
			if (!token) throw new Error("No access token");
			await api.patch(`/ notifications / ${id}/read`, {}, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
		},
	});

	const markAllReadMutation = useMutation({
		mutationFn: async () => {
			const token = await getAccessToken();
			if (!token) throw new Error("No access token");
			await api.patch("/notifications/mark-all-read", {}, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
		},
	});

	// --- Loading State ---
	if (
		isLoadingStatus ||
		isLoadingListings ||
		isLoadingReviews ||
		(isLoadingNotifications && activeTab === "inbox")
	) {
		return (
			<DashboardLayout className="flex flex-col">
				<div className="flex-1 flex justify-center items-center">
					<Loader2 className="animate-spin h-8 w-8 text-primary" />
				</div>
			</DashboardLayout>
		);
	}

	// --- Data Processing for OUTBOX ---
	const submissions: StatusItem[] = [];

	if (onboardingStatus) {
		submissions.push({
			type: "KYC",
			id: onboardingStatus.user.id,
			title: "Identity Verification",
			status: onboardingStatus.kycStatus,
			updatedAt: onboardingStatus.user.createdAt,
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

	// Sort submissions
	submissions.sort((a, b) => {
		const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
		const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
		return dateB - dateA;
	});

	const getCommentsFor = (type: string, id: string) => {
		if (!reviews) return [];
		return reviews.filter(
			(r: ReviewComment) => r.entityType === type && r.entityId === id
		);
	};

	// Helper functions
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

	const handleNotificationClick = (notification: Notification) => {
		if (!notification.isRead) {
			markReadMutation.mutate(notification.id);
		}
	};

	// Columns for Outbox Table
	const columns: ColumnDef<StatusItem>[] = [
		{
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Title" />
			),
			cell: ({ row }) => (
				<div className="font-medium text-foreground">
					{row.getValue("title")}
				</div>
			),
			filterFn: (row, id, value) => {
				return (row.getValue(id) as string)
					.toLowerCase()
					.includes(value.toLowerCase());
			},
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant="outline" className="font-mono text-xs">
					{row.getValue("type")}
				</Badge>
			),
			filterFn: (row, id, value) => {
				return value === "ALL" || row.getValue(id) === value;
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge variant={getStatusColor(row.getValue("status")) as any}>
					{row.getValue("status")
						? (row.getValue("status") as string).replace(/_/g, " ")
						: "UNKNOWN"}
				</Badge>
			),
			filterFn: (row, id, value) => {
				return value === "ALL" || row.getValue(id) === value;
			},
		},
		{
			accessorKey: "updatedAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Last Updated" />
			),
			cell: ({ row }) => (
				<div className="text-muted-foreground">
					{formatDate(row.getValue("updatedAt"))}
				</div>
			),
		},
		{
			id: "feedback",
			header: "Feedback",
			cell: ({ row }) => {
				const item = row.original;
				const comments = getCommentsFor(item.type, item.id);
				const commentCount = comments.length;
				return commentCount > 0 ? (
					<div className="flex items-center text-amber-600 gap-1 font-medium">
						<MessageSquare className="h-4 w-4" />
						{commentCount}
					</div>
				) : (
					<span className="text-muted-foreground text-xs">-</span>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="flex items-center justify-end gap-2 text-right">
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
				);
			},
		},
	];

	return (
		<DashboardLayout className="pb-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header & Tabs */}
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
					<div className="flex items-center gap-4">
						<div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
							<button
								onClick={() => setActiveTab("inbox")}
								className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
									activeTab === "inbox"
										? "bg-slate-900 text-white shadow-md"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
								}`}
							>
								<Bell className="w-4 h-4" />
								Inbox
								{notifications.filter((n) => !n.isRead).length > 0 && (
									<span
										className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "inbox" ? "bg-white text-slate-900" : "bg-slate-200 text-slate-600"}`}
									>
										{notifications.filter((n) => !n.isRead).length}
									</span>
								)}
							</button>
							<button
								onClick={() => setActiveTab("outbox")}
								className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
									activeTab === "outbox"
										? "bg-slate-900 text-white shadow-md"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
								}`}
							>
								<Send className="w-4 h-4" />
								Outbox
							</button>
						</div>
					</div>
				</div>

				{/* Content */}
				{activeTab === "inbox" ? (
					<div>
						<div className="bg-white rounded-xl shadow-sm border overflow-hidden">
							<div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
								<h2 className="text-lg font-semibold text-slate-800">
									Recent Notifications
								</h2>
								{notifications.some((n) => !n.isRead) && (
									<button
										onClick={() => markAllReadMutation.mutate()}
										className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
									>
										Mark all as read
									</button>
								)}
							</div>

							<div className="divide-y divide-slate-100">
								{notifications.length === 0 ? (
									<div className="p-12 text-center text-slate-500">
										<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
											<Bell className="w-6 h-6 text-slate-400" />
										</div>
										<h3 className="text-lg font-medium text-slate-900">
											All caught up
										</h3>
										<p className="mt-1">
											You have no notifications at this time.
										</p>
									</div>
								) : (
									notifications.map((notification) => (
										<div
											key={notification.id}
											className={`p-6 transition-colors hover:bg-slate-50 group ${
												notification.isRead ? "bg-white" : "bg-blue-50/30"
											}`}
										>
											<div className="flex gap-4">
												<div
													className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${notification.isRead ? "bg-slate-200" : "bg-blue-500"}`}
												/>
												<div className="flex-1">
													<Link
														to={notification.link || "#"}
														onClick={() =>
															handleNotificationClick(notification)
														}
														className="block"
													>
														<div className="flex justify-between items-start">
															<h4
																className={`text-base ${notification.isRead ? "text-slate-700" : "text-slate-900 font-medium"}`}
															>
																{notification.title}
															</h4>
															<span className="text-xs text-slate-400 whitespace-nowrap ml-4">
																{formatDateTime(notification.createdAt)}
															</span>
														</div>
														<p className="text-slate-600 mt-1 leading-relaxed">
															{notification.message}
														</p>
													</Link>
												</div>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow-sm border p-4">
						<DataTable
							columns={columns}
							data={submissions}
							searchPlaceholder="Search submissions..."
							filterColumnName="title"
							renderToolbar={(table) => (
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border shadow-sm">
										<Filter className="h-4 w-4 text-muted-foreground" />
										<select
											className="bg-transparent border-none text-sm focus:ring-0 outline-none"
											value={
												(table.getColumn("type")?.getFilterValue() as string) ??
												"ALL"
											}
											onChange={(e) =>
												table.getColumn("type")?.setFilterValue(e.target.value)
											}
										>
											<option value="ALL">All Types</option>
											<option value="KYC">KYC</option>
											<option value="INVESTOR">Investor</option>
											<option value="SPONSOR">Sponsor</option>
											<option value="LISTING">Listing</option>
										</select>
									</div>
								</div>
							)}
						/>
					</div>
				)}
			</div>

			{/* Details Modal - Shared for Outbox */}
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
								selectedSubmission.status.toUpperCase() ===
									"PENDING_REVIEW") && (
								<Button onClick={() => handleResubmit(selectedSubmission)}>
									{selectedSubmission.status.toUpperCase() === "REJECTED"
										? "Resubmit"
										: "Edit Submission"}
								</Button>
							)}
						</div>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}

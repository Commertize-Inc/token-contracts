import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import {
	Button,
	Badge,
	DataTable,
	DataTableColumnHeader,
} from "@commertize/ui";
import { ColumnDef } from "@tanstack/react-table";
import {
	Loader2,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Filter,
	Eye,
	X,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { Navbar } from "../../components/Navbar";
import { SubmissionDetails } from "../../components/admin/SubmissionDetails";

interface Submission {
	id: string;
	type: "KYC" | "INVESTOR" | "SPONSOR" | "LISTING";
	status: string;
	submittedAt: string;
	title: string;
	user: {
		id: string;
		email: string;
		name: string;
	};
	details?: any;
}

export default function AdminReviews() {
	const queryClient = useQueryClient();
	const { getAccessToken } = usePrivy();
	const [showAll, setShowAll] = useState(false);
	const [selectedSubmission, setSelectedSubmission] =
		useState<Submission | null>(null);
	const [reviewAction, setReviewAction] = useState<
		| "APPROVE"
		| "REJECT"
		| "REQUEST_INFO"
		| "TOKENIZE"
		| "FREEZE"
		| "UPDATE_STATUS"
		| null
	>(null);
	const [comment, setComment] = useState("");

	const { data: response, isLoading } = useQuery({
		queryKey: ["adminSubmissions", showAll],
		queryFn: async () => {
			const token = await getAccessToken();
			const res = await api.get(
				`/admin/submissions${showAll ? "?includeFinalized=true" : ""}`,
				token
			);
			return res;
		},
	});

	const submissions: Submission[] = response?.submissions || [];

	const reviewMutation = useMutation({
		mutationFn: async ({
			id,
			type,
			action,
			comment,
			newStatus,
		}: {
			id: string;
			type: string;
			action: string;
			comment?: string;
			newStatus?: string;
		}) => {
			const token = await getAccessToken();
			await api.post(
				`/admin/submissions/${type}/${id}/review`,
				{ action, comment, newStatus },
				token
			);
		},
		onSuccess: () => {
			alert("Review submitted successfully");
			queryClient.invalidateQueries({ queryKey: ["adminSubmissions"] });
			setSelectedSubmission(null);
			setReviewAction(null);
			setComment("");
		},
		onError: (err: any) => {
			console.error(err);
			alert(`Failed to submit review: ${err.message || "Unknown error"}`);
		},
	});

	// ESC key handler for closing modal
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && selectedSubmission) {
				setSelectedSubmission(null);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [selectedSubmission]);

	const handleSubmitReview = () => {
		if (selectedSubmission && reviewAction) {
			const payload: any = {
				id: selectedSubmission.id,
				type: selectedSubmission.type,
				action: reviewAction,
			};

			if (reviewAction === "UPDATE_STATUS") {
				// repurposing comment state for status selection
				payload.newStatus = comment;
			} else {
				payload.comment = comment;
			}

			reviewMutation.mutate(payload);
		}
	};

	const formatDate = (dateString: string) => {
		return new Intl.DateTimeFormat("en-US", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(dateString));
	};

	// const filteredSubmissions = submissions.filter((sub) => {
	// 	if (filterType !== "ALL" && sub.type !== filterType) return false;
	// 	return true;
	// });

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

	if (isLoading)
		return (
			<div className="flex justify-center p-8">
				<Loader2 className="animate-spin h-8 w-8 text-primary" />
			</div>
		);

	const columns: ColumnDef<Submission>[] = [
		{
			accessorKey: "user",
			header: "Applicant",
			cell: ({ row }) => {
				const user = row.original.user;
				return (
					<div>
						<div className="font-medium text-foreground">{user.name}</div>
						<div className="text-xs text-muted-foreground">{user.email}</div>
					</div>
				);
			},
			filterFn: (row, id, value) => {
				const user = row.getValue(id) as { name: string; email: string };
				return (
					user.name.toLowerCase().includes(value.toLowerCase()) ||
					user.email.toLowerCase().includes(value.toLowerCase())
				);
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
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Title" />
			),
			cell: ({ row }) => (
				<div className="text-foreground font-medium">
					{row.getValue("title")}
				</div>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge variant={getStatusColor(row.getValue("status")) as any}>
					{(row.getValue("status") as string).replace(/_/g, " ")}
				</Badge>
			),
			filterFn: (row, id, value) => {
				return value === "ALL" || row.getValue(id) === value;
			},
		},
		{
			accessorKey: "submittedAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Submitted At" />
			),
			cell: ({ row }) => (
				<div className="text-muted-foreground">
					{formatDate(row.getValue("submittedAt"))}
				</div>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<div className="text-right">
					<Button
						variant="text"
						className="text-primary hover:text-primary/80 hover:bg-primary/5 text-sm px-2 py-1"
						onClick={() => {
							setSelectedSubmission(row.original);
							setReviewAction(null); // Reset action
						}}
					>
						<Eye className="h-4 w-4 mr-2" />
						Review
					</Button>
				</div>
			),
		},
	];

	return (
		<div className="min-h-screen bg-slate-50 pb-20">
			<Navbar />
			<div className="container mx-auto py-8">
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">Review Queue</h1>
					<div className="mt-4 md:mt-0 flex items-center gap-4">
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="showAll"
								checked={showAll}
								onChange={(e) => setShowAll(e.target.checked)}
								className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
							/>
							<label
								htmlFor="showAll"
								className="text-sm text-slate-700 cursor-pointer select-none"
							>
								Show All History
							</label>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border p-4">
					<DataTable
						columns={columns}
						data={submissions}
						searchPlaceholder="Search applicants..."
						filterColumnName="user"
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

				{/* Enhanced Review Modal */}
				{selectedSubmission && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
						<div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
							{/* Left: Metadata Details */}
							<div className="flex-1 border-r border-slate-100 flex flex-col min-h-[300px]">
								<div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
									<h3 className="font-semibold text-lg">Submission Details</h3>
									<div className="flex items-center gap-2">
										<Badge
											variant={getStatusColor(selectedSubmission.status) as any}
										>
											{selectedSubmission.status}
										</Badge>
										<button
											onClick={() => setSelectedSubmission(null)}
											className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-slate-100 transition-colors"
										>
											<X className="h-5 w-5" />
										</button>
									</div>
								</div>
								<div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
									<div className="space-y-4">
										<div>
											<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Applicant
											</label>
											<div className="text-sm font-medium">
												{selectedSubmission.user.name}
											</div>
											<div className="text-xs text-muted-foreground">
												{selectedSubmission.user.email}
											</div>
										</div>

										<div className="border-t pt-4">
											<SubmissionDetails
												type={selectedSubmission.type}
												details={selectedSubmission.details}
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Right: Actions */}
							<div className="w-full md:w-96 flex flex-col bg-white">
								<div className="px-6 py-4 border-b flex justify-between items-center">
									<h3 className="font-semibold text-lg">Actions</h3>
									<button
										onClick={() => setSelectedSubmission(null)}
										className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-slate-100 transition-colors"
									>
										<X className="h-5 w-5" />
									</button>
								</div>

								<div className="flex-1 p-6 flex flex-col gap-6">
									{/* Action Selection Buttons */}
									<div className="grid grid-cols-1 gap-3">
										{selectedSubmission.type === "LISTING" ? (
											<>
												<Button
													variant={
														reviewAction === "TOKENIZE" ? "primary" : "outlined"
													}
													className={`justify-start ${reviewAction === "TOKENIZE" ? "bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white" : "hover:border-indigo-600 hover:text-indigo-600"}`}
													onClick={() => setReviewAction("TOKENIZE")}
												>
													<CheckCircle className="mr-2 h-4 w-4" /> Tokenize
												</Button>

												<Button
													variant={
														reviewAction === "FREEZE" ? "primary" : "outlined"
													}
													className={`justify-start ${reviewAction === "FREEZE" ? "bg-cyan-600 hover:bg-cyan-700 border-cyan-600 text-white" : "hover:border-cyan-600 hover:text-cyan-600"}`}
													onClick={() => setReviewAction("FREEZE")}
												>
													<AlertTriangle className="mr-2 h-4 w-4" /> Freeze
												</Button>

												<div className="pt-2 border-t mt-2">
													<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
														Set Status Manually
													</label>
													<select
														className="w-full rounded-md border text-sm p-2"
														onChange={(e) => {
															setReviewAction("UPDATE_STATUS");
															setComment(e.target.value); // Using comment state to store status temporarily for UPDATE_STATUS action
														}}
														value={
															reviewAction === "UPDATE_STATUS" ? comment : ""
														}
													>
														<option value="">Select Status...</option>
														<option value="DRAFT">Draft</option>
														<option value="PENDING_REVIEW">
															Pending Review
														</option>
														<option value="APPROVED">Approved</option>
														<option value="TOKENIZING">Tokenizing</option>
														<option value="ACTIVE">Active</option>
														<option value="FULLY_FUNDED">Fully Funded</option>
														<option value="REJECTED">Rejected</option>
														<option value="WITHDRAWN">Withdrawn</option>
														<option value="FROZEN">Frozen</option>
													</select>
												</div>
											</>
										) : (
											<>
												<Button
													variant={
														reviewAction === "APPROVE" ? "primary" : "outlined"
													}
													className={`justify-start ${reviewAction === "APPROVE" ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" : "hover:border-green-600 hover:text-green-600"}`}
													onClick={() => setReviewAction("APPROVE")}
												>
													<CheckCircle className="mr-2 h-4 w-4" /> Approve
												</Button>

												<Button
													variant={
														reviewAction === "REQUEST_INFO"
															? "secondary"
															: "outlined"
													}
													className={`justify-start ${reviewAction === "REQUEST_INFO" ? "bg-amber-100 text-amber-900 border-amber-200" : "hover:border-amber-500 hover:text-amber-600"}`}
													onClick={() => setReviewAction("REQUEST_INFO")}
												>
													<AlertTriangle className="mr-2 h-4 w-4" /> Request
													Info
												</Button>

												<Button
													variant={
														reviewAction === "REJECT" ? "primary" : "outlined"
													}
													className={`justify-start ${reviewAction === "REJECT" ? "bg-red-600 hover:bg-red-700 border-red-600 text-white" : "hover:border-red-600 hover:text-red-600"}`}
													onClick={() => setReviewAction("REJECT")}
												>
													<XCircle className="mr-2 h-4 w-4" /> Reject
												</Button>
											</>
										)}
									</div>

									{/* Comment Box */}
									{reviewAction && reviewAction !== "UPDATE_STATUS" && (
										<div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
											<label className="text-sm font-medium">
												Comment{" "}
												{reviewAction !== "APPROVE" &&
													reviewAction !== "TOKENIZE" && (
														<span className="text-red-500">*</span>
													)}
											</label>
											<textarea
												className="w-full min-h-[120px] p-3 border rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
												placeholder={
													reviewAction === "APPROVE" ||
													reviewAction === "TOKENIZE"
														? "Optional comment"
														: `Reason for ${reviewAction === "REJECT" ? "rejection" : "action"}...`
												}
												value={comment}
												onChange={(e) => setComment(e.target.value)}
												autoFocus
											/>
										</div>
									)}
								</div>

								<div className="p-6 border-t bg-slate-50 flex justify-end gap-2">
									<Button
										variant="text"
										onClick={() => setSelectedSubmission(null)}
									>
										Cancel
									</Button>
									<Button
										onClick={handleSubmitReview}
										disabled={
											!reviewAction ||
											reviewMutation.isPending ||
											(reviewAction !== "APPROVE" &&
												reviewAction !== "TOKENIZE" &&
												reviewAction !== "UPDATE_STATUS" &&
												!comment.trim())
										}
										variant="primary"
										className={
											reviewAction === "REJECT"
												? "bg-red-600 hover:bg-red-700"
												: reviewAction === "APPROVE"
													? "bg-green-600 hover:bg-green-700"
													: ""
										}
									>
										{reviewMutation.isPending && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Confirm Decision
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

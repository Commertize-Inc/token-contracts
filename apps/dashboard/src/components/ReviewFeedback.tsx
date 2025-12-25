import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Button } from "@commertize/ui";
import { Send, MessageSquare } from "lucide-react";
import { EntityType } from "@commertize/data/enums";

interface ReviewComment {
	id: string;
	content: string;
	isInternal: boolean;
	createdAt: string;
	author: {
		firstName: string;
		lastName: string;
		email: string;
	};
}

interface ReviewFeedbackProps {
	entityType: EntityType;
	entityId: string;
	title?: string;
}

export function ReviewFeedback({
	entityType,
	entityId,
	title = "Review Feedback",
}: ReviewFeedbackProps) {
	const [reply, setReply] = useState("");
	const queryClient = useQueryClient();

	const { data: comments = [], isLoading } = useQuery<ReviewComment[]>({
		queryKey: ["reviews", entityType, entityId],
		queryFn: async () => {
			// Current endpoint fetches ALL user reviews, filtering might be needed client side or update endpoint
			// Actually the endpoint /reviews/my-reviews returns all relative to user and their listings.
			// We might want to filter client-side for this simple implementation or add logic to endpoint.
			// Let's rely on client-side filtering from the big list for now to save backend churn,
			// or better: The endpoint returns ALL. We filter by entityId.
			const all = await api.get("/reviews/my-reviews");
			return all.filter(
				(c: any) => c.entityId === entityId && c.entityType === entityType
			);
		},
	});

	const replyMutation = useMutation({
		mutationFn: async (content: string) => {
			await api.post("/reviews", {
				entityType,
				entityId,
				content,
			});
		},
		onSuccess: () => {
			setReply("");
			queryClient.invalidateQueries({
				queryKey: ["reviews", entityType, entityId],
			});
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!reply.trim()) return;
		replyMutation.mutate(reply);
	};

	if (isLoading)
		return <div className="text-sm text-slate-500">Loading feedback...</div>;
	if (comments.length === 0) return null;

	return (
		<div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
			<div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
				<MessageSquare className="w-4 h-4 text-slate-500" />
				<h3 className="text-sm font-semibold text-slate-800">{title}</h3>
			</div>

			<div className="max-h-60 overflow-y-auto p-4 space-y-4">
				{comments.map((comment) => {
					// Distinguish User vs Admin.
					// Ideally we check if author is self.
					// For now, let's assume if it's NOT internal and author is NOT us??
					// Wait, Admin comments are sent with isInternal=false too so user can see them.
					// We need to know who "we" are.
					// Let's assume the API returns author populated.
					// We can check local user (we don't have it here contextually but can infer visual style).
					// Actually, Admin comments usually come from "Commertize Admin".
					// Let's just style them.
					return (
						<div key={comment.id} className="flex flex-col gap-1">
							<div className="flex justify-between items-baseline">
								<span className="text-xs font-semibold text-slate-700">
									{comment.author.firstName} {comment.author.lastName}
								</span>
								<span className="text-[10px] text-slate-400">
									{new Date(comment.createdAt).toLocaleString()}
								</span>
							</div>
							<p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
								{comment.content}
							</p>
						</div>
					);
				})}
			</div>

			<div className="p-4 border-t border-slate-100 bg-slate-50/50">
				<form onSubmit={handleSubmit} className="flex gap-2">
					<input
						type="text"
						value={reply}
						onChange={(e) => setReply(e.target.value)}
						placeholder="Type a reply..."
						className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
					/>
					<Button
						type="submit"
						disabled={replyMutation.isPending || !reply.trim()}
						className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3"
					>
						{replyMutation.isPending ? (
							"Sending..."
						) : (
							<Send className="w-4 h-4" />
						)}
					</Button>
				</form>
			</div>
		</div>
	);
}

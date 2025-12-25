import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

interface Notification {
	id: string;
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error" | "action_required";
	isRead: boolean;
	link?: string;
	createdAt: string;
}

export function NotificationsDropdown() {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	const { getAccessToken, authenticated, ready } = usePrivy();

	const { data: notifications = [] } = useQuery<Notification[]>({
		queryKey: ["notifications"],
		queryFn: async () => {
			const token = await getAccessToken();
			if (!token) return [];
			const res = await api.get("/notifications", token);
			return res || [];
		},
		enabled: ready && authenticated,
		refetchInterval: 30000, // Poll every 30s
	});

	const { data: unreadCountData } = useQuery({
		queryKey: ["notifications", "unread"],
		queryFn: async () => {
			const token = await getAccessToken();
			if (!token) return { count: 0 };
			const res = await api.get("/notifications/unread-count", token);
			return res;
		},
		enabled: ready && authenticated,
		refetchInterval: 30000,
	});

	const markReadMutation = useMutation({
		mutationFn: async (id: string) => {
			const token = await getAccessToken();
			if (!token) throw new Error("No access token");
			await api.patch(`/notifications/${id}/read`, {}, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
		},
	});

	const unreadCount = unreadCountData?.count || 0;

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleNotificationClick = (notification: Notification) => {
		if (!notification.isRead) {
			markReadMutation.mutate(notification.id);
		}
		setIsOpen(false);
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100"
			>
				<Bell className="w-5 h-5" />
				{unreadCount > 0 && (
					<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
					<div className="p-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
						<h3 className="font-semibold text-sm text-slate-800">
							Notifications
						</h3>
						{unreadCount > 0 && (
							<button
								onClick={async () => {
									const token = await getAccessToken();
									if (token) {
										await api.patch("/notifications/mark-all-read", {}, token);
										queryClient.invalidateQueries({
											queryKey: ["notifications"],
										});
										queryClient.invalidateQueries({
											queryKey: ["notifications", "unread"],
										});
									}
								}}
								className="text-xs text-blue-600 hover:text-blue-700 font-medium"
							>
								Mark all read
							</button>
						)}
					</div>
					<div className="max-h-[400px] overflow-y-auto">
						{notifications.length === 0 ? (
							<div className="p-8 text-center text-slate-500 text-sm">
								No notifications
							</div>
						) : (
							<div className="divide-y divide-slate-50">
								{notifications.map((notification) => (
									<div
										key={notification.id}
										className={`p-4 hover:bg-slate-50 transition-colors ${
											notification.isRead ? "opacity-60" : "bg-blue-50/30"
										}`}
									>
										<Link
											to={notification.link || "#"}
											onClick={() => handleNotificationClick(notification)}
											className="block"
										>
											<div className="flex gap-3">
												<div className="flex-1">
													<p
														className={`text-sm ${
															notification.isRead
																? "text-slate-700"
																: "text-slate-900 font-medium"
														}`}
													>
														{notification.title}
													</p>
													<p className="text-xs text-slate-500 mt-1 line-clamp-2">
														{notification.message}
													</p>
													<p className="text-[10px] text-slate-400 mt-2">
														{new Date(
															notification.createdAt
														).toLocaleDateString()}
													</p>
												</div>
												{!notification.isRead && (
													<div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
												)}
											</div>
										</Link>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

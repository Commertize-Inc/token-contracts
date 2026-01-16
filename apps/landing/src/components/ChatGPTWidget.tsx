import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";
import {
	Send,
	X,
	Brain,
	RefreshCw,
	Copy,
	ThumbsUp,
	ThumbsDown,
} from "lucide-react";
import { Button } from "@commertize/ui";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../hooks/use-toast";

interface Message {
	id: string;
	content: string;
	role: "user" | "assistant";
	timestamp: Date;
	reactions?: { helpful?: boolean; unhelpful?: boolean };
	suggestedActions?: string[];
}

export default function ChatGPTWidget() {
	const [isOpen, setIsOpen] = useState(false);
	const [isMinimized] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			content:
				"Welcome to Commertize! I'm RUNE.CTZ — your guide to tokenized commercial real estate.\n\nI can help you understand investment opportunities, market trends, and how tokenization works.\n\nWhat would you like to explore?",
			role: "assistant",
			timestamp: new Date(),
			suggestedActions: [
				"Investment opportunities",
				"How tokenization works",
				"Regulatory framework",
				"CRE market trends",
			],
		},
	]);
	const [inputMessage, setInputMessage] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const { toast } = useToast();

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const sendMessageMutation = useMutation({
		mutationFn: async (message: string) => {
			const data = await api.post("chat", {
				message,
				context: messages.slice(-5),
			});
			return data;
		},
		onMutate: () => setIsTyping(true),
		onSuccess: (data) => {
			setIsTyping(false);
			const assistantMessage: Message = {
				id: Date.now().toString() + "_assistant",
				content: data.response,
				role: "assistant",
				timestamp: new Date(),
				suggestedActions: data.suggestedActions || [],
			};
			setMessages((prev) => [...prev, assistantMessage]);
		},
		onError: () => {
			setIsTyping(false);
			toast({
				title: "Connection Error",
				description: "Failed to send message. Please try again.",
				variant: "destructive",
			});
		},
	});

	const handleSendMessage = () => {
		if (!inputMessage.trim()) return;

		const userMessage: Message = {
			// Event handler - creating message ID is intentional
			// eslint-disable-next-line
			id: Date.now().toString(),
			content: inputMessage,
			role: "user",

			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		sendMessageMutation.mutate(inputMessage);
		setInputMessage("");
	};

	const handleSuggestedAction = (action: string) => {
		setInputMessage(action);
		setTimeout(() => handleSendMessage(), 100);
	};

	const handleCopyMessage = (content: string) => {
		navigator.clipboard.writeText(content);
		toast({ title: "Copied!", description: "Message copied to clipboard" });
	};

	const handleReaction = (
		messageId: string,
		reaction: "helpful" | "unhelpful"
	) => {
		setMessages((prev) =>
			prev.map((msg) =>
				msg.id === messageId
					? {
						...msg,
						reactions: {
							...msg.reactions,
							[reaction]: !msg.reactions?.[reaction],
						},
					}
					: msg
			)
		);
	};

	const startNewChat = () => {
		setMessages([
			{
				id: "1",
				content:
					"Welcome back! I'm ready to help you explore Commertize's real estate investment opportunities.\n\nExplore:\n• Tokenized commercial real estate\n• Commertize Nexus DeFi\n• OmniGrid green energy investments\n\nPowered by Commertize Intelligence – RUNE.CTZ.",
				role: "assistant",
				timestamp: new Date(),
				suggestedActions: [
					"I want to invest",
					"Nexus DeFi",
					"OmniGrid projects",
					"How does it work?",
				],
			},
		]);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	useEffect(() => {
		if (messages.length > 1) {
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	}, [messages]);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.style.height = "auto";
			inputRef.current.style.height =
				Math.min(inputRef.current.scrollHeight, 120) + "px";
		}
	}, [inputMessage]);

	if (!hasMounted) return null;

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.8, y: 20 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						className="fixed bottom-4 right-4 sm:right-6 z-[60]"
					>
						<div
							className={`w-80 sm:w-96 max-w-[calc(100vw-2rem)] shadow-sm rounded-2xl ${isMinimized ? "h-16" : "h-[650px] max-h-[calc(100vh-6rem)]"} transition-all duration-300 overflow-hidden relative`}
							style={{
								border: "6px solid #DDB35F",
								boxShadow: "0 0 8px rgba(212, 160, 23, 0.4)",
								backgroundColor: "white",
							}}
						>
							{/* ... (Same layout as original but ensuring no standard errors) ... */}
							<div className="flex flex-row items-center justify-between p-3 bg-gradient-to-r from-white to-gray-100 text-[#DDB35F] rounded-t-2xl">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full relative">
										<div className="w-full h-full bg-[#DDB35F]/20 rounded-full flex items-center justify-center">
											<Brain className="w-6 h-6 text-[#DDB35F]" />
										</div>
									</div>
									<div>
										<span className="font-sans font-light text-base text-black">
											RUNE.CTZ
										</span>
										<div className="text-xs font-sans font-light text-black">
											AI Real Estate Assistant
										</div>
									</div>
								</div>

								<div
									onClick={() => setIsOpen(false)}
									className="cursor-pointer h-8 w-8 bg-[#DDB35F] text-white hover:bg-[#C9A84E] rounded-lg flex items-center justify-center shadow-sm"
								>
									<X className="h-4 w-4" />
								</div>
							</div>

							{!isMinimized && (
								<div
									className="flex flex-col"
									style={{ height: "calc(100% - 70px)" }}
								>
									<div
										className="p-4 overflow-y-auto messages-container gold-scrollbar bg-white"
										style={{ height: "420px" }}
									>
										<div className="space-y-4">
											{messages.map((message, index) => (
												<motion.div
													key={message.id}
													data-message-id={message.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.1 }}
													className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
												>
													<div
														className={`max-w-[85%] ${message.role === "user" ? "order-2" : ""}`}
													>
														<div
															className={`rounded-2xl p-4 text-sm leading-relaxed relative ${message.role === "user"
																	? "bg-gradient-to-br from-[#DDB35F] to-[#DDB35F] text-white ml-4 sm:ml-8 shadow-sm border-2 border-[#DDB35F]"
																	: "bg-white border-2 border-[#DDB35F] shadow-sm mr-4 sm:mr-8 text-black"
																}`}
														>
															<div
																className={`whitespace-pre-wrap font-sans ${message.role === "user"
																		? "font-light text-white"
																		: "font-light text-black"
																	}`}
															>
																{message.content}
															</div>

															<div
																className={`text-xs mt-3 font-sans font-light ${message.role === "user"
																		? "text-white/80"
																		: "text-black/80"
																	}`}
															>
																{message.role === "assistant"
																	? "RUNE.CTZ • "
																	: ""}
																{message.timestamp.toLocaleTimeString([], {
																	hour: "2-digit",
																	minute: "2-digit",
																})}
															</div>
														</div>

														{message.role === "assistant" && (
															<div className="flex items-center gap-2 mt-2 px-2">
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		handleCopyMessage(message.content)
																	}
																	className="h-6 text-xs text-gray-500 hover:text-gray-700"
																>
																	<Copy className="w-3 h-3 mr-1" /> Copy
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		handleReaction(message.id, "helpful")
																	}
																	className={`h-6 text-xs ${message.reactions?.helpful ? "text-green-500" : "text-gray-500"}`}
																>
																	<ThumbsUp className="w-3 h-3" />
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		handleReaction(message.id, "unhelpful")
																	}
																	className={`h-6 text-xs ${message.reactions?.unhelpful ? "text-red-500" : "text-gray-500"}`}
																>
																	<ThumbsDown className="w-3 h-3" />
																</Button>
															</div>
														)}

														{message.role === "assistant" &&
															message.suggestedActions &&
															message.suggestedActions.length > 0 && (
																<div className="mt-3 grid grid-cols-2 gap-2">
																	{message.suggestedActions.map(
																		(action, idx) => (
																			<div
																				key={idx}
																				className="cursor-pointer bg-white hover:bg-[#DDB35F] hover:text-white text-[#DDB35F] border border-[#DDB35F] text-xs py-2 px-3 rounded-lg transition-all duration-200 font-light text-center"
																				onClick={() =>
																					handleSuggestedAction(action)
																				}
																			>
																				{action}
																			</div>
																		)
																	)}
																</div>
															)}
													</div>
												</motion.div>
											))}
											{isTyping && (
												<motion.div
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													className="flex justify-start"
												>
													<div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-4 mr-8 shadow-sm">
														<div className="flex items-center gap-2">
															<div className="w-2 h-2 bg-[#DDB35F] rounded-full animate-bounce"></div>
															<div
																className="w-2 h-2 bg-[#DDB35F] rounded-full animate-bounce"
																style={{ animationDelay: "0.1s" }}
															></div>
															<div
																className="w-2 h-2 bg-[#DDB35F] rounded-full animate-bounce"
																style={{ animationDelay: "0.2s" }}
															></div>
															<span className="text-xs text-gray-500 ml-2 font-sans font-light">
																RUNE.CTZ is thinking...
															</span>
														</div>
													</div>
												</motion.div>
											)}
											<div ref={messagesEndRef} />
										</div>
									</div>

									<div className="border-t border-[#DDB35F]/30 bg-white flex-shrink-0 p-3 mt-2">
										<div className="flex gap-2 items-start">
											<textarea
												ref={inputRef}
												value={inputMessage}
												onChange={(e) => setInputMessage(e.target.value)}
												onKeyDown={handleKeyPress}
												placeholder="Curious about tokenization? Start typing…"
												disabled={sendMessageMutation.isPending}
												rows={2}
												className="flex-1 min-h-[48px] max-h-[120px] border-2 border-[#DDB35F] focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F]/20 bg-white text-sm font-light rounded-lg px-3 py-2 text-black placeholder:text-black/50 resize-none outline-none"
											/>

											<div className="flex gap-2">
												<div
													onClick={() =>
														inputMessage.trim() &&
														!sendMessageMutation.isPending &&
														handleSendMessage()
													}
													className="cursor-pointer bg-[#DDB35F] hover:bg-[#C9A84E] text-white px-2 py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all duration-200 hover:scale-105 min-w-[45px]"
												>
													{sendMessageMutation.isPending ? (
														<motion.div
															animate={{ rotate: 360 }}
															transition={{
																duration: 1,
																repeat: Infinity,
																ease: "linear",
															}}
														>
															<RefreshCw className="h-4 w-4" />
														</motion.div>
													) : (
														<Send className="h-4 w-4" />
													)}
													<span className="text-sm">Send</span>
												</div>

												<div
													onClick={startNewChat}
													className="cursor-pointer bg-[#DDB35F] hover:bg-[#C9A84E] text-white px-2 py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all duration-200 hover:scale-105 min-w-[45px]"
												>
													<RefreshCw className="h-4 w-4" />
													<span className="text-sm">New</span>
												</div>
											</div>
										</div>
									</div>

									<div className="bg-gradient-to-r from-white to-gray-100 border-t border-[#DDB35F]/20 p-3 flex-shrink-0 rounded-b-2xl">
										<div className="flex items-center justify-center gap-2 text-sm">
											<div className="w-2 h-2 bg-[#DDB35F] rounded-full animate-pulse shadow-sm"></div>
											<span className="font-sans font-bold text-[#DDB35F]">
												Powered by Commertize Intelligence™
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{!isOpen && (
				<motion.button
					onClick={() => setIsOpen(true)}
					className="fixed bottom-4 right-3 sm:right-6 z-[60] transition-all duration-300 flex items-center justify-center group hover:scale-110 cursor-pointer"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3, delay: 0.5 }}
					style={{ background: "none", border: "none", padding: 0 }}
				>
					{/* Smaller on mobile (w-12), normal on desktop (w-16) */}
					<div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#DDB35F] via-[#DDB35F] to-[#DDB35F] p-1 border-2 border-[#DDB35F] shadow-sm relative flex items-center justify-center">
						<Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
					</div>
				</motion.button>
			)}
		</>
	);
}

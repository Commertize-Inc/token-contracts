"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, RefreshCw, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
        id: string;
        content: string;
        role: "user" | "assistant";
        timestamp: Date;
        suggestedActions?: string[];
}

interface ChatSession {
        id: string;
        title: string;
        messages: Message[];
        lastActive: Date;
}

export default function ChatWidget() {
        const [isOpen, setIsOpen] = useState(false);
        const [hasMounted, setHasMounted] = useState(false);
        const [currentSession, setCurrentSession] = useState<ChatSession>({
                id: "default",
                title: "New Chat",
                messages: [
                        {
                                id: "1",
                                content: "Welcome to Commertize! I'm RUNE.CTZ — your guide to tokenized commercial real estate.\n\nI can help you understand investment opportunities, market trends, and how tokenization works.\n\nWhat would you like to explore?",
                                role: "assistant",
                                timestamp: new Date(),
                                suggestedActions: [
                                        "Investment opportunities",
                                        "How tokenization works",
                                        "Regulatory framework",
                                        "CRE market trends"
                                ]
                        },
                ],
                lastActive: new Date()
        });
        const [inputMessage, setInputMessage] = useState("");
        const [isTyping, setIsTyping] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const messagesEndRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLTextAreaElement>(null);

        useEffect(() => {
                setHasMounted(true);
        }, []);

        const sendMessage = async (message: string) => {
                if (!message.trim()) return;

                setError(null);
                const userMessage: Message = {
                        id: Date.now().toString(),
                        content: message,
                        role: "user",
                        timestamp: new Date(),
                };

                setCurrentSession(prev => ({
                        ...prev,
                        messages: [...prev.messages, userMessage],
                        lastActive: new Date()
                }));
                setInputMessage("");
                setIsTyping(true);

                try {
                        const response = await fetch("/api/chat", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                        message,
                                        context: currentSession.messages.slice(-5)
                                }),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                                throw new Error(data.error || "Failed to send message");
                        }

                        const assistantMessage: Message = {
                                id: Date.now().toString() + "_assistant",
                                content: data.response,
                                role: "assistant",
                                timestamp: new Date(),
                                suggestedActions: data.suggestedActions || []
                        };

                        setCurrentSession(prev => ({
                                ...prev,
                                messages: [...prev.messages, assistantMessage],
                                lastActive: new Date()
                        }));
                } catch (err: any) {
                        setError(err.message || "Failed to send message. Please try again.");
                } finally {
                        setIsTyping(false);
                }
        };

        const handleSendMessage = () => {
                if (inputMessage.trim()) {
                        sendMessage(inputMessage);
                }
        };

        const handleSuggestedAction = (action: string) => {
                sendMessage(action);
        };

        const startNewChat = () => {
                setCurrentSession({
                        id: Date.now().toString(),
                        title: "New Chat",
                        messages: [
                                {
                                        id: "1",
                                        content: "Welcome back! I'm ready to help you explore investment opportunities.\n\nWhat would you like to know?",
                                        role: "assistant",
                                        timestamp: new Date(),
                                        suggestedActions: ["I want to invest", "How does it work?", "Market trends"]
                                },
                        ],
                        lastActive: new Date()
                });
                setError(null);
        };

        const handleKeyPress = (e: React.KeyboardEvent) => {
                if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                }
        };

        useEffect(() => {
                if (currentSession.messages.length > 1) {
                        setTimeout(() => {
                                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                }
        }, [currentSession.messages]);

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
                                                className="fixed bottom-20 right-4 sm:right-6 z-[60]"
                                        >
                                                <div
                                                        className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] shadow-xl rounded-2xl h-[550px] max-h-[calc(100vh-8rem)] overflow-hidden relative bg-white"
                                                        style={{
                                                                border: '3px solid #D4A024',
                                                                boxShadow: '0 4px 20px rgba(212, 160, 36, 0.2)',
                                                        }}
                                                >
                                                        <div className="flex flex-row items-center justify-between p-3 bg-gradient-to-r from-white to-gray-50 border-b border-gray-100">
                                                                <div className="flex items-center gap-3">
                                                                        <motion.div
                                                                                animate={{ y: [0, -2, 0] }}
                                                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                                                className="relative"
                                                                        >
                                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A024] to-[#B8881C] flex items-center justify-center text-white font-light text-sm">
                                                                                        R
                                                                                </div>
                                                                                <motion.div
                                                                                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                                                                        transition={{ duration: 2, repeat: Infinity }}
                                                                                        className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"
                                                                                />
                                                                        </motion.div>
                                                                        <div>
                                                                                <span className="font-light text-sm text-gray-900">RUNE.CTZ</span>
                                                                                <div className="text-xs font-light text-gray-500">AI Real Estate Assistant</div>
                                                                        </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                        <button
                                                                                onClick={startNewChat}
                                                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                                                title="New Chat"
                                                                        >
                                                                                <RefreshCw className="h-4 w-4 text-gray-500" />
                                                                        </button>
                                                                        <button
                                                                                onClick={() => setIsOpen(false)}
                                                                                className="p-2 bg-[#D4A024] text-white hover:bg-[#B8881C] rounded-lg transition-colors"
                                                                        >
                                                                                <X className="h-4 w-4" />
                                                                        </button>
                                                                </div>
                                                        </div>

                                                        <div className="flex flex-col" style={{ height: 'calc(100% - 60px)' }}>
                                                                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                                                                        <div className="space-y-4">
                                                                                {currentSession.messages.map((message, index) => (
                                                                                        <motion.div
                                                                                                key={message.id}
                                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                                transition={{ delay: index * 0.05 }}
                                                                                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                                                                        >
                                                                                                <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : ""}`}>
                                                                                                        <div
                                                                                                                className={`rounded-2xl p-3 text-sm leading-relaxed ${message.role === "user"
                                                                                                                                ? "bg-[#D4A024] text-white ml-4"
                                                                                                                                : "bg-white border border-gray-200 shadow-sm mr-4 text-gray-800"
                                                                                                                        }`}
                                                                                                        >
                                                                                                                <div className="whitespace-pre-wrap font-light">{message.content}</div>
                                                                                                                <div className={`text-xs mt-2 font-light ${message.role === "user" ? "text-white/70" : "text-gray-400"
                                                                                                                        }`}>
                                                                                                                        {message.role === "assistant" ? "RUNE.CTZ • " : ""}
                                                                                                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                                                </div>
                                                                                                        </div>

                                                                                                        {message.role === "assistant" && message.suggestedActions && message.suggestedActions.length > 0 && (
                                                                                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                                                                                        {message.suggestedActions.map((action, idx) => (
                                                                                                                                <button
                                                                                                                                        key={idx}
                                                                                                                                        className="text-xs px-2.5 py-1 rounded-full border border-[#D4A024] text-[#D4A024] hover:bg-[#D4A024] hover:text-white transition-colors font-light"
                                                                                                                                        onClick={() => handleSuggestedAction(action)}
                                                                                                                                >
                                                                                                                                        {action}
                                                                                                                                </button>
                                                                                                                        ))}
                                                                                                                </div>
                                                                                                        )}
                                                                                                </div>
                                                                                        </motion.div>
                                                                                ))}

                                                                                {isTyping && (
                                                                                        <motion.div
                                                                                                initial={{ opacity: 0 }}
                                                                                                animate={{ opacity: 1 }}
                                                                                                className="flex justify-start"
                                                                                        >
                                                                                                <div className="bg-white border border-gray-200 rounded-2xl p-3 mr-4 shadow-sm">
                                                                                                        <div className="flex items-center gap-1.5">
                                                                                                                <div className="w-2 h-2 bg-[#D4A024] rounded-full animate-bounce"></div>
                                                                                                                <div className="w-2 h-2 bg-[#D4A024] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                                                                                                <div className="w-2 h-2 bg-[#D4A024] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                                                                                                <span className="text-xs text-gray-400 ml-2 font-light">RUNE.CTZ is thinking...</span>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </motion.div>
                                                                                )}

                                                                                {error && (
                                                                                        <motion.div
                                                                                                initial={{ opacity: 0 }}
                                                                                                animate={{ opacity: 1 }}
                                                                                                className="flex justify-center"
                                                                                        >
                                                                                                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600 font-light">
                                                                                                        {error}
                                                                                                </div>
                                                                                        </motion.div>
                                                                                )}

                                                                                <div ref={messagesEndRef} />
                                                                        </div>
                                                                </div>

                                                                <div className="border-t border-gray-200 bg-white p-3">
                                                                        <div className="flex gap-2 items-end">
                                                                                <textarea
                                                                                        ref={inputRef}
                                                                                        value={inputMessage}
                                                                                        onChange={(e) => setInputMessage(e.target.value)}
                                                                                        onKeyPress={handleKeyPress}
                                                                                        placeholder="Ask me anything..."
                                                                                        disabled={isTyping}
                                                                                        rows={1}
                                                                                        className="flex-1 min-h-[40px] max-h-[100px] border border-gray-200 focus:border-[#D4A024] focus:ring-1 focus:ring-[#D4A024] bg-white text-sm font-light rounded-xl px-3 py-2 text-gray-800 placeholder:text-gray-400 resize-none outline-none transition-colors"
                                                                                />
                                                                                <button
                                                                                        onClick={handleSendMessage}
                                                                                        disabled={!inputMessage.trim() || isTyping}
                                                                                        className="bg-[#D4A024] hover:bg-[#B8881C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
                                                                                >
                                                                                        <Send className="h-4 w-4" />
                                                                                </button>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>
                                        </motion.div>
                                )}
                        </AnimatePresence>

                        <motion.button
                                onClick={() => setIsOpen(!isOpen)}
                                className="fixed bottom-4 right-4 sm:right-6 z-[60] w-14 h-14 bg-[#D4A024] hover:bg-[#B8881C] text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                        boxShadow: '0 4px 15px rgba(212, 160, 36, 0.4)',
                                }}
                        >
                                {isOpen ? (
                                        <X className="h-6 w-6" />
                                ) : (
                                        <MessageCircle className="h-6 w-6" />
                                )}
                        </motion.button>
                </>
        );
}

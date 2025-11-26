"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Brain, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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

export default function ChatGPTWidget() {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message,
          context: currentSession.messages.slice(-5)
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onMutate: () => setIsTyping(true),
    onSuccess: (data) => {
      setIsTyping(false);
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
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Connection Error", 
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };
    setCurrentSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      lastActive: new Date()
    }));
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleSuggestedAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: action,
        role: "user",
        timestamp: new Date(),
      };
      setCurrentSession(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        lastActive: new Date()
      }));
      sendMessageMutation.mutate(action);
      setInputMessage("");
    }, 100);
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
            className="fixed bottom-4 right-4 sm:right-6 z-[60]"
          >
            <div 
              className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] shadow-sm rounded-2xl h-[650px] max-h-[calc(100vh-6rem)] overflow-hidden relative"
              style={{ 
                border: '6px solid #D4A024',
                boxShadow: '0 0 8px rgba(212, 160, 23, 0.4)',
                backgroundColor: 'white'
              }}
            >
              <div className="flex flex-row items-center justify-between p-3 bg-gradient-to-r from-white to-gray-100 text-[#D4A024] rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -2, 0], scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <img 
                      src="/assets/rune-ctz.png" 
                      alt="RUNE.CTZ" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#D4A024]"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"
                    />
                  </motion.div>
                  <div>
                    <span className="font-sans font-light text-base text-black">RUNE.CTZ</span>
                    <div className="text-xs font-sans font-light text-black">AI Real Estate Assistant</div>
                  </div>
                </div>
                
                <div 
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer h-8 w-8 bg-[#D4A024] text-white hover:bg-[#a67c00] rounded-lg flex items-center justify-center shadow-sm"
                >
                  <X className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex flex-col" style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-4 overflow-y-auto bg-white" style={{ height: '380px' }}>
                  <div className="space-y-4">
                    {currentSession.messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : ""}`}>
                          <div
                            className={`rounded-2xl p-4 text-sm leading-relaxed ${
                              message.role === "user"
                                ? "bg-[#D4A024] text-white ml-8 shadow-sm border-2 border-[#D4A024]"
                                : "bg-white border-2 border-[#D4A024] shadow-sm mr-8 text-black"
                            }`}
                          >
                            <div className="whitespace-pre-wrap font-sans font-light">{message.content}</div>
                            <div className={`text-xs mt-3 font-sans font-light ${
                              message.role === "user" ? "text-white/80" : "text-black/80"
                            }`}>
                              {message.role === "assistant" ? "RUNE.CTZ • " : ""}
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          {message.role === "assistant" && message.suggestedActions && message.suggestedActions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.suggestedActions.map((action, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-[#D4A024] hover:text-white bg-[#D4A024]/10 border-[#D4A024] text-[#D4A024] text-xs transition-colors"
                                  onClick={() => handleSuggestedAction(action)}
                                >
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white border-2 border-[#D4A024] rounded-2xl p-4 mr-8 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#D4A024] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[#D4A024] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-[#D4A024] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            <span className="text-xs text-gray-500 ml-2">RUNE.CTZ is thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                <div className="border-t border-[#D4A024]/30 bg-white flex-shrink-0 p-3 mt-2">
                  <div className="flex gap-2 items-start">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask me anything..."
                      disabled={sendMessageMutation.isPending}
                      rows={2}
                      className="flex-1 min-h-[48px] max-h-[120px] border-2 border-[#D4A024] focus:border-[#D4A024] bg-white text-sm font-light rounded-lg px-3 py-2 text-black placeholder:text-black/50 resize-none outline-none"
                    />
                    
                    <div className="flex gap-2">
                      <div
                        onClick={() => inputMessage.trim() && !sendMessageMutation.isPending && handleSendMessage()}
                        className="cursor-pointer bg-[#D4A024] hover:bg-[#a67c00] text-white px-2 py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm min-w-[45px]"
                      >
                        <Send className="h-4 w-4" />
                        <span className="text-sm">Send</span>
                      </div>
                      
                      <div 
                        onClick={startNewChat}
                        className="cursor-pointer bg-[#D4A024] hover:bg-[#a67c00] text-white px-2 py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm min-w-[45px]"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="text-sm">New</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 transition-colors overflow-hidden"
        style={{ 
          border: '3px solid #D4A024',
          boxShadow: '0 0 12px rgba(212, 160, 23, 0.5)',
          backgroundColor: isOpen ? '#D4A024' : 'transparent',
          padding: 0
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <img 
            src="/assets/rune-ctz.png" 
            alt="RUNE.CTZ" 
            className="w-full h-full object-cover rounded-full"
          />
        )}
      </motion.button>
    </>
  );
}

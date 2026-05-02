import React, { useState, useEffect, useRef } from "react";
import { Send, X, Bot, User, Sparkles, MessageSquare, Square, Check, Copy, ChevronDown } from "lucide-react";
import { Button } from "@gaki/ui/button";
import { Input } from "@gaki/ui/input";
import { ScrollArea } from "@gaki/ui/scroll-area";
import { cn } from "@gaki/core/lib/utils";
import { notify } from "@gaki/core/lib/notify";
import { Popover, PopoverContent, PopoverTrigger } from "@gaki/ui/popover";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

interface Model {
    id: string;
    object: string;
    created: number;
    owned_by: string;
}

interface AIChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

const CodeBlock = ({ inline, className, children, ...props }: any) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || "");
    const code = String(children).replace(/\n$/, "");

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!inline && match) {
        return (
            <div className="relative group my-2 rounded-xl overflow-hidden bg-foreground/[0.03] dark:bg-white/[0.03] border border-border/10">
                <div className="flex items-center justify-between px-3 py-1.5 bg-foreground/[0.02] dark:bg-white/[0.02] border-b border-border/10 text-[10px] text-muted-foreground/60">
                    <span className="uppercase tracking-wider font-medium">{match[1]}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-lg hover:bg-foreground/5"
                        onClick={handleCopy}
                    >
                        {isCopied ? <Check className="h-2.5 w-2.5 text-green-500" /> : <Copy className="h-2.5 w-2.5" />}
                    </Button>
                </div>
                <div className="p-3 overflow-x-auto text-[11px] font-mono leading-relaxed">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <code className={cn("bg-foreground/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md text-[11px] font-mono", className)} {...props}>
            {children}
        </code>
    );
};

export const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("swiss-ai/apertus-8b-instruct");
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const chatbotRef = useRef<HTMLDivElement>(null);

    const API_KEY = import.meta.env.VITE_PUBLIC_AI_KEY;
    const API_BASE_URL = "/api/apertus";

    useEffect(() => {
        if (isOpen) {
            fetchModels();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && !isLoading) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, isLoading]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                chatbotRef.current &&
                !chatbotRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                if (isLoading) {
                    stopGeneration();
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const fetchModels = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/v1/models`, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "User-Agent": "Gaki/1.0",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch models");

            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                setModels(data.data);
                if (data.data.length > 0 && !data.data.find((m: Model) => m.id === selectedModel)) {
                    setSelectedModel(data.data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: [...messages, userMessage],
                    stream: true,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (response.status === 429) {
                throw new Error("Rate limited. Please try again later.");
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.title || "Failed to send message");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");

            if (!reader) throw new Error("No response body");

            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const dataStr = line.replace("data: ", "");
                        if (dataStr === "[DONE]") break;

                        try {
                            const data = JSON.parse(dataStr);
                            const content = data.choices[0]?.delta?.content || "";
                            if (content) {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMsg = newMessages[newMessages.length - 1];
                                    if (lastMsg.role === "assistant") {
                                        lastMsg.content += content;
                                    }
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            }
            console.error("Error sending message:", error);
            notify.error("Error", error.message || "Something went wrong");
            setMessages(prev => [...prev, { role: "system", content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const stopPropagation = (e: React.UIEvent | React.TouchEvent | React.WheelEvent | React.MouseEvent) => {
        e.stopPropagation();
    };

    if (!isOpen) return null;

    return (
        <div
            ref={chatbotRef}
            data-no-pip-gesture
            className={cn(
                "fixed bottom-20 right-4 w-80 sm:w-[340px] max-h-[520px] h-[calc(100vh-100px)]",
                "bg-background/70 dark:bg-background/50 backdrop-blur-2xl",
                "border border-border/20 dark:border-white/10 rounded-2xl",
                "shadow-2xl shadow-black/10 dark:shadow-black/40",
                "flex flex-col z-50 overflow-hidden",
                "animate-in fade-in slide-in-from-top-3 duration-300"
            )}
            onWheel={stopPropagation}
            onTouchMove={stopPropagation}
            onTouchStart={stopPropagation}
            onTouchEnd={stopPropagation}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Subtle inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-4 py-3 border-b border-border/10 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-tight">AI Assistant</h3>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="flex items-center gap-1 text-[9px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                                    <span className="truncate max-w-[120px]">{selectedModel.split('/').pop()}</span>
                                    <ChevronDown className="w-2.5 h-2.5" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent 
                                className="w-56 p-1 rounded-xl border-border/20 dark:border-white/10 bg-background/95 backdrop-blur-2xl"
                                align="start"
                            >
                                <ScrollArea className="h-40" style={{ scrollbarWidth: 'none' }}>
                                    {models.map(model => (
                                        <button
                                            key={model.id}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] text-left transition-colors",
                                                selectedModel === model.id 
                                                    ? "bg-primary/10 text-primary" 
                                                    : "hover:bg-foreground/[0.03]"
                                            )}
                                            onClick={() => setSelectedModel(model.id)}
                                        >
                                            {selectedModel === model.id && <Check className="w-2.5 h-2.5 flex-shrink-0" />}
                                            <span className="truncate">{model.id}</span>
                                        </button>
                                    ))}
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-lg hover:bg-foreground/5 dark:hover:bg-white/10" 
                    onClick={onClose}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full px-4 py-4" ref={scrollAreaRef} onWheel={(e) => e.stopPropagation()}>
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-60 space-y-3 mt-16">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-primary/40" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-muted-foreground/70">How can I help?</p>
                                <p className="text-[10px] text-muted-foreground/40 mt-0.5">Ask me anything about your stream</p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex w-full gap-2",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {msg.role !== "user" && (
                                    <div className="w-5 h-5 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                                        <Bot className="w-2.5 h-2.5 text-primary" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[85%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-md"
                                            : "bg-foreground/[0.03] dark:bg-white/[0.04] rounded-bl-md"
                                    )}
                                >
                                    {msg.role === "user" ? (
                                        msg.content
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code: CodeBlock,
                                                    a: ({ node, ...props }) => <a className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer" {...props} />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-5 h-5 rounded-lg bg-foreground/[0.05] dark:bg-white/[0.05] flex-shrink-0 flex items-center justify-center mt-0.5">
                                        <User className="w-2.5 h-2.5 text-muted-foreground/70" />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input */}
            <div className="relative px-3 py-3 border-t border-border/10 dark:border-white/5">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        disabled={isLoading}
                        className={cn(
                            "pr-10 h-9 rounded-xl text-[12px]",
                            "bg-foreground/[0.03] dark:bg-white/[0.04]",
                            "border-border/10 dark:border-white/5",
                            "focus-visible:bg-background focus-visible:border-primary/20",
                            "placeholder:text-muted-foreground/40"
                        )}
                    />
                    {isLoading ? (
                        <Button
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                            onClick={stopGeneration}
                            title="Stop generation"
                        >
                            <Square className="h-2.5 w-2.5 fill-current" />
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg"
                            onClick={handleSend}
                            disabled={!input.trim()}
                        >
                            <Send className="h-3 w-3" />
                        </Button>
                    )}
                </div>
                <p className="text-[8px] text-center text-muted-foreground/40 mt-2">
                    AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
};

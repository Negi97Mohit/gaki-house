import React, { useState, useEffect, useRef } from "react";
import { Send, X, Bot, User, RefreshCw, Sparkles, MessageSquare, Square, Check, Copy } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/utils";
import { notify } from "@/shared/lib/notify";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
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
            <div className="relative group my-2 rounded-md overflow-hidden bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted/80 border-b border-border/50 text-xs text-muted-foreground">
                    <span>{match[1]}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md hover:bg-background/80"
                        onClick={handleCopy}
                    >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                </div>
                <div className="p-3 overflow-x-auto text-sm font-mono">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <code className={cn("bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono", className)} {...props}>
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
    // const { toast } = useToast(); -> Removed
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const chatbotRef = useRef<HTMLDivElement>(null);

    const API_KEY = import.meta.env.VITE_PUBLIC_AI_KEY;
    const API_BASE_URL = "/api/apertus";

    // Initial fetch on open
    useEffect(() => {
        if (isOpen) {
            fetchModels();
        }
    }, [isOpen]);

    // Auto-focus input when opened or after response
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

    // Click outside to close
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

    // Handle Escape key
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
                    "User-Agent": "CaptionCam/1.0",
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
            className="fixed top-20 right-4 w-80 sm:w-96 max-h-[600px] h-[calc(100vh-120px)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300"
            onWheel={stopPropagation}
            onTouchMove={stopPropagation}
            onTouchStart={stopPropagation}
            onTouchEnd={stopPropagation}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/40 bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">AI Assistant</h3>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="link" className="h-4 p-0 text-[10px] text-muted-foreground hover:text-foreground">
                                    {selectedModel}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 p-1">
                                <ScrollArea className="h-48">
                                    {models.map(model => (
                                        <Button
                                            key={model.id}
                                            variant="ghost"
                                            className={cn("w-full justify-start text-xs h-7", selectedModel === model.id && "bg-muted")}
                                            onClick={() => setSelectedModel(model.id)}
                                        >
                                            {model.id}
                                        </Button>
                                    ))}
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden p-0 relative">
                <ScrollArea className="h-full px-4 py-4" ref={scrollAreaRef} onWheel={(e) => e.stopPropagation()}>
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2 mt-10">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground">How can I help you today?</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex w-full gap-2",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {msg.role !== "user" && (
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                                        <Bot className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-muted rounded-bl-none"
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
                                    <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0 flex items-center justify-center mt-1">
                                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/40 bg-background/50">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={isLoading}
                        className="pr-10 rounded-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/30"
                    />
                    {isLoading ? (
                        <Button
                            size="icon"
                            className="absolute right-1 top-1 h-7 w-7 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                            onClick={stopGeneration}
                            title="Stop generation"
                        >
                            <Square className="h-3 w-3 fill-current" />
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            className="absolute right-1 top-1 h-7 w-7 rounded-full"
                            onClick={handleSend}
                            disabled={!input.trim()}
                        >
                            <Send className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
                <div className="text-[10px] text-center text-muted-foreground mt-2 opacity-60">
                    AI can make mistakes. Check important info.
                </div>
            </div>
        </div>
    );
};

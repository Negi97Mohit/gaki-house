import React, { useState, useRef, useEffect } from 'react';
import { OmegleDesign } from '@/types/omegle';
import { useOmegleStore } from '@/stores/omegle.store';
import { Send } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface OmegleChatBoxProps {
    design: OmegleDesign;
    onSendMessage: (message: string) => void;
}

export const OmegleChatBox: React.FC<OmegleChatBoxProps> = ({ design, onSendMessage }) => {
    const { messages, connection } = useOmegleStore();
    const [inputValue, setInputValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { chatBox } = design.layout;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-expand on new message if collapsible
    useEffect(() => {
        if (chatBox.expandOnNewMessage && messages.length > 0) {
            setIsExpanded(true);

            // Auto-collapse after delay
            if (chatBox.autoCollapseDelay) {
                const timer = setTimeout(() => {
                    setIsExpanded(false);
                }, chatBox.autoCollapseDelay);
                return () => clearTimeout(timer);
            }
        }
    }, [messages.length, chatBox.expandOnNewMessage, chatBox.autoCollapseDelay]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (inputValue.trim() && connection.matchStatus === 'connected') {
            onSendMessage(inputValue.trim());
            setInputValue('');
            inputRef.current?.focus();
        }
    };

    const handleInputFocus = () => {
        if (chatBox.expandOnInteraction) {
            setIsExpanded(true);
        }
    };

    const currentSize = isExpanded && chatBox.expandedSize
        ? chatBox.expandedSize
        : chatBox.size;

    const isDisabled = connection.matchStatus !== 'connected';

    return (
        <div
            className={cn(
                'absolute flex flex-col transition-all duration-300',
                chatBox.floating && 'rounded-2xl shadow-2xl'
            )}
            style={{
                left: `${chatBox.position.x}%`,
                top: `${chatBox.position.y}%`,
                width: `${currentSize.width}%`,
                height: `${currentSize.height}%`,
                zIndex: chatBox.zIndex,
                ...chatBox.style,
            }}
        >
            {/* Chat Header */}
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <span
                    className="text-sm font-medium"
                    style={{
                        fontFamily: design.typography.fontFamily,
                        color: design.typography.color,
                    }}
                >
                    Chat
                </span>
                <span className="text-xs opacity-50">
                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </span>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center opacity-50">
                        <p className="text-sm" style={{ fontFamily: design.typography.fontFamily }}>
                            {isDisabled ? 'Connect with a stranger to start chatting' : 'No messages yet'}
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                'flex',
                                msg.isLocal ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div
                                className={cn(
                                    'max-w-[70%] px-3 py-2 rounded-lg',
                                    msg.isLocal
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/10 text-white'
                                )}
                            >
                                <p
                                    className="text-sm break-words"
                                    style={{
                                        fontFamily: design.typography.fontFamily,
                                        lineHeight: design.typography.lineHeight,
                                    }}
                                >
                                    {msg.text}
                                </p>
                                <span className="text-[10px] opacity-50 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="border-t border-white/10 p-2">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={handleInputFocus}
                        disabled={isDisabled}
                        placeholder={isDisabled ? 'Connect to chat...' : 'Type a message...'}
                        className={cn(
                            'flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'placeholder:text-white/30'
                        )}
                        style={{
                            fontFamily: design.typography.fontFamily,
                            color: design.typography.color,
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isDisabled || !inputValue.trim()}
                        className={cn(
                            'p-2 rounded-lg transition-colors',
                            'bg-blue-600 hover:bg-blue-700',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </form>
        </div>
    );
};

import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useOmegleStore } from '@/stores/omegle.store';
import { OmegleDesign } from "@gaki/core/types/omegle";
import { cn } from "@gaki/core/lib/utils";
import { Send, GripHorizontal } from 'lucide-react';

interface OmegleChatBoxProps {
    design: OmegleDesign;
    onSendMessage: (message: string) => void;
}

export const OmegleChatBox: React.FC<OmegleChatBoxProps> = ({ design, onSendMessage }) => {
    const { messages } = useOmegleStore();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [chatBounds, setChatBounds] = useState({
        x: 0,
        y: 0,
        width: 320,
        height: 480
    });

    const { chatBox } = design.layout;

    useEffect(() => {
        const updateBounds = () => {
            const parent = document.querySelector('.fixed.inset-0.z-50') || document.body;
            const rect = parent.getBoundingClientRect();

            const padding = 10;
            const minWidth = 280;
            const minHeight = 200;

            let newWidth = (chatBox.size.width / 100) * rect.width;
            let newHeight = (chatBox.size.height / 100) * rect.height;
            let newX = (chatBox.position.x / 100) * rect.width;
            let newY = (chatBox.position.y / 100) * rect.height;

            newWidth = Math.max(minWidth, newWidth);
            newHeight = Math.max(minHeight, newHeight);

            const maxWidth = rect.width - padding * 2;
            const maxHeight = rect.height - padding * 2;
            newWidth = Math.min(newWidth, maxWidth);
            newHeight = Math.min(newHeight, maxHeight);

            newX = Math.max(padding, newX);
            if (newX + newWidth > rect.width - padding) {
                newX = rect.width - newWidth - padding;
            }
            newX = Math.max(padding, newX);

            newY = Math.max(padding, newY);
            if (newY + newHeight > rect.height - padding) {
                newY = rect.height - newHeight - padding;
            }
            newY = Math.max(padding, newY);

            setChatBounds({
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
            });
        };

        updateBounds();
        const timer = setTimeout(updateBounds, 50);
        window.addEventListener('resize', updateBounds);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateBounds);
        };
    }, [chatBox]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Rnd
            position={{ x: chatBounds.x, y: chatBounds.y }}
            size={{ width: chatBounds.width, height: chatBounds.height }}
            onDragStop={(e, d) => {
                const parent = document.querySelector('.fixed.inset-0.z-50') || document.body;
                const rect = parent.getBoundingClientRect();

                let newX = d.x;
                let newY = d.y;

                if (newX < 0) newX = 0;
                if (newX + chatBounds.width > rect.width) newX = rect.width - chatBounds.width;
                if (newY < 0) newY = 0;
                if (newY + chatBounds.height > rect.height) newY = rect.height - chatBounds.height;

                setChatBounds(prev => ({ ...prev, x: newX, y: newY }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const parent = document.querySelector('.fixed.inset-0.z-50') || document.body;
                const rect = parent.getBoundingClientRect();

                let newWidth = parseInt(ref.style.width);
                let newHeight = parseInt(ref.style.height);
                let newX = position.x;
                let newY = position.y;

                if (newWidth > rect.width) newWidth = rect.width;
                if (newHeight > rect.height) newHeight = rect.height;
                if (newX < 0) newX = 0;
                if (newY < 0) newY = 0;
                if (newX + newWidth > rect.width) newX = rect.width - newWidth;
                if (newY + newHeight > rect.height) newY = rect.height - newHeight;

                setChatBounds({
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                });
            }}
            bounds=".fixed.inset-0.z-50"
            minWidth={280}
            minHeight={200}
            style={{ zIndex: chatBox.zIndex }}
            enableResizing={!chatBox.collapsed}
            dragHandleClassName="chat-drag-handle"
        >
            <div
                className={cn(
                    "flex flex-col h-full overflow-hidden transition-all duration-300",
                    "backdrop-blur-xl"
                )}
                style={{
                    ...chatBox.style,
                    background: 'var(--omegle-chat-background)',
                    border: 'var(--omegle-border-width) solid var(--omegle-chat-border)',
                    borderRadius: 'var(--omegle-border-radius)',
                    boxShadow: 'var(--omegle-shadow)',
                }}
            >
                {/* Chat Header - Drag handle */}
                <div 
                    className={cn(
                        "px-4 py-3 flex items-center justify-between cursor-move chat-drag-handle select-none"
                    )}
                    style={{
                        borderBottom: 'var(--omegle-border-width) solid var(--omegle-chat-border)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <GripHorizontal 
                            className="w-4 h-4" 
                            style={{ color: 'var(--omegle-text-muted)', opacity: 0.5 }}
                        />
                        <span 
                            className="text-xs font-medium tracking-wide"
                            style={{ color: 'var(--omegle-chat-text)', opacity: 0.8 }}
                        >
                            Messages
                        </span>
                    </div>
                    <div 
                        className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium"
                        )}
                        style={{
                            background: 'var(--omegle-secondary)',
                            color: 'var(--omegle-text-muted)',
                        }}
                    >
                        {messages.length}
                    </div>
                </div>

                {/* Messages Area */}
                <div className={cn(
                    "flex-1 overflow-y-auto px-4 py-3 space-y-3",
                    "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                )}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
                            <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--omegle-secondary)' }}
                            >
                                <Send 
                                    className="w-5 h-5" 
                                    style={{ color: 'var(--omegle-text-muted)', opacity: 0.4 }}
                                />
                            </div>
                            <div className="space-y-1">
                                <p 
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--omegle-text-muted)' }}
                                >
                                    No messages yet
                                </p>
                                <p 
                                    className="text-xs"
                                    style={{ color: 'var(--omegle-text-muted)', opacity: 0.6 }}
                                >
                                    Start the conversation
                                </p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex flex-col max-w-[80%] animate-fade-in',
                                    msg.isLocal ? 'ml-auto items-end' : 'mr-auto items-start'
                                )}
                            >
                                <div
                                    className={cn(
                                        'px-4 py-2.5 text-sm break-words leading-relaxed',
                                        'transition-all duration-200',
                                        msg.isLocal
                                            ? 'rounded-2xl rounded-br-md'
                                            : 'rounded-2xl rounded-bl-md'
                                    )}
                                    style={{
                                        background: msg.isLocal 
                                            ? 'var(--omegle-chat-message-local)' 
                                            : 'var(--omegle-chat-message-stranger)',
                                        color: msg.isLocal 
                                            ? 'var(--omegle-primary-foreground)' 
                                            : 'var(--omegle-chat-text)',
                                    }}
                                >
                                    {msg.text}
                                </div>
                                <span 
                                    className="text-[10px] mt-1.5 px-1 select-none font-medium"
                                    style={{ color: 'var(--omegle-text-muted)', opacity: 0.5 }}
                                >
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div 
                    className="p-3"
                    style={{
                        borderTop: 'var(--omegle-border-width) solid var(--omegle-chat-border)',
                    }}
                >
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className={cn(
                                "flex-1 h-10 rounded-full px-4 text-sm",
                                "transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-offset-0"
                            )}
                            style={{
                                background: 'var(--omegle-chat-input-background)',
                                border: 'var(--omegle-border-width) solid var(--omegle-chat-input-border)',
                                color: 'var(--omegle-chat-text)',
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center",
                                "transition-all duration-200",
                                "disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100",
                                "hover:scale-105 active:scale-95"
                            )}
                            style={{
                                background: 'var(--omegle-primary)',
                                color: 'var(--omegle-primary-foreground)',
                            }}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Rnd>
    );
};
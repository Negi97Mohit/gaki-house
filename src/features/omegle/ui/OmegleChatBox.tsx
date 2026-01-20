import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useOmegleStore } from '@/stores/omegle.store';
import { OmegleDesign } from '@/types/omegle';
import { cn } from '@/shared/lib/utils';

interface OmegleChatBoxProps {
    design: OmegleDesign;
    onSendMessage: (message: string) => void;
}

export const OmegleChatBox: React.FC<OmegleChatBoxProps> = ({ design, onSendMessage }) => {
    const { messages } = useOmegleStore();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Track chat position and size
    const [chatBounds, setChatBounds] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });

    const { chatBox } = design.layout;

    // Initialize chat position from design
    useEffect(() => {
        const updateBounds = () => {
            const parent = document.querySelector('.fixed.inset-0.z-50');
            if (parent) {
                const rect = parent.getBoundingClientRect();
                setChatBounds({
                    x: (chatBox.position.x / 100) * rect.width,
                    y: (chatBox.position.y / 100) * rect.height,
                    width: (chatBox.size.width / 100) * rect.width,
                    height: (chatBox.size.height / 100) * rect.height,
                });
            }
        };

        updateBounds();
        window.addEventListener('resize', updateBounds);
        return () => window.removeEventListener('resize', updateBounds);
    }, [chatBox]);

    // Auto-scroll to bottom when new messages arrive
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
                setChatBounds(prev => ({ ...prev, x: d.x, y: d.y }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                setChatBounds({
                    x: position.x,
                    y: position.y,
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                });
            }}
            bounds="parent"
            minWidth={250}
            minHeight={150}
            style={{ zIndex: chatBox.zIndex }}
        >
            <div
                className="flex flex-col h-full rounded-lg overflow-hidden"
                style={chatBox.style}
            >
                {/* Chat Header - Drag handle */}
                <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between cursor-move bg-black/40">
                    <span className="text-xs font-medium text-white/80">💬 Chat</span>
                    <div className="text-xs text-white/50">{messages.length} messages</div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                    {messages.length === 0 ? (
                        <div className="text-center text-white/40 text-sm pt-4">
                            No messages yet. Start chatting!
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex flex-col',
                                    msg.sender === 'local' ? 'items-end' : 'items-start'
                                )}
                            >
                                <div
                                    className={cn(
                                        'px-3 py-2 rounded-lg max-w-[80%] break-words',
                                        msg.sender === 'local'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white/10 text-white/90'
                                    )}
                                >
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                <span className="text-[10px] text-white/40 mt-1 px-1">
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
                <div className="p-3 border-t border-white/10 bg-black/20">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </Rnd>
    );
};

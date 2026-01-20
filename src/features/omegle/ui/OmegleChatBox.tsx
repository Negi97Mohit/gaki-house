import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useOmegleStore } from '@/stores/omegle.store';
import { OmegleDesign } from '@/types/omegle';
import { getChatTheme } from '@/data/chatThemes';
import { cn } from '@/shared/lib/utils';
import { Send } from 'lucide-react';

interface OmegleChatBoxProps {
    design: OmegleDesign;
    onSendMessage: (message: string) => void;
}

export const OmegleChatBox: React.FC<OmegleChatBoxProps> = ({ design, onSendMessage }) => {
    const { messages, selectedChatTheme } = useOmegleStore();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = getChatTheme(selectedChatTheme);

    // Track chat position and size
    const [chatBounds, setChatBounds] = useState({
        x: 0,
        y: 0,
        width: 320,
        height: 480
    });

    const { chatBox } = design.layout;

    // Initialize chat position from design with boundary checks
    useEffect(() => {
        const updateBounds = () => {
            // Get view dimensions (fallback to window if parent not found immediately)
            const parent = document.querySelector('.fixed.inset-0.z-50') || document.body;
            const rect = parent.getBoundingClientRect();

            // Calculate initial dimensions based on percentage
            let newWidth = (chatBox.size.width / 100) * rect.width;
            let newHeight = (chatBox.size.height / 100) * rect.height;
            let newX = (chatBox.position.x / 100) * rect.width;
            let newY = (chatBox.position.y / 100) * rect.height;

            // Constrain constraints
            if (newWidth > rect.width) newWidth = rect.width - 20;
            if (newHeight > rect.height) newHeight = rect.height - 20;
            if (newX + newWidth > rect.width) newX = rect.width - newWidth - 10;
            if (newY + newHeight > rect.height) newY = rect.height - newHeight - 10;

            // Ensure non-negative
            newX = Math.max(0, newX);
            newY = Math.max(0, newY);

            setChatBounds({
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
            });
        };

        // Delay slightly to ensure parent is ready
        const timer = setTimeout(updateBounds, 100);
        window.addEventListener('resize', updateBounds);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateBounds);
        };
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
                // Ensure drag stays within bounds
                const parent = document.querySelector('.fixed.inset-0.z-50') || document.body;
                const rect = parent.getBoundingClientRect();

                let newX = d.x;
                let newY = d.y;

                // Clamp X
                if (newX < 0) newX = 0;
                if (newX + chatBounds.width > rect.width) newX = rect.width - chatBounds.width;

                // Clamp Y
                if (newY < 0) newY = 0;
                if (newY + chatBounds.height > rect.height) newY = rect.height - chatBounds.height;

                setChatBounds(prev => ({ ...prev, x: newX, y: newY }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const parent = document.querySelector('.fixed.inset-0.z-50') || document.body;
                const rect = parent.getBoundingClientRect();

                // Parse new dimensions
                let newWidth = parseInt(ref.style.width);
                let newHeight = parseInt(ref.style.height);
                let newX = position.x;
                let newY = position.y;

                // Constraint Logic
                if (newWidth > rect.width) newWidth = rect.width;
                if (newHeight > rect.height) newHeight = rect.height;

                // If resize pushes out of bounds, adjust position or size
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
            bounds=".fixed.inset-0.z-50" // Constrain to the main container
            minWidth={280}
            minHeight={200}
            style={{ zIndex: chatBox.zIndex }}
            enableResizing={!chatBox.collapsed} // Disable resize if collapsed (future feature)
            dragHandleClassName="chat-drag-handle"
        >
            <div
                className={cn(
                    "flex flex-col h-full overflow-hidden transition-colors duration-300",
                    theme.containerClass
                )}
                style={chatBox.style}
            >
                {/* Chat Header - Drag handle */}
                <div className={cn(
                    "px-3 py-2.5 flex items-center justify-between cursor-move chat-drag-handle select-none",
                    theme.headerClass
                )}>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium opacity-90">💬 Chat</span>
                        <span className="text-[10px] opacity-50 px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                            {messages.length}
                        </span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className={cn(
                    "flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                    theme.messageListClass
                )}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40 text-sm space-y-2 p-4">
                            <p>No messages yet.</p>
                            <p className="text-xs">Say hello to break the ice! 👋</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex flex-col max-w-[85%]',
                                    msg.isLocal ? 'ml-auto items-end' : 'mr-auto items-start'
                                )}
                            >
                                <div
                                    className={cn(
                                        'px-3 py-2 text-sm break-words shadow-sm',
                                        msg.isLocal
                                            ? `rounded-2xl rounded-tr-none ${theme.localBubbleClass}`
                                            : `rounded-2xl rounded-tl-none ${theme.remoteBubbleClass}`
                                    )}
                                >
                                    {msg.text}
                                </div>
                                <span className={cn(
                                    "text-[10px] mt-1 px-1 opacity-40 select-none",
                                    theme.messageListClass.includes('transparent') ? 'text-current mix-blend-plus-lighter' : 'text-gray-400'
                                )}>
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
                <div className={cn("p-3 backdrop-blur-sm", theme.inputAreaClass)}>
                    <div className="flex gap-2 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className={cn(
                                "flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all shadow-inner",
                                theme.inputClass
                            )}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className={cn(
                                "px-3 py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                                theme.buttonClass
                            )}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Rnd>
    );
};

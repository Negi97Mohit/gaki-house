import React from "react";
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Type,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutEditorToolbarProps {
    focusedField: { id: string; rect: DOMRect } | null;
    toolbarRef: React.RefObject<HTMLDivElement>;
    currentStyle: any; // { fontSize, textAlign, bold, italic }
    onUpdateStyle: (field: string, value: any) => void;
    onClose: () => void;
}

export const LayoutEditorToolbar: React.FC<LayoutEditorToolbarProps> = ({
    focusedField,
    toolbarRef,
    currentStyle,
    onUpdateStyle,
    onClose,
}) => {
    if (!focusedField) return null;

    const currentFontSize = currentStyle?.fontSize || "16";
    const currentAlign = currentStyle?.textAlign || "left";
    const isBold = currentStyle?.bold || false;
    const isItalic = currentStyle?.italic || false;

    return (
        <div
            ref={toolbarRef}
            className="fixed px-3 py-2 bg-black text-white rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 border border-white/10"
            style={{
                zIndex: 9999,
                top: Math.max(80, focusedField.rect.top - 50),
                left: Math.max(
                    20,
                    Math.min(window.innerWidth - 300, focusedField.rect.left)
                ),
            }}
        >
            <div className="flex items-center gap-2 mr-2 border-r border-white/20 pr-2">
                <Type className="w-3 h-3 text-white/50" />
                <input
                    type="text"
                    className="w-8 bg-transparent text-sm font-medium text-white text-center focus:outline-none focus:bg-white/10 rounded"
                    value={currentFontSize}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d+$/.test(val)) {
                            onUpdateStyle("fontSize", val);
                        }
                    }}
                    onBlur={(e) => {
                        if (!e.target.value) onUpdateStyle("fontSize", "16");
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                />
                <span className="text-[10px] text-white/40">px</span>
            </div>

            <div className="flex items-center bg-white/10 rounded-lg p-0.5 gap-0.5">
                <button
                    onClick={() => onUpdateStyle("textAlign", "left")}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                        "p-1.5 rounded-md transition-colors",
                        currentAlign === "left" ? "bg-white/20" : "hover:bg-white/5"
                    )}
                >
                    <AlignLeft className="w-3 h-3" />
                </button>
                <button
                    onClick={() => onUpdateStyle("textAlign", "center")}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                        "p-1.5 rounded-md transition-colors",
                        currentAlign === "center" ? "bg-white/20" : "hover:bg-white/5"
                    )}
                >
                    <AlignCenter className="w-3 h-3" />
                </button>
                <button
                    onClick={() => onUpdateStyle("textAlign", "right")}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                        "p-1.5 rounded-md transition-colors",
                        currentAlign === "right" ? "bg-white/20" : "hover:bg-white/5"
                    )}
                >
                    <AlignRight className="w-3 h-3" />
                </button>
            </div>

            <div className="w-px h-4 bg-white/20 mx-1" />

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onUpdateStyle("bold", !isBold)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isBold ? "bg-white text-black" : "hover:bg-white/10"
                    )}
                >
                    <Bold className="w-3 h-3" />
                </button>
                <button
                    onClick={() => onUpdateStyle("italic", !isItalic)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isItalic ? "bg-white text-black" : "hover:bg-white/10"
                    )}
                >
                    <Italic className="w-3 h-3" />
                </button>
            </div>

            <button
                onClick={onClose}
                className="ml-2 p-1 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition-colors"
                onMouseDown={(e) => e.preventDefault()}
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

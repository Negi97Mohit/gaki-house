import React from "react";
import { useDynamicLayout } from "./DynamicLayoutContext";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditableText } from "./EditableText";

export const DynamicDeleteButton: React.FC<{
    sectionId: string;
    className?: string;
}> = ({ sectionId, className }) => {
    const { editor, controlsVisible, layout, onLayoutUpdate } = useDynamicLayout();

    // We need to re-implement handleDelete here because it usually takes (id, e)
    // And we want to use the context's editor handler.
    const handleClick = (e: React.MouseEvent) => {
        editor.handleDeleteSection(sectionId, e);
    };

    return (
        <div className={cn(
            "z-50 transition-opacity duration-300",
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none",
            className
        )}>
            <button
                onClick={handleClick}
                className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md transition-transform"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};

export const DynamicAddButton: React.FC<{
    className?: string;
    defaultValue?: string;
    sectionId?: string;
    fieldId?: string;
    style?: React.CSSProperties;
}> = ({ className, defaultValue = "Add Section", sectionId = "ui", fieldId = "add_btn_label", style }) => {
    const { editor, controlsVisible, colors } = useDynamicLayout();

    const mergedStyle: React.CSSProperties = {
        borderColor: colors.textColor,
        color: colors.textColor,
        ...style,
    };

    return (
        <div
            onClick={editor.handleAddSection}
            className={cn(
                "cursor-pointer transition-all duration-300 flex flex-col items-center justify-center border-2 border-dashed rounded-lg opacity-50 hover:opacity-100",
                controlsVisible ? "opacity-50" : "opacity-0 pointer-events-none",
                className
            )}
            style={mergedStyle}
        >
            <Plus className="w-12 h-12 mb-2" />
            <div onClick={(e) => e.stopPropagation()}>
                <EditableText
                    sectionId={sectionId}
                    fieldId={fieldId}
                    defaultValue={defaultValue}
                    className="font-bold uppercase tracking-widest bg-transparent border-none text-center focus:outline-none w-full"
                />
            </div>
        </div>
    );
};

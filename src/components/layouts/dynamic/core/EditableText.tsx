import React from "react";
import { useDynamicLayout } from "./DynamicLayoutContext";
import { cn } from "@/lib/utils";

export interface EditableTextProps {
  sectionId?: string;
  fieldId?: string;
  defaultValue?: string;
  className?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
}

export const EditableText: React.FC<EditableTextProps> = ({
  sectionId = "default",
  fieldId = "text",
  defaultValue = "",
  className,
  multiline = false,
  style,
}) => {
  const { layout, editor, colors, controlsVisible } = useDynamicLayout();

  const uniqueId = `${sectionId}_${fieldId}`;
  const value =
    layout.customSectionData?.[sectionId]?.[fieldId] ?? defaultValue;

  const combinedStyle = editor.getFieldStyle(uniqueId, {
    ...style,
    color: colors.textColor,
  });

  // Check if this specific field is currently selected in the editor
  const isFocused = editor.focusedField?.id === uniqueId;

  const commonProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      editor.handleUpdateText(sectionId, fieldId, e.target.value),
    onFocus: (e: React.FocusEvent<HTMLElement>) =>
      editor.handleFocus(uniqueId, e),
    style: combinedStyle,
    className: cn(
      "bg-transparent border-none w-full pointer-events-auto transition-all duration-200 rounded-sm px-1 -mx-1",
      // Remove browser default outline
      "focus:outline-none",
      // Apply dashed border if focused (even if actual focus is on toolbar)
      isFocused && "ring-1 ring-dashed ring-primary/50 bg-white/5",
      // Hide resize handle and scrollbar when controls are not visible
      !controlsVisible &&
        "resize-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
      className
    ),
  };

  if (multiline) {
    return <textarea rows={1} {...commonProps} />;
  }

  return <input {...commonProps} />;
};

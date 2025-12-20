import React, { useRef, useLayoutEffect } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const uniqueId = `${sectionId}_${fieldId}`;
  const value =
    layout.customSectionData?.[sectionId]?.[fieldId] ?? defaultValue;

  // CHANGED: Passed `style` now overrides the default color
  const combinedStyle = editor.getFieldStyle(uniqueId, {
    color: colors.textColor,
    ...style,
  });

  // Check if this specific field is currently selected in the editor
  const isFocused = editor.focusedField?.id === uniqueId;

  // Auto-resize logic for textarea
  useLayoutEffect(() => {
    if (multiline && textareaRef.current) {
      // Reset height to auto to correctly calculate new scrollHeight
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;

      // Check if we've hit the max-height limit defined in CSS/Style
      const computedStyle = window.getComputedStyle(textareaRef.current);
      const maxHeight = parseInt(computedStyle.maxHeight);

      // If content exceeds max-height, show scrollbar, otherwise hide it
      if (maxHeight && scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [value, multiline, style]);

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
      // Apply dashed border if focused
      isFocused && "ring-1 ring-dashed ring-primary/50 bg-white/5",
      // Hide resize handle always for multiline
      multiline && "resize-none",
      // Default hidden scrollbar (handled dynamically above for overflow)
      multiline && "overflow-hidden",
      className
    ),
  };

  if (multiline) {
    return <textarea ref={textareaRef} rows={1} {...commonProps} />;
  }

  return <input {...commonProps} />;
};

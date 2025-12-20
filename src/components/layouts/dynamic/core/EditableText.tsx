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

  const commonProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      editor.handleUpdateText(sectionId, fieldId, e.target.value),
    onFocus: (e: React.FocusEvent<HTMLElement>) =>
      editor.handleFocus(uniqueId, e),
    style: combinedStyle,
    className: cn(
      "bg-transparent border-none focus:outline-none w-full pointer-events-auto transition-all duration-300",
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

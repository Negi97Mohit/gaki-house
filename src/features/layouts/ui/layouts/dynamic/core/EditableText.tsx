import React, { useRef, useLayoutEffect, useState, useCallback } from "react";
import { motion, useDragControls } from "framer-motion";
import { useDynamicLayout } from "./DynamicLayoutContext";
import { cn } from "@/shared/lib/utils";

export interface EditableTextProps {
  sectionId?: string;
  fieldId?: string;
  defaultValue?: string;
  className?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  draggable?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  sectionId = "default",
  fieldId = "text",
  defaultValue = "",
  className,
  multiline = false,
  style,
  draggable = true,
}) => {
  const { layout, editor, colors } = useDynamicLayout();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const uniqueId = `${sectionId}_${fieldId}`;
  const value =
    layout.customSectionData?.[sectionId]?.[fieldId] ?? defaultValue;

  const combinedStyle = editor.getFieldStyle(uniqueId, {
    color: colors.textColor,
    ...style,
  });

  const isFocused = editor.focusedField?.id === uniqueId;

  // Get stored position or default to 0,0
  const storedPosition = layout.customSectionData?.[sectionId]?.[`${fieldId}_position`] || { x: 0, y: 0 };

  useLayoutEffect(() => {
    if (multiline && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;

      const computedStyle = window.getComputedStyle(textareaRef.current);
      const maxHeight = parseInt(computedStyle.maxHeight);

      if (maxHeight && scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [value, multiline, style]);

  const handleDragEnd = useCallback((_: any, info: { offset: { x: number; y: number } }) => {
    setIsDragging(false);
    // Store new position
    const newPosition = {
      x: storedPosition.x + info.offset.x,
      y: storedPosition.y + info.offset.y,
    };
    editor.handleUpdateText(sectionId, `${fieldId}_position`, newPosition as any);
  }, [editor, sectionId, fieldId, storedPosition]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const commonInputProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      editor.handleUpdateText(sectionId, fieldId, e.target.value),
    onFocus: (e: React.FocusEvent<HTMLElement>) =>
      editor.handleFocus(uniqueId, e),
    onBlur: handleBlur,
    style: combinedStyle,
    className: cn(
      "bg-transparent border-none w-full transition-all duration-200 rounded-sm px-1 -mx-1",
      "focus:outline-none",
      isFocused && "ring-1 ring-dashed ring-primary/50 bg-white/5",
      multiline && "resize-none overflow-hidden",
      className
    ),
  };

  if (!draggable) {
    // Non-draggable version (original behavior)
    if (multiline) {
      return <textarea ref={textareaRef} rows={1} {...commonInputProps} />;
    }
    return <input {...commonInputProps} />;
  }

  // Draggable version
  return (
    <motion.div
      drag={!isEditing}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
      initial={{ x: storedPosition.x, y: storedPosition.y }}
      animate={{ x: storedPosition.x, y: storedPosition.y }}
      whileDrag={{ scale: 1.02, zIndex: 100 }}
      className={cn(
        "inline-block pointer-events-auto",
        !isEditing && "cursor-grab active:cursor-grabbing",
        isDragging && "z-50"
      )}
      style={{ position: "relative" }}
    >
      {multiline ? (
        <textarea
          ref={textareaRef}
          rows={1}
          {...commonInputProps}
          onPointerDown={(e) => isEditing && e.stopPropagation()}
          className={cn(commonInputProps.className, isEditing ? "cursor-text" : "cursor-grab pointer-events-none")}
        />
      ) : (
        <input
          {...commonInputProps}
          onPointerDown={(e) => isEditing && e.stopPropagation()}
          className={cn(commonInputProps.className, isEditing ? "cursor-text" : "cursor-grab pointer-events-none")}
        />
      )}
    </motion.div>
  );
};

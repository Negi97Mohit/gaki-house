import React from "react";
import { useDynamicLayout } from "./DynamicLayoutContext";
import { usePreviewMode } from "./PreviewModeContext";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { EditableText } from "./EditableText";

export const DynamicDeleteButton: React.FC<{
  sectionId: string;
  className?: string;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}> = ({ sectionId, className, onDelete }) => {
  const { editor, controlsVisible } = useDynamicLayout();
  const isPreview = usePreviewMode();

  // Don't render in preview mode to avoid nested button issues
  if (isPreview) return null;

  const handleClick = (e: React.MouseEvent) => {
    if (onDelete) {
      onDelete(sectionId, e);
    } else {
      editor.handleDeleteSection(sectionId, e);
    }
  };

  return (
    <div
      className={cn(
        "z-50 transition-opacity duration-300",
        controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
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
  onAdd?: () => void;
}> = ({
  className,
  defaultValue = "Add Section",
  sectionId = "ui",
  fieldId = "add_btn_label",
  style,
  onAdd,
}) => {
    const { editor, controlsVisible, colors } = useDynamicLayout();
    const isPreview = usePreviewMode();

    // Don't render in preview mode to avoid nested button issues
    if (isPreview) return null;

    const mergedStyle: React.CSSProperties = {
      borderColor: colors.textColor,
      color: colors.textColor,
      ...style,
    };

    const handleClick = () => {
      if (onAdd) {
        onAdd();
      } else {
        editor.handleAddSection();
      }
    };

    return (
      <div
        onClick={handleClick}
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


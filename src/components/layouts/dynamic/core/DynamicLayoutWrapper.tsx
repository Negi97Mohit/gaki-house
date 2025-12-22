import React, { useState, useEffect, useRef } from "react";
import { CanvasSectionState, CanvasLayoutState } from "@/types/caption";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../../LayoutSettingsCtrl";
import { DynamicLayoutProvider } from "./DynamicLayoutContext";

export interface DynamicLayoutWrapperProps {
  layout: CanvasLayoutState;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  sections: CanvasSectionState[];
  children: React.ReactNode;

  // Optional Defaults
  defaultBackgroundColor?: string;
  defaultTextColor?: string;

  // Optional overrides
  onSectionDelete?: (id: string) => void;
  onSectionContentChange?: any;
}

export const DynamicLayoutWrapper: React.FC<DynamicLayoutWrapperProps> = ({
  layout,
  onLayoutUpdate,
  sections,
  children,
  defaultBackgroundColor = "#ffffff",
  defaultTextColor = "#000000",
  ...props
}) => {
  // 1. Initialize Layout Editor Hook
  const editor = useLayoutEditor({
    layout,
    onLayoutUpdate,
  });

  // 2. Global Colors
  const colors = editor.getGlobalSettings(
    defaultBackgroundColor,
    defaultTextColor
  );

  // 3. Inactivity Logic
  const [controlsVisible, setControlsVisible] = useState(true);
  const inactiveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onMouseMove = () => {
      setControlsVisible(true);
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current);
      inactiveTimer.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseMove);
    window.addEventListener("keydown", onMouseMove);
    onMouseMove();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseMove);
      window.removeEventListener("keydown", onMouseMove);
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current);
    };
  }, []);

  return (
    <DynamicLayoutProvider
      value={{
        layout,
        onLayoutUpdate,
        sections,
        editor,
        colors,
        controlsVisible,
      }}
    >
      <div
        className="w-full h-full relative"
        style={{
          backgroundColor: colors.backgroundColor,
          color: colors.textColor,
        }}
      >
        {/* Render Global Controls */}
        <div
          className={
            controlsVisible
              ? "opacity-100 transition-opacity duration-300"
              : "opacity-0 pointer-events-none transition-opacity duration-300"
          }
        >
          <LayoutSettingsCtrl
            backgroundColor={colors.backgroundColor}
            // Removed textColor prop
            onUpdate={editor.updateGlobalSetting}
          />
        </div>

        <LayoutEditorToolbar
          focusedField={editor.focusedField}
          toolbarRef={editor.toolbarRef}
          currentStyle={
            editor.focusedField
              ? layout.customSectionStyles?.[editor.focusedField.id]
              : {}
          }
          onUpdateStyle={(field, value) =>
            editor.focusedField &&
            editor.handleUpdateStyle(editor.focusedField.id, field, value)
          }
          onClose={() => editor.setFocusedField(null)}
        />

        {/* Render Layout Content */}
        {children}
      </div>
    </DynamicLayoutProvider>
  );
};

// src/hooks/useGridSequencer.ts
import { useCallback, useRef } from "react";
import {
  CanvasLayoutState,
  CanvasSectionContent,
  DEFAULT_CAMERA_STATE,
} from "@/types/caption";
import { toast } from "sonner";

interface UseGridSequencerProps {
  layout: CanvasLayoutState | null;
  activeSequenceId?: string | null;
  onTransition: (newLayout: CanvasLayoutState, newActiveId: string) => void;
}

export const useGridSequencer = ({
  layout,
  activeSequenceId,
  onTransition,
}: UseGridSequencerProps) => {
  const lastTriggerTime = useRef<number>(0);

  const handleUserPositionChange = useCallback(
    (position: { x: number; y: number } | null) => {
      if (
        !position ||
        !layout ||
        !layout.sectionOrder ||
        layout.sectionOrder.length < 2 ||
        !activeSequenceId
      ) {
        return;
      }

      // Debounce triggers (2 seconds cooldown to prevent rapid toggling)
      const now = Date.now();
      if (now - lastTriggerTime.current < 2000) return;

      const currentIndex = layout.sectionOrder.indexOf(activeSequenceId);
      if (currentIndex === -1) return;

      let targetIndex = -1;
      let direction = "";

      // --- TRIGGER LOGIC ---
      // Exiting Right (> 85%) -> Go NEXT
      if (position.x > 85) {
        targetIndex = (currentIndex + 1) % layout.sectionOrder.length;
        direction = "Right";
      }
      // Exiting Left (< 15%) -> Go PREV
      else if (position.x < 15) {
        targetIndex =
          (currentIndex - 1 + layout.sectionOrder.length) %
          layout.sectionOrder.length;
        direction = "Left";
      }

      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        const targetId = layout.sectionOrder[targetIndex];
        console.log(
          `[Sequencer] Triggered ${direction} -> Moving to ${targetId}`
        );

        // --- SWAP LOGIC ---
        const currentActiveSection = layout.sections.find(
          (s) => s.id === activeSequenceId
        );

        // Preserve camera settings (filters, etc.) to carry them over
        const preservedSettings =
          currentActiveSection?.content.type === "camera"
            ? currentActiveSection.content.settings
            : DEFAULT_CAMERA_STATE;

        const newSections = layout.sections.map((section) => {
          // 1. Old Screen -> Revert to Default (Idle)
          if (section.id === activeSequenceId) {
            return {
              ...section,
              content: section.defaultContent || { type: "empty" as const },
            };
          }
          // 2. New Screen -> Become Camera (Active)
          if (section.id === targetId) {
            const settingsToUse =
              section.savedCameraSettings || preservedSettings;
            return {
              ...section,
              content: {
                type: "camera" as const,
                settings: settingsToUse,
              },
            };
          }
          return section;
        });

        lastTriggerTime.current = now;
        toast.success(`Moved to Screen ${targetIndex + 1}`);
        onTransition({ ...layout, sections: newSections }, targetId);
      }
    },
    [layout, activeSequenceId, onTransition]
  );

  return { handleUserPositionChange };
};

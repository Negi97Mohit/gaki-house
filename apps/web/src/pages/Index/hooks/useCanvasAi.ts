import { useState, useCallback } from "react";
import { notify } from "@caption-cam/core/lib/notify";
import { generateId } from "@caption-cam/core/lib/id";
import { SceneState, GeneratedOverlay } from "@caption-cam/core/types/caption";
import { processCommandWithAgent, updateOverlay } from "@/lib/ai";

interface UseCanvasAiProps {
  activeScene: SceneState;
  updateActiveScene: (updater: (scene: SceneState) => SceneState) => void;

  setSavedOverlays: React.Dispatch<React.SetStateAction<GeneratedOverlay[]>>;
}

export const useCanvasAi = ({
  activeScene,
  updateActiveScene,

  setSavedOverlays,
}: UseCanvasAiProps) => {
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const processTranscript = useCallback(
    async (transcript: string, targetId: string | null = null) => {
      if (!activeScene?.isAiModeEnabled || isProcessingAi) return;

      setPromptHistory((prev) => [...prev, transcript]);
      setIsProcessingAi(true);
      const thinkingToast = notify.loading(
        targetId ? "AI is updating..." : "AI is creating..."
      );

      try {
        if (targetId) {
          const existingOverlay = activeScene.activeOverlays.find(
            (o) => o.id === targetId
          );
          if (!existingOverlay) throw new Error("Target overlay not found.");

          const { name, htmlContent } = await updateOverlay(
            existingOverlay.htmlContent,
            transcript
          );

          updateActiveScene((scene) => ({
            ...scene,
            activeOverlays: scene.activeOverlays.map((o) => {
              if (o.id === targetId) {
                const updated = { ...o, name, htmlContent, preview: "" };

                return updated;
              }
              return o;
            }),
          }));
          notify.success(`Updated overlay "${name}".`);
        } else {
          const { name, htmlContent } = await processCommandWithAgent(
            transcript
          );

          const newOverlay: GeneratedOverlay = {
            id: generateId("overlay"),
            name,
            htmlContent,
            layout: {
              position: { x: 50, y: 50 },
              size: { width: 40, height: 40 },
              zIndex: 10,
              rotation: 0,
            },
            preview: "",
          };

          setSavedOverlays((prev) => [newOverlay, ...prev]);

          updateActiveScene((scene) => {
            const updated = [...scene.activeOverlays, newOverlay];

            return { ...scene, activeOverlays: updated };
          });

          // Check for error in name
          if (name.toLowerCase().includes("error") || name.toLowerCase().includes("failed")) {
            throw new Error(name);
          }

          notify.success(`AI generated "${name}".`);
        }
      } catch (error) {
        notify.error("AI command failed", error instanceof Error ? error : "Unknown error");
      } finally {
        setIsProcessingAi(false);
        notify.dismiss(thinkingToast);
      }
    },
    [
      isProcessingAi,
      activeScene,

      updateActiveScene,
      setSavedOverlays,
    ]
  );

  return {
    isProcessingAi,
    promptHistory,
    processTranscript,
  };
};

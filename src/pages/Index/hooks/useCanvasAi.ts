import { useState, useCallback } from "react";
import { toast } from "sonner";
import { generateId } from "@/shared/lib/id";
import { SceneState, GeneratedOverlay } from "@/types/caption";
import { processCommandWithAgent, updateOverlay } from "@/lib/ai";

interface UseCanvasAiProps {
  activeScene: SceneState;
  updateActiveScene: (updater: (scene: SceneState) => SceneState) => void;
  recording: any;
  setSavedOverlays: React.Dispatch<React.SetStateAction<GeneratedOverlay[]>>;
}

export const useCanvasAi = ({
  activeScene,
  updateActiveScene,
  recording,
  setSavedOverlays,
}: UseCanvasAiProps) => {
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const processTranscript = useCallback(
    async (transcript: string, targetId: string | null = null) => {
      if (!activeScene?.isAiModeEnabled || isProcessingAi) return;

      setPromptHistory((prev) => [...prev, transcript]);
      setIsProcessingAi(true);
      const thinkingToast = toast.loading(
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
                if (recording.isRecording) recording.recordHtmlOverlay(updated);
                return updated;
              }
              return o;
            }),
          }));
          toast.success(`Updated overlay "${name}".`);
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
            if (recording.isRecording) recording.recordHtmlOverlay(newOverlay);
            return { ...scene, activeOverlays: updated };
          });

          toast.success(`AI generated "${name}".`);
        }
      } catch (error) {
        toast.error("AI command failed: " + (error as Error).message);
      } finally {
        setIsProcessingAi(false);
        toast.dismiss(thinkingToast);
      }
    },
    [
      isProcessingAi,
      activeScene,
      recording,
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

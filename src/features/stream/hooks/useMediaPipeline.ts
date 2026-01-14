import { useState, useEffect } from "react";
import { streamService } from "../services/stream.service";
import { notify } from "@/shared/lib/notify";

export const useMediaPipeline = () => {
  const [isPipelineReady, setIsPipelineReady] = useState(false);

  const startPipeline = async () => {
    try {
      await streamService.startPipeline();
      setIsPipelineReady(true);
      return true;
    } catch (e) {
      console.error("Pipeline Start Error:", e);
      notify.error("Failed to start media pipeline");
      return false;
    }
  };

  const stopPipeline = () => {
    streamService.stopStreaming(); // This stops everything including pipeline
    setIsPipelineReady(false);
  };

  return {
    startPipeline,
    stopPipeline,
    isPipelineReady,
  };
};

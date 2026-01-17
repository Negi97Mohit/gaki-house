import { useEffect } from "react";
import { useStreamStore } from "@/stores/stream.store";
import { streamService } from "../services/stream.service";
import { notify } from "@/shared/lib/notify";

export const useRtmpStream = () => {
  const {
    destinations,
    isBroadcasting,
    isRecording,
    isConnecting,
    streamStatus,
    countdown,
  } = useStreamStore();

  const startStreaming = async (specificDestId?: string) => {
    const targets = specificDestId
      ? destinations.filter((d) => d.id === specificDestId)
      : destinations.filter((d) => d.enabled);

    if (targets.length === 0) {
      notify.info("Please add and enable a stream destination first.");
      return;
    }

    await streamService.startStreaming(targets);
  };

  const stopStreaming = (specificDestId?: string) => {
    streamService.stopStreaming(specificDestId);
  };

  const toggleRecording = () => {
    if (isRecording) {
      streamService.stopRecording();
    } else {
      streamService.startRecording();
    }
  };

  return {
    destinations,
    isStreaming: isBroadcasting,
    isRecording,
    isConnecting,
    status: streamStatus,
    countdown,
    startStreaming,
    stopStreaming,
    toggleRecording,
  };
};

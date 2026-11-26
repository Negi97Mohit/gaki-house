import fixWebmDuration from "fix-webm-duration";
import { notify } from "@gaki/core/lib/notify";

export function getSupportedMimeType(): string {
  const types = [
    "video/webm; codecs=h264",
    "video/webm; codecs=vp9",
    "video/webm; codecs=vp8",
    "video/webm",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm";
}

export function triggerBrowserDownload(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  a.href = url;
  a.download = `recording-${new Date().toISOString().replace(/:/g, "-")}.webm`;
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  notify.success("Recording saved!");
}

export async function saveFixedWebmRecording(
  chunks: Blob[],
  mimeType: string | undefined,
  recordingStartTime: number | null,
): Promise<boolean> {
  if (chunks.length === 0) return false;

  try {
    const blob = new Blob(chunks, {
      type: mimeType || "video/webm",
    });

    const duration = recordingStartTime ? Date.now() - recordingStartTime : 0;

    const fixedBlob = await new Promise<Blob>((resolve) => {
      fixWebmDuration(blob, duration, (fixed) => {
        resolve(fixed);
      });
    });

    triggerBrowserDownload(fixedBlob);
    return true;
  } catch (e) {
    console.error("Failed to download recording", e);
    notify.error("Failed to save recording");
    return false;
  }
}

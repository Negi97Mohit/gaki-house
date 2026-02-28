import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Circle, Mic, MicOff, Radio, RefreshCcw, VideoOff, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { MobileCanvasContainer } from "../components/MobileCanvasContainer";
import { useMediaStore } from "@/stores/media.store";

const QUICK_TABS = [
  { id: "designs", label: "Layouts" },
  { id: "captions", label: "Captions" },
] as const;

export const MobileLivePage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"record" | "stream">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof QUICK_TABS)[number]["id"]>("designs");

  const isAudioOn = useMediaStore((state) => state.isAudioOn);
  const setAudioOn = useMediaStore((state) => state.setAudioOn);
  const isVideoOn = useMediaStore((state) => state.isVideoOn);
  const setVideoOn = useMediaStore((state) => state.setVideoOn);

  const handleAction = () => {
    if (mode === "record") {
      setIsRecording((prev) => !prev);
      if (!isRecording) {
        toast.success("Recording started");
      } else {
        toast.success("Recording stopped");
      }
      return;
    }

    setIsStreaming((prev) => !prev);
    if (!isStreaming) {
      toast.success("You are live");
    } else {
      toast.info("Live stream ended");
    }
  };

  const handleExit = () => {
    if (isRecording || isStreaming) {
      const shouldLeave = window.confirm("Stop current session and exit?");
      if (!shouldLeave) return;
    }
    navigate("/m");
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <div className="absolute inset-0">
        <MobileCanvasContainer
          isDrawerOpen={isToolsOpen}
          onDrawerOpenChange={setIsToolsOpen}
          activeTab={activeTab}
          drawerTabs={["designs", "captions"]}
          vaultFiles={[]}
          onAddVaultFiles={() => {}}
          onRemoveVaultFile={() => {}}
          onClearVault={() => {}}
        />
      </div>

      <div className={cn("absolute inset-0 z-[5] bg-zinc-950/70 flex flex-col items-center justify-center", isVideoOn && "opacity-0 pointer-events-none")}>
        <Camera className="w-14 h-14 text-zinc-500" />
        <p className="text-zinc-400 mt-3 text-sm">Camera off</p>
      </div>

      <div className="absolute top-0 inset-x-0 z-20 p-4 pt-[max(env(safe-area-inset-top),1rem)] flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={handleExit} className="w-10 h-10 rounded-full bg-black/35 backdrop-blur-md border border-white/15 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>

        {(isRecording || isStreaming) && (
          <div className="px-3 py-1.5 rounded-full bg-[#ff2d55]/85 backdrop-blur-md text-xs font-semibold tracking-wide">
            LIVE
          </div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 z-20 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-16 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
        <div className="mb-5 -mx-1 overflow-x-auto [scrollbar-width:none]">
          <div className="px-1 flex gap-2 min-w-max">
            {QUICK_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsToolsOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-medium"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          <button onClick={() => toast.info("Camera switch will be wired to device selection")}
            className="w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center">
            <RefreshCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleAction}
            className={cn(
              "relative w-[86px] h-[86px] rounded-full border-[6px] backdrop-blur-sm transition-all",
              mode === "record" ? "border-white/80" : "border-primary/80"
            )}
          >
            <span
              className={cn(
                "absolute inset-[12px] transition-all",
                mode === "record"
                  ? isRecording
                    ? "bg-[#ff2d55] rounded-2xl"
                    : "bg-[#ff2d55] rounded-full"
                  : isStreaming
                    ? "bg-[#ff2d55] rounded-2xl"
                    : "bg-white rounded-full"
              )}
            />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setAudioOn(!isAudioOn)}
              className={cn("w-11 h-11 rounded-full border backdrop-blur-md flex items-center justify-center", isAudioOn ? "bg-white/10 border-white/20" : "bg-[#ff2d55]/20 border-[#ff2d55]/60")}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setVideoOn(!isVideoOn)}
              className={cn("w-11 h-11 rounded-full border backdrop-blur-md flex items-center justify-center", isVideoOn ? "bg-white/10 border-white/20" : "bg-[#ff2d55]/20 border-[#ff2d55]/60")}
            >
              {isVideoOn ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center">
          <div className="bg-black/45 border border-white/15 rounded-full p-1 flex items-center gap-1 backdrop-blur-md">
            <button onClick={() => setMode("record")} className={cn("px-4 py-2 text-xs rounded-full font-semibold", mode === "record" ? "bg-white text-black" : "text-white/70")}>
              <Circle className="w-3 h-3 inline mr-1" />Record
            </button>
            <button onClick={() => setMode("stream")} className={cn("px-4 py-2 text-xs rounded-full font-semibold", mode === "stream" ? "bg-primary text-primary-foreground" : "text-white/70")}>
              <Radio className="w-3 h-3 inline mr-1" />Stream
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

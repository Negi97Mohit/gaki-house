import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCamera } from "@/context/CameraContext";
import {
  ArrowLeft,
  MicOff,
  Mic,
  Pause,
  Play,
  Sparkles,
  Wand2,
  Camera,
  Smartphone,
  ScreenShare,
  Download,
  Upload,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RemoteControlScreenProps {
  onBack: () => void;
}

const SCENES = [
  {
    id: "gameplay",
    label: "Gameplay",
    hint: "Full-screen capture",
    gradient: "from-violet-600/40 via-indigo-700/30 to-zinc-900",
    accent: "bg-violet-400",
  },
  {
    id: "chatting",
    label: "Just Chatting",
    hint: "Camera + overlay",
    gradient: "from-rose-500/30 via-orange-500/20 to-zinc-900",
    accent: "bg-rose-400",
  },
  {
    id: "brb",
    label: "BRB",
    hint: "Be right back card",
    gradient: "from-amber-500/30 via-yellow-600/20 to-zinc-900",
    accent: "bg-amber-400",
  },
  {
    id: "starting",
    label: "Starting Soon",
    hint: "Countdown intro",
    gradient: "from-emerald-500/30 via-teal-600/20 to-zinc-900",
    accent: "bg-emerald-400",
  },
];

const CAMERAS = [
  { id: "webcam", label: "WebCam", icon: Camera },
  { id: "mirrorless", label: "Mirrorless", icon: Camera },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "screen", label: "Screen", icon: ScreenShare },
];

type HandoffAction = "pull" | "push";
type HandoffStage = "idle" | "transferring" | "success";

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 mb-3 px-1">
    {children}
  </h2>
);

const RemoteControlScreen = ({ onBack }: RemoteControlScreenProps) => {
  const [activeScene, setActiveScene] = useState("gameplay");
  const [activeCamera, setActiveCamera] = useState("webcam");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(2487);
  const [handoffAction, setHandoffAction] = useState<HandoffAction | null>(null);
  const [handoffStage, setHandoffStage] = useState<HandoffStage>("idle");

  const { videoRef: sourceVideoRef, active: cameraActive, facing } = useCamera();
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const sceneVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Mirror the active camera MediaStream into all preview video elements.
  useEffect(() => {
    const source = sourceVideoRef.current;
    if (!source) return;

    const attach = () => {
      const stream = (source.srcObject as MediaStream | null) ?? null;
      if (!stream) return;
      const targets: (HTMLVideoElement | null)[] = [
        previewVideoRef.current,
        ...Object.values(sceneVideoRefs.current),
      ];
      targets.forEach((el) => {
        if (el && el.srcObject !== stream) {
          el.srcObject = stream;
          el.play().catch(() => {});
        }
      });
    };

    attach();
    source.addEventListener("loadedmetadata", attach);
    return () => source.removeEventListener("loadedmetadata", attach);
  }, [sourceVideoRef, cameraActive, facing]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(id);
  }, [isPaused]);

  useEffect(() => {
    if (handoffStage !== "transferring") return;
    const id = setTimeout(() => setHandoffStage("success"), 2200);
    return () => clearTimeout(id);
  }, [handoffStage]);

  const startHandoff = (action: HandoffAction) => {
    setHandoffAction(action);
    setHandoffStage("transferring");
  };

  const closeHandoff = () => {
    setHandoffAction(null);
    setHandoffStage("idle");
  };

  const handoffCopy = handoffAction === "pull"
    ? "Moving the live broadcast from your desktop to this phone."
    : "Sending your phone's broadcast to your desktop.";

  return (
    <div
      className="fixed inset-0 z-40 bg-zinc-950 text-zinc-100 overflow-y-auto no-scrollbar select-none"
      style={{ touchAction: "manipulation" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 py-4 safe-top">
          <button
            onClick={onBack}
            aria-label="Back"
            className="h-9 w-9 -ml-2 rounded-full flex items-center justify-center text-zinc-400 active:bg-white/5 active:scale-95 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-[13px] font-medium tracking-wide text-zinc-200">Remote</h1>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-medium text-zinc-400">Connected</span>
          </div>
        </div>
      </header>

      <div className="px-5 pt-2 pb-32 space-y-8">
        {/* Stream Preview */}
        <section>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900">
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                cameraActive ? "opacity-100" : "opacity-0",
                facing === "user" && "scale-x-[-1]"
              )}
            />
            {!cameraActive && (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(120,120,140,0.15),transparent_60%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-zinc-700 text-[10px] uppercase tracking-[0.3em] font-medium">Live Preview</div>
                </div>
              </>
            )}
            {/* Subtle vignette so overlays stay legible */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/40" />

            {/* LIVE */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-[0.15em] text-white/90">LIVE</span>
            </div>

            {/* Duration */}
            <div className="absolute top-3 right-3">
              <span className="text-[11px] font-mono tabular-nums text-white/70">{formatDuration(duration)}</span>
            </div>

            {/* Scene label */}
            <div className="absolute bottom-3 left-3 text-[11px] text-white/60 font-medium">
              {SCENES.find((s) => s.id === activeScene)?.label}
            </div>
          </div>
        </section>

        {/* Scenes */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <SectionLabel>Scenes</SectionLabel>
            <span className="text-[10px] text-zinc-600 -mt-3">Preview before applying</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {SCENES.map((scene) => {
              const isActive = scene.id === activeScene;
              const showLive = isActive && cameraActive;
              return (
                <motion.button
                  key={scene.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveScene(scene.id)}
                  className={cn(
                    "group relative rounded-xl overflow-hidden text-left transition-all duration-200",
                    "ring-1",
                    isActive
                      ? "ring-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                      : "ring-white/[0.06] active:ring-white/20"
                  )}
                >
                  {/* Preview canvas (16:9) */}
                  <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                    {/* Stylized gradient preview per scene */}
                    <div className={cn("absolute inset-0 bg-gradient-to-br", scene.gradient)} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent_50%)]" />

                    {/* Live feed in active scene */}
                    {showLive && (
                      <video
                        ref={(el) => {
                          sceneVideoRefs.current[scene.id] = el;
                        }}
                        autoPlay
                        playsInline
                        muted
                        className={cn(
                          "absolute inset-0 h-full w-full object-cover",
                          facing === "user" && "scale-x-[-1]"
                        )}
                      />
                    )}

                    {/* Subtle bottom fade for label legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/55 backdrop-blur-sm">
                        <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[8px] font-semibold tracking-[0.15em] text-white">LIVE</span>
                      </div>
                    )}

                    {/* Scene accent dot */}
                    {!isActive && (
                      <span className={cn("absolute top-2 right-2 h-1.5 w-1.5 rounded-full", scene.accent, "opacity-80")} />
                    )}
                  </div>

                  {/* Label strip */}
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 px-2.5 py-1.5 flex items-center justify-between",
                      "transition-colors duration-200"
                    )}
                  >
                    <div>
                      <div className="text-[12px] font-medium text-white leading-tight">{scene.label}</div>
                      <div className="text-[9px] text-white/55 leading-tight">{scene.hint}</div>
                    </div>
                    {isActive && (
                      <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-zinc-950" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Cameras */}
        <section>
          <SectionLabel>Camera</SectionLabel>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
            {CAMERAS.map((cam) => {
              const isActive = cam.id === activeCamera;
              const Icon = cam.icon;
              return (
                <motion.button
                  key={cam.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setActiveCamera(cam.id)}
                  className={cn(
                    "shrink-0 w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors duration-200",
                    isActive
                      ? "bg-white text-zinc-950"
                      : "bg-zinc-900 text-zinc-400 active:bg-zinc-800"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  <span className="text-[10px] font-medium">{cam.label}</span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <SectionLabel>Controls</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsMicMuted((v) => !v)}
              className={cn(
                "h-16 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200",
                isMicMuted
                  ? "bg-red-500/10 text-red-400"
                  : "bg-zinc-900 text-zinc-300 active:bg-zinc-800"
              )}
            >
              {isMicMuted ? <MicOff className="h-4 w-4" strokeWidth={1.8} /> : <Mic className="h-4 w-4" strokeWidth={1.8} />}
              <span className="text-[12px] font-medium">{isMicMuted ? "Unmute" : "Mute Mic"}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsPaused((v) => !v)}
              className={cn(
                "h-16 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200",
                isPaused
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-zinc-900 text-zinc-300 active:bg-zinc-800"
              )}
            >
              {isPaused ? <Play className="h-4 w-4" strokeWidth={1.8} /> : <Pause className="h-4 w-4" strokeWidth={1.8} />}
              <span className="text-[12px] font-medium">{isPaused ? "Resume" : "Pause"}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => console.log("Confetti")}
              className="h-16 rounded-xl flex items-center justify-center gap-2 bg-zinc-900 text-zinc-300 active:bg-zinc-800 transition-colors duration-200"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              <span className="text-[12px] font-medium">Confetti</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => console.log("Transition")}
              className="h-16 rounded-xl flex items-center justify-center gap-2 bg-zinc-900 text-zinc-300 active:bg-zinc-800 transition-colors duration-200"
            >
              <Wand2 className="h-4 w-4" strokeWidth={1.8} />
              <span className="text-[12px] font-medium">Transition</span>
            </motion.button>
          </div>
        </section>

        {/* Handoff */}
        <section>
          <SectionLabel>Handoff</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => startHandoff("pull")}
              className="h-20 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-zinc-900 text-zinc-200 active:bg-zinc-800 transition-colors duration-200"
            >
              <Download className="h-4 w-4" strokeWidth={1.8} />
              <span className="text-[12px] font-medium">Pull Here</span>
              <span className="text-[9px] text-zinc-500">Desktop → Phone</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => startHandoff("push")}
              className="h-20 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-zinc-900 text-zinc-200 active:bg-zinc-800 transition-colors duration-200"
            >
              <Upload className="h-4 w-4" strokeWidth={1.8} />
              <span className="text-[12px] font-medium">Push</span>
              <span className="text-[9px] text-zinc-500">Phone → Desktop</span>
            </motion.button>
          </div>
        </section>
      </div>

      {/* Handoff Modal */}
      <AnimatePresence>
        {handoffAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={handoffStage === "success" ? closeHandoff : undefined}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-sm bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-8 pb-10 safe-bottom"
            >
              <div className="mx-auto h-1 w-10 rounded-full bg-white/10 mb-6 sm:hidden" />

              <AnimatePresence mode="wait">
                {handoffStage === "transferring" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-6" strokeWidth={1.5} />
                    <h3 className="text-base font-medium text-white mb-2">Transferring stream</h3>
                    <p className="text-[12px] text-zinc-500 max-w-[260px] leading-relaxed">{handoffCopy}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 14, stiffness: 220 }}
                      className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center mb-6"
                    >
                      <Check className="h-6 w-6 text-emerald-400" strokeWidth={2.2} />
                    </motion.div>
                    <h3 className="text-base font-medium text-white mb-2">Stream handed off</h3>
                    <p className="text-[12px] text-zinc-500 max-w-[260px] leading-relaxed">
                      {handoffAction === "pull" ? "Your phone is now live." : "Your desktop is now live."}
                    </p>
                    <button
                      onClick={closeHandoff}
                      className="mt-7 w-full h-11 rounded-xl bg-white text-zinc-950 font-medium text-[13px] active:scale-[0.98] transition-transform"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RemoteControlScreen;

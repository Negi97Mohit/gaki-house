// src/pages/Edit.tsx - Professional Minimalist Video Editor
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecordingSession, EMPTY_SESSION, ComponentTrack } from "@/types/editor";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  Scissors,
  Type,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Settings,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { useSessionPlayback } from "@/hooks/useSessionPlayback";
import { cn } from "@/lib/utils";

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const EditPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [allSessions] = useLocalStorage<RecordingSession[]>("gaki-recorded-sessions", []);
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const foundSession = allSessions.find((s) => s.id === sessionId);
    if (foundSession) {
      setSession(foundSession);
    } else {
      toast.error(`Session not found`);
      navigate("/");
    }
  }, [sessionId, allSessions, navigate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !session) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = (ratio * session.videoMetadata.duration) / 1000;
    handleSeek(newTime);
  };

  const handleExport = () => {
    toast.success("Exporting video...");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  const currentTimeMs = currentTime * 1000;
  const duration = session.videoMetadata.duration / 1000;
  const progress = (currentTime / duration) * 100;

  const playbackState = useSessionPlayback(session, currentTimeMs);

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 flex-shrink-0 bg-neutral-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <div className="h-6 w-px bg-neutral-800" />
          <h1 className="text-sm font-medium text-neutral-300 truncate max-w-xs">
            {session.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
            <Redo className="w-4 h-4" />
          </Button>
          <div className="h-6 w-px bg-neutral-800 mx-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowControlPanel(!showControlPanel)}
            className={cn(
              "text-neutral-400 hover:text-white",
              showControlPanel && "bg-neutral-800 text-white"
            )}
          >
            <Settings className="w-4 h-4 mr-2" />
            Controls
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col bg-neutral-950">
          {/* Canvas Toolbar */}
          <div className="h-12 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900/30">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                <Type className="w-4 h-4 mr-2" />
                Text
              </Button>
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                <ImageIcon className="w-4 h-4 mr-2" />
                Media
              </Button>
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Effects
              </Button>
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                <Layers className="w-4 h-4 mr-2" />
                Layers
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-neutral-400 w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center p-8 relative">
            <div className="relative max-w-full max-h-full">
              <video
                ref={videoRef}
                src={session.videoMetadata.videoUrl}
                className="max-h-full max-w-full rounded-lg shadow-2xl"
                style={{
                  aspectRatio: `${session.videoMetadata.width}/${session.videoMetadata.height}`,
                }}
              />
              
              {/* Overlay Preview */}
              {playbackState.captionStyle && (
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute bg-black/80 text-white px-4 py-2 rounded-lg text-sm"
                    style={{
                      left: `${playbackState.captionStyle.position.x}%`,
                      top: `${playbackState.captionStyle.position.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    [Caption]
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Control Panel */}
        {showControlPanel && (
          <div className="absolute top-4 right-4 w-80 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-right-5 duration-200">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-medium">Editor Controls</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowControlPanel(false)}
                className="h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Tabs defaultValue="effects" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-neutral-800 bg-transparent p-0">
                <TabsTrigger
                  value="effects"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Effects
                </TabsTrigger>
                <TabsTrigger
                  value="color"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Color
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Audio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="effects" className="p-4 space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400">Blur</Label>
                  <Slider defaultValue={[0]} max={100} step={1} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400">Brightness</Label>
                  <Slider defaultValue={[100]} max={200} step={1} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400">Contrast</Label>
                  <Slider defaultValue={[100]} max={200} step={1} className="w-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-neutral-400">Vignette</Label>
                  <Switch />
                </div>
              </TabsContent>

              <TabsContent value="color" className="p-4 space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400">Saturation</Label>
                  <Slider defaultValue={[100]} max={200} step={1} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400">Temperature</Label>
                  <Slider defaultValue={[0]} min={-100} max={100} step={1} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400">Tint</Label>
                  <Slider defaultValue={[0]} min={-100} max={100} step={1} className="w-full" />
                </div>
              </TabsContent>

              <TabsContent value="audio" className="p-4 space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400">Volume</Label>
                  <Slider
                    value={[volume]}
                    onValueChange={(v) => setVolume(v[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-neutral-400">Fade In</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-neutral-400">Fade Out</Label>
                  <Switch />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Timeline Panel */}
      <div className="h-56 border-t border-neutral-800 flex flex-col bg-neutral-900/50 backdrop-blur-sm flex-shrink-0">
        {/* Playback Controls */}
        <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSeek(Math.max(0, currentTime - 5))}
              className="text-neutral-400 hover:text-white"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePlay}
              className="text-white hover:bg-neutral-800"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSeek(Math.min(duration, currentTime + 5))}
              className="text-neutral-400 hover:text-white"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-neutral-400">
              {formatTime(currentTimeMs)} / {formatTime(session.videoMetadata.duration)}
            </span>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-neutral-400" />
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                max={100}
                step={1}
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="relative w-full h-16 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-800/80 transition-colors"
          >
            {/* Progress Bar */}
            <div
              className="absolute top-0 left-0 h-full bg-primary/20 rounded-lg pointer-events-none"
              style={{ width: `${progress}%` }}
            />
            
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none z-10"
              style={{ left: `${progress}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
            </div>

            {/* Track Indicators */}
            {session.htmlOverlayTrack.map((track, idx) => (
              <div
                key={track.id}
                className="absolute top-2 h-2 bg-purple-500/50 rounded"
                style={{
                  left: `${(track.keyframes[0]?.timestamp / session.videoMetadata.duration) * 100}%`,
                  width: `${((track.keyframes[track.keyframes.length - 1]?.timestamp - track.keyframes[0]?.timestamp) / session.videoMetadata.duration) * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Layer List */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Layers className="w-3 h-3" />
              <span>Layers</span>
            </div>
            <div className="space-y-1">
              {playbackState.activeHtmlOverlays.map((overlay) => (
                <div
                  key={overlay.id}
                  className="h-8 bg-neutral-800 rounded px-3 flex items-center text-xs text-neutral-400 hover:bg-neutral-700 cursor-pointer transition-colors"
                >
                  {overlay.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPage;

// src/components/SavedSessionsPanel.tsx
import React, { useState } from "react";
import { RecordingSession } from "@/types/editor";
import { LayoutPreset } from "@/types/layoutPreset";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Video,
  Edit,
  Download,
  Trash2,
  X,
  Play,
  Clock,
  Calendar,
  Layers,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SavedSessionsPanelProps {
  sessions: RecordingSession[];
  onDeleteSession: (id: string) => void;
  presets: LayoutPreset[];
  onDeletePreset: (id: string) => void;
  onLoadPreset: (preset: LayoutPreset) => void;
  isOpen: boolean;
  onClose: () => void;
}

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

export const SavedSessionsPanel: React.FC<SavedSessionsPanelProps> = ({
  sessions,
  onDeleteSession,
  presets,
  onDeletePreset,
  onLoadPreset,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recordings" | "presets">("presets");

  const handleDownload = (session: RecordingSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = session.videoMetadata.videoUrl;
    a.download = `${session.name}.webm`;
    a.click();
    toast.success("Downloading video...");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this recording?")) {
      onDeleteSession(id);
      toast.success("Recording deleted");
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleLoadPreset = (preset: LayoutPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    onLoadPreset(preset);
    toast.success(`"${preset.name}" preset loaded!`);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this preset?")) {
      onDeletePreset(id);
      toast.success("Preset deleted");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ zIndex: "var(--z-sessions-panel)" }}
      onClick={onClose}
    >
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-neutral-900 shadow-2xl animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {activeTab === "recordings" ? (
              <Video className="w-5 h-5 text-primary" />
            ) : (
              <Layers className="w-5 h-5 text-primary" />
            )}
            <h2 className="text-lg font-semibold text-white">
              {activeTab === "recordings" ? "Your Recordings" : "Saved Layouts"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-[calc(100vh-4rem)]">
          <TabsList className="w-full justify-start border-b border-neutral-800 rounded-none bg-transparent px-6 h-12">
            <TabsTrigger value="presets" className="data-[state=active]:bg-neutral-800">
              <Layers className="w-4 h-4 mr-2" />
              Layouts
            </TabsTrigger>
            <TabsTrigger value="recordings" className="data-[state=active]:bg-neutral-800">
              <Video className="w-4 h-4 mr-2" />
              Recordings
            </TabsTrigger>
          </TabsList>

          {/* Presets/Layouts Tab */}
          <TabsContent value="presets" className="h-[calc(100%-3rem)] overflow-y-auto p-6 mt-0">
            {presets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Layers className="w-16 h-16 text-neutral-700 mb-4" />
                <p className="text-neutral-400 text-sm">No saved layouts yet</p>
                <p className="text-neutral-600 text-xs mt-1">
                  Save a layout to see it here
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {presets.map((preset) => (
                  <Card
                    key={preset.id}
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all duration-200 border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/50 group",
                      hoveredId === preset.id && "ring-2 ring-primary/20"
                    )}
                    onMouseEnter={() => setHoveredId(preset.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={(e) => handleLoadPreset(preset, e)}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Preview */}
                      <div className="relative w-40 h-24 flex-shrink-0 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700 flex items-center justify-center">
                        <Layers className="w-8 h-8 text-neutral-600" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate mb-1">
                          {preset.name}
                        </h3>
                        <p className="text-xs text-neutral-400">
                          Click to load this layout
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={(e) => handleLoadPreset(preset, e)}
                          title="Load"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={(e) => handleDeletePreset(preset.id, e)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings" className="h-[calc(100%-3rem)] overflow-y-auto p-6 mt-0">
            {sessions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Video className="w-16 h-16 text-neutral-700 mb-4" />
                <p className="text-neutral-400 text-sm">No recordings yet</p>
                <p className="text-neutral-600 text-xs mt-1">
                  Start recording to see your sessions here
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all duration-200 border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/50 group",
                      hoveredId === session.id && "ring-2 ring-primary/20"
                    )}
                    onMouseEnter={() => setHoveredId(session.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleEdit(session.id)}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="relative w-40 h-24 flex-shrink-0 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700">
                        <video
                          src={session.videoMetadata.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                          {formatDuration(session.videoMetadata.duration)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate mb-1">
                          {session.name}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-neutral-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(parseInt(session.id.split("-")[1]))}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(session.videoMetadata.duration)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {session.htmlOverlayTrack.length > 0 && (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                              {session.htmlOverlayTrack.length} overlays
                            </span>
                          )}
                          {session.captionStyleTrack.keyframes.length > 0 && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                              Captions
                            </span>
                          )}
                          {session.browserOverlayTrack.length > 0 && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                              {session.browserOverlayTrack.length} browsers
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => handleEdit(session.id)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700"
                          onClick={(e) => handleDownload(session, e)}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={(e) => handleDelete(session.id, e)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

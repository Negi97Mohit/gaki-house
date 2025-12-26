// src/pages/Edit.tsx - Professional Minimalist Video Editor
import React from "react";
import { Video, Loader2 } from "lucide-react"; // Added Loader2
import { useEditSession } from "./Edit/hooks/useEditSession";
import { EditorHeader } from "./Edit/components/EditorHeader";

// Lazy Load Heavy Components
const EditorCanvas = React.lazy(() => import("./Edit/components/EditorCanvas").then(module => ({ default: module.EditorCanvas })));
const EditorControls = React.lazy(() => import("./Edit/components/EditorControls").then(module => ({ default: module.EditorControls })));
const EditorTimeline = React.lazy(() => import("./Edit/components/EditorTimeline").then(module => ({ default: module.EditorTimeline })));

const EditPage = () => {
  const {
    session,
    currentTime,
    currentTimeMs,
    isPlaying,
    volume,
    setVolume,
    zoom,
    showControlPanel,
    setShowControlPanel,
    videoRef,
    timelineRef,
    handleTogglePlay,
    handleSeek,
    handleTimelineClick,
    handleExport,
    playbackState,
    duration,
    progress
  } = useEditSession();

  // Loading State
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

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
      <EditorHeader
        sessionName={session.name}
        showControlPanel={showControlPanel}
        setShowControlPanel={setShowControlPanel}
        onExport={handleExport}
      />

      <React.Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}>
        <div className="flex-1 flex overflow-hidden relative">
          <EditorCanvas
            session={session}
            videoRef={videoRef}
            playbackState={playbackState}
            zoom={zoom}
          />

          <EditorControls
            show={showControlPanel}
            onClose={() => setShowControlPanel(false)}
            volume={volume}
            setVolume={setVolume}
          />
        </div>

        <EditorTimeline
          session={session}
          currentTime={currentTime}
          currentTimeMs={currentTimeMs}
          duration={duration}
          progress={progress}
          isPlaying={isPlaying}
          volume={volume}
          setVolume={setVolume}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          timelineRef={timelineRef}
          onTimelineClick={handleTimelineClick}
          playbackState={playbackState}
        />
      </React.Suspense>
    </div>
  );
};

export default EditPage;

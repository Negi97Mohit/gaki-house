// src/pages/Edit.tsx - Professional Minimalist Video Editor
import React from "react";
import { Video } from "lucide-react";
import { useEditSession } from "./Edit/hooks/useEditSession";
import { EditorHeader } from "./Edit/components/EditorHeader";
import { EditorCanvas } from "./Edit/components/EditorCanvas";
import { EditorControls } from "./Edit/components/EditorControls";
import { EditorTimeline } from "./Edit/components/EditorTimeline";

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
    </div>
  );
};

export default EditPage;

// src/components/VideoCanvas.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Webcam, VideoOff, ScreenShare, Square, ChevronUp, Check, Circle, RotateCcw, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useDeepgramSpeech } from "../hooks/useDeepgramSpeech";
import { useVideoStreams } from "../hooks/useVideoStreams";
import { Rnd } from 'react-rnd';
import { GeneratedOverlay, LayoutMode, CameraShape, CaptionStyle } from "../types/caption";
import { LayoutControls } from "./LayoutControls";
import { CameraRenderer } from "./CameraRenderer";
import { AICommandPopover } from "./AICommandPopover";
import { CaptionRenderer } from "./CaptionRenderer";


// New component to render raw HTML safely in an iframe
const HtmlOverlayRenderer: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      // Set the iframe content
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        
        // Ensure body and html are transparent
        doc.documentElement.style.background = 'transparent';
        doc.body.style.background = 'transparent';
        doc.body.style.margin = '0';
        doc.body.style.padding = '0';
        doc.body.style.overflow = 'hidden';
      }
    }
  }, [htmlContent]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        // CRITICAL: pointer-events none prevents iframe from blocking Rnd
        pointerEvents: 'none',
        backgroundColor: 'transparent',
        overflow: 'hidden',
      }}
      sandbox="allow-scripts allow-same-origin"
      title="ai-generated-overlay"
    />
  );
};

interface VideoCanvasProps {
  captionsEnabled: boolean;
  backgroundEffect: 'none' | 'blur' | 'image';
  backgroundImageUrl: string | null;
  isAutoFramingEnabled: boolean;
  onProcessTranscript: (transcript: string) => void;
  generatedOverlays: GeneratedOverlay[]; 
  generatedHtmlOverlay: GeneratedOverlay | null;
  onOverlayLayoutChange: (id: string, key: 'position' | 'size', value: any) => void;
  onRemoveOverlay: (id: string) => void;
  liveCaptionStyle: React.CSSProperties;
  dynamicStyle: string;
  videoFilter: string;
  isAudioOn: boolean;
  onAudioToggle: (on: boolean) => void;
  isVideoOn: boolean;
  onVideoToggle: (on: boolean) => void;
  isRecording: boolean;
  onRecordingToggle: (on: boolean) => void;
  selectedAudioDevice: string | undefined;
  onAudioDeviceSelect: (deviceId: string) => void;
  selectedVideoDevice: string | undefined;
  onVideoDeviceSelect: (deviceId: string) => void;
  zoomSensitivity: number;
  trackingSpeed: number;
  isBeautifyEnabled: boolean;
  isLowLightEnabled: boolean;
  layoutMode: LayoutMode;
  cameraShape: CameraShape;
  splitRatio: number;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  onLayoutModeChange: (mode: LayoutMode) => void;
  onCameraShapeChange: (shape: CameraShape) => void;
  onSplitRatioChange: (ratio: number) => void;
  onPipPositionChange: (position: { x: number; y: number }) => void;
  onPipSizeChange: (size: { width: number; height: number }) => void;
  customMaskUrl?: string;
  onCustomMaskUpload?: (file: File) => void;
  aiButtonPosition: { x: number; y: number };
  onAiButtonPositionChange: (position: { x: number; y: number }) => void;
  onCaptionLayoutChange: (layout: { position?: { x: number; y: number }, size?: { width: number, height: number } }) => void;
  isNeonEdgeEnabled: boolean;
  neonIntensity: number;
  neonColor: string;
  isProcessingAi: boolean;
}

const VideoPlayer: React.FC<{
  stream: MediaStream | null;
  className?: string;
  style?: React.CSSProperties;
}> = ({ stream, className, style }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay muted playsInline className={className} style={style} />;
};

const SNAP_THRESHOLD = 5;

export const VideoCanvas = (props: VideoCanvasProps) => {
  const {
    generatedOverlays,
    isVideoOn, isAudioOn, selectedVideoDevice, selectedAudioDevice,
    onVideoDeviceSelect, onAudioDeviceSelect, onVideoToggle, onAudioToggle,
    aiButtonPosition, onAiButtonPositionChange, onCaptionLayoutChange,
    isNeonEdgeEnabled, neonIntensity, neonColor, generatedHtmlOverlay,
    ...rest
  } = props;

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [pipContent, setPipContent] = useState<'camera' | 'screen'>('camera');
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const { cameraStream, screenStream } = useVideoStreams({
    isCameraOn: isVideoOn,
    isAudioOn: isAudioOn,
    isScreenSharing: isScreenSharing,
    selectedCameraDevice: selectedVideoDevice,
    selectedAudioDevice: selectedAudioDevice,
    onScreenShareEnd: () => setIsScreenSharing(false),
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const splitDividerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  const [fullTranscript, setFullTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const transcriptTimerRef = useRef<NodeJS.Timeout>();

  const handleFinalTranscript = useCallback((text: string) => {
    setFullTranscript(prev => (prev + " " + text).trim());
    setInterimTranscript("");
    rest.onProcessTranscript(text);

    clearTimeout(transcriptTimerRef.current);
    transcriptTimerRef.current = setTimeout(() => {
        setFullTranscript("");
    }, 4000);
  }, [rest.onProcessTranscript]);

const { startRecognition, stopRecognition } = useDeepgramSpeech({
    onFinalTranscript: handleFinalTranscript,
    onPartialTranscript: setInterimTranscript,
    stream: cameraStream,
  });

  useEffect(() => {
    if (isAudioOn) {
      startRecognition();
    } else {
      stopRecognition();
      setFullTranscript("");
      setInterimTranscript("");
    }
  }, [isAudioOn, startRecognition, stopRecognition]); // This is now safe and correct.

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
      } catch (err) {
        toast.error("Could not access camera or microphone. Please check permissions.");
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(() => {
        if (container) {
            setContainerSize({ width: container.clientWidth, height: container.clientHeight });
        }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

    const handleStartRecording = () => {
        const outputStream = new MediaStream();

        if (isScreenSharing && screenStream) {
            const screenVideoTrack = screenStream.getVideoTracks()[0];
            if (screenVideoTrack) outputStream.addTrack(screenVideoTrack.clone());
        }
        
        if (isVideoOn && cameraStream) {
            const cameraVideoTrack = cameraStream.getVideoTracks()[0];
            if (cameraVideoTrack) outputStream.addTrack(cameraVideoTrack.clone());
        }

        if (isAudioOn) {
            if (isScreenSharing && screenStream?.getAudioTracks().length > 0) {
                 const screenAudioTrack = screenStream.getAudioTracks()[0];
                 if(screenAudioTrack) outputStream.addTrack(screenAudioTrack.clone());
            } else if (cameraStream?.getAudioTracks().length > 0) {
                const cameraAudioTrack = cameraStream.getAudioTracks()[0];
                if(cameraAudioTrack) outputStream.addTrack(cameraAudioTrack.clone());
            }
        }

        if (outputStream.getTracks().length === 0) {
            toast.error("No stream available to record.");
            return;
        }

        recordedChunksRef.current = [];
        mediaRecorderRef.current = new MediaRecorder(outputStream, { mimeType: 'video/webm; codecs=vp9' });
        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gaki-recording-${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Recording downloaded!");
        };
        mediaRecorderRef.current.start();
        rest.onRecordingToggle(true);
        toast.info("Recording started!");
    };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    rest.onRecordingToggle(false);
  };

  const handleScreenShareClick = () => {
    setIsScreenSharing(prev => !prev);
  };

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  useEffect(() => {
    if (!isDraggingSplitter) return;
    const handleMouseMove = (e: MouseEvent) => {
      const container = canvasContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let ratio: number;
      if (rest.layoutMode === 'split-vertical') {
        ratio = (e.clientY - rect.top) / rect.height;
      } else {
        ratio = (e.clientX - rect.left) / rect.width;
      }
      ratio = Math.max(0.2, Math.min(0.8, ratio));
      rest.onSplitRatioChange(ratio);
    };
    const handleMouseUp = () => setIsDraggingSplitter(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplitter, rest.layoutMode, rest.onSplitRatioChange]);

  const handlePipDragStop = (e: any, d: { x: number; y: number }) => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let newX = (d.x / rect.width) * 100;
    let newY = (d.y / rect.height) * 100;

    const pipWidthPercent = rest.pipSize.width;
    const pipHeightPercent = rest.pipSize.height;
    if (newX < SNAP_THRESHOLD) newX = 2;
    if (newX > 100 - pipWidthPercent - SNAP_THRESHOLD) newX = 98 - pipWidthPercent;
    if (newY < SNAP_THRESHOLD) newY = 2;
    if (newY > 100 - pipHeightPercent - SNAP_THRESHOLD) newY = 98 - pipHeightPercent;

    rest.onPipPositionChange({ x: newX, y: newY });
};

const handlePipResizeStop = (e: any, direction: any, ref: HTMLElement, delta: any, position: any) => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newWidth = (parseInt(ref.style.width, 10) / rect.width) * 100;
    const newHeight = (parseInt(ref.style.height, 10) / rect.height) * 100;
    const newX = (position.x / rect.width) * 100;
    const newY = (position.y / rect.height) * 100;
    
    rest.onPipSizeChange({ width: Math.max(10, Math.min(50, newWidth)), height: Math.max(10, Math.min(50, newHeight)) });
    rest.onPipPositionChange({ x: newX, y: newY });
};

  const getCameraShapeStyle = () => {
    const baseStyle: React.CSSProperties = { overflow: 'hidden' };
    if (rest.customMaskUrl) {
      return { ...baseStyle, maskImage: `url(${rest.customMaskUrl})`, WebkitMaskImage: `url(${rest.customMaskUrl})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' };
    }
    switch (rest.cameraShape) {
      case 'circle': return { ...baseStyle, borderRadius: '50%'};
      case 'rounded': return { ...baseStyle, borderRadius: '16px' };
      case 'rectangle': default: return { ...baseStyle, borderRadius: '0' };
    }
  };

  const getVideoFilterStyle = (): string => {
    const filters: string[] = [];
    if (rest.videoFilter && rest.videoFilter !== 'none') filters.push(rest.videoFilter);
    if (rest.isBeautifyEnabled) filters.push('blur(0.5px) saturate(1.1) brightness(1.05)');
    if (rest.isLowLightEnabled) filters.push('brightness(1.3) contrast(1.15)');
    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  const videoFilterString = getVideoFilterStyle();

  const renderCamera = (className?: string, style?: React.CSSProperties, isPip: boolean = false) => (
    <div className={cn("w-full h-full", className, isPip && rest.cameraShape === 'circle' && 'aspect-square')} style={getCameraShapeStyle()}>
        {(rest.backgroundEffect !== 'none' || rest.isAutoFramingEnabled || isNeonEdgeEnabled) ? (
          <CameraRenderer 
            stream={cameraStream} 
            backgroundEffect={rest.backgroundEffect} 
            backgroundImageUrl={rest.backgroundImageUrl} 
            isAutoFramingEnabled={rest.isAutoFramingEnabled} 
            zoomSensitivity={rest.zoomSensitivity} 
            trackingSpeed={rest.trackingSpeed} 
            className="w-full h-full"
            style={{ ...style, filter: videoFilterString }}
            isNeonEdgeEnabled={isNeonEdgeEnabled}
            neonIntensity={neonIntensity}
            neonColor={neonColor}
          />
        ) : (
          <VideoPlayer stream={cameraStream} className="w-full h-full object-cover" style={{ ...style, filter: videoFilterString }} />
        )}
    </div>
  );
  
  const renderScreen = (className?: string) => (
      <VideoPlayer stream={screenStream} className={cn("w-full h-full object-cover", className)} />
  );

  const renderContent = () => {
    const mainIsCamera = (pipContent === 'screen' && isScreenSharing && screenStream) || (!isScreenSharing);
    const mainContent = mainIsCamera ? renderCamera() : renderScreen();
    const pipVideo = pipContent === 'camera' ? renderCamera("cursor-move", {}, true) : renderScreen("cursor-move");

    const pipSizePx = { width: (containerSize.width * rest.pipSize.width) / 100, height: (containerSize.height * rest.pipSize.height) / 100 };
    const pipPositionPx = { x: (containerSize.width * rest.pipPosition.x) / 100, y: (containerSize.height * rest.pipPosition.y) / 100 };

    const pipContentEl = isScreenSharing && screenStream && isVideoOn && cameraStream && containerSize.width > 0 && (
        <Rnd size={pipSizePx} position={pipPositionPx} minWidth={containerSize.width * 0.1} minHeight={containerSize.height * 0.1} maxWidth={containerSize.width * 0.5} maxHeight={containerSize.height * 0.5} bounds="parent" onDragStop={handlePipDragStop} onResizeStop={handlePipResizeStop} className="pointer-events-auto" style={{ zIndex: 210 }}>
            <div className="w-full h-full relative group">
                {pipVideo}
                <Button size="icon" variant="secondary" className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPipContent(pipContent === 'camera' ? 'screen' : 'camera')}>
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
        </Rnd>
    );

    const getBackgroundStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = {};
      if (rest.backgroundEffect === 'blur') { style.backdropFilter = 'blur(10px)'; style.WebkitBackdropFilter = 'blur(10px)'; }
      if (rest.backgroundEffect === 'image' && rest.backgroundImageUrl) { style.backgroundImage = `url(${rest.backgroundImageUrl})`; style.backgroundSize = 'cover'; style.backgroundPosition = 'center'; }
      return style;
    };

    const contentWithBackground = (
      <div className="w-full h-full relative" style={getBackgroundStyle()}>
        {rest.backgroundEffect === 'image' && rest.backgroundImageUrl && (<div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${rest.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', }} />)}
        <div className="relative w-full h-full" style={rest.backgroundEffect === 'blur' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}}>{mainContent}</div>
        {pipContentEl}
      </div>
    );

    switch (rest.layoutMode) {
      case 'pip': return contentWithBackground;
      case 'split-vertical':
      case 'split-horizontal':
        const isVertical = rest.layoutMode === 'split-vertical';
        return (
          <div className={cn("w-full h-full flex", isVertical ? "flex-col" : "flex-row")}>
            <div className="relative bg-black flex items-center justify-center overflow-hidden" style={{ [isVertical ? 'height' : 'width']: `${rest.splitRatio * 100}%` }}>
              {isScreenSharing && screenStream ? renderScreen() : (<div className="text-center text-muted-foreground"><ScreenShare className="w-16 h-16 mx-auto mb-2" /><p className="text-sm">Click Share Screen to start</p></div>)}
            </div>
            <div ref={splitDividerRef} className={cn("bg-border hover:bg-primary transition-colors flex items-center justify-center group", isVertical ? "h-2 w-full cursor-row-resize" : "w-2 h-full cursor-col-resize")} onMouseDown={handleSplitterMouseDown}>
              <div className={cn("bg-primary/50 group-hover:bg-primary rounded-full transition-colors", isVertical ? "w-12 h-1" : "w-1 h-12")} />
            </div>
            <div className="relative bg-black flex items-center justify-center overflow-hidden" style={{ [isVertical ? 'height' : 'width']: `${(1 - rest.splitRatio) * 100}%` }}>
              {isVideoOn && cameraStream ? (<div className="w-full h-full relative" style={getBackgroundStyle()}>{rest.backgroundEffect === 'image' && rest.backgroundImageUrl && (<div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${rest.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', }} />)}<div className="relative w-full h-full">{renderCamera()}</div></div>) : (<div className="text-center text-muted-foreground"><Webcam className="w-16 h-16 mx-auto mb-2" /><p className="text-sm">Camera Off</p></div>)}
            </div>
          </div>
        );
      default: return contentWithBackground;
    }
  };

  return (
    <div ref={canvasContainerRef} className="flex-1 relative bg-black overflow-hidden flex items-center justify-center w-full h-full">
      {renderContent()}
      <div className="absolute top-4 right-4 z-50"> <LayoutControls {...rest} /> </div>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 220 }}>
        <div className="w-full h-full relative">
{generatedOverlays.map(overlay => {
  const widthPx = (containerSize.width * overlay.layout.size.width) / 100;
  const heightPx = (containerSize.height * overlay.layout.size.height) / 100;
  const xPx = (containerSize.width * overlay.layout.position.x) / 100 - widthPx / 2;
  const yPx = (containerSize.height * overlay.layout.position.y) / 100 - heightPx / 2;

  return (
    <Rnd
      key={overlay.id}
      default={{
        x: xPx,
        y: yPx,
        width: widthPx,
        height: heightPx,
      }}
      onDragStop={(e, d) => {
        const newX = ((d.x + widthPx / 2) / containerSize.width) * 100;
        const newY = ((d.y + heightPx / 2) / containerSize.height) * 100;
        rest.onOverlayLayoutChange(overlay.id, 'position', {
          x: newX,
          y: newY,
        });
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        const newWidthPercent = (parseInt(ref.style.width, 10) / containerSize.width) * 100;
        const newHeightPercent = (parseInt(ref.style.height, 10) / containerSize.height) * 100;
        const newX = ((pos.x + parseInt(ref.style.width, 10) / 2) / containerSize.width) * 100;
        const newY = ((pos.y + parseInt(ref.style.height, 10) / 2) / containerSize.height) * 100;
        
        rest.onOverlayLayoutChange(overlay.id, 'position', {
          x: newX,
          y: newY,
        });
        rest.onOverlayLayoutChange(overlay.id, 'size', {
          width: newWidthPercent,
          height: newHeightPercent,
        });
      }}
      bounds="parent"
      minWidth={50}
      minHeight={50}
      enableResizing={true}
      className="group pointer-events-auto border-2 border-dashed border-transparent hover:border-primary transition-colors"
      style={{ zIndex: overlay.layout.zIndex }}
    >
      <div className="w-full h-full relative overflow-hidden bg-black/5">
        <HtmlOverlayRenderer htmlContent={overlay.htmlContent} />
        <button
          onClick={() => rest.onRemoveOverlay(overlay.id)}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Rnd>
  );
})}
          {(() => {
            const captionText = (fullTranscript + " " + interimTranscript).trim();
            const captionStyle = rest.liveCaptionStyle as CaptionStyle;
            if (!rest.captionsEnabled || !captionText || containerSize.width === 0) return null;
            return (
              <Rnd
                size={{
                  width: `${captionStyle.width || 80}%`,
                  height: `${captionStyle.height || 10}%`,
                }}
                position={{
                  x: ((captionStyle.position.x - (captionStyle.width || 80) / 2) / 100) * containerSize.width,
                  y: ((captionStyle.position.y - (captionStyle.height || 10) / 2) / 100) * containerSize.height,
                }}
                onDragStop={(e, d) => {
                  onCaptionLayoutChange({
                    position: {
                      x: ((d.x / containerSize.width) * 100) + ((captionStyle.width || 80) / 2),
                      y: ((d.y / containerSize.height) * 100) + ((captionStyle.height || 10) / 2),
                    }
                  });
                }}
                onResizeStop={(e, direction, ref, delta, pos) => {
                  onCaptionLayoutChange({
                    position: {
                      x: ((pos.x / containerSize.width) * 100) + ((parseInt(ref.style.width, 10) / containerSize.width * 100) / 2),
                      y: ((pos.y / containerSize.height) * 100) + ((parseInt(ref.style.height, 10) / containerSize.height * 100) / 2),
                    },
                    size: {
                      width: (parseInt(ref.style.width, 10) / containerSize.width) * 100,
                      height: (parseInt(ref.style.height, 10) / containerSize.height) * 100,
                    }
                  });
                }}
                bounds="parent"
                className="pointer-events-auto border-2 border-transparent hover:border-primary border-dashed"
                style={{ zIndex: 999 }}
                minWidth="20%"
                minHeight="5%"
              >
                <CaptionRenderer
                  activeStyleId={rest.dynamicStyle}
                  captionStyle={captionStyle}
                  text={captionText}
                  fullTranscript={fullTranscript}
                  interimTranscript={interimTranscript}
                  baseStyle={{
                    fontFamily: captionStyle.fontFamily,
                    fontSize: `${captionStyle.fontSize}px`,
                    color: captionStyle.color,
                    backgroundColor: captionStyle.backgroundColor,
                    textShadow: (captionStyle as any).shadow ? "2px 2px 4px rgba(0,0,0,0.5)" : "none",
                    fontWeight: (captionStyle as any).bold ? "bold" : "normal",
                    fontStyle: (captionStyle as any).italic ? "italic" : "normal",
                    textDecoration: (captionStyle as any).underline ? "underline" : "none",
                  }}
                />
              </Rnd>
            );
          })()}
        </div>
      </div>
      {/* ===== THIS IS THE CORRECTED, DRAGGABLE AI BUTTON ===== */}
      {containerSize.width > 0 && (
          <Rnd
            style={{ zIndex: 250 }}
            size={{ width: 64, height: 64 }}
            position={{ x: (aiButtonPosition.x / 100) * containerSize.width - 32, y: (aiButtonPosition.y / 100) * containerSize.height - 32 }}
            onDragStop={(e, d) => {
              const newX = ((d.x + 32) / containerSize.width) * 100;
              const newY = ((d.y + 32) / containerSize.height) * 100;
              onAiButtonPositionChange({ x: newX, y: newY });
            }}
            bounds="parent"
            enableResizing={false}
            className="pointer-events-auto"
          >
            <AICommandPopover onSubmit={rest.onProcessTranscript} isProcessing={props.isProcessingAi}>
              <Button size="icon" className="rounded-full h-16 w-16 shadow-lg bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-8 w-8" />
              </Button>
            </AICommandPopover>
          </Rnd>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001]">
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md border rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => onAudioToggle(!isAudioOn)}>
              {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-red-500"/>}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><ChevronUp className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {audioDevices.map((device, i) => (
                  <DropdownMenuItem key={device.deviceId} onClick={() => onAudioDeviceSelect(device.deviceId)}>
                    {device.deviceId === selectedAudioDevice && <Check className="w-4 h-4 mr-2"/>}
                    {device.label || `Microphone ${i + 1}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => onVideoToggle(!isVideoOn)}>
              {isVideoOn ? <Webcam className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-red-500"/>}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><ChevronUp className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {videoDevices.map((device, i) => (
                  <DropdownMenuItem key={device.deviceId} onClick={() => onVideoDeviceSelect(device.deviceId)}>
                    {device.deviceId === selectedVideoDevice && <Check className="w-4 h-4 mr-2"/>}
                    {device.label || `Camera ${i + 1}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-px h-8 bg-border" />
          <Button variant="ghost" size="icon" className={cn("rounded-full h-10 w-10 transition-colors", isScreenSharing && "bg-primary/20")} onClick={handleScreenShareClick} title={isScreenSharing ? "Stop screen share" : "Share screen"}>
            <ScreenShare className="h-5 w-5" />
          </Button>
          <div className="w-px h-8 bg-border" />
          <Button
            size="icon"
            className={cn("rounded-full h-12 w-12 transition-colors", rest.isRecording ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90")}
            onClick={rest.isRecording ? handleStopRecording : handleStartRecording}
          >
            {rest.isRecording ? <Square className="h-6 w-6" /> : <Circle className="h-6 w-6 fill-current" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
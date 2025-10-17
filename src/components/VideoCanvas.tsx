// src/components/VideoCanvas.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Webcam, VideoOff, ScreenShare, Square, ChevronUp, Check, Circle, RotateCcw, Sparkles, X, Expand, Shrink, PanelLeftOpen,PanelLeftClose  } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useDeepgramSpeech } from "../hooks/useDeepgramSpeech";
import { useVideoStreams } from "../hooks/useVideoStreams";
import { Rnd } from 'react-rnd';
import { GeneratedOverlay, LayoutMode, CameraShape } from "../types/caption";
import { LayoutControls } from "./LayoutControls";
import { CameraRenderer } from "./CameraRenderer";
import { AICommandPopover } from "./AICommandPopover";
import { CaptionRenderer } from "./CaptionRenderer";
import { generatePreview } from "@/lib/preview";
import { LeftSidebar } from "./LeftSidebar";
import { DraggableBrowser, BrowserOverlayState } from "./DraggableBrowser";

// New component to render raw HTML safely in an iframe
const HtmlOverlayRenderer: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        
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
        pointerEvents: 'none',
        backgroundColor: 'transparent',
        overflow: 'hidden',
      }}
      sandbox="allow-scripts allow-same-origin"
      title="ai-generated-overlay"
    />
  );
};

const DraggableOverlay: React.FC<{
  overlay: GeneratedOverlay;
  onLayoutChange: (id: string, key: 'position' | 'size' | 'rotation', value: any) => void;
  onRemoveOverlay: (id: string) => void;
  onPreviewGenerated: (id: string, dataUrl: string) => void;
  containerSize: { width: number; height: number };
}> = ({ overlay, onLayoutChange, onRemoveOverlay, onPreviewGenerated, containerSize }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlay.preview === "" && elementRef.current) {
      const timer = setTimeout(async () => {
        if (elementRef.current) {
          const previewDataUrl = await generatePreview(elementRef.current);
          if (previewDataUrl) {
            onPreviewGenerated(overlay.id, previewDataUrl);
          }
        }
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [overlay.id, overlay.preview, onPreviewGenerated]);

  const handleRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!elementRef.current) return;
    const box = elementRef.current.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialRotation = overlay.layout.rotation || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      onLayoutChange(overlay.id, 'rotation', initialRotation + angleDiff);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!containerSize.width || !containerSize.height) return null;

  const widthPx = (containerSize.width * overlay.layout.size.width) / 100;
  const heightPx = (containerSize.height * overlay.layout.size.height) / 100;
  const xPx = (containerSize.width * overlay.layout.position.x) / 100 - widthPx / 2;
  const yPx = (containerSize.height * overlay.layout.position.y) / 100 - heightPx / 2;

  return (
    <Rnd
      default={{ x: xPx, y: yPx, width: widthPx, height: heightPx }}
      onDragStop={(e, d) => {
        const newX = ((d.x + widthPx / 2) / containerSize.width) * 100;
        const newY = ((d.y + heightPx / 2) / containerSize.height) * 100;
        onLayoutChange(overlay.id, 'position', { x: newX, y: newY });
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        const newWidthPercent = (parseInt(ref.style.width, 10) / containerSize.width) * 100;
        const newHeightPercent = (parseInt(ref.style.height, 10) / containerSize.height) * 100;
        const newX = ((pos.x + parseInt(ref.style.width, 10) / 2) / containerSize.width) * 100;
        const newY = ((pos.y + parseInt(ref.style.height, 10) / 2) / containerSize.height) * 100;
        onLayoutChange(overlay.id, 'position', { x: newX, y: newY });
        onLayoutChange(overlay.id, 'size', { width: newWidthPercent, height: newHeightPercent });
      }}
      bounds="parent"
      minWidth={50}
      minHeight={50}
      enableResizing={true}
      className="group pointer-events-auto border-2 border-dashed border-transparent hover:border-primary transition-colors"
      style={{ zIndex: overlay.layout.zIndex }} // REMOVED transform from here
    >
      <div
        ref={elementRef}
        className="w-full h-full relative"
        style={{ transform: `rotate(${overlay.layout.rotation || 0}deg)` }} // MOVED transform here
      >
        <div className="w-full h-full overflow-hidden">
          <HtmlOverlayRenderer htmlContent={overlay.htmlContent} />
        </div>
        <button
          onClick={() => onRemoveOverlay(overlay.id)}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50"
        >
          <X className="w-4 h-4" />
        </button>
        <div
          onMouseDown={handleRotationStart}
          className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50 cursor-alias"
        >
          <RotateCcw className="w-4 h-4" />
        </div>
      </div>
    </Rnd>
  );
};


interface VideoCanvasProps {
  captionsEnabled: boolean;
  onStyleChange: (style: any) => void; 
  onCaptionsToggle: (on: boolean) => void;
  isAiModeEnabled: boolean;
  onAiModeToggle: (on: boolean) => void;
  backgroundEffect: 'none' | 'blur' | 'image';
  backgroundImageUrl: string | null;
  isAutoFramingEnabled: boolean;
  onProcessTranscript: (transcript: string, targetId: string | null) => void;
  generatedOverlays: GeneratedOverlay[]; 
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
  onPreviewGenerated: (id: string, dataUrl: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
isFsSidebarOpen: boolean;
  onFsSidebarToggle: (open: boolean | ((prev: boolean) => boolean)) => void; // MODIFIED
    portalContainer: HTMLElement | null; // ADD THIS LINE
browserOverlays: BrowserOverlayState[];
  onRemoveBrowser: (id: string) => void;
  onBrowserUrlChange: (id: string, url: string) => void;
  onBrowserLayoutChange: (id: string, layout: Partial<BrowserOverlayState['layout']>) => void;
  sidebarProps: Omit<React.ComponentProps<typeof LeftSidebar>, 'width' | 'isCollapsed' | 'onResize' | 'onExpand'>;
selectedBrowserId: string | null;
  setSelectedBrowserId: (id: string | null) => void;
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
    generatedOverlays, isVideoOn, isAudioOn, selectedVideoDevice, selectedAudioDevice,
    onVideoDeviceSelect, onAudioDeviceSelect, onVideoToggle, onAudioToggle,
    aiButtonPosition, onAiButtonPositionChange, onCaptionLayoutChange,
    isNeonEdgeEnabled, neonIntensity, neonColor, onPreviewGenerated,
    isFullscreen, onToggleFullscreen, isFsSidebarOpen, onFsSidebarToggle,
    isAiModeEnabled, onAiModeToggle, captionsEnabled, onCaptionsToggle,
    sidebarProps,portalContainer,browserOverlays,
    onRemoveBrowser,
    onBrowserUrlChange,
    onBrowserLayoutChange,selectedBrowserId,
    setSelectedBrowserId,
    ...rest
  } = props;

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [pipContent, setPipContent] = useState<'camera' | 'screen'>('camera');
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  const [audioStreamForSpeech, setAudioStreamForSpeech] = useState<MediaStream | null>(null);
  const [fullTranscript, setFullTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const transcriptTimerRef = useRef<NodeJS.Timeout>();

  const handleFinalTranscript = useCallback((text: string) => {
    setFullTranscript(prev => (prev + " " + text).trim());
    setInterimTranscript("");
    rest.onProcessTranscript(text, null);

    clearTimeout(transcriptTimerRef.current);
    transcriptTimerRef.current = setTimeout(() => {
      setFullTranscript("");
    }, 4000);
  }, [rest.onProcessTranscript]);

  const { startRecognition, stopRecognition } = useDeepgramSpeech({
    onFinalTranscript: handleFinalTranscript,
    onPartialTranscript: setInterimTranscript,
    stream: audioStreamForSpeech,
  });

  useEffect(() => {
    if (audioStreamForSpeech) {
      startRecognition();
    } else {
      stopRecognition();
      if (!isAudioOn) {
        setFullTranscript("");
        setInterimTranscript("");
      }
    }
  }, [audioStreamForSpeech, isAudioOn, startRecognition, stopRecognition]);

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

  // Auto-hide logic now depends on `isFullscreen`
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleActivity = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      setIsControlsVisible(true);
      
      if (isFullscreen) {
        inactivityTimerRef.current = setTimeout(() => {
          setIsControlsVisible(false);
        }, 3000);
      }
    };

    container.addEventListener('mousemove', handleActivity);
    handleActivity();

    return () => {
      container.removeEventListener('mousemove', handleActivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [isFullscreen]);

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
        if (screenAudioTrack) outputStream.addTrack(screenAudioTrack.clone());
      } else if (cameraStream?.getAudioTracks().length > 0) {
        const cameraAudioTrack = cameraStream.getAudioTracks()[0];
        if (cameraAudioTrack) outputStream.addTrack(cameraAudioTrack.clone());
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

// src/components/VideoCanvas.tsx

  // This useEffect now *only* manages the audio stream for speech recognition
  useEffect(() => {
    // This variable holds the stream created within this effect's scope
    let dedicatedAudioStream: MediaStream | null = null;

    const manageAudioStream = async () => {
      if (isAudioOn) {
        // If the audio toggle is on, get a dedicated audio-only stream
        try {
          const constraints: MediaStreamConstraints = {
            audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
          };
          dedicatedAudioStream = await navigator.mediaDevices.getUserMedia(constraints);
          setAudioStreamForSpeech(dedicatedAudioStream);
        } catch (err) {
          console.error("Failed to get dedicated audio stream for captions:", err);
          toast.error("Could not access microphone for captions.");
          onAudioToggle(false); // Turn the toggle off if permission is denied
        }
      } else {
        // If the audio toggle is off, stop any active stream and clear the state
        if (audioStreamForSpeech) {
          audioStreamForSpeech.getTracks().forEach(track => track.stop());
          setAudioStreamForSpeech(null);
        }
      }
    };

    manageAudioStream();

    // This cleanup function will stop the stream if the component unmounts
    return () => {
      if (dedicatedAudioStream) {
        dedicatedAudioStream.getTracks().forEach(track => track.stop());
      }
    };
    // The dependency array is now correctly scoped to only the audio controls
  }, [isAudioOn, selectedAudioDevice, onAudioToggle]);
  
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
      case 'circle': return { ...baseStyle, borderRadius: '50%' };
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
        {rest.backgroundEffect === 'image' && rest.backgroundImageUrl && (
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${rest.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        <div className="relative w-full h-full" style={rest.backgroundEffect === 'blur' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}}>
          {mainContent}
        </div>
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
              {isScreenSharing && screenStream ? renderScreen() : (
                <div className="text-center text-muted-foreground">
                  <ScreenShare className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Click Share Screen to start</p>
                </div>
              )}
            </div>
            <div ref={splitDividerRef} className={cn("bg-border hover:bg-primary transition-colors flex items-center justify-center group", isVertical ? "h-2 w-full cursor-row-resize" : "w-2 h-full cursor-col-resize")} onMouseDown={handleSplitterMouseDown}>
              <div className={cn("bg-primary/50 group-hover:bg-primary rounded-full transition-colors", isVertical ? "w-12 h-1" : "w-1 h-12")} />
            </div>
            <div className="relative bg-black flex items-center justify-center overflow-hidden" style={{ [isVertical ? 'height' : 'width']: `${(1 - rest.splitRatio) * 100}%` }}>
              {isVideoOn && cameraStream ? (
                <div className="w-full h-full relative" style={getBackgroundStyle()}>
                  {rest.backgroundEffect === 'image' && rest.backgroundImageUrl && (
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${rest.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  )}
                  <div className="relative w-full h-full">{renderCamera()}</div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Webcam className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Camera Off</p>
                </div>
              )}
            </div>
          </div>
        );
      default: return contentWithBackground;
    }
  };

  return (
    <div ref={canvasContainerRef} className="flex-1 relative bg-black overflow-hidden flex items-center justify-center w-full h-full">
      {renderContent()}

      {/* Floating Sidebar for Fullscreen Mode */}
      {isFullscreen && (
        <>
    <div className={cn("absolute top-4 left-4 z-[1002] transition-opacity duration-300", isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <Button variant="secondary" size="icon" onClick={() => onFsSidebarToggle(prev => !prev)}>
        {isFsSidebarOpen ? (
          <PanelLeftClose className="w-5 h-5" />
        ) : (
          <PanelLeftOpen className="w-5 h-5" />
        )}
      </Button>
    </div>
              {isFsSidebarOpen && (
            <div className="absolute top-16 left-4 z-[1003] h-[85vh] rounded-xl border shadow-2xl bg-transparent">
              <LeftSidebar
                {...sidebarProps}
                width={384}
                isCollapsed={false}
                onResize={() => {}}
                onExpand={() => {}}
                isOverlayMode={true}
                onClose={() => onFsSidebarToggle(false)}
              />
            </div>
          )}
        </>
      )}

      <div className={cn("absolute top-4 right-4 z-50 transition-opacity duration-300", isControlsVisible || !isFullscreen ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <LayoutControls {...rest} portalContainer={portalContainer} />
      </div>
      
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 220 }}>
        <div className="w-full h-full relative">
          {generatedOverlays.map(overlay => (
            <DraggableOverlay
              key={overlay.id}
              overlay={overlay}
              onLayoutChange={rest.onOverlayLayoutChange}
              onRemoveOverlay={rest.onRemoveOverlay}
              onPreviewGenerated={onPreviewGenerated}
              containerSize={containerSize}
            />
          ))}
          {browserOverlays.map(browser => (
<DraggableBrowser
    key={browser.id}
    overlay={browser}
    onRemove={onRemoveBrowser}
    onUrlChange={onBrowserUrlChange}
    onLayoutChange={onBrowserLayoutChange}
    containerSize={containerSize}
    isSelected={selectedBrowserId === browser.id}
    // ADD THIS LINE TO FIX THE ERROR
    onSelect={setSelectedBrowserId}
  />
          ))}
{(() => {
  const captionText = (fullTranscript + " " + interimTranscript).trim();
  const captionStyle = rest.liveCaptionStyle as any; 
  if (!captionsEnabled || !captionText || containerSize.width === 0) return null;
  
  const captionRef = React.createRef<HTMLDivElement>();
  
  const handleCaptionRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!captionRef.current) return;
    const box = captionRef.current.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialRotation = captionStyle.rotation || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      props.onStyleChange({ ...captionStyle, rotation: initialRotation + angleDiff });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Get current width percentage (default to 80% if not set)
  const currentWidthPercent = captionStyle.width || 80;
  
  // Calculate pixel dimensions
  const widthPx = (containerSize.width * currentWidthPercent) / 100;
  
  // Calculate position in pixels (center-based)
  const xPx = (containerSize.width * captionStyle.position.x) / 100 - widthPx / 2;
  const yPx = (containerSize.height * captionStyle.position.y) / 100;

  return (
    <Rnd
      size={{
        width: widthPx,
        height: 'auto',
      }}
      position={{
        x: xPx,
        y: yPx,
      }}
      onDragStop={(e, d) => {
        // Calculate new center position
        const newCenterX = ((d.x + widthPx / 2) / containerSize.width) * 100;
        const newCenterY = (d.y / containerSize.height) * 100;
        
        onCaptionLayoutChange({
          position: {
            x: newCenterX,
            y: newCenterY,
          }
        });
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        const newWidthPx = parseInt(ref.style.width, 10);
        const newWidthPercent = (newWidthPx / containerSize.width) * 100;
        
        // Calculate new center position after resize
        const newCenterX = ((pos.x + newWidthPx / 2) / containerSize.width) * 100;
        const newCenterY = (pos.y / containerSize.height) * 100;
        
        onCaptionLayoutChange({
          position: {
            x: newCenterX,
            y: newCenterY,
          },
          size: {
            width: newWidthPercent,
          }
        });
      }}
      bounds="parent"
      className="group pointer-events-auto border-2 border-transparent hover:border-primary border-dashed"
      style={{ zIndex: 999 }}
      minWidth={containerSize.width * 0.2}
      enableResizing={{
        left: true,
        right: true,
        top: false,
        bottom: false,
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
      }}
    >
      <div 
        ref={captionRef} 
        className="w-full h-full relative" 
        style={{ transform: `rotate(${captionStyle.rotation || 0}deg)` }}
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
            textShadow: captionStyle.shadow ? "2px 2px 4px rgba(0,0,0,0.5)" : "none",
            fontWeight: captionStyle.bold ? "bold" : "normal",
            fontStyle: captionStyle.italic ? "italic" : "normal",
            textDecoration: captionStyle.underline ? "underline" : "none",
          }}
        />
        <div
          onMouseDown={handleCaptionRotationStart}
          className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50 cursor-alias"
        >
          <RotateCcw className="w-4 h-4" />
        </div>
      </div>
    </Rnd>
  );
})()}
                  </div>
      </div>      
      {containerSize.width > 0 && (
        <Rnd
          style={{ zIndex: 1000 }}
          size={{ width: 64, height: 64 }}
          position={{ x: (aiButtonPosition.x / 100) * containerSize.width - 32, y: (aiButtonPosition.y / 100) * containerSize.height - 32 }}
          onDragStop={(e, d) => {
            const newX = ((d.x + 32) / containerSize.width) * 100;
            const newY = ((d.y + 32) / containerSize.height) * 100;
            onAiButtonPositionChange({ x: newX, y: newY });
          }}
          bounds="parent"
          enableResizing={false}
          className={cn("pointer-events-auto transition-opacity duration-300", isControlsVisible || !isFullscreen ? "opacity-100" : "opacity-0")}
        >
          <AICommandPopover
            onSubmit={rest.onProcessTranscript}
            isProcessing={props.isProcessingAi}
            activeOverlays={generatedOverlays}
            isFullscreen={isFullscreen}
            isAiModeEnabled={isAiModeEnabled}
            onAiModeToggle={onAiModeToggle}
            captionsEnabled={captionsEnabled}
            onCaptionsToggle={onCaptionsToggle}
            portalContainer={portalContainer} 
          >
            <Button size="icon" className="rounded-full h-16 w-16 shadow-lg bg-purple-600 hover:bg-purple-700">
              <Sparkles className="h-8 w-8" />
            </Button>
          </AICommandPopover>
        </Rnd>
      )}

      <div className={cn("absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001] transition-opacity duration-300 ease-in-out", isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md border rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => onAudioToggle(!isAudioOn)}>
              {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-red-500" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><ChevronUp className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {audioDevices.map((device, i) => (
                  <DropdownMenuItem key={device.deviceId} onClick={() => onAudioDeviceSelect(device.deviceId)}>
                    {device.deviceId === selectedAudioDevice && <Check className="w-4 h-4 mr-2" />}
                    {device.label || `Microphone ${i + 1}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => onVideoToggle(!isVideoOn)}>
              {isVideoOn ? <Webcam className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-red-500" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><ChevronUp className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {videoDevices.map((device, i) => (
                  <DropdownMenuItem key={device.deviceId} onClick={() => onVideoDeviceSelect(device.deviceId)}>
                    {device.deviceId === selectedVideoDevice && <Check className="w-4 h-4 mr-2" />}
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
          <div className="w-px h-8 bg-border" />
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={onToggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            {isFullscreen ? <Shrink className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
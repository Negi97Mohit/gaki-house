import React, { useState, useRef, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import {
  CanvasSectionCameraState,
  TextOverlayState,
  DEFAULT_CAMERA_STATE,
} from "@/types/caption";
import { CameraRenderer } from "@/components/CameraRenderer";
import { DraggableTextOverlay } from "@/components/DraggableTextOverlay";
import { PipControlsToolbar } from "@/components/PipControlsToolbar";
import { Button } from "@/components/ui/button";
import { Paintbrush, Plus, Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { v4 as uuidv4 } from "uuid";

interface InteractiveGridSectionProps {
  sectionId: string;
  settings: CanvasSectionCameraState;
  onUpdate: (settings: Partial<CanvasSectionCameraState>) => void;
  cameraStream: MediaStream | null;
  videoDevices: MediaDeviceInfo[];
  isActive: boolean;
  onSelect: () => void;
}

export const InteractiveGridSection: React.FC<InteractiveGridSectionProps> = ({
  sectionId,
  settings,
  onUpdate,
  cameraStream,
  videoDevices,
  isActive,
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isCameraSelected, setIsCameraSelected] = useState(false);

  // Track container size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSceneSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Deselect on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSelectedTextId(null);
        setIsCameraSelected(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleTextLayoutChange = (
    id: string,
    layout: Partial<TextOverlayState["layout"]>
  ) => {
    const newOverlays = settings.textOverlays?.map((t) =>
      t.id === id ? { ...t, layout: { ...t.layout, ...layout } } : t
    );
    onUpdate({ textOverlays: newOverlays });
  };

  const handleTextStyleChange = (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => {
    const newOverlays = settings.textOverlays?.map((t) =>
      t.id === id ? { ...t, style: { ...t.style, ...style } } : t
    );
    onUpdate({ textOverlays: newOverlays });
  };

  const handleTextContentChange = (id: string, content: string) => {
    const newOverlays = settings.textOverlays?.map((t) =>
      t.id === id ? { ...t, content } : t
    );
    onUpdate({ textOverlays: newOverlays });
  };

  const handleRemoveText = (id: string) => {
    const newOverlays = settings.textOverlays?.filter((t) => t.id !== id);
    onUpdate({ textOverlays: newOverlays });
  };

  const handleAddText = () => {
    const newText: TextOverlayState = {
      id: uuidv4(),
      content: "New Text",
      style: {
        fontFamily: "Inter",
        fontSize: 48,
        color: "#FFFFFF",
        bold: true,
        italic: false,
        underline: false,
        textAlign: "center",
      },
      layout: {
        position: { x: 50, y: 50 },
        size: { width: 30, height: 10 },
        rotation: 0,
        zIndex: 20,
      },
    };
    onUpdate({
      textOverlays: [...(settings.textOverlays || []), newText],
    });
    setSelectedTextId(newText.id);
  };

  const handlePipLayoutChange = (d: any, ref: any, pos?: any) => {
    if (sceneSize.width === 0 || sceneSize.height === 0) return;

    // Calculate percentages
    let x, y, width, height;

    if (pos) {
      // Resize
      // Use offsetWidth/Height for pixel values, then convert to percentage
      width = (ref.offsetWidth / sceneSize.width) * 100;
      height = (ref.offsetHeight / sceneSize.height) * 100;
      x = (pos.x / sceneSize.width) * 100;
      y = (pos.y / sceneSize.height) * 100;
    } else {
      // Drag
      x = (d.x / sceneSize.width) * 100;
      y = (d.y / sceneSize.height) * 100;
      width = settings.pipSize?.width || 30;
      height = settings.pipSize?.height || 30;
    }

    onUpdate({
      pipPosition: { x, y },
      pipSize: { width, height },
    });
  };

  // --- Render Helpers ---

  const PRESET_COLORS = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden group/section"
      style={{
        backgroundColor: settings.sectionBackgroundColor || "#000000",
        backgroundImage: settings.sectionBackgroundImage
          ? `url(${settings.sectionBackgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={(e) => {
        // Only select the section if we're not interacting with children
        // and deselect items if clicking on the background
        if (e.target === e.currentTarget) {
          onSelect();
          setSelectedTextId(null);
          setIsCameraSelected(false);
        }
      }}
    >
      {/* --- Controls (Visible on Hover) --- */}
      <div className="absolute top-2 left-2 z-50 flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="secondary" className="h-8 w-8">
              <Paintbrush className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div className="grid grid-cols-4 gap-2 p-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: color }}
                  onClick={() => onUpdate({ sectionBackgroundColor: color })}
                />
              ))}
            </div>
            <div className="p-2 pt-0">
              <input
                type="color"
                className="w-full h-8 cursor-pointer"
                value={settings.sectionBackgroundColor || "#000000"}
                onChange={(e) =>
                  onUpdate({ sectionBackgroundColor: e.target.value })
                }
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={handleAddText}
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>
      {/* Only render interactive elements when we have dimensions */}
      {sceneSize.width > 0 && (
        <>
          {/* --- PiP Camera --- */}
          <Rnd
            size={{
              width: `${settings.pipSize?.width || 30}%`,
              height: `${settings.pipSize?.height || 30}%`,
            }}
            position={{
              x: (sceneSize.width * (settings.pipPosition?.x || 0)) / 100,
              y: (sceneSize.height * (settings.pipPosition?.y || 0)) / 100,
            }}
            bounds="parent"
            onDragStop={(e, d) => handlePipLayoutChange(d, null)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              handlePipLayoutChange(null, ref, pos)
            }
            onDragStart={() => setIsCameraSelected(true)}
            onClick={(e) => {
              e.stopPropagation();
              setIsCameraSelected(true);
              setSelectedTextId(null);
            }}
            className={cn(
              "z-10",
              isCameraSelected && "ring-2 ring-primary ring-offset-2"
            )}
            lockAspectRatio={false}
          >
            <div className="w-full h-full pointer-events-none overflow-hidden rounded-md">
              <CameraRenderer
                stream={cameraStream}
                className="w-full h-full object-cover"
                style={{
                  borderRadius: "0px",
                }}
                portalContainer={null}
                cameraShape={settings.cameraShape || "rectangle"}
                onCameraShapeChange={(shape) =>
                  onUpdate({ cameraShape: shape })
                }
                showAspectRatio={false}
                videoDevices={videoDevices}
                selectedDeviceId={settings.selectedDeviceId}
                onCameraDeviceChange={(deviceId) =>
                  onUpdate({ selectedDeviceId: deviceId })
                }
                pipBorder={settings.pipBorder}
                onPipBorderChange={(border) => onUpdate({ pipBorder: border })}
                pipShadow={settings.pipShadow}
                onPipShadowChange={(shadow) => onUpdate({ pipShadow: shadow })}
                isAutoFramingEnabled={settings.isAutoFramingEnabled}
                onAutoFramingChange={(enabled) =>
                  onUpdate({ isAutoFramingEnabled: enabled })
                }
                isBeautifyEnabled={settings.isBeautifyEnabled}
                onBeautifyToggle={(enabled) =>
                  onUpdate({ isBeautifyEnabled: enabled })
                }
                isLowLightEnabled={settings.isLowLightEnabled}
                onLowLightToggle={(enabled) =>
                  onUpdate({ isLowLightEnabled: enabled })
                }
                videoFilter={settings.videoFilter}
                onVideoFilterChange={(filter) =>
                  onUpdate({ videoFilter: filter })
                }
                isNeonEdgeEnabled={settings.isNeonEdgeEnabled}
                onNeonEdgeToggle={(enabled) =>
                  onUpdate({ isNeonEdgeEnabled: enabled })
                }
                neonIntensity={settings.neonIntensity}
                onNeonIntensityChange={(value) =>
                  onUpdate({ neonIntensity: value })
                }
                neonColor={settings.neonColor}
                onNeonEdgeColorChange={(color) =>
                  onUpdate({ neonColor: color })
                }
                zoomSensitivity={settings.zoomSensitivity}
                onZoomSensitivityChange={(value) =>
                  onUpdate({ zoomSensitivity: value })
                }
                trackingSpeed={settings.trackingSpeed}
                onTrackingSpeedChange={(value) =>
                  onUpdate({ trackingSpeed: value })
                }
                cameraBackground={settings.cameraBackground}
                onCameraBackgroundChange={(bgId) =>
                  onUpdate({ cameraBackground: bgId })
                }
                onCustomBackgroundUpload={(file) => {
                  const url = URL.createObjectURL(file);
                  onUpdate({
                    cameraBackground: "image",
                    customBackgroundUrl: url,
                  });
                }}
                cameraAspectRatio={settings.cameraAspectRatio}
                onCameraAspectRatioChange={(ratio) =>
                  onUpdate({ cameraAspectRatio: ratio })
                }
                customAspectRatio={settings.customAspectRatio}
                onCustomAspectRatioChange={(ratio) =>
                  onUpdate({ customAspectRatio: ratio })
                }
                isFaceTrackingEnabled={settings.isFaceTrackingEnabled}
                onFaceTrackingToggle={(enabled) =>
                  onUpdate({ isFaceTrackingEnabled: enabled })
                }
                activeInteractiveFilter={settings.activeInteractiveFilter}
                onInteractiveFilterChange={(filter) =>
                  onUpdate({ activeInteractiveFilter: filter })
                }
                filterIntensity={settings.filterIntensity}
                onFilterIntensityChange={(value) =>
                  onUpdate({ filterIntensity: value })
                }
                filterColor={settings.filterColor}
                onFilterColorChange={(color) =>
                  onUpdate({ filterColor: color })
                }
                filterTarget={settings.filterTarget}
                onFilterTargetChange={(target) =>
                  onUpdate({ filterTarget: target })
                }
              />
            </div>
          </Rnd>

          {/* --- Camera Toolbar --- */}
          {isCameraSelected && (
            <PipControlsToolbar
              position={{
                x:
                  (sceneSize.width * (settings.pipPosition?.x || 0)) / 100 +
                  (sceneSize.width * (settings.pipSize?.width || 30)) / 200,
                y: (sceneSize.height * (settings.pipPosition?.y || 0)) / 100,
              }}
              containerRef={containerRef}
              pipBorder={settings.pipBorder}
              showAspectRatio={false}
              // PASS LOCAL SHAPE STATE
              cameraShape={settings.cameraShape || "rectangle"}
              onCameraShapeChange={(shape) => onUpdate({ cameraShape: shape })}
              onPipBorderChange={(border) => onUpdate({ pipBorder: border })}
              pipShadow={settings.pipShadow}
              onPipShadowChange={(shadow) => onUpdate({ pipShadow: shadow })}
              isAutoFramingEnabled={settings.isAutoFramingEnabled}
              onAutoFramingChange={(enabled) =>
                onUpdate({ isAutoFramingEnabled: enabled })
              }
              isBeautifyEnabled={settings.isBeautifyEnabled}
              onBeautifyToggle={(enabled) =>
                onUpdate({ isBeautifyEnabled: enabled })
              }
              isLowLightEnabled={settings.isLowLightEnabled}
              onLowLightToggle={(enabled) =>
                onUpdate({ isLowLightEnabled: enabled })
              }
              videoFilter={settings.videoFilter}
              onVideoFilterChange={(filter) =>
                onUpdate({ videoFilter: filter })
              }
              isNeonEdgeEnabled={settings.isNeonEdgeEnabled}
              onNeonEdgeToggle={(enabled) =>
                onUpdate({ isNeonEdgeEnabled: enabled })
              }
              neonIntensity={settings.neonIntensity}
              onNeonIntensityChange={(value) =>
                onUpdate({ neonIntensity: value })
              }
              neonEdgeColor={settings.neonColor}
              onNeonEdgeColorChange={(color) => onUpdate({ neonColor: color })}
              zoomSensitivity={settings.zoomSensitivity}
              onZoomSensitivityChange={(value) =>
                onUpdate({ zoomSensitivity: value })
              }
              trackingSpeed={settings.trackingSpeed}
              onTrackingSpeedChange={(value) =>
                onUpdate({ trackingSpeed: value })
              }
              cameraBackground={settings.cameraBackground}
              onCameraBackgroundChange={(bgId) =>
                onUpdate({ cameraBackground: bgId })
              }
              onCustomBackgroundUpload={(file) => {
                const url = URL.createObjectURL(file);
                onUpdate({
                  cameraBackground: "image",
                  customBackgroundUrl: url,
                });
              }}
              cameraAspectRatio={settings.cameraAspectRatio}
              onCameraAspectRatioChange={(ratio) =>
                onUpdate({ cameraAspectRatio: ratio })
              }
              customAspectRatio={settings.customAspectRatio}
              onCustomAspectRatioChange={(ratio) =>
                onUpdate({ customAspectRatio: ratio })
              }
              isFaceTrackingEnabled={settings.isFaceTrackingEnabled}
              onFaceTrackingToggle={(enabled) =>
                onUpdate({ isFaceTrackingEnabled: enabled })
              }
              activeInteractiveFilter={settings.activeInteractiveFilter}
              onInteractiveFilterChange={(filter) =>
                onUpdate({ activeInteractiveFilter: filter })
              }
              filterIntensity={settings.filterIntensity}
              onFilterIntensityChange={(value) =>
                onUpdate({ filterIntensity: value })
              }
              filterColor={settings.filterColor}
              onFilterColorChange={(color) => onUpdate({ filterColor: color })}
              filterTarget={settings.filterTarget}
              onFilterTargetChange={(target) =>
                onUpdate({ filterTarget: target })
              }
              videoDevices={videoDevices}
              selectedDeviceId={settings.selectedDeviceId}
              onCameraDeviceChange={(deviceId) =>
                onUpdate({ selectedDeviceId: deviceId })
              }
            />
          )}

          {/* --- Text Overlays --- */}
          {settings.textOverlays?.map((textOverlay) => (
            <DraggableTextOverlay
              key={textOverlay.id}
              overlay={textOverlay}
              onLayoutChange={handleTextLayoutChange}
              onStyleChange={handleTextStyleChange}
              onContentChange={handleTextContentChange}
              onRemove={handleRemoveText}
              sceneSize={sceneSize}
              containerRef={containerRef}
              isSelected={selectedTextId === textOverlay.id}
              onSelect={setSelectedTextId}
              onInternalDragStart={() => {}}
              onInternalDragStop={() => {}}
              isSpacePressed={false}
            />
          ))}
        </>
      )}
    </div>
  );
};

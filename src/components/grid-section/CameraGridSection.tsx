import React from "react";
import { CanvasSectionCameraState } from "@/types/caption";
import { CameraRenderer } from "@/components/CameraRenderer";
import { InteractiveGridSection } from "@/components/InteractiveGridSection";

interface CameraGridSectionProps {
    sectionId: string;
    settings: CanvasSectionCameraState;
    cameraStream: MediaStream | null;
    videoDevices: MediaDeviceInfo[];
    onSectionCameraSettingsChange: (
        sectionId: string,
        settings: Partial<CanvasSectionCameraState>
    ) => void;
    cameraShape: "rectangle" | "circle" | "rounded";
    backgroundEffect: "none" | "blur" | "image";
    activeSequenceId?: string | null;
    onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
    backgroundImageUrl?: string;
}

export const CameraGridSection: React.FC<CameraGridSectionProps> = ({
    sectionId,
    settings,
    cameraStream,
    videoDevices,
    onSectionCameraSettingsChange,
    cameraShape,
    backgroundEffect,
    activeSequenceId,
    onUserPositionChange,
    backgroundImageUrl,
}) => {
    if (settings.layoutMode === "pip") {
        return (
            <InteractiveGridSection
                sectionId={sectionId}
                settings={settings}
                onUpdate={(newSettings) =>
                    onSectionCameraSettingsChange(sectionId, newSettings)
                }
                cameraStream={cameraStream}
                videoDevices={videoDevices}
                isActive={true}
                onSelect={() => { }}
            />
        );
    }

    return (
        <CameraRenderer
            stream={cameraStream}
            className="w-full h-full object-cover"
            style={{
                borderRadius:
                    cameraShape === "circle"
                        ? "50%"
                        : cameraShape === "rounded"
                            ? "12px"
                            : "0",
            }}
            portalContainer={null}
            videoDevices={videoDevices}
            selectedDeviceId={settings.selectedDeviceId}
            onCameraDeviceChange={(deviceId) =>
                onSectionCameraSettingsChange(sectionId, {
                    selectedDeviceId: deviceId,
                })
            }
            pipBorder={settings.pipBorder}
            onPipBorderChange={(border) =>
                onSectionCameraSettingsChange(sectionId, {
                    pipBorder: border,
                })
            }
            pipShadow={settings.pipShadow}
            onPipShadowChange={(shadow) =>
                onSectionCameraSettingsChange(sectionId, {
                    pipShadow: shadow,
                })
            }
            isAutoFramingEnabled={settings.isAutoFramingEnabled}
            onAutoFramingChange={(enabled) =>
                onSectionCameraSettingsChange(sectionId, {
                    isAutoFramingEnabled: enabled,
                })
            }
            isBeautifyEnabled={settings.isBeautifyEnabled}
            onBeautifyToggle={(enabled) =>
                onSectionCameraSettingsChange(sectionId, {
                    isBeautifyEnabled: enabled,
                })
            }
            isLowLightEnabled={settings.isLowLightEnabled}
            onLowLightToggle={(enabled) =>
                onSectionCameraSettingsChange(sectionId, {
                    isLowLightEnabled: enabled,
                })
            }
            videoFilter={settings.videoFilter}
            onVideoFilterChange={(filter) =>
                onSectionCameraSettingsChange(sectionId, {
                    videoFilter: filter,
                })
            }
            isNeonEdgeEnabled={settings.isNeonEdgeEnabled}
            onNeonEdgeToggle={(enabled) =>
                onSectionCameraSettingsChange(sectionId, {
                    isNeonEdgeEnabled: enabled,
                })
            }
            neonIntensity={settings.neonIntensity}
            onNeonIntensityChange={(value) =>
                onSectionCameraSettingsChange(sectionId, {
                    neonIntensity: value,
                })
            }
            neonColor={settings.neonColor}
            onNeonEdgeColorChange={(color) =>
                onSectionCameraSettingsChange(sectionId, {
                    neonColor: color,
                })
            }
            zoomSensitivity={settings.zoomSensitivity}
            onZoomSensitivityChange={(value) =>
                onSectionCameraSettingsChange(sectionId, {
                    zoomSensitivity: value,
                })
            }
            trackingSpeed={settings.trackingSpeed}
            onTrackingSpeedChange={(value) =>
                onSectionCameraSettingsChange(sectionId, {
                    trackingSpeed: value,
                })
            }
            cameraBackground={settings.cameraBackground}
            onCameraBackgroundChange={(bgId) =>
                onSectionCameraSettingsChange(sectionId, {
                    cameraBackground: bgId,
                })
            }
            onCustomBackgroundUpload={(file) => {
                const url = URL.createObjectURL(file);
                onSectionCameraSettingsChange(sectionId, {
                    cameraBackground: "image",
                    customBackgroundUrl: url,
                });
            }}
            cameraAspectRatio={settings.cameraAspectRatio}
            onCameraAspectRatioChange={(ratio) =>
                onSectionCameraSettingsChange(sectionId, {
                    cameraAspectRatio: ratio,
                })
            }
            customAspectRatio={settings.customAspectRatio}
            onCustomAspectRatioChange={(ratio) =>
                onSectionCameraSettingsChange(sectionId, {
                    customAspectRatio: ratio,
                })
            }
            isFaceTrackingEnabled={settings.isFaceTrackingEnabled}
            onFaceTrackingToggle={(enabled) =>
                onSectionCameraSettingsChange(sectionId, {
                    isFaceTrackingEnabled: enabled,
                })
            }
            activeInteractiveFilter={settings.activeInteractiveFilter}
            onInteractiveFilterChange={(filter) =>
                onSectionCameraSettingsChange(sectionId, {
                    activeInteractiveFilter: filter,
                })
            }
            filterIntensity={settings.filterIntensity}
            onFilterIntensityChange={(value) =>
                onSectionCameraSettingsChange(sectionId, {
                    filterIntensity: value,
                })
            }
            filterColor={settings.filterColor}
            onFilterColorChange={(color) =>
                onSectionCameraSettingsChange(sectionId, {
                    filterColor: color,
                })
            }
            filterTarget={settings.filterTarget}
            onFilterTargetChange={(target) =>
                onSectionCameraSettingsChange(sectionId, {
                    filterTarget: target,
                })
            }
            backgroundEffect={backgroundEffect}
            backgroundImageUrl={backgroundImageUrl}
            onUserPositionChange={
                sectionId === activeSequenceId ? onUserPositionChange : undefined
            }
        />
    );
};

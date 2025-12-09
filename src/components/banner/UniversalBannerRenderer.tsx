import React, { useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { isStaticBanner, BannerDesign, BannerContentData, BannerElementState } from "@/types/banner";
import { useBannerEditor } from "@/hooks/useBannerEditor";
import { StaticBannerBackground } from "./StaticBannerBackground";
import { BannerBackgroundRenderer } from "@/components/animated-banners/BannerBackgroundRenderer";
import { BannerInternalDraggable } from "@/components/banner-editor/BannerInternalDraggable";
import { BannerTextToolbar } from "@/components/banner-editor/BannerTextToolbar";
import { BannerCustomizationToolbar } from "@/components/banner-editor/BannerCustomizationToolbar";
import { getPlatformIcon } from "./PlatformIcons";
import { User } from "lucide-react";

interface UniversalBannerRendererProps {
    design: BannerDesign;
    contentData: BannerContentData;
    isEditing?: boolean;
    scale?: number;
    onClick?: () => void;
    // Editor Props (passed to hook)
    elementStates?: BannerElementState[];
    onElementStatesChange?: (states: BannerElementState[]) => void;
    onContentChange?: (field: keyof BannerContentData, value: string) => void;
    containerSize?: { width: number; height: number };
    className?: string;
    onDelete?: () => void;
}

export const UniversalBannerRenderer: React.FC<UniversalBannerRendererProps> = ({
    design,
    contentData,
    isEditing = false,
    scale = 1,
    onClick,
    elementStates,
    onElementStatesChange,
    onContentChange,
    containerSize = { width: 600, height: 150 },
    className,
    onDelete,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isStatic = isStaticBanner(design);

    // Hook handles all interaction state
    const {
        states,
        selectedId,
        setSelectedId,
        textEditingId,
        editingText,
        setEditingText,
        handlePositionChange,
        handleStyleChange,
        handleVisibilityChange,
        handleTextDoubleClick,
        handleTextBlur,
        handleContainerClick,
        getElementState,
    } = useBannerEditor({
        design,
        contentData,
        initialElementStates: elementStates,
        onElementStatesChange,
        onContentChange,
        containerSize,
    });

    const getElement = (id: string) => getElementState(id);
    const selectedElement = getElementState(selectedId || "");
    const showTextToolbar =
        selectedElement &&
        (selectedElement.type === "name" || selectedElement.type === "tagline");

    // --- STATIC PREVIEW MODE (Legacy Flexbox Layout) ---
    // Only use this if it is a static banner AND we are NOT editing AND no custom positions exist.
    // If elementStates exist (meaning user has customized positions), we need to use the interactive mode
    // to respect those positions even when not editing.
    const hasCustomPositions = elementStates && elementStates.length > 0;

    if (isStatic && !isEditing && !hasCustomPositions) {
        const staticDesign = design as any; // Cast to access styles
        const visibleLinks = contentData.links.slice(0, staticDesign.maxLinks);

        return (
            <div
                style={{
                    ...staticDesign.styles.container,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    cursor: onClick ? "pointer" : "default",
                    position: "relative",
                }}
                className={className}
                onClick={onClick}
            >
                {staticDesign.showAvatar && (
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: contentData.avatarUrl
                                ? `url(${contentData.avatarUrl}) center/cover`
                                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                    >
                        {!contentData.avatarUrl && <User className="w-6 h-6 text-white/80" />}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={staticDesign.styles.name}>{contentData.name}</span>
                    {staticDesign.showTagline && contentData.tagline && (
                        <span style={staticDesign.styles.tagline}>{contentData.tagline}</span>
                    )}
                </div>

                <div style={staticDesign.styles.linksContainer}>
                    {visibleLinks.map((link: any, index: number) => {
                        const IconComponent = getPlatformIcon(link.platform);
                        return (
                            <div
                                key={`${link.platform}-${index}`}
                                style={staticDesign.styles.link}
                                onClick={(e) => e.stopPropagation()}
                                title={link.username || link.platform}
                            >
                                <IconComponent
                                    className="transition-transform hover:scale-110"
                                    style={staticDesign.styles.icon}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- INTERACTIVE / UNIVERSAL MODE ---
    // Used for Animated Banners (Always) AND Static Banners (When Editing or when positions have been customized)

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full ${className || ""}`}
            style={{
                width: isEditing ? "100%" : containerSize.width, // Force 100% in editor container
                height: isEditing ? "100%" : containerSize.height,
                overflow: "hidden", // Clip content to banner bounds
                ...(isStatic ? {} : { background: contentData.backgroundColor || design.preview }) // Animated bg fallback
            }}
            onClick={handleContainerClick}
        >
            {/* BACKGROUND LAYER */}
            {isStatic ? (
                <StaticBannerBackground
                    design={design as any}
                    className="w-full h-full absolute inset-0" // Removed !p-0 !border-0 to preserve design styles
                // We might need to ensure the container styles (border, radius, shadow, bg) are applied
                // but NOT the flex layout. StaticBannerBackground renders the styles.container
                />
            ) : (
                <BannerBackgroundRenderer design={design as any} />
            )}

            {/* DRAGGABLE CONTENT LAYER */}

            {/* Avatar */}
            {states.find(s => s.id === "avatar")?.visible && (
                <BannerInternalDraggable
                    element={states.find(s => s.id === "avatar")!}
                    isEditing={isEditing}
                    isSelected={selectedId === "avatar"}
                    isTextEditing={false}
                    containerSize={containerSize}
                    onPositionChange={handlePositionChange}
                    onSelect={setSelectedId}
                    onDoubleClick={() => { }}
                    onRemove={(id) => handleVisibilityChange(id, false)}
                    content={
                        <div
                            style={{
                                width: `${getElement("avatar")?.style.fontSize}px`,
                                height: `${getElement("avatar")?.style.fontSize}px`,
                                borderRadius: "50%",
                                background: contentData.avatarUrl
                                    ? `url(${contentData.avatarUrl}) center/cover`
                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                        >
                            {!contentData.avatarUrl && (
                                <User className="w-1/2 h-1/2 text-white/80" />
                            )}
                        </div>
                    }
                />
            )}

            {/* Name */}
            {states.find(s => s.id === "name")?.visible && (
                <BannerInternalDraggable
                    element={states.find(s => s.id === "name")!}
                    isEditing={isEditing}
                    isSelected={selectedId === "name"}
                    isTextEditing={textEditingId === "name"}
                    containerSize={containerSize}
                    onPositionChange={handlePositionChange}
                    onSelect={setSelectedId}
                    onDoubleClick={handleTextDoubleClick}
                    onRemove={(id) => handleVisibilityChange(id, false)}
                    content={
                        <span
                            style={{
                                ...getElement("name")?.style, // Apply all styles first
                                display: "block",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {contentData.name}
                        </span>
                    }
                    editContent={
                        <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={handleTextBlur}
                            onKeyDown={(e) => e.key === "Enter" && handleTextBlur()}
                            autoFocus
                            style={{
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                minWidth: "50px",
                                fontSize: getElement("name")?.style.fontSize,
                                fontFamily: getElement("name")?.style.fontFamily,
                                color: getElement("name")?.style.color,
                                fontWeight: getElement("name")?.style.fontWeight as any,
                                textShadow: getElement("name")?.style.textShadow,
                            }}
                        />
                    }
                />
            )}

            {/* Tagline */}
            {states.find(s => s.id === "tagline")?.visible && (
                <BannerInternalDraggable
                    element={states.find(s => s.id === "tagline")!}
                    isEditing={isEditing}
                    isSelected={selectedId === "tagline"}
                    isTextEditing={textEditingId === "tagline"}
                    containerSize={containerSize}
                    onPositionChange={handlePositionChange}
                    onSelect={setSelectedId}
                    onDoubleClick={handleTextDoubleClick}
                    onRemove={(id) => handleVisibilityChange(id, false)}
                    content={
                        <span
                            style={{
                                ...getElement("tagline")?.style,
                                display: "block",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {contentData.tagline}
                        </span>
                    }
                    editContent={
                        <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={handleTextBlur}
                            onKeyDown={(e) => e.key === "Enter" && handleTextBlur()}
                            autoFocus
                            style={{
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                minWidth: "50px",
                                fontSize: getElement("tagline")?.style.fontSize,
                                fontFamily: getElement("tagline")?.style.fontFamily,
                                color: getElement("tagline")?.style.color,
                                fontWeight: getElement("tagline")?.style.fontWeight as any,
                                textShadow: getElement("tagline")?.style.textShadow,
                            }}
                        />
                    }
                />
            )}

            {/* Social Links */}
            {states.find(s => s.id === "socialLinks")?.visible && (
                <BannerInternalDraggable
                    element={states.find(s => s.id === "socialLinks")!}
                    isEditing={isEditing}
                    isSelected={selectedId === "socialLinks"}
                    isTextEditing={false}
                    containerSize={containerSize}
                    onPositionChange={handlePositionChange}
                    onSelect={setSelectedId}
                    onDoubleClick={() => { }}
                    onRemove={(id) => handleVisibilityChange(id, false)}
                    content={
                        <div style={{ display: "flex", gap: "8px" }}>
                            {contentData.links.slice(0, design.maxLinks).map((link, index) => {
                                const IconComponent = getPlatformIcon(link.platform);
                                const elementStyle = getElement("socialLinks")?.style || {};
                                const size = elementStyle.fontSize || 20;

                                return (
                                    <div
                                        key={index}
                                        style={isStatic ? (design as any).styles.link : {
                                            padding: "8px",
                                            borderRadius: "50%",
                                            background: "rgba(255,255,255,0.1)"
                                        }}
                                    >
                                        <IconComponent
                                            style={{
                                                width: `${size}px`,
                                                height: `${size}px`,
                                                ...elementStyle // Apply extracted styles (filters, color, etc)
                                            }}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    }
                />
            )}

            {/* TEXT TOOLBAR */}
            <AnimatePresence>
                {isEditing && showTextToolbar && selectedElement && (
                    <BannerTextToolbar
                        fontSize={selectedElement.style.fontSize}
                        fontFamily={selectedElement.style.fontFamily}
                        color={selectedElement.style.color}
                        fontWeight={selectedElement.style.fontWeight}
                        onFontSizeChange={(size) => handleStyleChange(selectedElement.id, { fontSize: size })}
                        onFontFamilyChange={(family) => handleStyleChange(selectedElement.id, { fontFamily: family })}
                        onColorChange={(color) => handleStyleChange(selectedElement.id, { color })}
                        onFontWeightChange={(weight) => handleStyleChange(selectedElement.id, { fontWeight: weight })}
                        position={selectedElement.position}
                    />
                )}
            </AnimatePresence>

            {/* CUSTOMIZATION TOOLBAR */}
            <AnimatePresence>
                {isEditing && (
                    <BannerCustomizationToolbar
                        elements={states as any} // Cast to compatible type
                        selectedElementId={selectedId}
                        backgroundColor={contentData.backgroundColor || ""}
                        primaryColor={contentData.primaryColor || ""}
                        secondaryColor={contentData.secondaryColor || ""}
                        onElementToggle={(id, visible) => handleVisibilityChange(id, visible)}
                        onElementStyleChange={handleStyleChange}
                        onBackgroundChange={(color) => onContentChange?.("backgroundColor", color)}
                        onPrimaryColorChange={(color) => onContentChange?.("primaryColor", color)}
                        onSecondaryColorChange={(color) => onContentChange?.("secondaryColor", color)}
                        onAddElement={(type) => {
                            // Find element with this type and make visible
                            const el = states.find(s => s.type === type);
                            if (el) handleVisibilityChange(el.id, true);
                        }}
                        onRemoveElement={(id) => handleVisibilityChange(id, false)}
                        onDeleteBanner={onDelete}
                        onClose={() => setSelectedId(null)}
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

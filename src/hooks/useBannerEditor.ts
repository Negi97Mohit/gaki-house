import { useState, useCallback, useEffect, useRef } from "react";
import { BannerElementState, BannerContentData, BannerDesign, isStaticBanner } from "@/types/banner";

interface UseBannerEditorProps {
    design: BannerDesign;
    contentData: BannerContentData;
    initialElementStates?: BannerElementState[];
    onElementStatesChange?: (states: BannerElementState[]) => void;
    onContentChange?: (field: keyof BannerContentData, value: string) => void;
    containerSize?: { width: number; height: number };
}

export const useBannerEditor = ({
    design,
    contentData,
    initialElementStates,
    onElementStatesChange,
    onContentChange,
    containerSize = { width: 600, height: 150 },
}: UseBannerEditorProps) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [textEditingId, setTextEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");

    // Track if an internal update is pending to avoid overwriting with stale props
    const isInternalUpdateRef = useRef(false);

    // Helper to extract numeric font size from various formats
    const parseFontSize = (value: string | number | undefined, fallback: number): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? fallback : parsed;
        }
        return fallback;
    };

    // Calculate default states based on design type - preserving ALL original design styles
    const calculateDefaultStates = useCallback((): BannerElementState[] => {
        const isStatic = isStaticBanner(design);
        
        // For static banners, extract styles from the design's style definitions
        // For animated banners, use theme-appropriate defaults
        let nameStyles: BannerElementState["style"];
        let taglineStyles: BannerElementState["style"];
        let avatarStyles: BannerElementState["style"];
        let socialLinksStyles: BannerElementState["style"];

        if (isStatic && design.styles) {
            // Extract ALL style properties from static banner design
            const nameStyle = design.styles.name || {};
            const taglineStyle = design.styles.tagline || {};
            
            nameStyles = {
                fontSize: parseFontSize(nameStyle.fontSize, 22),
                fontFamily: (nameStyle.fontFamily as string) || "Inter",
                color: (nameStyle.color as string) || "#ffffff",
                fontWeight: (nameStyle.fontWeight as string) || "bold",
                // Preserve text-shadow and other special effects
                textShadow: nameStyle.textShadow as string | undefined,
                textTransform: nameStyle.textTransform as string | undefined,
                letterSpacing: nameStyle.letterSpacing as string | undefined,
            };
            
            taglineStyles = {
                fontSize: parseFontSize(taglineStyle.fontSize, 14),
                fontFamily: (taglineStyle.fontFamily as string) || "Inter",
                color: (taglineStyle.color as string) || "rgba(255,255,255,0.8)",
                fontWeight: (taglineStyle.fontWeight as string) || "normal",
                textShadow: taglineStyle.textShadow as string | undefined,
                opacity: taglineStyle.opacity as string | undefined,
            };
            
            // Icon styles from design
            const iconStyle = design.styles.icon || {};
            socialLinksStyles = {
                fontSize: parseFontSize(iconStyle.width || iconStyle.height, 20),
                fontFamily: "Inter",
                color: (design.styles.link?.color as string) || "#ffffff",
                fontWeight: "normal",
            };
            
            avatarStyles = {
                fontSize: 48,
                fontFamily: "Inter",
                color: "#ffffff",
                fontWeight: "normal",
            };
        } else {
            // Animated banner - use theme-based defaults from particleSettings or design properties
            const primaryColor = (design as any).particleSettings?.color || "#a855f7";
            const secondaryColor = (design as any).particleSettings?.colorVariant || "#ffffff";
            
            nameStyles = {
                fontSize: 22,
                fontFamily: "Inter",
                color: secondaryColor,
                fontWeight: "bold",
            };
            
            taglineStyles = {
                fontSize: 14,
                fontFamily: "Inter",
                color: `${secondaryColor}cc`, // slightly transparent
                fontWeight: "normal",
            };
            
            avatarStyles = {
                fontSize: 48,
                fontFamily: "Inter",
                color: "#ffffff",
                fontWeight: "normal",
            };
            
            socialLinksStyles = {
                fontSize: 20,
                fontFamily: "Inter",
                color: secondaryColor,
                fontWeight: "normal",
            };
        }

        // Position logic
        const avatarX = 20;
        const nameX = design.showAvatar ? 80 : 20;

        return [
            {
                id: "avatar",
                type: "avatar",
                visible: design.showAvatar,
                position: { x: avatarX, y: 20 },
                style: avatarStyles,
            },
            {
                id: "name",
                type: "name",
                visible: true,
                position: { x: nameX, y: 30 },
                style: nameStyles,
            },
            {
                id: "tagline",
                type: "tagline",
                visible: design.showTagline,
                position: { x: nameX, y: 60 },
                style: taglineStyles,
            },
            {
                id: "socialLinks",
                type: "socialLinks",
                visible: true,
                position: { x: containerSize.width - 150, y: 35 },
                style: socialLinksStyles,
            },
        ];
    }, [design, containerSize.width]);

    const [localElementStates, setLocalElementStates] = useState<BannerElementState[]>(() => {
        return initialElementStates || calculateDefaultStates();
    });

    // Sync from props when they change externally (not from our own updates)
    useEffect(() => {
        if (initialElementStates && !isInternalUpdateRef.current) {
            setLocalElementStates(initialElementStates);
        }
        // Reset the flag after the effect runs
        isInternalUpdateRef.current = false;
    }, [initialElementStates]);

    // Always use local state - this is the source of truth for rendering
    const states = localElementStates;

    // Sync state changes
    const updateState = useCallback(
        (newStates: BannerElementState[]) => {
            // Always update local state immediately for responsive UI
            setLocalElementStates(newStates);

            // Mark as internal update so the useEffect doesn't overwrite with stale props
            isInternalUpdateRef.current = true;

            // Notify parent if callback is provided
            if (onElementStatesChange) {
                onElementStatesChange(newStates);
            }
        },
        [onElementStatesChange]
    );

    const handlePositionChange = useCallback(
        (id: string, position: { x: number; y: number }) => {
            updateState(states.map((el) => (el.id === id ? { ...el, position } : el)));
        },
        [states, updateState]
    );

    const handleStyleChange = useCallback(
        (id: string, style: Partial<BannerElementState["style"]>) => {
            updateState(
                states.map((el) =>
                    el.id === id ? { ...el, style: { ...el.style, ...style } } : el
                )
            );
        },
        [states, updateState]
    );

    const handleVisibilityChange = useCallback(
        (id: string, visible: boolean) => {
            updateState(states.map((el) => (el.id === id ? { ...el, visible } : el)));
        },
        [states, updateState]
    );

    const handleTextDoubleClick = useCallback(
        (id: string) => {
            const state = states.find((s) => s.id === id);
            if (state && (state.type === "name" || state.type === "tagline")) {
                setTextEditingId(id);
                setEditingText(id === "name" ? contentData.name : contentData.tagline || "");
            }
        },
        [states, contentData]
    );

    const handleTextBlur = useCallback(() => {
        if (textEditingId && onContentChange) {
            const field = textEditingId === "name" ? "name" : "tagline";
            onContentChange(field, editingText);
        }
        setTextEditingId(null);
    }, [textEditingId, editingText, onContentChange]);

    // Handle clicking outside to deselect
    const handleContainerClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setSelectedId(null);
            if (textEditingId) handleTextBlur();
        }
    }, [textEditingId, handleTextBlur]);

    return {
        states,
        selectedId,
        setSelectedId,
        textEditingId,
        setTextEditingId,
        editingText,
        setEditingText,
        handlePositionChange,
        handleStyleChange,
        handleVisibilityChange,
        handleTextDoubleClick,
        handleTextBlur,
        handleContainerClick,
        getElementState: (id: string) => states.find((s) => s.id === id),
    };
};

import { useState, useCallback, useEffect, useRef } from "react";
import { BannerElementState, BannerContentData, BannerDesign, isStaticBanner } from "@gaki/core/types/banner";

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

        // Helper to extract numeric font size but keep other properties as-is
        const extractStyles = (sourceStyle: Record<string, any>, defaultFontSize: number): BannerElementState["style"] => {
            const style: BannerElementState["style"] = {
                fontSize: defaultFontSize,
                fontFamily: "Inter",
                color: "#ffffff",
                fontWeight: "normal",
                ...sourceStyle // Spread all original styles first
            };

            // Ensure fontSize is a number
            if (sourceStyle.fontSize) {
                style.fontSize = parseFontSize(sourceStyle.fontSize, defaultFontSize);
            }

            return style;
        };

        if (isStatic && design.styles) {
            // Extract ALL style properties from static banner design
            // We use the helper to ensure fontSize is correct while preserving everything else

            const nameStyle = design.styles.name || {};
            const taglineStyle = design.styles.tagline || {};
            const iconStyle = design.styles.icon || {};
            const linkStyle = design.styles.link || {};

            nameStyles = extractStyles(nameStyle, 22);
            // Ensure fallback defaults if not present in source style
            if (!nameStyle.fontWeight) nameStyles.fontWeight = "bold";

            taglineStyles = extractStyles(taglineStyle, 14);
            if (!taglineStyle.color) taglineStyles.color = "rgba(255,255,255,0.8)";

            socialLinksStyles = extractStyles(iconStyle, 20);
            // Width/height in icon style usually determines "font size" for icons here
            const iconSize = parseFontSize(iconStyle.width || iconStyle.height, 20);
            socialLinksStyles.fontSize = iconSize;

            // Map link color to the icon/text color if specific icon color isn't set
            if (!socialLinksStyles.color && linkStyle.color) {
                socialLinksStyles.color = linkStyle.color as string;
            }

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
        // Calculate vertical center based on container height
        const centerY = containerSize.height / 2;

        let avatarX = 20;
        let avatarY = 20;

        let nameX = 20;
        let nameY = 30;

        let taglineX = 20;
        let taglineY = 60;

        let socialX = containerSize.width - 150;
        let socialY = 35;

        // Default layout for horizontal banners (most common)
        if (design.layout === "horizontal" || !design.layout) {
            // Assume left padding around 24px based on most designs
            const leftPadding = 24;
            const gap = 16;

            if (design.showAvatar) {
                avatarX = leftPadding;
                avatarY = centerY - (48 / 2); // Center 48px avatar
                nameX = avatarX + 48 + gap;
            } else {
                nameX = leftPadding;
            }

            // Center text block vertically
            // Name height ~28px, Tagline ~16px, Gap ~4px -> Total ~48px
            const textBlockHeight = design.showTagline ? 48 : 28;
            nameY = centerY - (textBlockHeight / 2);
            taglineX = nameX;
            taglineY = nameY + 28 + 4; // Below name

            // Social links often right aligned
            socialX = containerSize.width - 160;
            socialY = centerY - (25 / 2); // Center items approx 25px high
        }

        // TODO: specific overrides for 'vertical', 'card', etc. if needed
        // For now, this horizontal logic covers the reported "Neon Glow" case

        return [
            {
                id: "avatar",
                type: "avatar",
                visible: design.showAvatar,
                position: { x: avatarX, y: avatarY },
                style: avatarStyles,
            },
            {
                id: "name",
                type: "name",
                visible: true,
                position: { x: nameX, y: nameY },
                style: nameStyles,
            },
            {
                id: "tagline",
                type: "tagline",
                visible: design.showTagline,
                position: { x: taglineX, y: taglineY },
                style: taglineStyles,
            },
            {
                id: "socialLinks",
                type: "socialLinks",
                visible: true,
                position: { x: socialX, y: socialY },
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

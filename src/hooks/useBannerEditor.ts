import { useState, useCallback, useEffect } from "react";
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

    // Calculate default states based on design type
    const calculateDefaultStates = useCallback((): BannerElementState[] => {
        const isStatic = isStaticBanner(design);
        const commonStyles = {
            avatar: { fontSize: 48, fontFamily: "Inter", color: "#ffffff", fontWeight: "normal" },
            name: { fontSize: 22, fontFamily: "Inter", color: "#ffffff", fontWeight: "bold" },
            tagline: { fontSize: 14, fontFamily: "Inter", color: "rgba(255,255,255,0.8)", fontWeight: "normal" },
            socialLinks: { fontSize: 24, fontFamily: "Inter", color: "#ffffff", fontWeight: "normal" },
        };

        // Override with static styles if available
        if (isStatic) {
            commonStyles.name = {
                fontSize: parseInt((design.styles.name.fontSize as string) || "22"),
                fontFamily: (design.styles.name.fontFamily as string) || "Inter",
                color: (design.styles.name.color as string) || "#ffffff",
                fontWeight: (design.styles.name.fontWeight as string) || "bold",
            };
            if (design.styles.tagline) {
                commonStyles.tagline = {
                    fontSize: parseInt((design.styles.tagline.fontSize as string) || "14"),
                    fontFamily: (design.styles.tagline.fontFamily as string) || "Inter",
                    color: (design.styles.tagline.color as string) || "rgba(255,255,255,0.8)",
                    fontWeight: (design.styles.tagline.fontWeight as string) || "normal",
                };
            }
            // Social links icon size logic could go here
        }

        // Position logic could be improved to be smarter based on layout, but keeping simple defaults for now
        const avatarX = 20;
        const nameX = design.showAvatar ? 80 : 20;

        return [
            {
                id: "avatar",
                type: "avatar",
                visible: design.showAvatar,
                position: { x: avatarX, y: 20 },
                style: commonStyles.avatar,
            },
            {
                id: "name",
                type: "name",
                visible: true,
                position: { x: nameX, y: 30 },
                style: commonStyles.name,
            },
            {
                id: "tagline",
                type: "tagline",
                visible: design.showTagline,
                position: { x: nameX, y: 60 },
                style: commonStyles.tagline,
            },
            {
                id: "socialLinks",
                type: "socialLinks",
                visible: true,
                position: { x: containerSize.width - 150, y: 35 },
                style: commonStyles.socialLinks,
            },
        ];
    }, [design, containerSize.width]);

    const [localElementStates, setLocalElementStates] = useState<BannerElementState[]>(() => {
        return initialElementStates || calculateDefaultStates();
    });

    const states = initialElementStates || localElementStates;

    // Sync state changes
    const updateState = useCallback(
        (newStates: BannerElementState[]) => {
            if (onElementStatesChange) {
                onElementStatesChange(newStates);
            } else {
                setLocalElementStates(newStates);
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

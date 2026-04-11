import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePreviewMode } from "./PreviewModeContext";

interface LayoutControlsPortalProps {
    children: React.ReactNode;
}

/**
 * Portal component that renders children into #layout-controls-slot.
 * Automatically suppresses rendering when in preview mode to avoid
 * showing control buttons in grid layout previews.
 */
export const LayoutControlsPortal: React.FC<LayoutControlsPortalProps> = ({
    children,
}) => {
    const [mounted, setMounted] = useState(false);
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const isPreview = usePreviewMode();

    useEffect(() => {
        setMounted(true);
        const el = document.getElementById("layout-controls-slot");
        if (el) setContainer(el);
    }, []);

    // Don't render anything in preview mode
    if (isPreview) return null;

    if (!mounted || !container) return null;

    return createPortal(children, container);
};

import React from "react";
import { CameraShape } from "@gaki/core/types/caption";
import { ASPECT_RATIOS } from "@/lib/backgrounds";

export const getNumericAspectRatio = (
    shape: CameraShape,
    ratioId: string,
    customRatio: string
): number | boolean => {
    if (shape === "circle") return 1;
    if (ratioId === "custom") {
        const [w, h] = customRatio.split(":").map(Number);
        return w && h ? w / h : false;
    }
    if (ratioId && ratioId !== "auto") {
        const option = ASPECT_RATIOS.find((r) => r.id === ratioId);
        if (option && option.value > 0) return option.value;
    }
    return false;
};

export const getCanvasAspectRatioStyle = (
    aspectRatio: string,
    customAspectRatio: string
): React.CSSProperties => {
    let ratioValue: string | number = "auto";
    if (aspectRatio === "custom") {
        ratioValue = customAspectRatio || "auto";
    } else {
        const option = ASPECT_RATIOS.find((r) => r.id === aspectRatio);
        if (option && option.value > 0) ratioValue = option.value;
    }
    return {
        aspectRatio: String(ratioValue),
        width: "100%",
        height: "100%",
        margin: "auto",
        objectFit: "contain",
    };
};

export const getCameraShapeStyle = (
    cameraShape: CameraShape,
    pipBorder?: { color: string; width: number },
    pipShadow?: { blur: number; color: string }
): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
        overflow: "hidden",
        transition: "all 0.3s ease",
    };
    if (pipBorder && pipBorder.width > 0)
        baseStyle.border = `${pipBorder.width}px solid ${pipBorder.color}`;
    if (pipShadow && pipShadow.blur > 0)
        baseStyle.boxShadow = `0 0 ${pipShadow.blur}px ${pipShadow.color}`;
    if (cameraShape === "circle") return { ...baseStyle, borderRadius: "50%" };
    if (cameraShape === "rounded") return { ...baseStyle, borderRadius: "16px" };
    return { ...baseStyle, borderRadius: "0" };
};

export const getVideoFilterStyle = (
    videoFilter: string,
    isBeautifyEnabled: boolean,
    isLowLightEnabled: boolean
): string => {
    const filters: string[] = [];
    if (videoFilter && videoFilter !== "none") filters.push(videoFilter);
    if (isBeautifyEnabled)
        filters.push("blur(0.5px) saturate(1.1) brightness(1.05)");
    if (isLowLightEnabled) filters.push("brightness(1.3) contrast(1.15)");
    return filters.length > 0 ? filters.join(" ") : "none";
};

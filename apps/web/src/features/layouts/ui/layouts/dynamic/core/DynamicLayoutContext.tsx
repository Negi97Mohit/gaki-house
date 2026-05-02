import React, { createContext, useContext, ReactNode } from "react";
import { CanvasLayoutState } from "@gaki/core/types/caption";
import { useLayoutEditor } from "@/features/layouts/hooks/useLayoutEditor";

interface DynamicLayoutContextProps {
    // Original props pass-through
    layout: CanvasLayoutState;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
    sections: any[];

    // Helpers from useLayoutEditor
    editor: ReturnType<typeof useLayoutEditor>;

    // Global Settings
    colors: {
        backgroundColor: string;
        textColor: string;
    };

    // UI State
    controlsVisible: boolean;
}

const DynamicLayoutContext = createContext<DynamicLayoutContextProps | undefined>(undefined);

export const useDynamicLayout = () => {
    const context = useContext(DynamicLayoutContext);
    if (!context) {
        throw new Error("useDynamicLayout must be used within a DynamicLayoutWrapper");
    }
    return context;
};

export const DynamicLayoutProvider = ({ children, value }: { children: ReactNode, value: DynamicLayoutContextProps }) => {
    return (
        <DynamicLayoutContext.Provider value={value}>
            {children}
        </DynamicLayoutContext.Provider>
    );
};

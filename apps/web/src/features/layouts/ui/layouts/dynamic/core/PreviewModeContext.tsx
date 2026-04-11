import React, { createContext, useContext, ReactNode } from "react";

const PreviewModeContext = createContext<boolean>(false);

export const usePreviewMode = () => {
    return useContext(PreviewModeContext);
};

export const PreviewModeProvider: React.FC<{
    isPreview: boolean;
    children: ReactNode;
}> = ({ isPreview, children }) => {
    return (
        <PreviewModeContext.Provider value={isPreview}>
            {children}
        </PreviewModeContext.Provider>
    );
};

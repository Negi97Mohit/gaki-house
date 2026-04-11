import React from "react";
import { HtmlOverlayRenderer } from "./HtmlOverlayRenderer";
import { FileRenderer } from "@/features/canvas/ui/DraggableFileViewer";
import { CaptionRenderer } from "@/features/canvas/ui/CaptionRenderer";
import { GeneratedLayout } from "@caption-cam/core/types/caption";

interface DynamicContentRendererProps {
  target: {
    id: string;
    type: string;
    content: any;
    layout: GeneratedLayout;
  };
  theme: string | undefined;
  fullTranscript: string;
  interimTranscript: string;
  sidebarProps: any; // Keeping 'any' here for simplicity matching original usage, but strictly typing it would be better long-term
}

export const DynamicContentRenderer: React.FC<DynamicContentRendererProps> = ({
  target,
  theme,
  fullTranscript,
  interimTranscript,
  sidebarProps,
}) => {
  switch (target.type) {
    case "html":
      return (
        <HtmlOverlayRenderer
          htmlContent={target.content.htmlContent}
          theme={theme}
        />
      );
    case "file":
      return <FileRenderer overlay={target.content} />;
    case "browser":
      return (
        <iframe
          src={target.content.url}
          className="w-full h-full border-none"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
          title={`dynamic-browser-${target.id}`}
        />
      );
    case "caption":
      const captionText = (fullTranscript + " " + interimTranscript).trim();
      if (!captionText)
        return (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <p>No speech detected.</p>
          </div>
        );
      return (
        <CaptionRenderer
          activeStyleId={sidebarProps.dynamicStyle}
          captionStyle={sidebarProps.style}
          text={captionText}
          fullTranscript={fullTranscript}
          interimTranscript={interimTranscript}
          baseStyle={{
            fontFamily: sidebarProps.style.fontFamily,
            fontSize: `${sidebarProps.style.fontSize}px`,
            color: sidebarProps.style.color,
            textShadow: sidebarProps.style.shadow
              ? "2px 2px 4px rgba(0,0,0,0.5)"
              : "none",
            backgroundColor: sidebarProps.style.backgroundColor,
            border: sidebarProps.style.border
              ? `${sidebarProps.style.borderWidth}px solid ${sidebarProps.style.borderColor}`
              : "none",
            fontWeight: sidebarProps.style.bold ? "bold" : "normal",
            fontStyle: sidebarProps.style.italic ? "italic" : "normal",
            textDecoration: sidebarProps.style.underline ? "underline" : "none",
          }}
        />
      );
    case "text":
      // Basic text renderer for dynamic layout if needed
      return (
        <div
          className="w-full h-full flex items-center justify-center p-4 text-center"
          style={{
            fontFamily: target.content.style.fontFamily,
            fontSize: target.content.style.fontSize,
            color: target.content.style.color,
          }}
        >
          {target.content.content}
        </div>
      );
    default:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <p>Unsupported content type</p>
        </div>
      );
  }
};

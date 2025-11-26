import React from "react";

export const HtmlOverlayRenderer: React.FC<{
  htmlContent: string;
  theme: string | undefined;
}> = ({ htmlContent, theme }) => {
  const colorScheme = theme === "dark" ? "dark" : "light";
  const transparentStyle = `
    <style>
      html {
        color-scheme: ${colorScheme};
      }
      html, body {
        background: transparent !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    </style>
  `;
  const finalHtml = htmlContent.replace(
    "</head>",
    `${transparentStyle}</head>`
  );

  return (
    <iframe
      srcDoc={finalHtml}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        pointerEvents: "none",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
      sandbox="allow-scripts allow-same-origin"
      title="ai-generated-overlay"
    />
  );
};

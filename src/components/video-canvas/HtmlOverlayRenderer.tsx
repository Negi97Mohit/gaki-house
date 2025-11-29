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
        background-color: transparent !important;
        background: transparent !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        width: 100% !important;
        height: 100% !important;
      }
      /* Ensure images fit perfectly */
      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    </style>
  `;
  let finalHtml = htmlContent;
  if (htmlContent.includes("</head>")) {
    finalHtml = htmlContent.replace("</head>", `${transparentStyle}</head>`);
  } else {
    finalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          ${transparentStyle}
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
  }

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

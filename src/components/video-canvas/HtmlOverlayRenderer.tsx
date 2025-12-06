import React from "react";

export const HtmlOverlayRenderer: React.FC<{
  htmlContent: string;
  theme: string | undefined;
}> = ({ htmlContent, theme }) => {
  // Google Fonts used by banner designs
  const googleFontsLink = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Cinzel:wght@400;600&family=Cinzel+Decorative&family=Comfortaa:wght@400;700&family=Cormorant+Garamond:wght@400;600&family=Exo+2:wght@700;800&family=Inter:wght@400;600;700&family=Monoton&family=Montserrat:wght@400;600;700&family=Nunito:wght@400;600&family=Orbitron:wght@400;700&family=Oswald:wght@400;700;800&family=Permanent+Marker&family=Playfair+Display:wght@300;400;600&family=Press+Start+2P&family=Raleway:wght@400;500;600&family=Roboto:wght@400;500;700&family=Sacramento&family=Space+Grotesk:wght@400;600;700&family=Teko:wght@400;700;800&family=VT323&display=swap" rel="stylesheet">
  `;

  // Force dark color-scheme to avoid white backgrounds in iframes
  const transparentStyle = `
    ${googleFontsLink}
    <style>
      html {
        color-scheme: dark;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
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
      /* Remove any potential backgrounds */
      * {
        background-color: inherit;
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

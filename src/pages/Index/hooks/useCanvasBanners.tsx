import { useState, useCallback, useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import { toast } from "sonner";
import { generateId } from "@/lib/id";
import { zIndex } from "@/lib/zIndex";
import { getPlatformIcon } from "@/components/SocialBannerRenderer";
import { SceneState, GeneratedOverlay } from "@/types/caption";
import {
  SocialBannerDesign,
  SocialBannerData,
  DEFAULT_BANNER_DATA,
  SocialPlatform,
} from "@/types/socialBanner";
import { AnimatedBannerDesign } from "@/types/animatedBanner";
import socialBannersData from "@/data/socialBanners.json";

// --- Helpers ---

const styleToString = (style: React.CSSProperties): string => {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join("; ");
};

const getPlatformSvg = (platform: SocialPlatform): string => {
  const svgs: Record<SocialPlatform, string> = {
    github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>`,
    twitch: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
    kick: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.333 0v24h5.334v-8.889L12.89 24h7.777l-7.556-10.667L20 0h-8l-5.333 8.444V0z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
    website: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  };
  return svgs[platform] || svgs.website;
};

const generateBannerHtml = (
  design: SocialBannerDesign,
  data: SocialBannerData
) => {
  // CSS keyframes for banner animations
  const bannerKeyframes = `
    <style>
      @keyframes banner-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      @keyframes banner-pulse-glow { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
      @keyframes banner-neon-flicker { 0%, 100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: 0.8; } 94% { opacity: 1; } 96% { opacity: 0.9; } 97% { opacity: 1; } }
      @keyframes banner-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      @keyframes banner-holographic { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
      @keyframes banner-gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      @keyframes banner-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
      @keyframes banner-rgb-cycle { 0% { border-color: #ff0000; box-shadow: 0 0 20px #ff0000; } 16% { border-color: #ff8800; box-shadow: 0 0 20px #ff8800; } 33% { border-color: #ffff00; box-shadow: 0 0 20px #ffff00; } 50% { border-color: #00ff00; box-shadow: 0 0 20px #00ff00; } 66% { border-color: #0088ff; box-shadow: 0 0 20px #0088ff; } 83% { border-color: #8800ff; box-shadow: 0 0 20px #8800ff; } 100% { border-color: #ff0000; box-shadow: 0 0 20px #ff0000; } }
      @keyframes banner-glitch { 0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } 100% { transform: translate(0); } }
    </style>
  `;

  const links = data.links
    .slice(0, design.maxLinks)
    .map((link) => {
      const IconComponent = getPlatformIcon(link.platform);
      // We render the icon to string to embed it in the HTML overlay
      const iconSvg = ReactDOMServer.renderToString(
        <IconComponent
          className="transition-transform hover:scale-110"
          style={design.styles.icon}
        />
      );
      return `
        <span style="${styleToString(
          design.styles.link
        )}; display: flex; align-items: center; gap: 6px; cursor: default;">
          <span style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${iconSvg}</span>
          <span style="font-size: 12px; white-space: nowrap; opacity: 0.9;">${
            link.url || link.platform
          }</span>
        </span>
      `;
    })
    .join("");

  const avatarHtml = design.showAvatar
    ? `<div style="width: 48px; height: 48px; border-radius: 50%; background: ${
        data.avatarUrl
          ? `url(${data.avatarUrl}) center/cover`
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center;">
        ${
          !data.avatarUrl
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
            : ""
        }
      </div>`
    : "";

  const taglineHtml =
    design.showTagline && data.tagline
      ? `<span class="banner-text-editable" data-banner-field="tagline" style="${styleToString(
          design.styles.tagline || {}
        )}">${data.tagline}</span>`
      : "";

  return `
    ${bannerKeyframes}
    <div style="${styleToString(
      design.styles.container
    )}; width: 100%; height: 100%; box-sizing: border-box;">
      ${avatarHtml}
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span class="banner-text-editable" data-banner-field="name" style="${styleToString(
          design.styles.name
        )}">${data.name}</span>
        ${taglineHtml}
      </div>
      <div style="${styleToString(design.styles.linksContainer)}">
        ${links}
      </div>
    </div>
  `;
};

// --- Hook ---

interface UseCanvasBannersProps {
  activeScene: SceneState;
  updateActiveScene: (updater: (scene: SceneState) => SceneState) => void;
  selection: {
    selectedGeneratedId: string | null;
    handleDeselectAll: () => void;
    setSelectedGeneratedId: (id: string | null) => void;
  };
}

export const useCanvasBanners = ({
  activeScene,
  updateActiveScene,
  selection,
}: UseCanvasBannersProps) => {
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false);
  const [editingBannerText, setEditingBannerText] = useState<{
    overlayId: string;
    field: "name" | "tagline";
    currentText: string;
    style: React.CSSProperties;
  } | null>(null);

  const [bannerUserData, setBannerUserData] = useState<SocialBannerData>(() => {
    const saved = localStorage.getItem("social-banner-user-data");
    return saved ? JSON.parse(saved) : DEFAULT_BANNER_DATA;
  });

  // Clear editing state if selection changes
  useEffect(() => {
    if (
      editingBannerText &&
      selection.selectedGeneratedId !== editingBannerText.overlayId
    ) {
      setEditingBannerText(null);
    }
  }, [selection.selectedGeneratedId, editingBannerText]);

  const handleBannerTextClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      // 1. Find the overlay to ensure it exists
      const overlay = activeScene.activeOverlays.find((o) => o.id === id);
      if (!overlay) {
        setIsBannerEditorOpen(true);
        setEditingBannerId(id);
        return;
      }

      // 2. Perform Hit Test on Iframe Content
      try {
        const targetNode = e.target as HTMLElement;
        const wrapper = targetNode.closest(".group");
        const iframe = wrapper?.querySelector("iframe");

        if (iframe && iframe.contentDocument) {
          const rect = iframe.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const innerTarget = iframe.contentDocument.elementFromPoint(x, y);

          if (innerTarget) {
            // Check for data-banner-field
            const fieldElement = innerTarget.closest("[data-banner-field]");
            if (fieldElement) {
              const field = fieldElement.getAttribute("data-banner-field") as
                | "name"
                | "tagline";
              const currentText = fieldElement.textContent || "";

              // Extract computed style
              const style =
                iframe.contentWindow?.getComputedStyle(fieldElement);
              const relevantStyle: React.CSSProperties = {
                fontFamily: style?.fontFamily,
                fontSize: style?.fontSize,
                fontWeight: style?.fontWeight as any,
                fontStyle: style?.fontStyle,
                textDecoration: style?.textDecoration,
                color: style?.color,
                textShadow: style?.textShadow,
                textAlign: style?.textAlign as any,
              };

              setEditingBannerText({
                overlayId: id,
                field,
                currentText,
                style: relevantStyle,
              });
              return; // Inline edit activated
            }
          }
        }
      } catch (err) {
        console.error("Banner hit test failed:", err);
      }

      // Fallback: Open Modal
      setEditingBannerId(id);
      setIsBannerEditorOpen(true);
    },
    [activeScene.activeOverlays]
  );

  const handleBannerTextStyleChange = useCallback(
    (newStyle: React.CSSProperties) => {
      if (!editingBannerText) return;

      const { overlayId, field } = editingBannerText;
      const overlay = activeScene.activeOverlays.find(
        (o) => o.id === overlayId
      );
      if (!overlay || !overlay.metadata?.design || !overlay.metadata?.data)
        return;

      const design = overlay.metadata.design as SocialBannerDesign;
      const data = overlay.metadata.data as SocialBannerData;

      // Update the specific style field in the design
      const updatedDesign = {
        ...design,
        styles: {
          ...design.styles,
          [field]: {
            ...design.styles[field],
            ...newStyle,
          },
        },
      };

      const newHtmlContent = generateBannerHtml(updatedDesign, data);

      updateActiveScene((scene) => ({
        ...scene,
        activeOverlays: scene.activeOverlays.map((o) =>
          o.id === overlayId
            ? {
                ...o,
                htmlContent: newHtmlContent,
                metadata: { ...o.metadata, design: updatedDesign },
              }
            : o
        ),
      }));

      // Update local state to reflect style change in toolbar
      setEditingBannerText((prev) =>
        prev
          ? {
              ...prev,
              style: { ...prev.style, ...newStyle },
            }
          : null
      );
    },
    [activeScene.activeOverlays, editingBannerText, updateActiveScene]
  );

  const handleSaveBanner = useCallback(
    (data: SocialBannerData) => {
      setBannerUserData(data);
      if (editingBannerId) {
        const overlay = activeScene.activeOverlays.find(
          (o) => o.id === editingBannerId
        );
        if (overlay) {
          // Find which design this banner uses (extract from name or metadata)
          // Fallback to name extraction if metadata isn't perfect, or use metadata design
          const design =
            overlay.metadata?.design || socialBannersData.designs[0];

          const newHtmlContent = generateBannerHtml(
            design as SocialBannerDesign,
            data
          );

          updateActiveScene((scene) => ({
            ...scene,
            activeOverlays: scene.activeOverlays.map((o) =>
              o.id === editingBannerId
                ? {
                    ...o,
                    htmlContent: newHtmlContent,
                    metadata: {
                      ...o.metadata,
                      data: data,
                    },
                  }
                : o
            ),
          }));
          toast.success("Banner updated!");
        }
      }
      setIsBannerEditorOpen(false);
      setEditingBannerId(null);
    },
    [editingBannerId, activeScene.activeOverlays, updateActiveScene]
  );

  const handleAddSocialBanner = useCallback(
    (
      design: SocialBannerDesign & {
        isAnimatedBanner?: boolean;
        animatedBannerId?: string;
      },
      data: SocialBannerData
    ) => {
      const isAnimated = design.isAnimatedBanner === true;
      const htmlContent = ""; // Empty for animated/interactive types that use metadata

      const newOverlay: GeneratedOverlay = {
        id: generateId("banner"),
        name: `${design.name} Banner`,
        htmlContent,
        layout: {
          position: { x: 25, y: 42 },
          size: { width: 50, height: 16 },
          zIndex: zIndex.draggableElement,
          rotation: 0,
          layerOrder: "above-video",
        },
        preview: design.preview,
        metadata: {
          type: isAnimated ? "animated-banner" : "social-banner-interactive",
          animatedBannerId: isAnimated ? design.animatedBannerId : undefined,
          design,
          data,
        },
      };

      updateActiveScene((scene) => ({
        ...scene,
        activeOverlays: [...scene.activeOverlays, newOverlay],
      }));
      selection.handleDeselectAll();
      selection.setSelectedGeneratedId(newOverlay.id);
      toast.success(`Added "${design.name}" banner to canvas`);
    },
    [updateActiveScene, selection]
  );

  const handleAddAnimatedBanner = useCallback(
    (design: AnimatedBannerDesign, data: SocialBannerData) => {
      const newOverlay: GeneratedOverlay = {
        id: generateId("banner"),
        name: `${design.name} Banner`,
        htmlContent: "",
        layout: {
          position: { x: 25, y: 42 },
          size: { width: 50, height: 16 },
          zIndex: zIndex.draggableElement,
          rotation: 0,
          layerOrder: "above-video",
        },
        preview: design.preview,
        metadata: {
          type: "animated-banner",
          design,
          data,
        },
      };

      updateActiveScene((scene) => ({
        ...scene,
        activeOverlays: [...scene.activeOverlays, newOverlay],
      }));
      selection.handleDeselectAll();
      selection.setSelectedGeneratedId(newOverlay.id);
      toast.success(`Added "${design.name}" animated banner to canvas`);
    },
    [updateActiveScene, selection]
  );

  return {
    editingBannerId,
    editingBannerText,
    isBannerEditorOpen,
    setIsBannerEditorOpen,
    bannerUserData,
    handleBannerTextClick,
    handleBannerTextStyleChange,
    handleSaveBanner,
    handleAddSocialBanner,
    handleAddAnimatedBanner,
    onBannerTextClose: () => setEditingBannerText(null),
  };
};

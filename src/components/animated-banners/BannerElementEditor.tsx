// src/components/animated-banners/BannerElementEditor.tsx
import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Move, Type, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BannerElement {
  id: string;
  type: "avatar" | "text" | "tagline" | "social-link";
  position: { x: number; y: number };
  size?: { width: number; height: number };
  content: string;
  style?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
  };
  platform?: string; // for social links
  visible: boolean;
}

interface BannerElementEditorProps {
  element: BannerElement;
  isSelected: boolean;
  containerSize: { width: number; height: number };
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<BannerElement>) => void;
  onRemove: (id: string) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export const BannerElementEditor: React.FC<BannerElementEditorProps> = ({
  element,
  isSelected,
  containerSize,
  onSelect,
  onUpdate,
  onRemove,
  primaryColor = "#667eea",
  secondaryColor = "#764ba2",
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Handle drag with bounds
  const handleDragEnd = useCallback(
    (event: any, info: any) => {
      const newX = Math.max(0, Math.min(element.position.x + info.offset.x, containerSize.width - 50));
      const newY = Math.max(0, Math.min(element.position.y + info.offset.y, containerSize.height - 30));
      onUpdate(element.id, { position: { x: newX, y: newY } });
      setIsDragging(false);
    },
    [element.id, element.position, containerSize, onUpdate]
  );

  // Handle text content change
  const handleTextChange = useCallback(
    (newContent: string) => {
      onUpdate(element.id, { content: newContent });
      setIsEditing(false);
    },
    [element.id, onUpdate]
  );

  const getTypeIcon = () => {
    switch (element.type) {
      case "avatar":
        return <ImageIcon className="w-3 h-3" />;
      case "social-link":
        return <LinkIcon className="w-3 h-3" />;
      default:
        return <Type className="w-3 h-3" />;
    }
  };

  // Social icon paths
  const getSocialIcon = (platform: string) => {
    const icons: Record<string, string> = {
      twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
      youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
      twitch: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z",
      discord: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z",
      instagram: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
    };
    return icons[platform.toLowerCase()] || icons.twitter;
  };

  if (!element.visible) return null;

  const renderContent = () => {
    switch (element.type) {
      case "avatar":
        return (
          <motion.div
            className="w-full h-full rounded-full overflow-hidden border-2 border-white/30"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              boxShadow: `0 0 20px ${primaryColor}40`,
            }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {element.content ? (
              <img src={element.content} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-1/2 h-1/2 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </motion.div>
        );

      case "text":
        return isEditing ? (
          <input
            autoFocus
            defaultValue={element.content}
            onBlur={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextChange((e.target as HTMLInputElement).value)}
            className="w-full bg-transparent text-white font-bold outline-none border-b-2 border-white/50"
            style={{
              fontSize: element.style?.fontSize || 18,
              textShadow: `0 0 10px ${primaryColor}80`,
            }}
          />
        ) : (
          <motion.span
            className="text-white font-bold whitespace-nowrap cursor-text"
            style={{
              fontSize: element.style?.fontSize || 18,
              textShadow: `0 0 10px ${primaryColor}80`,
            }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {element.content || "Your Name"}
          </motion.span>
        );

      case "tagline":
        return isEditing ? (
          <input
            autoFocus
            defaultValue={element.content}
            onBlur={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextChange((e.target as HTMLInputElement).value)}
            className="w-full bg-transparent text-white/80 outline-none border-b-2 border-white/30"
            style={{
              fontSize: element.style?.fontSize || 14,
            }}
          />
        ) : (
          <motion.span
            className="text-white/80 whitespace-nowrap cursor-text"
            style={{ fontSize: element.style?.fontSize || 14 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {element.content || "Creator • Streamer"}
          </motion.span>
        );

      case "social-link":
        return (
          <motion.div
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
            animate={{
              boxShadow: [
                `0 0 10px ${primaryColor}40`,
                `0 0 20px ${primaryColor}60`,
                `0 0 10px ${primaryColor}40`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d={getSocialIcon(element.platform || "twitter")} />
            </svg>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const getDefaultSize = () => {
    switch (element.type) {
      case "avatar":
        return { width: 48, height: 48 };
      case "social-link":
        return { width: 32, height: 32 };
      default:
        return { width: "auto", height: "auto" };
    }
  };

  const size = element.size || getDefaultSize();

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        "absolute cursor-move select-none",
        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-transparent",
        isDragging && "z-50"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: typeof size.width === "number" ? size.width : "auto",
        height: typeof size.height === "number" ? size.height : "auto",
      }}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      {renderContent()}

      {/* Element controls when selected */}
      {isSelected && !isDragging && (
        <>
          {/* Type indicator */}
          <div className="absolute -top-6 left-0 flex items-center gap-1 bg-primary/90 text-white text-xs px-2 py-0.5 rounded shadow">
            {getTypeIcon()}
            <span className="capitalize">{element.type.replace("-", " ")}</span>
          </div>

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(element.id);
            }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-50"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Drag indicator */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-muted/90 text-muted-foreground text-xs px-2 py-0.5 rounded shadow">
            <Move className="w-3 h-3" />
            <span>Drag to move</span>
          </div>
        </>
      )}
    </motion.div>
  );
};

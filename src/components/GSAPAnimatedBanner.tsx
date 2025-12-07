// src/components/GSAPAnimatedBanner.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import {
  GSAPAnimationConfig,
  GSAPPreset,
  executeGSAPAnimation,
  splitTextToChars,
} from "@/lib/gsapAnimations";
import { cn } from "@/lib/utils";
import { ParticleEffectOverlay } from "./ParticleEffectOverlay";
import { EffectType } from "@/lib/particleEffects";

interface GSAPAnimatedBannerProps {
  preset: GSAPPreset;
  text: string;
  subtext?: string;
  className?: string;
  style?: React.CSSProperties;
  playing?: boolean;
  onComplete?: () => void;
  customConfig?: Partial<GSAPAnimationConfig>;
  // Styling overrides
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
}

export const GSAPAnimatedBanner: React.FC<GSAPAnimatedBannerProps> = ({
  preset,
  text,
  subtext,
  className,
  style,
  playing = true,
  onComplete,
  customConfig,
  fontFamily = "Inter",
  fontSize = 48,
  color = "#FFFFFF",
  backgroundColor = "transparent",
  textAlign = "center",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [key, setKey] = useState(0);

  // Dynamic font loading
  useEffect(() => {
    if (!fontFamily) return;

    const standardFonts = ["Arial", "Verdana", "Helvetica", "Times New Roman", "Courier New"];
    if (!standardFonts.includes(fontFamily)) {
      const linkId = `font-link-${fontFamily.replace(/\s+/g, "-")}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@300;400;700;900&display=swap`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    }
  }, [fontFamily]);

  // Run animation
  useEffect(() => {
    if (!playing || !mainTextRef.current) return;

    // Kill any existing animation
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const config: GSAPAnimationConfig = {
      ...preset.config,
      ...customConfig,
    };

    // Create master timeline
    const masterTl = gsap.timeline({
      onComplete: () => {
        onComplete?.();

        // Handle looping
        if (config.loop) {
          setTimeout(() => {
            setKey((k) => k + 1);
          }, (config.loopDelay || 2) * 1000);
        }
      },
    });

    // Animate main text
    const mainTl = executeGSAPAnimation(mainTextRef.current, config);
    masterTl.add(mainTl);

    // Animate subtext with delay
    if (subTextRef.current && subtext) {
      const subConfig = { ...config, delay: 0.3 };
      const subTl = executeGSAPAnimation(subTextRef.current, subConfig);
      masterTl.add(subTl, "-=0.5");
    }

    timelineRef.current = masterTl;

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [key, playing, preset, customConfig, subtext, onComplete]);

  // Reset animation when playing changes
  useEffect(() => {
    if (playing) {
      setKey((k) => k + 1);
    }
  }, [playing]);

  // Check if this animation needs split text
  const needsSplitText = [
    "cinematic-reveal",
    "stagger-wave",
    "typewriter",
    "scramble",
    "magnetic-pull",
    "shatter",
  ].includes(preset.config.type);

  return (
    <div
      ref={containerRef}
      key={key}
      className={cn("relative overflow-hidden", className)}
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        color,
        backgroundColor,
        textAlign,
        perspective: "1000px",
        ...style,
      }}
    >
      {/* Main Text */}
      <div
        ref={mainTextRef}
        className="font-bold leading-tight"
        style={{
          transformStyle: "preserve-3d",
        }}
        dangerouslySetInnerHTML={{
          __html: needsSplitText ? splitTextToChars(text) : text,
        }}
      />

      {/* Subtext */}
      {subtext && (
        <div
          ref={subTextRef}
          className="mt-2 opacity-80"
          style={{
            fontSize: `${fontSize * 0.5}px`,
            transformStyle: "preserve-3d",
          }}
          dangerouslySetInnerHTML={{
            __html: needsSplitText ? splitTextToChars(subtext) : subtext,
          }}
        />
      )}
    </div>
  );
};

// =====================================================
// PRESET PREVIEW COMPONENT
// =====================================================

interface GSAPPresetPreviewProps {
  preset: GSAPPreset;
  onClick?: () => void;
  onEdit?: (preset: GSAPPreset) => void;
  onDuplicate?: (preset: GSAPPreset) => void;
  isSelected?: boolean;
}

export const GSAPPresetPreview: React.FC<GSAPPresetPreviewProps> = ({
  preset,
  onClick,
  onEdit,
  onDuplicate,
  isSelected,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setPlayKey((k) => k + 1);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "reveal":
        return "from-blue-500/20 to-cyan-500/20";
      case "kinetic":
        return "from-orange-500/20 to-red-500/20";
      case "glitch":
        return "from-purple-500/20 to-pink-500/20";
      case "stylized":
        return "from-green-500/20 to-emerald-500/20";
      case "3d":
        return "from-indigo-500/20 to-violet-500/20";
      case "text":
        return "from-amber-500/20 to-yellow-500/20";
      case "effects":
        return "from-rose-500/20 to-orange-500/20";
      default:
        return "from-gray-500/20 to-slate-500/20";
    }
  };

  const hasParticleEffect = !!preset.particleEffect;

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300",
        "border-2",
        isSelected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border/50 hover:border-border",
        `bg-gradient-to-br ${getCategoryColor(preset.category)}`
      )}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Action buttons - show on hover */}
      {(onEdit || onDuplicate) && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(preset);
              }}
              className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(preset);
              }}
              className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors"
              title="Duplicate"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Preview Area */}
      <div className="h-24 flex items-center justify-center p-4 bg-black/40 relative overflow-hidden">
        {hasParticleEffect && isHovered && (
          <ParticleEffectOverlay 
            effectType={preset.particleEffect as EffectType}
            playing={isHovered}
          />
        )}
        <GSAPAnimatedBanner
          key={playKey}
          preset={preset}
          text={preset.name}
          playing={isHovered}
          fontSize={20}
          color="#FFFFFF"
          fontFamily="Inter"
        />
      </div>

      {/* Info */}
      <div className="p-3 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{preset.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
            {preset.category}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {preset.description}
        </p>
      </div>
    </div>
  );
};

export default GSAPAnimatedBanner;

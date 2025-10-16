// src/lib/dynamicCaptionStyles.tsx
import React, { useMemo } from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

// Helper to split text into stable word list
function useWords(fullTranscript: string, interimTranscript: string) {
  return useMemo(() => {
    const all = (fullTranscript + " " + interimTranscript).trim().split(/\s+/);
    return all.filter(Boolean);
  }, [fullTranscript, interimTranscript]);
}

// --- BASE STATIC STYLE ---
const StaticComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <span>{text}</span>
);

// --- KARAOKE STYLE ---
const KaraokeComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const fullWords = fullTranscript.trim().split(/\s+/);
  const interimWords = interimTranscript.trim().split(/\s+/);
  const words = [...fullWords, ...interimWords].filter(Boolean);

  return (
    <div style={{ display: "inline-block" }}>
      {words.map((word, i) => {
        const isSpoken = i < fullWords.length;
        return (
          <span
            key={`${word}-${i}`}
            style={{
              position: "relative",
              display: "inline-block",
              marginRight: "6px",
              fontWeight: 600,
              color: isSpoken ? "#fff" : "rgba(255,255,255,0.4)",
              transition: "color 0.3s ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                zIndex: -1,
                background: isSpoken
                  ? "linear-gradient(90deg, #ff007f, #ffcc00)"
                  : "transparent",
                borderRadius: "4px",
                transition: "background 0.3s ease",
              }}
            />
            {word}
          </span>
        );
      })}
    </div>
  );
};

// --- POP UP STYLE ---
const PopUpComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="animate-pop-up"
          style={{
            display: "inline-block",
            marginRight: "6px",
            animationDelay: `${i * 120}ms`,
            animationFillMode: "forwards",
          }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes pop-up {
          0% { opacity: 0; transform: translateY(25px) scale(0.85); }
          40% { opacity: 1; transform: translateY(-5px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-pop-up {
          opacity: 0;
          animation: pop-up 0.6s cubic-bezier(0.22,1,0.36,1);
        }
      `}</style>
    </div>
  );
};

// --- RAINBOW WAVE STYLE ---
const RainbowWaveComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="animate-rainbow"
          style={{
            animationDelay: `${i * 100}ms`,
            display: "inline-block",
            marginRight: "8px",
          }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes rainbow {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-rainbow {
          background: linear-gradient(90deg, #ff2a2a, #ffa52a, #2aff47, #2a89ff, #a22aff);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: rainbow 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// --- TYPEWRITER GLOW STYLE ---
const TypewriterGlowComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <div
    className="typewriter-glow"
    style={{
      animation: `typing 2.5s steps(${text.length}), blink 0.7s step-end infinite alternate`,
    }}
  >
    {text}
    <style>{`
      .typewriter-glow {
        color: #fff;
        text-shadow: 0 0 8px #00f0ff;
        overflow: hidden;
        border-right: 3px solid #00f0ff;
        white-space: nowrap;
        width: 0;
        display: inline-block;
      }
      @keyframes typing { from { width: 0; } to { width: 100%; } }
      @keyframes blink { 50% { border-color: transparent; } }
    `}</style>
  </div>
);

// --- NEON POP STYLE ---
const NeonPopComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <span className="neon-pop">{text}
    <style>{`
      @keyframes neon {
        0%, 100% { text-shadow: 0 0 4px #ff00ff, 0 0 10px #ff00ff; }
        50% { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff; }
      }
      .neon-pop { color: #fff; animation: neon 1.5s ease-in-out infinite alternate; }
    `}</style>
  </span>
);

// --- SHIMMER SLIDE STYLE ---
const ShimmerSlideComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <span className="shimmer-slide">{text}
    <style>{`
      @keyframes shimmer { to { background-position: 200% center; } }
      .shimmer-slide {
        background: linear-gradient(120deg, #999 0%, #fff 50%, #999 100%);
        background-size: 200% auto;
        color: transparent;
        -webkit-background-clip: text;
        animation: shimmer 1.5s linear infinite;
      }
    `}</style>
  </span>
);

// --- PULSE GLOW BEAT STYLE ---
const PulseGlowBeatComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <span className="pulse-glow-beat">{text}
    <style>{`
      @keyframes pulse {
        0%, 100% { transform: scale(1); text-shadow: 0 0 8px #ff00aa; }
        50% { transform: scale(1.1); text-shadow: 0 0 20px #ff66cc; }
      }
      .pulse-glow-beat {
        color: #fff;
        display: inline-block;
        animation: pulse 1s ease-in-out infinite;
      }
    `}</style>
  </span>
);

// --- EXPORT ALL STYLES ---
export const DYNAMIC_STYLES: Record<string, CaptionStyleDef> = {
  "none": { id: "none", name: "None (Static)", component: StaticComponent },
  "karaoke": { id: "karaoke", name: "Karaoke", component: KaraokeComponent },
  "pop-up": { id: "pop-up", name: "Pop Up (Smooth)", component: PopUpComponent },
  "rainbow": { id: "rainbow", name: "Rainbow Wave", component: RainbowWaveComponent },
  "typewriter-glow": { id: "typewriter-glow", name: "Typewriter Glow", component: TypewriterGlowComponent },
  "neon-pop": { id: "neon-pop", name: "Neon Pop", component: NeonPopComponent },
  "shimmer-slide": { id: "shimmer-slide", name: "Shimmer Slide", component: ShimmerSlideComponent },
  "pulse-glow-beat": { id: "pulse-glow-beat", name: "Pulse Glow Beat", component: PulseGlowBeatComponent },

};

export const DYNAMIC_STYLE_OPTIONS = Object.values(DYNAMIC_STYLES).map(({ id, name }) => ({ id, name }));

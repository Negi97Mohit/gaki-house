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
const StaticComponent: React.FC<DynamicStyleProps> = ({ text, baseStyle }) => (
  <span style={baseStyle}>{text}</span>
);

// --- KARAOKE STYLE ---
const KaraokeComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
  baseStyle, // <-- Accept baseStyle
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
              // fontWeight: 600, // REMOVED: Should be inherited from baseStyle
              color: "currentColor", // MODIFIED: Inherit color
              opacity: isSpoken ? 1 : 0.4, // MODIFIED: Use opacity for unspoken words
              transition: "color 0.3s ease, opacity 0.3s ease",
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

// --- POP UP VARIABLE SIZE STYLE ---
const PopUpVariableSizeComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div className="caption-container">
      {words.map((word, index) => {
        // Generate bigger, more dramatic variation between 1.2rem–3.5rem
        const fontSize = `${1.2 + Math.abs(Math.sin(index * 1.4)) * 2.3}rem`;
        const hue = 35 * (index % 10);

        return (
          <span
            key={`${word}-${index}`}
            className="animate-pop-up variable-size"
            style={{
              animationDelay: `${index * 250}ms`,
              animationFillMode: "forwards",
              fontSize,
              color: `hsl(${hue}, 95%, 62%)`,
              marginRight: "10px",
              display: "inline-block",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            {word}
          </span>
        );
      })}
      <style>{`
        @keyframes pop-up {
          0% { opacity: 0; transform: translateY(30px) scale(0.85); }
          40% { opacity: 1; transform: translateY(-10px) scale(1.1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-pop-up {
          display: inline-block;
          opacity: 0;
          animation: pop-up 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .caption-container {
          text-align: center;
          line-height: 1.3;
          word-spacing: 0.25rem;
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

// --- BOO STYLE ---
const BooComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="animate-boo"
          style={{
            display: "inline-block",
            marginRight: "8px",
            textShadow: "0 0 18px rgba(150, 80, 255, 0.8)",
            animationDelay: `${i * 150}ms`,
          }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes boo-bounce {
          0% { transform: scale(0.7); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-boo {
          opacity: 0;
          animation: boo-bounce 0.7s cubic-bezier(0.68,-0.55,0.265,1.55) forwards;
        }
      `}</style>
    </div>
  );
};

// --- SPOOKY STYLE ---
const SpookyComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="animate-spooky"
          style={{
            display: "inline-block",
            marginRight: "8px",
            textShadow: `
              0 0 8px #ccff00,
              0 0 20px #bfff00,
              0 0 30px #99ff00
            `,
            animationDelay: `${i * 120}ms`,
          }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes spooky-drip {
          0% { transform: translateY(-10px) scale(0.9); opacity: 0; }
          40% { transform: translateY(3px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-spooky {
          opacity: 0;
          animation: spooky-drip 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </div>
  );
};

// --- BOLD MOVES STYLE ---
const BoldMovesComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="animate-bold"
          style={{
            display: "inline-block",
            marginRight: "8px",
            textTransform: "uppercase",
            color: i % 2 === 0 ? "#ff4d00" : "#007b9e",
            animationDelay: `${i * 100}ms`,
          }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes bold-slide {
          0% { opacity: 0; transform: translateY(25px) rotate(-5deg); }
          60% { opacity: 1; transform: translateY(-4px) rotate(3deg); }
          100% { opacity: 1; transform: translateY(0) rotate(0); }
        }
        .animate-bold {
          opacity: 0;
          animation: bold-slide 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
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
        color: currentColor; /* MODIFIED: Inherit color */
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
  <span className="neon-pop">
    {text}
    <style>{`
      @keyframes neon {
        0%, 100% { text-shadow: 0 0 4px #ff00ff, 0 0 10px #ff00ff; }
        50% { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff; }
      }
      .neon-pop { color: currentColor; animation: neon 1.5s ease-in-out infinite alternate; } /* MODIFIED: Inherit color */
    `}</style>
  </span>
);

// --- SHIMMER SLIDE STYLE ---
const ShimmerSlideComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <span className="shimmer-slide">
    {text}
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
  <span className="pulse-glow-beat">
    {text}
    <style>{`
      @keyframes pulse {
        0%, 100% { transform: scale(1); text-shadow: 0 0 8px #ff00aa; }
        50% { transform: scale(1.05); text-shadow: 0 0 20px #ff66cc; }
      }
      .pulse-glow-beat {
        color: currentColor; /* MODIFIED: Inherit color */
        display: inline-block;
        animation: pulse 1s ease-in-out infinite;
      }
    `}</style>
  </span>
);
const WordPopMatrixComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={i}
          className="matrix-word"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes matrix {
          0%,100% { transform: translate(0,0); opacity:1; }
          50% { transform: translate(2px, -3px); opacity:0.9; }
        }
        .matrix-word {
          display:inline-block;
          color:#00ff99;
          font-family: 'Courier New', monospace;
          animation: matrix 0.6s ease-in-out infinite;
          margin-right:8px;
        }
      `}</style>
    </div>
  );
};

const WindSwipeComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <span className="wind-swipe">
    {text}
    <style>{`
      @keyframes wind {
        0% { clip-path: inset(0 100% 0 0); opacity: 0; }
        100% { clip-path: inset(0 0 0 0); opacity: 1; }
      }
      .wind-swipe {
        display:inline-block;
        background:linear-gradient(90deg, #00ffff, #ff00ff);
        -webkit-background-clip:text;
        color:transparent;
        /* fontWeight is inherited */
        animation: wind 1s ease forwards;
      }
    `}</style>
  </span>
);
const PopRotateComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={i}
          className="pop-rotate"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes rotatePop {
          0% { opacity:0; transform: scale(0.2) rotate(-20deg); }
          50% { opacity:1; transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .pop-rotate {
          display:inline-block;
          margin-right:10px;
          animation: rotatePop 0.8s cubic-bezier(0.22,1,0.36,1);
          /* fontWeight is inherited */
        }
      `}</style>
    </div>
  );
};

const FloatGlowComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={i}
          className="float-glow"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes floatGlow {
          0% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 1; text-shadow: 0 0 10px #00ffff; }
          100% { transform: translateY(-5px); }
        }
        .float-glow {
          display:inline-block;
          margin-right:8px;
          animation: floatGlow 1s ease forwards;
          color: currentColor; /* MODIFIED: Inherit color */
          /* fontWeight is inherited */
        }
      `}</style>
    </div>
  );
};
const SlideFadeComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={i}
          className={`slide-fade ${i % 2 === 0 ? "from-left" : "from-right"}`}
          style={{ animationDelay: `${i * 150}ms` }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes slideLeft { from { opacity:0; transform: translateX(-40px);} to {opacity:1; transform:translateX(0);} }
        @keyframes slideRight { from { opacity:0; transform: translateX(40px);} to {opacity:1; transform:translateX(0);} }
        .slide-fade {
          display:inline-block;
          margin-right:8px;
          /* fontWeight is inherited */
        }
        .slide-fade.from-left { animation: slideLeft 0.6s ease-out forwards; }
        .slide-fade.from-right { animation: slideRight 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};
const HeatGlowComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <span className="heat-glow">
    {text}
    <style>{`
      @keyframes heat {
        0%,100% { text-shadow: 0 0 5px #ff6600, 0 0 15px #ff3300; }
        50% { text-shadow: 0 0 20px #ffaa33, 0 0 35px #ff6600; }
      }
      .heat-glow {
        color: currentColor; /* MODIFIED: Inherit color (will be tinted by shadow) */
        animation: heat 1.4s ease-in-out infinite;
        /* fontWeight is inherited */
      }
    `}</style>
  </span>
);

const AudioWaveComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={i}
          className="audio-wave"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes wave {
          0%,100% { transform: translateY(0); }
          25% { transform: translateY(-6px); }
          75% { transform: translateY(4px); }
        }
        .audio-wave {
          display: inline-block;
          margin-right: 10px;
          animation: wave 1.2s ease-in-out infinite;
          color: #00e0ff; /* This style is *about* the color, so we keep it */
          /* fontWeight is inherited */
        }
      `}</style>
    </div>
  );
};

const FlashZoomComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={i}
          className="flash-zoom"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes flashZoom {
          0% { opacity: 0; transform: scale(0.2); text-shadow: none; }
          50% { opacity: 1; transform: scale(1.3); text-shadow: 0 0 20px #fff; }
          100% { transform: scale(1); text-shadow: 0 0 5px #aaa; }
        }
        .flash-zoom {
          display: inline-block;
          margin-right: 8px;
          animation: flashZoom 0.6s ease-in-out;
          /* fontWeight is inherited */
        }
      `}</style>
    </div>
  );
};

const GradientPulseComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <span className="gradient-pulse">
    {text}
    <style>{`
      @keyframes gradientPulse {
        0%,100% { background-position: 0% 50%; transform: scale(1); }
        50% { background-position: 100% 50%; transform: scale(1.1); }
      }
      .gradient-pulse {
        background: linear-gradient(90deg, #ff007f, #ffcc00, #00e5ff, #ff007f);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        color: transparent;
        /* fontWeight is inherited */
        animation: gradientPulse 2s ease-in-out infinite;
      }
    `}</style>
  </span>
);

const BounceDropComponent: React.FC<DynamicStyleProps> = ({
  fullTranscript,
  interimTranscript,
}) => {
  const words = useWords(fullTranscript, interimTranscript);
  return (
    <div>
      {words.map((word, i) => (
        <span
          key={i}
          className="bounce-drop"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes bounceDrop {
          0% { transform: translateY(-100px) scale(1.3); opacity: 0; }
          60% { transform: translateY(15px) scale(1); opacity: 1; }
          80% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        .bounce-drop {
          display: inline-block;
          margin-right: 8px;
          animation: bounceDrop 0.8s cubic-bezier(0.34,1.56,0.64,1);
          /* fontWeight is inherited */
        }
      `}</style>
    </div>
  );
};

// --- EXPORT ALL STYLES ---
export const DYNAMIC_STYLES: Record<string, CaptionStyleDef> = {
  none: { id: "none", name: "None (Static)", component: StaticComponent },
  karaoke: { id: "karaoke", name: "Karaoke", component: KaraokeComponent },
  "pop-up": {
    id: "pop-up",
    name: "Pop Up (Smooth)",
    component: PopUpComponent,
  },
  "pop-up-variable-size": {
    id: "pop-up-variable-size",
    name: "Pop Up (Variable Size)",
    component: PopUpVariableSizeComponent,
  },
  rainbow: {
    id: "rainbow",
    name: "Rainbow Wave",
    component: RainbowWaveComponent,
  },
  "typewriter-glow": {
    id: "typewriter-glow",
    name: "Typewriter Glow",
    component: TypewriterGlowComponent,
  },
  "neon-pop": { id: "neon-pop", name: "Neon Pop", component: NeonPopComponent },
  "shimmer-slide": {
    id: "shimmer-slide",
    name: "Shimmer Slide",
    component: ShimmerSlideComponent,
  },
  "pulse-glow-beat": {
    id: "pulse-glow-beat",
    name: "Pulse Glow Beat",
    component: PulseGlowBeatComponent,
  },
  "bounce-drop": {
    id: "bounce-drop",
    name: "Bounce Drop",
    component: BounceDropComponent,
  },
  "gradient-pulse": {
    id: "gradient-pulse",
    name: "Gradient Pulse",
    component: GradientPulseComponent,
  },
  "flash-zoom": {
    id: "flash-zoom",
    name: "Flash Zoom",
    component: FlashZoomComponent,
  },
  "audio-wave": {
    id: "audio-wave",
    name: "Audio Wave",
    component: AudioWaveComponent,
  },
  "heat-glow": {
    id: "heat-glow",
    name: "Heat Glow",
    component: HeatGlowComponent,
  },
  "slide-fade": {
    id: "slide-fade",
    name: "Slide Fade",
    component: SlideFadeComponent,
  },
  "float-glow": {
    id: "float-glow",
    name: "Float Glow",
    component: FloatGlowComponent,
  },
  "pop-rotate": {
    id: "pop-rotate",
    name: "Pop Rotate",
    component: PopRotateComponent,
  },
  "wind-swipe": {
    id: "wind-swipe",
    name: "Wind Swipe",
    component: WindSwipeComponent,
  },
  "word-pop-matrix": {
    id: "word-pop-matrix",
    name: "Word Pop Matrix",
    component: WordPopMatrixComponent,
  },
  boo: { id: "boo", name: "Boo (Halloween Glow)", component: BooComponent },
  spooky: {
    id: "spooky",
    name: "Spooky (Glow Drip)",
    component: SpookyComponent,
  },
  "bold-moves": {
    id: "bold-moves",
    name: "Bold Moves (Energetic)",
    component: BoldMovesComponent,
  },
};

export const DYNAMIC_STYLE_OPTIONS = Object.values(DYNAMIC_STYLES).map(
  ({ id, name }) => ({ id, name })
);

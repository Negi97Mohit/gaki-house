// src/styles/GlowOutlineStyle.tsx
import React from "react";
import { DynamicStyleProps } from "@/types/caption";

export const GlowOutlineStyle: React.FC<DynamicStyleProps> = ({ text }) => (
  <span className="glow-outline">{text}
    <style>{`
      @keyframes neon-outline {
        0%,100% { text-shadow: 0 0 2px #ff00ff, 0 0 6px #ff00ff; }
        50% { text-shadow: 0 0 12px #00ffff, 0 0 24px #00ffff; }
      }
      .glow-outline {
        color: #fff;
        animation: neon-outline 1.5s ease-in-out infinite alternate;
      }
    `}</style>
  </span>
);

// src/styles/NeonPulseStyle.tsx
import React from "react";
import { DynamicStyleProps } from "@/types/caption";

export const NeonPulseStyle: React.FC<DynamicStyleProps> = ({ text }) => (
  <span className="neon-pulse">{text}
    <style>{`
      @keyframes neon-pulse {
        0%,100% { text-shadow: 0 0 4px #ff00ff, 0 0 10px #ff00ff; transform: scale(1); }
        50% { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff; transform: scale(1.05); }
      }
      .neon-pulse {
        color: #fff;
        display: inline-block;
        animation: neon-pulse 1.2s ease-in-out infinite alternate;
      }
    `}</style>
  </span>
);

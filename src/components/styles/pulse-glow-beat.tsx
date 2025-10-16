import React from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

const PulseGlowBeatComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <div className="pulse-glow-beat">{text}
    <style>{`
      @keyframes pulse {
        0%, 100% { transform: scale(1); text-shadow: 0 0 8px #ff00aa; }
        50% { transform: scale(1.1); text-shadow: 0 0 20px #ff66cc; }
      }
      .pulse-glow-beat {
        color: #fff;
        animation: pulse 1s ease-in-out infinite;
      }
    `}</style>
  </div>
);

export const PulseGlowBeatStyle: CaptionStyleDef = {
  id: "pulse-glow-beat",
  name: "Pulse Glow Beat",
  component: PulseGlowBeatComponent,
};

import React from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

const NeonPopComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <div className="neon-pop">{text}
    <style>{`
      @keyframes neon {
        0%, 100% { text-shadow: 0 0 4px #ff00ff, 0 0 10px #ff00ff; }
        50% { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff; }
      }
      .neon-pop {
        color: #fff;
        animation: neon 1.5s ease-in-out infinite alternate;
      }
    `}</style>
  </div>
);

export const NeonPopStyle: CaptionStyleDef = {
  id: "neon-pop",
  name: "Neon Pop",
  component: NeonPopComponent,
};

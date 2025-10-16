import React from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

const ComicJumpComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <div className="comic-jump">{text}
    <style>{`
      @keyframes jump {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        40% { transform: translateY(-25px) rotate(-3deg); }
        60% { transform: translateY(5px) rotate(2deg); }
      }
      .comic-jump {
        font-weight: 800;
        color: #ffcc00;
        text-shadow: 2px 2px 0 #000;
        animation: jump 0.8s ease-out;
      }
    `}</style>
  </div>
);

export const ComicJumpStyle: CaptionStyleDef = {
  id: "comic-jump",
  name: "Comic Jump",
  component: ComicJumpComponent,
};

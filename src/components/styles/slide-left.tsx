import React from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

const SlideLeftComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <div className="animate-slide-left">{text}
    <style>{`
      @keyframes slide-left {
        0% { opacity: 0; transform: translateX(40px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      .animate-slide-left {
        display: inline-block;
        animation: slide-left 0.8s ease-out forwards;
      }
    `}</style>
  </div>
);

export const SlideLeftStyle: CaptionStyleDef = {
  id: "slide-left",
  name: "Slide In Left",
  component: SlideLeftComponent,
};

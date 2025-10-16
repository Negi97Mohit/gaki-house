import React from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

const SoftFadeAuraComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <div className="soft-fade-aura">{text}
    <style>{`
      @keyframes fade-aura {
        0% { opacity: 0; text-shadow: 0 0 20px rgba(255,255,255,0); }
        100% { opacity: 1; text-shadow: 0 0 20px rgba(255,255,255,0.8); }
      }
      .soft-fade-aura {
        color: #fff;
        animation: fade-aura 1.5s ease-out forwards;
      }
    `}</style>
  </div>
);

export const SoftFadeAuraStyle: CaptionStyleDef = {
  id: "soft-fade-aura",
  name: "Soft Fade Aura",
  component: SoftFadeAuraComponent,
};

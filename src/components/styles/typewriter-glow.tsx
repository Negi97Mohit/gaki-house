import React from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

const TypewriterGlowComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <div className="typewriter-glow">
    {text}
    <style>{`
      .typewriter-glow {
        display: inline-block;
        color: #fff;
        text-shadow: 0 0 8px #00f0ff;
        overflow: hidden;
        border-right: 3px solid #00f0ff;
        white-space: nowrap;
        width: 0;
        animation: typing 3s steps(${text.length}), blink 0.6s step-end infinite alternate;
      }
      @keyframes typing { from { width: 0; } to { width: 100%; } }
      @keyframes blink { 50% { border-color: transparent; } }
    `}</style>
  </div>
);

export const TypewriterGlowStyle: CaptionStyleDef = {
  id: "typewriter-glow",
  name: "Typewriter Glow",
  component: TypewriterGlowComponent,
};

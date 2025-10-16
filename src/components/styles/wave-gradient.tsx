import React from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

const WaveGradientComponent: React.FC<DynamicStyleProps> = ({ text }) => {
  const letters = text.split("");
  return (
    <div>
      {letters.map((l, i) => (
        <span
          key={i}
          className="wave-gradient"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {l}
        </span>
      ))}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .wave-gradient {
          display: inline-block;
          background: linear-gradient(90deg, #ff00cc, #3333ff);
          -webkit-background-clip: text;
          color: transparent;
          animation: wave 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export const WaveGradientStyle: CaptionStyleDef = {
  id: "wave-gradient",
  name: "Wave Gradient",
  component: WaveGradientComponent,
};

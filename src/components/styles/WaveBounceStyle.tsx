// src/styles/WaveBounceStyle.tsx
import React from "react";
import { DynamicStyleProps } from "@/types/caption";

export const WaveBounceStyle: React.FC<DynamicStyleProps> = ({ text }) => {
  return (
    <div>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="wave-bounce"
          style={{ animationDelay: `${i * 60}ms`, display: "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
      <style>{`
        @keyframes wave-bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .wave-bounce { animation: wave-bounce 0.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

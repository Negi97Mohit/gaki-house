// src/styles/SlideRainbowStyle.tsx
import React from "react";
import { DynamicStyleProps } from "@/types/caption";

export const SlideRainbowStyle: React.FC<DynamicStyleProps> = ({ fullTranscript, interimTranscript }) => {
  const words = (fullTranscript + " " + interimTranscript).trim().split(/\s+/).filter(Boolean);

  return (
    <div>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="slide-rainbow"
          style={{ animationDelay: `${i * 100}ms`, display: "inline-block", marginRight: "6px" }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes slide-rainbow {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .slide-rainbow {
          background: linear-gradient(90deg, #ff2a2a, #ffa52a, #2aff47, #2a89ff, #a22aff);
          -webkit-background-clip: text;
          color: transparent;
          animation: slide-rainbow 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

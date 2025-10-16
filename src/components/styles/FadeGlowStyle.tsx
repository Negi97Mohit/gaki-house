// src/styles/FadeGlowStyle.tsx
import React from "react";
import { DynamicStyleProps } from "@/types/caption";

export const FadeGlowStyle: React.FC<DynamicStyleProps> = ({ fullTranscript, interimTranscript }) => {
  const words = (fullTranscript + " " + interimTranscript).trim().split(/\s+/).filter(Boolean);

  return (
    <div>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="fade-glow"
          style={{ animationDelay: `${i * 120}ms`, display: "inline-block", marginRight: "6px" }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes fade-up-glow {
          0% { transform: translateY(20px); opacity: 0; text-shadow: 0 0 0 #fff; }
          100% { transform: translateY(0); opacity: 1; text-shadow: 0 0 12px #00ffea; }
        }
        .fade-glow { animation: fade-up-glow 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

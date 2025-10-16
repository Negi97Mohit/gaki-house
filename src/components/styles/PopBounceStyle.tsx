// src/styles/PopBounceStyle.tsx
import React from "react";
import { DynamicStyleProps } from "@/types/caption";

export const PopBounceStyle: React.FC<DynamicStyleProps> = ({ fullTranscript, interimTranscript }) => {
  const words = (fullTranscript + " " + interimTranscript).trim().split(/\s+/).filter(Boolean);

  return (
    <div>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="pop-bounce"
          style={{ animationDelay: `${i * 100}ms`, display: "inline-block", marginRight: "6px" }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes pop-bounce {
          0% { transform: scale(0.7); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pop-bounce { animation: pop-bounce 0.5s cubic-bezier(0.68,-0.55,0.265,1.55) forwards; }
      `}</style>
    </div>
  );
};

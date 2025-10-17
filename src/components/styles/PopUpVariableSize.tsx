import React from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

const PopUpVariableSize: React.FC<DynamicStyleProps> = ({ text }) => {
  const words = text.split(/\s+/);

  return (
    <div className="caption-container">
      {words.map((word, index) => {
        // Generate a random font size variation (between 0.9rem–1.6rem)
        const fontSize = `${1 + Math.sin(index * 1.3) * 0.3 + 0.3}rem`;
        const hue = 40 * (index % 9); // optional color variation for visual depth

        return (
          <React.Fragment key={index}>
            <span
              className="animate-pop-up variable-size"
              style={{
                animationDelay: `${index * 250}ms`,
                animationFillMode: "forwards",
                fontSize,
                color: `hsl(${hue}, 90%, 60%)`, // subtle gradient tone (optional)
              }}
            >
              {word}
            </span>{" "}
          </React.Fragment>
        );
      })}

      <style>{`
        @keyframes pop-up {
          0% {
            opacity: 0;
            transform: translateY(25px) scale(0.85);
          }
          40% {
            opacity: 1;
            transform: translateY(-5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-pop-up {
          display: inline-block;
          opacity: 0;
          animation: pop-up 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          font-weight: 700;
        }

        .caption-container {
          text-align: center;
          line-height: 1.4;
          word-spacing: 0.2rem;
        }
      `}</style>
    </div>
  );
};

export const PopUpVariableSizeStyle: CaptionStyleDef = {
  id: "pop-up-variable-size",
  name: "Pop Up (Variable Size)",
  component: PopUpVariableSize,
};

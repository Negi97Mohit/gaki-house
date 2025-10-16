import React from "react";
import { CaptionStyleDef, DynamicStyleProps } from "@/types/caption";

const ShimmerSlideComponent: React.FC<DynamicStyleProps> = ({ text }) => (
  <div className="shimmer-slide">{text}
    <style>{`
      .shimmer-slide {
        display: inline-block;
        background: linear-gradient(120deg, #999 0%, #fff 50%, #999 100%);
        background-size: 200% auto;
        color: transparent;
        -webkit-background-clip: text;
        animation: shimmer 1.5s linear infinite;
      }
      @keyframes shimmer {
        to { background-position: 200% center; }
      }
    `}</style>
  </div>
);

export const ShimmerSlideStyle: CaptionStyleDef = {
  id: "shimmer-slide",
  name: "Shimmer Slide",
  component: ShimmerSlideComponent,
};

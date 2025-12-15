import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";

interface DiagonalRushLayoutProps {
  sections: CanvasSectionState[];
  [key: string]: any;
}

export const DiagonalRushLayout: React.FC<DiagonalRushLayoutProps> = ({
  sections,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate each row in alternating directions
      rowsRef.current.forEach((row, i) => {
        if (!row) return;
        const direction = i % 2 === 0 ? 1 : -1;

        gsap.to(row, {
          xPercent: direction * -50,
          ease: "none",
          duration: 15 + i * 2, // Varying speeds
          repeat: -1,
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const camSection = sections[0];

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#111] overflow-hidden relative font-sans"
    >
      {/* Central Camera (Fixed) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] z-20 border-4 border-yellow-400 shadow-[20px_20px_0px_rgba(255,255,0,0.2)] rotate-[-5deg]">
        {camSection && (
          <GridSectionWrapper
            section={camSection}
            templateSection={{ id: camSection.id, name: "Rush Cam" }}
            {...props}
          />
        )}
      </div>

      {/* Diagonal Text Background */}
      <div className="absolute inset-[-50%] w-[200%] h-[200%] rotate-[-5deg] flex flex-col justify-center gap-4 opacity-50 z-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) rowsRef.current[i] = el;
            }}
            className={`flex whitespace-nowrap text-[8vw] font-black uppercase ${
              i % 2 === 0 ? "text-white" : "text-transparent stroke-text"
            }`}
            style={{
              WebkitTextStroke:
                i % 2 !== 0 ? "2px rgba(255,255,255,0.5)" : "none",
            }}
          >
            {Array.from({ length: 8 }).map((_, j) => (
              <span key={j} className="mx-8">
                Break The Grid • Kinetic Motion •
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Decorative Noise / Grain Overlay */}
      <div
        className="absolute inset-0 z-30 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
};

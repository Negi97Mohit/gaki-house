import type { AnimationPreset } from "@/data/types";

const easingMap: Record<string, string> = {
  smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  bouncy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  elastic: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
  linear: "linear",
};

function buildAnimationStyle(cfg: AnimationPreset["animationConfig"]): React.CSSProperties {
  const dur = cfg.duration ?? 0.8;
  const delay = cfg.delay ?? 0;
  const ease = easingMap[cfg.easing ?? "smooth"] ?? "ease-out";
  const iter = cfg.loop ? "infinite" : "1";
  const dir = cfg.direction;
  const name =
    dir === "down" ? "fx-anim-down" :
    dir === "left" ? "fx-anim-left" :
    dir === "right" ? "fx-anim-right" :
    "fx-anim-up";
  return {
    animation: `${name} ${dur}s ${ease} ${delay}s ${iter} both`,
    animationDelay: `${delay}s`,
  };
}

export function AnimationLayer({ preset }: { preset: AnimationPreset }) {
  const { defaultContent, baseStyle, animationConfig } = preset;
  const lines = Object.values(defaultContent);
  const fontSize = Math.max(18, (baseStyle.fontSize ?? 48) * 0.45);
  const animStyle = buildAnimationStyle(animationConfig);

  return (
    <div
      className="absolute inset-x-0 flex flex-col gap-1 px-6 pointer-events-none"
      style={{
        top: "38%",
        textAlign: baseStyle.alignment ?? "center",
        alignItems:
          baseStyle.alignment === "left"
            ? "flex-start"
            : baseStyle.alignment === "right"
            ? "flex-end"
            : "center",
        zIndex: 25,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: baseStyle.fontFamily ? `"${baseStyle.fontFamily}", sans-serif` : undefined,
            fontSize: i === 0 ? `${fontSize}px` : `${fontSize * 0.6}px`,
            color: i === 0 ? baseStyle.color : baseStyle.accentColor ?? baseStyle.color,
            backgroundColor:
              baseStyle.backgroundColor && baseStyle.backgroundColor !== "transparent"
                ? baseStyle.backgroundColor
                : undefined,
            padding: baseStyle.backgroundColor ? "4px 10px" : 0,
            borderRadius: baseStyle.backgroundColor ? 8 : 0,
            fontWeight: 700,
            lineHeight: 1.05,
            textShadow: "0 2px 8px rgba(0,0,0,0.55)",
            ...animStyle,
            animationDelay: `${(animationConfig.delay ?? 0) + i * 0.08}s`,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

// src/components/panels/DynamicStylesPanel.tsx
import React, { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DYNAMIC_STYLES } from "@/lib/dynamicCaptionStyles";

interface DynamicStylesPanelProps {
  dynamicStyle: string;
  onDynamicStyleChange: (styleId: string) => void;
}

export const DynamicStylesPanel: React.FC<DynamicStylesPanelProps> = ({
  dynamicStyle,
  onDynamicStyleChange,
}) => {
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewKey((prevKey) => prevKey + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const previewBaseStyle: React.CSSProperties = {
    fontSize: "16px",
    fontFamily: "JetBrains Mono, monospace",
    color: "hsl(var(--foreground))",
    fontWeight: "500",
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Section Label */}
      <div className="pb-3 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          Select Animation
        </span>
      </div>

      <RadioGroup
        value={dynamicStyle}
        onValueChange={onDynamicStyleChange}
        className="grid grid-cols-2 gap-2"
      >
        {Object.values(DYNAMIC_STYLES).map((styleDef) => {
          const isSelected = dynamicStyle === styleDef.id;
          const Component = styleDef.component;

          return (
            <div
              key={styleDef.id}
              className={cn(
                "relative border overflow-hidden transition-all duration-150 cursor-pointer group",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onDynamicStyleChange(styleDef.id)}
            >
              <RadioGroupItem
                value={styleDef.id}
                id={styleDef.id}
                className="sr-only"
              />
              <Label htmlFor={styleDef.id} className="block cursor-pointer">
                {/* Preview Area */}
                <div className="aspect-video bg-card flex items-center justify-center p-3 relative overflow-hidden border-b border-border">
                  <div
                    key={`${styleDef.id}-${previewKey}`}
                    className="relative z-10 w-full text-center"
                    style={
                      isSelected
                        ? {
                            ...previewBaseStyle,
                            color: "hsl(var(--primary))",
                          }
                        : previewBaseStyle
                    }
                  >
                    <Component
                      text="Preview text"
                      fullTranscript="Preview text"
                      interimTranscript=""
                      baseStyle={
                        isSelected
                          ? {
                              ...previewBaseStyle,
                              color: "hsl(var(--primary))",
                            }
                          : previewBaseStyle
                      }
                    />
                  </div>
                </div>

                {/* Label */}
                <div
                  className={cn(
                    "px-2 py-1.5 text-center text-[10px] font-medium tracking-wide transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {styleDef.name.toUpperCase()}
                </div>
              </Label>
              
              {/* Active indicator */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

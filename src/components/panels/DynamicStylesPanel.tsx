// src/components/panels/DynamicStylesPanel.tsx
import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
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
    fontSize: "18px",
    fontFamily: "Inter, sans-serif",
    color: "hsl(var(--foreground))",
    fontWeight: "600",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-base font-semibold tracking-wide">
          Caption Dynamic Styles
        </h3>
      </div>
      <RadioGroup
        value={dynamicStyle}
        onValueChange={onDynamicStyleChange}
        className="grid grid-cols-2 gap-3"
      >
        {Object.values(DYNAMIC_STYLES).map((styleDef) => {
          const isSelected = dynamicStyle === styleDef.id;
          const Component = styleDef.component;

          return (
            <div
              key={styleDef.id}
              className={cn(
                "relative rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer group",
                isSelected
                  ? "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                  : "border-yellow-500/20 hover:border-yellow-500/60"
              )}
              onClick={() => onDynamicStyleChange(styleDef.id)}
            >
              <RadioGroupItem
                value={styleDef.id}
                id={styleDef.id}
                className="sr-only"
              />
              <Label htmlFor={styleDef.id} className="block cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-yellow-500/10" />
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
                      text="This is a preview"
                      fullTranscript="This is a preview"
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
                <div
                  className={cn(
                    "p-2 text-center text-xs font-semibold font-cyber transition-colors",
                    isSelected
                      ? "bg-yellow-500 text-black"
                      : "bg-background/80 text-foreground"
                  )}
                >
                  {styleDef.name}
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

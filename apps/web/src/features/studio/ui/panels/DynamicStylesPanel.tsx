// src/components/panels/DynamicStylesPanel.tsx
import React, { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@gaki/ui/radio-group";
import { Label } from "@gaki/ui/label";
import { cn } from "@gaki/core/lib/utils";
import { ScrollArea, ScrollBar } from "@gaki/ui/scroll-area";
import { DYNAMIC_STYLES } from "@/lib/dynamicCaptionStyles";

interface DynamicStylesPanelProps {
  dynamicStyle: string;
  onDynamicStyleChange: (styleId: string) => void;
  isHorizontal?: boolean;
}

export const DynamicStylesPanel: React.FC<DynamicStylesPanelProps> = ({
  dynamicStyle,
  onDynamicStyleChange,
  isHorizontal = false,
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
    <div className="space-y-4">
      <p className="text-[11px] text-white/45">Pick how captions animate</p>

      {isHorizontal ? (
        <ScrollArea className="w-full">
          <RadioGroup
            value={dynamicStyle}
            onValueChange={onDynamicStyleChange}
            className="flex gap-2 pb-4"
          >
            {Object.values(DYNAMIC_STYLES).map((styleDef) => {
              const isSelected = dynamicStyle === styleDef.id;
              const Component = styleDef.component;

              return (
                <div
                  key={styleDef.id}
                  className={cn(
                    "relative border rounded-[10px] overflow-hidden transition-colors duration-150 cursor-pointer group w-36 shrink-0",
                    isSelected
                      ? "border-primary"
                      : "border-white/[0.08] hover:border-white/20",
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
                        "px-2 py-2 text-center text-[11px] transition-colors",
                        isSelected
                          ? "text-primary"
                          : "text-white/55 group-hover:text-white",
                      )}
                    >
                      {styleDef.name}
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
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
                  "relative border rounded-[10px] overflow-hidden transition-colors duration-150 cursor-pointer group",
                  isSelected
                    ? "border-primary"
                    : "border-white/[0.08] hover:border-white/20",
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
                      "px-2 py-2 text-center text-[11px] transition-colors",
                      isSelected
                        ? "text-primary"
                        : "text-white/55 group-hover:text-white",
                    )}
                  >
                    {styleDef.name}
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      )}
    </div>
  );
};

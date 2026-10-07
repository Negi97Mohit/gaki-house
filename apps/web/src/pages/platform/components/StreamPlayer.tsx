import React from "react";

export const StreamPlayer: React.FC<{ [key: string]: unknown }> = () => null;

export function isEmbeddablePlatform(_platform?: string): boolean {
  return false;
}

export function isIframePlatform(_platform?: string): boolean {
  return false;
}

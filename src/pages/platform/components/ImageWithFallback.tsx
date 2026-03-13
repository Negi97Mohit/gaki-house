import React, { useState } from "react";
import { cn } from "@/shared/lib/utils";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  hideOnError?: boolean;
}

/**
 * Image component that gracefully handles loading failures.
 * When hideOnError is true, the image is hidden entirely on error.
 * Otherwise, shows a muted placeholder.
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  hideOnError = false,
  className,
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError && hideOnError) return null;

  if (hasError) {
    return <div className={cn("bg-muted", className)} />;
  }

  return (
    <img
      {...props}
      className={className}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
    />
  );
};

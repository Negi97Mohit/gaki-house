import * as React from "react";

export type ToastVariant = "default" | "destructive";

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLLIElement>, "onPause"> {
  variant?: ToastVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export type ToastActionElement = React.ReactElement;

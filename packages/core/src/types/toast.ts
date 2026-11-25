import * as React from "react";

export type ToastVariant = "default" | "destructive";

export interface ToastProps extends React.HTMLAttributes<HTMLLIElement> {
  variant?: ToastVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export type ToastActionElement = React.ReactElement;

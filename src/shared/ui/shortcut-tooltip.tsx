import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip';
import { SHORTCUTS, ShortcutKey } from '@/shared/lib/shortcuts';
import { cn } from '@/shared/lib/utils';

interface ShortcutTooltipProps {
  children: React.ReactNode;
  label: string;
  shortcut?: ShortcutKey;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  delayDuration?: number;
}

export const ShortcutTooltip: React.FC<ShortcutTooltipProps> = ({
  children,
  label,
  shortcut,
  side = 'top',
  sideOffset = 8,
  delayDuration = 200,
}) => {
  const shortcutDisplay = shortcut ? SHORTCUTS[shortcut]?.display : null;

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs"
        >
          <span>{label}</span>
          {shortcutDisplay && (
            <kbd
              className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5',
                'bg-muted/80 border border-border/60 rounded text-[10px] font-mono font-medium',
                'text-muted-foreground'
              )}
            >
              {shortcutDisplay}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

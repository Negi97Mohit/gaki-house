import React, { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

export interface CollapsibleSectionProps {
  title: string;
  icon?: React.ElementType;
  /** Small pill shown next to the title (e.g. an item count). */
  badge?: React.ReactNode;
  /** Controls rendered on the right of the header (kept outside the toggle button). */
  actions?: React.ReactNode;
  defaultOpen?: boolean;
  /** `card` = bordered surface; `plain` = header only, for nesting inside a card. */
  variant?: "card" | "plain";
  className?: string;
  children: React.ReactNode;
}

/**
 * A section whose body can be folded away, so long panels stay short.
 * The body stays mounted while collapsed, so inner state (selected tab,
 * scroll position, inputs) survives a collapse/expand.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon: Icon,
  badge,
  actions,
  defaultOpen = true,
  variant = "card",
  className,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section
      className={cn(
        variant === "card" &&
          "rounded-xl border border-white/[0.06] bg-foreground/[0.02]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1",
          variant === "card" ? "px-2.5 py-1.5" : "py-1",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="group flex flex-1 min-w-0 items-center gap-1.5 rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          <ChevronDown
            aria-hidden
            className={cn(
              "w-3.5 h-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              !open && "-rotate-90",
            )}
          />
          {Icon && (
            <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </span>
          {badge !== undefined && badge !== null && (
            <span className="ml-1 shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
              {badge}
            </span>
          )}
        </button>
        {actions}
      </div>

      {/* grid-rows 0fr -> 1fr animates height without measuring */}
      <div
        id={bodyId}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={cn(
            "min-h-0 overflow-hidden transition-[visibility] duration-200",
            !open && "invisible",
          )}
        >
          <div
            className={cn(
              variant === "card" ? "px-2.5 pb-2.5 pt-0.5" : "pt-0.5 pb-1",
              "space-y-2.5",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from "react";
import { Smile } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

const EMOTE_CATEGORIES = [
  {
    name: "Popular",
    emotes: ["😂", "🔥", "❤️", "💀", "😭", "🤣", "👀", "💯", "🫡", "🤡", "😎", "🥶", "🤯", "😈", "👑", "⭐"],
  },
  {
    name: "Reactions",
    emotes: ["👍", "👎", "👏", "🙌", "🎉", "🤝", "✊", "💪", "🫶", "🤙", "✌️", "🤞", "🖐️", "👋", "🤟", "🫰"],
  },
  {
    name: "Gaming",
    emotes: ["🎮", "🕹️", "🏆", "⚔️", "🛡️", "💣", "🎯", "🏅", "🥇", "🎲", "♟️", "🃏", "🧩", "🎪", "🚀", "⚡"],
  },
  {
    name: "Memes",
    emotes: ["💀", "🗿", "🤓", "😤", "🥺", "😏", "🤨", "😳", "🫠", "🤑", "😵‍💫", "🤪", "😬", "🥴", "🫣", "🤐"],
  },
];

interface EmotePickerProps {
  onSelect: (emote: string) => void;
}

export const EmotePicker: React.FC<EmotePickerProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        title="Emotes"
      >
        <Smile className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-[280px] bg-card border border-border/40 rounded-lg shadow-xl z-[200]">
          {/* Category tabs */}
          <div className="flex border-b border-border/30 px-1 pt-1">
            {EMOTE_CATEGORIES.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(i)}
                className={cn(
                  "flex-1 px-2 py-1.5 text-[11px] font-medium rounded-t-md transition-colors",
                  activeCategory === i
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Emote grid */}
          <div className="p-2 grid grid-cols-8 gap-0.5 max-h-[160px] overflow-y-auto">
            {EMOTE_CATEGORIES[activeCategory].emotes.map((emote, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(emote);
                  setIsOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
              >
                {emote}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: number;
  user: string;
  msg: string;
}

const users = [
  "neon_kira", "mikoto", "rin.exe", "yuki_dev", "tako", "haru",
  "kenji", "lila_xo", "shinobi", "moony", "rafa.bra", "zoeyy", "kai__",
];

const lines = [
  "W stream!",
  "Looks amazing 🔥",
  "hello from Brazil 🇧🇷",
  "first time here 👋",
  "the lighting is unreal",
  "where are you rn?",
  "audio is crispy",
  "drop the setup pls 🙏",
  "lurking 👀",
  "go go go",
  "this is so cozy",
  "🐙🐙🐙",
  "your fits never miss",
  "love this vibe ❤️",
  "shared with my friends",
  "hi from Tokyo",
  "🔥🔥🔥",
  "literally watching for hours",
];

const MockChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      user: users[i % users.length],
      msg: lines[i % lines.length],
    }))
  );
  const idRef = useRef(4);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => {
        const next: ChatMessage = {
          id: idRef.current++,
          user: users[Math.floor(Math.random() * users.length)],
          msg: lines[Math.floor(Math.random() * lines.length)],
        };
        return [...prev, next].slice(-7);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="absolute left-3 right-[35%] z-0 max-h-[28vh] overflow-hidden no-scrollbar pointer-events-none bg-transparent"
      style={{
        bottom: "calc(11rem + env(safe-area-inset-bottom, 0px))",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 40%, black 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 40%, black 100%)",
      }}
    >
      <div className="flex flex-col gap-1 pb-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className="animate-fade-in-up text-[13px] leading-snug font-medium text-white"
            style={{
              textShadow:
                "0 1px 2px rgba(0,0,0,0.85), 0 0 6px rgba(0,0,0,0.55), 0 0 1px rgba(255,255,255,0.4)",
            }}
          >
            <span className="font-bold text-white/95 mr-1.5">{m.user}</span>
            <span className="text-white/90">{m.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MockChat;

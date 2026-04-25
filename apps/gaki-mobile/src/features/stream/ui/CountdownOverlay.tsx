interface Props {
  count: number;
}

export function CountdownOverlay({ count }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        key={count}
        className="font-display text-white text-[12rem] leading-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
        style={{ animation: "fade-in-up 0.4s var(--ease-out-soft) both" }}
      >
        {count}
      </div>
    </div>
  );
}

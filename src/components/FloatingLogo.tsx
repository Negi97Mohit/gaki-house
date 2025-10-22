export const FloatingLogo = () => {
  return (
    <div className="fixed top-6 left-6 z-[1020] flex items-center gap-2 bg-white backdrop-blur-xl rounded-full px-4 py-2 border border-border/40 shadow-md">
      <img src="/icon.png" alt="GAKI logo" className="w-6 h-6 rounded-md" />
      <span className="text-xl font-semibold tracking-tight text-black">
        GAKI
      </span>
      <span className="text-sm text-black/60">がき</span>
    </div>
  );
};

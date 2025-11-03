export const FloatingLogo = () => {
  return (
    <div className="fixed top-6 left-6 z-[1020] flex items-center gap-2 bg-transparent rounded-full px-4 py-2">
      <img src="/icon.png" alt="GAKI logo" className="w-8 h-8 rounded-md" />
      <span className="text-2xl font-semibold tracking-tight text-white">
        GAKI
      </span>
      <span className="text-lg text-white/70">がき</span>
    </div>
  );
};

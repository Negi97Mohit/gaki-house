export const FloatingLogo = () => {
  return (
    <div className="fixed top-6 left-6 z-[1000] flex items-center gap-2 bg-card/70 backdrop-blur-xl rounded-full px-4 py-2 border border-border/40 shadow-lg">
      <img 
        src="/icon.png" 
        alt="GAKI logo" 
        className="w-6 h-6 rounded-md" 
      />
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        GAKI
      </span>
      <span className="text-sm text-muted-foreground">がき</span>
    </div>
  );
};

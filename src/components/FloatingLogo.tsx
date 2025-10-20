export const FloatingLogo = () => {
  return (
    <div className="fixed top-6 left-6 z-[1000] flex items-center gap-2">
      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        GAKI
      </span>
      <span className="text-sm text-muted-foreground">がき</span>
    </div>
  );
};

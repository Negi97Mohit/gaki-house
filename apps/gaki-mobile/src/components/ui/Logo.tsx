const Logo = () => {
  return (
    <div className="absolute top-5 right-5 z-30 pointer-events-none animate-fade-in-up">
      <img src="/icon.png" alt="Gaki Studio" className="h-10 w-10 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
    </div>
  );
};

export default Logo;

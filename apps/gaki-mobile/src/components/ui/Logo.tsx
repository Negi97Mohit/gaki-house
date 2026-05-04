import AppLogo from "@gaki/ui/AppLogo";

const Logo = () => {
  return (
    <div className="absolute top-5 right-5 z-30 pointer-events-none animate-fade-in-up drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
      <AppLogo size={40} />
    </div>
  );
};

export default Logo;

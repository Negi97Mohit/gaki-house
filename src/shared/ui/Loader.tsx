import React from "react";

interface LoaderProps {
  visible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ visible }) => {
  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-background transition-all duration-500 ${
        visible ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}
      style={{ zIndex: "var(--z-loader)" }}
    >
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring effect */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "1.5s" }} />
        <div className="absolute w-28 h-28 rounded-full border border-primary/20 animate-pulse" style={{ animationDuration: "2s" }} />
        
        {/* App Logo */}
        <img
          src="/icon.png"
          alt="Loading"
          className="w-16 h-16 object-contain animate-pulse"
          style={{ animationDuration: "1.2s" }}
        />
      </div>
      
      <span className="mt-8 text-sm font-medium tracking-widest uppercase text-muted-foreground animate-pulse">
        Loading
      </span>
    </div>
  );
};

export default Loader;

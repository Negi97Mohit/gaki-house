import React from "react";

interface LoaderProps {
  visible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ visible }) => {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black transition-all duration-700 ${
        visible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      style={{ zIndex: "var(--z-loader)" }}
    >
      <img
        src="./loader.gif" // must be in `public/loader.gif`
        alt="Loading animation"
        className="w-[60vw] max-w-[400px] h-auto object-contain"
      />
    </div>
  );
};

export default Loader;

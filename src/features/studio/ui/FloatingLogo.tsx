import { useNavigate } from "react-router-dom";

export const FloatingLogo = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/platform")}
      className="fixed top-6 left-6 z-[1020] flex items-center gap-2 bg-transparent rounded-full px-4 py-2 cursor-pointer hover:bg-white/5 transition-colors"
    >
      <img src="./icon.png" alt="GAKI logo" className="w-8 h-8 rounded-md" />
      <span className="text-2xl font-semibold tracking-tight text-white">
        GAKI
      </span>
      <span className="text-lg text-white/70"></span>
    </div>
  );
};

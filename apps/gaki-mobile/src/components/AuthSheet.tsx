import { useState } from "react";
import { X, Mail, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
}

const AuthSheet = ({ open, onClose }: AuthSheetProps) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(mode, { email, password });
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 animate-fade-in-up" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 inset-x-0 glass-strong rounded-t-[2rem] shadow-elevated p-5 pb-8 safe-bottom"
        style={{ animation: "fade-in-up 0.35s var(--ease-out-soft) both" }}
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-foreground/20 mb-5" />

        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-2xl">
            {mode === "signin" ? "Welcome back" : "Join Gaki"}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          {mode === "signin"
            ? "Sign in to sync your scenes and destinations."
            : "Create an account to start streaming."}
        </p>

        {/* Social providers */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            className="w-full h-11 rounded-2xl bg-white border border-foreground/15 flex items-center justify-center gap-2.5 font-medium text-sm text-foreground active:scale-[0.99] transition-transform shadow-float"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="w-full h-11 rounded-2xl bg-foreground text-background flex items-center justify-center gap-2.5 font-medium text-sm active:scale-[0.99] transition-transform shadow-float"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-foreground/10" />
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-foreground/40">
            or
          </span>
          <div className="h-px flex-1 bg-foreground/10" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gaki.studio"
              className="w-full h-11 pl-10 pr-3 rounded-2xl bg-foreground/5 border border-foreground/10 text-sm placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 focus:bg-foreground/10 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-11 pl-10 pr-3 rounded-2xl bg-foreground/5 border border-foreground/10 text-sm placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 focus:bg-foreground/10 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-2xl bg-gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-elevated active:scale-[0.99] transition-transform mt-1"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Toggle mode */}
        <div className="text-center mt-4 text-xs text-foreground/60">
          {mode === "signin" ? "New to Gaki? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthSheet;

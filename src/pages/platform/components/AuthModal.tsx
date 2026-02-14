import React, { useState } from "react";
import { X, Mail, Loader2, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cn } from "@/shared/lib/utils";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, createProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalTab === "login";
  const isPasswordValid = PASSWORD_RULES.every((r) => r.test(password));

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isLogin && !isPasswordValid) {
      toast.error("Password doesn't meet requirements");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createProfile(userCredential.user);
        toast.success("Account created successfully!");
      }
      closeAuthModal();
      setEmail("");
      setPassword("");
    } catch (err: any) {
      console.error("Auth error:", err);
      // Map common Firebase auth errors to user-friendly messages
      let message = "Authentication failed. Please try again.";

      if (err.code === "auth/email-already-in-use") message = "This email is already registered.";
      else if (err.code === "auth/invalid-email") message = "Please enter a valid email address.";
      else if (err.code === "auth/weak-password") message = "Password should be at least 6 characters.";
      else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Network error. Please check your connection.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if user profile exists, if not create it
      const docRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await createProfile(result.user);
      }

      toast.success("Signed in with Google!");
      closeAuthModal();
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        console.log("Sign-in cancelled by user");
        // Intentionally do not show a toast for cancellation
      } else {
        console.error("Google sign in error:", err);
        let message = "Google sign-in failed. Please try again.";

        if (err.code === "auth/network-request-failed") {
          message = "Network error. Please check your connection.";
        } else if (err.code === "auth/popup-blocked") {
          message = "Sign-in popup was blocked. Please allow popups.";
        }

        toast.error(message);
      }
    } finally {
      // Ensure loading state is reset so buttons become active again
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Close */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🎬
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {isLogin ? "Welcome back" : "Create Account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin ? "Sign in to access your dashboard" : "Join the community of creators"}
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm font-medium text-foreground hover:bg-accent/40 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground font-medium">OR</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-muted/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "••••••••" : "Min 8 characters"}
                  required
                  className="w-full bg-muted/50 border border-border/40 rounded-xl pl-3 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Validation Rules (Signup Only) */}
            {!isLogin && password.length > 0 && (
              <div className="space-y-1 pt-1 pl-1">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <div
                      key={rule.label}
                      className={cn(
                        "flex items-center gap-1.5 text-[10px] transition-colors",
                        passed ? "text-primary font-medium" : "text-muted-foreground/60"
                      )}
                    >
                      {passed ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-40" />}
                      {rule.label}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && !isPasswordValid)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                openAuthModal(isLogin ? "signup" : "login");
                setEmail("");
                setPassword("");
              }}
              className="text-primary font-medium hover:underline focus:outline-none"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { X, Mail, Loader2, Eye, EyeOff, User, ArrowRight, Lock, AlertCircle } from "lucide-react";
import AppLogo from "@gaki/ui/AppLogo";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db, firebaseConfig } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { cn } from "@gaki/core/lib/utils";

type ModalStep = "auth" | "profile-setup";

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    createProfile,
    needsProfileSetup,
    user,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Profile setup state for new users
  const [step, setStep] = useState<ModalStep>("auth");
  const [pendingUser, setPendingUser] = useState<FirebaseUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-start profile setup when user needs it
  const effectiveStep = needsProfileSetup && user && step === "auth" ? "profile-setup" : step;
  const effectivePendingUser =
    effectiveStep === "profile-setup" && !pendingUser && user ? user : pendingUser;

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (isAuthModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalTab === "login";
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 8;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setStep("auth");
    setPendingUser(null);
    setDisplayName("");
    setUsername("");
  };

  const handleCancelGoogle = () => {
    const electron = (window as any).electron;
    if (electron?.auth?.cancelGoogleOAuth) {
      electron.auth.cancelGoogleOAuth();
    }
    setGoogleLoading(false);
    setLoading(false);
  };

  const handleClose = () => {
    if (googleLoading) {
      handleCancelGoogle();
    }
    resetForm();
    closeAuthModal();
  };

  // Safe outside click handler on backdrop mousedown
  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!isLogin && !isPasswordValid) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
        handleClose();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setPendingUser(userCredential.user);
        setDisplayName(userCredential.user.email?.split("@")[0] || "");
        setUsername(userCredential.user.email?.split("@")[0] || "");
        setStep("profile-setup");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = "Authentication failed. Please verify your details.";

      if (err.code === "auth/email-already-in-use") message = "This email is already registered.";
      else if (err.code === "auth/invalid-email") message = "Please enter a valid email address.";
      else if (err.code === "auth/weak-password") message = "Password should be at least 8 characters.";
      else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        message = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Network error. Please check your connection.";
      } else if (err.code === "auth/unauthorized-domain") {
        message = "This domain is not authorized for sign-in.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setGoogleLoading(true);
    try {
      let signedInUser: FirebaseUser;
      const electron = (window as any).electron;

      if (electron?.auth?.googleOAuth) {
        const result = await electron.auth.googleOAuth(firebaseConfig.apiKey);
        if (!result) {
          setLoading(false);
          setGoogleLoading(false);
          return;
        }

        const credential = GoogleAuthProvider.credential(result.idToken, result.accessToken);
        const userCredential = await signInWithCredential(auth, credential);
        signedInUser = userCredential.user;
      } else {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        signedInUser = result.user;
      }

      const docRef = doc(db, "users", signedInUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setPendingUser(signedInUser);
        setDisplayName(signedInUser.displayName || signedInUser.email?.split("@")[0] || "");
        setUsername(signedInUser.email?.split("@")[0] || "");
        setStep("profile-setup");
      } else {
        toast.success("Signed in with Google!");
        handleClose();
      }
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        // Dismissed by user
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
      setLoading(false);
      setGoogleLoading(false);
    }
  };

  const handleProfileSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const setupUser = effectivePendingUser;
    if (!setupUser) return;

    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setLoading(true);
    try {
      await createProfile(setupUser, {
        display_name: displayName.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""),
        avatar_url: setupUser.photoURL || undefined,
      });
      toast.success("Profile created! Welcome to Gaki! 🎉");
      handleClose();
    } catch (err: any) {
      console.error("Profile creation error:", err);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== STEP 1: PROFILE SETUP =====================
  if (effectiveStep === "profile-setup") {
    return (
      <div
        onMouseDown={handleBackdropMouseDown}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
      >
        <div
          ref={modalRef}
          className={cn(
            "relative w-full max-w-[400px] rounded-lg p-6 sm:p-8 my-auto",
            "bg-white dark:bg-zinc-950",
            "text-zinc-900 dark:text-zinc-100",
            "border border-zinc-200 dark:border-zinc-800",
            "shadow-2xl shadow-zinc-950/20 dark:shadow-black",
            "animate-in zoom-in-95 duration-200"
          )}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Top Bar: Official Gaki App Logo & Clean Sharp Close Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <AppLogo size={26} color="#53cac7" strokeWidth={6} className="shrink-0" />
              <span className="font-bold text-base tracking-tight font-sans text-zinc-900 dark:text-white">
                Gaki
              </span>
            </div>

            <button
              onClick={handleClose}
              className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="w-14 h-14 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-3 overflow-hidden">
              {effectivePendingUser?.photoURL ? (
                <img
                  src={effectivePendingUser.photoURL}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-[#53cac7]" />
              )}
            </div>

            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Complete Profile
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Choose your display name and handle on Gaki.
            </p>
          </div>

          <form onSubmit={handleProfileSetupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                Display Name
              </label>
              <div className="relative flex items-center rounded bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 focus-within:border-[#53cac7] dark:focus-within:border-[#53cac7] focus-within:ring-1 focus-within:ring-[#53cac7]/30 transition-colors">
                <User className="w-4 h-4 ml-3 text-zinc-400 dark:text-zinc-500 shrink-0 pointer-events-none stroke-[1.75]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How others see you"
                  required
                  className="w-full h-10 pl-2.5 pr-3 bg-transparent text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                Username
              </label>
              <div className="relative flex items-center rounded bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 focus-within:border-[#53cac7] dark:focus-within:border-[#53cac7] focus-within:ring-1 focus-within:ring-[#53cac7]/30 transition-colors">
                <span className="ml-3 text-xs text-zinc-400 font-mono select-none">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                  placeholder="your_handle"
                  required
                  className="w-full h-10 pl-2 pr-3 bg-transparent text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !displayName.trim() || !username.trim()}
              className="w-full mt-2 h-10 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===================== STEP 2: MAIN AUTH MODAL (FIXED CONSISTENT HEIGHT) =====================
  return (
    <div
      onMouseDown={handleBackdropMouseDown}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      {/* Modal Card - Fixed consistent width & height across Sign In / Sign Up modes */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-[400px] min-h-[510px] rounded-lg p-6 sm:p-8 my-auto flex flex-col justify-between",
          "bg-white dark:bg-zinc-950",
          "text-zinc-900 dark:text-zinc-100",
          "border border-zinc-200 dark:border-zinc-800",
          "shadow-2xl shadow-zinc-950/20 dark:shadow-black",
          "animate-in zoom-in-95 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div>
          {/* Top Bar: Official Gaki App Logo & Clean Sharp Close Button */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <AppLogo size={26} color="#53cac7" strokeWidth={6} className="shrink-0" />
              <span className="font-bold text-base tracking-tight font-sans text-zinc-900 dark:text-white">
                Gaki
              </span>
            </div>

            <button
              onClick={handleClose}
              className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mb-5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  openAuthModal("login");
                  setEmail("");
                  setPassword("");
                }}
                className={cn(
                  "text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-150",
                  isLogin
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                Sign In
              </button>
              <span className="text-lg font-light text-zinc-300 dark:text-zinc-700">/</span>
              <button
                type="button"
                onClick={() => {
                  openAuthModal("signup");
                  setEmail("");
                  setPassword("");
                }}
                className={cn(
                  "text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-150",
                  !isLogin
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                Sign Up
              </button>
            </div>

            {/* Stable fixed-height description to prevent layout shift */}
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed h-8">
              {isLogin
                ? "Access your studio dashboard, multicasts, and channels."
                : "Create an account to broadcast everywhere and follow streamers."}
            </p>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {/* Email field */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                Email
              </label>
              <div
                className={cn(
                  "relative flex items-center rounded bg-zinc-50/80 dark:bg-zinc-900/80 border transition-colors",
                  !isLogin && email.length > 0 && !isEmailValid
                    ? "border-red-500/80 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/30"
                    : "border-zinc-200 dark:border-zinc-800 focus-within:border-[#53cac7] dark:focus-within:border-[#53cac7] focus-within:ring-1 focus-within:ring-[#53cac7]/30"
                )}
              >
                <Mail className="w-4 h-4 ml-3 text-zinc-400 dark:text-zinc-500 shrink-0 pointer-events-none stroke-[1.75]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full h-10 pl-2.5 pr-3 bg-transparent text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                Password
              </label>
              <div className="relative flex items-center rounded bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 focus-within:border-[#53cac7] dark:focus-within:border-[#53cac7] focus-within:ring-1 focus-within:ring-[#53cac7]/30 transition-colors">
                <Lock className="w-4 h-4 ml-3 text-zinc-400 dark:text-zinc-500 shrink-0 pointer-events-none stroke-[1.75]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "••••••••" : "Min 8 characters"}
                  required
                  className="w-full h-10 pl-2.5 pr-9 bg-transparent text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Stable Helper Area: exactly 18px height in both modes */}
            <div className="h-[18px] flex items-center px-0.5">
              {!isLogin ? (
                <span
                  className={cn(
                    "text-[10px] tracking-wide transition-colors",
                    password.length >= 8
                      ? "text-[#53cac7] font-medium"
                      : "text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {password.length >= 8
                    ? "✓ Password requirement satisfied"
                    : "Password must be at least 8 characters"}
                </span>
              ) : (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tracking-wide">
                  Encrypted session authentication
                </span>
              )}
            </div>

            {/* Sharp Primary Action Button */}
            <button
              type="submit"
              disabled={loading || (!isLogin && (!isPasswordValid || !isEmailValid))}
              className="w-full h-10 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-40"
            >
              {loading && !googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Minimal Sharp Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            <span className="absolute px-2.5 text-[10px] uppercase tracking-widest font-mono text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950">
              or
            </span>
          </div>

          {/* Sharp Modern Google Authentication at the bottom */}
          <button
            type="button"
            onClick={googleLoading ? handleCancelGoogle : handleGoogleSignIn}
            disabled={loading && !googleLoading}
            className="w-full h-10 px-4 rounded text-xs font-medium tracking-wide flex items-center justify-center gap-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-colors active:scale-[0.99] disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{googleLoading ? "Cancel Sign In" : isLogin ? "Sign In with Google" : "Sign Up with Google"}</span>
          </button>
        </div>

        {/* Footer Mode Switcher link */}
        <div className="pt-3 text-center border-t border-zinc-100 dark:border-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                openAuthModal(isLogin ? "signup" : "login");
                setEmail("");
                setPassword("");
              }}
              className="text-zinc-900 dark:text-white hover:text-[#53cac7] dark:hover:text-[#53cac7] font-semibold transition-colors underline-offset-4 hover:underline ml-1"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

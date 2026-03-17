import React, { useState } from "react";
import { X, Mail, Loader2, Eye, EyeOff, Check, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  User as FirebaseUser
} from "firebase/auth";
import { auth, db, firebaseConfig } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { cn } from "@/shared/lib/utils";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

type ModalStep = "auth" | "profile-setup";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, createProfile, needsProfileSetup, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile setup state for new Google users
  const [step, setStep] = useState<ModalStep>("auth");
  const [pendingUser, setPendingUser] = useState<FirebaseUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  // Auto-start profile setup when user needs it (e.g., returning user with no profile)
  const effectiveStep = (needsProfileSetup && user && step === "auth") ? "profile-setup" : step;
  const effectivePendingUser = effectiveStep === "profile-setup" && !pendingUser && user ? user : pendingUser;

  if (!isAuthModalOpen) return null;

  const isLogin = authModalTab === "login";
  const isPasswordValid = PASSWORD_RULES.every((r) => r.test(password));
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordsMatch = password === confirmPassword;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setStep("auth");
    setPendingUser(null);
    setDisplayName("");
    setUsername("");
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
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
      toast.error("Password doesn't meet requirements");
      return;
    }

    if (!isLogin && !passwordsMatch) {
      toast.error("Passwords do not match");
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
        // New email signup — go to profile setup
        setPendingUser(userCredential.user);
        setDisplayName(userCredential.user.email?.split("@")[0] || "");
        setUsername(userCredential.user.email?.split("@")[0] || "");
        setStep("profile-setup");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
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
      } else if (err.code === "auth/unauthorized-domain") {
        message = "This domain is not authorized for sign-in. Please use the desktop app or contact support.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      let signedInUser: FirebaseUser;
      const electron = (window as any).electron;

      if (electron?.auth?.googleOAuth) {
        // Electron: use BrowserWindow-based OAuth flow
        const result = await electron.auth.googleOAuth(firebaseConfig.apiKey);
        if (!result) {
          // User closed the auth window
          console.log("Sign-in cancelled by user");
          setLoading(false);
          return;
        }

        const credential = GoogleAuthProvider.credential(
          result.idToken,
          result.accessToken
        );
        const userCredential = await signInWithCredential(auth, credential);
        signedInUser = userCredential.user;
      } else {
        // Web: use standard popup flow
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        signedInUser = result.user;
      }

      // Check if user profile exists in Firestore
      const docRef = doc(db, "users", signedInUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // New user — show profile setup step
        setPendingUser(signedInUser);
        setDisplayName(signedInUser.displayName || signedInUser.email?.split("@")[0] || "");
        setUsername(signedInUser.email?.split("@")[0] || "");
        setStep("profile-setup");
      } else {
        // Existing user — sign in directly
        toast.success("Signed in with Google!");
        handleClose();
      }
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        console.log("Sign-in cancelled by user");
      } else {
        console.error("Google sign in error:", err);
        let message = "Google sign-in failed. Please try again.";

        if (err.code === "auth/network-request-failed") {
          message = "Network error. Please check your connection.";
        } else if (err.code === "auth/popup-blocked") {
          message = "Sign-in popup was blocked. Please allow popups.";
        } else if (err.code === "auth/unauthorized-domain") {
          message = "This domain is not authorized for sign-in. Please use the desktop app or contact support.";
        }

        toast.error(message);
      }
    } finally {
      setLoading(false);
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
      toast.success("Profile created! Welcome aboard! 🎉");
      handleClose();
    } catch (err: any) {
      console.error("Profile creation error:", err);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Profile Setup Step ----
  if (effectiveStep === "profile-setup") {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 relative">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
                {effectivePendingUser?.photoURL ? (
                  <img src={effectivePendingUser.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Complete Your Profile
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Set up your display name and username to get started
              </p>
            </div>

            <form onSubmit={handleProfileSetupSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How others will see you"
                  required
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="your_username"
                    required
                    className="w-full bg-muted border border-border rounded-xl pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !displayName.trim() || !username.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Complete Setup
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---- Auth Step (Login / Signup) ----
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-3xl shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Subtle top gradient accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 relative">
          {/* Tab Switcher */}
          <div className="flex items-center bg-muted rounded-2xl p-1 mb-7">
            <button
              type="button"
              onClick={() => { openAuthModal("login"); setEmail(""); setPassword(""); setConfirmPassword(""); }}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { openAuthModal("signup"); setEmail(""); setPassword(""); setConfirmPassword(""); }}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                !isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-background border border-border hover:border-border/80 rounded-2xl text-sm font-medium text-foreground hover:bg-muted transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground font-medium tracking-wider uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {/* Email */}
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className={cn(
                    "w-full bg-muted border rounded-2xl pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all",
                    !isLogin && email.length > 0 && !isEmailValid
                      ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
                      : "border-border"
                  )}
                />
              </div>
              {!isLogin && email.length > 0 && !isEmailValid && (
                <p className="text-[11px] text-destructive pl-1">Please enter a valid email address</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Password" : "Password (min 8 chars)"}
                required
                className="w-full bg-muted border border-border rounded-2xl pl-3.5 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    className={cn(
                      "w-full bg-muted border rounded-2xl pl-3.5 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                      confirmPassword.length > 0 && !passwordsMatch
                        ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
                        : confirmPassword.length > 0 && passwordsMatch
                        ? "border-primary focus:ring-primary/40 focus:border-primary"
                        : "border-border focus:ring-primary/40 focus:border-primary/60"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      {passwordsMatch
                        ? <Check className="w-4 h-4 text-primary" />
                        : <X className="w-4 h-4 text-destructive" />
                      }
                    </div>
                  )}
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-[11px] text-destructive pl-1">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Password Validation Rules (Signup Only) */}
            {!isLogin && password.length > 0 && (
              <div className="grid grid-cols-2 gap-1 pt-0.5 pl-0.5">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <div
                      key={rule.label}
                      className={cn(
                        "flex items-center gap-1.5 text-[10px] transition-colors",
                        passed ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {passed ? <Check className="w-3 h-3 shrink-0" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50 shrink-0" />}
                      {rule.label}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && (!isPasswordValid || !passwordsMatch || !isEmailValid))}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

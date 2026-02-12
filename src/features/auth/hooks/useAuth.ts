import { useState, useEffect } from "react";
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in successfully with Google!");
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success("Signed out successfully");
      setUser(null);
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return {
    user,
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    googleSignIn,
    signOut
  };
};

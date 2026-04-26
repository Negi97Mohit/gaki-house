import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDefaultAvatar } from "../components/DefaultAvatar";

import { UserProfile } from "@caption-cam/core/types/profile";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  needsProfileSetup: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "signup";
  openAuthModal: (tab?: "login" | "signup") => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createProfile: (user: User, additionalData?: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");

  const fetchProfile = async (uid: string): Promise<boolean> => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
        return true;
      } else {
        setUserProfile(null);
        return false;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      return false;
    }
  };

  const createProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    try {
      const newUserProfile: UserProfile = {
        id: user.uid,
        email: user.email || "",
        created_at: new Date().toISOString(),
        username: user.email?.split("@")[0] || "user",
        display_name: user.displayName || user.email?.split("@")[0] || "User",
        avatar_url: user.photoURL || getDefaultAvatar(user.uid),
        ...additionalData
      };

      await setDoc(doc(db, "users", user.uid), newUserProfile, { merge: true });
      setUserProfile(newUserProfile);
      setNeedsProfileSetup(false);
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const hasUserProfile = await fetchProfile(currentUser.uid);
        if (!hasUserProfile) {
          // User is signed in but has no profile — prompt for setup
          setNeedsProfileSetup(true);
          setAuthModalTab("signup");
          setIsAuthModalOpen(true);
        } else {
          setNeedsProfileSetup(false);
        }
      } else {
        setUserProfile(null);
        setNeedsProfileSetup(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (tab: "login" | "signup" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setNeedsProfileSetup(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        needsProfileSetup,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        signOut,
        refreshProfile,
        createProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

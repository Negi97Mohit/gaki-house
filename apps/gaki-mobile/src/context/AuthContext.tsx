import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { UserProfile } from "@gaki/core/types/profile";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  needsProfileSetup: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createProfile: (user: User, additionalData?: Partial<UserProfile>) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

/** Generates a deterministic default avatar URL from a user ID. */
const getDefaultAvatar = (uid: string) =>
  `https://api.dicebear.com/7.x/thumbs/svg?seed=${uid}`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

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

  const createProfile = async (
    firebaseUser: User,
    additionalData: Partial<UserProfile> = {}
  ) => {
    try {
      const newUserProfile: UserProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        created_at: new Date().toISOString(),
        username: firebaseUser.email?.split("@")[0] || "user",
        display_name:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "User",
        avatar_url:
          firebaseUser.photoURL || getDefaultAvatar(firebaseUser.uid),
        ...additionalData,
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUserProfile, {
        merge: true,
      });
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
          // User is signed in but has no Firestore profile — auto-create one
          await createProfile(currentUser);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    try {
      await setDoc(doc(db, "users", user.uid), data, { merge: true });
      setUserProfile({ ...profile, ...data });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        needsProfileSetup,
        signOut,
        refreshProfile,
        createProfile,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

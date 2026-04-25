import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface Profile {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  needsProfileSetup: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createProfile: (user: User, additionalData?: Partial<Profile>) => Promise<void>;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  const fetchProfile = async (uid: string): Promise<boolean> => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as Profile);
        return true;
      } else {
        setProfile(null);
        return false;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      return false;
    }
  };

  const createProfile = async (
    firebaseUser: User,
    additionalData: Partial<Profile> = {}
  ) => {
    try {
      const newProfile: Profile = {
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

      await setDoc(doc(db, "users", firebaseUser.uid), newProfile, {
        merge: true,
      });
      setProfile(newProfile);
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
        const hasProfile = await fetchProfile(currentUser.uid);
        if (!hasProfile) {
          // User is signed in but has no Firestore profile — auto-create one
          await createProfile(currentUser);
        } else {
          setNeedsProfileSetup(false);
        }
      } else {
        setProfile(null);
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
      setProfile(null);
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
        signOut,
        refreshProfile,
        createProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

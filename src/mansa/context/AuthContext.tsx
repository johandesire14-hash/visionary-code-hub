// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  FirebaseUser,
  firebaseConfigured,
} from "../services/firebase";
import { syncUserProfile, FirestoreUserProfile } from "../services/dbService";

export type AppUser = Pick<FirebaseUser, "uid" | "email" | "displayName" | "photoURL">;

interface AuthContextType {
  user: AppUser | null;
  profile: FirestoreUserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<FirestoreUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!firebaseConfigured || !auth) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    // Failsafe timeout: in cross-origin iframes or restricted environments, Firebase Auth
    // can take time to resolve IndexedDB locks. Never block the user for more than 1200ms.
    const failsafeTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 1200);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(failsafeTimer);
      if (!isMounted) return;

      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userProfile = await syncUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          if (isMounted) setProfile(userProfile);
        } catch (err) {
          console.error("Error syncing profile with Firestore:", err);
          const initials =
            (firebaseUser.displayName
              ? firebaseUser.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : firebaseUser.email?.slice(0, 2).toUpperCase()) || "MA";

          if (isMounted) {
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName:
                firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Créateur",
              avatarInitials: initials,
              photoURL: firebaseUser.photoURL || undefined,
              country: "Côte d'Ivoire",
              currency: "XOF",
            });
          }
        }
        if (isMounted) setLoading(false);
      } else {
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(failsafeTimer);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const userProfile = await syncUserProfile({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
        });
        setProfile(userProfile);
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      let msg = "Échec de la connexion Google.";
      if (err.code === "auth/popup-closed-by-user") {
        msg = "Connexion annulée par l'utilisateur.";
      } else if (err.code === "auth/unauthorized-domain") {
        msg = "Domaine non autorisé dans la console Firebase.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        const userProfile = await syncUserProfile({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
        });
        setProfile(userProfile);
      }
    } catch (err: any) {
      console.error("Email Sign-In Error:", err);
      let msg = "Adresse email ou mot de passe incorrect.";
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        msg = "Identifiants invalides. Vérifiez votre email et mot de passe.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Trop de tentatives échouées. Veuillez patienter un moment.";
      }
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        const userProfile = await syncUserProfile({
          uid: res.user.uid,
          email: res.user.email,
          displayName: name || res.user.email?.split("@")[0] || "Nouveau Créateur",
          photoURL: res.user.photoURL,
        });
        setProfile(userProfile);
      }
    } catch (err: any) {
      console.error("Sign-Up Error:", err);
      let msg = "Erreur lors de la création du compte.";
      if (err.code === "auth/email-already-in-use") {
        msg = "Cette adresse email est déjà associée à un compte.";
      } else if (err.code === "auth/weak-password") {
        msg = "Le mot de passe doit contenir au moins 6 caractères.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Format d'adresse email invalide.";
      }
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError("Impossible d'envoyer l'email de réinitialisation.");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null);
      setProfile(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

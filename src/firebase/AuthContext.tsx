import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { auth } from './config';
import { FirestoreSyncService } from './firestoreService';
import { BuffrStorage } from '../storage/db';

const WEB_CLIENT_ID = '424855018399-gi05u4b1toh9ooanb6ujd2nea8jj9hci.apps.googleusercontent.com';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  isCloudSynced: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage: string | null;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signInAsGuest: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth State Changed:', user ? `User: ${user.email || user.uid}` : 'Signed Out');
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        setSyncStatus('syncing');
        // Update user profile if needed
        const currentProfile = BuffrStorage.getUser();
        if (user.displayName && (!currentProfile.name || currentProfile.name === 'Player 1' || currentProfile.name === 'Hero')) {
          BuffrStorage.saveUser({
            ...currentProfile,
            name: user.displayName,
            avatarEmoji: currentProfile.avatarEmoji || '🎮',
          });
        }

        const success = await FirestoreSyncService.pushAllToCloud(user.uid);
        setSyncStatus(success ? 'synced' : 'error');
      } else {
        setSyncStatus('idle');
      }
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setErrorMessage(null);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    const msg = err?.message || '';

    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Incorrect password. Please try again.';
    }
    if (code === 'auth/user-not-found') {
      return 'No hero found with this email. Tap "CREATE ACCOUNT" below.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account already exists with this email. Tap "SIGN IN".';
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 6 characters long.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (msg.includes('No credentials available') || msg.includes('16') || msg.includes('10')) {
      return 'Google Sign-In needs Google Play credentials or SHA-1 match. You can sign in instantly using Email/Password or 1-Tap Guest Sync!';
    }
    return msg || 'Authentication failed. Please check your credentials.';
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setErrorMessage(null);

      if (Capacitor.isNativePlatform()) {
        // 1. Native Google Sign-In via Capacitor Plugin (uses default_web_client_id from strings.xml)
        console.log('Starting Native Google Sign-In...');
        const result = await FirebaseAuthentication.signInWithGoogle();

        if (result.user && result.credential?.idToken) {
          console.log('Native Sign-In Successful, linking to Firebase JS SDK...');
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          await signInWithCredential(auth, credential);
          console.log('JS SDK Linked Successfully');
          return { success: true };
        } else {
          throw new Error('No ID token returned from Google Play Services.');
        }
      } else {
        // Web Fallback
        const { signInWithPopup, GoogleAuthProvider: WebGoogleAuthProvider } = await import('firebase/auth');
        const googleProvider = new WebGoogleAuthProvider();
        await signInWithPopup(auth, googleProvider);
        return { success: true };
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const formatted = formatAuthError(err);
      setErrorMessage(formatted);
      setSyncStatus('error');
      return { success: false, error: formatted };
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true };
    } catch (err: any) {
      console.error('Email Sign-In Error:', err);
      const formatted = formatAuthError(err);
      setErrorMessage(formatted);
      setSyncStatus('error');
      return { success: false, error: formatted };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name && userCred.user) {
        await updateProfile(userCred.user, { displayName: name.trim() });
      }
      return { success: true };
    } catch (err: any) {
      console.error('Email Sign-Up Error:', err);
      const formatted = formatAuthError(err);
      setErrorMessage(formatted);
      setSyncStatus('error');
      return { success: false, error: formatted };
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await signInAnonymously(auth);
      return { success: true };
    } catch (err: any) {
      console.error('Guest Sign-In Error:', err);
      const formatted = formatAuthError(err);
      setErrorMessage(formatted);
      setSyncStatus('error');
      return { success: false, error: formatted };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          await FirebaseAuthentication.signOut();
        } catch (e) {
          console.warn('Native signOut skipped:', e);
        }
      }
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setSyncStatus('idle');
      setErrorMessage(null);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const syncNow = async () => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    const success = await FirestoreSyncService.pushAllToCloud(currentUser.uid);
    setSyncStatus(success ? 'synced' : 'error');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isCloudSynced: !!currentUser,
        syncStatus,
        errorMessage,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOut,
        syncNow,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { auth } from './config';
import { FirestoreSyncService } from './firestoreService';
import { BuffrStorage } from '../storage/db';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  isCloudSynced: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage: string | null;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
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
      console.log('Auth State Changed:', user ? `User: ${user.email || user.displayName || user.uid}` : 'Signed Out');
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
    const msg = err?.message || String(err);

    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      msg.includes('canceled') ||
      msg.includes('Canceled') ||
      msg.includes('cancelled') ||
      msg.includes('12501') // Google Sign-In user cancelled code
    ) {
      return 'Sign-in cancelled.';
    }

    if (code === 'auth/network-request-failed' || msg.includes('network') || msg.includes('NETWORK')) {
      return 'Network connection issue. Please check your internet connection.';
    }

    if (msg.includes('10:') || msg.includes('DEVELOPER_ERROR')) {
      return 'Google Sign-In configuration check: Please confirm the app SHA-1 fingerprint matches your Firebase project.';
    }

    return msg || 'Google Sign-In failed. Please try again.';
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setErrorMessage(null);

      if (Capacitor.isNativePlatform()) {
        console.log('Starting Native Google Sign-In via @capacitor-firebase/authentication...');
        let result: any = null;

        try {
          // Attempt 1: Standard Credential Manager / Android 14+ flow
          result = await FirebaseAuthentication.signInWithGoogle();
        } catch (nativeErr: any) {
          console.warn('Primary CredentialManager attempt failed, falling back to legacy GoogleSignIn intent:', nativeErr);
          // Attempt 2: Legacy Google Play Services Intent flow
          result = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });
        }

        if (result?.credential?.idToken) {
          console.log('Google ID token obtained, authenticating Firebase JS SDK session...');
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          await signInWithCredential(auth, credential);
          return { success: true };
        } else if (result?.user) {
          console.log('Native user authenticated:', result.user.email);
          return { success: true };
        } else {
          throw new Error('No credential token received from Google Play Services.');
        }
      } else {
        // Web / Browser Preview fallback
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


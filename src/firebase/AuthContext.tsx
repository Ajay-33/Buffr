import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth State Changed:', user ? `User: ${user.email}` : 'Signed Out');
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

  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      if (Capacitor.isNativePlatform()) {
        // 1. Native Google Sign-In via Capacitor Plugin
        console.log('Starting Native Google Sign-In...');
        const result = await FirebaseAuthentication.signInWithGoogle();

        if (result.user && result.credential?.idToken) {
          console.log('Native Sign-In Successful, linking to Firebase JS SDK...');
          // 2. Create Firebase Credential from the Native ID Token
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          // 3. Sign in to the JS SDK manually to trigger onAuthStateChanged
          await signInWithCredential(auth, credential);
          console.log('JS SDK Linked Successfully');
        } else {
          throw new Error('No user or ID token returned from native sign-in');
        }
      } else {
        // Web Fallback (handled by standard Firebase JS SDK)
        const { signInWithPopup, GoogleAuthProvider: WebGoogleAuthProvider } = await import('firebase/auth');
        const googleProvider = new WebGoogleAuthProvider();
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setSyncStatus('error');
      // On mobile, native errors can be cryptic, so let's log the full object
      if (Capacitor.isNativePlatform()) {
        alert('Sign-In Failed: ' + (err.message || 'Unknown Error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await FirebaseAuthentication.signOut();
      }
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setSyncStatus('idle');
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
        signInWithGoogle,
        signOut,
        syncNow,
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

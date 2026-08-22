import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import { FirestoreSyncService } from './firestoreService';
import { BuffrStorage } from '../storage/db';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isCloudSynced: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        setSyncStatus('syncing');
        // Push initial local data to cloud if new or sync down
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
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setSyncStatus('syncing');
        // Update user profile with Google display name if available
        const currentProfile = BuffrStorage.getUser();
        if (result.user.displayName && (!currentProfile.name || currentProfile.name === 'Player 1' || currentProfile.name === 'Hero')) {
          BuffrStorage.saveUser({
            ...currentProfile,
            name: result.user.displayName,
            avatarEmoji: currentProfile.avatarEmoji || '🎮',
          });
        }
        await FirestoreSyncService.pushAllToCloud(result.user.uid);
        setSyncStatus('synced');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
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

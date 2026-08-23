import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';
import {
  Habit,
  HabitCompletion,
  UserProfile,
  DailyReflection,
  XPTransaction,
  Quest,
  Challenge,
  Achievement,
} from '../types';
import { BuffrStorage } from '../storage/db';

export interface CloudSyncPayload {
  user: UserProfile;
  habits: Habit[];
  completions: HabitCompletion[];
  reflections: DailyReflection[];
  xpTransactions: XPTransaction[];
  quests?: Quest[];
  challenges?: Challenge[];
  achievements?: Achievement[];
}

export class FirestoreSyncService {
  // Sync full local dataset to cloud
  public static async pushAllToCloud(userId: string): Promise<boolean> {
    try {
      const user = BuffrStorage.getUser();
      const habits = BuffrStorage.getHabits();
      const completions = BuffrStorage.getCompletions();
      const reflections = BuffrStorage.getReflections();
      const xpTransactions = BuffrStorage.getXpTransactions();

      // Save user doc
      const userDocRef = doc(db, 'users', userId);
      await setDoc(
        userDocRef,
        {
          ...user,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Save habits
      for (const habit of habits) {
        const habitRef = doc(db, 'users', userId, 'habits', habit.id);
        await setDoc(habitRef, habit, { merge: true });
      }

      // Save completions
      for (const comp of completions) {
        const compRef = doc(db, 'users', userId, 'completions', `${comp.habitId}_${comp.dateStr}`);
        await setDoc(compRef, comp, { merge: true });
      }

      // Save reflections
      for (const ref of reflections) {
        const refDoc = doc(db, 'users', userId, 'reflections', ref.dateStr);
        await setDoc(refDoc, ref, { merge: true });
      }

      return true;
    } catch (error) {
      console.error('Failed to push to Cloud Firestore:', error);
      return false;
    }
  }

  // Push individual habit
  public static async saveHabit(userId: string, habit: Habit): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'habits', habit.id);
      await setDoc(ref, habit, { merge: true });
    } catch (err) {
      console.warn('Firestore saveHabit failed:', err);
    }
  }

  // Delete habit
  public static async deleteHabit(userId: string, habitId: string): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'habits', habitId);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore deleteHabit failed:', err);
    }
  }

  // Push individual completion
  public static async saveCompletion(userId: string, comp: HabitCompletion): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'completions', `${comp.habitId}_${comp.dateStr}`);
      await setDoc(ref, comp, { merge: true });
    } catch (err) {
      console.warn('Firestore saveCompletion failed:', err);
    }
  }

  // Push user profile
  public static async saveUser(userId: string, user: UserProfile): Promise<void> {
    try {
      const ref = doc(db, 'users', userId);
      await setDoc(ref, { ...user, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveUser failed:', err);
    }
  }

  // Push daily reflection
  public static async saveReflection(userId: string, reflection: DailyReflection): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'reflections', reflection.dateStr);
      await setDoc(ref, reflection, { merge: true });
    } catch (err) {
      console.warn('Firestore saveReflection failed:', err);
    }
  }

  // Push XP transaction
  public static async saveXPTransaction(userId: string, tx: XPTransaction): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'xp_transactions', tx.id);
      await setDoc(ref, tx, { merge: true });
    } catch (err) {
      console.warn('Firestore saveXPTransaction failed:', err);
    }
  }

  // Push routine chain
  public static async saveRoutineChain(userId: string, chain: any): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'routine_chains', chain.id);
      await setDoc(ref, chain, { merge: true });
    } catch (err) {
      console.warn('Firestore saveRoutineChain failed:', err);
    }
  }

  // Delete routine chain
  public static async deleteRoutineChain(userId: string, chainId: string): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'routine_chains', chainId);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore deleteRoutineChain failed:', err);
    }
  }

  // Subscribe to real-time changes
  public static subscribeToUserData(
    userId: string,
    onDataUpdated: (data: {
      user?: UserProfile;
      habits?: Habit[];
      completions?: HabitCompletion[];
      reflections?: DailyReflection[];
      routineChains?: any[];
    }) => void
  ): () => void {
    const unsubscribes: (() => void)[] = [];

    try {
      // 1. User doc
      const userDocRef = doc(db, 'users', userId);
      const unsubUser = onSnapshot(
        userDocRef,
        (snap) => {
          if (snap.exists()) {
            const userData = snap.data() as UserProfile;
            onDataUpdated({ user: userData });
          }
        },
        (err) => {
          console.warn('User snapshot subscription note:', err?.message || err);
        }
      );
      unsubscribes.push(unsubUser);

      // 2. Habits collection
      const habitsCol = collection(db, 'users', userId, 'habits');
      const unsubHabits = onSnapshot(
        habitsCol,
        (snap) => {
          const habitsList: Habit[] = [];
          snap.forEach((d) => habitsList.push(d.data() as Habit));
          if (habitsList.length > 0) {
            onDataUpdated({ habits: habitsList });
          }
        },
        (err) => {
          console.warn('Habits snapshot subscription note:', err?.message || err);
        }
      );
      unsubscribes.push(unsubHabits);

      // 3. Completions collection
      const compsCol = collection(db, 'users', userId, 'completions');
      const unsubComps = onSnapshot(
        compsCol,
        (snap) => {
          const compsList: HabitCompletion[] = [];
          snap.forEach((d) => compsList.push(d.data() as HabitCompletion));
          if (compsList.length > 0) {
            onDataUpdated({ completions: compsList });
          }
        },
        (err) => {
          console.warn('Completions snapshot subscription note:', err?.message || err);
        }
      );
      unsubscribes.push(unsubComps);

      // 4. Reflections collection
      const refsCol = collection(db, 'users', userId, 'reflections');
      const unsubRefs = onSnapshot(
        refsCol,
        (snap) => {
          const refsList: DailyReflection[] = [];
          snap.forEach((d) => refsList.push(d.data() as DailyReflection));
          if (refsList.length > 0) {
            onDataUpdated({ reflections: refsList });
          }
        },
        (err) => {
          console.warn('Reflections snapshot subscription note:', err?.message || err);
        }
      );
      unsubscribes.push(unsubRefs);

      // 5. Routine Chains collection
      const chainsCol = collection(db, 'users', userId, 'routine_chains');
      const unsubChains = onSnapshot(
        chainsCol,
        (snap) => {
          const chainsList: any[] = [];
          snap.forEach((d) => chainsList.push(d.data()));
          if (chainsList.length > 0) {
            onDataUpdated({ routineChains: chainsList });
          }
        },
        (err) => {
          console.warn('Chains snapshot subscription note:', err?.message || err);
        }
      );
      unsubscribes.push(unsubChains);
    } catch (err) {
      console.warn('Subscription setup error:', err);
    }

    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch (e) {
          // ignore
        }
      });
    };
  }
}

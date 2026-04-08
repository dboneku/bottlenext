import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  createOrUpdateUserProfile,
  saveModuleData,
  getAllModules,
} from '../lib/firestore';

// Fallback localStorage keys (used only for anonymous/pending state)
const LS_PENDING = 'ag_pending_modules';

export function useCompanyData() {
  const [user, setUser] = useState(null);               // Firebase user object
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [modules, setModules] = useState({});            // { moduleId: { status, data, completedAt } }
  const [loading, setLoading] = useState(false);

  // ── Bootstrap: subscribe to Firebase Auth ──────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoggedIn(true);

        // Load all module data from Firestore
        setLoading(true);
        const remoteModules = await getAllModules(firebaseUser.uid);
        setModules(remoteModules);
        setLoading(false);

        // If there was pending (pre-auth) module data, migrate it to Firestore
        const pendingRaw = localStorage.getItem(LS_PENDING);
        if (pendingRaw) {
          try {
            const pending = JSON.parse(pendingRaw);
            for (const [moduleId, answers] of Object.entries(pending)) {
              await saveModuleData(firebaseUser.uid, moduleId, answers);
              remoteModules[moduleId] = { status: 'complete', data: answers };
            }
            setModules({ ...remoteModules });
            localStorage.removeItem(LS_PENDING);
          } catch (e) {
            console.error('Failed to migrate pending module data', e);
          }
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setModules({});
      }
      setIsReady(true);
    });

    return () => unsub();
  }, []);

  // ── Complete a module ──────────────────────────────────────────────────────
  const completeModule = useCallback(async (moduleId, answers) => {
    if (!user) {
      // User not signed in — stash in localStorage pending, update local state
      const pending = JSON.parse(localStorage.getItem(LS_PENDING) || '{}');
      pending[moduleId] = answers;
      localStorage.setItem(LS_PENDING, JSON.stringify(pending));
      setModules(prev => ({
        ...prev,
        [moduleId]: { status: 'complete', data: answers, completedAt: new Date().toISOString() }
      }));
      return;
    }

    // Optimistic update
    setModules(prev => ({
      ...prev,
      [moduleId]: { status: 'complete', data: answers, completedAt: new Date().toISOString() }
    }));

    // Persist to Firestore
    try {
      await saveModuleData(user.uid, moduleId, answers);
    } catch (e) {
      console.error('Failed to save module to Firestore', e);
    }
  }, [user]);

  // ── After auth, store user profile ────────────────────────────────────────
  const syncProfile = useCallback(async (firebaseUser, name) => {
    try {
      await createOrUpdateUserProfile(firebaseUser.uid, {
        name: name || firebaseUser.displayName || '',
        email: firebaseUser.email,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to sync user profile', e);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await auth.signOut();
    setModules({});
  }, []);

  const completedIds = Object.entries(modules)
    .filter(([, v]) => v?.status === 'complete')
    .map(([k]) => k);

  return {
    user,
    modules,
    isLoggedIn,
    isReady,
    loading,
    completedIds,
    completeModule,
    syncProfile,
    logout,
  };
}

/**
 * Firestore data layer
 *
 * Schema:
 *   users/{uid}                  → profile: { name, email, createdAt }
 *   users/{uid}/modules/{modId}  → { status, data, completedAt }
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ── User profile ──────────────────────────────────────────────────────────────

export async function createOrUpdateUserProfile(uid, profile) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    ...profile,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ── Modules ───────────────────────────────────────────────────────────────────

export async function saveModuleData(uid, moduleId, answers) {
  const ref = doc(db, 'users', uid, 'modules', moduleId);
  await setDoc(ref, {
    status: 'complete',
    data: answers,
    completedAt: serverTimestamp(),
  });
}

export async function getAllModules(uid) {
  const colRef = collection(db, 'users', uid, 'modules');
  const snap = await getDocs(colRef);
  const result = {};
  snap.forEach(d => {
    result[d.id] = d.data();
  });
  return result;
}

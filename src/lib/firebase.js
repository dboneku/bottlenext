import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDO46kJa08vwRJU8O8UEMnzNKGHgBKb-dk",
  authDomain: "ag-business-architect.firebaseapp.com",
  projectId: "ag-business-architect",
  storageBucket: "ag-business-architect.firebasestorage.app",
  messagingSenderId: "874419494166",
  appId: "1:874419494166:web:29c84d5ef01ccf0e874437",
  measurementId: "G-7ZE65WPFTY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics only runs in browser (not SSR)
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

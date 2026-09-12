import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth as getAuthClient, Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

let app: FirebaseApp | null = null;
let authClient: Auth | null = null;
let dbClient: Firestore | null = null;
let analyticsClient: Analytics | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!app) {
    const apiKey = (import.meta as any).env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      console.warn("Firebase API key missing. Firebase features will be disabled.");
      return null;
    }
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
      measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID,
    };
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase init error:", e);
      return null;
    }
  }
  return app;
}

export const getAuth = () => {
  if (!authClient) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) authClient = getAuthClient(firebaseApp);
  }
  return authClient;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const auth = getAuth();
  if (!auth) throw new Error("Auth not initialized");
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email: string, password: string) => {
  const auth = getAuth();
  if (!auth) throw new Error("Auth not initialized");
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  const auth = getAuth();
  if (!auth) throw new Error("Auth not initialized");
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInAsGuest = async () => {
  const auth = getAuth();
  if (!auth) throw new Error("Auth not initialized");
  return signInAnonymously(auth);
};

export const getDb = () => {
  if (!dbClient) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) dbClient = getFirestore(firebaseApp);
  }
  return dbClient;
}

export const getAnalyticsInstance = () => {
  if (!analyticsClient) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) analyticsClient = getAnalytics(firebaseApp);
  }
  return analyticsClient;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = getAuth();
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

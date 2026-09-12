import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth as getAuthClient, 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

export interface WorkspaceUser {
  uid: string;
  email: string | null;
  displayName: string;
  isAnonymous: boolean;
  emailVerified?: boolean;
}

let app: FirebaseApp | null = null;
let authClient: Auth | null = null;
let dbClient: Firestore | null = null;
let analyticsClient: Analytics | null = null;

// Local offline/workspace auth subscriber callbacks
const localAuthListeners: Array<(user: WorkspaceUser | null) => void> = [];

function notifyLocalAuthSubscribers(user: WorkspaceUser | null) {
  localAuthListeners.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.error("Local auth callback error:", e);
    }
  });
}

export function isFirebaseConfigured(): boolean {
  const apiKey = (import.meta as any).env.VITE_FIREBASE_API_KEY;
  return !!apiKey && apiKey.trim() !== "";
}

function getFirebaseApp(): FirebaseApp | null {
  if (!app) {
    const apiKey = (import.meta as any).env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
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

// Returns the active user from localStorage if running in local workspace mode
export function getStoredLocalUser(): WorkspaceUser | null {
  try {
    const raw = localStorage.getItem("bugsense_current_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const signUpWithEmail = async (email: string, password: string): Promise<{ user: any }> => {
  const auth = getAuth();
  if (auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { user: cred.user };
  }

  // Local workspace account registration
  const storedUsersRaw = localStorage.getItem("bugsense_registered_users");
  const users: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
  
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("auth/email-already-in-use");
  }

  const newUser: WorkspaceUser = {
    uid: "usr-" + Math.random().toString(36).substring(2, 9),
    email,
    displayName: email.split("@")[0],
    isAnonymous: false,
    emailVerified: true
  };

  users.push({ ...newUser, password });
  localStorage.setItem("bugsense_registered_users", JSON.stringify(users));
  localStorage.setItem("bugsense_current_user", JSON.stringify(newUser));
  notifyLocalAuthSubscribers(newUser);
  return { user: newUser };
};

export const signInWithEmail = async (email: string, password: string): Promise<{ user: any }> => {
  const auth = getAuth();
  if (auth) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user };
  }

  // Local workspace credentials check
  const storedUsersRaw = localStorage.getItem("bugsense_registered_users");
  const users: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!found) {
    throw new Error("auth/user-not-found");
  }
  if (found.password !== password) {
    throw new Error("auth/wrong-password");
  }

  const user: WorkspaceUser = {
    uid: found.uid,
    email: found.email,
    displayName: found.displayName || found.email.split("@")[0],
    isAnonymous: false,
    emailVerified: true
  };

  localStorage.setItem("bugsense_current_user", JSON.stringify(user));
  notifyLocalAuthSubscribers(user);
  return { user };
};

export const signInWithGoogle = async (): Promise<{ user: any }> => {
  const auth = getAuth();
  if (auth) {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return { user: cred.user };
  }

  // Local workspace Google Dev Profile
  const googleUser: WorkspaceUser = {
    uid: "google-" + Math.random().toString(36).substring(2, 9),
    email: "developer@workspace.google",
    displayName: "Google Developer",
    isAnonymous: false,
    emailVerified: true
  };

  localStorage.setItem("bugsense_current_user", JSON.stringify(googleUser));
  notifyLocalAuthSubscribers(googleUser);
  return { user: googleUser };
};

export const signInAsGuest = async (): Promise<{ user: any }> => {
  const auth = getAuth();
  if (auth) {
    const cred = await signInAnonymously(auth);
    return { user: cred.user };
  }

  // Local workspace Guest Dev Profile
  const guestUser: WorkspaceUser = {
    uid: "guest-" + Math.random().toString(36).substring(2, 9),
    email: null,
    displayName: "Guest Dev",
    isAnonymous: true,
  };

  localStorage.setItem("bugsense_current_user", JSON.stringify(guestUser));
  notifyLocalAuthSubscribers(guestUser);
  return { user: guestUser };
};

export const logoutUser = async (): Promise<void> => {
  const auth = getAuth();
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase sign out warning:", e);
    }
  }
  localStorage.removeItem("bugsense_current_user");
  notifyLocalAuthSubscribers(null);
};

export function subscribeAuth(callback: (user: any) => void): () => void {
  const auth = getAuth();
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }

  // Local workspace mode: register listener and notify with current local user immediately
  localAuthListeners.push(callback);
  const current = getStoredLocalUser();
  // Notify with stored user, or null if not signed in
  callback(current ?? null);

  return () => {
    const idx = localAuthListeners.indexOf(callback);
    if (idx !== -1) localAuthListeners.splice(idx, 1);
  };
}

export const getDb = () => {
  if (!dbClient) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) dbClient = getFirestore(firebaseApp);
  }
  return dbClient;
};

export const getAnalyticsInstance = () => {
  if (!analyticsClient) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) analyticsClient = getAnalytics(firebaseApp);
  }
  return analyticsClient;
};

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
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

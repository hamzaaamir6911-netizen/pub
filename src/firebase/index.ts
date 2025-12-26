
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This object will hold the initialized Firebase services.
let firebaseInstance: { app: FirebaseApp; auth: Auth; firestore: Firestore; } | null = null;

// This function initializes and returns the Firebase services,
// ensuring it only happens once.
export function initializeFirebase() {
  if (firebaseInstance) {
    return firebaseInstance;
  }

  let app: FirebaseApp;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app);
  
  firebaseInstance = { app, auth, firestore };
  return firebaseInstance;
}

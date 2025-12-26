
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      try {
        firebaseApp = initializeApp(firebaseConfig);
      } catch (e) {
        console.error("Error initializing Firebase App", e);
        throw e;
      }
    } else {
      firebaseApp = getApp();
    }
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    return { app: firebaseApp, auth, db };
  }
  // This is a placeholder for server-side rendering, though our app is client-side focused.
  return { app: null, auth: null, db: null } as any;
}

export { initializeFirebase };

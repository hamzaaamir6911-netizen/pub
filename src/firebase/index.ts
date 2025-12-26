
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;

// This function guarantees a single initialization of Firebase services.
function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      // Initialize a new app if one doesn't exist.
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      // Get the existing app.
      firebaseApp = getApp();
    }
    // Get auth and firestore instances from the initialized app.
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    return { app: firebaseApp, auth, db };
  }
  
  // Return null or a mock for server-side rendering, though our app is client-focused.
  // This part of the code won't be reached in the browser.
  return { app: null as any, auth: null as any, db: null as any };
}

export { initializeFirebase };

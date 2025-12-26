
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
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    return { app: firebaseApp, auth, db };
  }
  
  // This part of the code won't be reached in the browser, but it's good practice
  // to handle the server-side case, even though our app is client-focused.
  // We return null or mock objects here.
  return { app: null as any, auth: null as any, db: null as any };
}

export { initializeFirebase };

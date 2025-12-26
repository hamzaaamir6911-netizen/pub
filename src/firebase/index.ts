
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This function ensures Firebase is initialized only once.
function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const app = initializeFirebaseApp();
const auth = getAuth(app);
const db = getFirestore(app);

// This function is what the rest of the app will use.
// It consistently returns the initialized services.
function getFirebaseInstances() {
    return { app, auth, db };
}

export { getFirebaseInstances as initializeFirebase };

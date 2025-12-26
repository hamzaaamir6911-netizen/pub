
'use client';

import { ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './firebase-provider';

// Initialize Firebase on the client
const firebaseInstance = initializeFirebase();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // The 'value' prop of FirebaseProvider expects { app, auth, firestore }
  // which is exactly what initializeFirebase now returns.
  return <FirebaseProvider value={firebaseInstance}>{children}</FirebaseProvider>;
}


'use client';

import { ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './firebase-provider';

// Initialize Firebase on the client
const firebaseInstance = initializeFirebase();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return <FirebaseProvider value={firebaseInstance}>{children}</FirebaseProvider>;
}

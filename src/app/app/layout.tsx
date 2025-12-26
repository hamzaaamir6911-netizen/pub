
"use client";

import { AppHeader } from "@/components/app-header";
import { AuthProvider, useAuth } from "@/firebase/auth/auth-provider";
import { DataProvider } from "@/firebase/data/data-provider";
import { FirebaseProvider } from "@/firebase/firebase-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
          <p className="text-muted-foreground">Please wait while we prepare the application.</p>
        </div>
      </div>
    );
  }

  return (
     <DataProvider>
        <div className="relative flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1">
            <div className="container relative p-4 sm:p-6 md:p-8 print:p-0">
              {children}
            </div>
          </main>
        </div>
    </DataProvider>
  )
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <AppContent>{children}</AppContent>
        <Toaster />
      </AuthProvider>
    </FirebaseProvider>
  );
}

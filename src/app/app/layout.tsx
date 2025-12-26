
"use client";

import { AppHeader } from "@/components/app-header";
import { useUser } from "@/firebase";
import { DataProvider, useData } from "@/firebase/data/data-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

function AdminCheck({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isAdminLoading } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // This is the key change: We MUST wait for both user and admin status to be resolved.
  if (isUserLoading || isAdminLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading Application...</p>
          <p className="text-muted-foreground">Verifying permissions, please wait.</p>
        </div>
      </div>
    );
  }

  // After loading, if the user is confirmed to not be an admin, then deny access.
  if (!isAdmin) {
     return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You do not have administrative privileges.</p>
           <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
        </div>
      </div>
    );
  }

  // If all checks pass, render the main content
  return (
    <div className="relative flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container relative p-4 sm:p-6 md:p-8 print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}


function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
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
        <AdminCheck>{children}</AdminCheck>
    </DataProvider>
  )
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <AppContent>{children}</AppContent>
  );
}

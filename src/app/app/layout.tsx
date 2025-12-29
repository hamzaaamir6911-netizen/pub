
"use client";

import { AppHeader } from "@/components/app-header";
import { useUser } from "@/firebase";
import { DataProvider, useData } from "@/firebase/data/data-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { appUser } = useData();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If the user check is done and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

   useEffect(() => {
    if (appUser) {
      const pageId = pathname.split('/app/')[1];
      if (!pageId) return;

      if (appUser.role !== 'admin' && appUser.permissions && pageId in appUser.permissions) {
        const hasAccess = appUser.permissions[pageId as keyof typeof appUser.permissions];
        if (!hasAccess) {
          router.replace('/app/dashboard');
        }
      }
    }
  }, [appUser, pathname, router]);

  // While checking for the user, or if there's no user yet, show a loading screen.
  if (isUserLoading || !user || !appUser) {
    return (
       <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
          <p className="text-muted-foreground">Please wait while we prepare the application.</p>
        </div>
      </div>
    );
  }
  
  // If the user is logged in, provide the data and show the app.
  return (
      <div className="relative flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1">
          <div className="container relative p-4 sm:p-6 md:p-8 print:p-0">
            {children}
          </div>
        </main>
      </div>
  )
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <AppContent>{children}</AppContent>
    </DataProvider>
  );
}


"use client";

import { AppHeader } from "@/components/app-header";
import { useUser } from "@/firebase";
import { DataProvider } from "@/firebase/data/data-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
      <AppContent>{children}</AppContent>
  );
}

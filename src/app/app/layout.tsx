
import { AppHeader } from "@/components/app-header";
import { DataProvider } from "@/context/data-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <div className="relative flex min-h-screen flex-col print:block">
        <AppHeader />
        <main className="flex-1 print:flex-none printable-area">
          <div className="container relative p-4 sm:p-6 md:p-8 print:p-0">
            {children}
          </div>
        </main>
      </div>
    </DataProvider>
  );
}

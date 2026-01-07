
// This is a minimal layout for the print-only pages.
// It ensures no other app-wide layout (like headers or footers) is applied,
// and it INCLUDES the necessary global styles for formatting.
import '@/app/globals.css';
import { PT_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { DataProvider } from '@/firebase/data/data-provider';

const fontBody = PT_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ['400', '700']
})

const fontHeadline = PT_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: '700'
})

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(
          "bg-white", // Force a white background for printing
          fontBody.variable,
          fontHeadline.variable
        )}>
        {/* DataProvider is needed here so the print page can fetch its own data */}
        <DataProvider>
            {children}
        </DataProvider>
      </body>
    </html>
  );
}

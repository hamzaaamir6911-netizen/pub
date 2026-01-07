
// This is a minimal layout for the print-only pages.
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
          "bg-white",
          fontBody.variable,
          fontHeadline.variable
        )}>
        <DataProvider>
            {children}
        </DataProvider>
      </body>
    </html>
  );
}

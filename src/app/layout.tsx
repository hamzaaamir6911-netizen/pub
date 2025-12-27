
import type {Metadata} from 'next';
import { PT_Sans } from "next/font/google"
import './globals.css';
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'ARCO Factory Manager',
  description: 'Factory Management System for ARCO Aluminium',
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontBody.variable,
          fontHeadline.variable
        )}>
         <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
          >
            <FirebaseClientProvider>
              {children}
              <Toaster />
            </FirebaseClientProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}

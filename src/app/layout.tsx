
import type {Metadata} from 'next';
import { PT_Sans } from 'next/font/google'
import './globals.css';

export const metadata: Metadata = {
  title: 'ARCO Factory Manager',
  description: 'Factory Management System for ARCO Aluminium',
};

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body'
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${ptSans.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}

    
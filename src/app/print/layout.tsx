
import React from 'react';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Print View',
}

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  // This layout ensures the print pages are clean and have no extra elements.
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  );
}

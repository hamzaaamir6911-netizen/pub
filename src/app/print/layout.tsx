
import React from 'react';

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  // This is a blank layout, no styles, no components.
  // It ensures the print pages are clean.
  return <>{children}</>;
}


// This is a minimal layout for the print-only pages.
// It ensures no other app-wide layout (like headers or footers) is applied.
export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}

    
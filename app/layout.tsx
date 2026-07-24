import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Direct — jobs straight from company career pages",
  description:
    "Search a role and see openings pulled directly from company career pages worldwide. Apply on the company's own site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

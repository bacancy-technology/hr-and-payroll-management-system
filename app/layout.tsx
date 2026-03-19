import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "PulseHR | HR & Payroll Command Center",
  description:
    "Production-ready Next.js HR and payroll workspace with Supabase auth, seed data, and Vercel-friendly deployment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

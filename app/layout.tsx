import type { Metadata } from "next";
import "./globals.css";
import CareerShell from "@/app/components/career-shell";

import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "CareerIntel | AI Career Intelligence Platform",
  description:
    "AI-powered student support, skill gap analysis, personalized career roadmaps and learner intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider><CareerShell>{children}</CareerShell></AuthProvider>
      </body>
    </html>
  );
}
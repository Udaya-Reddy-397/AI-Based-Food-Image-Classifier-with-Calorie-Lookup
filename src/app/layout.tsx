import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "NutriScan – Smart Food & Nutrition Tracker",
  description:
    "AI-powered food analysis, portion estimation and personalized nutrition tracking",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 pb-20">
        <AuthProvider>
          <main className="min-h-screen">{children}</main>
          <Navbar />
        </AuthProvider>
      </body>
    </html>
  );
}

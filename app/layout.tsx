import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResiManager Admin - Automated Resi Renamer & Cloud Backup",
  description: "Aplikasi Admin Rename & Backup Resi PDF Marketplace Ke Google Drive dan Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}>
      <body className="min-h-full flex flex-col bg-slate-50/80 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Toaster>
          <Navbar />
          <div className="flex-1">{children}</div>
        </Toaster>
      </body>
    </html>
  );
}

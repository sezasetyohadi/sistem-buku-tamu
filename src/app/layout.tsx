import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageErrorBoundary } from "@/components/error/ErrorBoundary";
import "./globals.css";

// Optimized font loading with display=swap and preload
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Show fallback font until custom font loads
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Show fallback font until custom font loads
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Sistem Buku Tamu Digital - DISNAKERTRANS Jawa Tengah",
  description: "Sistem Buku Tamu Digital Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appMode = process.env.NEXT_PUBLIC_APP_MODE || 'full';
  
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased app-mode-${appMode}`}>
        <PageErrorBoundary>
          <AuthProvider>
            <Toaster position="top-center" />
            <div data-app-mode={appMode}>
              {children}
            </div>
          </AuthProvider>
        </PageErrorBoundary>
      </body>
    </html>
  );
}

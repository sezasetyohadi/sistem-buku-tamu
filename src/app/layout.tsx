import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Header />
        <main>
          {children}
        </main>
        <footer className="relative text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #3D5DC3 0%, #2563EB 100%)'}}>
          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full" style={{backgroundColor: '#F29442'}}></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full"></div>
          </div>
          
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand Section */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}>
                    <span className="text-xl">🏢</span>
                  </div>
                  <h3 className="text-xl font-bold">Sistem Buku Tamu</h3>
                </div>
                <p className="text-blue-100 leading-relaxed mb-4">
                  Solusi digital modern untuk manajemen tamu dan layanan pelanggan yang efisien dan transparan.
                </p>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                    <span className="text-sm">📧</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                    <span className="text-sm">📱</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                    <span className="text-sm">🌐</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Layanan</h4>
                <ul className="space-y-2 text-blue-100">
                  <li><a href="/register" className="hover:text-white transition-colors">📝 Pendaftaran Tamu</a></li>
                  <li><a href="/guests" className="hover:text-white transition-colors">🙏 Permohonan Layanan</a></li>
                  <li><a href="/survey" className="hover:text-white transition-colors">⭐ Survei Kepuasan</a></li>
                  <li><a href="/admin" className="hover:text-white transition-colors">👨‍💼 Admin Dashboard</a></li>
                </ul>
              </div>
              
              {/* Contact Info */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Kontak</h4>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span className="text-sm">Jakarta, Indonesia</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">📞</span>
                    <span className="text-sm">+62 123 4567 890</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✉️</span>
                    <span className="text-sm">info@guestbook.id</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🕒</span>
                    <span className="text-sm">24/7 Online</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="border-t border-white/20 pt-6 text-center">
              <p className="text-blue-100 text-sm">
                © {new Date().getFullYear()} Sistem Buku Tamu Digital. Semua hak dilindungi. 
                <span className="mx-2">•</span>
                Dibuat dengan ❤️ untuk pelayanan yang lebih baik
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

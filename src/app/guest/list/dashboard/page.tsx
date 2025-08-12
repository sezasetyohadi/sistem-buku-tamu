"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function GuestsDashboard() {
  const [stats, setStats] = useState({
    totalTamu: 0,
    tamuHariIni: 0,
    surveyCompleted: 0
  });

  useEffect(() => {
    // Fetch basic stats for guests dashboard
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/statistics');
      const result = await response.json();
      
      if (result.success) {
        setStats({
          totalTamu: result.data.totalGuests || 0,
          tamuHariIni: result.data.todayCheckIn || 0,
          surveyCompleted: result.data.totalSurveys || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header khusus untuk guests */}
      <header className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/guests/dashboard" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  T
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">
                  Sistem Buku Tamu - Dashboard Tamu
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 text-sm font-medium transition-colors"
              >
                ← Beranda
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold mb-6" style={{backgroundColor: '#EBF4FF', color: '#3D5DC3'}}>
                <span className="mr-2">👋</span>
                Dashboard Tamu
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Selamat Datang di DISNAKERTRANS Jawa Tengah
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Akses layanan pendaftaran tamu dan berikan feedback melalui survey kepuasan pelayanan.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                    <span className="text-white text-xl">👥</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.totalTamu}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Total Tamu</h3>
                <p className="text-sm text-gray-600">Terdaftar di sistem</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #059669, #10B981)'}}>
                    <span className="text-white text-xl">📅</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.tamuHariIni}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Check-in Hari Ini</h3>
                <p className="text-sm text-gray-600">Tamu yang berkunjung</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #EA580C, #F97316)'}}>
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.surveyCompleted}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Survey Selesai</h3>
                <p className="text-sm text-gray-600">Feedback terkumpul</p>
              </div>
            </div>

            {/* Main Features - Hanya 3 menu utama untuk guests */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Pendaftaran Tamu */}
              <Link href="/register" className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
                  <div className="p-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                      <span className="text-white text-2xl">📝</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">Pendaftaran Tamu</h3>
                    <p className="text-gray-600 text-center mb-6">
                      Daftarkan diri Anda sebagai tamu DISNAKERTRANS Jawa Tengah untuk keperluan kunjungan.
                    </p>
                    <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700">
                      <span>Daftar Sekarang</span>
                      <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Survey Kepuasan */}
              <Link href="/survey" className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
                  <div className="p-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto" style={{background: 'linear-gradient(135deg, #059669, #10B981)'}}>
                      <span className="text-white text-2xl">📋</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">Survey Kepuasan</h3>
                    <p className="text-gray-600 text-center mb-6">
                      Berikan penilaian dan masukan untuk membantu kami meningkatkan kualitas pelayanan.
                    </p>
                    <div className="flex items-center justify-center text-green-600 font-semibold group-hover:text-green-700">
                      <span>Isi Survey</span>
                      <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Daftar Tamu */}
              <Link href="/guests" className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
                  <div className="p-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto" style={{background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)'}}>
                      <span className="text-white text-2xl">👁️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">Lihat Daftar Tamu</h3>
                    <p className="text-gray-600 text-center mb-6">
                      Lihat daftar tamu yang telah terdaftar dan status kunjungan mereka.
                    </p>
                    <div className="flex items-center justify-center text-purple-600 font-semibold group-hover:text-purple-700">
                      <span>Lihat Daftar</span>
                      <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Information Section */}
            <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  📍 Informasi Kunjungan
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Jam Operasional</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Senin - Jumat: 08:00 - 16:00 WIB</li>
                    <li>• Istirahat: 12:00 - 13:00 WIB</li>
                    <li>• Sabtu - Minggu: Tutup</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Kontak</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Telepon: (024) 3520275</li>
                    <li>• Email: info@disnakerjateng.go.id</li>
                    <li>• Website: www.disnakerjateng.go.id</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © 2025 DISNAKERTRANS Jawa Tengah. Sistem Buku Tamu Digital.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GuestPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGuests: 0,
    todayCheckIn: 0,
    todayCheckOut: 0,
    totalSurveys: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/statistics');
      const result = await response.json();
      
      if (result.success) {
        setStats({
          totalGuests: result.data.totalGuests || 0,
          todayCheckIn: result.data.todayCheckIn || 0,
          todayCheckOut: result.data.todayCheckOut || 0,
          totalSurveys: result.data.totalSurveys || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Tamu</h1>
          <p className="text-gray-600">Selamat datang di DISNAKERTRANS Jawa Tengah</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tamu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Check-in Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayCheckIn}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Check-out Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayCheckOut}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Survey Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSurveys}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/guest/register" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pendaftaran Tamu</h3>
                  <p className="text-gray-600">Daftarkan diri Anda untuk kunjungan</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/guest/survey" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Survey Kepuasan</h3>
                  <p className="text-gray-600">Berikan penilaian layanan kami</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              📍 Informasi Kunjungan
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Jam Operasional</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Senin - Jumat: 08:00 - 16:00 WIB</li>
                <li>• Istirahat: 12:00 - 13:00 WIB</li>
                <li>• Sabtu - Minggu: Tutup</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Kontak</h3>
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
  );
}

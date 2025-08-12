"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
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
    }
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
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
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
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
              <p className="text-sm font-medium text-gray-600">Total Survey</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSurveys}</p>
            </div>
          </div>
        </div>
      </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/guests" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                  <span className="text-white text-xl">👥</span>
                </div>
                <span className="text-gray-700 group-hover:text-gray-800">→</span>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/admin/guests" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Daftar Tamu</h3>
                <p className="text-gray-600">Kelola data tamu, check-in/out, dan riwayat kunjungan</p>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manajemen Tamu</h3>
              <p className="text-gray-900 text-sm">Kelola data tamu, check-in/out, dan riwayat kunjungan</p>
            </div>
          </Link>

          <Link href="/admin/services" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #22C55E, #16A34A)'}}>
                  <span className="text-white text-xl">🏢</span>
                </div>
                <span className="text-gray-700 group-hover:text-gray-800">→</span>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/reports" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Laporan</h3>
                <p className="text-gray-600">Lihat laporan statistik dan export data tamu</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity (placeholder for future implementation) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            Data aktivitas terbaru akan ditampilkan di sini
          </p>
        </div>
      </div>
    </div>
  );
}

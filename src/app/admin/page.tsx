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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Dashboard Admin</h1>
        <p className="text-lg text-gray-600">Selamat datang di panel admin sistem buku tamu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-10">
        <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <span className="text-3xl">👥</span>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tamu</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalGuests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <span className="text-3xl">📅</span>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-600 mb-1">Check-in Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayCheckIn}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
              <span className="text-3xl">📤</span>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-600 mb-1">Check-out Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayCheckOut}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Survey</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSurveys}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <Link href="/admin/guest-management" className="group">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Daftar Tamu</h3>
                  <p className="text-gray-600 leading-relaxed">Kelola data tamu dan check-in/out</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 ml-6">
                  <span className="text-3xl">👥</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/reports" className="group">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-200 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Laporan</h3>
                  <p className="text-gray-600 leading-relaxed">Lihat laporan dan statistik</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 ml-6">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/survey" className="group">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-purple-200 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Survey</h3>
                  <p className="text-gray-600 leading-relaxed">Kelola survei dan feedback</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 ml-6">
                  <span className="text-3xl">📝</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-900">Aktivitas Terbaru</h3>
        </div>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-gray-500 text-lg">Data aktivitas terbaru akan ditampilkan di sini</p>
            <p className="text-gray-400 text-sm mt-2">Sistem akan mencatat semua aktivitas pengguna</p>
          </div>
        </div>
      </div>
    </div>
  );
}

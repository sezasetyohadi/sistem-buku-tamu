"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalGuests: 0,
    todayCheckIn: 0,
    todayCheckOut: 0,
    currentlyVisiting: 0,
    totalSurveys: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Add timestamp to URL to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/statistics?t=${timestamp}`, {
        // Add cache-busting parameters
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Parse JSON with error handling
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      if (result && result.success) {
        // Make sure we have a data object before accessing properties
        const data = result.data || {};
        
        // Log what we're receiving for debugging
        console.log('Stats data received:', data);
        
        // Set stats with values from backend
        setStats({
          totalGuests: data.totalGuests || 0,
          // The backend calls "Terjadwal Hari Ini" as todayCheckIn
          todayCheckIn: data.todayCheckIn || 0,
          // The backend calls "Selesai Hari Ini" as todayCheckOut
          todayCheckOut: data.todayCheckOut || 0,
          // The backend calls "Datang Hari Ini" as currentlyVisiting 
          currentlyVisiting: data.currentlyVisiting || 0,
          totalSurveys: data.totalSurveys || 0
        });
        
        // Set recent activities with null/undefined check
        if (data.recentActivities && Array.isArray(data.recentActivities)) {
          // Map any field inconsistencies
          const mappedActivities = data.recentActivities.map((activity: any) => {
            // Make sure we have a status_kunjungan or tanggapan field
            if (!activity.tanggapan && activity.status_kunjungan) {
              return { ...activity, tanggapan: activity.status_kunjungan };
            }
            return activity;
          });
          
          setRecentActivities(mappedActivities);
        } else {
          // If recentActivities is not an array, set to empty array
          setRecentActivities([]);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Reset data on error
      setRecentActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Dashboard Admin</h1>
          <p className="text-lg text-gray-600">Selamat datang di panel admin sistem buku tamu</p>
        </div>
        <button 
          onClick={() => fetchStats()}
          disabled={isLoading}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center"
        >
          <span className={`mr-2 ${isLoading ? 'animate-spin' : ''}`}>
            {isLoading ? '⌛' : '🔄'}
          </span>
          {isLoading ? 'Memuat...' : 'Refresh Data'}
        </button>
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
              <p className="text-3xl font-bold text-gray-900">{isLoading ? "..." : stats.totalGuests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <span className="text-3xl">📅</span>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-600 mb-1">Terjadwal Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900">{isLoading ? "..." : stats.todayCheckIn}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-600 mb-1">Selesai Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900">{isLoading ? "..." : stats.todayCheckOut}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <span className="text-3xl">💼</span>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-600 mb-1">Datang Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900">{isLoading ? "..." : stats.currentlyVisiting}</p>
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
          <p className="text-sm text-gray-500">Menampilkan aktivitas tamu dalam 24 jam terakhir</p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Memuat data aktivitas...</span>
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="overflow-hidden">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center p-4 ${
                    index < recentActivities.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="w-10 h-10 mr-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">
                      {activity.tanggapan === 'Check-in' || activity.tanggapan === 'Datang' ? '📥' : 
                       activity.tanggapan === 'Check-out' || activity.tanggapan === 'Selesai' ? '📤' : 
                       activity.tanggapan === 'Terjadwal' ? '📅' : '⏳'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-md font-medium text-gray-900">{activity.nama}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.tanggapan === 'Check-in' || activity.tanggapan === 'Datang' ? 'bg-green-100 text-green-800' : 
                        activity.tanggapan === 'Check-out' || activity.tanggapan === 'Selesai' ? 'bg-blue-100 text-blue-800' : 
                        activity.tanggapan === 'Terjadwal' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.tanggapan || 'Menunggu'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.asal_instansi && `Dari ${activity.asal_instansi}. `}
                      {activity.keperluan && `Keperluan: ${activity.keperluan}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {activity.waktu_dibuat && new Date(activity.waktu_dibuat).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-gray-500 text-lg">Belum ada aktivitas tamu dalam 24 jam terakhir</p>
              <p className="text-gray-400 text-sm mt-2">Aktivitas terbaru akan muncul setelah tamu melakukan registrasi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

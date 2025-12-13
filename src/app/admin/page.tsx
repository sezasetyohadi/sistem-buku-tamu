'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalGuests: 0,
    todayGuests: 0,
    todayCheckIn: 0,
    todayCheckOut: 0,
    currentlyVisiting: 0,
    totalSurveys: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  // Minimal access check - most logic is now in layout
  useEffect(() => {
    if (user) {
      // Only show content for admin resepsionis, others will be redirected by layout
      if (user.bidang_tujuan_id === 999) {
        //console.log('Dashboard: Admin resepsionis confirmed access');
      }
    }
  }, [user]);

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
        //console.log('Stats data received:', data);
        
        // Set stats with values from backend
        setStats({
          totalGuests: data.totalGuests || 0,
          todayGuests: data.todayGuests || 0,
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
    <div className="p-3 sm:p-4 md:p-6 xl:p-8 w-full min-h-full">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 md:mb-8 xl:mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Dashboard Admin</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">Selamat datang di panel admin sistem buku tamu</p>
        </div>
        <button 
          onClick={() => fetchStats()}
          disabled={isLoading}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded flex items-center text-sm sm:text-base flex-shrink-0"
        >
          <span className={`mr-2 ${isLoading ? 'animate-spin' : ''}`}>
            {isLoading ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          {isLoading ? 'Memuat...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8 xl:mb-10">
        <div className="bg-white p-4 sm:p-6 xl:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 xl:w-8 xl:h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 xl:ml-5 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Tamu Hari Ini</p>
              <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900">{isLoading ? '...' : stats.todayGuests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 xl:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 xl:w-8 xl:h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 xl:ml-5 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Terjadwal Hari Ini</p>
              <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900">{isLoading ? '...' : stats.todayCheckIn}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 xl:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 xl:w-8 xl:h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 xl:ml-5 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Selesai Hari Ini</p>
              <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900">{isLoading ? '...' : stats.todayCheckOut}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 xl:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 xl:w-8 xl:h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 xl:ml-5 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Datang Hari Ini</p>
              <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900">{isLoading ? '...' : stats.currentlyVisiting}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4 sm:mb-6 md:mb-8 xl:mb-10">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Menu Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 xl:gap-8">
          <Link href="/admin/guest-management" className="group">
            <div className="bg-white p-4 sm:p-6 xl:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">Manajemen Tamu</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Kelola data tamu</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 ml-4 sm:ml-6 flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/reports" className="group">
            <div className="bg-white p-4 sm:p-6 xl:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-200 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-green-600 transition-colors">Laporan</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Lihat laporan dan statistik</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 ml-4 sm:ml-6 flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/survey" className="group">
            <div className="bg-white p-4 sm:p-6 xl:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-purple-200 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors">Kelola Survei</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Manajemen survei dan responden</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 ml-4 sm:ml-6 flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1h-5a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1h-5a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 xl:px-8 py-4 sm:py-6 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-900">Aktivitas Terbaru</h3>
          <p className="text-xs sm:text-sm text-gray-500">Menampilkan aktivitas tamu dalam 24 jam terakhir</p>
        </div>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-red-600"></div>
              <span className="ml-3 text-sm sm:text-base text-gray-600">Memuat data aktivitas...</span>
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="overflow-hidden">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-start sm:items-center p-3 sm:p-4 ${
                    index < recentActivities.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mr-3 sm:mr-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {activity.tanggapan === 'Check-in' || activity.tanggapan === 'Datang' ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : activity.tanggapan === 'Check-out' || activity.tanggapan === 'Selesai' ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : activity.tanggapan === 'Terjadwal' ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{activity.nama}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 self-start sm:self-auto ${
                        activity.tanggapan === 'Check-in' || activity.tanggapan === 'Datang' ? 'bg-green-100 text-green-800' : 
                        activity.tanggapan === 'Check-out' || activity.tanggapan === 'Selesai' ? 'bg-blue-100 text-blue-800' : 
                        activity.tanggapan === 'Terjadwal' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.tanggapan || 'Menunggu'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
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
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1h-5a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1h-5a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500 text-base sm:text-lg">Belum ada aktivitas tamu dalam 24 jam terakhir</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">Aktivitas terbaru akan muncul setelah tamu melakukan registrasi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

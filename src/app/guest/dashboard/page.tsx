"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// User Dashboard Component
function UserDashboard({ stats }: { stats: any }) {
  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h2>
        <p className="text-gray-600">
          Selamat datang di DISNAKERTRANS Jawa Tengah
        </p>
      </div>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                    <span className="text-white text-xl">👥</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.totalGuests}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Total Tamu</h3>
                <p className="text-sm text-gray-600">Terdaftar di sistem</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #059669, #10B981)'}}>
                    <span className="text-white text-xl">📅</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.todayCheckIn}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Check-in Hari Ini</h3>
                <p className="text-sm text-gray-600">Tamu yang berkunjung</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #EA580C, #F97316)'}}>
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.totalSurveys}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Survey Selesai</h3>
                <p className="text-sm text-gray-600">Feedback terkumpul</p>
              </div>
            </div>

            {/* Main Features */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pendaftaran Tamu */}
              <Link href="/guest/register" className="group">
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
              <Link href="/guest/survey" className="group">
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
  );
}

// Admin Dashboard Component
function AdminDashboard({ stats, adminData, onLogout }: { stats: any; adminData: any; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg border border-gray-200 p-2">
                <img 
                  src="/logo-jateng.svg" 
                  alt="Logo Provinsi Jawa Tengah" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">SIM Buku Tamu</h1>
                <p className="text-sm text-gray-600">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation - Only Admin Menu */}
          <nav className="mt-6 px-3">
            <Link
              href="/guest/dashboard"
              className="flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border-r-2 border-blue-700"
            >
              <span className="mr-3 text-lg">🏠</span>
              Dashboard
            </Link>
            <Link
              href="/guest/register"
              className="flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="mr-3 text-lg">👤</span>
              Pendaftaran Tamu
            </Link>
            <Link
              href="/admin/guests"
              className="flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="mr-3 text-lg">👥</span>
              Daftar Tamu
            </Link>
            <Link
              href="/admin/services"
              className="flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="mr-3 text-lg">🔧</span>
              Survey
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="mr-3 text-lg">📊</span>
              Laporan
            </Link>
          </nav>

          {/* Admin Info */}
          <div className="absolute bottom-6 left-3 right-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {adminData?.nama_lengkap || adminData?.username}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-400 hover:text-red-600 text-sm font-medium"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Dashboard Admin
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Selamat datang, {adminData?.nama_lengkap || adminData?.username}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    🌐 Lihat Website
                  </Link>
                  <button
                    onClick={onLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link href="/admin/guests" className="group">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Daftar Tamu</h3>
                      <p className="text-gray-600">Kelola data tamu, check-in/out, dan riwayat kunjungan</p>
                    </div>
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

            {/* Recent Activity */}
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
          </main>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [adminData, setAdminData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGuests: 0,
    todayCheckIn: 0,
    todayCheckOut: 0,
    totalSurveys: 0
  });
  const router = useRouter();

  useEffect(() => {
    // Force guest view if URL contains guest parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'guest') {
      localStorage.removeItem('admin_session');
      document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setIsAdmin(false);
      setAdminData(null);
      setIsLoading(false);
      return;
    }

    // Check if admin is logged in
    const checkAdminStatus = () => {
      const adminSession = localStorage.getItem('admin_session');
      
      console.log('Admin session check:', adminSession); // Debug log
      
      if (adminSession) {
        try {
          const adminInfo = JSON.parse(adminSession);
          console.log('Admin info:', adminInfo); // Debug log
          
          // Validate admin session - check if it's still valid
          if (adminInfo && adminInfo.username && adminInfo.login_time) {
            const loginTime = new Date(adminInfo.login_time);
            const now = new Date();
            const timeDiff = now.getTime() - loginTime.getTime();
            const hoursDiff = timeDiff / (1000 * 3600);
            
            // Session expires after 24 hours
            if (hoursDiff > 24) {
              console.log('Admin session expired'); // Debug log
              localStorage.removeItem('admin_session');
              document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              setIsAdmin(false);
              setAdminData(null);
            } else {
              setAdminData(adminInfo);
              setIsAdmin(true);
            }
          } else {
            // Invalid session data
            console.log('Invalid admin session data'); // Debug log
            localStorage.removeItem('admin_session');
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Invalid admin session:', error);
          localStorage.removeItem('admin_session');
          setIsAdmin(false);
        }
      } else {
        console.log('No admin session found'); // Debug log
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };

    // Fetch statistics
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

    checkAdminStatus();
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsAdmin(false);
    setAdminData(null);
    router.push('/dashboard');
  };

  const handleForceGuestView = () => {
    // Force guest view by clearing all admin sessions
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_auth');
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsAdmin(false);
    setAdminData(null);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // Show admin dashboard if logged in as admin, otherwise show user dashboard
  console.log('Dashboard render - isAdmin:', isAdmin, 'adminData:', adminData); // Debug log
  
  if (isAdmin) {
    return <AdminDashboard stats={stats} adminData={adminData} onLogout={handleLogout} />;
  }

  return <UserDashboard stats={stats} />;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminServices() {
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem('admin_session');
    
    if (!adminSession) {
      router.push('/login');
      return;
    }

    try {
      const adminInfo = JSON.parse(adminSession);
      setAdminData(adminInfo);
      setIsLoading(false);
    } catch (error) {
      console.error('Invalid admin session:', error);
      localStorage.removeItem('admin_session');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    );
  }

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

          {/* Navigation */}
          <nav className="mt-6 px-3">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="mr-3 text-lg">🏠</span>
              Dashboard
            </Link>
            <Link
              href="/register"
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
              className="flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border-r-2 border-blue-700"
            >
              <span className="mr-3 text-lg">🔧</span>
              Survey
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="mr-3 text-lg">�</span>
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
                  onClick={handleLogout}
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
                    Survey Management
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Kelola survey kepuasan layanan DISNAKERTRANS Jateng
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
                    onClick={handleLogout}
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
            {/* Survey Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Survey</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bulan Ini</p>
                    <p className="text-2xl font-bold text-gray-900">42</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rata-rata Rating</p>
                    <p className="text-2xl font-bold text-gray-900">4.2</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tingkat Kepuasan</p>
                    <p className="text-2xl font-bold text-gray-900">84%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Survey Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link href="/survey" className="group">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Formulir Survey</h3>
                      <p className="text-gray-600">Lihat dan kelola formulir survey kepuasan layanan</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <span className="text-2xl">📋</span>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="group cursor-pointer">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Hasil Survey</h3>
                      <p className="text-gray-600">Analisis hasil survey dan feedback dari tamu</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Survey Submissions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Survey Terbaru</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Lihat Semua
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Sample survey entries */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">AS</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Ahmad Subagyo</p>
                        <p className="text-sm text-gray-600">Layanan Ketenagakerjaan</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map((star) => (
                          <span key={star} className="text-yellow-400">⭐</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">2 hari lalu</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">SM</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Siti Maryam</p>
                        <p className="text-sm text-gray-600">Layanan Transmigrasi</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {[1,2,3,4].map((star) => (
                          <span key={star} className="text-yellow-400">⭐</span>
                        ))}
                        <span className="text-gray-300">⭐</span>
                      </div>
                      <span className="text-sm text-gray-500">1 minggu lalu</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-600">BH</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Budi Hartono</p>
                        <p className="text-sm text-gray-600">Konsultasi Kartu AK1</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map((star) => (
                          <span key={star} className="text-yellow-400">⭐</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">1 minggu lalu</span>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Muat lebih banyak
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

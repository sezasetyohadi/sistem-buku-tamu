import GuestDataTable from "@/components/admin/GuestDataTable";
import Link from "next/link";

export const metadata = {
  title: 'Admin Dashboard - Sistem Buku Tamu Digital',
  description: 'Dashboard utama administrator untuk sistem buku tamu',
};

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 Dashboard Admin</h1>
              <p className="text-gray-900">
                Selamat datang di panel administrasi. Kelola semua aspek sistem buku tamu dari sini.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-900">Terakhir login</p>
              <p className="font-semibold text-gray-900">4 Agustus 2025, 09:00 WIB</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#EBF4FF', borderColor: '#BFDBFE'}}>
            <h3 className="font-bold text-xl mb-2 text-gray-900">Total Guests</h3>
            <p className="text-4xl font-bold text-gray-900">1,234</p>
            <p className="text-sm text-gray-900 mt-2">↗️ +15% dari bulan lalu</p>
          </div>
          
          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}}>
            <h3 className="font-bold text-xl mb-2 text-gray-900">Checked In</h3>
            <p className="text-4xl font-bold text-gray-900">45</p>
            <p className="text-sm text-gray-900 mt-2">📊 Hari ini</p>
          </div>
          
          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#FEF3E2', borderColor: '#FED7AA'}}>
            <h3 className="font-bold text-xl mb-2 text-gray-900">Checked Out</h3>
            <p className="text-4xl font-bold text-gray-900">38</p>
            <p className="text-sm text-gray-800 mt-2">🕒 Hari ini</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/guests" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                  <span className="text-white text-xl">👥</span>
                </div>
                <span className="text-gray-700 group-hover:text-gray-800">→</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manajemen Tamu</h3>
              <p className="text-gray-900 text-sm">Kelola data tamu, check-in/out, dan riwayat kunjungan</p>
            </div>
          </Link>

          <Link href="/admin/services" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #22C55E, #16A34A)'}}>
                  <span className="text-white text-xl">🙏</span>
                </div>
                <span className="text-gray-700 group-hover:text-gray-800">→</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manajemen Layanan</h3>
              <p className="text-gray-900 text-sm">Review permohonan layanan dan kelola approval</p>
            </div>
          </Link>

          <Link href="/admin/reports" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}>
                  <span className="text-white text-xl">📊</span>
                </div>
                <span className="text-gray-700 group-hover:text-gray-800">→</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Laporan & Analitik</h3>
              <p className="text-gray-900 text-sm">Lihat statistik, tren, dan laporan detail</p>
            </div>
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">📋 Daftar Tamu Terbaru</h2>
          <GuestDataTable />
        </div>
      </div>
    </div>
  );
}

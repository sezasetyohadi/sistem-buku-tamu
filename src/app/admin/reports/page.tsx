import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Laporan & Analitik | Sistem Buku Tamu',
  description: 'Dashboard laporan dan analitik untuk administrator',
};

export default function AdminReportsAnalytics() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Laporan & Analitik</h1>
              <p className="text-gray-800">
                Dashboard analitik dan laporan komprehensif sistem buku tamu
              </p>
            </div>
            <div className="flex space-x-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
                <option>3 Bulan Terakhir</option>
                <option>1 Tahun Terakhir</option>
              </select>
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300"
                style={{background: 'linear-gradient(135deg, #22C55E, #16A34A)'}}
              >
                📥 Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#EBF4FF', borderColor: '#BFDBFE'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Total Kunjungan</h3>
                <p className="text-3xl font-bold text-gray-900">2,847</p>
                <p className="text-sm text-gray-900">↗️ +12.5% dari bulan lalu</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#FEF3E2', borderColor: '#FED7AA'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Rata-rata Harian</h3>
                <p className="text-3xl font-bold text-gray-900">67</p>
                <p className="text-sm text-gray-900">↗️ +8.3% dari periode lalu</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}>
                <span className="text-white text-xl">📈</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Waktu Rata-rata</h3>
                <p className="text-3xl font-bold text-gray-900">2.4h</p>
                <p className="text-sm text-gray-900">↘️ -5.2% durasi kunjungan</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #22C55E, #16A34A)'}}>
                <span className="text-white text-xl">⏱️</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#F9FAFB', borderColor: '#E5E7EB'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Tingkat Kepuasan</h3>
                <p className="text-3xl font-bold text-gray-800">4.8/5</p>
                <p className="text-sm text-gray-900">↗️ +0.3 dari survei lalu</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Visitor Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Tren Kunjungan (7 Hari Terakhir)</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-800">Chart akan ditampilkan di sini</p>
                <p className="text-sm text-gray-700">Integrasi dengan Chart.js atau library lain</p>
              </div>
            </div>
          </div>

          {/* Service Categories */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🙏 Kategori Layanan Populer</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded" style={{backgroundColor: '#3D5DC3'}}></div>
                  <span className="ml-3 text-sm text-gray-900">Konsultasi Bisnis</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded" style={{backgroundColor: '#22C55E'}}></div>
                  <span className="ml-3 text-sm text-gray-900">Bantuan Teknis</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded" style={{backgroundColor: '#F29442'}}></div>
                  <span className="ml-3 text-sm text-gray-900">Informasi Produk</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">18%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  <span className="ml-3 text-sm text-gray-900">Lainnya</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">9%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Top Visitors */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🕒 Aktivitas Terbaru</h3>
            <div className="space-y-4">
              {[
                { time: '10:30', action: 'Check-in', user: 'Ahmad Yani', type: 'in' },
                { time: '10:15', action: 'Check-out', user: 'Siti Rahayu', type: 'out' },
                { time: '09:45', action: 'Permohonan Baru', user: 'Budi Santoso', type: 'request' },
                { time: '09:30', action: 'Check-in', user: 'Maya Putri', type: 'in' },
                { time: '09:15', action: 'Survey Selesai', user: 'Andi Wijaya', type: 'survey' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${
                    activity.type === 'in' ? 'bg-green-500' :
                    activity.type === 'out' ? 'bg-red-500' :
                    activity.type === 'request' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}>
                    {activity.type === 'in' ? '→' : activity.type === 'out' ? '←' : activity.type === 'request' ? '📋' : '⭐'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-800">{activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-700">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Visitors */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Tamu Paling Aktif</h3>
            <div className="space-y-4">
              {[
                { name: 'Ahmad Yani', visits: 15, badge: '🥇' },
                { name: 'Siti Rahayu', visits: 12, badge: '🥈' },
                { name: 'Budi Santoso', visits: 10, badge: '🥉' },
                { name: 'Maya Putri', visits: 8, badge: '4️⃣' },
                { name: 'Andi Wijaya', visits: 7, badge: '5️⃣' },
              ].map((visitor, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <span className="text-xl">{visitor.badge}</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                    {visitor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{visitor.name}</p>
                    <p className="text-xs text-gray-800">{visitor.visits} kunjungan</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{visitor.visits}</span>
                    <p className="text-xs text-gray-700">kali</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

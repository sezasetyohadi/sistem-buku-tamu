import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Manajemen Layanan | Sistem Buku Tamu',
  description: 'Halaman manajemen layanan dan permohonan untuk administrator',
};

export default function AdminServicesManagement() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🙏 Manajemen Layanan</h1>
              <p className="text-gray-600">
                Kelola semua permohonan layanan dari tamu dan pelanggan
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300"
                style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}
              >
                📊 Laporan Layanan
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300"
                style={{background: 'linear-gradient(135deg, #22C55E, #16A34A)'}}
              >
                ➕ Layanan Baru
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#EBF4FF', borderColor: '#BFDBFE'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">Total Permohonan</h3>
                <p className="text-3xl font-bold" style={{color: '#3D5DC3'}}>456</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                <span className="text-white text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#FEF3E2', borderColor: '#FED7AA'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">Menunggu Review</h3>
                <p className="text-3xl font-bold" style={{color: '#F29442'}}>23</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}>
                <span className="text-white text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">Disetujui</h3>
                <p className="text-3xl font-bold" style={{color: '#22C55E'}}>398</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #22C55E, #16A34A)'}}>
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#FEF2F2', borderColor: '#FECACA'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">Ditolak</h3>
                <p className="text-3xl font-bold text-red-600">35</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Requests Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Permohonan Layanan Terbaru</h2>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Cari permohonan..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Semua Status</option>
                  <option>Menunggu Review</option>
                  <option>Disetujui</option>
                  <option>Ditolak</option>
                  <option>Selesai</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemohon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Layanan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioritas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Sample Data Rows */}
                {[
                  { name: 'Ahmad Yani', service: 'Konsultasi Bisnis', priority: 'Tinggi', status: 'Menunggu Review', color: '#F29442' },
                  { name: 'Siti Rahayu', service: 'Bantuan Teknis', priority: 'Sedang', status: 'Disetujui', color: '#22C55E' },
                  { name: 'Budi Santoso', service: 'Informasi Produk', priority: 'Rendah', status: 'Selesai', color: '#6B7280' },
                  { name: 'Maya Putri', service: 'Komplain Layanan', priority: 'Tinggi', status: 'Ditolak', color: '#EF4444' },
                  { name: 'Andi Wijaya', service: 'Permintaan Data', priority: 'Sedang', status: 'Menunggu Review', color: '#F29442' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                          {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">Tamu Reguler</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.service}</div>
                      <div className="text-sm text-gray-500">Kategori Umum</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.priority === 'Tinggi' ? 'bg-red-100 text-red-800' :
                        item.priority === 'Sedang' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">4 Agustus 2025</div>
                      <div className="text-sm text-gray-500">10:30 WIB</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full" style={{
                        backgroundColor: item.color === '#22C55E' ? '#F0FDF4' : 
                                        item.color === '#F29442' ? '#FEF3E2' :
                                        item.color === '#EF4444' ? '#FEF2F2' : '#F3F4F6',
                        color: item.color
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">👁️ Detail</button>
                        <button className="text-green-600 hover:text-green-900">✅ Setujui</button>
                        <button className="text-red-600 hover:text-red-900">❌ Tolak</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

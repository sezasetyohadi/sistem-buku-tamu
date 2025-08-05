import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Manajemen Tamu | Sistem Buku Tamu',
  description: 'Halaman manajemen data tamu untuk administrator',
};

export default function AdminGuestsManagement() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Manajemen Data Tamu</h1>
              <p className="text-gray-600">
                Kelola semua data tamu yang telah mendaftar dalam sistem
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300"
                style={{background: 'linear-gradient(135deg, #22C55E, #16A34A)'}}
              >
                📊 Export Data
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300"
                style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}
              >
                ➕ Tambah Tamu
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#EBF4FF', borderColor: '#BFDBFE'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">Total Tamu</h3>
                <p className="text-3xl font-bold" style={{color: '#3D5DC3'}}>1,234</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">Check In Hari Ini</h3>
                <p className="text-3xl font-bold" style={{color: '#22C55E'}}>45</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #22C55E, #16A34A)'}}>
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#FEF3E2', borderColor: '#FED7AA'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">Sedang Berkunjung</h3>
                <p className="text-3xl font-bold" style={{color: '#F29442'}}>12</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}>
                <span className="text-white text-xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{backgroundColor: '#F3F4F6', borderColor: '#D1D5DB'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">Check Out</h3>
                <p className="text-3xl font-bold text-gray-600">33</p>
              </div>
              <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🚪</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Daftar Tamu Terbaru</h2>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Cari nama tamu..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Semua Status</option>
                  <option>Check In</option>
                  <option>Check Out</option>
                  <option>Sedang Berkunjung</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keperluan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Sample Data Rows */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                          JD
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">John Doe {i}</div>
                          <div className="text-sm text-gray-500">john{i}@email.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Konsultasi Bisnis</div>
                      <div className="text-sm text-gray-500">Lantai 3 - Ruang Meetinng</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">09:30 WIB</div>
                      <div className="text-sm text-gray-500">4 Agustus 2025</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: '#F0FDF4', color: '#22C55E'}}>
                        Sedang Berkunjung
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">👁️ Lihat</button>
                        <button className="text-green-600 hover:text-green-900">✏️ Edit</button>
                        <button className="text-red-600 hover:text-red-900">🗑️ Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">1</span> sampai <span className="font-medium">10</span> dari{' '}
                  <span className="font-medium">97</span> hasil
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">← Previous</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-blue-500 text-white">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

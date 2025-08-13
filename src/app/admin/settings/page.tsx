export default function AdminSettings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Pengaturan Sistem</h1>
          <p className="text-gray-600">
            Kelola konfigurasi sistem buku tamu digital
          </p>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🏢 Pengaturan Umum</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Instansi</label>
                <input 
                  type="text" 
                  defaultValue="DISNAKERTRANS Jawa Tengah"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                <textarea 
                  defaultValue="Jl. Setiabudi No. 123, Semarang, Jawa Tengah"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                <input 
                  type="text" 
                  defaultValue="(024) 8441234"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🔒 Pengaturan Keamanan</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-600">Keamanan login tambahan</div>
                </div>
                <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Aktif
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Auto Logout</div>
                  <div className="text-sm text-gray-600">Logout otomatis setelah 30 menit</div>
                </div>
                <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Aktif
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Login Logs</div>
                  <div className="text-sm text-gray-600">Simpan riwayat login admin</div>
                </div>
                <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Aktif
                </button>
              </div>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📱 Pengaturan Aplikasi</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Guest Registration</div>
                  <div className="text-sm text-gray-600">Izinkan pendaftaran tamu</div>
                </div>
                <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Aktif
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Survey Module</div>
                  <div className="text-sm text-gray-600">Modul survey kepuasan</div>
                </div>
                <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Aktif
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-600">Notifikasi email otomatis</div>
                </div>
                <button className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  ⚠️ Non-aktif
                </button>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">💻 Informasi Sistem</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Versi Aplikasi:</span>
                <span className="font-semibold text-gray-900">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span className="font-semibold text-green-600">✅ MySQL 8.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Server:</span>
                <span className="font-semibold text-green-600">✅ Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Backup:</span>
                <span className="font-semibold text-gray-900">11 Aug 2025, 03:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage Used:</span>
                <span className="font-semibold text-blue-600">2.4 GB / 10 GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">🔧 Aksi Sistem</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
              💾 Simpan Pengaturan
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors">
              💾 Backup Database
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors">
              🔄 Reset Cache
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
              🗑️ Clear Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

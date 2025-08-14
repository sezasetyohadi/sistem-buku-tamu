"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminGuestsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [dateFilter, setDateFilter] = useState("Hari Ini");

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Data Tamu</h1>
        <p className="text-gray-600 mt-2">Kelola semua data tamu yang telah mendaftar dalam sistem</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tamu</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
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
              <p className="text-2xl font-bold text-gray-900">45</p>
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
              <p className="text-2xl font-bold text-gray-900">38</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sedang Berkunjung</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Link
          href="/guest/register"
          className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Tambah Tamu</span>
        </Link>
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
          <span>📊</span>
          <span>Export Data</span>
        </button>
        <button className="bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2">
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari nama, NIK, atau instansi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option>Semua Status</option>
              <option>Check-in</option>
              <option>Check-out</option>
              <option>Sedang Berkunjung</option>
            </select>
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option>Hari Ini</option>
              <option>Minggu Ini</option>
              <option>Bulan Ini</option>
              <option>Semua Waktu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Tamu Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instansi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sample Data */}
              {[
                { name: 'Ahmad Yani', instansi: 'PT Telkom Indonesia', tujuan: 'Konsultasi Tenaga Kerja', status: 'Check-in', time: '09:15' },
                { name: 'Siti Rahayu', instansi: 'Dinas Pendidikan Semarang', tujuan: 'Koordinasi Program', status: 'Check-out', time: '10:30' },
                { name: 'Budi Santoso', instansi: 'UMKM Batik Jateng', tujuan: 'Bantuan Pelatihan', status: 'Sedang Berkunjung', time: '11:45' },
                { name: 'Maya Putri', instansi: 'Universitas Diponegoro', tujuan: 'Penelitian', status: 'Check-in', time: '13:20' },
                { name: 'Andi Wijaya', instansi: 'Koperasi Sejahtera', tujuan: 'Informasi Transmigrasi', status: 'Check-out', time: '14:15' },
              ].map((guest, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-red-600">
                          {guest.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                        <div className="text-sm text-gray-500">ID: TM{String(i + 1).padStart(3, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{guest.instansi}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{guest.tujuan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">12 Agu 2025</div>
                    <div className="text-sm text-gray-500">{guest.time} WIB</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      guest.status === 'Check-in' ? 'bg-blue-100 text-blue-800' :
                      guest.status === 'Check-out' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1" title="Lihat Detail">👁️</button>
                      <button className="text-green-600 hover:text-green-900 p-1" title="Edit">✏️</button>
                      <button className="text-red-600 hover:text-red-900 p-1" title="Hapus">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">1</span> sampai <span className="font-medium">5</span> dari{' '}
              <span className="font-medium">1,234</span> hasil
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                Sebelumnya
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded">1</button>
              <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">2</button>
              <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">3</button>
              <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DaftarTamu } from "@/types/database-types";

export default function AdminGuestsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [dateFilter, setDateFilter] = useState("Hari Ini");
  const [stats, setStats] = useState({
    totalGuests: 0,
    todayCheckIn: 0,
    todayCheckOut: 0,
    currentlyVisiting: 0
  });
  const [guests, setGuests] = useState<DaftarTamu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialFetchData = async () => {
      setIsLoading(true);
      try {
        await fetchData();
      } catch (error) {
        console.error("Error in initial data fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialFetchData();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await fetchData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch statistics
      const statsResponse = await fetch('/api/statistics');
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! Status: ${statsResponse.status}`);
      }
      
      // Parse JSON with error handling for statistics
      let statsData;
      try {
        statsData = await statsResponse.json();
      } catch (parseError) {
        console.error('Error parsing statistics JSON response:', parseError);
        throw new Error('Invalid JSON response from statistics endpoint');
      }
      
      if (statsData && statsData.success && statsData.data) {
        setStats({
          totalGuests: statsData.data.totalGuests || 0,
          todayCheckIn: statsData.data.todayCheckIn || 0,
          todayCheckOut: statsData.data.todayCheckOut || 0,
          currentlyVisiting: statsData.data.currentlyVisiting || 0
        });
      }
      
      // Fetch guest list
      const guestsResponse = await fetch('/api/guests', {
        // Add cache: 'no-store' to prevent caching
        cache: 'no-store',
        // Add a timestamp to bust the cache
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!guestsResponse.ok) {
        throw new Error(`HTTP error! Status: ${guestsResponse.status}`);
      }
      
      // Parse JSON with error handling for guests
      let guestsData;
      try {
        guestsData = await guestsResponse.json();
      } catch (parseError) {
        console.error('Error parsing guests JSON response:', parseError);
        throw new Error('Invalid JSON response from guests endpoint');
      }
      
      if (guestsData && guestsData.success) {
        const guestsArray = guestsData.data || [];
        if (Array.isArray(guestsArray)) {
          // Map tanggapan to status_kunjungan if needed
          const mappedGuests = guestsArray.map(guest => {
            if (guest.tanggapan && !guest.status_kunjungan) {
              return { ...guest, status_kunjungan: guest.tanggapan };
            }
            return guest;
          });
          setGuests(mappedGuests);
        } else {
          console.error('Guests data is not an array:', guestsData.data);
          setGuests([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setGuests([]);
    }
  };

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
              <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : stats.totalGuests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terjadwal Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : stats.todayCheckIn}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selesai Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : stats.todayCheckOut}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Datang Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : stats.currentlyVisiting}</p>
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
        <button 
          onClick={handleRefresh}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
          disabled={isLoading}
        >
          <span>{isLoading ? "⏳" : "🔄"}</span>
          <span>{isLoading ? "Memuat..." : "Refresh"}</span>
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
              <option>Menunggu</option>
              <option>Terjadwal</option>
              <option>Datang</option>
              <option>Selesai</option>
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
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Memuat data...</span>
          </div>
        ) : guests.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-500 mb-2">Belum ada data tamu</div>
            <div className="text-sm text-gray-400">Data tamu akan muncul di sini setelah tamu melakukan registrasi</div>
          </div>
        ) : (
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
                {/* Guest Data */}
                {guests.map((guest, i) => (
                  <tr key={guest.id || i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-red-600">
                            {guest.nama.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guest.nama}</div>
                          <div className="text-sm text-gray-500">ID: {guest.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.asal_instansi || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.keperluan || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {guest.waktu_checkin 
                          ? new Date(guest.waktu_checkin).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})
                          : "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {guest.waktu_checkin 
                          ? new Date(guest.waktu_checkin).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})
                          : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        guest.status_kunjungan === 'Datang' ? 'bg-blue-100 text-blue-800' :
                        guest.status_kunjungan === 'Selesai' ? 'bg-green-100 text-green-800' :
                        guest.status_kunjungan === 'Terjadwal' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {guest.status_kunjungan || 'Menunggu'}
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
        )}
        
        {/* Pagination */}
        {!isLoading && guests.length > 0 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">1</span> sampai <span className="font-medium">{Math.min(guests.length, 10)}</span> dari{' '}
                <span className="font-medium">{guests.length}</span> hasil
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Sebelumnya
                </button>
                <button className="px-3 py-1 text-sm bg-red-600 text-white rounded">1</button>
                {guests.length > 10 && (
                  <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">2</button>
                )}
                {guests.length > 20 && (
                  <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">3</button>
                )}
                {guests.length > 10 && (
                  <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                    Selanjutnya
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

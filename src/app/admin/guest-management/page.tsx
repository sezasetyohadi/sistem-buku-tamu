"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DaftarTamu } from "@/types/database-types";
import Modal from "@/components/ui/Modal";
import GuestRegistrationForm from '@/components/forms/GuestRegistrationForm';
import GuestDetailModal from '@/components/admin/GuestDetailModal';
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import { toast } from "react-hot-toast";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<DaftarTamu | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<DaftarTamu | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleGuestFormSubmit = async (data: any) => {
    setIsFormSubmitting(true);
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert('Tamu berhasil ditambahkan!');
        setIsModalOpen(false);
        // Refresh the guest list
        await fetchData();
      } else {
        alert(`Gagal menambahkan tamu: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan saat menambahkan tamu. Silakan coba lagi.');
    } finally {
      setIsFormSubmitting(false);
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
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Datang Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : stats.currentlyVisiting}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Pastel Version */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-200 text-red-800 px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-300 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Tambah Tamu</span>
        </button>
        <button className="bg-green-200 text-green-800 px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-300 transition-colors flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          <span>Export Data</span>
        </button>
        <button 
          onClick={handleRefresh}
          className="bg-blue-200 text-blue-800 px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-300 transition-colors flex items-center space-x-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          )}
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
            <div className="inline-flex justify-center items-center w-24 h-24 bg-gray-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM18.5 12l2.25 2.25M18.5 16.5l2.25-2.25" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Tidak ada data tamu</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Belum ada tamu yang terdaftar. Data tamu akan muncul di sini setelah tamu melakukan registrasi atau Anda menambahkan tamu secara manual.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center mx-auto"
            >
              <span className="mr-2">+</span>
              <span>Tambah Tamu Baru</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instansi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kedatangan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guests.map((guest, i) => (
                  <tr 
                    key={guest.id || i} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/guests/${guest.id}/details`);
                        const result = await response.json();
                        
                        if (result.success) {
                          setSelectedGuest(result.data);
                          setIsEditMode(false); // View mode by default when clicking a row
                        } else {
                          console.error('Failed to fetch detailed guest information:', result.message);
                          setSelectedGuest(guest);
                        }
                      } catch (error) {
                        console.error('Error fetching guest details:', error);
                        setSelectedGuest(guest);
                      }
                      setIsDetailModalOpen(true);
                    }}
                  >
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
                        <button 
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50" 
                          title="Edit"
                          onClick={async (e) => {
                            e.stopPropagation();
                            // Handle edit functionality
                            try {
                              const response = await fetch(`/api/guests/${guest.id}/details`);
                              const result = await response.json();
                              
                              if (result.success) {
                                setSelectedGuest(result.data);
                              } else {
                                setSelectedGuest(guest);
                              }
                              
                              setIsEditMode(true); // Set edit mode to true when clicking edit button
                              setIsDetailModalOpen(true);
                            } catch (error) {
                              console.error('Error selecting guest for edit:', error);
                              setSelectedGuest(guest);
                              setIsDetailModalOpen(true);
                            }
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" 
                          title="Hapus"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuestToDelete(guest);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
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

      {/* Modal for adding guests */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Tambah Tamu Baru"
        size="xl"
      >
        <GuestRegistrationForm 
          onSubmit={handleGuestFormSubmit}
          isLoading={isFormSubmitting}
          isInModal={true}
        />
      </Modal>

      {/* Modal for viewing guest details */}
      <GuestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setIsEditMode(false); // Reset edit mode when closing modal
        }}
        guest={selectedGuest}
        onGuestUpdate={handleRefresh}
        isEditMode={isEditMode}
      />

      {/* Delete Confirmation Dialog */}
      {guestToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Konfirmasi Hapus Data"
          message="Apakah Anda yakin ingin menghapus tamu ini dari daftar?"
          itemName={guestToDelete.nama}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setGuestToDelete(null);
          }}
          isLoading={isDeleting}
          onConfirm={async () => {
            try {
              setIsDeleting(true);
              
              const response = await fetch(`/api/guests/${guestToDelete.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              const result = await response.json();
              
              if (!result.success) {
                throw new Error(result.message || 'Gagal menghapus data tamu');
              }
              
              // Remove the guest from the local state to update UI immediately
              setGuests(prev => prev.filter(g => g.id !== guestToDelete.id));
              
              // Show success message
              toast.success('Data tamu berhasil dihapus');
              
              // Close dialog
              setIsDeleteDialogOpen(false);
              setGuestToDelete(null);
              
              // Refresh data completely
              await fetchData();
            } catch (error) {
              console.error('Error deleting guest:', error);
              toast.error('Gagal menghapus data tamu');
            } finally {
              setIsDeleting(false);
            }
          }}
        />
      )}
    </div>
  );
}

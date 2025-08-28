"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DaftarTamu } from "@/types/database-types";
import Modal from "@/components/ui/Modal";
import GuestRegistrationForm from '@/components/forms/GuestRegistrationForm';
import GuestDetailModal from '@/components/admin/GuestDetailModal';
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import { toast } from "react-hot-toast";
import ExcelJS from 'exceljs';

export default function AdminGuestsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [dateFilter, setDateFilter] = useState("Semua Waktu");
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
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter guests based on current filters
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      // Filter by status
      if (statusFilter !== "Semua Status") {
        if (statusFilter === "Proses" && guest.status_kunjungan !== "Datang") {
          return false;
        } else if (statusFilter !== "Proses" && guest.status_kunjungan !== statusFilter) {
          return false;
        }
      }
      
      // Filter by date
      if (dateFilter !== "Semua Waktu") {
        const visitDate = guest.waktu_checkin ? new Date(guest.waktu_checkin) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // End of today
        
        if (!visitDate) return false;
        
        if (dateFilter === "Hari Ini") {
          // Check if visit date is today
          if (visitDate < today || visitDate > endOfToday) return false;
        } 
        else if (dateFilter === "Minggu Ini") {
          // Start of week (Monday of this week)
          const startOfWeek = new Date(today);
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
          startOfWeek.setDate(diff);
          startOfWeek.setHours(0, 0, 0, 0);
          
          if (visitDate < startOfWeek || visitDate > endOfToday) return false;
        } 
        else if (dateFilter === "Bulan Ini") {
          // Start of month
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          startOfMonth.setHours(0, 0, 0, 0);
          
          if (visitDate < startOfMonth || visitDate > endOfToday) return false;
        }
        else if (dateFilter === "Tahun Ini") {
          // Start of year
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          startOfYear.setHours(0, 0, 0, 0);
          
          if (visitDate < startOfYear || visitDate > endOfToday) return false;
        }
      }
      
      // Filter by search term
      if (searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        
        // Check if any field contains the search term
        // Including name, phone number, institution, email
        const matchesSearch = (
          (guest.nama && guest.nama.toLowerCase().includes(searchLower)) ||
          (guest.nomor_telp && guest.nomor_telp.toLowerCase().includes(searchLower)) ||
          (guest.asal_instansi && guest.asal_instansi.toLowerCase().includes(searchLower)) ||
          (guest.email && guest.email.toLowerCase().includes(searchLower)) ||
          (guest.keperluan && guest.keperluan.toLowerCase().includes(searchLower))
        );
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [guests, statusFilter, searchTerm]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
  
  // Reset to first page when filters change dramatically
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredGuests.length, itemsPerPage, totalPages, currentPage]);
  
  // Get current page of guests
  const currentGuests = useMemo(() => {
    return filteredGuests.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
    );
  }, [filteredGuests, currentPage, itemsPerPage]);

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

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Daftar Tamu');
      
      // Add headers
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nama', key: 'nama', width: 30 },
        { header: 'Instansi', key: 'asal_instansi', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'No. Telepon', key: 'nomor_telp', width: 20 },
        { header: 'Keperluan', key: 'keperluan', width: 40 },
        { header: 'Waktu Datang', key: 'waktu_checkin', width: 20 },
        { header: 'Waktu Daftar', key: 'waktu_dibuat', width: 20 },
      ];
      
      // We'll format dates manually for better control over the display
      
      // Add rows from filtered guests
      let rowIndex = 2; // Start from row 2 (after header)
      filteredGuests.forEach(guest => {
        // Create the row first
        const row = worksheet.addRow({
          id: guest.id,
          nama: guest.nama,
          asal_instansi: guest.asal_instansi || '-',
          email: guest.email || '-',
          nomor_telp: guest.nomor_telp || '-',
          keperluan: guest.keperluan || '-',
          // Use empty string for dates initially
          waktu_checkin: '',
          waktu_dibuat: ''
        });
        
        // Then set date values directly with proper formatting
        if (guest.waktu_checkin) {
          try {
            // Parse the date string directly
            const checkinDate = new Date(guest.waktu_checkin);
            
            if (!isNaN(checkinDate.getTime())) {
              // Format the date as a string in the desired format
              const day = String(checkinDate.getDate()).padStart(2, '0');
              const month = String(checkinDate.getMonth() + 1).padStart(2, '0');
              const year = checkinDate.getFullYear();
              const hours = String(checkinDate.getHours()).padStart(2, '0');
              const minutes = String(checkinDate.getMinutes()).padStart(2, '0');
              const seconds = String(checkinDate.getSeconds()).padStart(2, '0');
              
              const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
              
              // Set the cell value as a string with the formatted date
              const cell = row.getCell('waktu_checkin');
              cell.value = formattedDate;
              
              // For debugging
              console.log('Checkin date formatted:', formattedDate);
            }
          } catch (e) {
            console.error('Error parsing checkin date:', e);
          }
        }
        
        if (guest.waktu_dibuat) {
          try {
            // Parse the date string directly
            const createdDate = new Date(guest.waktu_dibuat);
            
            if (!isNaN(createdDate.getTime())) {
              // Format the date as a string in the desired format
              const day = String(createdDate.getDate()).padStart(2, '0');
              const month = String(createdDate.getMonth() + 1).padStart(2, '0');
              const year = createdDate.getFullYear();
              const hours = String(createdDate.getHours()).padStart(2, '0');
              const minutes = String(createdDate.getMinutes()).padStart(2, '0');
              const seconds = String(createdDate.getSeconds()).padStart(2, '0');
              
              const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
              
              // Set the cell value as a string with the formatted date
              const cell = row.getCell('waktu_dibuat');
              cell.value = formattedDate;
              
              // For debugging
              console.log('Created date formatted:', formattedDate);
            }
          } catch (e) {
            console.error('Error parsing creation date:', e);
          }
        }
        
        rowIndex++;
      });
      
      // No need to apply date format to column headers as we're using formatted strings
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Center align all columns
      worksheet.columns.forEach(column => {
        column.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      
      // Apply alignment to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });
      
      // Generate the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Create a blob from the buffer
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[\-:]/g, '').replace('T', '_').split('.')[0];
      a.href = url;
      a.download = `daftar_tamu_${timestamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data berhasil diekspor ke Excel');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
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
      
      // Fetch guest list with timestamp to prevent caching
      const timestamp = new Date().getTime();
      const guestsResponse = await fetch(`/api/guests?t=${timestamp}`, {
        // Add cache: 'no-store' to prevent caching
        cache: 'no-store',
        // Add headers to bust the cache
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
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
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
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
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
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
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
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
              <p className="text-sm font-medium text-gray-600">Proses Hari Ini</p>
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
        <button 
          onClick={handleExportData}
          disabled={isExporting}
          className="bg-green-200 text-green-800 px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-300 transition-colors flex items-center space-x-2">
          {isExporting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          )}
          <span>{isExporting ? "Mengekspor..." : "Export Data"}</span>
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
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cari nama, NIK, atau instansi..."
                value={searchTerm}
                onChange={(e) => {
                  const newSearchTerm = e.target.value;
                  setSearchTerm(newSearchTerm);
                  setCurrentPage(1); // Reset to first page on search
                  
                  // If search is cleared, refresh data to ensure all guests are shown
                  if (newSearchTerm === '' && searchTerm !== '') {
                    handleRefresh();
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    handleRefresh();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title="Hapus pencarian"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option>Semua Status</option>
              <option>Menunggu</option>
              <option>Terjadwal</option>
              <option>Proses</option>
              <option>Selesai</option>
            </select>
            <select 
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option>Hari Ini</option>
              <option>Minggu Ini</option>
              <option>Bulan Ini</option>
              <option>Tahun Ini</option>
              <option>Semua Waktu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Daftar Tamu</h3>
            
            {!isLoading && filteredGuests.length > 0 && (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2 whitespace-nowrap">
                  Tampilkan:
                </span>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to page 1 when changing items per page
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-24"
                  style={{ 
                    WebkitAppearance: 'none', 
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: 'none'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>
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
              {currentGuests.map((guest, i) => (
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
                        {guest.status_kunjungan === 'Datang' ? 'Proses' : guest.status_kunjungan || 'Menunggu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-green-600 hover:text-green-900 p-1" 
                          title={guest.status_kunjungan === "Menunggu" ? "Jadwalkan" : 
                                 guest.status_kunjungan === "Terjadwal" ? "Edit Jadwal" : "Edit"}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const response = await fetch(`/api/guests/${guest.id}/details`);
                              const result = await response.json();
                              
                              if (result.success) {
                                setSelectedGuest(result.data);
                              } else {
                                setSelectedGuest(guest);
                              }
                              
                              // Set edit mode based on guest status
                              setIsEditMode(true);
                              setIsDetailModalOpen(true);
                            } catch (error) {
                              console.error('Error selecting guest for edit:', error);
                              setSelectedGuest(guest);
                              setIsDetailModalOpen(true);
                            }
                          }}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                          </svg>
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 p-1" 
                          title="Hapus"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuestToDelete(guest);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
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
        {!isLoading && filteredGuests.length > 0 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between">
              <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                Menampilkan <span className="font-medium">{filteredGuests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> sampai{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredGuests.length)}</span> dari{' '}
                <span className="font-medium">{filteredGuests.length}</span> hasil
              </div>
              
              <div className="flex space-x-2">
                <button 
                  className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                    currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </button>
                
                {/* Generate page buttons */}
                {Array.from({ length: Math.min(5, Math.ceil(filteredGuests.length / itemsPerPage)) }, (_, i) => {
                  // Calculate page number logic for when there are many pages
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    // Less than 5 pages, just show the page number
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // At the beginning
                    if (i < 4) {
                      pageNum = i + 1;
                    } else {
                      pageNum = totalPages;
                    }
                  } else if (currentPage >= totalPages - 2) {
                    // At the end
                    if (i === 0) {
                      pageNum = 1;
                    } else {
                      pageNum = totalPages - 4 + i;
                    }
                  } else {
                    // In the middle
                    if (i === 0) {
                      pageNum = 1;
                    } else if (i === 4) {
                      pageNum = totalPages;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 text-sm ${
                        pageNum === currentPage
                          ? 'bg-red-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      } rounded`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                    currentPage >= totalPages 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Selanjutnya
                </button>
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
          onSubmit={async (data) => {
            const result = await handleGuestFormSubmit(data);
            return {
              success: true,
              guestData: result
            };
          }}
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

'use client';

import ExcelJS from 'exceljs';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

import GuestDetailModal from '@/components/admin/GuestDetailModal';
import ServiceManagementModal from '@/components/admin/ServiceManagementModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import GuestRegistrationForm from '@/components/forms/GuestRegistrationForm';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { ErrorMessage, TableLoading } from '@/components/ui/loading-states';
import Modal from '@/components/ui/Modal';
import { useErrorHandler, useFetch } from '@/hooks/useErrorHandling';
import { DaftarTamu } from '@/types/database-types';

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function AdminGuestsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [dateFilter, setDateFilter] = useState('Semua Waktu');
  const [stats, setStats] = useState({
    totalGuests: 0,
    todayCheckIn: 0,
    todayCheckOut: 0,
    currentlyVisiting: 0
  });
  const [guests, setGuests] = useState<DaftarTamu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<DaftarTamu | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<DaftarTamu | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  
  // Performance optimization: Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Cache for optimistic updates
  const optimisticUpdatesRef = useRef<Map<number, Partial<DaftarTamu>>>(new Map());
  
  // Memoized date filters for better performance
  const dateFilters = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    
    return { today, endOfToday, startOfWeek, startOfMonth, startOfYear };
  }, []);
  
  // Optimized filter function with better memoization
  const filteredGuests = useMemo(() => {
    let filtered = guests;
    
    // Apply optimistic updates first
    if (optimisticUpdatesRef.current.size > 0) {
      filtered = guests.map(guest => {
        const optimisticUpdate = guest.id ? optimisticUpdatesRef.current.get(guest.id) : null;
        return optimisticUpdate ? { ...guest, ...optimisticUpdate } : guest;
      });
    }
    
    return filtered.filter(guest => {
      // Filter by status
      if (statusFilter !== 'Semua Status') {
        if (statusFilter === 'Proses' && guest.status_kunjungan !== 'Datang') {
          return false;
        } else if (statusFilter !== 'Proses' && guest.status_kunjungan !== statusFilter) {
          return false;
        }
      }
      
      // Filter by date (using optimized date filters)
      if (dateFilter !== 'Semua Waktu') {
        const visitDate = guest.waktu_checkin ? new Date(guest.waktu_checkin) : null;
        if (!visitDate) {return false;}
        
        const { today, endOfToday, startOfWeek, startOfMonth, startOfYear } = dateFilters;
        
        switch (dateFilter) {
          case 'Hari Ini':
            if (visitDate < today || visitDate > endOfToday) {return false;}
            break;
          case 'Minggu Ini':
            if (visitDate < startOfWeek || visitDate > endOfToday) {return false;}
            break;
          case 'Bulan Ini':
            if (visitDate < startOfMonth || visitDate > endOfToday) {return false;}
            break;
          case 'Tahun Ini':
            if (visitDate < startOfYear || visitDate > endOfToday) {return false;}
            break;
        }
      }
      
      // Filter by search term (using debounced value)
      if (debouncedSearchTerm.trim() !== '') {
        const searchLower = debouncedSearchTerm.toLowerCase();
        
        // Check if any field contains the search term
        // Including name, phone number, institution, email, token
        const matchesSearch = (
          (guest.nama && guest.nama.toLowerCase().includes(searchLower)) ||
          (guest.nomor_telp && guest.nomor_telp.toLowerCase().includes(searchLower)) ||
          (guest.asal_instansi && guest.asal_instansi.toLowerCase().includes(searchLower)) ||
          (guest.email && guest.email.toLowerCase().includes(searchLower)) ||
          (guest.keperluan && guest.keperluan.toLowerCase().includes(searchLower)) ||
          (guest.token && guest.token.toLowerCase().includes(searchLower))
        );
        
        if (!matchesSearch) {return false;}
      }
      
      return true;
    });
  }, [guests, statusFilter, dateFilter, debouncedSearchTerm, dateFilters]);
  
  // Optimized pagination calculation with memoization
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredGuests.length);
    const currentGuests = filteredGuests.slice(startIndex, endIndex);
    
    return {
      totalPages,
      currentGuests,
      totalItems: filteredGuests.length,
      startIndex: startIndex + 1,
      endIndex
    };
  }, [filteredGuests, currentPage, itemsPerPage]);
  
  // Reset to first page when filters change dramatically
  useEffect(() => {
    if (currentPage > paginationData.totalPages && paginationData.totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredGuests.length, itemsPerPage, paginationData.totalPages, currentPage]);

  useEffect(() => {
    const initialFetchData = async () => {
      setIsLoading(true);
      try {
        await fetchData();
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialFetchData();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      // Clear optimistic updates when doing full refresh
      optimisticUpdatesRef.current.clear();
      await fetchData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Optimistic update functions for instant UI feedback
  const applyOptimisticUpdate = useCallback((guestId: number, updates: Partial<DaftarTamu>) => {
    optimisticUpdatesRef.current.set(guestId, updates);
    // Force re-render by updating a dummy state
    setGuests(prev => [...prev]);
  }, []);

  const removeOptimisticUpdate = useCallback((guestId: number) => {
    optimisticUpdatesRef.current.delete(guestId);
    setGuests(prev => [...prev]);
  }, []);

  // Prefetch guest details on hover for better UX
  const prefetchGuestDetails = useCallback(async (guestId: number) => {
    try {
      const response = await fetch(`/api/guests/${guestId}/details`);
      if (response.ok) {
        const result = await response.json();
        // Store in a simple cache for immediate use
        sessionStorage.setItem(`guest_${guestId}`, JSON.stringify(result.data));
      }
    } catch (error) {
      // Silently fail - this is just for prefetching
      console.debug('Prefetch failed for guest', guestId, error);
    }
  }, []);
  const handleGuestUpdateOptimistic = useCallback(async (updatedGuest?: DaftarTamu) => {
    if (updatedGuest && updatedGuest.id) {
      // Apply optimistic update immediately
      applyOptimisticUpdate(updatedGuest.id, {
        status_kunjungan: updatedGuest.status_kunjungan,
        waktu_checkin: updatedGuest.waktu_checkin,
        waktu_checkout: updatedGuest.waktu_checkout
      });

      // Remove optimistic update after a delay and refresh
      setTimeout(() => {
        removeOptimisticUpdate(updatedGuest.id!);
        handleRefresh();
      }, 500);
    } else {
      // Fallback to regular refresh
      handleRefresh();
    }
  }, [applyOptimisticUpdate, removeOptimisticUpdate]);

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
        // Refresh the guest list
        await fetchData();
        
        // Show success message with token info if available
        if (result.data?.token) {
          toast.success('Tamu dan token berhasil ditambahkan!');
          //toast.success(`Tamu berhasil ditambahkan! Token: ${result.data.token.token}`);
        } else {
          toast.success('Tamu berhasil ditambahkan!');
        }
        
        // Always close modal for admin flow, but show token if created
        setIsModalOpen(false);
        
        // Return the expected structure for the form component
        return {
          success: true,
          guestData: result.data,
          tokenData: result.data?.token
        };
      } else {
        // Show error message
        toast.error(`Gagal menambahkan tamu: ${result.message}`);
        
        // Return error structure
        return {
          success: false,
          guestData: null,
          tokenData: null
        };
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error message
      toast.error('Terjadi kesalahan saat menambahkan tamu. Silakan coba lagi.');
      
      // Return error structure
      return {
        success: false,
        guestData: null,
        tokenData: null
      };
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
        { header: 'Pendidikan Terakhir', key: 'pendidikan_terakhir', width: 20 },
        { header: 'Profesi', key: 'profesi', width: 20 },
        { header: 'Bidang Tujuan', key: 'bidang_tujuan', width: 25 },
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
          pendidikan_terakhir: guest.pendidikan_terakhir || '-',
          profesi: guest.profesi || '-',
          bidang_tujuan: guest.bidang_tujuan || '-',
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
      a.download = `Data Tamu_${timestamp}.xlsx`;
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
      setError(null); // Clear previous errors
      
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
        const responseData = guestsData.data;
        
        // Handle new paginated structure from performance optimization
        let guestsArray: any[] = [];
        if (responseData && typeof responseData === 'object') {
          // New paginated structure: { guests, total, page, limit }
          if (Array.isArray(responseData.guests)) {
            guestsArray = responseData.guests;
          }
          // Legacy structure: direct array
          else if (Array.isArray(responseData)) {
            guestsArray = responseData;
          }
        }
        
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
          setError('Format data tidak valid dari server');
        }
      } else {
        setError('Gagal mengambil data tamu dari server');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setGuests([]);
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
        } else if (error.message.includes('JSON')) {
          setError('Server mengembalikan data yang tidak valid.');
        } else {
          setError(error.message || 'Terjadi kesalahan saat mengambil data');
        }
      } else {
        setError('Terjadi kesalahan yang tidak diketahui');
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">Manajemen Data Tamu</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 leading-relaxed">Kelola semua data tamu yang telah mendaftar dalam sistem</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorMessage
              message={error}
              type="error"
              action={{
                label: 'Coba Lagi',
                onClick: () => {
                  setError(null);
                  handleRefresh();
                }
              }}
            />
          </div>
        )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Tamu</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{isLoading ? '...' : stats.totalGuests}</p>
            </div>
          </div>
        </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 min-w-0">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Terjadwal Hari Ini</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{isLoading ? '...' : stats.todayCheckIn}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 min-w-0">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Selesai Hari Ini</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{isLoading ? '...' : stats.todayCheckOut}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 min-w-0">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Proses Hari Ini</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{isLoading ? '...' : stats.currentlyVisiting}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Pastel Version */}
        <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-200 text-red-800 px-3 sm:px-4 lg:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-300 transition-colors flex items-center space-x-1 sm:space-x-2 min-w-0"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="whitespace-nowrap">Tambah Tamu</span>
          </button>
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="bg-purple-200 text-purple-800 px-3 sm:px-4 lg:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-300 transition-colors flex items-center space-x-1 sm:space-x-2 min-w-0"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="whitespace-nowrap">Tambah Layanan</span>
          </button>
          <button 
            onClick={handleExportData}
            disabled={isExporting}
            className="bg-green-200 text-green-800 px-3 sm:px-4 lg:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-300 transition-colors flex items-center space-x-1 sm:space-x-2 min-w-0 disabled:opacity-50 disabled:cursor-not-allowed">
            {isExporting ? (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            )}
            <span className="whitespace-nowrap">{isExporting ? 'Mengekspor...' : 'Export Data'}</span>
          </button>
          <button 
            onClick={handleRefresh}
            className="bg-blue-200 text-blue-800 px-3 sm:px-4 lg:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-300 transition-colors flex items-center space-x-1 sm:space-x-2 min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            )}
            <span className="whitespace-nowrap">{isLoading ? 'Memuat...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6 lg:mb-8 overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-3 lg:gap-4">
              <div className="flex-1 relative min-w-0">
                <input
                  type="text"
                  placeholder="Cari nama, NIK, instansi, atau token..."
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                {searchTerm && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      handleRefresh();
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                    title="Hapus pencarian"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white min-w-0 sm:min-w-[140px] transition-colors"
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
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white min-w-0 sm:min-w-[140px] transition-colors"
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
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Daftar Tamu</h3>
              
              {!isLoading && filteredGuests.length > 0 && (
                <div className="flex items-center">
                  <span className="text-xs sm:text-sm text-gray-700 mr-2 whitespace-nowrap">
                    Tampilkan:
                  </span>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to page 1 when changing items per page
                    }}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-14 sm:w-20 bg-white transition-colors"
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
            <div className="flex justify-center items-center py-12 sm:py-16 lg:py-20">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 border-t-2 border-b-2 border-red-600"></div>
              <span className="ml-3 text-sm sm:text-base text-gray-600">Memuat data...</span>
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
              <div className="inline-flex justify-center items-center w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-gray-100 rounded-full mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM18.5 12l2.25 2.25M18.5 16.5l2.25-2.25" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">Tidak ada data tamu</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto mb-6">
                Belum ada tamu yang terdaftar. Data tamu akan muncul di sini setelah tamu melakukan registrasi atau Anda menambahkan tamu secara manual.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors flex items-center mx-auto"
              >
                <span className="mr-2">+</span>
                <span>Tambah Tamu Baru</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="w-full min-w-[1000px] table-fixed">{/* Fixed table layout for better performance */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Tamu</th>
                    <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell min-w-[150px]">Instansi</th>
                    <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[150px]">Tujuan</th>
                    <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[120px]">Kedatangan</th>
                    <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
                    <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Token</th>
                    <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginationData.currentGuests.map((guest: DaftarTamu, i: number) => {
                    const hasOptimisticUpdate = guest.id && optimisticUpdatesRef.current.has(guest.id);
                    return (
                      <tr 
                        key={guest.id || i} 
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${hasOptimisticUpdate ? 'bg-blue-50 opacity-75' : ''}`}
                        onMouseEnter={() => guest.id && prefetchGuestDetails(guest.id)}
                        onClick={async () => {
                          try {
                            // Try to use prefetched data first
                            const cachedData = sessionStorage.getItem(`guest_${guest.id}`);
                            if (cachedData) {
                              const parsedData = JSON.parse(cachedData);
                              setSelectedGuest(parsedData);
                              setIsEditMode(false);
                              setIsDetailModalOpen(true);
                              return;
                            }

                            // Fallback to API call if no cached data
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
                        <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs sm:text-sm font-bold text-red-600">
                                {guest.nama.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1 overflow-hidden">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{guest.nama}</div>
                              <div className="text-xs text-gray-500 hidden sm:block">ID: {guest.id}</div>
                              <div className="text-xs text-gray-500 sm:hidden block truncate">{guest.asal_instansi || guest.keperluan || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px]">{guest.asal_instansi || '-'}</div>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px]">{guest.bidang_tujuan || '-'}</div>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {guest.waktu_checkin 
                              ? new Date(guest.waktu_checkin).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {guest.waktu_checkin 
                              ? new Date(guest.waktu_checkin).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </div>
                        </td>
                         <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                           <span className={`inline-flex px-1.5 sm:px-2 py-1 text-xs font-semibold rounded-full ${
                             guest.status_kunjungan === 'Datang' ? 'bg-blue-100 text-blue-800' :
                             guest.status_kunjungan === 'Selesai' ? 'bg-green-100 text-green-800' :
                             guest.status_kunjungan === 'Terjadwal' ? 'bg-orange-100 text-orange-800' :
                             'bg-gray-100 text-gray-800'
                           }`}>
                             <span className="hidden sm:inline">{guest.status_kunjungan === 'Datang' ? 'Proses' : guest.status_kunjungan || 'Menunggu'}</span>
                             <span className="sm:hidden">
                               {guest.status_kunjungan === 'Datang' ? 'P' : 
                                guest.status_kunjungan === 'Selesai' ? 'S' :
                                guest.status_kunjungan === 'Terjadwal' ? 'T' : 'M'}
                             </span>
                           </span>
                         </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900 max-w-[120px]">
                              {guest.token ? (
                                <div className="flex items-center space-x-1">
                                  <code 
                                    className="px-1 sm:px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono cursor-help flex-shrink-0"
                                    title={`Token lengkap: ${guest.token}`}
                                  >
                                    {guest.token.substring(0, 6)}...
                                  </code>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Fallback clipboard copy method
                                      const copyToClipboard = async (text: string) => {
                                        try {
                                          if (navigator.clipboard && window.isSecureContext) {
                                            // Use modern Clipboard API if available and in secure context
                                            await navigator.clipboard.writeText(text);
                                            toast.success('Token lengkap berhasil disalin!');
                                          } else {
                                            // Fallback for non-secure contexts
                                            const textArea = document.createElement('textarea');
                                            textArea.value = text;
                                            textArea.style.position = 'fixed';
                                            textArea.style.left = '-999999px';
                                            textArea.style.top = '-999999px';
                                            document.body.appendChild(textArea);
                                            textArea.focus();
                                            textArea.select();
                                            document.execCommand('copy');
                                            textArea.remove();
                                            toast.success('Token lengkap berhasil disalin!');
                                          }
                                        } catch (err) {
                                          console.error('Failed to copy token:', err);
                                          toast.error('Gagal menyalin token');
                                        }
                                      };
                                      
                                      if (guest.token) {
                                        copyToClipboard(guest.token);
                                      } else {
                                        toast.error('Token tidak tersedia');
                                      }
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
                                    title="Salin token lengkap"
                                  >
                                   <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                   </svg>
                                 </button>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </div>
                          </td>
                         <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex space-x-1">
                            <button 
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors" 
                              title={guest.status_kunjungan === 'Menunggu' ? 'Jadwalkan' : 
                                     guest.status_kunjungan === 'Terjadwal' ? 'Edit Jadwal' : 'Edit'}
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
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                              </svg>
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" 
                              title="Hapus"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGuestToDelete(guest);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && filteredGuests.length > 0 && (
              <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 border-t border-gray-200">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{paginationData.startIndex}</span> sampai{' '}
                    <span className="font-medium">{paginationData.endIndex}</span> dari{' '}
                    <span className="font-medium">{paginationData.totalItems}</span> tamu
                    {debouncedSearchTerm && (
                      <span className="text-gray-500 ml-2">(filtered)</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-1 justify-center sm:justify-end">
                    <button 
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded transition-colors ${
                        currentPage === 1 ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                      onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
                      disabled={currentPage === 1}
                    >
                      <span className="hidden sm:inline">Sebelumnya</span>
                      <span className="sm:hidden">‹</span>
                    </button>
                    
                    {/* Generate page buttons */}
                    {Array.from({ length: Math.min(5, Math.ceil(filteredGuests.length / itemsPerPage)) }, (_, i) => {
                      // Calculate page number logic for when there are many pages
                      let pageNum;
                      
                      if (paginationData.totalPages <= 5) {
                        // Less than 5 pages, just show the page number
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        // At the beginning
                        if (i < 4) {
                          pageNum = i + 1;
                        } else {
                          pageNum = paginationData.totalPages;
                        }
                      } else if (currentPage >= paginationData.totalPages - 2) {
                        // At the end
                        if (i === 0) {
                          pageNum = 1;
                        } else {
                          pageNum = paginationData.totalPages - 4 + i;
                        }
                      } else {
                        // In the middle
                        if (i === 0) {
                          pageNum = 1;
                        } else if (i === 4) {
                          pageNum = paginationData.totalPages;
                        } else {
                          pageNum = currentPage - 1 + i;
                        }
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded transition-colors ${
                            pageNum === currentPage
                              ? 'bg-red-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded transition-colors ${
                        currentPage >= paginationData.totalPages 
                          ? 'bg-gray-100 cursor-not-allowed text-gray-400' 
                          : 'bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                      onClick={() => currentPage < paginationData.totalPages && setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= paginationData.totalPages}
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <span className="sm:hidden">›</span>
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
        onGuestUpdate={handleGuestUpdateOptimistic}
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

      {/* Service Management Modal */}
      <ServiceManagementModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onServiceAdded={handleRefresh}
      />
      </div>
    </div>
  );
}

// Wrap component with error boundary
export default function GuestManagementWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <AdminGuestsManagement />
    </ErrorBoundary>
  );
}

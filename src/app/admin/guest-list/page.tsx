'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { DaftarTamu } from '@/types/database-types';
import { useAuth } from '@/contexts/AuthContext';

import GuestListTable from '@/components/admin/GuestListTable';

export default function GuestListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [guests, setGuests] = useState<DaftarTamu[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Minimal access check - most logic is now in layout
  useEffect(() => {
    if (user) {
      // Immediate redirect for admin resepsionis without waiting
      if (user.bidang_tujuan_id === 999) {
        console.log('Guest-list: Admin resepsionis detected - immediate redirect to dashboard');
        toast.error('Anda tidak memiliki akses ke halaman ini');
        router.replace('/admin');
        return;
      }
      
      // Only allow access for non-999 bidang_tujuan_id
      if (user.bidang_tujuan_id !== 999) {
        console.log('Guest-list: Confirmed access for bidang_tujuan_id:', user.bidang_tujuan_id);
        setAccessLoading(false);
      }
    }
  }, [user, router]);

  // Fetch guests data
  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guests', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch guests');
      }

      const result = await response.json();
      
      if (result.success) {
        setGuests(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch guests');
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Gagal memuat data tamu');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!accessLoading) {
      fetchGuests();
    }
  }, [accessLoading]);

  // Filter guests based on search term and bidang
  const filteredGuests = React.useMemo(() => {
    let filtered = [...guests];

    // Filter by admin's bidang_tujuan_id - only show guests assigned to this bidang
    if (user?.bidang_tujuan_id) {
      filtered = filtered.filter(guest => 
        guest.bidang_tujuan_id === user.bidang_tujuan_id && 
        guest.bidang_tujuan_id !== null && 
        guest.bidang_tujuan_id !== undefined
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(guest => 
        guest.nama?.toLowerCase().includes(searchLower) ||
        guest.asal_instansi?.toLowerCase().includes(searchLower) ||
        guest.bidang_tujuan?.toLowerCase().includes(searchLower) ||
        guest.asn_dituju?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [guests, searchTerm, user?.bidang_tujuan_id]);

  // Handle refresh
  const handleRefresh = () => {
    fetchGuests();
  };

  // Show loading screen while checking access
  if (accessLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            List Tamu
          </h1>
          <p className="text-gray-600">
            Daftar tamu yang ditugaskan ke bidang Anda
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pencarian
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama, instansi, tujuan, atau ASN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clear Search */}
            {searchTerm && (
              <div className="flex-shrink-0 flex items-end">
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Search Summary */}
          {searchTerm && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <span>Menampilkan {filteredGuests.length} dari {guests.length} tamu</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  "{searchTerm}"
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Guest List Table */}
        <GuestListTable
          data={filteredGuests}
          loading={loading}
          onRefresh={handleRefresh}
          maxHeight="600px"
          emptyMessage={
            searchTerm
              ? 'Tidak ada tamu yang sesuai dengan pencarian'
              : 'Belum ada data tamu'
          }
        />
      </div>
    </div>
  );
}
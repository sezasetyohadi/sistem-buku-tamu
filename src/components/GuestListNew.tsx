'use client';

import React, { useState } from 'react';
import Card from './ui/Card';
import PrimaryButton from './ui/PrimaryButton';
import FormInput from './ui/FormInput';

interface Guest {
  id: number;
  nama: string;
  email?: string;
  alamat?: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  pendidikan_terakhir?: string;
  profesi?: string;
  asal_instansi?: string;
  keperluan?: string;
  tanggal_kunjungan: string;
  waktu_kunjungan?: string;
  tanggapan?: boolean;
  file_upload?: string;
}

interface GuestListProps {
  guests?: Guest[];
  isLoading?: boolean;
  onViewDetails?: (guest: Guest) => void;
  onCheckIn?: (guestId: string) => void;
  onCheckOut?: (guestId: string) => void;
}

export default function GuestList({ 
  guests = [], 
  isLoading = false, 
  onViewDetails, 
  onCheckIn, 
  onCheckOut 
}: GuestListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tanggal_kunjungan');

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.asal_instansi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.keperluan?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const sortedGuests = [...filteredGuests].sort((a, b) => {
    if (sortBy === 'tanggal_kunjungan') {
      return new Date(b.tanggal_kunjungan).getTime() - new Date(a.tanggal_kunjungan).getTime();
    }
    if (sortBy === 'nama') {
      return a.nama.localeCompare(b.nama);
    }
    return 0;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // HH:MM format
  };

  if (isLoading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data tamu...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <FormInput
              label="Cari Tamu"
              name="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama, email, instansi, atau keperluan..."
            />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Urutkan berdasarkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tanggal_kunjungan">Tanggal Kunjungan</option>
              <option value="nama">Nama</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Tamu</div>
            <div className="text-2xl font-bold text-blue-600">{guests.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Hari Ini</div>
            <div className="text-2xl font-bold text-green-600">
              {guests.filter(g => g.tanggal_kunjungan === new Date().toISOString().split('T')[0]).length}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Minggu Ini</div>
            <div className="text-2xl font-bold text-orange-600">
              {guests.filter(g => {
                const guestDate = new Date(g.tanggal_kunjungan);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return guestDate >= weekAgo;
              }).length}
            </div>
          </div>
        </div>
      </Card>

      {/* Guest List */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Daftar Tamu ({sortedGuests.length})
        </h3>

        {sortedGuests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada data tamu</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Tidak ada tamu yang sesuai dengan pencarian.' : 'Belum ada tamu yang terdaftar.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedGuests.map((guest) => (
              <div
                key={guest.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{guest.nama}</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          👤 {guest.jenis_kelamin}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span> {guest.email || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Tanggal:</span> {formatDate(guest.tanggal_kunjungan)}
                      </div>
                      {guest.asal_instansi && (
                        <div>
                          <span className="font-medium">Instansi:</span> {guest.asal_instansi}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Waktu:</span> {formatTime(guest.waktu_kunjungan)}
                      </div>
                      {guest.keperluan && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Keperluan:</span> {guest.keperluan}
                        </div>
                      )}
                      {guest.profesi && (
                        <div>
                          <span className="font-medium">Profesi:</span> {guest.profesi}
                        </div>
                      )}
                      {guest.pendidikan_terakhir && (
                        <div>
                          <span className="font-medium">Pendidikan:</span> {guest.pendidikan_terakhir}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 md:ml-4">
                    <PrimaryButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewDetails?.(guest)}
                    >
                      👁️ Detail
                    </PrimaryButton>
                    <PrimaryButton
                      variant="primary"
                      size="sm"
                      onClick={() => onCheckIn?.(guest.id.toString())}
                    >
                      ✅ Check-in
                    </PrimaryButton>
                    <PrimaryButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onCheckOut?.(guest.id.toString())}
                    >
                      ↩️ Check-out
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

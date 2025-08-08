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
          <p className="text-gray-800">Memuat data tamu...</p>
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
            <label className="block text-sm font-semibold text-gray-800 mb-2">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-50 font-medium text-sm">Total Tamu</div>
                <div className="text-3xl font-bold mt-1">{guests.length}</div>
                <div className="text-blue-50 text-xs mt-1">Keseluruhan data</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-50 font-medium text-sm">Hari Ini</div>
                <div className="text-3xl font-bold mt-1">
                  {guests.filter(g => g.tanggal_kunjungan === new Date().toISOString().split('T')[0]).length}
                </div>
                <div className="text-green-50 text-xs mt-1">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-50 font-medium text-sm">Minggu Ini</div>
                <div className="text-3xl font-bold mt-1">
                  {guests.filter(g => {
                    const guestDate = new Date(g.tanggal_kunjungan);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return guestDate >= weekAgo;
                  }).length}
                </div>
                <div className="text-orange-50 text-xs mt-1">7 hari terakhir</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
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
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum ada data tamu</h3>
            <p className="text-gray-700">
              {searchTerm ? 'Tidak ada tamu yang sesuai dengan pencarian.' : 'Belum ada tamu yang terdaftar.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sortedGuests.map((guest) => (
              <div
                key={guest.id}
                className="bg-gradient-to-r from-white via-blue-50 to-white border border-blue-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Guest Info Section */}
                  <div className="flex-1">
                    {/* Header with Name and Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-xl">{guest.nama}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                              {guest.jenis_kelamin === 'Laki-laki' ? (
                                <svg className="w-4 h-4 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9.5 11c1.93 0 3.5 1.57 3.5 3.5S11.43 18 9.5 18 6 16.43 6 14.5 7.57 11 9.5 11zm0-2C6.46 9 4 11.46 4 14.5S6.46 20 9.5 20s5.5-2.46 5.5-5.5-2.46-5.5-5.5-5.5zM16.5 9L19 6.5 17.5 5l-2.5 2.5V4h-2v6h6V8h-2.5z"/>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 mr-1 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 10c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4z"/>
                                  <circle cx="12" cy="8" r="2"/>
                                  <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                  <path d="M12 4L9 7h6l-3-3z"/>
                                </svg>
                              )}
                              {guest.jenis_kelamin}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(guest.tanggal_kunjungan)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-800 font-medium">Email</div>
                          <div className="text-sm font-semibold text-gray-900">{guest.email || 'Tidak tersedia'}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-800 font-medium">Waktu</div>
                          <div className="text-sm font-semibold text-gray-900">{formatTime(guest.waktu_kunjungan)}</div>
                        </div>
                      </div>

                      {guest.asal_instansi && (
                        <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-gray-100">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-gray-800 font-medium">Instansi</div>
                            <div className="text-sm font-semibold text-gray-900">{guest.asal_instansi}</div>
                          </div>
                        </div>
                      )}

                      {guest.profesi && (
                        <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-gray-100">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-gray-800 font-medium">Profesi</div>
                            <div className="text-sm font-semibold text-gray-900">{guest.profesi}</div>
                          </div>
                        </div>
                      )}

                      {guest.pendidikan_terakhir && (
                        <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-gray-100">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-gray-800 font-medium">Pendidikan</div>
                            <div className="text-sm font-semibold text-gray-900">{guest.pendidikan_terakhir}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Purpose Section */}
                    {guest.keperluan && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          <span className="text-sm font-semibold text-yellow-800">Keperluan Kunjungan</span>
                        </div>
                        <p className="text-sm text-yellow-700 leading-relaxed">{guest.keperluan}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 mt-6 lg:mt-0 lg:ml-6 lg:min-w-[160px]">
                    <PrimaryButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewDetails?.(guest)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Detail
                    </PrimaryButton>
                    <PrimaryButton
                      variant="success"
                      size="sm"
                      onClick={() => onCheckIn?.(guest.id.toString())}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Check-in
                    </PrimaryButton>
                    <PrimaryButton
                      variant="warning"
                      size="sm"
                      onClick={() => onCheckOut?.(guest.id.toString())}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Check-out
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

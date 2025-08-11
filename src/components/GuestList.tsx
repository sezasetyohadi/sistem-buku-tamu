// Komponen untuk menampilkan daftar tamu
// Filename: GuestList.tsx

'use client';

import React, { useState } from 'react';
import Card from './ui/Card';
import PrimaryButton from './ui/PrimaryButton';
import FormInput from './ui/FormInput';
import Modal from './ui/Modal';

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

const mockGuests: Guest[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '08123456789',
    company: 'PT Teknologi Maju',
    purpose: 'meeting',
    department: 'it',
    visitDate: '2024-01-15',
    checkInTime: '09:30',
    status: 'checked-in',
    notes: 'Meeting dengan tim IT'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '08987654321',
    company: 'CV Digital Solutions',
    purpose: 'interview',
    department: 'hr',
    visitDate: '2024-01-15',
    status: 'waiting',
    notes: 'Interview untuk posisi developer'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.j@email.com',
    phone: '08555123456',
    company: 'PT Media Kreatif',
    purpose: 'consultation',
    department: 'marketing',
    visitDate: '2024-01-14',
    checkInTime: '14:00',
    checkOutTime: '16:30',
    status: 'checked-out',
    notes: 'Konsultasi strategi marketing'
  }
];

const purposeLabels = {
  meeting: 'Meeting/Rapat',
  interview: 'Interview',
  delivery: 'Pengiriman',
  maintenance: 'Maintenance',
  consultation: 'Konsultasi',
  other: 'Lainnya'
};

const departmentLabels = {
  hr: 'Human Resources',
  it: 'Information Technology',
  finance: 'Finance & Accounting',
  marketing: 'Marketing & Sales',
  operations: 'Operations',
  management: 'Management'
};

const statusLabels = {
  waiting: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  'checked-in': { label: 'Check-in', color: 'bg-green-100 text-green-800', icon: '✅' },
  'checked-out': { label: 'Check-out', color: 'bg-gray-100 text-gray-800', icon: '📤' }
};

export default function GuestList({ 
  guests = mockGuests, 
  isLoading = false,
  onViewDetails,
  onCheckIn,
  onCheckOut
}: GuestListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || guest.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowModal(true);
    onViewDetails?.(guest);
  };

  const handleCheckIn = (guestId: string) => {
    onCheckIn?.(guestId);
  };

  const handleCheckOut = (guestId: string) => {
    onCheckOut?.(guestId);
  };

  if (isLoading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D5DC3]"></div>
          <span className="ml-3 text-gray-800">Memuat data tamu...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter dan Search */}
      <Card variant="elevated" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <FormInput
              placeholder="Cari nama, email, atau perusahaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="waiting">Menunggu</option>
              <option value="checked-in">Check-in</option>
              <option value="checked-out">Check-out</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="gradient" padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#3D5DC3]">{guests.length}</div>
            <div className="text-sm text-gray-800">Total Tamu</div>
          </div>
        </Card>
        
        <Card variant="gradient" padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{guests.filter(g => g.status === 'waiting').length}</div>
            <div className="text-sm text-gray-800">Menunggu</div>
          </div>
        </Card>
        
        <Card variant="gradient" padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{guests.filter(g => g.status === 'checked-in').length}</div>
            <div className="text-sm text-gray-800">Check-in</div>
          </div>
        </Card>
        
        <Card variant="gradient" padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{guests.filter(g => g.status === 'checked-out').length}</div>
            <div className="text-sm text-gray-800">Check-out</div>
          </div>
        </Card>
      </div>

      {/* Guest List */}
      <Card variant="elevated" padding="lg">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Daftar Tamu Hari Ini</h2>
          <p className="text-gray-800">Menampilkan {filteredGuests.length} dari {guests.length} tamu</p>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-700 text-6xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada tamu ditemukan</h3>
            <p className="text-gray-800">Coba ubah kata kunci pencarian atau filter status</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{guest.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[guest.status].color}`}>
                        {statusLabels[guest.status].icon} {statusLabels[guest.status].label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-800">
                      <div className="flex items-center">
                        <span className="mr-2">📧</span>
                        {guest.email}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📱</span>
                        {guest.phone}
                      </div>
                      {guest.company && (
                        <div className="flex items-center">
                          <span className="mr-2">🏢</span>
                          {guest.company}
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="mr-2">🎯</span>
                        {purposeLabels[guest.purpose as keyof typeof purposeLabels]}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🏛️</span>
                        {departmentLabels[guest.department as keyof typeof departmentLabels]}
                      </div>
                      {guest.checkInTime && (
                        <div className="flex items-center">
                          <span className="mr-2">⏰</span>
                          Check-in: {guest.checkInTime}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <PrimaryButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewDetails(guest)}
                    >
                      Detail
                    </PrimaryButton>
                    
                    {guest.status === 'waiting' && (
                      <PrimaryButton
                        variant="success"
                        size="sm"
                        onClick={() => handleCheckIn(guest.id)}
                      >
                        Check-in
                      </PrimaryButton>
                    )}
                    
                    {guest.status === 'checked-in' && (
                      <PrimaryButton
                        variant="warning"
                        size="sm"
                        onClick={() => handleCheckOut(guest.id)}
                      >
                        Check-out
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Detail Tamu */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detail Tamu"
        size="lg"
      >
        {selectedGuest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <p className="text-gray-900">{selectedGuest.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusLabels[selectedGuest.status].color}`}>
                  {statusLabels[selectedGuest.status].icon} {statusLabels[selectedGuest.status].label}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{selectedGuest.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telepon</label>
                <p className="text-gray-900">{selectedGuest.phone}</p>
              </div>
              
              {selectedGuest.company && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Perusahaan</label>
                  <p className="text-gray-900">{selectedGuest.company}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kunjungan</label>
                <p className="text-gray-900">{selectedGuest.visitDate}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tujuan</label>
                <p className="text-gray-900">{purposeLabels[selectedGuest.purpose as keyof typeof purposeLabels]}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Departemen</label>
                <p className="text-gray-900">{departmentLabels[selectedGuest.department as keyof typeof departmentLabels]}</p>
              </div>
              
              {selectedGuest.checkInTime && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Waktu Check-in</label>
                  <p className="text-gray-900">{selectedGuest.checkInTime}</p>
                </div>
              )}
              
              {selectedGuest.checkOutTime && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Waktu Check-out</label>
                  <p className="text-gray-900">{selectedGuest.checkOutTime}</p>
                </div>
              )}
            </div>
            
            {selectedGuest.notes && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedGuest.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

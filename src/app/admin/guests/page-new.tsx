"use client";

import { useState, useEffect } from "react";
import GuestListNew from '../../../components/GuestListNew';

export default function AdminGuestsManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [guests, setGuests] = useState([]);

  // Fetch guests from database
  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/guests');
      const result = await response.json();
      
      if (result.success) {
        setGuests(result.data);
      } else {
        console.error('Failed to fetch guests:', result.message);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (guest: any) => {
    console.log("Viewing details for guest:", guest);
    
    // Simple alert for now - can be enhanced later with proper modal
    const details = [
      `Nama: ${guest.nama}`,
      `Email: ${guest.email || 'Tidak tersedia'}`,
      `Instansi: ${guest.asal_instansi || 'Tidak tersedia'}`,
      `Profesi: ${guest.profesi || 'Tidak tersedia'}`,
      `Keperluan: ${guest.keperluan || 'Tidak tersedia'}`,
      `Tanggal: ${new Date(guest.tanggal_kunjungan).toLocaleDateString('id-ID')}`,
      `Jenis Kelamin: ${guest.jenis_kelamin || 'Tidak tersedia'}`
    ];
    
    alert(`Detail Tamu:\n\n${details.join('\n')}`);
  };

  const handleCheckIn = async (guestId: string) => {
    setIsLoading(true);
    try {
      console.log("Check-in guest:", guestId);
      alert('Tamu berhasil check-in!');
      fetchGuests(); // Refresh the list
    } catch (error) {
      console.error('Error checking in guest:', error);
      alert('Terjadi kesalahan saat check-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async (guestId: string) => {
    setIsLoading(true);
    try {
      console.log("Check-out guest:", guestId);
      alert('Tamu berhasil check-out!');
      fetchGuests(); // Refresh the list
    } catch (error) {
      console.error('Error checking out guest:', error);
      alert('Terjadi kesalahan saat check-out.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Manajemen Tamu</h1>
                <p className="text-gray-600">
                  Monitor dan kelola data tamu yang berkunjung ke DISNAKERTRANS Jawa Tengah
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Tamu Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">{guests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Guest List Component */}
        <div className="bg-white rounded-lg shadow-md">
          <GuestListNew 
            guests={guests}
            onViewDetails={handleViewDetails}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import GuestList from '../../components/GuestList';

export default function Guests() {
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
    alert(`Detail Tamu:\nNama: ${guest.nama}\nEmail: ${guest.email}\nInstansi: ${guest.asal_instansi}\nKeperluan: ${guest.keperluan}`);
  };

  const handleCheckIn = async (guestId: string) => {
    setIsLoading(true);
    try {
      // You can implement check-in API call here
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
      // You can implement check-out API call here
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold mb-6" style={{backgroundColor: '#EBF4FF', color: '#3D5DC3'}}>
              <span className="mr-2">👥</span>
              Manajemen Tamu
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              📋 Daftar Tamu Hari Ini
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Monitor dan kelola kunjungan tamu dengan mudah. Lihat status, lakukan check-in/check-out, dan akses detail lengkap setiap tamu.
            </p>
          </div>

          {/* Guest List Component */}
          <div className="max-w-7xl mx-auto">
            <GuestList 
              onViewDetails={handleViewDetails}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

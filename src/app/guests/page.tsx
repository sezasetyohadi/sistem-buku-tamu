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
    
    // Create a beautiful modal content with landscape layout
    const modalContent = `
      <div style="
        width: 90vw;
        max-width: 1000px;
        height: 70vh;
        max-height: 600px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 0;
        color: white;
        font-family: system-ui, sans-serif;
        box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 20px 30px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <div style="
                width: 50px;
                height: 50px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 16px;
              ">
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <h2 style="margin: 0; font-size: 24px; font-weight: bold;">${guest.nama}</h2>
                <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
                  <span style="color: ${guest.jenis_kelamin === 'Laki-laki' ? '#3B82F6' : '#EC4899'};">
                    ⚤ ${guest.jenis_kelamin}
                  </span> • 📅 ${new Date(guest.tanggal_kunjungan).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <button onclick="this.closest('.modal-overlay').remove()" style="
              background: rgba(255,255,255,0.2);
              border: none;
              width: 35px;
              height: 35px;
              border-radius: 50%;
              color: white;
              cursor: pointer;
              font-size: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">×</button>
          </div>
        </div>

        <!-- Content -->
        <div style="
          flex: 1;
          padding: 30px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        ">
          <!-- Main Info Grid -->
          <div style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 24px;
            flex-shrink: 0;
          ">
            <div style="
              background: rgba(255,255,255,0.1);
              padding: 16px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
            ">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="margin-right: 8px; font-size: 16px;">�</span>
                <strong style="font-size: 13px;">Email</strong>
              </div>
              <p style="margin: 0; opacity: 0.9; font-size: 14px; word-break: break-all;">${guest.email || 'Tidak tersedia'}</p>
            </div>

            <div style="
              background: rgba(255,255,255,0.1);
              padding: 16px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
            ">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="margin-right: 8px; font-size: 16px;">⏰</span>
                <strong style="font-size: 13px;">Waktu Kunjungan</strong>
              </div>
              <p style="margin: 0; opacity: 0.9; font-size: 14px;">${guest.waktu_kunjungan?.substring(0, 5) || 'Tidak tersedia'}</p>
            </div>

            <div style="
              background: rgba(255,255,255,0.1);
              padding: 16px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
            ">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="margin-right: 8px; font-size: 16px;">🏢</span>
                <strong style="font-size: 13px;">Instansi</strong>
              </div>
              <p style="margin: 0; opacity: 0.9; font-size: 14px;">${guest.asal_instansi || 'Tidak tersedia'}</p>
            </div>

            <div style="
              background: rgba(255,255,255,0.1);
              padding: 16px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
            ">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="margin-right: 8px; font-size: 16px;">💼</span>
                <strong style="font-size: 13px;">Profesi</strong>
              </div>
              <p style="margin: 0; opacity: 0.9; font-size: 14px;">${guest.profesi || 'Tidak tersedia'}</p>
            </div>

            <div style="
              background: rgba(255,255,255,0.1);
              padding: 16px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
            ">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="margin-right: 8px; font-size: 16px;">🎓</span>
                <strong style="font-size: 13px;">Pendidikan</strong>
              </div>
              <p style="margin: 0; opacity: 0.9; font-size: 14px;">${guest.pendidikan_terakhir || 'Tidak tersedia'}</p>
            </div>

            <div style="
              background: rgba(255,255,255,0.1);
              padding: 16px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
            ">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="margin-right: 8px; font-size: 16px;">📍</span>
                <strong style="font-size: 13px;">Alamat</strong>
              </div>
              <p style="margin: 0; opacity: 0.9; font-size: 14px; line-height: 1.3;">${guest.alamat || 'Tidak tersedia'}</p>
            </div>
          </div>

          <!-- Keperluan Section -->
          ${guest.keperluan ? `
            <div style="
              background: linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,152,0,0.2));
              padding: 20px;
              border-radius: 12px;
              border: 1px solid rgba(255,193,7,0.3);
              flex-shrink: 0;
            ">
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="margin-right: 8px; font-size: 18px;">📋</span>
                <strong style="font-size: 16px;">Keperluan Kunjungan</strong>
              </div>
              <p style="margin: 0; opacity: 0.95; font-size: 15px; line-height: 1.5;">${guest.keperluan}</p>
            </div>
          ` : ''}

          <!-- Footer Info -->
          <div style="
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            text-align: center;
            flex-shrink: 0;
          ">
            <p style="margin: 0; opacity: 0.7; font-size: 12px;">
              📊 Data Tamu DISNAKERTRANS Provinsi Jawa Tengah
            </p>
          </div>
        </div>
      </div>
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    modal.innerHTML = modalContent;
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Close on ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
    
    document.body.appendChild(modal);
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
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Manajemen Tamu
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              <svg className="w-12 h-12 inline mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Daftar Tamu Hari Ini
            </h1>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto">
              Monitor dan kelola kunjungan tamu dengan mudah. Lihat status, lakukan check-in/check-out, dan akses detail lengkap setiap tamu.
            </p>
          </div>

          {/* Guest List Component */}
          <div className="max-w-7xl mx-auto">
            <GuestList 
              guests={guests}
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

"use client";

import { useState } from "react";
import GuestRegistrationForm from '../../../components/forms/GuestRegistrationForm';

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Step 1: Register the guest
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Guest registered:', result.data);
        
        // Step 2: Create a token for the guest
        const tokenResponse = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tamuId: result.data.id }),
        });
        
        const tokenResult = await tokenResponse.json();
        
        if (tokenResult.success) {
          console.log('Token created:', tokenResult.data);
          // Pass the token to the form component to display in notification
          return {
            success: true,
            guestData: result.data,
            tokenData: tokenResult.data
          };
        } else {
          console.error('Token creation failed:', tokenResult.message);
          alert(`Registrasi berhasil, tetapi pembuatan token gagal: ${tokenResult.message}`);
          return { success: true, guestData: result.data, tokenData: null };
        }
      } else {
        alert(`Registrasi gagal: ${result.message}`);
        return { success: false };
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
      return { success: false };
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
            <div className="inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold mb-6 bg-badge-blue">
              <span className="mr-2">👤</span>
              Formulir Pendaftaran
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Formulir Pendaftaran Tamu
            </h1>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto">
              Silakan isi formulir di bawah ini untuk mendaftar sebagai tamu. Pastikan semua informasi yang Anda berikan adalah akurat.
            </p>
          </div>

          {/* Registration Form */}
          <div className="max-w-4xl mx-auto">
            <GuestRegistrationForm 
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

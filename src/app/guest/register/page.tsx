"use client";

import { useState } from "react";
import GuestRegistrationForm from '../../../components/forms/GuestRegistrationForm';

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Register the guest (token is now created automatically by the API)
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
        
        // Token is now included in the result.data from the API
        if (result.data?.token) {
          console.log('Token created automatically:', result.data.token);
          return {
            success: true,
            guestData: result.data,
            tokenData: result.data.token
          };
        } else {
          console.warn('No token was created during registration');
          return {
            success: true,
            guestData: result.data,
            tokenData: null
          };
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

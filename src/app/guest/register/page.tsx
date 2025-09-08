"use client";

import { useState } from "react";
import GuestRegistrationForm from '../../../components/forms/GuestRegistrationForm';
import { showToast } from '@/lib/toast';

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
            data: result.data  // Return the data structure as expected by the form
          };
        } else {
          console.warn('No token was created during registration');
          return {
            success: true,
            data: result.data  // Return the data structure as expected by the form
          };
        }
      } else {
        showToast.error(`Registrasi gagal: ${result.message}`);
        return { success: false };
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast.error('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-full">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 md:mb-6 bg-badge-blue">
              <span className="mr-2">👤</span>
              Formulir Pendaftaran
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 px-2 sm:px-4">
              Formulir Pendaftaran Tamu
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 max-w-2xl mx-auto px-3 sm:px-4 leading-relaxed">
              Silakan isi formulir di bawah ini untuk mendaftar sebagai tamu. Pastikan semua informasi yang Anda berikan adalah akurat.
            </p>
          </div>

          {/* Registration Form */}
          <div className="max-w-4xl mx-auto px-1 sm:px-2 md:px-4">
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

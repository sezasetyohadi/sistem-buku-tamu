"use client";

import { useState } from "react";
import SurveyFeedbackForm from '../../components/forms/SurveyFeedbackForm';

export default function Survey() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSurveySubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert('Terima kasih! Survey kepuasan Anda telah berhasil dikirim ke DISNAKERTRANS Jawa Tengah.');
        console.log('Survey submitted:', result);
      } else {
        alert(`Survey gagal dikirim: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Terjadi kesalahan saat mengirim survey. Silakan coba lagi.');
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
              <span className="mr-2">📊</span>
              Survey Kepuasan
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              📋 Survey Kepuasan Pelayanan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bantu kami meningkatkan kualitas pelayanan dengan memberikan penilaian dan masukan Anda.
            </p>
          </div>

          {/* Survey Form */}
          <div className="max-w-4xl mx-auto">
            <SurveyFeedbackForm 
              onSubmit={handleSurveySubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

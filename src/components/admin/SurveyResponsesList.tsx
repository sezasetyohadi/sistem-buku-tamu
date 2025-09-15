'use client';

import React from 'react';

import SurveyResponseCard from './SurveyResponseCard';

interface SurveyResponse {
  id: number;
  nama_lengkap: string;
  email: string;
  nomor_telepon?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  created_at: string;
  tanggal: string;
  waktu: string;
  pendidikan_terakhir?: string;
  nama_profesi?: string;
  jenis_layanan?: string;
  saran?: string;
  responses: { [key: string]: number | string };
  kinerja_ratings?: { [key: string]: number };
  kepentingan_ratings?: { [key: string]: number };
}

interface SurveyResponsesListProps {
  responses: SurveyResponse[];
  loading: boolean;
  onViewDetails: (response: SurveyResponse) => void;
}

export default function SurveyResponsesList({ 
  responses, 
  loading, 
  onViewDetails 
}: SurveyResponsesListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Memuat respon survey...</div>
      </div>
    );
  }

  if (!Array.isArray(responses) || responses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Belum ada respon survey yang ditemukan.</p>
        <p className="text-sm mt-1">Respon akan muncul setelah tamu mengisi survey.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <SurveyResponseCard
          key={response.id}
          response={response}
          onClick={() => onViewDetails(response)}
        />
      ))}
    </div>
  );
}

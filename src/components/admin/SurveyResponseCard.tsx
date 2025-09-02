'use client';

import { useState } from 'react';

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
}

interface SurveyResponseCardProps {
  response: SurveyResponse;
  onClick: (response: SurveyResponse) => void;
}

export default function SurveyResponseCard({ response, onClick }: SurveyResponseCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return response.waktu || '';
    }
  };

  const getResponseCount = () => {
    return Object.keys(response.responses || {}).length;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(response)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header dengan nama dan waktu */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {response.nama_lengkap}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0">
              {getResponseCount()} jawaban
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            <span className="truncate">{response.email}</span>
          </div>

          {/* Waktu survei */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
            <span>
              {formatDate(response.created_at)} • {formatTime(response.created_at)}
            </span>
          </div>

          {/* Info tambahan */}
          <div className="flex flex-wrap gap-2">
            {response.jenis_kelamin && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {response.jenis_kelamin}
              </span>
            )}
            {response.jenis_layanan && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {response.jenis_layanan}
              </span>
            )}
            {response.pendidikan_terakhir && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {response.pendidikan_terakhir}
              </span>
            )}
          </div>
        </div>

        {/* Arrow icon */}
        <div className="ml-4 flex-shrink-0">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

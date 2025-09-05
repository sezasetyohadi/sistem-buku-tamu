'use client';

import React from 'react';

interface SurveyFiltersProps {
  searchTerm: string;
  emailFilter: string;
  genderFilter: string;
  educationFilter: string;
  serviceFilter: string;
  surveyDateFilter: string;
  kinerjaRatingFilter: string;
  kepentinganRatingFilter: string;
  showFilters: boolean;
  onSearchTermChange: (value: string) => void;
  onEmailFilterChange: (value: string) => void;
  onGenderFilterChange: (value: string) => void;
  onEducationFilterChange: (value: string) => void;
  onServiceFilterChange: (value: string) => void;
  onSurveyDateFilterChange: (value: string) => void;
  onKinerjaRatingFilterChange: (value: string) => void;
  onKepentinganRatingFilterChange: (value: string) => void;
  onToggleFilters: () => void;
  onClearAllFilters: () => void;
}

export default function SurveyFilters({
  searchTerm,
  emailFilter,
  genderFilter,
  educationFilter,
  serviceFilter,
  surveyDateFilter,
  kinerjaRatingFilter,
  kepentinganRatingFilter,
  showFilters,
  onSearchTermChange,
  onEmailFilterChange,
  onGenderFilterChange,
  onEducationFilterChange,
  onServiceFilterChange,
  onSurveyDateFilterChange,
  onKinerjaRatingFilterChange,
  onKepentinganRatingFilterChange,
  onToggleFilters,
  onClearAllFilters
}: SurveyFiltersProps) {
  return (
    <div className="mb-6">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari berdasarkan nama responden..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filter
          </button>
          <button
            onClick={onClearAllFilters}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="text"
                placeholder="Filter berdasarkan email..."
                value={emailFilter}
                onChange={(e) => onEmailFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select
                value={genderFilter}
                onChange={(e) => onGenderFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Semua</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan</label>
              <select
                value={educationFilter}
                onChange={(e) => onEducationFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Semua</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D1/D2/D3">D1/D2/D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
              <select
                value={serviceFilter}
                onChange={(e) => onServiceFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Semua</option>
                <option value="Konsultasi">Konsultasi</option>
                <option value="Informasi">Informasi</option>
                <option value="Administrasi">Administrasi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Survey</label>
              <input
                type="date"
                value={surveyDateFilter}
                onChange={(e) => onSurveyDateFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating Kinerja</label>
              <select
                value={kinerjaRatingFilter}
                onChange={(e) => onKinerjaRatingFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Semua</option>
                <option value="1">1 - Sangat Buruk</option>
                <option value="2">2 - Buruk</option>
                <option value="3">3 - Cukup</option>
                <option value="4">4 - Baik</option>
                <option value="5">5 - Sangat Baik</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating Kepentingan</label>
              <select
                value={kepentinganRatingFilter}
                onChange={(e) => onKepentinganRatingFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Semua</option>
                <option value="1">1 - Tidak Penting</option>
                <option value="2">2 - Kurang Penting</option>
                <option value="3">3 - Cukup Penting</option>
                <option value="4">4 - Penting</option>
                <option value="5">5 - Sangat Penting</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { showToast } from '@/lib/toast';

interface SurveyExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SurveyExportDialog({ isOpen, onClose }: SurveyExportDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      showToast.warning('Mohon pilih rentang tanggal');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast.error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return;
    }

    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate
      });

      const response = await fetch(`/api/survey/export?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor data');
      }

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'survey-responses.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"|filename=([^;\s]+)/);
        if (filenameMatch) {
          filename = filenameMatch[1] || filenameMatch[2];
        }
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      showToast.success('Data berhasil diekspor!');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      showToast.error('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ekspor Data Survei</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengekspor...
                </>
              ) : (
                'Ekspor Excel'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

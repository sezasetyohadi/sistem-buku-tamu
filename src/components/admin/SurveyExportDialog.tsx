'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

interface SurveyExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SurveyExportDialog({ isOpen, onClose }: SurveyExportDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  // Fetch available date range from survey responses
  useEffect(() => {
    if (isOpen) {
      fetchDateRange();
    }
  }, [isOpen]);

  const fetchDateRange = async () => {
    try {
      const response = await fetch('/api/survey/responses', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const dates = data.data
            .map((item: any) => item.created_at)
            .filter((date: any) => date !== null && date !== undefined)
            .map((date: any) => new Date(date).getTime())
            .filter((time: number) => !isNaN(time));

          if (dates.length > 0) {
            const min = new Date(Math.min(...dates));
            const max = new Date(Math.max(...dates));

            // Format to YYYY-MM-DD for input date
            const formatDate = (date: Date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };

            setMinDate(formatDate(min));
            setMaxDate(formatDate(max));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching date range:', error);
    }
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Silakan pilih tanggal mulai dan tanggal akhir');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set time to start of day for start date and end of day for end date
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      toast.error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
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

      toast.success('Data berhasil diekspor!');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ekspor Data Survei"
      size="md"
    >
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          Pilih rentang tanggal untuk mengekspor data survei kepuasan ke file Excel
        </div>

        {/* Data Range Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-600">
            <span className="font-medium">Rentang data tersedia:</span>
            <br />
            {minDate && maxDate ? (
              `${new Date(minDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - ${new Date(maxDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
            ) : (
              'Memuat...'
            )}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={minDate}
              max={endDate || maxDate}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={startDate || minDate}
              max={maxDate}
            />
          </div>
        </div>

        {/* Info Box */}
        {startDate && endDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Rentang Tanggal:</p>
                <p>{new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            disabled={isExporting}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            disabled={isExporting}
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !startDate || !endDate}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengekspor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Ekspor Data
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

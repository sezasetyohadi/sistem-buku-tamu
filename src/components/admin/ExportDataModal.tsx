'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import * as ExcelJS from 'exceljs';
import { toast } from 'react-hot-toast';
import { DaftarTamu } from '@/types/database-types';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: DaftarTamu[];
}

export default function ExportDataModal({ isOpen, onClose, guests }: ExportDataModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Calculate min and max dates from guests data
  const { minDate, maxDate } = (() => {
    if (guests.length === 0) {
      return { minDate: '', maxDate: '' };
    }

    const dateStrings = guests
      .map(guest => guest.waktu_dibuat || guest.waktu_checkin)
      .filter(date => date !== null && date !== undefined)
      .map(date => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        // Use local date without timezone conversion
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })
      .filter(date => date !== null) as string[];

    if (dateStrings.length === 0) {
      return { minDate: '', maxDate: '' };
    }

    // Sort the date strings to get min and max
    const sortedDates = dateStrings.sort();
    
    return {
      minDate: sortedDates[0],
      maxDate: sortedDates[sortedDates.length - 1]
    };
  })();

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
      // Filter guests by date range
      const filteredGuests = guests.filter(guest => {
        const dateToFilter = guest.waktu_dibuat || guest.waktu_checkin;
        if (!dateToFilter) return false;
        
        const guestDate = new Date(dateToFilter);
        return guestDate >= start && guestDate <= end;
      });

      // Sort by ID ascending (1, 2, 3, ...)
      filteredGuests.sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idA - idB;
      });

      if (filteredGuests.length === 0) {
        toast.error('Tidak ada data tamu dalam rentang tanggal yang dipilih');
        setIsExporting(false);
        return;
      }

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Daftar Tamu');
      
      // Add headers
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nama', key: 'nama', width: 30 },
        { header: 'Instansi', key: 'asal_instansi', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'No. Telepon', key: 'nomor_telp', width: 20 },
        { header: 'Pendidikan Terakhir', key: 'pendidikan_terakhir', width: 20 },
        { header: 'Profesi', key: 'profesi', width: 20 },
        { header: 'Bidang Tujuan', key: 'bidang_tujuan', width: 25 },
        { header: 'ASN Dituju', key: 'asn_dituju', width: 30 },
        { header: 'Keperluan', key: 'keperluan', width: 40 },
        { header: 'Status Kunjungan', key: 'status_kunjungan', width: 20 },
        { header: 'Waktu Daftar', key: 'waktu_dibuat', width: 20 },
        { header: 'Waktu Datang', key: 'waktu_checkin', width: 20 },
        { header: 'Waktu Selesai', key: 'waktu_checkout', width: 20 },
      ];
      
      // Add rows from filtered guests
      filteredGuests.forEach(guest => {
        const row = worksheet.addRow({
          id: guest.id,
          nama: guest.nama,
          asal_instansi: guest.asal_instansi || '-',
          email: guest.email || '-',
          nomor_telp: guest.nomor_telp || '-',
          pendidikan_terakhir: guest.pendidikan_terakhir || '-',
          profesi: guest.profesi || '-',
          bidang_tujuan: guest.bidang_tujuan || '-',
          asn_dituju: guest.asn_dituju || '-',
          keperluan: guest.keperluan || '-',
          status_kunjungan: guest.status_kunjungan || '-',
          waktu_dibuat: '',
          waktu_checkin: '',
          waktu_checkout: ''
        });
        
        // Format dates
        if (guest.waktu_checkin) {
          try {
            const checkinDate = new Date(guest.waktu_checkin);
            if (!isNaN(checkinDate.getTime())) {
              const day = String(checkinDate.getDate()).padStart(2, '0');
              const month = String(checkinDate.getMonth() + 1).padStart(2, '0');
              const year = checkinDate.getFullYear();
              const hours = String(checkinDate.getHours()).padStart(2, '0');
              const minutes = String(checkinDate.getMinutes()).padStart(2, '0');
              const seconds = String(checkinDate.getSeconds()).padStart(2, '0');
              
              const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
              const cell = row.getCell('waktu_checkin');
              cell.value = formattedDate;
            }
          } catch (e) {
            console.error('Error parsing checkin date:', e);
          }
        }
        
        if (guest.waktu_dibuat) {
          try {
            const createdDate = new Date(guest.waktu_dibuat);
            if (!isNaN(createdDate.getTime())) {
              const day = String(createdDate.getDate()).padStart(2, '0');
              const month = String(createdDate.getMonth() + 1).padStart(2, '0');
              const year = createdDate.getFullYear();
              const hours = String(createdDate.getHours()).padStart(2, '0');
              const minutes = String(createdDate.getMinutes()).padStart(2, '0');
              const seconds = String(createdDate.getSeconds()).padStart(2, '0');
              
              const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
              const cell = row.getCell('waktu_dibuat');
              cell.value = formattedDate;
            }
          } catch (e) {
            console.error('Error parsing creation date:', e);
          }
        }
        
        if (guest.waktu_checkout) {
          try {
            const checkoutDate = new Date(guest.waktu_checkout);
            if (!isNaN(checkoutDate.getTime())) {
              const day = String(checkoutDate.getDate()).padStart(2, '0');
              const month = String(checkoutDate.getMonth() + 1).padStart(2, '0');
              const year = checkoutDate.getFullYear();
              const hours = String(checkoutDate.getHours()).padStart(2, '0');
              const minutes = String(checkoutDate.getMinutes()).padStart(2, '0');
              const seconds = String(checkoutDate.getSeconds()).padStart(2, '0');
              
              const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
              const cell = row.getCell('waktu_checkout');
              cell.value = formattedDate;
            }
          } catch (e) {
            console.error('Error parsing checkout date:', e);
          }
        }
      });
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Center align all columns
      worksheet.columns.forEach(column => {
        column.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      
      // Apply alignment to all cells
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });
      
      // Generate the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Create a blob from the buffer
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Tamu_${startDate}_sampai_${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Berhasil mengekspor ${filteredGuests.length} data tamu`);
      onClose();
    } catch (error) {
      console.error('Error exporting data:', error);
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
      title="Ekspor Data Tamu"
      size="md"
    >
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          Pilih rentang tanggal untuk mengekspor data tamu ke file Excel
        </div>

        {/* Data Range Info */}
        {minDate && maxDate && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Rentang data tersedia:</span>
              <br />
              {new Date(minDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(maxDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}

        {guests.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              Tidak ada data tamu tersedia untuk diekspor.
            </div>
          </div>
        )}

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

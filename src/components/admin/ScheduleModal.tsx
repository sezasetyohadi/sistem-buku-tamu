import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { useApiCall } from "@/hooks/useDataFetching";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (
    scheduledDateTime: string, 
    bidangTujuanId?: number, 
    asnDituju?: string, 
    caraSalinan?: number[]
  ) => Promise<void>;
  guestId: number;
  currentSchedule?: string; // Jadwal yang sudah ada sebelumnya
  currentBidangId?: number; // Bidang tujuan yang sudah ada sebelumnya
  currentAsnDituju?: string; // ASN yang dituju sebelumnya
  currentCaraSalinan?: number[]; // Cara mendapatkan salinan yang sudah ada sebelumnya
  isEdit?: boolean; // Mode edit jadwal
}

export default function ScheduleModal({ 
  isOpen, 
  onClose, 
  onSchedule, 
  guestId, 
  currentSchedule, 
  currentBidangId,
  currentAsnDituju,
  currentCaraSalinan = [],
  isEdit = false 
}: ScheduleModalProps) {
  // Get current date and time as default values
  const now = new Date();
  const [date, setDate] = useState<string>(now.toISOString().split('T')[0]);
  const [hour, setHour] = useState<string>(String(now.getHours()).padStart(2, '0'));
  const [minute, setMinute] = useState<string>(String(now.getMinutes()).padStart(2, '0'));
  const [bidangTujuanId, setBidangTujuanId] = useState<number | undefined>(currentBidangId);
  const [asnDituju, setAsnDituju] = useState<string>(currentAsnDituju || '');
  const [caraSalinan, setCaraSalinan] = useState<number[]>(currentCaraSalinan);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch bidang tujuan and cara salinan options from API
  const { data: lookupData, loading } = useApiCall<{
    bidangTujuan: Array<{id: number, bidang: string}>;
    mendapatkanSalinan: Array<{id: number, nama_opsi: string}>;
  }>('/api/lookup', {
    immediate: true,
    loadingKey: 'lookup-options',
  });

  // Calculate minimum allowed date and time
  const minDate = new Date().toISOString().split('T')[0];
  
  // Reset form when modal is opened and handle existing schedule if available
  useEffect(() => {
    if (isOpen) {
      if (currentSchedule && isEdit) {
        // Parse existing schedule if available
        try {
          const scheduledDate = new Date(currentSchedule);
          setDate(scheduledDate.toISOString().split('T')[0]);
          setHour(String(scheduledDate.getHours()).padStart(2, '0'));
          setMinute(String(scheduledDate.getMinutes()).padStart(2, '0'));
        } catch (error) {
          console.error("Error parsing existing schedule:", error);
          resetToCurrentTime();
        }
        
        // Set bidang tujuan and ASN data if available
        if (currentBidangId) {
          setBidangTujuanId(currentBidangId);
        }
        
        if (currentAsnDituju) {
          setAsnDituju(currentAsnDituju);
        }
        
        if (currentCaraSalinan && currentCaraSalinan.length > 0) {
          setCaraSalinan(currentCaraSalinan);
        }
      } else {
        resetToCurrentTime();
        setBidangTujuanId(undefined);
        setAsnDituju('');
        setCaraSalinan([]);
      }
      setError(null);
    }
  }, [isOpen, currentSchedule, currentBidangId, currentAsnDituju, currentCaraSalinan, isEdit]);
  
  // Helper function to reset time to current time
  const resetToCurrentTime = () => {
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setHour(String(now.getHours()).padStart(2, '0'));
    setMinute(String(now.getMinutes()).padStart(2, '0'));
  };

  // Handle hour input change with validation
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Allow empty value for flexibility
    if (value === '') {
      setHour('');
      return;
    }
    
    // Only allow numbers
    value = value.replace(/[^\d]/g, '');
    
    // Handle direct input of 2 digit numbers
    if (value.length === 2) {
      const hourNum = parseInt(value, 10);
      if (hourNum >= 0 && hourNum <= 23) {
        setHour(value);
        document.getElementById('minute')?.focus();
      } else {
        // If invalid 2-digit number, keep first digit if valid
        const firstDigit = value[0];
        if (parseInt(firstDigit, 10) <= 2) {
          setHour(firstDigit);
        }
      }
      return;
    }
    
    // Handle single digit input
    const hourNum = parseInt(value, 10);
    if (hourNum >= 0 && hourNum <= 9) {
      setHour(value);
    } else if (value.length > 2) {
      // Limit to 2 digits and validate
      const truncated = value.slice(0, 2);
      const truncatedNum = parseInt(truncated, 10);
      if (truncatedNum >= 0 && truncatedNum <= 23) {
        setHour(truncated);
        document.getElementById('minute')?.focus();
      }
    }
  };
  
  // Handle minute input change with validation
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Allow empty value for flexibility
    if (value === '') {
      setMinute('');
      return;
    }
    
    // Only allow numbers
    value = value.replace(/[^\d]/g, '');
    
    // Handle direct input of 2 digit numbers
    if (value.length === 2) {
      const minuteNum = parseInt(value, 10);
      if (minuteNum >= 0 && minuteNum <= 59) {
        setMinute(value);
      } else {
        // If invalid 2-digit number, keep first digit if valid
        const firstDigit = value[0];
        if (parseInt(firstDigit, 10) <= 5) {
          setMinute(firstDigit);
        }
      }
      return;
    }
    
    // Handle single digit input
    const minuteNum = parseInt(value, 10);
    if (minuteNum >= 0 && minuteNum <= 9) {
      setMinute(value);
    } else if (value.length > 2) {
      // Limit to 2 digits and validate
      const truncated = value.slice(0, 2);
      const truncatedNum = parseInt(truncated, 10);
      if (truncatedNum >= 0 && truncatedNum <= 59) {
        setMinute(truncated);
      }
    }
  };
  
  // Handle focus on hour field to select all text
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };
  
  // Handle checkbox changes for cara salinan
  const handleCaraSalinanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setCaraSalinan(prev => [...prev, value]);
    } else {
      setCaraSalinan(prev => prev.filter(id => id !== value));
    }
  };

  // Validate time if the date is today
  const isTimeValid = () => {
    const hourNum = parseInt(hour, 10);
    const minuteNum = parseInt(minute, 10);
    
    // Check for valid numbers
    if (isNaN(hourNum) || isNaN(minuteNum)) {
      return false;
    }
    
    // Check ranges
    if (hourNum < 0 || hourNum > 23 || minuteNum < 0 || minuteNum > 59) {
      return false;
    }
    
    // If date is today, check if time is in the future
    if (date === minDate) {
      const now = new Date();
      const selectedTime = new Date();
      selectedTime.setHours(hourNum, minuteNum, 0, 0);
      return selectedTime > now;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    try {
      // Clear any previous errors
      setError(null);
      
      // Check for missing values
      if (!hour && !minute) {
        setError("Waktu harus diisi lengkap");
        return;
      }
      
      if (!hour) {
        setError("Jam harus diisi");
        return;
      }
      
      if (!minute) {
        setError("Menit harus diisi");
        return;
      }
      
      if (!bidangTujuanId) {
        setError("Bidang tujuan harus dipilih");
        return;
      }
      
      // Validate hour and minute format
      const hourNum = parseInt(hour, 10);
      const minuteNum = parseInt(minute, 10);
      
      if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
        setError("Format jam tidak valid (0-23)");
        return;
      }
      
      if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) {
        setError("Format menit tidak valid (0-59)");
        return;
      }
      
      // Validate time if date is today
      if (!isTimeValid()) {
        setError("Waktu yang dipilih harus di masa depan");
        return;
      }

      setIsSubmitting(true);

      // Format the datetime string for API with padded values
      const paddedHour = String(hourNum).padStart(2, '0');
      const paddedMinute = String(minuteNum).padStart(2, '0');
      const scheduledDateTime = `${date}T${paddedHour}:${paddedMinute}:00`;
      
      await onSchedule(scheduledDateTime, bidangTujuanId, asnDituju.trim(), caraSalinan);
      onClose();
    } catch (error) {
      setError("Gagal menjadwalkan kunjungan. Silakan coba lagi.");
      console.error("Error scheduling visit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // We're using text inputs for hours and minutes now instead of dropdowns

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Jadwal" : "Jadwalkan Kunjungan"} size="md">
      <div className="p-2 dark:bg-dark-surface">
        {isEdit && currentSchedule && (
          <div className="mb-6">
            <div className="p-3 bg-gray-100 dark:bg-dark-card rounded-md mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Jadwal Kunjungan Saat Ini</h4>
              <p className="font-medium text-gray-900 dark:text-dark-text-primary">
                {new Date(currentSchedule).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}

        <div className="text-base text-gray-700 dark:text-dark-text-primary mb-6">
          {isEdit 
            ? "Pilih tanggal dan waktu baru untuk mengubah jadwal kunjungan tamu."
            : "Pilih tanggal dan waktu untuk jadwal kunjungan tamu."}
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
              Tanggal
            </label>
            <div>
              <input
                type="date"
                id="date"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className={`block w-full rounded-md py-3 px-4 text-base text-gray-900 dark:text-dark-text-primary bg-white dark:bg-dark-surface focus:border-blue-500 focus:ring-blue-500 ${
                  !date ? 'border-gray-400 dark:border-gray-600' : 'border-gray-300 dark:border-gray-700'
                } border`}
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
              Waktu
            </label>
            <div className="flex items-center">
              <input
                type="text"
                id="hour"
                value={hour}
                onChange={handleHourChange}
                onFocus={handleFocus}
                placeholder="--"
                maxLength={2}
                className={`block w-24 rounded-md py-3 text-center text-base text-gray-900 dark:text-dark-text-primary bg-white dark:bg-dark-surface border ${
                  error && !hour ? 'border-error-500 dark:border-error-400 ring-1 ring-error-500 dark:ring-error-400 focus:border-error-500 focus:ring-error-500' : 
                  !hour ? 'border-gray-400 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500' :
                  'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                }`}
                style={{ minHeight: '48px' }}
                aria-label="Jam"
              />
              <span className="text-2xl font-medium mx-2">:</span>
              <input
                type="text"
                id="minute"
                value={minute}
                onChange={handleMinuteChange}
                onFocus={handleFocus}
                placeholder="--"
                maxLength={2}
                className={`block w-24 rounded-md py-3 text-center text-base text-gray-900 dark:text-dark-text-primary bg-white dark:bg-dark-surface border ${
                  error && !minute ? 'border-error-500 dark:border-error-400 ring-1 ring-error-500 dark:ring-error-400 focus:border-error-500 focus:ring-error-500' : 
                  !minute ? 'border-gray-400 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500' :
                  'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                }`}
                style={{ minHeight: '48px' }}
                aria-label="Menit"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="bidangTujuan" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
              Bidang Tujuan
            </label>
            <div>
              <select
                id="bidangTujuan"
                value={bidangTujuanId || ''}
                onChange={(e) => setBidangTujuanId(e.target.value ? Number(e.target.value) : undefined)}
                className={`block w-full rounded-md py-3 px-4 text-base text-gray-900 dark:text-dark-text-primary bg-white dark:bg-dark-surface border ${
                  error && !bidangTujuanId ? 'border-error-500 dark:border-error-400 ring-1 ring-error-500 dark:ring-error-400 focus:border-error-500 focus:ring-error-500' : 
                  !bidangTujuanId ? 'border-gray-400 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500' :
                  'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                }`}
                style={{ minHeight: '48px' }}
              >
                <option value="">Pilih bidang tujuan</option>
                {lookupData?.bidangTujuan?.map((bidang) => (
                  <option key={bidang.id} value={bidang.id}>
                    {bidang.bidang}
                  </option>
                ))}
                {(!lookupData?.bidangTujuan || lookupData.bidangTujuan.length === 0) && !loading && (
                  <option value="" disabled>Tidak ada bidang tersedia</option>
                )}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="asnDituju" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
              Menemui
            </label>
            <div>
              <input
                type="text"
                id="asnDituju"
                value={asnDituju}
                onChange={(e) => setAsnDituju(e.target.value)}
                placeholder="Nama ASN yang ingin ditemui"
                className={`block w-full rounded-md py-3 px-4 text-base text-gray-900 dark:text-dark-text-primary bg-white dark:bg-dark-surface border ${
                  !asnDituju ? 'border-gray-400 dark:border-gray-600' : 'border-gray-300 dark:border-gray-700'
                } focus:border-blue-500 focus:ring-blue-500`}
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                Cara Mendapatkan Salinan
              </label>
              <span className="ml-1 text-sm text-gray-500 dark:text-dark-text-secondary">(Opsional)</span>
            </div>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-dark-surface rounded-md border border-gray-200 dark:border-dark-border">
              {lookupData?.mendapatkanSalinan?.map((option) => (
                <div key={option.id} className="flex items-center mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    id={`salinan-${option.id}`}
                    value={option.id}
                    checked={caraSalinan.includes(option.id)}
                    onChange={handleCaraSalinanChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`salinan-${option.id}`} className="ml-2 text-sm text-gray-700 dark:text-dark-text-secondary">
                    {option.nama_opsi}
                  </label>
                </div>
              ))}
              
              {(!lookupData?.mendapatkanSalinan || lookupData.mendapatkanSalinan.length === 0) && !loading && (
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary italic">Tidak ada opsi tersedia</p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-error-600 dark:text-error-400 mt-2">{error}</div>
          )}
          
          {loading && (
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary mt-2">Memuat data bidang tujuan...</div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-gray-200 dark:border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white 
              ${isSubmitting ? 'bg-blue-400 dark:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700 dark:bg-primary-600 dark:hover:bg-primary-700'}`}
          >
            {isSubmitting ? 'Menjadwalkan...' : isEdit ? 'Simpan Perubahan' : 'Jadwalkan'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

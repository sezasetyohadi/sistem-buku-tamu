import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledDateTime: string) => Promise<void>;
  guestId: number;
}

export default function ScheduleModal({ isOpen, onClose, onSchedule, guestId }: ScheduleModalProps) {
  // Get current date and time as default values
  const now = new Date();
  const [date, setDate] = useState<string>(now.toISOString().split('T')[0]);
  const [hour, setHour] = useState<string>(String(now.getHours()).padStart(2, '0'));
  const [minute, setMinute] = useState<string>(String(now.getMinutes()).padStart(2, '0'));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate minimum allowed date and time
  const minDate = new Date().toISOString().split('T')[0];
  
  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setHour(String(now.getHours()).padStart(2, '0'));
      setMinute(String(now.getMinutes()).padStart(2, '0'));
      setError(null);
    }
  }, [isOpen]);

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
      
      await onSchedule(scheduledDateTime);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Jadwalkan Kunjungan" size="md">
      <div className="p-2">
        <div className="text-base text-gray-700 mb-6">
          Pilih tanggal dan waktu untuk jadwal kunjungan tamu.
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal
            </label>
            <div>
              <input
                type="date"
                id="date"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3 px-4 text-base"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
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
                className={`block w-24 border rounded-md py-3 text-center text-base ${
                  error && !hour ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
                className={`block w-24 border rounded-md py-3 text-center text-base ${
                  error && !minute ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                style={{ minHeight: '48px' }}
                aria-label="Menit"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 mt-2">{error}</div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white 
              ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Menjadwalkan...' : 'Jadwalkan'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

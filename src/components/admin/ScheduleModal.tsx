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

  // Validate time if the date is today
  const isTimeValid = () => {
    if (date === minDate) {
      const now = new Date();
      const selectedTime = new Date();
      selectedTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
      return selectedTime > now;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      // Validate time if date is today
      if (!isTimeValid()) {
        setError("Waktu yang dipilih harus di masa depan");
        return;
      }

      setError(null);
      setIsSubmitting(true);

      // Format the datetime string for API
      const scheduledDateTime = `${date}T${hour}:${minute}:00`;
      await onSchedule(scheduledDateTime);
      onClose();
    } catch (error) {
      setError("Gagal menjadwalkan kunjungan. Silakan coba lagi.");
      console.error("Error scheduling visit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => 
    String(i).padStart(2, '0')
  );

  // Generate minute options (0-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => 
    String(i).padStart(2, '0')
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Jadwalkan Kunjungan" size="md">
      <div className="space-y-5">
        <div className="text-sm text-gray-500 mb-4">
          Pilih tanggal dan waktu untuk jadwal kunjungan tamu.
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              id="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hour" className="block text-sm font-medium text-gray-700 mb-1">
                Jam
              </label>
              <select
                id="hour"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="minute" className="block text-sm font-medium text-gray-700 mb-1">
                Menit
              </label>
              <select
                id="minute"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 mt-2">{error}</div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white 
              ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isSubmitting ? 'Menjadwalkan...' : 'Jadwalkan'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

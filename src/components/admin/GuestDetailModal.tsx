import { DaftarTamu } from "@/types/database-types";
import Modal from "../ui/Modal";
import { useState } from "react";
import ScheduleModal from "./ScheduleModal";
import DeleteConfirmationDialog from "../ui/DeleteConfirmationDialog";
import { toast } from "react-hot-toast";

// Tooltip component
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 w-64 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -left-2 -top-2 transform -translate-y-full opacity-100 transition-opacity duration-300">
          {content}
          <div className="absolute bottom-0 left-3 w-3 h-3 bg-white border-r border-b border-gray-200 transform translate-y-1/2 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

interface GuestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: DaftarTamu | null;
  onGuestUpdate?: () => void; // Callback for when guest data is updated
  isEditMode?: boolean; // Whether the modal is opened in edit mode
}

export default function GuestDetailModal({ isOpen, onClose, guest, onGuestUpdate, isEditMode = false }: GuestDetailModalProps) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  if (!guest) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum tersedia";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return "Format tanggal tidak valid";
    }
  };
  
  const handleSchedule = async (scheduledDateTime: string) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/guests/${guest.id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduledDateTime }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to schedule visit');
      }
      
      // Show success message
      toast.success('Jadwal kunjungan berhasil diatur');
      
      // Close the modal and trigger a refresh
      setIsScheduleModalOpen(false);
      
      // Trigger refresh of guest data in the parent component
      if (onGuestUpdate) {
        onGuestUpdate();
      }
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast.error('Gagal menjadwalkan kunjungan');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatStatusBadge = (status?: string) => {
    const statusColors = {
      'Menunggu': 'bg-yellow-100 text-yellow-800',
      'Terjadwal': 'bg-orange-100 text-orange-800',
      'Datang': 'bg-blue-100 text-blue-800',
      'Selesai': 'bg-green-100 text-green-800'
    };
    
    const statusTooltips = {
      'Menunggu': 'Tamu telah mendaftar namun belum dijadwalkan kunjungan',
      'Terjadwal': 'Tamu telah dijadwalkan untuk kunjungan tertentu',
      'Datang': 'Tamu telah melakukan check-in dan sedang berkunjung',
      'Selesai': 'Kunjungan tamu telah selesai dengan check-out'
    };
    
    const color = status ? statusColors[status as keyof typeof statusColors] : 'bg-gray-100 text-gray-800';
    const tooltip = status ? statusTooltips[status as keyof typeof statusTooltips] : '';
    
    return (
      <Tooltip content={tooltip}>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color} cursor-help`}>
          {status || 'Menunggu'}
        </span>
      </Tooltip>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Tamu" : "Detail Tamu"} size="lg">
      <div className="space-y-6">
        {/* Header with avatar and basic info */}
        <div className="flex items-center pb-4 border-b border-gray-200">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-lg font-bold text-red-600">
              {guest.nama.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="ml-4 flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{guest.nama}</h3>
                <div className="flex items-center mt-1">
                  {formatStatusBadge(guest.status_kunjungan)}
                  <span className="ml-2 text-sm text-gray-500">ID: {guest.id}</span>
                </div>
              </div>
              {guest.jadwal_checkin && (
                <div className="text-right">
                  <h4 className="text-sm font-medium text-gray-500">Jadwal Kunjungan</h4>
                  <p className="text-base font-medium text-blue-600">{formatDate(guest.jadwal_checkin)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two-column info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Email</h4>
              <p className="mt-1 text-gray-900">{guest.email || 'Tidak tersedia'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Nomor Telepon</h4>
              <p className="mt-1 text-gray-900">{guest.nomor_telp || 'Tidak tersedia'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Jenis Kelamin</h4>
              <p className="mt-1 text-gray-900">{guest.jenis_kelamin}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Pendidikan Terakhir</h4>
              <p className="mt-1 text-gray-900">{guest.pendidikan_terakhir || 'Tidak tersedia'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Profesi</h4>
              <p className="mt-1 text-gray-900">{guest.profesi || 'Tidak tersedia'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Asal Instansi</h4>
              <p className="mt-1 text-gray-900">{guest.asal_instansi || 'Tidak tersedia'}</p>
            </div>
          </div>
          
          {/* Right column */}
          <div className="space-y-4">
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Alamat</h4>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{guest.alamat || 'Tidak tersedia'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Waktu Pendaftaran</h4>
              <p className="mt-1 text-gray-900">{formatDate(guest.waktu_dibuat)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Check-in</h4>
              <p className="mt-1 text-gray-900">{formatDate(guest.waktu_checkin)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Check-out</h4>
              <p className="mt-1 text-gray-900">{formatDate(guest.waktu_checkout)}</p>
            </div>
          </div>
        </div>
        
        {/* Full-width sections */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <h4 className="text-sm font-medium text-gray-500">Keperluan</h4>
            <Tooltip content="Alasan atau tujuan kunjungan tamu ke DISNAKERTRANS Jawa Tengah">
              <span className="ml-1 cursor-help text-gray-400 hover:text-gray-600 flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </Tooltip>
          </div>
          <div className="mt-2 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-gray-900 whitespace-pre-wrap">{guest.keperluan || 'Tidak tersedia'}</p>
          </div>
          
          <div className="flex items-center mt-4">
            <h4 className="text-sm font-medium text-gray-500">Bidang Dituju</h4>
            <Tooltip content="Departemen atau bidang yang akan dikunjungi oleh tamu">
              <span className="ml-1 cursor-help text-gray-400 hover:text-gray-600 flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </Tooltip>
          </div>
          <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-gray-900">{guest.bidang_tujuan || 'Tidak tersedia'}</p>
          </div>
        </div>

        {/* Information Access Methods */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <h4 className="text-sm font-medium text-gray-500">Cara Mendapatkan Informasi</h4>
            <Tooltip content="Metode yang dipilih oleh tamu untuk mendapatkan informasi">
              <span className="ml-1 cursor-help text-gray-400 hover:text-gray-600 flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </Tooltip>
          </div>
          <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="space-y-1">
              {guest.cara_memperoleh_informasi && 
               Array.isArray(guest.cara_memperoleh_informasi) && 
               guest.cara_memperoleh_informasi.length > 0 ? (
                  guest.cara_memperoleh_informasi.map((cara: string, index: number) => (
                    <p key={index} className="flex items-center text-gray-900">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {cara}
                    </p>
                  ))
                ) : <p className="text-gray-500 italic">Tidak ada data</p>
              }
            </div>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex items-center">
            <h4 className="text-sm font-medium text-gray-500">Cara Mendapatkan Salinan</h4>
            <Tooltip content="Metode yang dipilih oleh tamu untuk mendapatkan salinan informasi atau dokumen">
              <span className="ml-1 cursor-help text-gray-400 hover:text-gray-600 flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </Tooltip>
          </div>
          <div className="mt-2 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="space-y-1">
              {guest.cara_mendapatkan_salinan &&
               Array.isArray(guest.cara_mendapatkan_salinan) && 
               guest.cara_mendapatkan_salinan.length > 0 ? (
                  guest.cara_mendapatkan_salinan.map((cara: string, index: number) => (
                    <p key={index} className="flex items-center text-gray-900">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {cara}
                    </p>
                  ))
                ) : <p className="text-gray-500 italic">Tidak ada data</p>
              }
            </div>
          </div>
        </div>
        
        {guest.catatan_tambahan && (
          <div className="pt-4">
            <div className="flex items-center">
              <h4 className="text-sm font-medium text-gray-500">Catatan Tambahan</h4>
              <Tooltip content="Catatan atau informasi tambahan yang diberikan oleh tamu">
                <span className="ml-1 cursor-help text-gray-400 hover:text-gray-600 flex items-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </Tooltip>
            </div>
            <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-gray-900 whitespace-pre-wrap">{guest.catatan_tambahan}</p>
            </div>
          </div>
        )}
        
        {guest.file_upload && (
          <div>
            <div className="flex items-center">
              <h4 className="text-sm font-medium text-gray-500">File Pendukung</h4>
              <Tooltip content="File yang diunggah tamu sebagai pendukung kunjungan (seperti surat pengantar, dokumen identitas, dsb)">
                <span className="ml-1 cursor-help text-gray-400 hover:text-gray-600 flex items-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </Tooltip>
            </div>
            <div className="mt-2">
              <a 
                href={guest.file_upload}
                target="_blank"
                rel="noopener noreferrer" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Lihat File
              </a>
            </div>
          </div>
        )}

        {/* Footer with action buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          {guest.status_kunjungan === "Menunggu" && (
            <button 
              onClick={() => setIsScheduleModalOpen(true)} 
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Jadwalkan
            </button>
          )}
          
          {(guest.status_kunjungan === "Menunggu" || guest.status_kunjungan === "Terjadwal") && (
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Check-in
            </button>
          )}
          
          {guest.status_kunjungan === "Datang" && (
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Check-out
            </button>
          )}
          
          <button 
            onClick={() => {
              // TODO: Implement edit functionality
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            Edit
          </button>
          
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            Hapus
          </button>
          
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors ml-auto"
          >
            Tutup
          </button>
        </div>
      </div>
      
      {/* Schedule Modal */}
      {guest && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSchedule={handleSchedule}
          guestId={guest.id || 0}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {guest && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Konfirmasi Hapus Data"
          message="Apakah Anda yakin ingin menghapus tamu ini dari daftar?"
          itemName={guest.nama}
          onClose={() => setIsDeleteDialogOpen(false)}
          isLoading={isSubmitting}
          onConfirm={async () => {
            try {
              setIsSubmitting(true);
              
              const response = await fetch(`/api/guests/${guest.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              const result = await response.json();
              
              if (!result.success) {
                throw new Error(result.message || 'Gagal menghapus data tamu');
              }
              
              // Show success message
              toast.success('Data tamu berhasil dihapus');
              
              // Close both dialogs
              setIsDeleteDialogOpen(false);
              onClose();
              
              // Trigger refresh of guest data in the parent component
              if (onGuestUpdate) {
                onGuestUpdate();
              }
            } catch (error) {
              console.error('Error deleting guest:', error);
              toast.error('Gagal menghapus data tamu');
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      )}
    </Modal>
  );
}

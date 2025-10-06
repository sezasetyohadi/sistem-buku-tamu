import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { DaftarTamu } from '@/types/database-types';

import { DeleteConfirmDialog } from '../ui/DeleteConfirmDialog';
import Modal from '../ui/Modal';

import ScheduleModal from './ScheduleModal';



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
        <div className="absolute z-[100] w-64 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-xl -left-2 -top-2 transform -translate-y-full opacity-100 transition-opacity duration-300 pointer-events-none">
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
  onGuestUpdate?: (updatedGuest?: DaftarTamu) => void; // Enhanced callback with optional updated guest data
  isEditMode?: boolean; // Whether the modal is opened in edit mode
}

export default function GuestDetailModal({ isOpen, onClose, guest: initialGuest, onGuestUpdate, isEditMode = false }: GuestDetailModalProps) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [guest, setGuest] = useState<DaftarTamu | null>(initialGuest);
  
  // Update local guest state when initialGuest changes (e.g. when reopening modal)
  useEffect(() => {
    setGuest(initialGuest);
  }, [initialGuest]);
  
  // Auto-open schedule modal if edit mode is active and guest status is "Menunggu" or "Terjadwal"
  useEffect(() => {
    if (isOpen && isEditMode && guest && (guest.status_kunjungan === 'Menunggu' || guest.status_kunjungan === 'Terjadwal')) {
      setIsScheduleModalOpen(true);
    }
  }, [isOpen, isEditMode, guest]);
  
  if (!guest) {return null;}

  const formatDate = (dateString?: string | null) => {
    if (!dateString) {return 'Belum tersedia';}
    
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
      return 'Format tanggal tidak valid';
    }
  };
  
  const handleSchedule = async (scheduledDateTime: string, bidangTujuanId?: number, asnDituju?: string, caraSalinan?: number[]) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/guests/${guest.id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scheduledDateTime,
          bidangTujuanId,
          asnDituju,
          caraSalinan
        }),
      });
      
      const result = await response.json();
      
      // Debug: Log the API response
      console.log('Schedule API response:', result);
      console.log('cara_mendapatkan_salinan from API:', result.data?.cara_mendapatkan_salinan);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to schedule visit');
      }
      
      // Show success message
      toast.success('Jadwal kunjungan berhasil diatur');
      
      // Close the schedule modal
      setIsScheduleModalOpen(false);
      
      // Update guest data locally with response from API
      if (guest && result.data) {
        setGuest({
          ...guest,
          jadwal_checkin: result.data.scheduledDateTime,
          jadwal_dibuat: result.data.jadwal_dibuat,
          status_kunjungan: result.data.status_kunjungan,
          bidang_tujuan_id: result.data.bidang_tujuan_id,
          bidang_tujuan: result.data.bidang_tujuan,
          asn_dituju: result.data.asn_dituju,
          cara_mendapatkan_salinan: result.data.cara_mendapatkan_salinan
        });
      }
      
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
  
  const handleCheckin = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/guests/${guest.id}/checkin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal menandai kedatangan tamu');
      }
      
      // Show success message
      toast.success('Tamu berhasil ditandai datang');
      
      // Update guest data locally with response from API
      let updatedGuest = guest;
      if (guest && result.data) {
        updatedGuest = {
          ...guest,
          waktu_checkin: result.data.waktu_checkin,
          status_kunjungan: result.data.status_kunjungan
        };
        setGuest(updatedGuest);
      }
      
      // Trigger refresh of guest data in the parent component with updated data
      if (onGuestUpdate) {
        onGuestUpdate(updatedGuest || undefined);
      }
    } catch (error) {
      console.error('Error checking in guest:', error);
      toast.error('Gagal menandai tamu datang');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCheckout = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/guests/${guest.id}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deactivateToken: true // Send flag to deactivate the token
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal menandai selesai tamu');
      }
      
      // Show success message
      toast.success('Kunjungan tamu berhasil ditandai selesai');
      
      // Update guest data locally with response from API
      let updatedGuest = guest;
      if (guest && result.data) {
        updatedGuest = {
          ...guest,
          waktu_checkout: result.data.waktu_checkout,
          status_kunjungan: result.data.status_kunjungan
        };
        setGuest(updatedGuest);
      }
      
      // Trigger refresh of guest data in the parent component with updated data
      if (onGuestUpdate) {
        onGuestUpdate(updatedGuest || undefined);
      }
    } catch (error) {
      console.error('Error checking out guest:', error);
      toast.error('Gagal menandai kunjungan selesai');
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
      'Datang': 'Tamu telah datang dan sedang diproses',
      'Selesai': 'Kunjungan tamu telah selesai'
    };

    // Alias untuk status "Datang" menjadi "Proses"
    const getDisplayStatus = (statusValue: string | undefined) => {
      if (statusValue === 'Datang') {return 'Proses';}
      return statusValue || 'Menunggu';
    };
    
    const color = status ? statusColors[status as keyof typeof statusColors] : 'bg-gray-100 text-gray-800';
    const tooltip = status ? statusTooltips[status as keyof typeof statusTooltips] : '';
    
    return (
      <Tooltip content={tooltip}>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color} cursor-help`}>
          {getDisplayStatus(status)}
        </span>
      </Tooltip>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Tamu' : 'Detail Tamu'} size="lg">
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
            </div>
          </div>
        </div>
        
        {/* Scheduling and visit information container */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Jadwal Kunjungan</h4>
              <p className="text-base font-medium text-blue-700">{formatDate(guest.jadwal_checkin)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Bidang Dituju</h4>
              <p className="text-base font-medium text-blue-700">{guest.bidang_tujuan || 'Belum ditetapkan'}</p>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-500">Menemui (ASN)</h4>
              <p className="text-base font-medium text-blue-700">{guest.asn_dituju || 'Tidak ditentukan'}</p>
            </div>
          </div>
          
          {guest.cara_mendapatkan_salinan && guest.cara_mendapatkan_salinan.length > 0 && (
            <div className="mt-3 border-t border-blue-200 pt-3">
              <h4 className="text-sm font-medium text-gray-500">Cara Mendapatkan Salinan</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {guest.cara_mendapatkan_salinan.map((cara: string, index: number) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {cara}
                  </span>
                ))}
              </div>
            </div>
          )}
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
              <h4 className="text-sm font-medium text-gray-500">Waktu Kedatangan</h4>
              <p className="mt-1 text-gray-900">{formatDate(guest.waktu_checkin)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Selesai</h4>
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
        </div>

        {/* Catatan Tambahan */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <h4 className="text-sm font-medium text-gray-500">Catatan Tambahan</h4>
            <Tooltip content="Catatan atau informasi tambahan dari tamu">
              <span className="ml-1 cursor-help text-gray-400 hover:text-gray-600 flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </Tooltip>
          </div>
          <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-gray-900 whitespace-pre-wrap">
              {guest.catatan_tambahan || 'Tidak ada catatan tambahan'}
            </p>
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
          {/* Tombol Jadwalkan / Edit Jadwal */}
          {(guest.status_kunjungan === 'Menunggu' || guest.status_kunjungan === 'Terjadwal') && (
            <button 
              onClick={() => setIsScheduleModalOpen(true)} 
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md transition-colors ${
                isSubmitting 
                  ? 'bg-blue-200 text-blue-600' 
                  : guest.status_kunjungan === 'Terjadwal'
                    ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300' 
                    : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
              }`}
            >
              {guest.status_kunjungan === 'Terjadwal' ? 'Edit Jadwal' : 'Jadwalkan'}
            </button>
          )}
          
          {/* Tombol Tandai Datang (Check-in) */}
          {(guest.status_kunjungan === 'Menunggu' || guest.status_kunjungan === 'Terjadwal') && (
            <button 
              onClick={handleCheckin}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-200 text-green-800 rounded-md hover:bg-green-300 transition-colors disabled:bg-green-100 disabled:text-green-500 disabled:cursor-not-allowed"
            >
              Tandai Datang
            </button>
          )}
          
          {/* Tombol Tandai Selesai (Check-out) - Tetap menggunakan status internal "Datang" */}
          {guest.status_kunjungan === 'Datang' && (
            <button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-200 text-purple-800 rounded-md hover:bg-purple-300 transition-colors disabled:bg-purple-100 disabled:text-purple-500 disabled:cursor-not-allowed"
            >
              Tandai Selesai
            </button>
          )}
          
          {/* Tombol Hapus */}
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-200 text-red-800 rounded-md hover:bg-red-300 transition-colors disabled:bg-red-100 disabled:text-red-400 disabled:cursor-not-allowed"
          >
            Hapus
          </button>
          
          {/* Tombol Tutup */}
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
          onClose={() => {
            console.log('Closing schedule modal');
            setIsScheduleModalOpen(false);
          }}
          onSchedule={handleSchedule}
          guestId={guest.id || 0}
          currentSchedule={guest.jadwal_checkin || undefined}
          currentBidangId={guest.bidang_tujuan_id}
          currentAsnDituju={guest.asn_dituju}
          currentCaraSalinan={(() => {
            const ids = guest.cara_mendapatkan_salinan_ids || [];
            console.log('Passing cara salinan IDs to ScheduleModal:', ids);
            console.log('Guest cara mendapatkan salinan names:', guest.cara_mendapatkan_salinan);
            return ids;
          })()}
          isEdit={guest.status_kunjungan === 'Terjadwal'}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {guest && (
        <DeleteConfirmDialog
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
          variant="detailed"
        />
      )}
    </Modal>
  );
}

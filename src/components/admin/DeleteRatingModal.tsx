'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import Modal from '../ui/Modal';
import ConfirmationModal from './ConfirmationModal';

interface RatingType {
  id: number;
  nama_rating: string;
  deskripsi?: string;
}

interface DeleteRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRatingDeleted?: () => void;
}

export default function DeleteRatingModal({ 
  isOpen, 
  onClose, 
  onRatingDeleted 
}: DeleteRatingModalProps) {
  const [ratingTypes, setRatingTypes] = useState<RatingType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRating, setSelectedRating] = useState<RatingType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch rating types when modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchRatingTypes();
    }
  }, [isOpen]);

  const fetchRatingTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/survey/rating-types');
      if (!response.ok) {
        throw new Error('Failed to fetch rating types');
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRatingTypes(data.data);
      } else {
        setRatingTypes([]);
      }
    } catch (error) {
      console.error('Error fetching rating types:', error);
      toast.error('Gagal memuat data rating');
      setRatingTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (rating: RatingType) => {
    setSelectedRating(rating);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRating) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/survey/rating-types/${selectedRating.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Rating berhasil dihapus');
        // Remove deleted rating from list
        setRatingTypes(prev => prev.filter(rating => rating.id !== selectedRating.id));
        // Call parent callback if provided
        if (onRatingDeleted) {
          onRatingDeleted();
        }
      } else {
        toast.error(data.message || 'Gagal menghapus rating');
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('Terjadi kesalahan saat menghapus rating');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setSelectedRating(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSelectedRating(null);
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Hapus Rating" 
        size="md"
      >
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2 text-gray-600">Memuat data rating...</span>
            </div>
          ) : ratingTypes.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500">Belum ada rating yang tersedia</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Pilih rating yang ingin dihapus. Pastikan rating tidak sedang digunakan dalam pertanyaan survei aktif.
              </p>
              
              <div className="space-y-2">
                {ratingTypes.map((rating) => (
                  <div
                    key={rating.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{rating.nama_rating}</h4>
                      {rating.deskripsi && (
                        <p className="text-sm text-gray-500 mt-1">{rating.deskripsi}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteClick(rating)}
                      className="flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      title="Hapus rating"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Hapus Rating"
        message="Apakah Anda yakin ingin menghapus rating ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua opsi rating yang terkait."
        confirmButtonText="Ya, Hapus Rating"
        cancelButtonText="Batal"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        isLoading={isDeleting}
        itemName={selectedRating?.nama_rating}
      />
    </>
  );
}
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

import Modal from '../ui/Modal';

interface RatingType {
  id: number;
  nama_rating: string;
  deskripsi?: string;
}

interface AddRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRatingAdded: (newRating: RatingType) => void;
  pendingExtraAnswerIdx: number | null;
  onRatingAssigned: (ratingId: number, pendingIdx: number | null) => void;
}

export default function AddRatingModal({
  isOpen,
  onClose,
  onRatingAdded,
  pendingExtraAnswerIdx,
  onRatingAssigned
}: AddRatingModalProps) {
  const [newTypeData, setNewTypeData] = useState({ name: '', options: [''] });
  const [ratingTypes, setRatingTypes] = useState<RatingType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setNewTypeData({ name: '', options: [''] });
    onClose();
  };

  const handleAddOption = async () => {
    if (!newTypeData.name.trim()) {
      toast.error('Isi judul rating terlebih dahulu sebelum menambah opsi!');
      return;
    }
    
    // If this is a new rating type (not yet saved), just add to local state
    if (!ratingTypes.some(rt => rt.nama_rating === newTypeData.name)) {
      setNewTypeData(data => ({
        ...data,
        options: [...data.options, '']
      }));
      return;
    }
    
    // Otherwise, add to database
    const ratingType = ratingTypes.find(rt => rt.nama_rating === newTypeData.name);
    if (!ratingType) {
      toast.error('Jenis rating belum tersimpan di database!');
      return;
    }
    
    // Determine next urutan_rating
    const urutan_rating = newTypeData.options.length + 1;
    
    try {
      const res = await fetch('/api/survey/rating-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis_rating_id: ratingType.id,
          skala_rating: '', // You may want to prompt user for the new option value
          urutan_rating
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.data?.id) {
        setNewTypeData(prev => ({
          ...prev,
          options: [...prev.options, ''] // You may want to use the value from user input
        }));
        toast.success('Opsi berhasil ditambahkan ke database!');
      } else {
        toast.error('Gagal menambah opsi ke database');
      }
    } catch (error) {
      console.error('Error adding option:', error);
      toast.error('Terjadi kesalahan saat menambah opsi');
    }
  };

  const handleRemoveOption = (idx: number) => {
    setNewTypeData(data => ({
      ...data,
      options: data.options.filter((_, i) => i !== idx)
    }));
  };

  const handleOptionChange = (idx: number, value: string) => {
    setNewTypeData(data => ({
      ...data,
      options: data.options.map((o, i) => i === idx ? value : o)
    }));
  };

  const handleSave = async () => {
    // Validasi
    if (!newTypeData.name.trim()) {
      toast.error('Judul rating wajib diisi');
      return;
    }
    
    if (newTypeData.options.some(opt => !opt.trim())) {
      toast.error('Semua opsi rating wajib diisi');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Simpan ke backend
      const res = await fetch('/api/survey/rating-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_rating: newTypeData.name,
          options: newTypeData.options
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.data?.id) {
        const newRating = {
          id: data.data.id,
          nama_rating: newTypeData.name
        };
        
        // Notify parent component about the new rating
        onRatingAdded(newRating);
        
        // Assign the new rating to the appropriate dropdown
        onRatingAssigned(data.data.id, pendingExtraAnswerIdx);
        
        // Reset form and close modal
        setNewTypeData({ name: '', options: [''] });
        onClose();
        
        toast.success('Jenis rating berhasil ditambahkan!');
      } else {
        toast.error(data.message || 'Gagal menambah jenis rating');
      }
    } catch (error) {
      console.error('Error saving rating type:', error);
      toast.error('Terjadi kesalahan saat menyimpan rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Tambah Rating Baru" 
      size="sm"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Judul Rating
          </label>
          <input
            type="text"
            value={newTypeData.name}
            onChange={e => setNewTypeData({ ...newTypeData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 placeholder:italic"
            placeholder="Masukan Judul Rating"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opsi Rating
          </label>
          
          {newTypeData.options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 placeholder:italic"
                placeholder={`Opsi ${idx + 1}`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => handleRemoveOption(idx)}
                className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                disabled={newTypeData.options.length <= 1 || isSubmitting}
                title="Hapus opsi"
              >
                ×
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-2 px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition-colors"
            disabled={isSubmitting}
          >
            + Tambah Opsi
          </button>
        </div>
        
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
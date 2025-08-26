'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface RatingType {
  id: number;
  tipe: 'rating' | 'text';
  nama_rating: string;
  deskripsi?: string;
}

interface SurveyQuestion {
  id?: number;
  pertanyaan: string;
  tipe_pertanyaan: 'rating' | 'text';
  status: boolean;
  jenis_rating_id?: number;
  is_required?: boolean;
  urutan?: number;
  baris?: number;
}

interface SurveyQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (question: SurveyQuestion) => Promise<void>;
  initialQuestion?: SurveyQuestion;
  isEditMode?: boolean;
}

export default function SurveyQuestionModal({ 
  isOpen, 
  onClose, 
  onAddQuestion, 
  initialQuestion, 
  isEditMode = false 
}: SurveyQuestionModalProps) {
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingTypes, setRatingTypes] = useState<RatingType[]>([]);
  const [isLoadingRatingTypes, setIsLoadingRatingTypes] = useState(false);
  const [showNewTypeDialog, setShowNewTypeDialog] = useState(false);
  const [newTypeData, setNewTypeData] = useState({ type: 'rating', name: '' });
  const [questionData, setQuestionData] = useState<SurveyQuestion>({
    pertanyaan: '',
    tipe_pertanyaan: 'rating',
    status: true,
    jenis_rating_id: undefined,
    is_required: true
  });
  const [extraAnswers, setExtraAnswers] = useState<
  { tipe: 'rating' | 'text'; jenis_rating_id?: number }[]>([]);

  // Fetch rating types when modal is opened or question type changes
  useEffect(() => {
    if (isOpen) {
      fetchRatingTypes(questionData.tipe_pertanyaan);
    }
  }, [isOpen, questionData.tipe_pertanyaan]);

  // Set question data when initialQuestion changes or modal is opened
  useEffect(() => {
    if (initialQuestion && isOpen) {
      setQuestionData({
        ...initialQuestion
      });
    } else if (isOpen) {
      // Reset form when opened in add mode
      setQuestionData({
        pertanyaan: '',
        tipe_pertanyaan: 'rating',
        status: true,
        jenis_rating_id: undefined,
        is_required: true
      });
    }
  }, [initialQuestion, isOpen]);

  // Fetch rating types from API with optional type filter
  const fetchRatingTypes = async (type?: 'rating' | 'text') => {
    try {
      setIsLoadingRatingTypes(true);
      
      // Add type parameter to the URL if specified
      let apiUrl = '/api/survey/rating-types';
      if (type) {
        apiUrl += `?type=${type}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rating types');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setRatingTypes(data.data);
        
        // Set default rating type if available and none is selected
        if (data.data.length > 0 && !questionData.jenis_rating_id) {
          setQuestionData(prev => ({
            ...prev,
            jenis_rating_id: data.data[0].id
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching rating types:', error);
      toast.error('Gagal memuat jenis rating');
    } finally {
      setIsLoadingRatingTypes(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!questionData.pertanyaan.trim()) {
        toast.error('Pertanyaan tidak boleh kosong');
        return;
      }

      setIsSubmitting(true);
      
      // Call parent handler
      await onAddQuestion(questionData);
      
      // Reset form if not in edit mode
      if (!isEditMode) {
        setQuestionData({
          pertanyaan: '',
          tipe_pertanyaan: 'rating',
          status: true,
          jenis_rating_id: ratingTypes.length > 0 ? ratingTypes[0].id : undefined,
          is_required: true
        });
      }
      
      // Show success message
      toast.success(isEditMode 
        ? 'Pertanyaan berhasil diperbarui!' 
        : 'Pertanyaan berhasil ditambahkan!'
      );
      
      onClose();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Gagal menyimpan pertanyaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExtraAnswer = () => {
    setExtraAnswers([
      ...extraAnswers,
      { tipe: 'rating', jenis_rating_id: ratingTypes.length > 0 ? ratingTypes[0].id : undefined }
    ]);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? "Edit Pertanyaan" : "Tambah Pertanyaan Baru"} 
      size="md"
    >
      <div className="space-y-6">
        {/* Form Content */}
        <div className="space-y-4">
          <div>
            <label htmlFor="pertanyaan" className="block text-sm font-medium text-gray-700 mb-1">
              Pertanyaan
            </label>
            <input
              type="text"
              id="pertanyaan"
              value={questionData.pertanyaan}
              onChange={(e) => setQuestionData({
                ...questionData,
                pertanyaan: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan pertanyaan..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipe_pertanyaan" className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Jawaban
              </label>
              <select
                id="tipe_pertanyaan"
                value={questionData.tipe_pertanyaan}
                onChange={(e) => {
                  const newType = e.target.value as 'rating' | 'text';
                  setQuestionData({
                    ...questionData,
                    tipe_pertanyaan: newType,
                    // If switching to text type, clear the rating type
                    jenis_rating_id: newType === 'text' ? undefined : questionData.jenis_rating_id
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating">Rating</option>
                <option value="text">Text</option>
              </select>
            </div>
            
            {/* Show jenis rating dropdown only for rating question types */}
            {questionData.tipe_pertanyaan === 'rating' && (
              <div>
                <label htmlFor="jenis_rating_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Rating
                </label>
                <select
                  id="jenis_rating_id"
                  value={questionData.jenis_rating_id || ''}
                  onChange={(e) => setQuestionData({
                    ...questionData,
                    jenis_rating_id: parseInt(e.target.value) || undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoadingRatingTypes}
                >
                  {isLoadingRatingTypes ? (
                    <option>Loading...</option>
                  ) : ratingTypes.length === 0 ? (
                    <option>Tidak ada jenis rating</option>
                  ) : (
                    ratingTypes.filter(type => type.tipe === 'rating').map(type => (
                      <option key={type.id} value={type.id}>
                        {type.nama_rating}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>

{/* Tambah Jenis Jawaban di bawah grid (tetap tampil meski sudah diklik) */}
{questionData.tipe_pertanyaan === 'rating' && (
  <div className="mt-4">
    {/* Render semua extraAnswers */}
    <div className="space-y-4">
      {extraAnswers.map((ans, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Jawaban
            </label>
            <select
              value={ans.tipe}
              onChange={e => {
                const tipe = e.target.value as 'rating' | 'text';
                setExtraAnswers(list =>
                  list.map((item, i) =>
                    i === idx
                      ? { ...item, tipe, jenis_rating_id: tipe === 'rating' ? ratingTypes[0]?.id : undefined }
                      : item
                  )
                );
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="rating">Rating</option>
              <option value="text">Text</option>
            </select>
          </div>
          <div className="flex gap-2">
            {ans.tipe === 'rating' && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Rating
                </label>
                <select
                  value={ans.jenis_rating_id || ''}
                  onChange={e =>
                    setExtraAnswers(list =>
                      list.map((item, i) =>
                        i === idx
                          ? { ...item, jenis_rating_id: parseInt(e.target.value) || undefined }
                          : item
                      )
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {ratingTypes.length === 0 ? (
                    <option>Tidak ada jenis rating</option>
                  ) : (
                    ratingTypes
                      .filter(type => type.tipe === 'rating')
                      .map(type => (
                        <option key={type.id} value={type.id}>
                          {type.nama_rating}
                        </option>
                      ))
                  )}
                </select>
              </div>
            )}
            {/* Tombol hapus */}
            <button
              type="button"
              onClick={() =>
                setExtraAnswers(list => list.filter((_, i) => i !== idx))
              }
              className="h-10 w-10 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 self-end"
              title="Hapus"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
    {/* Tombol selalu di paling bawah */}
    <button
      type="button"
      onClick={handleAddExtraAnswer}
      className="mt-4 w-full flex items-center justify-center px-3 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
    >
      + Tambah Jenis Jawaban
    </button>
  </div>
)}


          <div className="mt-4">
            <div className="mb-3">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionData.status}
                  onChange={(e) => setQuestionData({
                    ...questionData,
                    status: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  Aktifkan pertanyaan
                </span>
              </label>
            </div>
            
            <div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionData.is_required}
                  onChange={(e) => setQuestionData({
                    ...questionData,
                    is_required: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  Wajib diisi
                </span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Footer with action buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import Modal from '../ui/Modal';
import DeleteRatingModal from './DeleteRatingModal';
import AddRatingModal from './AddRatingModal';

interface RatingType {
  id: number;
  nama_rating: string;
  deskripsi?: string;
}

interface SurveyQuestion {
  id?: number;
  pertanyaan: string;
  tipe_pertanyaan: 'rating' | 'text';
  status: boolean;
  jenis_rating_id?: number;
  is_required?: boolean | number; // Allow both boolean and number (1/0 from DB)
  urutan?: number;
  baris?: number;
  multiple_rating_types?: { 
    jenis_rating_id: number; 
    nama_rating?: string;
    urutan?: number;
  }[];
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
  const [questionData, setQuestionData] = useState<SurveyQuestion>({
    pertanyaan: '',
    tipe_pertanyaan: 'rating',
    status: true,
    jenis_rating_id: undefined,
    // Default to true for required field
    is_required: true
  });
  const [extraAnswers, setExtraAnswers] = useState<
  { jenis_rating_id?: number }[]>([]);
  const [pendingExtraAnswerIdx, setPendingExtraAnswerIdx] = useState<number | null>(null);
  const [showDeleteRatingModal, setShowDeleteRatingModal] = useState(false);

  // Fetch rating types when modal is opened or question type changes
  useEffect(() => {
    if (isOpen) {
      fetchRatingTypes();
    }
  }, [isOpen]);

  // Set question data when initialQuestion changes or modal is opened
  useEffect(() => {
    if (initialQuestion && isOpen) {
      // First fetch rating types to have them available
      fetchRatingTypes().then(() => {
        // Ensure is_required is properly handled - convert 1/0 or boolean to boolean
        const processedIsRequired = initialQuestion.is_required === undefined 
          ? true 
          : Boolean(Number(initialQuestion.is_required));
          
        console.log('Loading question - is_required from DB:', initialQuestion.is_required, 'converted to:', processedIsRequired);
          
        setQuestionData({
          ...initialQuestion,
          is_required: processedIsRequired
        });
        
        // Load extra answers from multiple_rating_types if available
        if (initialQuestion.multiple_rating_types && initialQuestion.multiple_rating_types.length > 0) {
          // Sort rating types by urutan to maintain order
          const sortedRatingTypes = [...initialQuestion.multiple_rating_types].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
          
          // Set the first rating type as the main one
          if (sortedRatingTypes.length > 0) {
            setQuestionData(prev => ({
              ...prev,
              jenis_rating_id: sortedRatingTypes[0].jenis_rating_id,
              // Use is_required directly from initialQuestion, convert from 1/0 to boolean
              is_required: Boolean(Number(initialQuestion.is_required))
            }));
          }
          
          // If there are multiple rating types, set the rest as extraAnswers
          if (sortedRatingTypes.length > 1) {
            const extraTypes = sortedRatingTypes.slice(1).map(rt => ({
              jenis_rating_id: rt.jenis_rating_id
            }));
            setExtraAnswers(extraTypes);
          } else {
            setExtraAnswers([]);
          }
        } else {
          setExtraAnswers([]);
        }
      });
    } else if (isOpen) {
      // Reset form when opened in add mode
      fetchRatingTypes().then(() => {
        setQuestionData({
          pertanyaan: '',
          tipe_pertanyaan: 'rating',
          status: true,
          jenis_rating_id: ratingTypes.length > 0 ? ratingTypes[0].id : undefined,
          is_required: true
        });
        setExtraAnswers([]);
      });
    }
  }, [initialQuestion, isOpen]);

  const fetchRatingTypes = async () => {
    try {
      setIsLoadingRatingTypes(true);
      const response = await fetch('/api/survey/rating-types');
      if (!response.ok) {throw new Error('Failed to fetch rating types');}
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRatingTypes(data.data);
        // Hapus kode auto-set jenis_rating_id di sini!
      }
    } catch (error) {
      console.error('Error fetching rating types:', error);
      toast.error('Gagal memuat jenis rating');
    } finally {
      setIsLoadingRatingTypes(false);
    }
  };

  // Handler when rating is deleted - refresh the rating types list
  const handleRatingDeleted = () => {
    fetchRatingTypes();
  };

  // Handler when new rating is added
  const handleRatingAdded = (newRating: RatingType) => {
    setRatingTypes(prev => [...prev, newRating]);
  };

  // Handler when rating is assigned to dropdown
  const handleRatingAssigned = (ratingId: number, pendingIdx: number | null) => {
    if (pendingIdx !== null) {
      // Assign to extra answer dropdown
      setExtraAnswers(list =>
        list.map((item, i) =>
          i === pendingIdx
            ? { ...item, jenis_rating_id: ratingId }
            : item
        )
      );
      setPendingExtraAnswerIdx(null);
    } else {
      // Assign to main dropdown
      setQuestionData(prev => ({
        ...prev,
        jenis_rating_id: ratingId
      }));
    }
  };

  // Get available rating types that aren't already used
  const getAvailableRatingTypes = () => {
    return ratingTypes.filter(rt => !usedRatingIds.includes(rt.id));
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!questionData.pertanyaan.trim()) {
        toast.error('Pertanyaan tidak boleh kosong');
        return;
      }

      setIsSubmitting(true);
      
      // Prepare the question data with multiple rating types
      const questionToSubmit = {
        ...questionData,
        // Ensure is_required is always a boolean
        is_required: Boolean(questionData.is_required),
        // Keep is_required at the question level, not in each rating type
        multiple_rating_types: [
          // Main rating type
          { 
            jenis_rating_id: questionData.jenis_rating_id!
          },
          // Additional rating types from extraAnswers
          ...extraAnswers.map(ans => ({
            jenis_rating_id: ans.jenis_rating_id!
          }))
        ].filter(item => item.jenis_rating_id) // Remove undefined values
      };
      
      // Debug log to check data being sent
      console.log('Submitting question with is_required:', questionToSubmit.is_required, typeof questionToSubmit.is_required);
      
      // Call parent handler
      await onAddQuestion(questionToSubmit);
      
      // Reset form if not in edit mode
      if (!isEditMode) {
        setQuestionData({
          pertanyaan: '',
          tipe_pertanyaan: 'rating',
          status: true,
          jenis_rating_id: ratingTypes.length > 0 ? ratingTypes[0].id : undefined,
          is_required: true
        });
        setExtraAnswers([]);
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
    // Cari rating yang belum dipakai
    const usedIds = [
      questionData.jenis_rating_id,
      ...extraAnswers.map(ans => ans.jenis_rating_id)
    ].filter(Boolean) as number[];

    const availableRatings = ratingTypes.filter(
      rt => !usedIds.includes(rt.id)
    );

    if (availableRatings.length > 0) {
      setExtraAnswers([
        ...extraAnswers,
        { jenis_rating_id: availableRatings[0].id }
      ]);
    } else {
      toast.error('Semua jenis rating sudah digunakan');
    }
  };

  // Fungsi untuk mendapatkan id rating yang sudah dipakai
  const usedRatingIds = [
    questionData.jenis_rating_id,
    ...extraAnswers.map(ans => ans.jenis_rating_id)
  ].filter(Boolean) as number[];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'} 
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
          
          <div>
            <label htmlFor="jenis_rating_id" className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Rating
            </label>
            <select
              id="jenis_rating_id"
              value={questionData.jenis_rating_id || ''}
              onChange={(e) => {
                if (e.target.value === 'add_new') {
                  setShowNewTypeDialog(true);
                  setPendingExtraAnswerIdx(null); // null artinya dropdown utama
                } else if (e.target.value === 'delete_rating') {
                  setShowDeleteRatingModal(true);
                } else {
                  setQuestionData({
                    ...questionData,
                    jenis_rating_id: parseInt(e.target.value) || undefined
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoadingRatingTypes}
            >
              <option value="">Pilih Rating</option>
              {isLoadingRatingTypes ? (
                <option>Loading...</option>
              ) : ratingTypes.length === 0 ? (
                <option>Tidak ada jenis rating</option>
              ) : (
                ratingTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.nama_rating}
                  </option>
                ))
              )}
              <option value="add_new">Tambah Rating</option>
              <option value="delete_rating">Hapus Rating</option>
            </select>
          </div>

{/* Tambah Jenis Jawaban di bawah grid */}
{questionData.tipe_pertanyaan === 'rating' && (
  <div className="mt-4">
    {/* Render semua extraAnswers */}
    <div className="space-y-4">
      {extraAnswers.map((ans, idx) => (
        <div key={idx} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Rating Tambahan
            </label>
            <select
              value={ans.jenis_rating_id || ''}
              onChange={e => {
                if (e.target.value === 'add_new') {
                  setShowNewTypeDialog(true);
                  setPendingExtraAnswerIdx(idx); // untuk extraAnswers
                } else if (e.target.value === 'delete_rating') {
                  setShowDeleteRatingModal(true);
                } else {
                  setExtraAnswers(list =>
                    list.map((item, i) =>
                      i === idx
                        ? { ...item, jenis_rating_id: parseInt(e.target.value) || undefined }
                        : item
                    )
                  );
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Pilih Rating</option>
              {ratingTypes
                .filter(type =>
                  (!usedRatingIds.includes(type.id) || type.id === ans.jenis_rating_id)
                )
                .map(type => (
                  <option key={type.id} value={type.id}>
                    {type.nama_rating}
                  </option>
                ))}
              <option value="add_new">Tambah Rating</option>
              <option value="delete_rating">Hapus Rating</option>
            </select>
          </div>
          {/* Tombol hapus */}
          <button
            type="button"
            onClick={() => {
              // When removing an answer, the rating becomes available again
              setExtraAnswers(list => list.filter((_, i) => i !== idx));
              
              // Let the user know that the rating type is now available again
              if (ans.jenis_rating_id) {
                const removedType = ratingTypes.find(rt => rt.id === ans.jenis_rating_id);
                if (removedType) {
                  toast.success(`Jenis rating "${removedType.nama_rating}" kembali tersedia`, {
                    duration: 2000,
                    style: {
                      borderRadius: '10px',
                      background: '#4CAF50',
                      color: '#fff',
                    },
                  });
                }
              }
            }}
            className="h-10 w-10 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 self-end"
            title="Hapus"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
    {/* Tombol selalu di paling bawah */}
    <button
      type="button"
      onClick={handleAddExtraAnswer}
      className="mt-4 w-full flex items-center justify-center px-3 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
    >
      + Tambah Jenis Rating
    </button>
  </div>
)}


          <div className="mt-4">
            <div className="mb-3">
              <label className="inline-flex items-center cursor-pointer">
                <div 
                  onClick={() => setQuestionData({
                    ...questionData,
                    status: !questionData.status
                  })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                    questionData.status ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200 ease-in-out ${
                    questionData.status ? 'transform translate-x-full' : ''
                  }`}></div>
                </div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  Aktifkan pertanyaan
                </span>
              </label>
            </div>
            
            <div>
              <label className="inline-flex items-center cursor-pointer">
                <div 
                  onClick={() => setQuestionData({
                    ...questionData,
                    is_required: !questionData.is_required
                  })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                    questionData.is_required ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200 ease-in-out ${
                    questionData.is_required ? 'transform translate-x-full' : ''
                  }`}></div>
                </div>
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

      {/* Add Rating Modal */}
      <AddRatingModal
        isOpen={showNewTypeDialog}
        onClose={() => setShowNewTypeDialog(false)}
        onRatingAdded={handleRatingAdded}
        pendingExtraAnswerIdx={pendingExtraAnswerIdx}
        onRatingAssigned={handleRatingAssigned}
      />

      {/* Delete Rating Modal */}
      <DeleteRatingModal
        isOpen={showDeleteRatingModal}
        onClose={() => setShowDeleteRatingModal(false)}
        onRatingDeleted={handleRatingDeleted}
      />
    </Modal>
  );
}

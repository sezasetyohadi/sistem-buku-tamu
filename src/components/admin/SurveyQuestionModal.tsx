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
  multiple_rating_types?: { 
    jenis_rating_id: number; 
    is_required?: boolean; 
    nama_rating?: string;
    tipe?: string;
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
  
  // Track which rating types are already selected
  const [usedRatingIds, setUsedRatingIds] = useState<number[]>([]);
  
  // Update used rating IDs whenever question data or extra answers change
  useEffect(() => {
    const mainRatingId = questionData.jenis_rating_id;
    const extraRatingIds = extraAnswers
      .filter(ans => ans.tipe === 'rating' && ans.jenis_rating_id)
      .map(ans => ans.jenis_rating_id as number);
    
    // Combine all used rating IDs
    const allUsedIds = mainRatingId ? [mainRatingId, ...extraRatingIds] : extraRatingIds;
    setUsedRatingIds(allUsedIds);
  }, [questionData.jenis_rating_id, extraAnswers]);

  // Fetch rating types when modal is opened or question type changes
  useEffect(() => {
    if (isOpen) {
      fetchRatingTypes(questionData.tipe_pertanyaan);
    }
  }, [isOpen, questionData.tipe_pertanyaan]);

  // Set question data when initialQuestion changes or modal is opened
  useEffect(() => {
    if (initialQuestion && isOpen) {
      // First fetch rating types to have them available
      fetchRatingTypes().then(() => {
        setQuestionData({
          ...initialQuestion
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
              is_required: sortedRatingTypes[0].is_required
            }));
          }
          
          // If there are multiple rating types, set the rest as extraAnswers
          if (sortedRatingTypes.length > 1) {
            const extraTypes = sortedRatingTypes.slice(1).map(rt => ({
              tipe: rt.tipe === 'text' ? 'text' as const : 'rating' as const,
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
        // Get all rating types of type 'rating'
        const ratingTypesOfTypeRating = ratingTypes.filter(rt => rt.tipe === 'rating');
        
        setQuestionData({
          pertanyaan: '',
          tipe_pertanyaan: 'rating',
          status: true,
          jenis_rating_id: ratingTypesOfTypeRating.length > 0 ? ratingTypesOfTypeRating[0].id : undefined,
          is_required: true
        });
        setExtraAnswers([]);
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
          // Find a rating type that matches the current question type
          const matchingType = data.data.find((rt: RatingType) => rt.tipe === questionData.tipe_pertanyaan);
          if (matchingType) {
            setQuestionData(prev => ({
              ...prev,
              jenis_rating_id: matchingType.id
            }));
          } else if (data.data.length > 0) {
            // Fallback to first available type
            setQuestionData(prev => ({
              ...prev,
              jenis_rating_id: data.data[0].id
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching rating types:', error);
      toast.error('Gagal memuat jenis rating');
    } finally {
      setIsLoadingRatingTypes(false);
    }
  };

  // Get available rating types that aren't already used
  const getAvailableRatingTypes = (type: 'rating' | 'text' = 'rating') => {
    return ratingTypes.filter(rt => 
      rt.tipe === type && !usedRatingIds.includes(rt.id)
    );
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
        multiple_rating_types: [
          // Main rating type
          { 
            jenis_rating_id: questionData.jenis_rating_id!, 
            is_required: questionData.is_required 
          },
          // Additional rating types from extraAnswers
          ...extraAnswers.map(ans => ({
            jenis_rating_id: ans.jenis_rating_id!,
            is_required: true // Default to required for extra answers
          }))
        ].filter(item => item.jenis_rating_id) // Remove undefined values
      };
      
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
    // Check available rating types
    const availableRatingTypes = getAvailableRatingTypes('rating');
    
    if (availableRatingTypes.length > 0) {
      // If there are still available rating types, add a rating answer with the first available type
      setExtraAnswers([
        ...extraAnswers,
        { tipe: 'rating', jenis_rating_id: availableRatingTypes[0].id }
      ]);
    } else {
      // If all rating types are used, add a text answer
      setExtraAnswers([
        ...extraAnswers,
        { tipe: 'text', jenis_rating_id: undefined }
      ]);
      
      // Show info toast
      toast.success('Semua jenis rating sudah digunakan. Menambahkan jawaban teks.', {
        duration: 3000,
        style: {
          borderRadius: '10px',
          background: '#FFD166',
          color: '#333',
        },
      });
    }
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
                  
                  // Fetch appropriate rating types for the new type
                  fetchRatingTypes(newType);
                  
                  setQuestionData(prev => {
                    // Create new question data with the new type
                    const updated = {
                      ...prev,
                      tipe_pertanyaan: newType
                    };
                    
                    // If switching to 'text' type, clear rating ID
                    if (newType === 'text') {
                      updated.jenis_rating_id = undefined;
                    } else if (newType === 'rating') {
                      // When switching to rating, find an available rating type
                      const availableTypes = ratingTypes.filter(
                        type => type.tipe === 'rating' && !usedRatingIds.includes(type.id)
                      );
                      
                      if (availableTypes.length > 0) {
                        updated.jenis_rating_id = availableTypes[0].id;
                      }
                    }
                    
                    return updated;
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating">Rating</option>
                <option value="text">Text</option>
              </select>
            </div>
            
            {/* Show jenis rating dropdown for both rating and text question types */}
            {(questionData.tipe_pertanyaan === 'rating') && (
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
                    // Show all rating types for main question, or filter out already used ones in extraAnswers
                    ratingTypes
                      .filter(type => {
                        // Only show rating types of the right type
                        if (type.tipe !== questionData.tipe_pertanyaan) return false;
                        
                        // If this is the currently selected option, always show it
                        if (type.id === questionData.jenis_rating_id) return true;
                        
                        // Otherwise only show if not used in extraAnswers
                        return !extraAnswers.some(ans => ans.jenis_rating_id === type.id);
                      })
                      .map(type => (
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
{(questionData.tipe_pertanyaan === 'rating' || questionData.tipe_pertanyaan === 'text') && (
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
                  list.map((item, i) => {
                    if (i !== idx) return item;
                    
                    // Get available rating types excluding the ones already used
                    const availableTypes = ratingTypes.filter(rt => {
                      if (rt.tipe !== tipe) return false;
                      
                      // Filter out types used in main question or other extra answers
                      const otherExtraAnswerIds = extraAnswers
                        .filter((_, j) => j !== idx)
                        .map(ea => ea.jenis_rating_id);
                      
                      const usedIds = [
                        questionData.jenis_rating_id,
                        ...otherExtraAnswerIds
                      ].filter(Boolean) as number[];
                      
                      return !usedIds.includes(rt.id);
                    });
                    
                    // For text type, no rating ID is needed
                    // For rating type, select the first available rating type if any
                    return { 
                      ...item, 
                      tipe, 
                      jenis_rating_id: tipe === 'rating' && availableTypes.length > 0 
                        ? availableTypes[0]?.id 
                        : undefined 
                    };
                  })
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
                      .filter(type => {
                        // Only show rating types of the right type
                        if (type.tipe !== ans.tipe) return false;
                        
                        // If this is the currently selected option, always show it
                        if (type.id === ans.jenis_rating_id) return true;
                        
                        // Filter out the main question's rating type
                        if (type.id === questionData.jenis_rating_id) return false;
                        
                        // Filter out rating types used in other extra answers
                        const otherExtraAnswerIds = extraAnswers
                          .filter((_, i) => i !== idx) // exclude current answer
                          .map(ea => ea.jenis_rating_id);
                        
                        return !otherExtraAnswerIds.includes(type.id);
                      })
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
              onClick={() => {
                // When removing an answer, the rating becomes available again
                setExtraAnswers(list => list.filter((_, i) => i !== idx));
                
                // Let the user know that the rating type is now available again
                if (ans.tipe === 'rating' && ans.jenis_rating_id) {
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

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
  const [newTypeData, setNewTypeData] = useState({ name: '', options: [''] });
  const [questionData, setQuestionData] = useState<SurveyQuestion>({
    pertanyaan: '',
    tipe_pertanyaan: 'rating',
    status: true,
    jenis_rating_id: undefined,
    is_required: true
  });
  const [extraAnswers, setExtraAnswers] = useState<
  { tipe: 'rating' | 'text'; jenis_rating_id?: number }[]>([]);
  const [pendingExtraAnswerIdx, setPendingExtraAnswerIdx] = useState<number | null>(null);

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

  const fetchRatingTypes = async () => {
    try {
      setIsLoadingRatingTypes(true);
      const response = await fetch('/api/survey/rating-types');
      if (!response.ok) throw new Error('Failed to fetch rating types');
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
    // Cari rating yang belum dipakai
    const usedIds = [
      questionData.tipe_pertanyaan === 'rating' ? questionData.jenis_rating_id : null,
      ...extraAnswers.filter(ans => ans.tipe === 'rating').map(ans => ans.jenis_rating_id)
    ].filter(Boolean) as number[];

    const availableRatings = ratingTypes.filter(
      rt => rt.tipe === 'rating' && !usedIds.includes(rt.id)
    );

    if (availableRatings.length > 0) {
      setExtraAnswers([
        ...extraAnswers,
        { tipe: 'rating', jenis_rating_id: availableRatings[0].id }
      ]);
    } else {
      // Jika semua rating sudah dipakai, otomatis tambah tipe text
      setExtraAnswers([
        ...extraAnswers,
        { tipe: 'text' }
      ]);
    }
  };

  // Fungsi untuk mendapatkan id rating yang sudah dipakai
  const usedRatingIds = [
    questionData.tipe_pertanyaan === 'rating' ? questionData.jenis_rating_id : null,
    ...extraAnswers.filter(ans => ans.tipe === 'rating').map(ans => ans.jenis_rating_id)
  ].filter(Boolean) as number[];

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
                    // Reset jenis_rating_id jika bukan rating
                    jenis_rating_id: newType === 'rating' ? ratingTypes[0]?.id : undefined,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating">Rating</option>
                <option value="text">Text</option>
              </select>
            </div>

            {/* Hanya tampil jika tipe_pertanyaan === 'rating' */}
            {questionData.tipe_pertanyaan === 'rating' && (
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
                    ratingTypes
                      .filter(type => type.tipe === questionData.tipe_pertanyaan)
                      .map(type => (
                        <option key={type.id} value={type.id}>
                          {type.nama_rating}
                        </option>
                      ))
                  )}
                  <option value="add_new">Tambah Rating</option>
                </select>
              </div>
            )}
          </div>

{/* Tambah Jenis Jawaban di bawah grid */}
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
                  list.map((item, i) =>
                    i === idx
                      ? { ...item, tipe, jenis_rating_id: undefined } // Perbaikan di sini
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
            {/* Hanya tampil jika ans.tipe === 'rating' */}
            {ans.tipe === 'rating' && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Rating
                </label>
                <select
                  value={ans.jenis_rating_id || ''}
                  onChange={e => {
                    if (e.target.value === 'add_new') {
                      setShowNewTypeDialog(true);
                      setPendingExtraAnswerIdx(idx); // untuk extraAnswers
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
                      type.tipe === 'rating' &&
                      (!usedRatingIds.includes(type.id) || type.id === ans.jenis_rating_id)
                    )
                    .map(type => (
                      <option key={type.id} value={type.id}>
                        {type.nama_rating}
                      </option>
                    ))}
                  <option value="add_new">Tambah Rating</option>
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

      {/* Modal untuk menambah jenis rating baru */}
      {showNewTypeDialog && (
        <Modal isOpen={showNewTypeDialog} onClose={() => setShowNewTypeDialog(false)} title="Tambah Rating Baru" size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Rating</label>
              <input
                type="text"
                value={newTypeData.name}
                onChange={e => setNewTypeData({ ...newTypeData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Masukan Judul Rating"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opsi Rating</label>
              {newTypeData.options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={e => setNewTypeData(data => ({
                      ...data,
                      options: data.options.map((o, i) => i === idx ? e.target.value : o)
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={`Opsi ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => setNewTypeData(data => ({
                      ...data,
                      options: data.options.filter((_, i) => i !== idx)
                    }))}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    disabled={newTypeData.options.length <= 1}
                  >×</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNewTypeData(data => ({
                  ...data,
                  options: [...data.options, '']
                }))}
                className="mt-2 px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-50"
              >+ Tambah Opsi</button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewTypeDialog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >Batal</button>
              <button
                type="button"
                onClick={async () => {
                  // Validasi
                  if (!newTypeData.name.trim()) {
                    toast.error('Judul rating wajib diisi');
                    return;
                  }
                  if (newTypeData.options.some(opt => !opt.trim())) {
                    toast.error('Semua opsi rating wajib diisi');
                    return;
                  }
                  // Simpan ke backend (atau local state jika belum ada backend)
                  const res = await fetch('/api/survey/rating-types', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      nama_rating: newTypeData.name,
                      tipe: 'rating',
                      options: newTypeData.options
                    })
                  });
                  const data = await res.json();
                  if (data.success && data.data?.id) {
                    // Tambahkan ke ratingTypes
                    setRatingTypes(prev => [...prev, {
                      id: data.data.id,
                      tipe: 'rating',
                      nama_rating: newTypeData.name
                    }]);
                    // Set ke dropdown yang sedang aktif
                    if (pendingExtraAnswerIdx !== null) {
                      setExtraAnswers(list =>
                        list.map((item, i) =>
                          i === pendingExtraAnswerIdx
                            ? { ...item, jenis_rating_id: data.data.id }
                            : item
                        )
                      );
                      setPendingExtraAnswerIdx(null);
                    } else {
                      setQuestionData(prev => ({
                        ...prev,
                        jenis_rating_id: data.data.id
                      }));
                    }
                    setShowNewTypeDialog(false);
                    setNewTypeData({ name: '', options: [''] });
                    toast.success('Jenis rating berhasil ditambahkan!');
                  } else {
                    toast.error('Gagal menambah jenis rating');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >Simpan</button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}

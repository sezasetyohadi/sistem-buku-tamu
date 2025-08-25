import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { toast } from "react-hot-toast";

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
      
      // Reset form and close modal
      setQuestionData({
        pertanyaan: '',
        tipe_pertanyaan: 'rating',
        status: true,
        jenis_rating_id: ratingTypes.length > 0 ? ratingTypes[0].id : undefined,
        is_required: true
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Gagal menyimpan pertanyaan');
    } finally {
      setIsSubmitting(false);
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
          
          {/* Add new answer type button */}
          <div className="flex justify-center mt-3">
            <button
              type="button"
              onClick={() => setShowNewTypeDialog(true)}
              className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Jenis Jawaban
            </button>
          </div>

          {/* New Type Dialog */}
          {showNewTypeDialog && (
            <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">Tambah Jenis Jawaban Baru</h3>
                <button
                  type="button"
                  onClick={() => setShowNewTypeDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Jawaban
                  </label>
                  <select
                    value={newTypeData.type}
                    onChange={(e) => setNewTypeData({...newTypeData, type: e.target.value as 'rating' | 'text'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="rating">Rating</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama {newTypeData.type === 'rating' ? 'Rating' : 'Teks'}
                  </label>
                  <input
                    type="text"
                    value={newTypeData.name}
                    onChange={(e) => setNewTypeData({...newTypeData, name: e.target.value})}
                    placeholder={`Masukkan nama ${newTypeData.type === 'rating' ? 'rating' : 'teks'} baru`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {newTypeData.type === 'rating' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Rating
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-gray-300 rounded p-2 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-center">
                          <span className="text-yellow-500">★★★★★</span>
                        </div>
                        <p className="text-xs text-center mt-1">Bintang</p>
                      </div>
                      <div className="border border-gray-300 rounded p-2 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-center">
                          <span className="text-blue-500">1-2-3-4-5</span>
                        </div>
                        <p className="text-xs text-center mt-1">Angka</p>
                      </div>
                      <div className="border border-gray-300 rounded p-2 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-center">
                          <span className="text-green-500">😀😐😔</span>
                        </div>
                        <p className="text-xs text-center mt-1">Emoji</p>
                      </div>
                      <div className="border border-gray-300 rounded p-2 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-center">
                          <span className="text-purple-500">Lainnya</span>
                        </div>
                        <p className="text-xs text-center mt-1">Kustom</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewTypeDialog(false)}
                  className="mr-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Jenis ${newTypeData.type === 'rating' ? 'rating' : 'teks'} baru berhasil ditambahkan (simulasi)`);
                    setShowNewTypeDialog(false);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}
          
          {/* Removed urutan field as it's now automatically assigned */}
          
          {/* Placeholder field removed */}

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
            {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan' : 'Tambah Pertanyaan'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

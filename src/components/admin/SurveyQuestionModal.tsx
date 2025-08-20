import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { toast } from "react-hot-toast";

interface RatingType {
  id: number;
  nama: string;
  deskripsi?: string;
}

interface SurveyQuestion {
  id?: number;
  pertanyaan: string;
  tipe_pertanyaan: 'rating' | 'text';
  urutan: number;
  status: boolean;
  placeholder?: string;
  jenis_rating_id?: number;
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
  const [questionData, setQuestionData] = useState<SurveyQuestion>({
    pertanyaan: '',
    tipe_pertanyaan: 'rating',
    urutan: 0,
    status: true,
    placeholder: '',
    jenis_rating_id: undefined
  });

  // Fetch rating types when modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchRatingTypes();
    }
  }, [isOpen]);

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
        urutan: 0,
        status: true,
        placeholder: '',
        jenis_rating_id: undefined
      });
    }
  }, [initialQuestion, isOpen]);

  // Fetch rating types from API
  const fetchRatingTypes = async () => {
    try {
      setIsLoadingRatingTypes(true);
      const response = await fetch('/api/survey/rating-types');
      
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
        urutan: 0,
        status: true,
        placeholder: '',
        jenis_rating_id: ratingTypes.length > 0 ? ratingTypes[0].id : undefined
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
                Tipe Pertanyaan
              </label>
              <select
                id="tipe_pertanyaan"
                value={questionData.tipe_pertanyaan}
                onChange={(e) => setQuestionData({
                  ...questionData,
                  tipe_pertanyaan: e.target.value as 'rating' | 'text'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating">Rating</option>
                <option value="text">Text</option>
              </select>
            </div>
            
            {/* Show jenis rating dropdown for rating questions, urutan for text questions */}
            <div>
              {questionData.tipe_pertanyaan === 'rating' ? (
                <>
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
                      ratingTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.nama}
                        </option>
                      ))
                    )}
                  </select>
                </>
              ) : (
                <>
                  <label htmlFor="urutan" className="block text-sm font-medium text-gray-700 mb-1">
                    Urutan
                  </label>
                  <input
                    type="number"
                    id="urutan"
                    min="1"
                    value={questionData.urutan || ''}
                    onChange={(e) => setQuestionData({
                      ...questionData,
                      urutan: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Urutan pertanyaan"
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Common urutan field for both types */}
          {questionData.tipe_pertanyaan === 'rating' && (
            <div>
              <label htmlFor="urutan" className="block text-sm font-medium text-gray-700 mb-1">
                Urutan
              </label>
              <input
                type="number"
                id="urutan"
                min="1"
                value={questionData.urutan || ''}
                onChange={(e) => setQuestionData({
                  ...questionData,
                  urutan: parseInt(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Urutan pertanyaan"
              />
            </div>
          )}
          
          {questionData.tipe_pertanyaan === 'text' && (
            <div>
              <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                id="placeholder"
                value={questionData.placeholder || ''}
                onChange={(e) => setQuestionData({
                  ...questionData,
                  placeholder: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Placeholder untuk jawaban (opsional)"
              />
            </div>
          )}

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={questionData.status}
                onChange={(e) => setQuestionData({
                  ...questionData,
                  status: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Aktifkan pertanyaan</span>
            </label>
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

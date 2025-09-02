'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface SurveyResponse {
  id: number;
  nama_lengkap: string;
  email: string;
  nomor_telepon?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  created_at: string;
  tanggal: string;
  waktu: string;
  pendidikan_terakhir?: string;
  nama_profesi?: string;
  jenis_layanan?: string;
  saran?: string;
  responses: { [key: string]: number | string };
}

interface QuestionDetail {
  id: number;
  pertanyaan: string;
  tipe_jawaban: 'rating' | 'teks';
  jenis_rating_id?: number;
  nama_rating?: string;
  multiple_rating_types?: Array<{
    jenis_rating_id: number;
    nama_rating: string;
    urutan: number;
  }>;
  ratingOptions?: Array<{
    rating_type_id: number;
    rating_type_name: string;
    rating_type_urutan: number;
    options: Array<{
      id: number;
      skala_rating: string;
      urutan_rating: number;
    }>;
  }>;
  responseValues?: number[];
}

interface SurveyResponseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: SurveyResponse | null;
}

export default function SurveyResponseDetailModal({ 
  isOpen, 
  onClose, 
  response 
}: SurveyResponseDetailModalProps) {
  const [questionDetails, setQuestionDetails] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && response) {
      fetchQuestionDetails();
    }
  }, [isOpen, response]);

  const fetchQuestionDetails = async () => {
    if (!response) return;
    
    try {
      setLoading(true);
      
      // Get all questions first
      const questionResponse = await fetch(`/api/survey/questions`);
      const questionData = await questionResponse.json();
      
      if (!questionData.success) {
        console.error('Failed to fetch questions:', questionData.message);
        return;
      }

      // Fetch detailed answers from jawaban_survei table
      const detailedAnswersResponse = await fetch(`/api/survey/responses/detail/${response.id}`);
      const detailedAnswersData = await detailedAnswersResponse.json();
      
      if (!detailedAnswersData.success) {
        console.error('Failed to fetch detailed answers:', detailedAnswersData.message);
        return;
      }

      // For each question that has a response, get its details and all rating types
      const questionTexts = Object.keys(response.responses);
      const questionDetailsPromises = questionTexts.map(async (questionText) => {
        // Find the question by matching the text
        const question = questionData.data.find((q: any) => q.pertanyaan === questionText);
        if (!question) return null;

        // Find detailed answers for this question
        const detailedAnswers = detailedAnswersData.data.filter(
          (answer: any) => answer.pertanyaan_id === question.id
        );

        // Get all rating types for this question
        const allRatingOptions = [];
        if (question.multiple_rating_types && question.multiple_rating_types.length > 0) {
          // For each rating type, get its options
          for (const ratingType of question.multiple_rating_types) {
            try {
              const optionsResponse = await fetch(`/api/survey/rating-options/${ratingType.jenis_rating_id}`);
              const optionsData = await optionsResponse.json();
              if (optionsData.success) {
                allRatingOptions.push({
                  rating_type_id: ratingType.jenis_rating_id,
                  rating_type_name: ratingType.nama_rating,
                  rating_type_urutan: ratingType.urutan,
                  options: optionsData.data
                });
              }
            } catch (error) {
              console.error('Error fetching rating options for rating type:', ratingType.jenis_rating_id, error);
            }
          }
        }
        
        // Get response values from detailed answers
        const responseValues = detailedAnswers.map((answer: any) => Number(answer.jawaban));
        
        return {
          id: question.id,
          pertanyaan: question.pertanyaan,
          tipe_jawaban: question.tipe_jawaban,
          jenis_rating_id: question.jenis_rating_id,
          nama_rating: question.nama_rating,
          multiple_rating_types: question.multiple_rating_types,
          ratingOptions: allRatingOptions,
          // Use the response values from jawaban_survei table
          responseValues: responseValues.length > 0 ? responseValues : [Number(response.responses[questionText])]
        };
      });

      const details = await Promise.all(questionDetailsPromises);
      setQuestionDetails(details.filter(d => d !== null) as QuestionDetail[]);
    } catch (error) {
      console.error('Error fetching question details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const calculateAge = (birthDateStr: string) => {
    try {
      const birthDate = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age} tahun`;
    } catch {
      return birthDateStr;
    }
  };

  if (!response) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detail Respon Survei" 
      size="lg"
    >
      <div className="space-y-6">
        {/* Identitas Responden */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Identitas Responden</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <p className="mt-1 text-sm text-gray-900">{response.nama_lengkap}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{response.email}</p>
            </div>
            {response.nomor_telepon && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                <p className="mt-1 text-sm text-gray-900">{response.nomor_telepon}</p>
              </div>
            )}
            {response.jenis_kelamin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <p className="mt-1 text-sm text-gray-900">{response.jenis_kelamin}</p>
              </div>
            )}
            {response.tanggal_lahir && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Umur</label>
                <p className="mt-1 text-sm text-gray-900">{calculateAge(response.tanggal_lahir)}</p>
              </div>
            )}
            {response.alamat && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                <p className="mt-1 text-sm text-gray-900">{response.alamat}</p>
              </div>
            )}
            {response.pendidikan_terakhir && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                <p className="mt-1 text-sm text-gray-900">{response.pendidikan_terakhir}</p>
              </div>
            )}
            {response.nama_profesi && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Profesi</label>
                <p className="mt-1 text-sm text-gray-900">{response.nama_profesi}</p>
              </div>
            )}
            {response.jenis_layanan && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Layanan</label>
                <p className="mt-1 text-sm text-gray-900">{response.jenis_layanan}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Waktu Survei</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(response.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Jawaban Survei */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Jawaban Survei</h3>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Memuat detail jawaban...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(response.responses).map(([question, answer], index) => {
                const questionDetail = questionDetails.find(q => q.pertanyaan === question);

                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    {/* Question Title */}
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{question}</h4>
                      <span className="text-red-500">*</span>
                    </div>

                    {/* Rating Types */}
                    {questionDetail && questionDetail.ratingOptions && questionDetail.ratingOptions.length > 0 ? (
                      <div className="space-y-4">
                        {/* Display only the selected answers in a simplified format */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          {questionDetail.ratingOptions.map((ratingType, ratingIndex) => {
                            // Get the response value for this rating type from jawaban_survei
                            const responseValue = questionDetail.responseValues?.[ratingIndex];
                            
                            // Find the selected option for this rating type
                            const selectedOption = ratingType.options?.find(option => {
                              return responseValue === option.id;
                            });

                            return (
                              <div key={ratingIndex} className="mb-4">
                                {/* Rating Type Name */}
                                <div className="mb-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    {ratingType.rating_type_name}
                                  </label>
                                </div>
                                
                                {/* Selected Rating Display */}
                                <div className="p-3 bg-gray-50 rounded-md">
                                  {selectedOption ? (
                                    <span className="text-sm font-medium text-gray-900">
                                      {selectedOption.skala_rating}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      Tidak ada jawaban
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Text Answer Display */
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-700">
                          <strong>Jawaban:</strong>
                        </div>
                        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md">
                          <p className="text-gray-900">{String(answer)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Saran/Feedback */}
        {response.saran && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saran & Masukan</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-900">{response.saran}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}

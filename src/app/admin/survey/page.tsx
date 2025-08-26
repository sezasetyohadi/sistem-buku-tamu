'use client';

import { useState, useEffect } from "react";
import SurveyQuestionModal from "@/components/admin/SurveyQuestionModal";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import QuestionOrderModal from "@/components/admin/QuestionOrderModal";

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

interface SurveyStatistics {
  totalQuestions: number;
  activeQuestions: number;
  ratingQuestions: number;
  textQuestions: number;
  totalResponses: number;
  averageRating: number;
  completionRate: number;
  statistics: any[];
}

export default function AdminSurvey() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<SurveyQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [statistics, setStatistics] = useState<SurveyStatistics>({
    totalQuestions: 0,
    activeQuestions: 0,
    ratingQuestions: 0,
    textQuestions: 0,
    totalResponses: 0,
    averageRating: 0,
    completionRate: 0,
    statistics: []
  });
  const [newQuestion, setNewQuestion] = useState<SurveyQuestion>({
    pertanyaan: '',
    tipe_pertanyaan: 'rating',
    status: true,
    is_required: true
  });

  // Dummy survey responses
  const dummyResponses = [
    {
      id: 1,
      nama: "Budi Santoso",
      email: "budi.santoso@email.com",
      tanggal: "2025-08-13",
      waktu: "14:30",
      responses: {
        "Bagaimana penilaian Anda terhadap pelayanan yang diberikan oleh petugas?": 5,
        "Bagaimana penilaian Anda terhadap kecepatan pelayanan?": 4,
        "Bagaimana penilaian Anda terhadap kejelasan informasi yang diberikan?": 5,
        "Bagaimana penilaian Anda terhadap fasilitas yang tersedia?": 4,
        "Bagaimana penilaian Anda secara keseluruhan terhadap layanan kami?": 5,
        "Apakah ada saran atau kritik untuk perbaikan layanan kami?": "Pelayanan sudah sangat baik, hanya perlu penambahan kursi di ruang tunggu.",
        "Apakah Anda akan merekomendasikan layanan kami kepada orang lain?": 5
      }
    },
    {
      id: 2,
      nama: "Siti Nurhaliza",
      email: "siti.nurhaliza@email.com",
      tanggal: "2025-08-13",
      waktu: "10:15",
      responses: {
        "Bagaimana penilaian Anda terhadap pelayanan yang diberikan oleh petugas?": 4,
        "Bagaimana penilaian Anda terhadap kecepatan pelayanan?": 3,
        "Bagaimana penilaian Anda terhadap kejelasan informasi yang diberikan?": 4,
        "Bagaimana penilaian Anda terhadap fasilitas yang tersedia?": 4,
        "Bagaimana penilaian Anda secara keseluruhan terhadap layanan kami?": 4,
        "Apakah ada saran atau kritik untuk perbaikan layanan kami?": "Proses pelayanan bisa dipercepat lagi.",
        "Apakah Anda akan merekomendasikan layanan kami kepada orang lain?": 4
      }
    },
    {
      id: 3,
      nama: "Ahmad Wijaya",
      email: "ahmad.wijaya@email.com",
      tanggal: "2025-08-12",
      waktu: "16:45",
      responses: {
        "Bagaimana penilaian Anda terhadap pelayanan yang diberikan oleh petugas?": 5,
        "Bagaimana penilaian Anda terhadap kecepatan pelayanan?": 5,
        "Bagaimana penilaian Anda terhadap kejelasan informasi yang diberikan?": 5,
        "Bagaimana penilaian Anda terhadap fasilitas yang tersedia?": 5,
        "Bagaimana penilaian Anda secara keseluruhan terhadap layanan kami?": 5,
        "Apakah ada saran atau kritik untuk perbaikan layanan kami?": "Pelayanan sangat memuaskan, pertahankan kualitas ini!",
        "Apakah Anda akan merekomendasikan layanan kami kepada orang lain?": 5
      }
    }
  ];

  useEffect(() => {
    fetchSurveyData();
  }, []);

  // Function to fetch all survey data
  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      
      // Fetch questions data
      const questionsResponse = await fetch('/api/survey/questions');
      if (!questionsResponse.ok) {
        throw new Error(`Error fetching questions: ${questionsResponse.statusText}`);
      }
      const questionsData = await questionsResponse.json();
      
      if (questionsData.success && Array.isArray(questionsData.data)) {
        // Map from API format to our component format
        const mappedQuestions: SurveyQuestion[] = questionsData.data.map((q: any) => ({
          id: q.id,
          pertanyaan: q.pertanyaan,
          tipe_pertanyaan: q.tipe_jawaban === 'rating' ? 'rating' : 'text',
          urutan: q.urutan,
          status: q.is_aktif,
          jenis_rating_id: q.jenis_rating_id,
          is_required: q.is_required
        }));
        
        setQuestions(mappedQuestions);
        
        // Calculate statistics from the questions
        const totalQuestions = mappedQuestions.length;
        const activeQuestions = mappedQuestions.filter(q => q.status).length;
        const ratingQuestions = mappedQuestions.filter(q => q.tipe_pertanyaan === 'rating').length;
        const textQuestions = mappedQuestions.filter(q => q.tipe_pertanyaan === 'text').length;
        
        // Update statistics with question counts
        setStatistics(prev => ({
          ...prev,
          totalQuestions,
          activeQuestions,
          ratingQuestions,
          textQuestions
        }));
      }
      
      // Fetch statistics data for response counts and ratings
      const statsResponse = await fetch('/api/survey/statistics');
      if (!statsResponse.ok) {
        throw new Error(`Error fetching statistics: ${statsResponse.statusText}`);
      }
      const statsData = await statsResponse.json();
      
      if (statsData.success && statsData.data) {
        // Merge response statistics with our question counts
        setStatistics(prev => ({
          ...prev,
          totalResponses: statsData.data.totalResponses || 0,
          averageRating: statsData.data.averageRating || 0,
          statistics: statsData.data.statistics || []
        }));
      }
    } catch (error) {
      console.error("Error fetching survey data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (question: SurveyQuestion) => {
    try {
      // Create a request body that matches the API expectations
      const requestBody = {
        pertanyaan: question.pertanyaan,
        tipe_pertanyaan: question.tipe_pertanyaan,
        // Map our tipe_pertanyaan to the API's expected format
        tipe_jawaban: question.tipe_pertanyaan === 'rating' ? 'rating' : 'teks',
        jenis_rating_id: question.tipe_pertanyaan === 'rating' ? question.jenis_rating_id : undefined,
        is_required: question.is_required
      };
      
      const response = await fetch('/api/survey/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Error adding question: ${response.statusText}`);
      }
      
      // Refresh the data after successful addition
      await fetchSurveyData();
      
      // Reset the form
      setNewQuestion({
        pertanyaan: '',
        tipe_pertanyaan: 'rating',
        status: true,
        is_required: true
      });
      
      setShowAddQuestion(false);
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Gagal menambahkan pertanyaan. Silakan coba lagi.');
    }
  };

  const handleEditQuestion = async (question: SurveyQuestion | null) => {
    if (!question || !question.id) {
      console.error('Cannot edit question without ID');
      return;
    }
    
    try {
      // Create a request body that matches the API expectations
      const requestBody = {
        id: question.id,
        urutan: question.urutan || 1,
        baris: question.baris || 1,
        pertanyaan: question.pertanyaan,
        tipe_pertanyaan: question.tipe_pertanyaan === 'rating' ? 'rating' : 'teks',
        is_aktif: question.status,
        jenis_rating_id: question.tipe_pertanyaan === 'rating' ? question.jenis_rating_id : undefined,
        is_required: question.is_required
      };
      
      const response = await fetch(`/api/survey/questions/${question.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating question: ${response.statusText}`);
      }
      
      // Refresh the data after successful update
      await fetchSurveyData();
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Gagal memperbarui pertanyaan. Silakan coba lagi.');
    }
  };

  const openDeleteConfirmation = async (question: SurveyQuestion) => {
    // If we have the full question details, use it
    if (question.pertanyaan) {
      setQuestionToDelete(question);
      setDeleteConfirmationOpen(true);
      return;
    }
    
    // Otherwise fetch the question details first
    try {
      const response = await fetch(`/api/survey/questions/${question.id}`);
      if (!response.ok) {
        throw new Error(`Error fetching question: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        // Map from API format to our component format
        const fullQuestion: SurveyQuestion = {
          id: data.data.id,
          pertanyaan: data.data.pertanyaan,
          tipe_pertanyaan: data.data.tipe_jawaban === 'rating' ? 'rating' : 'text',
          urutan: data.data.urutan,
          status: data.data.is_aktif,
          jenis_rating_id: data.data.jenis_rating_id,
          is_required: data.data.is_required
        };
        
        setQuestionToDelete(fullQuestion);
      } else {
        // Fallback if we can't get the details
        setQuestionToDelete(question);
      }
    } catch (error) {
      console.error("Error fetching question details:", error);
      // Fallback to using the question we have
      setQuestionToDelete(question);
    } finally {
      setDeleteConfirmationOpen(true);
    }
  };

  const handleDeleteQuestion = async () => {
    const id = questionToDelete?.id;
    if (!id) {
      console.error('Cannot delete question without ID');
      return;
    }
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/survey/questions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting question: ${response.statusText}`);
      }
      
      // Close modal
      setDeleteConfirmationOpen(false);
      setQuestionToDelete(null);
      
      // Refresh the data after successful deletion
      await fetchSurveyData();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Gagal menghapus pertanyaan. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleQuestionStatus = async (question: SurveyQuestion) => {
    try {
      const updatedQuestion = { ...question, status: !question.status };
      await handleEditQuestion(updatedQuestion);
    } catch (error) {
      console.error('Error toggling question status:', error);
    }
  };
  
  const handleSaveQuestionOrder = async (reorderedQuestions: any[]) => {
    try {
      setIsReordering(true);
      
      // Create a batch of update promises
      const updatePromises = reorderedQuestions.map(question => {
        if (!question.id) return Promise.resolve();
        
        // For order updates, only send the minimum required data to preserve existing status
        // Find the original question to get its current status
        const originalQuestion = questions.find(q => q.id === question.id);
        
        const requestBody = {
          id: question.id,
          urutan: question.urutan,
          baris: question.baris || 1,
          pertanyaan: question.pertanyaan,
          tipe_pertanyaan: (question.tipe_pertanyaan === 'rating' || question.tipe_jawaban === 'rating') ? 'rating' : 'teks',
          // Preserve the original status from the database
          status: originalQuestion?.status !== undefined ? originalQuestion.status : true,
          jenis_rating_id: question.jenis_rating_id,
          is_required: question.is_required !== undefined ? question.is_required : true
        };
        
        return fetch(`/api/survey/questions/${question.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      });
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      // Refresh data
      await fetchSurveyData();
    } catch (error) {
      console.error('Error saving question order:', error);
      alert('Gagal menyimpan urutan pertanyaan. Silakan coba lagi.');
    } finally {
      setIsReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Memuat data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 admin-survey">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Survey Management</h1>
              <p className="text-gray-600 mt-1">Kelola pertanyaan untuk survey tamu</p>
            </div>
            <button
              onClick={() => setShowAddQuestion(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Tambah Pertanyaan
            </button>
          </div>

          {/* Survey Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Responden</p>
                  <p className="text-2xl font-bold">{statistics.totalResponses}</p>
                </div>
                <div className="bg-blue-400 rounded-full p-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Rata-rata Rating</p>
                  <p className="text-2xl font-bold">{statistics.averageRating.toFixed(1)}</p>
                </div>
                <div className="bg-green-400 rounded-full p-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Tingkat Penyelesaian</p>
                  <p className="text-2xl font-bold">{statistics.completionRate || 0}%</p>
                </div>
                <div className="bg-purple-400 rounded-full p-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pertanyaan Aktif</p>
                  <p className="text-2xl font-bold">{statistics.activeQuestions}/{statistics.totalQuestions}</p>
                </div>
                <div className="bg-orange-400 rounded-full p-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v8h8V6H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kelola Pertanyaan
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'responses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lihat Respon Survey ({dummyResponses.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'questions' ? (
            <>
              {/* Information about respondent identity */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Informasi Identitas Responden
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        • Bagian <strong>Identitas Responden</strong> pada form survey diisi otomatis dari data registrasi tamu
                      </p>
                      <p className="mt-1">
                        • Data identitas tidak dapat diedit oleh admin dan bersifat <strong>read-only</strong>
                      </p>
                      <p className="mt-1">
                        • Hanya pertanyaan survey di bawah ini yang dapat dikelola oleh admin
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question management buttons */}
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setOrderModalOpen(true)}
                  className="flex items-center bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                  Edit Urutan
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {Array.isArray(questions) && questions.length > 0 ? (
                  questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-medium text-gray-900">
                            {question.urutan}. {question.pertanyaan}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            question.tipe_pertanyaan === 'rating' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {question.tipe_pertanyaan === 'rating' ? 'Rating' : 'Text'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            question.status ? 'bg-green-400' : 'bg-red-400'
                          }`}></span>
                          <span className="text-sm text-gray-600">
                            {question.status ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleQuestionStatus(question)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            question.status 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {question.status ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => setEditingQuestion(question)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteConfirmation(question)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-3">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Belum ada pertanyaan survey</p>
                    <p className="text-sm text-gray-400 mt-1">Klik "Tambah Pertanyaan" untuk memulai</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Survey Responses Tab */
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Statistik Respon</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{statistics.totalResponses}</p>
                    <p className="text-sm text-gray-600">Total Responden</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{statistics.averageRating.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Rata-rata Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {statistics.completionRate}%
                    </p>
                    <p className="text-sm text-gray-600">Tingkat Penyelesaian</p>
                  </div>
                </div>
              </div>

              {/* Response List */}
              {dummyResponses.map((response, index) => (
                <div key={response.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{response.nama}</h3>
                      <p className="text-sm text-gray-600">{response.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{response.tanggal}</p>
                      <p className="text-sm text-gray-500">{response.waktu}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(response.responses).map(([question, answer]) => (
                      <div key={question} className="border-l-2 border-gray-200 pl-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">{question}</p>
                        {typeof answer === 'number' ? (
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= answer ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-600">({answer}/5)</span>
                          </div>
                        ) : (
                          <p className="text-gray-600 bg-gray-50 rounded-md p-3">{answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Question Modals */}
          <SurveyQuestionModal 
            isOpen={showAddQuestion} 
            onClose={() => setShowAddQuestion(false)}
            onAddQuestion={handleAddQuestion}
            initialQuestion={newQuestion}
          />
          
          <SurveyQuestionModal 
            isOpen={Boolean(editingQuestion)} 
            onClose={() => setEditingQuestion(null)}
            onAddQuestion={handleEditQuestion}
            initialQuestion={editingQuestion || undefined}
            isEditMode={true}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={deleteConfirmationOpen}
            onClose={() => setDeleteConfirmationOpen(false)}
            onConfirm={handleDeleteQuestion}
            title="Konfirmasi Hapus Data"
            message="Apakah Anda yakin ingin menghapus pertanyaan ini dari daftar?"
            itemName={questionToDelete?.pertanyaan || "pertanyaan ini"}
            confirmButtonText="Ya, Hapus Data"
            cancelButtonText="Batal"
            isLoading={isDeleting}
          />
          
          {/* Question Order Modal */}
          <QuestionOrderModal
            isOpen={orderModalOpen}
            onClose={() => setOrderModalOpen(false)}
            onSaveOrder={handleSaveQuestionOrder}
            questions={questions}
            isLoading={isReordering}
          />
        </div>
      </div>
    </div>
  );
}

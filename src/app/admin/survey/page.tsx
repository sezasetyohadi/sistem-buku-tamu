'use client';

import { useState, useEffect } from "react";
import SurveyQuestionModal from "@/components/admin/SurveyQuestionModal";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import QuestionOrderModal from "@/components/admin/QuestionOrderModal";
import SurveyResponseCard from "@/components/admin/SurveyResponseCard";
import SurveyResponseDetailModal from "@/components/admin/SurveyResponseDetailModal";
import ExportToExcelButton from "@/components/admin/ExportToExcelButton";

interface SurveyQuestion {
  id?: number;
  pertanyaan: string;
  tipe_pertanyaan: 'rating';
  status: boolean;
  jenis_rating_id?: number;
  is_required?: boolean;
  urutan?: number;
  baris?: number;
  multiple_rating_types?: { jenis_rating_id: number; is_required?: boolean }[];
}

interface SurveyStatistics {
  totalQuestions: number;
  activeQuestions: number;
  totalResponses: number;
  averageRating: number;
  completionRate: number;
  statistics: any[];
}

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

export default function AdminSurvey() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<SurveyQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [statistics, setStatistics] = useState<SurveyStatistics>({
    totalQuestions: 0,
    activeQuestions: 0,
    totalResponses: 0,
    averageRating: 0,
    completionRate: 0,
    statistics: []
  });
  const [newQuestion, setNewQuestion] = useState<SurveyQuestion>({
    pertanyaan: '',
    tipe_pertanyaan: 'rating',
    status: true,
    is_required: true,
    jenis_rating_id: 1 // Default rating type
  });

  // Real survey responses from database
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    fetchSurveyData();
    fetchResponseCount(); // Fetch response count on initial load
  }, []);

  useEffect(() => {
    if (activeTab === 'responses') {
      fetchSurveyResponses();
    }
  }, [activeTab]);

  // Function to fetch survey response count only
  const fetchResponseCount = async () => {
    try {
      const response = await fetch('/api/survey/responses');
      if (!response.ok) {
        throw new Error(`Error fetching responses: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setResponseCount(data.data.length);
      } else {
        setResponseCount(0);
      }
    } catch (error) {
      console.error('Error fetching response count:', error);
      setResponseCount(0);
    }
  };

  // Function to fetch survey responses from database
  const fetchSurveyResponses = async () => {
    try {
      setResponsesLoading(true);
      const response = await fetch('/api/survey/responses');
      
      if (!response.ok) {
        throw new Error(`Error fetching responses: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setSurveyResponses(data.data);
        setResponseCount(data.data.length); // Update count when full responses are loaded
      } else {
        console.error('Invalid response format:', data);
        setSurveyResponses([]);
        setResponseCount(0);
      }
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      setSurveyResponses([]);
      setResponseCount(0);
    } finally {
      setResponsesLoading(false);
    }
  };

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
          tipe_pertanyaan: 'rating',
          urutan: q.urutan,
          status: q.is_aktif,
          jenis_rating_id: q.jenis_rating_id,
          is_required: q.is_required
        }));
        
        setQuestions(mappedQuestions);
        
        // Calculate statistics from the questions
        const totalQuestions = mappedQuestions.length;
        const activeQuestions = mappedQuestions.filter(q => q.status).length;
        
        // Update statistics with question counts
        setStatistics(prev => ({
          ...prev,
          totalQuestions,
          activeQuestions
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
        // Since all questions are rating type
        tipe_jawaban: 'rating',
        jenis_rating_id: question.jenis_rating_id,
        is_required: question.is_required,
        multiple_rating_types: question.multiple_rating_types // Add support for multiple rating types
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
        is_required: true,
        jenis_rating_id: 1 // Default rating type
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
      // Find the original question to preserve its baris value
      const originalQuestion = questions.find(q => q.id === question.id);
      
      // Create a request body that matches the API expectations
      const requestBody = {
        id: question.id,
        urutan: originalQuestion?.urutan || question.urutan || 1,
        baris: originalQuestion?.baris || question.baris || 1, // Preserve original baris
        pertanyaan: question.pertanyaan,
        tipe_pertanyaan: 'rating',
        is_aktif: question.status,
        jenis_rating_id: question.jenis_rating_id,
        is_required: question.is_required,
        multiple_rating_types: question.multiple_rating_types // Add support for multiple rating types
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
          tipe_pertanyaan: 'rating',
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

  // Fungsi untuk toggle status aktif/nonaktif
  const toggleQuestionStatus = async (question: SurveyQuestion) => {
    try {
      // Kirim request ke API untuk update status (pakai angka 1/0)
      await fetch(`/api/survey/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...question,
          is_aktif: question.status ? 0 : 1, // <-- ubah ke angka
        }),
      });

      // Update state lokal agar UI langsung berubah
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id ? { ...q, status: !q.status } : q
        )
      );
    } catch (error) {
      alert('Gagal mengubah status pertanyaan');
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
          tipe_pertanyaan: 'rating',
          // Preserve the original status from the database - use is_aktif field
          is_aktif: originalQuestion?.status !== undefined ? originalQuestion.status : true,
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
            <div className="flex space-x-3">
              <ExportToExcelButton 
                url="/api/survey/export" 
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                buttonText="Ekspor Excel"
              />
              <button
                onClick={() => setShowAddQuestion(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Tambah Pertanyaan
              </button>
            </div>
          </div>

          {/* Survey Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Responden</p>
                  <p className="text-2xl font-bold">{responseCount}</p>
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
                onClick={() => {
                  setActiveTab('responses');
                  fetchSurveyResponses();
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'responses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lihat Respon Survei ({responseCount})
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
                            {question.pertanyaan}
                          </h3>

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
              {responsesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Memuat respon survei...</div>
                  </div>
                </div>
              ) : (
                <>
                  {surveyResponses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-3">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Belum ada respon survei</p>
                      <p className="text-sm text-gray-400 mt-1">Respon akan muncul setelah tamu mengisi survei</p>
                    </div>
                  ) : (
                    /* Response Cards */
                    <div className="space-y-4">
                      {surveyResponses.map((response) => (
                        <SurveyResponseCard
                          key={response.id}
                          response={response}
                          onClick={() => {
                            setSelectedResponse(response);
                            setIsDetailModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
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
          
          {/* Survey Response Detail Modal */}
          {selectedResponse && (
            <SurveyResponseDetailModal
              isOpen={isDetailModalOpen}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedResponse(null);
              }}
              response={selectedResponse}
            />
          )}
        </div>
      </div>
    </div>
  );
}

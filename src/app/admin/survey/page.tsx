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
  tipe_pertanyaan: 'rating' | 'text';
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
  ratingQuestions: number;
  textQuestions: number;
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
  kinerja_ratings?: { [key: string]: number };
  kepentingan_ratings?: { [key: string]: number };
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

  // Real survey responses from database
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<any[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responseCount, setResponseCount] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [surveyDateFilter, setSurveyDateFilter] = useState('');
  const [kinerjaRatingFilter, setKinerjaRatingFilter] = useState('');
  const [kepentinganRatingFilter, setKepentinganRatingFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSurveyData();
    fetchResponseCount(); // Fetch response count on initial load
  }, []);

  useEffect(() => {
    if (activeTab === 'responses') {
      fetchSurveyResponses();
    }
  }, [activeTab]);

  // Filter responses whenever search criteria change
  useEffect(() => {
    filterResponses();
  }, [surveyResponses, searchTerm, emailFilter, genderFilter, educationFilter, serviceFilter, surveyDateFilter, kinerjaRatingFilter, kepentinganRatingFilter]);

  // Function to filter responses based on search criteria
  const filterResponses = () => {
    let filtered = [...surveyResponses];

    // Search by name
    if (searchTerm.trim()) {
      filtered = filtered.filter(response =>
        response.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by email
    if (emailFilter.trim()) {
      filtered = filtered.filter(response =>
        response.email?.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    // Filter by gender
    if (genderFilter) {
      filtered = filtered.filter(response =>
        response.jenis_kelamin === genderFilter
      );
    }

    // Filter by education
    if (educationFilter) {
      filtered = filtered.filter(response =>
        response.pendidikan_terakhir === educationFilter
      );
    }

    // Filter by service type
    if (serviceFilter) {
      filtered = filtered.filter(response =>
        response.jenis_layanan === serviceFilter
      );
    }

    // Filter by survey date
    if (surveyDateFilter) {
      filtered = filtered.filter(response => {
        const responseDate = new Date(response.created_at);
        const filterDate = new Date(surveyDateFilter);
        // Compare dates only (ignore time)
        return responseDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by Kinerja rating
    if (kinerjaRatingFilter) {
      console.log('Filtering by Kinerja rating:', kinerjaRatingFilter);
      filtered = filtered.filter(response => {
        const kinerjaRatings = response.kinerja_ratings || {};
        console.log(`Response ${response.id} (${response.nama_lengkap}) - Kinerja ratings:`, JSON.stringify(kinerjaRatings));
        console.log(`Response ${response.id} - Kinerja rating values:`, Object.values(kinerjaRatings));
        const hasMatch = Object.values(kinerjaRatings).some(rating => 
          rating.toString() === kinerjaRatingFilter
        );
        console.log(`Response ${response.id} - Kinerja match:`, hasMatch);
        return hasMatch;
      });
    }

    // Filter by Kepentingan rating
    if (kepentinganRatingFilter) {
      console.log('Filtering by Kepentingan rating:', kepentinganRatingFilter);
      filtered = filtered.filter(response => {
        const kepentinganRatings = response.kepentingan_ratings || {};
        console.log(`Response ${response.id} (${response.nama_lengkap}) - Kepentingan ratings:`, JSON.stringify(kepentinganRatings));
        console.log(`Response ${response.id} - Kepentingan rating values:`, Object.values(kepentinganRatings));
        const hasMatch = Object.values(kepentinganRatings).some(rating => 
          rating.toString() === kepentinganRatingFilter
        );
        console.log(`Response ${response.id} - Kepentingan match:`, hasMatch);
        return hasMatch;
      });
    }

    setFilteredResponses(filtered);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setEmailFilter('');
    setGenderFilter('');
    setEducationFilter('');
    setServiceFilter('');
    setSurveyDateFilter('');
    setKinerjaRatingFilter('');
    setKepentinganRatingFilter('');
  };

  // Export filtered results to CSV
  const exportToCSV = () => {
    if (filteredResponses.length === 0) {
      alert('Tidak ada data yang dapat diekspor');
      return;
    }

    const headers = [
      'Nama Lengkap',
      'Email', 
      'Jenis Kelamin',
      'Tanggal Lahir',
      'Alamat',
      'Pendidikan Terakhir',
      'Pekerjaan',
      'Jenis Layanan',
      'Tanggal Survey',
      'Saran'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredResponses.map(response => [
        `"${response.nama_lengkap || ''}"`,
        `"${response.email || ''}"`,
        `"${response.jenis_kelamin || ''}"`,
        `"${response.tanggal_lahir || ''}"`,
        `"${response.alamat || ''}"`,
        `"${response.pendidikan_terakhir || ''}"`,
        `"${response.nama_profesi || ''}"`,
        `"${response.jenis_layanan || ''}"`,
        `"${new Date(response.created_at).toLocaleDateString('id-ID')}"`,
        `"${response.saran || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `survey-responses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        console.log('Survey responses received:', data.data.length);
        if (data.data.length > 0) {
          console.log('First response structure:', JSON.stringify(data.data[0], null, 2));
        }
        setSurveyResponses(data.data);
        setFilteredResponses(data.data); // Initialize filtered responses
        setResponseCount(data.data.length); // Update count when full responses are loaded
      } else {
        console.error('Invalid response format:', data);
        setSurveyResponses([]);
        setFilteredResponses([]);
        setResponseCount(0);
      }
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      setSurveyResponses([]);
      setFilteredResponses([]);
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
      // Find the original question to preserve its baris value
      const originalQuestion = questions.find(q => q.id === question.id);
      
      // Create a request body that matches the API expectations
      const requestBody = {
        id: question.id,
        urutan: originalQuestion?.urutan || question.urutan || 1,
        baris: originalQuestion?.baris || question.baris || 1, // Preserve original baris
        pertanyaan: question.pertanyaan,
        tipe_pertanyaan: question.tipe_pertanyaan === 'rating' ? 'rating' : 'teks',
        is_aktif: question.status,
        jenis_rating_id: question.tipe_pertanyaan === 'rating' ? question.jenis_rating_id : undefined,
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
          tipe_pertanyaan: (question.tipe_pertanyaan === 'rating' || question.tipe_jawaban === 'rating') ? 'rating' : 'teks',
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                Lihat Respon Survei ({filteredResponses?.length || responseCount})
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
              {responsesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Memuat respon survei...</div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Filter Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Filter Respon Survei</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Menampilkan {filteredResponses.length} dari {surveyResponses.length} respon
                        </span>
                        <button
                          onClick={exportToCSV}
                          disabled={filteredResponses.length === 0}
                          className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                          Export CSV
                        </button>
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <svg className={`w-4 h-4 mr-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                          {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                        </button>
                      </div>
                    </div>

                    {/* Quick Search */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari Nama</label>
                        <input
                          type="text"
                          placeholder="Ketik nama untuk mencari..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari Email</label>
                        <input
                          type="text"
                          placeholder="Ketik email untuk mencari..."
                          value={emailFilter}
                          onChange={(e) => setEmailFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                            <select
                              value={genderFilter}
                              onChange={(e) => setGenderFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Semua</option>
                              <option value="Laki-laki">Laki-laki</option>
                              <option value="Perempuan">Perempuan</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan</label>
                            <select
                              value={educationFilter}
                              onChange={(e) => setEducationFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Semua</option>
                              {[...new Set(surveyResponses.map(r => r.pendidikan_terakhir).filter(Boolean))].map(education => (
                                <option key={education} value={education}>{education}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
                            <select
                              value={serviceFilter}
                              onChange={(e) => setServiceFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Semua</option>
                              {[...new Set(surveyResponses.map(r => r.jenis_layanan).filter(Boolean))].map(service => (
                                <option key={service} value={service}>{service}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Survey</label>
                            <input
                              type="date"
                              value={surveyDateFilter}
                              onChange={(e) => setSurveyDateFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rating Kinerja
                              <span className="text-xs text-gray-500 block">Filter berdasarkan rating kinerja/pelayanan</span>
                            </label>
                            <select
                              value={kinerjaRatingFilter}
                              onChange={(e) => setKinerjaRatingFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Semua Rating</option>
                              <option value="1">1 - Tidak Sesuai</option>
                              <option value="2">2 - Kurang Sesuai</option>
                              <option value="3">3 - Sesuai</option>
                              <option value="4">4 - Sangat Sesuai</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rating Kepentingan
                              <span className="text-xs text-gray-500 block">Filter berdasarkan tingkat kepentingan</span>
                            </label>
                            <select
                              value={kepentinganRatingFilter}
                              onChange={(e) => setKepentinganRatingFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Semua Rating</option>
                              <option value="1">1 - Tidak Penting</option>
                              <option value="2">2 - Kurang Penting</option>
                              <option value="3">3 - Penting</option>
                              <option value="4">4 - Sangat Penting</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aksi</label>
                            <button
                              onClick={clearAllFilters}
                              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              Reset Semua Filter
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

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
                  ) : filteredResponses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-3">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Tidak ada respon yang sesuai dengan filter</p>
                      <p className="text-sm text-gray-400 mt-1">Coba ubah kriteria pencarian atau reset filter</p>
                    </div>
                  ) : (
                    /* Response Cards */
                    <div className="space-y-4">
                      {filteredResponses.map((response) => (
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

'use client';

import { useState, useEffect } from "react";
import SurveyQuestionModal from "@/components/admin/SurveyQuestionModal";
import QuestionOrderModal from "@/components/admin/QuestionOrderModal";
import SurveyResponseDetailModal from "@/components/admin/SurveyResponseDetailModal";
import ExportToExcelButton from "@/components/admin/ExportToExcelButton";
import SurveyStatistics from "@/components/admin/SurveyStatistics";
import SurveyTabs from "@/components/admin/SurveyTabs";
import SurveyQuestionsList from "@/components/admin/SurveyQuestionsList";
import SurveyResponsesList from "@/components/admin/SurveyResponsesList";
import SurveyFilters from "@/components/admin/SurveyFilters";
import { showToast } from "@/lib/toast";
import { surveyLogger } from "@/lib/logger";

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
    is_required?: boolean | number; 
    nama_rating?: string;
    urutan?: number;
  }[];
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
  kinerja_ratings?: { [key: string]: number };
  kepentingan_ratings?: { [key: string]: number };
}

export default function AdminSurvey() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
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

  // Survey responses from database
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
    fetchResponseCount();
  }, []);

  useEffect(() => {
    if (activeTab === 'responses') {
      fetchSurveyResponses();
    }
  }, [activeTab]);

  useEffect(() => {
    filterResponses();
  }, [surveyResponses, searchTerm, emailFilter, genderFilter, educationFilter, serviceFilter, surveyDateFilter, kinerjaRatingFilter, kepentinganRatingFilter]);

  // Component Logic Functions
  const filterResponses = () => {
    let filtered = [...surveyResponses];

    if (searchTerm.trim()) {
      filtered = filtered.filter(response =>
        response.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (emailFilter.trim()) {
      filtered = filtered.filter(response =>
        response.email?.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    if (genderFilter) {
      filtered = filtered.filter(response =>
        response.jenis_kelamin === genderFilter
      );
    }

    if (educationFilter) {
      filtered = filtered.filter(response =>
        response.pendidikan_terakhir === educationFilter
      );
    }

    if (serviceFilter) {
      filtered = filtered.filter(response =>
        response.jenis_layanan === serviceFilter
      );
    }

    if (surveyDateFilter) {
      filtered = filtered.filter(response => {
        const responseDate = new Date(response.created_at);
        const filterDate = new Date(surveyDateFilter);
        return responseDate.toDateString() === filterDate.toDateString();
      });
    }

    if (kinerjaRatingFilter) {
      filtered = filtered.filter(response => {
        const kinerjaRatings = response.kinerja_ratings || {};
        return Object.values(kinerjaRatings).some((rating: any) => 
          rating.toString() === kinerjaRatingFilter
        );
      });
    }

    if (kepentinganRatingFilter) {
      filtered = filtered.filter(response => {
        const kepentinganRatings = response.kepentingan_ratings || {};
        return Object.values(kepentinganRatings).some((rating: any) => 
          rating.toString() === kepentinganRatingFilter
        );
      });
    }

    setFilteredResponses(filtered);
  };

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

  // API Functions
  const fetchResponseCount = async () => {
    try {
      // Use the existing responses endpoint to get count
      const response = await fetch('/api/survey/responses');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResponseCount(data.data.length);
        }
      }
    } catch (error) {
      surveyLogger.error('Error fetching response count:', error);
    }
  };

  const fetchSurveyResponses = async () => {
    try {
      setResponsesLoading(true);
      const response = await fetch('/api/survey/responses');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSurveyResponses(data.data);
          setFilteredResponses(data.data);
          setResponseCount(data.data.length);
        }
      }
    } catch (error) {
      surveyLogger.error('Error fetching survey responses:', error);
    } finally {
      setResponsesLoading(false);
    }
  };

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/survey/questions');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Normalize the backend response to match frontend interface
          const normalizedQuestions = data.data.map((q: any) => ({
            ...q,
            status: Boolean(q.is_aktif !== undefined ? q.is_aktif : q.status), // Ensure boolean and map is_aktif to status
            tipe_pertanyaan: q.tipe_jawaban || q.tipe_pertanyaan || 'rating' // Handle different field names
          }));
          
          setQuestions(normalizedQuestions);

          const totalQuestions = normalizedQuestions.length;
          const activeQuestions = normalizedQuestions.filter((q: any) => q.status).length;

          setStatistics(prev => ({
            ...prev,
            totalQuestions,
            activeQuestions
          }));
        }
      }

      const statsResponse = await fetch('/api/survey/statistics');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStatistics(prev => ({
            ...prev,
            totalResponses: statsData.data.totalResponses || 0,
            averageRating: statsData.data.averageRating || 0,
            completionRate: statsData.data.completionRate || 0,
            statistics: statsData.data.statistics || []
          }));
        }
      }
    } catch (error) {
      surveyLogger.error('Error fetching survey data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Question Management Functions
  const handleAddQuestion = async (question: SurveyQuestion | null) => {
    if (!question) return;

    try {
      const requestData = {
        pertanyaan: question.pertanyaan,
        tipe_pertanyaan: 'rating',
        is_aktif: question.status,
        jenis_rating_id: question.jenis_rating_id,
        is_required: Boolean(question.is_required), // Ensure boolean
        multiple_rating_types: question.multiple_rating_types
      };

      console.log('Adding question with is_required:', requestData.is_required, typeof requestData.is_required);

      const response = await fetch('/api/survey/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Error adding question: ${response.statusText}`);
      }

      await fetchSurveyData();
      setShowAddQuestion(false);
    } catch (error) {
      surveyLogger.error('Error adding question:', error);
      showToast.error('Gagal menambahkan pertanyaan. Silakan coba lagi.');
    }
  };

  const handleEditQuestion = async (question: SurveyQuestion | null) => {
    if (!question || !question.id) return;

    try {
      const originalQuestion = questions.find(q => q.id === question.id);
      
      const requestBody = {
        id: question.id,
        urutan: originalQuestion?.urutan || question.urutan || 1,
        baris: originalQuestion?.baris || question.baris || 1,
        pertanyaan: question.pertanyaan,
        tipe_pertanyaan: 'rating',
        is_aktif: question.status,
        jenis_rating_id: question.jenis_rating_id,
        is_required: Boolean(question.is_required), // Ensure boolean
        multiple_rating_types: question.multiple_rating_types
      };

      console.log('Updating question with is_required:', requestBody.is_required, typeof requestBody.is_required);

      const response = await fetch(`/api/survey/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error updating question: ${response.statusText}`);
      }

      await fetchSurveyData();
      setEditingQuestion(null);
    } catch (error) {
      surveyLogger.error('Error updating question:', error);
      showToast.error('Gagal memperbarui pertanyaan. Silakan coba lagi.');
    }
  };

  const openDeleteConfirmation = async (question: SurveyQuestion) => {
    if (question.pertanyaan) {
      setQuestionToDelete(question);
      setDeleteConfirmationOpen(true);
      return;
    }

    try {
      const response = await fetch(`/api/survey/questions/${question.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
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
          setQuestionToDelete(question);
        }
      }
    } catch (error) {
      surveyLogger.error("Error fetching question details:", error);
      setQuestionToDelete(question);
    } finally {
      setDeleteConfirmationOpen(true);
    }
  };

  const handleDeleteQuestion = async () => {
    const id = questionToDelete?.id;
    if (!id) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/survey/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error deleting question: ${response.statusText}`);
      }

      setDeleteConfirmationOpen(false);
      setQuestionToDelete(null);
      await fetchSurveyData();
    } catch (error) {
      surveyLogger.error('Error deleting question:', error);
      showToast.error('Gagal menghapus pertanyaan. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleQuestionStatus = async (question: SurveyQuestion) => {
    try {
      await fetch(`/api/survey/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...question,
          is_aktif: question.status ? 0 : 1,
        }),
      });

      // Update the questions state with new status
      setQuestions((prev) => {
        const updatedQuestions = prev.map((q) =>
          q.id === question.id ? { ...q, status: !q.status } : q
        );
        
        // Immediately update statistics based on new question state
        const totalQuestions = updatedQuestions.length;
        const activeQuestions = updatedQuestions.filter(q => q.status).length;
        
        setStatistics(prev => ({
          ...prev,
          totalQuestions,
          activeQuestions
        }));
        
        return updatedQuestions;
      });
      
      showToast.success('Status pertanyaan berhasil diubah');
    } catch (error) {
      showToast.error('Gagal mengubah status pertanyaan');
    }
  };

  const handleSaveQuestionOrder = async (reorderedQuestions: any[]) => {
    try {
      setIsReordering(true);

      const updatePromises = reorderedQuestions.map(question => {
        if (!question.id) return Promise.resolve();

        // Only send the id and baris field to update order
        const requestBody = {
          id: question.id,
          baris: question.baris || 1,
          // Do NOT include any other fields to prevent overwriting existing values
        };

        return fetch(`/api/survey/questions/${question.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
      });

      await Promise.all(updatePromises);
      await fetchSurveyData();
    } catch (error) {
      surveyLogger.error('Error saving question order:', error);
      showToast.error('Gagal menyimpan urutan pertanyaan. Silakan coba lagi.');
    } finally {
      setIsReordering(false);
    }
  };

  // Event Handlers
  const handleTabChange = (tab: 'questions' | 'responses') => {
    setActiveTab(tab);
    if (tab === 'responses') {
      fetchSurveyResponses();
    }
  };

  const handleViewResponseDetails = (response: SurveyResponse) => {
    setSelectedResponse(response);
    setIsDetailModalOpen(true);
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
          {/* Header */}
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

          {/* Statistics */}
          <SurveyStatistics 
            statistics={statistics} 
            responseCount={responseCount} 
          />

          {/* Tabs */}
          <SurveyTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            responseCount={responseCount}
            filteredResponsesLength={filteredResponses?.length || 0}
          />

          {/* Tab Content */}
          {activeTab === 'questions' ? (
            <SurveyQuestionsList
              questions={questions}
              loading={loading}
              deleteConfirmationOpen={deleteConfirmationOpen}
              questionToDelete={questionToDelete}
              isDeleting={isDeleting}
              onToggleQuestionStatus={toggleQuestionStatus}
              onEditQuestion={setEditingQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onOpenDeleteConfirmation={openDeleteConfirmation}
              onCloseDeleteConfirmation={() => setDeleteConfirmationOpen(false)}
              onOpenOrderModal={() => setOrderModalOpen(true)}
            />
          ) : (
            <>
              <SurveyFilters
                searchTerm={searchTerm}
                emailFilter={emailFilter}
                genderFilter={genderFilter}
                educationFilter={educationFilter}
                serviceFilter={serviceFilter}
                surveyDateFilter={surveyDateFilter}
                kinerjaRatingFilter={kinerjaRatingFilter}
                kepentinganRatingFilter={kepentinganRatingFilter}
                showFilters={showFilters}
                onSearchTermChange={setSearchTerm}
                onEmailFilterChange={setEmailFilter}
                onGenderFilterChange={setGenderFilter}
                onEducationFilterChange={setEducationFilter}
                onServiceFilterChange={setServiceFilter}
                onSurveyDateFilterChange={setSurveyDateFilter}
                onKinerjaRatingFilterChange={setKinerjaRatingFilter}
                onKepentinganRatingFilterChange={setKepentinganRatingFilter}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onClearAllFilters={clearAllFilters}
              />
              <SurveyResponsesList
                responses={filteredResponses}
                loading={responsesLoading}
                onViewDetails={handleViewResponseDetails}
              />
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <SurveyQuestionModal
        isOpen={showAddQuestion}
        onClose={() => setShowAddQuestion(false)}
        onAddQuestion={handleAddQuestion}
        initialQuestion={undefined}
        isEditMode={false}
      />

      <SurveyQuestionModal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onAddQuestion={handleEditQuestion}
        initialQuestion={editingQuestion || undefined}
        isEditMode={true}
      />

      <QuestionOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        questions={questions}
        onSaveOrder={handleSaveQuestionOrder}
        isLoading={isReordering}
      />

      <SurveyResponseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        response={selectedResponse}
      />
    </div>
  );
}

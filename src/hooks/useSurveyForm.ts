// Custom hooks for survey functionality
import { useState, useEffect } from 'react';
import { 
  SurveyQuestion, 
  RatingOption, 
  SurveyResponse,
  GuestIdentity, 
  LookupData 
} from '@/types/survey-types';
import { 
  fetchSurveyQuestions, 
  fetchRatingOptions, 
  fetchLookupData 
} from '@/lib/survey-api';

export function useDropdownState() {
  const [focusedDropdowns, setFocusedDropdowns] = useState<{[key: string]: boolean}>({});

  const handleDropdownMouseDown = (key: string) => {
    setFocusedDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDropdownBlur = (key: string) => {
    setFocusedDropdowns(prev => ({
      ...prev,
      [key]: false
    }));
  };

  const handleDropdownChange = (key: string) => {
    setFocusedDropdowns(prev => ({
      ...prev,
      [key]: false
    }));
  };

  return {
    focusedDropdowns,
    handleDropdownMouseDown,
    handleDropdownBlur,
    handleDropdownChange
  };
}

export function useSurveyData() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [ratingOptions, setRatingOptions] = useState<RatingOption[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guestIdentity, setGuestIdentity] = useState<GuestIdentity>({
    id: 1,
    tamu_id: undefined, // Added tamu_id field for auto-fill
    nama: '',
    email: '',
    nomor_telp: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    kecamatan: '',
    kab_kota: '',
    provinsi: '',
    pendidikan_terakhir: '',
    pekerjaan_utama: '',
    jenis_layanan: ''
  });
  const [surveyDate, setSurveyDate] = useState('');
  const [lookupData, setLookupData] = useState<LookupData>({
    educationLevels: [],
    professions: [],
    tujuanKunjungan: []
  });

  // Load survey data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch questions and rating options in parallel
        const [questionsData, ratingsData, lookupDataResult] = await Promise.all([
          fetchSurveyQuestions(),
          fetchRatingOptions(),
          fetchLookupData()
        ]);

        console.log('Questions from API:', questionsData);
        console.log('Rating options from API:', ratingsData);

        setQuestions(questionsData);
        setRatingOptions(ratingsData);
        setLookupData(lookupDataResult);

        // Set current date for survey
        const currentDate = new Date();
        setSurveyDate(currentDate.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        }));
      } catch (error) {
        console.error('Error loading survey data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle rating change for questions
  const handleRatingChange = (questionId: number, optionId: number, ratingTypeId?: number) => {
    if (isNaN(optionId)) return; // Ignore invalid options
    
    setResponses(prev => {
      const responseKey = ratingTypeId ? `${questionId}-${ratingTypeId}` : questionId;
      const existing = prev.find(r => {
        if (ratingTypeId) {
          return r.pertanyaan_id === questionId && r.rating_type_id === ratingTypeId;
        }
        return r.pertanyaan_id === questionId && !r.rating_type_id;
      });
      
      if (existing) {
        return prev.map(r => {
          if (ratingTypeId) {
            return (r.pertanyaan_id === questionId && r.rating_type_id === ratingTypeId) 
              ? { ...r, jawaban: optionId } 
              : r;
          }
          return (r.pertanyaan_id === questionId && !r.rating_type_id) 
            ? { ...r, jawaban: optionId } 
            : r;
        });
      } else {
        return [...prev, { 
          pertanyaan_id: questionId, 
          rating_type_id: ratingTypeId,
          jawaban: optionId 
        }];
      }
    });
  };

  // Handle text input for questions
  const handleTextChange = (questionId: number, text: string, ratingTypeId?: number) => {
    setResponses(prev => {
      const existing = prev.find(r => {
        if (ratingTypeId) {
          return r.pertanyaan_id === questionId && r.rating_type_id === ratingTypeId;
        }
        return r.pertanyaan_id === questionId && !r.rating_type_id;
      });
      
      if (existing) {
        return prev.map(r => {
          if (ratingTypeId) {
            return (r.pertanyaan_id === questionId && r.rating_type_id === ratingTypeId) 
              ? { ...r, jawaban: text } 
              : r;
          }
          return (r.pertanyaan_id === questionId && !r.rating_type_id) 
            ? { ...r, jawaban: text } 
            : r;
        });
      } else {
        return [...prev, { 
          pertanyaan_id: questionId, 
          rating_type_id: ratingTypeId,
          jawaban: text 
        }];
      }
    });
  };

  // Update guest identity fields
  const updateGuestIdentity = (field: keyof GuestIdentity, value: string) => {
    setGuestIdentity(prev => ({ ...prev, [field]: value }));
  };

  // Reset form data
  const resetFormData = () => {
    setSubmitted(false);
    setResponses([]);
    setFeedback('');
    setGuestIdentity({
      id: 1,
      tamu_id: undefined,
      nama: '',
      email: '',
      nomor_telp: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      alamat: '',
      kecamatan: '',
      kab_kota: '',
      provinsi: '',
      pendidikan_terakhir: '',
      pekerjaan_utama: '',
      jenis_layanan: ''
    });
  };

  // Group questions by section
  const questionsBySection = questions.reduce((acc, question) => {
    const sectionName = question.section_nama || 'Umum';
    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }
    acc[sectionName].push(question);
    return acc;
  }, {} as Record<string, SurveyQuestion[]>);

  // Check if form is complete
  const isFormValid = () => {
    return (
      !!guestIdentity?.nama &&
      !!guestIdentity?.email &&
      !!guestIdentity?.nomor_telp &&
      !!guestIdentity?.jenis_kelamin &&
      !!guestIdentity?.tanggal_lahir &&
      !!guestIdentity?.alamat &&
      !!guestIdentity?.pendidikan_terakhir &&
      !!guestIdentity?.pekerjaan_utama &&
      !!guestIdentity?.jenis_layanan &&
      responses.length > 0
    );
  };

  return {
    questions,
    ratingOptions,
    responses,
    feedback,
    loading,
    submitting,
    submitted,
    guestIdentity,
    surveyDate,
    lookupData,
    questionsBySection,
    setFeedback,
    setSubmitting,
    setSubmitted,
    handleRatingChange,
    handleTextChange,
    updateGuestIdentity,
    resetFormData,
    isFormValid
  };
}

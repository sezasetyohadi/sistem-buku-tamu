"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';

interface SurveyQuestion {
  id: number;
  pertanyaan: string;
  section_id: number;
  section_nama?: string;
  tipe_jawaban?: 'rating' | 'teks';
  tipe_pertanyaan?: 'rating' | 'text';
  ratingOptions?: RatingOption[];
  is_required?: boolean | number;
}

interface RatingOption {
  id: number;
  nilai?: number;
  label?: string;
  deskripsi?: string;
  skala_rating?: string;
  urutan?: number;
}

interface SurveyResponse {
  pertanyaan_id: number;
  jawaban?: number | string;
}

interface GuestIdentity {
  id: number;
  nama: string;
  email: string;
  nomor_telp: string;
  tanggal_lahir?: string; // ubah dari umur ke tanggal_lahir
  jenis_kelamin: string;
  alamat: string;
  kecamatan?: string;
  kab_kota?: string;
  provinsi?: string;
  pendidikan_terakhir?: string;
  pekerjaan_utama?: string;
  jenis_layanan?: string;
}

interface LookupOption {
  id: number;
  pendidikan_terakhir?: string;
  nama_profesi?: string;
  tujuan?: string;
}

interface LookupData {
  educationLevels: LookupOption[];
  professions: LookupOption[];
  tujuanKunjungan: LookupOption[];
}

export default function SurveyForm() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [ratingOptions, setRatingOptions] = useState<RatingOption[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guestIdentity, setGuestIdentity] = useState<GuestIdentity | null>(null);
  const [surveyDate, setSurveyDate] = useState('');
  const [focusedDropdowns, setFocusedDropdowns] = useState<{[key: string]: boolean}>({});
  const [lookupData, setLookupData] = useState<LookupData>({
    educationLevels: [],
    professions: [],
    tujuanKunjungan: []
  });

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
    // Close dropdown after selection
    setFocusedDropdowns(prev => ({
      ...prev,
      [key]: false
    }));
  };

  useEffect(() => {
    fetchSurveyData();
    fetchLookupData();
    // Set current date for survey
    const currentDate = new Date();
    setSurveyDate(currentDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }));
    
    // Mock guest identity - in real app, this would come from session or API
    // For now, using sample data with empty dropdowns for user selection
    setGuestIdentity({
      id: 1,
      nama: '',
      email: '',
      nomor_telp: '',
      tanggal_lahir: '', // default kosong
      jenis_kelamin: '', // Let user select
      alamat: '',
      kecamatan: '',
      kab_kota: '',
      provinsi: '',
      pendidikan_terakhir: '', // Let user select
      pekerjaan_utama: '', // Let user select
      jenis_layanan: '' // Let user select
    });
  }, []);

  const fetchSurveyData = async () => {
    try {
      // Fetch questions with guest parameter to get only active questions
      const questionsResponse = await fetch('/api/survey/questions?for_guest=true');
      const questionsData = await questionsResponse.json();

      // Fetch rating options
      const ratingsResponse = await fetch('/api/survey/rating-options');
      const ratingsData = await ratingsResponse.json();

      if (questionsData.success) {
        setQuestions(questionsData.data || []);
      }

      if (ratingsData.success) {
        setRatingOptions(ratingsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching survey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookupData = async () => {
    try {
      const response = await fetch('/api/lookup');
      const data = await response.json();

      if (data.success) {
        setLookupData({
          educationLevels: data.data.educationLevels || [],
          professions: data.data.professions || [],
          tujuanKunjungan: data.data.tujuanKunjungan || []
        });
      }
    } catch (error) {
      console.error('Error fetching lookup data:', error);
    }
  };

  const handleRatingChange = (questionId: number, rating: number) => {
    if (isNaN(rating)) return; // Ignore invalid ratings
    
    setResponses(prev => {
      const existing = prev.find(r => r.pertanyaan_id === questionId);
      if (existing) {
        return prev.map(r => 
          r.pertanyaan_id === questionId 
            ? { ...r, jawaban: rating } 
            : r
        );
      } else {
        return [...prev, { pertanyaan_id: questionId, jawaban: rating }];
      }
    });
  };

  const handleTextChange = (questionId: number, text: string) => {
    setResponses(prev => {
      const existing = prev.find(r => r.pertanyaan_id === questionId);
      if (existing) {
        return prev.map(r => 
          r.pertanyaan_id === questionId 
            ? { ...r, jawaban: text } 
            : r
        );
      } else {
        return [...prev, { pertanyaan_id: questionId, jawaban: text }];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate identity data
      if (!guestIdentity?.nama || !guestIdentity?.email || !guestIdentity?.nomor_telp || 
          !guestIdentity?.jenis_kelamin || !guestIdentity?.tanggal_lahir || !guestIdentity?.alamat ||
          !guestIdentity?.pendidikan_terakhir || !guestIdentity?.pekerjaan_utama || !guestIdentity?.jenis_layanan) {
        alert('Mohon lengkapi semua data identitas responden');
        return;
      }

      // Convert responses to the format expected by the API
      const answers = responses.map(response => ({
        pertanyaan_id: response.pertanyaan_id,
        jawaban: response.jawaban
      }));

      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: {
            nama_lengkap: guestIdentity.nama,
            jenis_kelamin: guestIdentity.jenis_kelamin,
            tanggal_lahir: guestIdentity.tanggal_lahir,
            alamat: guestIdentity.alamat,
            email: guestIdentity.email,
            nomor_telp: guestIdentity.nomor_telp,
            pendidikan_terakhir: guestIdentity.pendidikan_terakhir,
            pekerjaan_utama: guestIdentity.pekerjaan_utama,
            jenis_layanan: guestIdentity.jenis_layanan
          },
          answers,
          feedback: feedback.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setResponses([]);
        setFeedback('');
        // Reset identity form
        setGuestIdentity({
          id: 1,
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
      } else {
        alert('Gagal mengirim survey: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Terjadi kesalahan saat mengirim survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat survey...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Terima Kasih!
        </h2>
        <p className="text-gray-600 mb-6">
          Survey Anda telah berhasil dikirim. Masukan Anda sangat berharga untuk meningkatkan kualitas pelayanan kami.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setResponses([]);
            setFeedback('');
            setGuestIdentity({
              id: 1,
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
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Isi Survey Lagi
        </button>
      </div>
    );
  }

  // Group questions by section
  const questionsBySection = questions.reduce((acc, question) => {
    const sectionName = question.section_nama || 'Umum';
    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }
    acc[sectionName].push(question);
    return acc;
  }, {} as Record<string, SurveyQuestion[]>);

  return (
    <>
      <Card variant="elevated" padding="lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Kepuasan Layanan</h2>
          <p className="text-gray-800">Berikan penilaian Anda terhadap layanan DISNAKERTRANS Provinsi Jawa Tengah</p>
        </div>

        {/* IDENTITAS RESPONDEN Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-center">IDENTITAS RESPONDEN</h3>
            <p className="text-blue-100 text-sm text-center mt-1">Silakan isi data identitas Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg"
                    value={guestIdentity?.nama || ''}
                    onChange={e => setGuestIdentity(prev => prev ? { ...prev, nama: e.target.value } : null)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg"
                    value={guestIdentity?.email || ''}
                    onChange={e => setGuestIdentity(prev => prev ? { ...prev, email: e.target.value } : null)}
                    placeholder="Masukkan email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg"
                    value={guestIdentity?.nomor_telp || ''}
                    onChange={e => setGuestIdentity(prev => prev ? { ...prev, nomor_telp: e.target.value } : null)}
                    placeholder="Masukkan nomor telepon"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="relative w-full">
                    <select 
                      value={guestIdentity?.jenis_kelamin || ''}
                      onChange={(e) => {
                        setGuestIdentity(prev => prev ? {...prev, jenis_kelamin: e.target.value} : null);
                        handleDropdownChange('gender');
                      }}
                      onMouseDown={() => handleDropdownMouseDown('gender')}
                      onBlur={() => handleDropdownBlur('gender')}
                      className="w-full pl-4 pr-10 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] appearance-none hover:bg-gray-50 focus:bg-white"
                      style={{
                        backgroundColor: '#ffffff !important',
                        color: '#1f2937 !important',
                        WebkitTextFillColor: '#1f2937 !important'
                      }}
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    {/* Dropdown arrow with animation */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns.gender ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Lahir
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg"
                    value={guestIdentity?.tanggal_lahir || ''}
                    onChange={e => setGuestIdentity(prev => prev ? { ...prev, tanggal_lahir: e.target.value } : null)}
                    placeholder="Tanggal Lahir"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat
                </label>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg"
                    value={guestIdentity?.alamat || ''}
                    onChange={e => setGuestIdentity(prev => prev ? { ...prev, alamat: e.target.value } : null)}
                    placeholder="Masukkan alamat lengkap"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pendidikan Terakhir
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <div className="relative w-full">
                    <select 
                      value={guestIdentity?.pendidikan_terakhir || ''}
                      onChange={(e) => {
                        setGuestIdentity(prev => prev ? {...prev, pendidikan_terakhir: e.target.value} : null);
                        handleDropdownChange('education');
                      }}
                      onMouseDown={() => handleDropdownMouseDown('education')}
                      onBlur={() => handleDropdownBlur('education')}
                      className="w-full pl-4 pr-10 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] appearance-none hover:bg-gray-50 focus:bg-white"
                      style={{
                        backgroundColor: '#ffffff !important',
                        color: '#1f2937 !important',
                        WebkitTextFillColor: '#1f2937 !important'
                      }}
                    >
                      <option value="">Pilih pendidikan terakhir</option>
                      {lookupData.educationLevels.map((education) => (
                        <option key={education.id} value={education.pendidikan_terakhir}>
                          {education.pendidikan_terakhir}
                        </option>
                      ))}
                    </select>
                    {/* Dropdown arrow with animation */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns.education ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pekerjaan Utama
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                  </svg>
                  <div className="relative w-full">
                    <select 
                      value={guestIdentity?.pekerjaan_utama || ''}
                      onChange={(e) => {
                        setGuestIdentity(prev => prev ? {...prev, pekerjaan_utama: e.target.value} : null);
                        handleDropdownChange('job');
                      }}
                      onMouseDown={() => handleDropdownMouseDown('job')}
                      onBlur={() => handleDropdownBlur('job')}
                      className="w-full pl-4 pr-10 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] appearance-none hover:bg-gray-50 focus:bg-white"
                      style={{
                        backgroundColor: '#ffffff !important',
                        color: '#1f2937 !important',
                        WebkitTextFillColor: '#1f2937 !important'
                      }}
                    >
                      <option value="">Pilih pekerjaan utama</option>
                      {lookupData.professions.map((profession) => (
                        <option key={profession.id} value={profession.nama_profesi}>
                          {profession.nama_profesi}
                        </option>
                      ))}
                    </select>
                    {/* Dropdown arrow with animation */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns.job ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Layanan
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="relative w-full">
                    <select 
                      value={guestIdentity?.jenis_layanan || ''}
                      onChange={(e) => {
                        setGuestIdentity(prev => prev ? {...prev, jenis_layanan: e.target.value} : null);
                        handleDropdownChange('service');
                      }}
                      onMouseDown={() => handleDropdownMouseDown('service')}
                      onBlur={() => handleDropdownBlur('service')}
                      className="w-full pl-4 pr-10 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] appearance-none hover:bg-gray-50 focus:bg-white"
                      style={{
                        backgroundColor: '#ffffff !important',
                        color: '#1f2937 !important',
                        WebkitTextFillColor: '#1f2937 !important'
                      }}
                    >
                      <option value="">Pilih jenis layanan</option>
                      {lookupData.tujuanKunjungan.map((layanan) => (
                        <option key={layanan.id} value={layanan.tujuan}>
                          {layanan.tujuan}
                        </option>
                      ))}
                    </select>
                    {/* Dropdown arrow with animation */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns.service ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Survey Questions */}
          {Object.keys(questionsBySection).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada pertanyaan survey yang tersedia.</p>
            </div>
          ) : (
            Object.entries(questionsBySection).map(([sectionName, sectionQuestions]) => (
              <div key={sectionName} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {sectionName}
                </h3>
                <div className="space-y-6">
                  {sectionQuestions.map((question) => {
                    const currentResponse = responses.find(r => r.pertanyaan_id === question.id);
                    const isTextQuestion = question.tipe_jawaban === 'teks' || question.tipe_pertanyaan === 'text';
                    
                    return (
                      <div key={question.id} className="bg-gray-50 rounded-lg p-6">
                        <p className="text-gray-900 font-medium mb-4">
                          {question.pertanyaan}
                          {(question.is_required === true || question.is_required === 1) ? (
                            <span className="text-red-500 ml-1">*</span>
                          ) : (
                            <span className="text-gray-500 ml-2 text-sm">(Opsional)</span>
                          )}
                        </p>
                        
                        {isTextQuestion ? (
                          // Text Input for text-type questions
                          <div className="relative">
                            <textarea
                              name={`question-${question.id}`}
                              value={typeof currentResponse?.jawaban === 'string' ? currentResponse.jawaban : ''}
                              onChange={(e) => {
                                handleTextChange(question.id, e.target.value);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white text-gray-900 hover:bg-gray-50 focus:bg-white resize-none"
                              rows={4}
                              placeholder="Ketikkan jawaban Anda..."
                              required={question.is_required === true || question.is_required === 1}
                            />
                          </div>
                        ) : (
                          // Dropdown for rating-type questions
                          <div className="relative">
                            <select
                              name={`question-${question.id}`}
                              value={typeof currentResponse?.jawaban === 'number' ? currentResponse.jawaban : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value) {
                                  handleRatingChange(question.id, parseInt(value));
                                  handleDropdownChange(`question-${question.id}`);
                                }
                              }}
                              onMouseDown={() => handleDropdownMouseDown(`question-${question.id}`)}
                              onBlur={() => handleDropdownBlur(`question-${question.id}`)}
                              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white text-gray-900 appearance-none hover:bg-gray-50 focus:bg-white"
                              required={question.is_required === true || question.is_required === 1}
                            >
                              <option value="">Pilih rating...</option>
                              {question.ratingOptions?.map((option) => {
                                const ratingValue = option.nilai || option.urutan || 1;
                                const ratingLabel = option.label || option.skala_rating || `Rating ${ratingValue}`;
                                
                                return (
                                  <option key={option.id} value={ratingValue}>
                                    {ratingLabel}
                                  </option>
                                );
                              })}
                            </select>
                            {/* Dropdown arrow with animation */}
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns[`question-${question.id}`] ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Feedback Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Saran dan Masukan (Opsional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white hover:bg-gray-50 focus:bg-white resize-none"
              placeholder="Berikan saran atau masukan untuk meningkatkan kualitas pelayanan kami..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || responses.length === 0 || !guestIdentity?.nama || !guestIdentity?.email || !guestIdentity?.nomor_telp || 
                       !guestIdentity?.jenis_kelamin || !guestIdentity?.tanggal_lahir || !guestIdentity?.alamat ||
                       !guestIdentity?.pendidikan_terakhir || !guestIdentity?.pekerjaan_utama || !guestIdentity?.jenis_layanan}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                submitting || responses.length === 0 || !guestIdentity?.nama || !guestIdentity?.email || !guestIdentity?.nomor_telp || 
                !guestIdentity?.jenis_kelamin || !guestIdentity?.tanggal_lahir || !guestIdentity?.alamat ||
                !guestIdentity?.pendidikan_terakhir || !guestIdentity?.pekerjaan_utama || !guestIdentity?.jenis_layanan
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {submitting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengirim...
                </span>
              ) : (
                'Kirim Survey'
              )}
            </button>
          </div>

          {(responses.length === 0 || !guestIdentity?.nama || !guestIdentity?.email || !guestIdentity?.nomor_telp || 
            !guestIdentity?.jenis_kelamin || !guestIdentity?.tanggal_lahir || !guestIdentity?.alamat ||
            !guestIdentity?.pendidikan_terakhir || !guestIdentity?.pekerjaan_utama || !guestIdentity?.jenis_layanan) && questions.length > 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Silakan lengkapi data identitas dan berikan penilaian pada setidaknya satu pertanyaan untuk dapat mengirim survey
            </p>
          )}
        </form>
      </Card>
    </>
  );
}

// Types related to surveys
export interface SurveyQuestion {
  id: number;
  pertanyaan: string;
  section_id?: number;
  section_nama?: string;
  tipe_jawaban?: 'rating' | 'teks';
  tipe_pertanyaan?: 'rating' | 'text';
  ratingOptions?: any[]; // Changed to support grouped rating options
  is_required?: boolean | number | string; // Allow for database values
  jenis_rating_id?: number; // Added to support direct rating type ID
  multiple_rating_types?: { 
    jenis_rating_id: number; 
    nama_rating?: string;
    tipe?: string;
    urutan?: number;
  }[];
}

export interface RatingOption {
  id: number;
  nilai?: number;
  label?: string;
  deskripsi?: string;
  skala_rating?: string;
  urutan?: number;
  rating_type_name?: string; // Rating name like "Sesuai" or "Penting"
  rating_type_id?: number;
  rating_type_urutan?: number;
}

export interface SurveyResponse {
  pertanyaan_id: number;
  rating_type_id?: number; // Add support for multiple rating types in one question
  jawaban?: number | string;
}

export interface GuestIdentity {
  id: number;
  tamu_id?: number; // Added tamu_id for linking with existing guests
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
  catatan_tambahan?: string; // For "Lainnya" option details
}

export interface LookupOption {
  id: number;
  pendidikan_terakhir?: string;
  nama_profesi?: string;
  tujuan?: string;
}

export interface LookupData {
  educationLevels: LookupOption[];
  professions: LookupOption[];
  tujuanKunjungan: LookupOption[];
}

export interface SurveySubmission {
  identity: {
    tamu_id?: number; // Optional ID to link to an existing guest
    nama_lengkap: string;
    jenis_kelamin: string;
    tanggal_lahir: string;
    alamat: string;
    email: string;
    nomor_telp: string;
    pendidikan_terakhir: string;
    pekerjaan_utama: string;
    jenis_layanan: string;
  };
  answers: {
    pertanyaan_id: number;
    jawaban: number | string;
  }[];
  feedback?: string;
  captchaToken?: string; // Add CAPTCHA token for verification
}

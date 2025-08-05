// Database Types sesuai dengan schema disnaker database
// Filename: database-types.ts

// Guest Registration Types (sesuai tabel daftar_tamu)
export interface DaftarTamu {
  id?: number;
  email?: string;
  nama: string;
  alamat?: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  pendidikan_terakhir?: string;
  profesi?: string;
  asal_instansi?: string;
  keperluan?: string;
  tanggal_kunjungan: string; // date
  waktu_kunjungan?: string; // time
  tanggapan?: boolean;
  file_upload?: string;
}

// Survey Types (sesuai tabel jawaban_survei)
export interface JawabanSurvei {
  id?: number;
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  pendidikan_terakhir?: string;
  profesi?: string;
  instansi?: string;
  pertanyaan_id: number;
  jawaban: number;
  created_at?: string;
  saran?: string;
}

// Survey Question Types (sesuai tabel pertanyaan_survei)
export interface PertanyaanSurvei {
  id?: number;
  pertanyaan: string;
  is_aktif?: boolean;
  created_at?: string;
}

// Survey Option Types (sesuai tabel opsi_jawaban)
export interface OpsiJawaban {
  id?: number;
  pertanyaan_id: number;
  isi_opsi: string;
  urutan?: number;
}

// Admin Types (sesuai tabel admin)
export interface Admin {
  id?: number;
  username: string;
  password: string;
  nama_lengkap?: string;
  created_at?: string;
  email?: string;
  is_super_admin?: boolean;
}

// Education Types (sesuai tabel pendidikan_terakhir)
export interface PendidikanTerakhir {
  id?: number;
  pendidikan_terakhir: string;
}

// Profession Types (sesuai tabel profesi)
export interface Profesi {
  id?: number;
  nama_profesi: string;
}

// Form Data Types untuk frontend
export interface GuestFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  education: string;
  profession: string;
  company: string;
  purpose: string;
  department: string;
  notes: string;
}

export interface SurveyFormData {
  name: string;
  email: string;
  visitDate: string;
  overallRating: string;
  serviceRating: string;
  facilityRating: string;
  staffRating: string;
  improvements: string;
  recommend: string;
  feedback: string;
  gender: 'Laki-laki' | 'Perempuan';
  education?: string;
  profession?: string;
  institution?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface DatabaseResult {
  insertId?: number;
  affectedRows?: number;
  changedRows?: number;
}

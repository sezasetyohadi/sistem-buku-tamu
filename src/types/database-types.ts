// Database Types sesuai dengan schema disnaker database
// Filename: database-types.ts

// Global type declarations for missing modules
declare module 'estree' {
  export interface Node {
    type: string;
    [key: string]: any;
  }
}

declare module 'json-schema' {
  export interface JSONSchema7 {
    [key: string]: any;
  }
}

//declare module 'json5' {
  //export function parse(text: string): any;
  //export function stringify(value: any): string;
//}

declare module 'trusted-types' {
  export interface TrustedTypePolicy {
    [key: string]: any;
  }
}

// Guest Registration Types (sesuai tabel daftar_tamu)
export interface DaftarTamu {
  id?: number;
  email?: string;
  nama: string;
  nomor_telp?: string;
  alamat?: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  pendidikan_terakhir_id?: number;
  pendidikan_terakhir?: string; // From JOIN with pendidikan_terakhir table
  profesi_id?: number;
  profesi?: string; // From JOIN with profesi table (nama_profesi)
  asal_instansi?: string;
  keperluan?: string;
  bidang_tujuan_id?: number;
  bidang_tujuan?: string; // Nama bidang (Sekretariat, Bidang Pelatihan Kerja, dll)
  tujuan_kunjungan_id?: number;
  status_kunjungan?: 'Menunggu' | 'Terjadwal' | 'Datang' | 'Selesai';
  jadwal_checkin?: string | null; // datetime
  jadwal_dibuat?: string | null; // datetime
  waktu_checkin?: string | null; // datetime
  waktu_checkout?: string | null; // datetime
  file_upload?: string;
  waktu_dibuat?: string; // datetime
  catatan_tambahan?: string;
  cara_memperoleh_informasi?: string[]; // Array of cara memperoleh informasi names
  cara_mendapatkan_salinan?: string[]; // Array of cara mendapatkan salinan names
  token?: string; // Token for guest identification
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
  section_id?: number;
  urutan?: number;
  baris?: number;
  pertanyaan: string;
  jenis_rating_id?: number;
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

// Form Data Types untuk frontend - Disederhanakan
export interface GuestFormData {
  nama: string;
  email: string;
  nomor_telp?: string;
  alamat: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  pendidikan_terakhir?: string; // Langsung string untuk menyederhanakan
  profesi?: string; // Langsung string untuk menyederhanakan
  profesi_id?: number; // ID for profesi
  pendidikan_terakhir_id?: number; // ID for pendidikan
  asal_instansi?: string;
  keperluan?: string;
  bidang_tujuan_id?: number;
  tujuan_kunjungan_id?: number;
  catatan?: string; // For catatan_tambahan column
  file_upload?: string;
  cara_memperoleh?: number[]; // Array of IDs from memperoleh_informasi table
  cara_salinan?: number[]; // Array of IDs from mendapatkan_salinan table
  status_kunjungan?: 'Menunggu' | 'Terjadwal' | 'Datang' | 'Selesai';
  jadwal_checkin?: string | null;
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

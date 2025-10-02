/**
 * Loading Constants
 * Provides consistent loading messages and configurations across the application
 */

export const LOADING_MESSAGES = {
  DEFAULT: 'Memuat...',
  PROFILE: 'Memuat profile...',
  DASHBOARD: 'Memuat dashboard...',
  GUESTS: 'Memuat data tamu...',
  REPORTS: 'Memuat laporan...',
  SETTINGS: 'Memuat pengaturan...',
  LOGIN: 'Masuk ke sistem...',
  LOGOUT: 'Keluar dari sistem...',
  
  // Actions
  UPLOADING: 'Mengupload file...',
  SAVING: 'Menyimpan data...',
  DELETING: 'Menghapus data...',
  UPDATING: 'Memperbarui data...',
  PROCESSING: 'Memproses data...',
  EXPORTING: 'Mengekspor data...',
  
  // Specific features
  UPLOADING_PHOTO: 'Mengupload foto profil...',
  CHANGING_PASSWORD: 'Mengubah password...',
  GENERATING_REPORT: 'Menghasilkan laporan...',
  SEARCHING: 'Mencari data...',
  FILTERING: 'Memfilter data...',
} as const;

export const LOADING_TIMEOUTS = {
  SHORT: 2000,   // 2 seconds
  MEDIUM: 5000,  // 5 seconds  
  LONG: 10000,   // 10 seconds
  UPLOAD: 30000, // 30 seconds for file uploads
} as const;

export const LOADING_DELAYS = {
  MINIMAL: 100,  // 100ms - minimal delay untuk smooth transition
  SHORT: 300,    // 300ms - short delay untuk better UX
  DEBOUNCE: 500, // 500ms - untuk search/filter debouncing
} as const;

export type LoadingMessage = typeof LOADING_MESSAGES[keyof typeof LOADING_MESSAGES];
export type LoadingTimeout = typeof LOADING_TIMEOUTS[keyof typeof LOADING_TIMEOUTS];
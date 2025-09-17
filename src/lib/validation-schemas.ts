/**
 * Common Validation Schemas
 * Pre-defined validation schemas for common forms
 */

import { ValidationSchema, VALIDATION_PATTERNS } from './validation';

// Guest Registration Schema
export const GUEST_REGISTRATION_SCHEMA: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.NAME,
    message: 'Nama harus berisi 2-100 karakter dan hanya boleh huruf dan spasi'
  },
  email: {
    required: true,
    email: true,
    maxLength: 100,
    message: 'Email wajib diisi dengan format yang valid'
  },
  phone: {
    required: true,
    phone: true,
    message: 'Nomor telepon wajib diisi dengan format Indonesia (+62 atau 0)'
  },
  address: {
    required: true,
    minLength: 10,
    maxLength: 200,
    message: 'Alamat lengkap wajib diisi minimal 10 karakter'
  },
  gender: {
    required: true,
    custom: (value) => {
      const validGenders = ['Laki-laki', 'Perempuan'];
      return validGenders.includes(value) ? null : 'Pilih jenis kelamin yang valid';
    }
  },
  education: {
    required: true,
    custom: (value) => {
      const validEducations = ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3'];
      return validEducations.includes(value) ? null : 'Pilih pendidikan terakhir yang valid';
    }
  },
  profession: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Profesi wajib diisi 2-100 karakter'
  },
  company: {
    maxLength: 100,
    message: 'Nama instansi maksimal 100 karakter'
  },
  purpose: {
    required: true,
    minLength: 5,
    maxLength: 200,
    message: 'Keperluan wajib diisi minimal 5 karakter'
  },
  file_upload: {
    // Optional file upload field - URL string validation
    custom: (value) => {
      if (!value) return null; // Optional field
      if (typeof value !== 'string') return 'URL file tidak valid';
      if (value.length > 500) return 'URL file terlalu panjang';
      return null;
    }
  }
};

// Admin Login Schema
export const ADMIN_LOGIN_SCHEMA: ValidationSchema = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.USERNAME,
    message: 'Username wajib diisi 3-50 karakter (huruf, angka, underscore)'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password wajib diisi minimal 6 karakter'
  }
};

// Admin Profile Schema
export const ADMIN_PROFILE_SCHEMA: ValidationSchema = {
  nama_lengkap: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.NAME,
    message: 'Nama lengkap wajib diisi 2-100 karakter (huruf dan spasi)'
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.USERNAME,
    message: 'Username wajib diisi 3-50 karakter (huruf, angka, underscore)'
  },
  email: {
    required: true,
    email: true,
    maxLength: 100,
    message: 'Email wajib diisi dengan format yang valid'
  },
  password: {
    minLength: 6,
    message: 'Password minimal 6 karakter (kosongkan jika tidak ingin mengubah)'
  },
  password_confirmation: {
    custom: (value, data) => {
      const password = data?.password;
      if (password && value !== password) {
        return 'Konfirmasi password tidak cocok';
      }
      return null;
    }
  }
};

// Survey Identity Schema
export const SURVEY_IDENTITY_SCHEMA: ValidationSchema = {
  nama: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.NAME,
    message: 'Nama lengkap wajib diisi 2-100 karakter'
  },
  jenis_kelamin: {
    required: true,
    custom: (value) => {
      const validGenders = ['Laki-laki', 'Perempuan'];
      return validGenders.includes(value) ? null : 'Pilih jenis kelamin yang valid';
    }
  },
  email: {
    required: true,
    email: true,
    maxLength: 100,
    message: 'Email wajib diisi dengan format yang valid'
  },
  nomor_telp: {
    required: true,
    phone: true,
    message: 'Nomor telepon wajib diisi dengan format Indonesia'
  },
  alamat: {
    required: true,
    minLength: 10,
    maxLength: 200,
    message: 'Alamat lengkap wajib diisi minimal 10 karakter'
  },
  pendidikan_terakhir: {
    custom: (value) => {
      if (!value) {return null;} // Optional field
      const validEducations = ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3'];
      return validEducations.includes(value) ? null : 'Pilih pendidikan terakhir yang valid';
    }
  },
  pekerjaan_utama: {
    maxLength: 100,
    message: 'Pekerjaan utama maksimal 100 karakter'
  }
};

// Token Verification Schema
export const TOKEN_VERIFICATION_SCHEMA: ValidationSchema = {
  token: {
    required: true,
    minLength: 6,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.ALPHA_NUMERIC,
    message: 'Token wajib diisi (6-20 karakter, huruf dan angka)'
  }
};

// Email Request Schema
export const EMAIL_REQUEST_SCHEMA: ValidationSchema = {
  email: {
    required: true,
    email: true,
    maxLength: 100,
    message: 'Email wajib diisi dengan format yang valid'
  }
};

// Survey Question Schema
export const SURVEY_QUESTION_SCHEMA: ValidationSchema = {
  pertanyaan: {
    required: true,
    minLength: 5,
    maxLength: 500,
    message: 'Pertanyaan wajib diisi 5-500 karakter'
  },
  jenis_rating_id: {
    required: true,
    integer: true,
    min: 1,
    message: 'Pilih jenis rating yang valid'
  },
  is_required: {
    custom: (value) => {
      return typeof value === 'boolean' ? null : 'Status wajib harus berupa boolean';
    }
  }
};

// Password Reset Schema
export const PASSWORD_RESET_SCHEMA: ValidationSchema = {
  token: {
    required: true,
    minLength: 32,
    message: 'Token reset password tidak valid'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password baru wajib diisi minimal 6 karakter'
  },
  password_confirmation: {
    required: true,
    custom: (value, data) => {
      if (value !== data?.password) {
        return 'Konfirmasi password tidak cocok';
      }
      return null;
    }
  }
};

// Report Filter Schema
export const REPORT_FILTER_SCHEMA: ValidationSchema = {
  start_date: {
    required: true,
    custom: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Tanggal mulai tidak valid';
      }
      return null;
    }
  },
  end_date: {
    required: true,
    custom: (value, data) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Tanggal selesai tidak valid';
      }
      
      const startDate = new Date(data?.start_date);
      if (date < startDate) {
        return 'Tanggal selesai tidak boleh sebelum tanggal mulai';
      }
      
      return null;
    }
  }
};

// Guest Status Update Schema
export const GUEST_STATUS_SCHEMA: ValidationSchema = {
  status: {
    required: true,
    custom: (value) => {
      const validStatuses = ['Terdaftar', 'Check-In', 'Sedang Berkunjung', 'Check-Out', 'Selesai'];
      return validStatuses.includes(value) ? null : 'Status tidak valid';
    }
  }
};

// File Upload Schema
export const FILE_UPLOAD_SCHEMA: ValidationSchema = {
  file: {
    required: true,
    custom: (value) => {
      if (!value || typeof value !== 'object') {
        return 'File wajib dipilih';
      }
      
      const file = value as File;
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (file.size > maxSize) {
        return 'Ukuran file maksimal 5MB';
      }
      
      if (!allowedTypes.includes(file.type)) {
        return 'Format file tidak didukung (JPG, PNG, PDF, DOC, DOCX)';
      }
      
      return null;
    }
  }
};

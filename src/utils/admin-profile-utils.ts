import { FILE_VALIDATION, PASSWORD_STRENGTH } from '../constants/admin-profile';
import { PasswordStrength } from '../types/admin-profile-types';

export const validateFile = (file: File) => {
  if (!FILE_VALIDATION.ALLOWED_TYPES.includes(file.type as any)) {
    return { valid: false, error: 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP' };
  }
  
  if (file.size > FILE_VALIDATION.MAX_SIZE) {
    return { valid: false, error: 'Ukuran file terlalu besar. Maksimal 5MB' };
  }
  
  return { valid: true };
};

export const getPasswordStrength = (password: string): PasswordStrength => {
  let strength = 0;
  const feedback = [];

  if (password.length >= 8) {
    strength += 1;
  } else {
    feedback.push('Minimal 8 karakter');
  }

  if (/[A-Z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Huruf besar');
  }

  if (/[a-z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Huruf kecil');
  }

  if (/\d/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Angka');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Simbol khusus');
  }

  return {
    score: strength,
    level: PASSWORD_STRENGTH.LEVELS[strength] || PASSWORD_STRENGTH.LEVELS[0],
    color: PASSWORD_STRENGTH.COLORS[strength] || PASSWORD_STRENGTH.COLORS[0],
    bgColor: PASSWORD_STRENGTH.BG_COLORS[strength] || PASSWORD_STRENGTH.BG_COLORS[0],
    feedback: feedback
  };
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatJoinDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getInitials = (name: string) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};
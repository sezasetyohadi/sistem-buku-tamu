// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// Date formatting utilities
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateOnly = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTimeOnly = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Form validation helpers
export const validateForm = (data: any, requiredFields: string[]): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors[field] = `${field} harus diisi`;
    }
  });
  
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Format email tidak valid';
  }
  
  if (data.phone && data.phone.trim() !== '' && !validatePhone(data.phone)) {
    errors.phone = 'Format nomor telepon tidak valid';
  }
  
  if (data.age && (isNaN(data.age) || data.age < 1 || data.age > 100)) {
    errors.age = 'Umur harus antara 1-100 tahun';
  }
  
  return errors;
};

// String utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Status utilities
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '#FFA500';
    case 'processing':
      return '#3B82F6';
    case 'completed':
      return '#10B981';
    case 'rejected':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'rendah':
      return '#10B981';
    case 'sedang':
      return '#F59E0B';
    case 'tinggi':
      return '#F97316';
    case 'urgent':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

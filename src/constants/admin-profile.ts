export const FILE_VALIDATION = {
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

export const PASSWORD_STRENGTH = {
  LEVELS: ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'],
  COLORS: ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600'],
  BG_COLORS: ['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-blue-100', 'bg-green-100'],
} as const;

export const MESSAGE_AUTO_HIDE_DELAY = 5000; // 5 seconds
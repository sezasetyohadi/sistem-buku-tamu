import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse JSON with error handling
 * @param jsonString - The JSON string to parse
 * @returns Parsed object or null if parsing fails
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
}

/**
 * Clear admin session data and redirect to login
 * Use this when session data is corrupted or invalid
 */
export function clearAdminSessionAndRedirect(router: any) {
  try {
    localStorage.removeItem('admin_session');
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  } catch (error) {
    console.error('Error clearing admin session:', error);
  }
}

/**
 * Safely get and parse admin session data
 * @returns Parsed session data or null if invalid
 */
export function getAdminSessionData() {
  try {
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) return null;
    
    return safeJsonParse(adminSession);
  } catch (error) {
    console.error('Error getting admin session data:', error);
    return null;
  }
}

// Format date to a readable string
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format (basic validation)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
}

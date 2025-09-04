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
export async function clearAdminSessionAndRedirect(router: any) {
  try {
    // Call logout API to clear JWT cookies
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    // Clear any remaining localStorage data (like remembered credentials if needed)
    // Note: We no longer store session data in localStorage with JWT
    
    router.push('/admin/login');
  } catch (error) {
    console.error('Error clearing admin session:', error);
    // Fallback: just redirect to login even if API call fails
    router.push('/admin/login');
  }
}

/**
 * Safely get current admin data via JWT
 * @returns Admin data or null if not authenticated
 */
export async function getAdminData() {
  try {
    const response = await fetch('/api/admin/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.admin;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting admin data:', error);
    return null;
  }
}

/**
 * Legacy compatibility function for components that expect synchronous access
 * This should be gradually replaced with getAdminData() throughout the codebase
 * @deprecated Use getAdminData() instead
 */
export function getAdminSessionData() {
  // This is a temporary fallback that returns empty data
  // Components using this should be migrated to use async getAdminData()
  console.warn('getAdminSessionData is deprecated. Use getAdminData() instead.');
  return null;
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

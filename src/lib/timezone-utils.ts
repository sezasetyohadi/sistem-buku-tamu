/**
 * Timezone utilities untuk konsistensi timestamp di seluruh aplikasi
 * Menggunakan timezone Indonesia (Asia/Jakarta) sebagai standar
 */

/**
 * Mendapatkan waktu saat ini dalam timezone Indonesia (WIB)
 * @returns {Date} Date object dalam timezone Indonesia
 */
export function getIndonesiaTime(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
}

/**
 * Mengkonversi Date object ke timezone Indonesia
 * @param {Date} date - Date object yang akan dikonversi
 * @returns {Date} Date object dalam timezone Indonesia
 */
export function toIndonesiaTime(date: Date): Date {
  return new Date(date.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
}

/**
 * Format tanggal untuk database MySQL dengan timezone Indonesia
 * @param {Date} date - Date object yang akan diformat
 * @returns {string} String dalam format YYYY-MM-DD HH:mm:ss
 */
export function formatForDatabase(date: Date): string {
  const indonesiaTime = toIndonesiaTime(date);
  return indonesiaTime.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Mendapatkan waktu saat ini dalam format MySQL timestamp
 * @returns {string} Timestamp dalam format YYYY-MM-DD HH:mm:ss (WIB)
 */
export function getCurrentDatabaseTimestamp(): string {
  return formatForDatabase(getIndonesiaTime());
}

/**
 * Parse string tanggal dari database ke Date object Indonesia
 * @param {string} dateString - String tanggal dari database
 * @returns {Date} Date object dalam timezone Indonesia
 */
export function parseFromDatabase(dateString: string): Date {
  // Assume database dates are already in Indonesia timezone
  const date = new Date(dateString);
  return date;
}

/**
 * Log waktu untuk debugging dengan timezone info
 * @param {string} label - Label untuk log
 * @param {Date} date - Date object untuk di-log
 */
export function logTimeWithTimezone(label: string, date: Date): void {
  console.log(`${label}:`, {
    iso: date.toISOString(),
    indonesia: date.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}),
    utc: date.toUTCString(),
    local: date.toString()
  });
}
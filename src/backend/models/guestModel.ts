import { RowDataPacket } from 'mysql2';

import { executeQuery } from '../config/db';

/**
 * Enum untuk jenis kelamin tamu
 * @readonly
 * @enum {string}
 */
export enum Gender {
  /** Laki-laki */
  MALE = 'Laki-laki',
  /** Perempuan */
  FEMALE = 'Perempuan'
}

/**
 * Enum untuk status kunjungan tamu
 * @readonly
 * @enum {string}
 */
export enum VisitStatus {
  /** Menunggu - Tamu telah mendaftar tapi belum dijadwalkan */
  WAITING = 'Menunggu',
  /** Terjadwal - Tamu sudah dijadwalkan untuk waktu tertentu */
  SCHEDULED = 'Terjadwal',
  /** Datang - Tamu sudah check-in dan sedang berkunjung */
  ARRIVED = 'Datang',
  /** Selesai - Tamu sudah check-out, kunjungan selesai */
  COMPLETED = 'Selesai'
}

/**
 * Interface untuk data tamu lengkap dari database
 * Berdasarkan skema tabel daftar_tamu
 */
export interface Guest {
  id?: number;
  email?: string;
  nama: string;
  nomor_telp?: string;
  alamat?: string;
  jenis_kelamin: Gender;
  pendidikan_terakhir_id?: number;
  pendidikan_terakhir?: string;
  profesi_id?: number;
  profesi?: string;
  asal_instansi?: string;
  keperluan?: string;
  catatan_tambahan?: string;
  status_kunjungan?: VisitStatus;
  jadwal_checkin?: Date;
  jadwal_dibuat?: Date;
  waktu_checkin?: Date;
  waktu_checkout?: Date;
  file_upload?: string;
  waktu_dibuat?: Date;
}

/**
 * Interface untuk membuat tamu baru
 * Digunakan saat registrasi tamu
 */
export interface GuestCreate {
  nama: string;
  email?: string;
  nomor_telp?: string;
  alamat?: string;
  jenis_kelamin: Gender;
  pendidikan_terakhir_id?: number;
  pendidikan_terakhir?: string;
  profesi_id?: number;
  profesi?: string;
  asal_instansi?: string;
  keperluan?: string;
  catatan_tambahan?: string;
  status_kunjungan?: VisitStatus;
  file_upload?: string;
}

/**
 * Interface untuk update data tamu
 * Semua field bersifat opsional untuk partial update
 */
export interface GuestUpdate {
  nama?: string;
  email?: string;
  nomor_telp?: string;
  alamat?: string;
  jenis_kelamin?: Gender;
  pendidikan_terakhir_id?: number;
  pendidikan_terakhir?: string;
  profesi_id?: number;
  profesi?: string;
  asal_instansi?: string;
  keperluan?: string;
  catatan_tambahan?: string;
  status_kunjungan?: VisitStatus;
  jadwal_checkin?: Date;
  waktu_checkin?: Date;
  waktu_checkout?: Date;
  file_upload?: string;
}

/**
 * Interface untuk hasil operasi database
 * Standar response format untuk semua operasi CRUD
 */
export interface ResultData {
  /** Status keberhasilan operasi */
  success: boolean;
  /** Pesan hasil operasi */
  message: string;
  /** Data hasil operasi (jika ada) */
  data?: unknown;
}

// SQL queries for guests based on the disnaker.sql schema
export const GUEST_QUERIES = {
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS daftar_tamu (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) DEFAULT NULL,
      nama VARCHAR(100) NOT NULL,
      nomor_telp VARCHAR(20) DEFAULT NULL,
      alamat TEXT DEFAULT NULL,
      jenis_kelamin ENUM('Laki-laki','Perempuan') NOT NULL,
      pendidikan_terakhir VARCHAR(100) DEFAULT NULL,
      profesi VARCHAR(100) DEFAULT NULL,
      asal_instansi VARCHAR(100) DEFAULT NULL,
      keperluan TEXT DEFAULT NULL,
      catatan_tambahan TEXT DEFAULT NULL,
      status_kunjungan ENUM('Menunggu','Terjadwal','Datang','Selesai') NOT NULL DEFAULT 'Menunggu',
      jadwal_checkin DATETIME DEFAULT NULL,
      jadwal_dibuat DATETIME DEFAULT NULL,
      waktu_checkin DATETIME DEFAULT NULL,
      waktu_checkout DATETIME DEFAULT NULL,
      file_upload VARCHAR(255) DEFAULT NULL,
      waktu_dibuat DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  GET_ALL: 'SELECT * FROM daftar_tamu ORDER BY waktu_dibuat DESC',
  GET_BY_ID: 'SELECT * FROM daftar_tamu WHERE id = ?',
  CREATE: `
    INSERT INTO daftar_tamu 
    (nama, email, nomor_telp, alamat, jenis_kelamin, pendidikan_terakhir, profesi, asal_instansi, 
     keperluan, catatan_tambahan, status_kunjungan, file_upload) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu', ?)
  `,
  UPDATE: 'UPDATE daftar_tamu SET ? WHERE id = ?',
  DELETE: 'DELETE FROM daftar_tamu WHERE id = ?',
  SET_STATUS: 'UPDATE daftar_tamu SET status_kunjungan = ? WHERE id = ?',
  SET_CHECKIN: 'UPDATE daftar_tamu SET waktu_checkin = ?, status_kunjungan = "Datang" WHERE id = ?',
  SET_CHECKOUT: 'UPDATE daftar_tamu SET waktu_checkout = ?, status_kunjungan = "Selesai" WHERE id = ?',
  SET_SCHEDULE: 'UPDATE daftar_tamu SET jadwal_checkin = ?, jadwal_dibuat = NOW(), status_kunjungan = "Terjadwal" WHERE id = ?',
  GET_EDUCATION_OPTIONS: 'SELECT * FROM pendidikan_terakhir ORDER BY id',
  GET_PROFESSION_OPTIONS: 'SELECT * FROM profesi ORDER BY id',
};

/**
 * Mengupdate status check-in tamu
 * 
 * @description Fungsi ini mengubah status tamu menjadi "Datang" dan mencatat waktu check-in.
 * Digunakan ketika tamu tiba di lokasi dan melakukan check-in.
 * 
 * @param {number} guestId - ID unik tamu yang akan di-check-in
 * @param {Date} checkInTime - Waktu check-in tamu
 * 
 * @returns {Promise<ResultData>} Promise yang resolve dengan hasil operasi
 * - success: true jika berhasil, false jika gagal
 * - message: Pesan hasil operasi
 * - data: Data tamu yang telah diupdate (jika berhasil)
 * 
 * @throws {Error} Jika terjadi error database atau validasi
 * 
 * @example
 * ```typescript
 * const result = await updateGuestCheckIn(123, new Date());
 * if (result.success) {
 *   console.log('Check-in berhasil:', result.data);
 * } else {
 *   console.error('Check-in gagal:', result.message);
 * }
 * ```
 */
export async function updateGuestCheckIn(guestId: number, checkInTime: Date): Promise<ResultData> {
  try {
    // Check if guest exists
    const rows = await executeQuery<RowDataPacket[]>(GUEST_QUERIES.GET_BY_ID, [guestId]);
    
    if (!rows || rows.length === 0) {
      return {
        success: false,
        message: `Tamu dengan ID ${guestId} tidak ditemukan`,
      };
    }

    // Update the guest's check-in time and status
    await executeQuery(GUEST_QUERIES.SET_CHECKIN, [checkInTime, guestId]);
    
    // Get the updated guest data
    const updatedRows = await executeQuery<RowDataPacket[]>(GUEST_QUERIES.GET_BY_ID, [guestId]);
    const updatedGuest = updatedRows[0];
    
    return {
      success: true,
      message: 'Tamu berhasil ditandai datang',
      data: updatedGuest
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating guest check-in:', error);
    return {
      success: false,
      message: `Error updating check-in status: ${errorMessage}`,
    };
  }
}

/**
 * Mengupdate status check-out tamu
 * 
 * @description Fungsi ini mengubah status tamu menjadi "Selesai" dan mencatat waktu check-out.
 * Tamu harus dalam status "Datang" sebelum bisa di-check-out.
 * 
 * @param {number} guestId - ID unik tamu yang akan di-check-out
 * @param {Date} checkOutTime - Waktu check-out tamu
 * 
 * @returns {Promise<ResultData>} Promise yang resolve dengan hasil operasi
 * - success: true jika berhasil, false jika gagal
 * - message: Pesan hasil operasi
 * - data: Data tamu yang telah diupdate (jika berhasil)
 * 
 * @throws {Error} Jika terjadi error database atau validasi
 * 
 * @example
 * ```typescript
 * const result = await updateGuestCheckOut(123, new Date());
 * if (result.success) {
 *   console.log('Check-out berhasil:', result.data);
 * } else {
 *   console.error('Check-out gagal:', result.message);
 * }
 * ```
 */
export async function updateGuestCheckOut(guestId: number, checkOutTime: Date): Promise<ResultData> {
  try {
    // Check if guest exists
    const rows = await executeQuery<RowDataPacket[]>(GUEST_QUERIES.GET_BY_ID, [guestId]);
    
    if (!rows || rows.length === 0) {
      return {
        success: false,
        message: `Tamu dengan ID ${guestId} tidak ditemukan`,
      };
    }

    const guest = rows[0];
    
    // Make sure guest has checked in before checking out
    if (!guest || guest.status_kunjungan !== 'Datang') {
      return {
        success: false,
        message: 'Tamu harus dalam status "Datang" sebelum ditandai selesai',
      };
    }
    
    // Update the guest's check-out time and status
    await executeQuery(GUEST_QUERIES.SET_CHECKOUT, [checkOutTime, guestId]);
    
    // Get the updated guest data
    const updatedRows = await executeQuery<RowDataPacket[]>(GUEST_QUERIES.GET_BY_ID, [guestId]);
    const updatedGuest = updatedRows[0];
    
    return {
      success: true,
      message: 'Kunjungan tamu berhasil ditandai selesai',
      data: updatedGuest
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating guest check-out:', error);
    return {
      success: false,
      message: `Error updating check-out status: ${errorMessage}`,
    };
  }
}

// Enum untuk jenis kelamin
export enum Gender {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan'
}

// Enum untuk status kunjungan
export enum VisitStatus {
  WAITING = 'Menunggu',
  SCHEDULED = 'Terjadwal',
  ARRIVED = 'Datang',
  COMPLETED = 'Selesai'
}

// Guest model types based on the daftar_tamu table in disnaker.sql
export interface Guest {
  id?: number;
  email?: string;
  nama: string;
  nomor_telp?: string;
  alamat?: string;
  jenis_kelamin: Gender;
  pendidikan_terakhir?: string;
  profesi?: string;
  asal_instansi?: string;
  keperluan?: string;
  catatan_tambahan?: string;
  status_kunjungan?: VisitStatus;
  jadwal_checkin?: Date;
  waktu_checkin?: Date;
  waktu_checkout?: Date;
  file_upload?: string;
  waktu_dibuat?: Date;
}

export interface GuestCreate {
  nama: string;
  email?: string;
  nomor_telp?: string;
  alamat?: string;
  jenis_kelamin: Gender;
  pendidikan_terakhir?: string;
  profesi?: string;
  asal_instansi?: string;
  keperluan?: string;
  catatan_tambahan?: string;
  status_kunjungan?: VisitStatus;
  file_upload?: string;
}

export interface GuestUpdate {
  nama?: string;
  email?: string;
  nomor_telp?: string;
  alamat?: string;
  jenis_kelamin?: Gender;
  pendidikan_terakhir?: string;
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
  SET_CHECKIN: 'UPDATE daftar_tamu SET waktu_checkin = NOW(), status_kunjungan = "Datang" WHERE id = ?',
  SET_CHECKOUT: 'UPDATE daftar_tamu SET waktu_checkout = NOW(), status_kunjungan = "Selesai" WHERE id = ?',
  SET_SCHEDULE: 'UPDATE daftar_tamu SET jadwal_checkin = ?, status_kunjungan = "Terjadwal" WHERE id = ?',
  GET_EDUCATION_OPTIONS: 'SELECT * FROM pendidikan_terakhir ORDER BY id',
  GET_PROFESSION_OPTIONS: 'SELECT * FROM profesi ORDER BY id',
};

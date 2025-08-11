// Enum untuk jenis kelamin
export enum Gender {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan'
}

// Guest model types
export interface Guest {
  id?: number;
  nama: string;
  alamat?: string;
  jenis_kelamin: Gender;
  pendidikan_terakhir?: string;
  profesi?: string;
  asal_instansi?: string;
  keperluan: string;
  waktu_kunjungan?: string;
  email?: string;
  tanggapan?: boolean | null;
  file_upload?: string;
  waktu_dibuat?: Date;
}

export interface GuestCreate {
  nama: string;
  alamat?: string;
  jenis_kelamin: Gender;
  pendidikan_terakhir?: string;
  profesi?: string;
  asal_instansi?: string;
  keperluan: string;
  waktu_kunjungan?: string;
  email?: string;
  file_upload?: string;
}

export interface GuestUpdate {
  nama?: string;
  alamat?: string;
  jenis_kelamin?: Gender;
  pendidikan_terakhir?: string;
  profesi?: string;
  asal_instansi?: string;
  keperluan?: string;
  waktu_kunjungan?: string;
  email?: string;
  tanggapan?: boolean;
  file_upload?: string;
}

// SQL queries for guests
export const GUEST_QUERIES = {
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS daftar_tamu (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      alamat TEXT DEFAULT NULL,
      jenis_kelamin ENUM('Laki-laki','Perempuan') NOT NULL,
      pendidikan_terakhir VARCHAR(100) DEFAULT NULL,
      profesi VARCHAR(100) DEFAULT NULL,
      asal_instansi VARCHAR(100) DEFAULT NULL,
      keperluan TEXT DEFAULT NULL,
      waktu_dibuat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      waktu_kunjungan VARCHAR(8) DEFAULT NULL,
      email VARCHAR(100) DEFAULT NULL,
      tanggapan TINYINT(1) DEFAULT NULL,
      file_upload VARCHAR(255) DEFAULT NULL
    )
  `,
  GET_ALL: 'SELECT * FROM daftar_tamu ORDER BY waktu_dibuat DESC',
  GET_BY_ID: 'SELECT * FROM daftar_tamu WHERE id = ?',
  CREATE: `INSERT INTO daftar_tamu 
    (nama, alamat, jenis_kelamin, pendidikan_terakhir, profesi, asal_instansi, keperluan, waktu_kunjungan, email, file_upload) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  UPDATE: 'UPDATE daftar_tamu SET ? WHERE id = ?',
  DELETE: 'DELETE FROM daftar_tamu WHERE id = ?',
  SET_TANGGAPAN: 'UPDATE daftar_tamu SET tanggapan = ? WHERE id = ?',
  GET_EDUCATION_OPTIONS: 'SELECT * FROM pendidikan_terakhir ORDER BY id',
  GET_PROFESSION_OPTIONS: 'SELECT * FROM profesi ORDER BY id',
};

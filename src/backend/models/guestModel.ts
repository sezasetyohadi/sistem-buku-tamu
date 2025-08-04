// Guest model types
export interface Guest {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  purpose: string;
  check_in: Date;
  check_out?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface GuestCreate {
  name: string;
  email: string;
  phone?: string;
  message: string;
  purpose: string;
}

export interface GuestUpdate {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  purpose?: string;
  check_out?: Date;
}

// SQL queries for guests
export const GUEST_QUERIES = {
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS guests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      message TEXT NOT NULL,
      purpose VARCHAR(255) NOT NULL,
      check_in DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      check_out DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,
  GET_ALL: 'SELECT * FROM guests ORDER BY check_in DESC',
  GET_BY_ID: 'SELECT * FROM guests WHERE id = ?',
  CREATE: 'INSERT INTO guests (name, email, phone, message, purpose) VALUES (?, ?, ?, ?, ?)',
  UPDATE: 'UPDATE guests SET ? WHERE id = ?',
  DELETE: 'DELETE FROM guests WHERE id = ?',
  CHECK_OUT: 'UPDATE guests SET check_out = CURRENT_TIMESTAMP WHERE id = ? AND check_out IS NULL',
};

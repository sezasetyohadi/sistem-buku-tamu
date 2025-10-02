export interface AdminProfile {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  role: string;
  created_at: string;
  bidang_tujuan_id: number;
  bidang_name?: string;
  profile_picture?: string | null;
}

export interface EditForm {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageState {
  type: string;
  text: string;
}

export interface PasswordStrength {
  score: number;
  level: string;
  color: string;
  bgColor: string;
  feedback: string[];
}
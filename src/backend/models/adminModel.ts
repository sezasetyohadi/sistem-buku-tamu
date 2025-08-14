interface Admin {
  id: number;
  username: string;
  password: string;
  nama_lengkap?: string;
  created_at: string;
  email?: string;
  is_super_admin?: boolean;
}

export default Admin;

interface Admin {
  id: number;
  username: string;
  password: string;
  nama_lengkap?: string;
  created_at: string;
  email?: string;
  profile_picture?: string;
  bidang_tujuan_id?: number;
}

export default Admin;

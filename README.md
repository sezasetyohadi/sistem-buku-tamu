# Sistem Buku Tamu dengan Survei Kepuasan

Aplikasi sistem buku tamu yang dilengkapi dengan fitur survei kepuasan pelanggan. Dibangun menggunakan Next.js, TypeScript, dan MySQL.

## Fitur Utama

1. **Buku Tamu**
   - Pendaftaran tamu dengan formulir lengkap
   - Pencatatan data pengunjung
   - Upload berkas pendukung

2. **Survei Kepuasan**
   - Kuesioner layanan untuk pengunjung
   - Penilaian terhadap berbagai aspek pelayanan
   - Masukan dan saran dari pengunjung

3. **Admin Panel**
   - Manajemen data tamu
   - Laporan hasil survei kepuasan
   - Statistik pengunjung

## Struktur Database

Aplikasi ini menggunakan database MySQL dengan tabel-tabel berikut:

### Tabel Tamu
- `daftar_tamu`: Menyimpan data pengunjung
- `pendidikan_terakhir`: Referensi untuk pendidikan terakhir
- `profesi`: Referensi untuk jenis profesi

### Tabel Survei
- `pertanyaan_survei`: Daftar pertanyaan survei
- `opsi_jawaban`: Pilihan jawaban untuk setiap pertanyaan
- `jawaban_survei`: Jawaban survei dari pengunjung

## Setup

1. **Clone repository**
   ```
   git clone https://github.com/username/sistem-buku-tamu.git
   cd sistem-buku-tamu
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Setup database**
   - Buat database MySQL baru bernama `disnaker`
   - Import file SQL yang disediakan atau
   - Akses endpoint `/api/init` untuk membuat tabel otomatis

4. **Konfigurasi .env**
   - Buat file `.env.local` dengan isi:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=disnaker
   DB_PORT=3306
   ```

5. **Menjalankan aplikasi**
   ```
   npm run dev
   ```

## Menginisialisasi Database

Akses endpoint `/api/init` di browser untuk membuat tabel-tabel dan memasukkan data awal yang diperlukan oleh aplikasi.

## Pengembangan

Untuk mengembangkan aplikasi ini lebih lanjut:

1. **Membuat pertanyaan survei baru**
   - Tambahkan pertanyaan di tabel `pertanyaan_survei`
   - Tambahkan opsi jawaban di tabel `opsi_jawaban`

2. **Mengubah tampilan**
   - Modifikasi komponen di folder `/components`
   - Edit halaman di folder `/app`

## Teknologi yang Digunakan

- Next.js 14
- TypeScript
- MySQL
- Tailwind CSS
- React

# Panduan Fitur Lupa Token

Dokumen ini menjelaskan cara menggunakan dan mengkonfigurasi fitur lupa token pada sistem buku tamu.

## Cara Kerja

Fitur lupa token memungkinkan pengguna untuk mendapatkan kembali token pengajuan mereka melalui email yang terdaftar. Berikut adalah alur kerjanya:

1. Pengguna mengklik "Lupa token?" pada halaman status pengajuan
2. Pengguna memasukkan alamat email yang terdaftar
3. Sistem mengirimkan token ke alamat email tersebut
4. Pengguna menerima email berisi token pengajuan
5. Pengguna dapat menggunakan token tersebut untuk memeriksa status pengajuan

## Konfigurasi SMTP

Untuk menggunakan fitur ini, Anda perlu mengkonfigurasi pengaturan SMTP di file `.env.local`. Berikut adalah parameter yang perlu diatur:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Catatan untuk Gmail

Jika Anda menggunakan Gmail sebagai server SMTP, Anda perlu:

1. Mengaktifkan verifikasi 2 langkah di akun Google Anda
2. Membuat "App Password" khusus untuk aplikasi ini
3. Menggunakan App Password tersebut sebagai nilai untuk `SMTP_PASSWORD`

## Pengembangan

Untuk pengembangan lebih lanjut, Anda dapat memodifikasi:

1. Tampilan email di `src/app/api/forgot-token/route.ts`
2. Logika pencarian token di `src/app/api/forgot-token/route.ts`
3. Tampilan antarmuka lupa token di `src/app/guest/status/page.tsx`

## Integrasi dengan Database

Saat ini, fitur ini menggunakan data dummy. Untuk integrasi dengan database:

1. Modifikasi fungsi `getTokenByEmail` di `src/app/api/forgot-token/route.ts` untuk mencari token dari database
2. Pastikan tabel database Anda menyimpan relasi antara token dan email pengguna
# Panduan Konfigurasi SMTP untuk Sistem Buku Tamu

## Menggunakan Gmail dengan App Password

Untuk menggunakan Gmail sebagai layanan email dalam aplikasi ini, Anda perlu menggunakan **App Password** dan bukan password Gmail biasa. Ini karena Google telah meningkatkan keamanan dan tidak lagi mengizinkan aplikasi pihak ketiga untuk login menggunakan password biasa.

### Langkah-langkah Mendapatkan App Password:

1. **Aktifkan Verifikasi 2 Langkah**
   - Buka [Pengaturan Keamanan Google](https://myaccount.google.com/security)
   - Cari "Verifikasi 2 Langkah" dan aktifkan fitur tersebut
   - Ikuti petunjuk untuk menyelesaikan proses aktivasi

2. **Buat App Password**
   - Kembali ke [Pengaturan Keamanan Google](https://myaccount.google.com/security)
   - Cari "Sandi Aplikasi" atau "App Passwords"
   - Pilih "Aplikasi" dan pilih "Lainnya (Nama kustom)"
   - Masukkan nama untuk aplikasi ini (misalnya "Sistem Buku Tamu")
   - Klik "Buat"
   - Google akan menampilkan App Password yang terdiri dari 16 karakter
   - Salin password ini

3. **Konfigurasi File .env**
   - Buka file `.env` di root proyek
   - Isi bagian SMTP dengan informasi berikut:
   ```
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```
   - Ganti `your_email@gmail.com` dengan alamat Gmail Anda
   - Ganti `your_app_password_here` dengan App Password yang Anda dapatkan dari langkah sebelumnya

## Troubleshooting

### Error "Username and Password not accepted"

Jika Anda melihat error ini:
```
Error sending token: [Error: Invalid login: 535-5.7.8 Username and Password not accepted.
```

Kemungkinan penyebabnya:
1. Anda menggunakan password Gmail biasa, bukan App Password
2. App Password yang dimasukkan salah atau sudah tidak valid
3. Akun Gmail Anda memiliki pembatasan keamanan tambahan

### Solusi:

1. Pastikan Anda menggunakan App Password, bukan password Gmail biasa
2. Buat App Password baru dan perbarui di file `.env`
3. Pastikan Anda telah mengaktifkan "Akses aplikasi yang kurang aman" di pengaturan keamanan Gmail Anda

## Menggunakan Layanan Email Lain

Jika Anda ingin menggunakan layanan email selain Gmail, sesuaikan konfigurasi SMTP di file `.env` dengan informasi dari penyedia layanan email Anda:

```
SMTP_USER=your_email@provider.com
SMTP_PASSWORD=your_password
SMTP_HOST=smtp.provider.com
SMTP_PORT=port_number
SMTP_SECURE=true_or_false
```

Untuk informasi lebih lanjut tentang konfigurasi SMTP, silakan merujuk ke dokumentasi penyedia layanan email Anda.
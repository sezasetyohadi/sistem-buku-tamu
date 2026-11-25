# 📋 Sistem Buku Tamu dengan Survei Kepuasan

Aplikasi sistem buku tamu digital yang dilengkapi dengan fitur survei kepuasan pelanggan. Dibangun menggunakan Next.js 15, TypeScript, dan MySQL dengan arsitektur dual-port modern.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)

## ✨ Fitur Utama

### 🏠 **Portal Tamu (Port 3000)**
- **Pendaftaran Tamu Digital**: Formulir lengkap dengan validasi real-time
- **Upload Berkas**: Dukungan upload dokumen pendukung
- **Status Kunjungan**: Tracking real-time status kunjungan
- **Survei Kepuasan**: Sistem rating dan feedback terintegrasi

### 🔧 **Admin Panel (Port 3001)**
- **Dashboard Komprehensif**: Statistik dan metrics real-time
- **Manajemen Tamu**: CRUD lengkap dengan filtering dan pencarian
- **Laporan & Analisis**: Export data dalam format Excel dan PDF
- **Manajemen Survei**: Kelola pertanyaan dan analisis hasil
- **Monitoring Performa**: Dashboard database dan sistem

### 🛡️ **Fitur Keamanan**
- **Autentikasi JWT**: Token-based authentication dengan refresh tokens
- **Validasi Input**: Sistem validasi dan sanitasi input yang komprehensif
- **Rate Limiting**: Perlindungan terhadap brute force attacks
- **Logging Keamanan**: Pencatatan aktivitas login dan security events

### 🚀 **Optimasi Performa**
- **Connection Pooling**: Optimasi koneksi database
- **Query Caching**: Sistem cache untuk query yang sering diakses
- **Lazy Loading**: Loading komponen secara bertahap
- **Performance Monitoring**: Monitoring real-time performa aplikasi

## 📊 Struktur Database

Aplikasi ini menggunakan database MySQL dengan 20+ tabel yang terorganisir dengan baik:

### 📋 **Tabel Utama**
- `daftar_tamu`: Data pengunjung dengan status tracking
- `jawaban_identitas_survei`: Data responden survei
- `admin`: User admin dengan role-based access

### 🔍 **Tabel Referensi**
- `bidang_tujuan`: Departemen/bidang tujuan kunjungan
- `pendidikan_terakhir`: Tingkat pendidikan
- `profesi`: Jenis profesi pengunjung
- `tujuan_kunjungan`: Tujuan spesifik kunjungan

### 📋 **Sistem Survei**
- `pertanyaan_survei`: Pertanyaan survei kepuasan
- `jenis_rating`: Tipe rating (skala, pilihan ganda, teks)
- `opsi_rating`: Pilihan rating dan skala
- `jawaban_survei`: Jawaban survei dari pengunjung

### 🔐 **Tabel Keamanan**
- `tamu_token`: Token akses untuk tamu
- `login_attempts`: Log percobaan login
- `account_locks`: Status kunci akun
- `password_resets`: Token reset password

## 🚀 Setup dan Instalasi

### Prerequisites
- Node.js 18.0.0 atau lebih tinggi
- MySQL 8.0 atau lebih tinggi
- npm atau yarn

### 1. **Clone Repository**
```bash
git clone https://github.com/sezasetyohadi/sistem-buku-tamu.git
cd sistem-buku-tamu
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Konfigurasi Environment**
```bash
# Copy template environment
cp .env.example .env

# Edit konfigurasi database dan aplikasi
# Lihat ENV-CONFIGURATION.md untuk detail lengkap
```

### 4. **Setup Database**
Pastikan database MySQL sudah dibuat dan konfigurasi `.env` sudah benar.

### 5. **Jalankan Aplikasi**

#### Development Mode (Dual Port)
```bash
# Jalankan kedua aplikasi sekaligus
npm run dev

# Atau jalankan secara terpisah
npm run dev:admin  # Admin panel di http://localhost:3001
npm run dev:guest  # Portal tamu di http://localhost:3000
```

#### Production Mode
```bash
# Build aplikasi
npm run build

# Jalankan production server
npm run start
```

## 🛠️ Teknologi yang Digunakan

### **Frontend**
- **Next.js 15.5.2**: React framework dengan App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React 19.1.0**: UI library terbaru
- **React Icons**: Komprehensif icon library

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **MySQL 8.0**: Relational database
- **JWT**: JSON Web Tokens untuk autentikasi
- **bcrypt**: Password hashing
- **Validator**: Input validation dan sanitization

### **Development Tools**
- **ESLint**: Linting dan code quality
- **Concurrently**: Multi-process runner
- **tsx**: TypeScript execution untuk scripts
- **dotenv**: Environment variables management

### **Libraries & Utilities**
- **Chart.js**: Data visualization
- **ExcelJS**: Excel file generation
- **jsPDF**: PDF generation
- **html2canvas**: HTML to canvas conversion
- **nodemailer**: Email functionality
- **react-hot-toast**: Toast notifications

## 📚 Dokumentasi

- 📖 [API Documentation](./API-DOCUMENTATION.md)
- 🏗️ [Folder Structure](./FOLDER-STRUCTURE.md)
- 🔧 [Environment Configuration](./ENV-CONFIGURATION.md)
- 🚀 [Dual Port Guide](./DUAL-PORT-GUIDE.md)
- 🛡️ [Validation System](./VALIDATION-SYSTEM.md)
- 📊 [Database Performance](./DATABASE-PERFORMANCE.md)
- 🚨 [Error Handling Guide](./ERROR-HANDLING-GUIDE.md)
- 📋 [API Response Standards](./API-RESPONSE-STANDARDS.md)

## 🔧 Scripts NPM

```bash
# Development
npm run dev                # Dual port development
npm run dev:admin         # Admin panel only (port 3001)
npm run dev:guest         # Guest portal only (port 3000)
npm run dev:single        # Single port development

# Production
npm run build             # Build aplikasi
npm run build:admin       # Build admin panel
npm run build:guest       # Build guest portal
npm run start             # Start production server
npm run start:admin       # Start admin production server
npm run start:guest       # Start guest production server

# Database
# Database operations require manual setup

# Code Quality
npm run lint             # ESLint check
```

## 🏗️ Arsitektur Aplikasi

### **Dual-Port Architecture**
- **Guest Portal (3000)**: Interface untuk pengunjung
- **Admin Panel (3001)**: Interface untuk administrator
- **Shared Backend**: API routes dan database yang sama

### **Folder Structure**
```
src/
├── app/                 # Next.js App Router
│   ├── admin/          # Admin panel pages
│   ├── guest/          # Guest portal pages
│   └── api/            # API endpoints
├── backend/            # Server-side logic
│   ├── config/         # Database configuration
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   └── seeds/          # Database seed data
├── components/         # React components
│   ├── admin/          # Admin-specific components
│   ├── guest/          # Guest-specific components
│   └── ui/             # Shared UI components
├── lib/                # Utilities and helpers
└── types/              # TypeScript type definitions
```

## 🚦 Status Proyek

- ✅ **Security**: Implementasi keamanan komprehensif
- ✅ **Performance**: Optimasi database dan aplikasi
- ✅ **Error Handling**: Sistem error handling yang robust
- ✅ **Validation**: Validasi dan sanitasi input lengkap
- 🔄 **Code Quality**: Sedang dalam pengembangan
- ⏳ **Testing**: Akan diimplementasikan
- ⏳ **Monitoring**: Akan diimplementasikan
- ⏳ **Production**: Siap untuk deployment

## 👥 Kontributor

- **Developer**: GitHub Copilot & Team
- **Project Type**: Sistem Manajemen Buku Tamu Digital
- **Organization**: Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah

---

**🎯 Tujuan**: Sistem Buku Tamu Digital Modern untuk Pelayanan Publik  
**📅 Last Updated**: September 2025  
**🔧 Status**: Finish Development

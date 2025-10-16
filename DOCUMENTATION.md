# Sistem Buku Tamu - Dokumentasi Komprehensif

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Teknologi Yang Digunakan](#teknologi-yang-digunakan)
3. [Struktur Folder](#struktur-folder)
4. [Fitur Utama](#fitur-utama)
5. [API Documentation](#api-documentation)
6. [Standar Response API](#standar-response-api)
7. [Standar Coding](#standar-coding)
8. [Database](#database)
9. [Panduan Deployment](#panduan-deployment)
10. [Multiple Deployment](#multiple-deployment)
11. [Dual-Port Guide](#dual-port-guide)
12. [Konfigurasi Environment](#konfigurasi-environment)
13. [Error Handling](#error-handling)
14. [Fitur Lazy Loading](#fitur-lazy-loading)
15. [Sistem Validasi](#sistem-validasi)

---

## Pendahuluan

Sistem Buku Tamu adalah aplikasi berbasis web yang dirancang untuk mengelola kunjungan tamu dan memudahkan administrasi kunjungan pada instansi. Aplikasi ini memiliki dua modul utama: **Modul Admin** dan **Modul Tamu**.

### Tujuan Aplikasi
- Pencatatan kunjungan tamu secara digital
- Pemantauan statistik kunjungan
- Pengelolaan data tamu
- Survei kepuasan layanan

---

## Teknologi Yang Digunakan

### Frontend
- **Next.js** (14.x) - Framework React dengan server-side rendering
- **React** (18.x) - Library UI
- **TypeScript** (5.x) - JavaScript dengan typing
- **Tailwind CSS** (3.x) - Utility-first CSS framework
- **Chart.js** / **React-Chart.js** - Library untuk visualisasi data
- **React Hook Form** - Library untuk manajemen form

### Backend
- **Next.js API Routes** - API endpoints berbasis serverless
- **MySQL** - Database relasional
- **Prisma** / **MySQL2** - ORM / Database client
- **JWT** - JSON Web Token untuk autentikasi
- **bcrypt** - Library untuk hashing password

### DevOps & Tools
- **ESLint** - Code linting
- **PostCSS** - Processor CSS
- **Middleware** - Custom middleware untuk autentikasi dan routing
- **Environment Variables** - Konfigurasi aplikasi

---

## Struktur Folder

```
sistema-buku-tamu/
├── .next/                  # Build folder (auto-generated)
├── database/               # Database scripts dan dokumentasi
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── globals.css     # Global CSS
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Homepage
│   │   ├── access-denied/  # Access denied page
│   │   ├── admin/          # Admin pages
│   │   ├── api/            # API routes
│   │   ├── guest/          # Guest pages
│   │   └── reset-password-page/ # Password reset
│   ├── backend/            # Backend logic
│   │   ├── config/         # Backend configuration
│   │   ├── models/         # Data models
│   │   └── services/       # Business logic services
│   ├── components/         # React components
│   │   ├── admin/          # Admin components
│   │   ├── auth/           # Authentication components
│   │   ├── charts/         # Visualization components
│   │   ├── error/          # Error handling components
│   │   ├── forms/          # Form components
│   │   ├── guest/          # Guest-facing components
│   │   └── ui/             # UI components
│   ├── constants/          # Application constants
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Shared utilities
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── eslint.config.mjs       # ESLint configuration
├── middleware.ts           # Global Next.js middleware
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── postcss.config.mjs      # PostCSS configuration
└── tailwind.config.ts      # Tailwind CSS configuration
```

Keterangan detail struktur folder dapat dilihat pada [Panduan Struktur Folder](#struktur-folder-detail).

---

## Fitur Utama

### Modul Tamu
- **Registrasi Kunjungan**: Form untuk mencatat kunjungan
- **Survei Kepuasan**: Pengisian survei setelah mendapatkan layanan
- **Authentikasi Tamu**: Login untuk tamu yang sudah terdaftar

### Modul Admin
- **Dashboard**: Visualisasi statistik kunjungan
- **Manajemen Tamu**: CRUD operasi untuk data tamu
- **Laporan**: Generasi laporan kunjungan
- **Manajemen Survei**: Konfigurasi dan analisis survei
- **Pengaturan Admin**: Manajemen profil dan pengguna admin

---

## API Documentation

### Endpoints

#### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/reset-password
POST /api/auth/request-reset
```

#### Tamu
```
GET /api/guest
GET /api/guest/:id
POST /api/guest
PUT /api/guest/:id
DELETE /api/guest/:id
```

#### Kunjungan
```
GET /api/visits
GET /api/visits/:id
POST /api/visits
PUT /api/visits/:id
DELETE /api/visits/:id
```

#### Survei
```
GET /api/survey
GET /api/survey/:id
POST /api/survey
PUT /api/survey/:id
DELETE /api/survey/:id
```

#### Admin
```
GET /api/admin
GET /api/admin/:id
POST /api/admin
PUT /api/admin/:id
DELETE /api/admin/:id
```

#### Laporan
```
GET /api/reports/daily
GET /api/reports/monthly
GET /api/reports/custom
```

### Authentication

API menggunakan JWT (JSON Web Token) untuk autentikasi. Token dikirim melalui header Authorization dengan format:

```
Authorization: Bearer {token}
```

---

## Standar Response API

Semua API endpoint mengembalikan respons dengan format yang konsisten:

### Sukses Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

### Status Codes

- `200 OK` - Request berhasil
- `201 Created` - Resource berhasil dibuat
- `400 Bad Request` - Input tidak valid
- `401 Unauthorized` - Token autentikasi tidak ada atau tidak valid
- `403 Forbidden` - Tidak memiliki izin akses
- `404 Not Found` - Resource tidak ditemukan
- `500 Internal Server Error` - Error server

---

## Standar Coding

### Penamaan
- **Files**: PascalCase untuk komponen React, kebab-case untuk file lainnya
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Functions**: camelCase
- **Classes/Interfaces**: PascalCase
- **Types**: PascalCase

### TypeScript
- Selalu definisikan tipe untuk props komponen
- Gunakan interface untuk objek yang dapat diperluas
- Gunakan type untuk union/intersection types
- Hindari penggunaan `any`

### React Components
- Gunakan functional components dengan hooks
- Ekstrak logic ke dalam custom hooks
- Pisahkan UI components dari container components

### Styling
- Gunakan Tailwind CSS untuk styling
- Buat komponen UI yang reusable
- Hindari inline styles

### Error Handling
- Gunakan try/catch untuk operasi asinkron
- Implementasikan error boundaries untuk komponen React
- Log errors dengan informasi kontekstual

---

## Database

### Schema

Database dibangun menggunakan MySQL dengan skema utama:

#### Tabel Admin
```sql
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('super_admin', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tabel Tamu
```sql
CREATE TABLE guest (
    guest_id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tabel Kunjungan
```sql
CREATE TABLE visit (
    visit_id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    visit_date DATETIME NOT NULL,
    exit_date DATETIME,
    status ENUM('waiting', 'in_progress', 'completed', 'cancelled') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guest(guest_id)
);
```

#### Tabel Survei
```sql
CREATE TABLE survey (
    survey_id INT AUTO_INCREMENT PRIMARY KEY,
    visit_id INT NOT NULL,
    rating INT NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visit(visit_id)
);
```

### Optimasi Database

Beberapa tips untuk optimasi performa database:

1. **Indexing**:
   - Buat indeks untuk kolom yang sering digunakan dalam WHERE, JOIN, dan ORDER BY
   - Hindari over-indexing yang dapat memperlambat INSERT dan UPDATE

2. **Query Optimization**:
   - Gunakan EXPLAIN untuk menganalisis query
   - Hindari SELECT * ketika hanya membutuhkan kolom tertentu
   - Gunakan pagination untuk result sets yang besar

3. **Connection Management**:
   - Gunakan connection pooling
   - Tutup koneksi setelah digunakan
   - Batasi jumlah koneksi concurrent

4. **Regular Maintenance**:
   - Jalankan ANALYZE TABLE secara berkala
   - Backup database secara teratur
   - Monitor performa query

---

## Panduan Deployment

### Persiapan Deployment

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Konfigurasi Environment**
   - Sesuaikan file environment dengan environment target
   - Pastikan URL dan credential database sudah benar

3. **Database Setup**
   - Jalankan script migrasi database
   - Seed data awal jika diperlukan

### Deployment Options

#### Vercel (Recommended)
1. Connect repository ke Vercel
2. Konfigurasi environment variables
3. Deploy

#### Self-Hosted
1. Instalasi Node.js di server
2. Clone repository
3. Install dependencies (`npm install`)
4. Build project (`npm run build`)
5. Start server (`npm start`)

#### Docker
1. Build image dengan Dockerfile
2. Run container dengan environment variables
3. Map port yang sesuai

---

## Multiple Deployment

Sistem ini mendukung multiple deployment untuk memisahkan modul Admin dan Tamu.

### Mode Deployment

1. **Combined Mode**
   - Satu deployment untuk Admin dan Tamu
   - Cocok untuk development dan testing

2. **Split Mode**
   - Deployment terpisah untuk Admin dan Tamu
   - Keamanan dan performa lebih baik
   - Menggunakan subdomain berbeda:
     - admin.example.com (Admin)
     - guest.example.com (Tamu)

### Konfigurasi Split Mode

1. **Middleware Configuration**
   - Middleware akan mendeteksi mode berdasarkan subdomain/hostname
   - Redirect ke endpoint yang sesuai berdasarkan mode

2. **Environment Configuration**
   - Set APP_MODE=admin atau APP_MODE=guest
   - Konfigurasi NEXT_PUBLIC_ADMIN_URL dan NEXT_PUBLIC_GUEST_URL

3. **Database Access**
   - Batasi akses database berdasarkan mode deployment
   - Gunakan user database dengan permission yang sesuai

---

## Dual-Port Guide

Untuk development lokal, aplikasi dapat dijalankan di dua port berbeda untuk mengemulasikan split mode.

1. **Start Admin Mode**
   ```bash
   APP_MODE=admin PORT=3001 npm run dev
   ```

2. **Start Guest Mode**
   ```bash
   APP_MODE=guest PORT=3002 npm run dev
   ```

3. **Konfigurasi Hosts File**
   ```
   127.0.0.1 admin.localhost
   127.0.0.1 guest.localhost
   ```

4. **Akses Aplikasi**
   - Admin: http://admin.localhost:3001
   - Guest: http://guest.localhost:3002

---

## Konfigurasi Environment

Aplikasi menggunakan environment variables untuk konfigurasi. File `.env` dan `.env.example` disediakan sebagai template.

### Kategori Environment Variables

1. **Database Configuration**
   - Credential dan connection string database

2. **Application Settings**
   - Port, mode aplikasi, URLs

3. **Authentication Settings**
   - Secret keys untuk JWT
   - Token expiry settings

4. **External Services**
   - API keys untuk layanan pihak ketiga

### Validasi Environment

Aplikasi menggunakan `environment-validator.ts` untuk memastikan semua environment variables yang diperlukan tersedia saat startup.

---

## Error Handling

### Error Boundaries

Aplikasi menggunakan React Error Boundaries untuk mengisolasi error dalam komponen:

```jsx
// Di level aplikasi
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

// Di level komponen
<ErrorBoundary fallback={<ComponentError />}>
  <MyComponent />
</ErrorBoundary>
```

### API Error Handling

1. **Client-side Error Handling**
   - Custom hook `useErrorHandling` untuk menangani error API
   - Toast notifications untuk menampilkan error user-friendly

2. **Server-side Error Handling**
   - Middleware untuk menangkap dan format API errors
   - Logging errors ke sistem monitoring

### Error Recovery

Strategi recovery otomatis:
- Automatic retry untuk network errors
- Cache fallback untuk data kritis
- Graceful degradation untuk fitur non-kritis

---

## Fitur Lazy Loading

Aplikasi mengimplementasikan lazy loading untuk meningkatkan performa:

### Component Lazy Loading

```jsx
const Chart = dynamic(() => import('@/components/charts/VisitChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

### Image Lazy Loading

```jsx
<Image src="/profile.jpg" alt="Profile" loading="lazy" />
```

### Data Lazy Loading

Custom hook `useLazyLoading` untuk fetching data saat komponen visible:

```jsx
const { data, loading } = useLazyLoading('/api/visits', { threshold: 0.5 });
```

---

## Sistem Validasi

### Client-side Validation

- React Hook Form untuk validasi form
- Zod/Yup schema untuk validasi data
- Custom hooks untuk reusable validation logic

### Server-side Validation

- Middleware validasi untuk API requests
- TypeScript interfaces untuk type safety
- Sanitasi input untuk mencegah injection

### Domain Validation

- Business rules validation di service layer
- Consistent error messages
- Validasi khusus domain seperti format NIK, email, dll.

---

*Dokumentasi ini mencakup seluruh aspek sistem Buku Tamu. Untuk informasi lebih lanjut, hubungi tim pengembang.*

*Last Updated: October 15, 2025*
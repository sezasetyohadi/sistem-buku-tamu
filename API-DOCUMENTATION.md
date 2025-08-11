# Sistem Buku Tamu - API Documentation

## 📋 Daftar API Endpoints

### 🧑‍💼 Guest Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/guests` | Mendapatkan semua data tamu |
| `POST` | `/api/guests` | Menambah tamu baru |
| `GET` | `/api/guests/[id]` | Mendapatkan data tamu berdasarkan ID |
| `PUT` | `/api/guests/[id]` | Update data tamu |
| `PATCH` | `/api/guests/[id]` | Update sebagian data tamu |
| `DELETE` | `/api/guests/[id]` | Hapus data tamu |

### 📊 Survey Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/surveys` | Mendapatkan semua jawaban survei |
| `POST` | `/api/surveys` | Submit jawaban survei baru |
| `GET` | `/api/survey-questions` | Mendapatkan semua pertanyaan survei dengan opsi |

### 📈 Statistics & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/statistics` | Mendapatkan statistik tamu dan survei |

### 🔍 Lookup Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/lookup` | Mendapatkan data pendidikan dan profesi |

---

## 📄 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message"
}
```

---

## 🧑‍💼 Guest API Details

### POST /api/guests
**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string",
  "address": "string",
  "gender": "Laki-laki | Perempuan",
  "education": "string",
  "profession": "string",
  "company": "string",
  "purpose": "string (required)",
  "department": "string",
  "notes": "string"
}
```

### GET /api/guests
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "John Doe",
      "email": "john@example.com",
      "alamat": "Jl. Contoh No. 123",
      "jenis_kelamin": "Laki-laki",
      "pendidikan_terakhir": "S1",
      "profesi": "Software Developer",
      "asal_instansi": "PT. Teknologi Maju",
      "keperluan": "Konsultasi pengembangan sistem",
      "waktu_dibuat": "2025-08-05T10:30:00.000Z",
      "waktu_kunjungan": "10:30:00",
      "created_at": "2025-08-05T10:30:00.000Z"
    }
  ],
  "message": "Guests retrieved successfully"
}
```

---

## 📊 Survey API Details

### POST /api/surveys
**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "visitDate": "string",
  "overallRating": "1-5 (required)",
  "serviceRating": "1-5",
  "facilityRating": "1-5",
  "staffRating": "1-5",
  "improvements": "string",
  "recommend": "string",
  "feedback": "string",
  "gender": "Laki-laki | Perempuan",
  "education": "string",
  "profession": "string",
  "institution": "string"
}
```

### GET /api/survey-questions
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "pertanyaan": "Bagaimana tingkat kepuasan Anda terhadap pelayanan yang diberikan?",
      "is_aktif": true,
      "created_at": "2025-08-05T10:30:00.000Z",
      "options": [
        {
          "id": 1,
          "pertanyaan_id": 1,
          "isi_opsi": "Sangat Tidak Puas",
          "urutan": 1
        },
        {
          "id": 2,
          "pertanyaan_id": 1,
          "isi_opsi": "Tidak Puas",
          "urutan": 2
        }
      ]
    }
  ],
  "message": "Survey questions retrieved successfully"
}
```

---

## 📈 Statistics API Details

### GET /api/statistics
**Response:**
```json
{
  "success": true,
  "data": {
    "guests": {
      "totalGuests": 150,
      "todayGuests": 5,
      "thisMonthGuests": 45,
      "genderStats": [
        {"jenis_kelamin": "Laki-laki", "count": 80},
        {"jenis_kelamin": "Perempuan", "count": 70}
      ],
      "educationStats": [
        {"pendidikan_terakhir": "S1", "count": 60},
        {"pendidikan_terakhir": "SMA/SMK", "count": 40}
      ]
    },
    "surveys": {
      "totalSurveys": 120,
      "averageRating": "4.2",
      "ratingDistribution": [
        {"jawaban": 1, "count": 2},
        {"jawaban": 2, "count": 8},
        {"jawaban": 3, "count": 25},
        {"jawaban": 4, "count": 45},
        {"jawaban": 5, "count": 40}
      ]
    }
  },
  "message": "Statistics retrieved successfully"
}
```

---

## 🔍 Lookup API Details

### GET /api/lookup
**Response:**
```json
{
  "success": true,
  "data": {
    "educationLevels": [
      {"id": 1, "pendidikan_terakhir": "SD"},
      {"id": 2, "pendidikan_terakhir": "SMP"},
      {"id": 3, "pendidikan_terakhir": "SMA/SMK"},
      {"id": 4, "pendidikan_terakhir": "D1"},
      {"id": 5, "pendidikan_terakhir": "D2"},
      {"id": 6, "pendidikan_terakhir": "D3"},
      {"id": 7, "pendidikan_terakhir": "S1"},
      {"id": 8, "pendidikan_terakhir": "S2"},
      {"id": 9, "pendidikan_terakhir": "S3"}
    ],
    "professions": [
      {"id": 1, "nama_profesi": "Pelajar/Mahasiswa"},
      {"id": 2, "nama_profesi": "PNS"},
      {"id": 3, "nama_profesi": "TNI/Polri"},
      {"id": 4, "nama_profesi": "Pegawai Swasta"},
      {"id": 5, "nama_profesi": "Wiraswasta"}
    ]
  },
  "message": "Lookup data retrieved successfully"
}
```

---

## 🗄️ Database Schema

### Tabel daftar_tamu
```sql
CREATE TABLE daftar_tamu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  alamat TEXT,
  jenis_kelamin ENUM('Laki-laki', 'Perempuan') NOT NULL,
  pendidikan_terakhir VARCHAR(50),
  profesi VARCHAR(100),
  asal_instansi VARCHAR(100),
  keperluan TEXT NOT NULL,
  waktu_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  waktu_kunjungan TIME DEFAULT NULL,
  tanggapan BOOLEAN DEFAULT FALSE,
  file_upload VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabel jawaban_survei
```sql
CREATE TABLE jawaban_survei (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(100) NOT NULL,
  jenis_kelamin ENUM('Laki-laki', 'Perempuan') NOT NULL,
  pendidikan_terakhir VARCHAR(50),
  profesi VARCHAR(100),
  instansi VARCHAR(100),
  pertanyaan_id INT NOT NULL DEFAULT 1,
  jawaban INT NOT NULL CHECK (jawaban BETWEEN 1 AND 5),
  saran TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabel pertanyaan_survei
```sql
CREATE TABLE pertanyaan_survei (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pertanyaan TEXT NOT NULL,
  is_aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabel opsi_jawaban
```sql
CREATE TABLE opsi_jawaban (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pertanyaan_id INT NOT NULL,
  isi_opsi VARCHAR(255) NOT NULL,
  urutan INT DEFAULT 1
);
```

### Tabel pendidikan_terakhir
```sql
CREATE TABLE pendidikan_terakhir (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pendidikan_terakhir VARCHAR(50) NOT NULL UNIQUE
);
```

### Tabel profesi
```sql
CREATE TABLE profesi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_profesi VARCHAR(100) NOT NULL UNIQUE
);
```

---

## 🔧 Environment Variables

Create `.env.local` file:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=disnaker
DB_PORT=3306
```

---

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup database:**
   - Create MySQL database named `disnaker`
   - Run the SQL script in `/database/setup.sql`

3. **Configure environment:**
   - Copy `.env.local` and update database credentials

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

---

## ✅ Features Implemented

- ✅ **Guest Registration** - Form pendaftaran tamu
- ✅ **Guest List** - Tampilan daftar tamu
- ✅ **Survey System** - Sistem survei kepuasan
- ✅ **Statistics Dashboard** - Dashboard statistik
- ✅ **Admin Panel** - Panel admin (struktur ready)
- ✅ **Database Auto-Setup** - Auto-create tables
- ✅ **API Endpoints** - Complete REST API
- ✅ **Lookup Data** - Dropdown data pendidikan & profesi
- ✅ **CRUD Operations** - Create, Read, Update, Delete
- ✅ **Search & Filter** - Pencarian dan filter data

---

## 🎯 Next Steps

1. **Authentication System** - Login admin
2. **File Upload** - Upload dokumen tamu
3. **Export Features** - Export ke Excel/PDF
4. **Real-time Notifications** - Notifikasi real-time
5. **Advanced Reports** - Laporan lanjutan

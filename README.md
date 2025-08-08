# Sistem Buku Tamu

Aplikasi Sistem Buku Tamu untuk mengelola data pengunjung dengan fitur survey kepuasan.

## Arsitektur Project

Project ini telah dipisahkan menjadi 2 bagian utama untuk memudahkan pengembangan:

```
sistem-buku-tamu/
├── frontend/               # Next.js Frontend Application
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React Components
│   │   ├── lib/          # Utilities
│   │   └── types/        # TypeScript Types
│   ├── public/           # Static Assets
│   └── package.json
│
├── backend/               # Express.js Backend API
│   ├── config/           # Database Config
│   ├── migrations/       # Database Migrations
│   ├── models/          # Data Models
│   ├── services/        # Business Logic
│   ├── types/           # TypeScript Types
│   ├── database/        # SQL Setup
│   └── package.json
│
├── shared/               # Shared resources
├── API-DOCUMENTATION.md  # API Documentation
└── README.md            # This file
```

## Teknologi yang Digunakan

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Express.js
- TypeScript
- MySQL2
- Node.js

## Cara Menjalankan Development

### 1. Setup Backend

```bash
cd backend
npm install
npm run migration:run
npm run dev
```

Backend akan berjalan di `http://localhost:3001`

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=sistem_buku_tamu
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Fitur Utama

1. **Registrasi Tamu** - Form pendaftaran pengunjung
2. **Daftar Tamu** - Tampilan data pengunjung
3. **Survey Kepuasan** - Form feedback pengunjung
4. **Admin Dashboard** - Pengelolaan data dan laporan
5. **Statistik** - Data analisis kunjungan

## Database

Database menggunakan MySQL dengan struktur tabel:
- `daftar_tamu` - Data pengunjung
- `survey_questions` - Pertanyaan survey
- `survey_responses` - Jawaban survey
- `admin` - Data admin
- Dan tabel lookup lainnya

## API Documentation

Lihat file `API-DOCUMENTATION.md` untuk detail lengkap endpoint API.

## Development Guidelines

1. **Frontend Development**: Fokus pada folder `frontend/`
2. **Backend Development**: Fokus pada folder `backend/`
3. **Shared Types**: Update types di kedua folder jika ada perubahan
4. **Database Changes**: Gunakan migration files di `backend/migrations/`

## Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Kontribusi

1. Clone repository
2. Buat branch feature baru
3. Develop di folder yang sesuai (frontend/backend)
4. Test perubahan
5. Submit pull request

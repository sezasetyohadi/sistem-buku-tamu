# Sistem Buku Tamu - Backend

Backend API service untuk aplikasi Sistem Buku Tamu menggunakan Express.js dengan TypeScript.

## Teknologi yang Digunakan

- Express.js
- TypeScript
- MySQL2
- Node.js

## Struktur Folder

```
backend/
├── config/                  # Database configuration
├── migrations/              # Database migrations
├── models/                  # Data models
├── seeds/                   # Database seeds
├── services/                # Business logic
├── types/                   # TypeScript type definitions
├── database/                # SQL setup files
├── package.json
└── tsconfig.json
```

## Cara Menjalankan

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
# Jalankan migration
npm run migration:run

# Jalankan seeder (optional)
npm run seed
```

3. Jalankan development server:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

## Build untuk Production

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` menjadi `.env` dan sesuaikan konfigurasi:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=sistem_buku_tamu
PORT=3001
```

## Database Migrations

- Jalankan semua migrations: `npm run migration:run`
- Jalankan migration tertentu: `npm run migration:single`

## API Endpoints

- `GET /api/guests` - Get all guests
- `POST /api/guests` - Create new guest
- `GET /api/surveys` - Get survey data
- `POST /api/surveys` - Submit survey response

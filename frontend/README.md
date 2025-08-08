# Sistem Buku Tamu - Frontend

Frontend aplikasi Sistem Buku Tamu menggunakan Next.js 15 dengan TypeScript.

## Teknologi yang Digunakan

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React 19

## Struktur Folder

```
frontend/
├── src/
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

## Cara Menjalankan

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka browser dan akses `http://localhost:3000`

## Build untuk Production

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` menjadi `.env.local` dan sesuaikan konfigurasi:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

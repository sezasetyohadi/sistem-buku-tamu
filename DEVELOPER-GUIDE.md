# Developer Guide - Sistem Buku Tamu

## Quick Start

1. **Install Dependencies**
   ```bash
   # Jalankan script installer
   ./install-deps.bat
   
   # Atau manual:
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Setup Environment**
   - Copy `.env.example` ke `.env` di folder backend
   - Copy `.env.example` ke `.env.local` di folder frontend
   - Sesuaikan konfigurasi database

3. **Start Development**
   ```bash
   # Jalankan development script
   ./start-dev.bat
   
   # Atau manual:
   cd backend && npm run dev
   cd frontend && npm run dev  # di terminal terpisah
   ```

## Development Workflow

### Frontend Development

```bash
cd frontend
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run ESLint
```

**Struktur Frontend:**
- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions
- `src/types/` - TypeScript type definitions

### Backend Development

```bash
cd backend
npm run dev             # Start development server with auto-reload
npm run build          # Build TypeScript to JavaScript
npm run migration:run  # Run database migrations
npm run seed           # Run database seeds
```

**Struktur Backend:**
- `config/` - Database configuration
- `services/` - Business logic and API endpoints
- `models/` - Data models
- `migrations/` - Database migrations
- `types/` - TypeScript type definitions

## Database Management

### Migrations
```bash
cd backend
npm run migration:run        # Run all migrations
npm run migration:single     # Run specific migration
```

### Seeds
```bash
cd backend
npm run seed                 # Run all seeds
```

## API Development

API endpoints berada di `backend/services/`. Contoh struktur:

```typescript
// backend/services/guestService.ts
export const getAllGuests = async (req: Request, res: Response) => {
  // Logic here
};
```

## Frontend API Integration

Gunakan fetch atau library HTTP client untuk memanggil backend API:

```typescript
// frontend/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const fetchGuests = async () => {
  const response = await fetch(`${API_BASE}/api/guests`);
  return response.json();
};
```

## Shared Types

Types yang digunakan bersama berada di `types/` folder masing-masing. Pastikan sinkronisasi jika ada perubahan.

## Git Workflow

1. Buat branch feature baru
2. Develop di folder yang sesuai (frontend/backend)
3. Test perubahan
4. Commit dan push
5. Create pull request

## Troubleshooting

### Port sudah digunakan
- Frontend default: 3000
- Backend default: 3001
- Ubah di file konfigurasi jika diperlukan

### Database connection error
- Pastikan MySQL server running
- Check konfigurasi di `.env` file
- Pastikan database exists

### TypeScript errors
- Run `npm run build` untuk check errors
- Pastikan types sudah sinkron antara frontend/backend

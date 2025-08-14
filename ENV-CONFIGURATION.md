# Environment Configuration Guide

## 📋 Overview
File `.env` telah digabungkan dari `.env.admin` dan `.env.guest` untuk memudahkan konfigurasi sistem.

## 🔧 Mode Konfigurasi

### 1. **Single Mode (Default)**
Menjalankan admin dan guest dalam satu port (3000):
```bash
APP_MODE=single
PORT=3000
NEXT_PUBLIC_APP_MODE=single
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. **Admin Only Mode**
Uncomment section admin di `.env`:
```bash
APP_MODE=admin
PORT=3001
NEXT_PUBLIC_APP_MODE=admin
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. **Guest Only Mode**
Uncomment section guest di `.env`:
```bash
APP_MODE=guest
PORT=3000
NEXT_PUBLIC_APP_MODE=guest
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. **Dual Port Mode**
Untuk menjalankan admin dan guest di port terpisah:

**Terminal 1 (Admin):**
```bash
# Edit .env untuk mode admin
npm run dev:admin
```

**Terminal 2 (Guest):**
```bash
# Edit .env untuk mode guest  
npm run dev:guest
```

## 🚀 Quick Commands

```bash
# Default (single mode)
npm run dev

# Admin only
npm run dev:admin

# Guest only
npm run dev:guest

# Dual mode
npm run dev:dual
```

## 📝 Database Configuration
Konfigurasi database tetap sama untuk semua mode:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=disnaker
DB_PORT=3306
```

## 🔄 Migration dari File Terpisah
- `.env.admin` → Backup ke `.env.admin.backup`
- `.env.guest` → Backup ke `.env.guest.backup`
- Konfigurasi digabung ke `.env`

## 💡 Tips
1. Gunakan `single mode` untuk development
2. Gunakan `dual mode` untuk production
3. Copy `.env` ke `.env.local` untuk kustomisasi lokal
4. Jangan commit file `.env` yang berisi data sensitif

# Quick Deploy Guide

## Cara Deploy dengan Domain Terpisah

### Step 1: Install Vercel CLI (jika belum)
```bash
npm i -g vercel
```

### Step 2: Login ke Vercel
```bash
vercel login
```

### Step 3: Deploy Admin Panel
```bash
vercel --prod --local-config vercel-admin.json
```
**PENTING**: Saat ditanya:
- Project name: `sistem-buku-tamu-admin` 
- Link to existing project: **NO** (buat project baru)

### Step 4: Deploy Guest Portal  
```bash
vercel --prod --local-config vercel-guest.json
```
**PENTING**: Saat ditanya:
- Project name: `sistem-buku-tamu-guest`
- Link to existing project: **NO** (buat project baru)

### Step 5: Set Environment Variables
Di dashboard Vercel, untuk **KEDUA PROJECT** tambahkan env vars:

**Common Variables (untuk kedua project):**
- `DATABASE_HOST=your-database-host`
- `DATABASE_USER=your-database-user` 
- `DATABASE_PASSWORD=your-database-password`
- `DATABASE_NAME=your-database-name`
- `JWT_SECRET=your-jwt-secret`

**Admin Project Additional:**
- `APP_MODE=admin`
- `NEXT_PUBLIC_API_URL=https://sistem-buku-tamu-admin.vercel.app`

**Guest Project Additional:**
- `APP_MODE=guest`
- `NEXT_PUBLIC_API_URL=https://sistem-buku-tamu-guest.vercel.app`

### Step 6: Verify Deployment
- Admin Panel: https://sistem-buku-tamu-admin.vercel.app
- Guest Portal: https://sistem-buku-tamu-guest.vercel.app

### Step 7: Set Custom Domain (Opsional)
Di dashboard Vercel:
- Admin project: Set domain `admin.yoursite.com`
- Guest project: Set domain `www.yoursite.com`

## Troubleshooting

Jika masih deploy ke 1 domain:
1. Pastikan Anda membuat 2 project terpisah di Vercel
2. Pastikan menggunakan `--local-config` yang berbeda
3. Pastikan APP_MODE di environment variables sesuai
4. Hapus project lama jika perlu dan deploy ulang

### Result
✅ Admin Panel: Hanya bisa akses /admin routes
✅ Guest Portal: Hanya bisa akses /guest routes  
✅ Domain benar-benar terpisah!
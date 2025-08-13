# Sistem Buku Tamu - Dual Port Configuration

Sistem ini sekarang mendukung menjalankan Admin Portal dan Guest Portal pada port yang terpisah.

## Mode Penggunaan

### 1. Mode Default (Dual Mode - Kedua Server Bersamaan)
```bash
npm run dev
```
- **Admin Portal**: http://localhost:3001/admin
- **Guest Portal**: http://localhost:3000/guest

### 2. Mode Terpisah

#### Admin Only (Port 3001)
```bash
npm run dev:admin
```

#### Guest Only (Port 3000)
```bash
npm run dev:guest
```

### 3. Mode Single Port (Full Mode - Port 3000)
```bash
npm run dev:single
```

## Cara Menggunakan Script PowerShell

```powershell
# Berikan permission untuk menjalankan script
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Jalankan dual mode (sama dengan npm run dev)
.\dev-dual.ps1
```

## Environment Files

- `.env.admin` - Konfigurasi untuk admin mode
- `.env.guest` - Konfigurasi untuk guest mode  
- `.env.local` - Konfigurasi default

## Fitur Pemisahan

1. **Route Separation**: Admin dan Guest routes tidak dapat diakses lintas mode
2. **API Separation**: API endpoints dibatasi berdasarkan mode
3. **Security**: Admin authentication hanya berlaku pada admin mode
4. **Performance**: Setiap mode hanya memuat komponen yang diperlukan

## Production Build

```bash
# Build admin version
npm run build:admin

# Build guest version  
npm run build:guest

# Start admin server
npm run start:admin

# Start guest server
npm run start:guest
```

## Perubahan dari Versi Sebelumnya

- `npm run dev` sekarang menjalankan dual mode (admin + guest) secara default
- `npm run dev:single` untuk menjalankan mode single port seperti sebelumnya
- `npm run dev:dual` dihapus karena sekarang menjadi default behavior

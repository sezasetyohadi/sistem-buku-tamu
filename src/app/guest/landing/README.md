# Landing Page

**Folder:** `src/app/guest/landing/`

## Deskripsi

Ini adalah halaman landing utama sistem buku tamu DISNAKERTRANS Jawa Tengah. Halaman ini telah dipindahkan dari root (`/`) ke folder `guest/landing` untuk organisasi yang lebih baik.

## Fitur

- ✅ **Hero Section**: Logo, title, dan CTA buttons
- ✅ **Fade Animations**: Optimized untuk performa yang lebih baik
- ✅ **Features Section**: 3 cards layanan utama
- ✅ **Responsive Design**: Mobile-friendly
- ✅ **Wave Animations**: Animated background elements

## Perubahan Terbaru

### ✅ Fade Animation Improvements
- Durasi transition dipercepat dari 1000ms → 500ms
- Background section tidak lagi memiliki fade animation (langsung muncul)
- Hanya elemen content (header, cards, CTA) yang memiliki fade animation
- Intersection Observer threshold diubah ke 0.2 untuk trigger lebih responsif

### ✅ Struktur Folder
```
src/app/
├── page.tsx              # Redirect ke /guest/landing
└── guest/
    └── landing/
        └── page.tsx      # Landing page utama
```

## Navigasi

- **Root URL (`/`)**: Auto redirect ke `/guest/landing`  
- **Landing Page**: `/guest/landing`
- **Pendaftaran Tamu**: `/guest/register`
- **Survey Kepuasan**: `/guest/survey`
- **Admin Login**: `/admin/login`

## Kustomisasi

Untuk mengubah konten landing page, edit file:
```
src/app/guest/landing/page.tsx
```

Jangan ubah file `src/app/page.tsx` karena hanya berisi redirect logic.

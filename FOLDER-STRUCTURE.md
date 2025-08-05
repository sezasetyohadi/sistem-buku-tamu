# 📂 Struktur Folder - Sistem Buku Tamu

## 🏗️ Arsitektur Aplikasi
Aplikasi ini menggunakan **Next.js 15** dengan **App Router** dan **TypeScript**

## 📁 Struktur Direktori

```
sistem-buku-tamu/
├── 📄 package.json                    # Dependencies dan scripts
├── 📄 next.config.ts                  # Konfigurasi Next.js
├── 📄 tailwind.config.ts              # Konfigurasi Tailwind CSS
├── 📄 tsconfig.json                   # Konfigurasi TypeScript
├── 📄 eslint.config.mjs               # Konfigurasi ESLint
├── 📄 postcss.config.mjs              # Konfigurasi PostCSS
├── 📄 next-env.d.ts                   # Type definitions Next.js
├── 📄 README.md                       # Dokumentasi utama
├── 📄 FOLDER-STRUCTURE.md             # Dokumentasi struktur folder
│
├── 📁 public/                         # Static files
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
└── 📁 src/                           # Source code
    ├── 📁 app/                       # App Router (Next.js 13+)
    │   ├── 📄 layout.tsx             # Root layout
    │   ├── 📄 page.tsx               # Homepage
    │   ├── 📄 globals.css            # Global styles
    │   ├── 📄 favicon.ico            # Favicon
    │   │
    │   ├── 📁 register/              # Halaman pendaftaran tamu
    │   │   └── 📄 page.tsx
    │   │
    │   ├── 📁 guests/                # Halaman daftar tamu
    │   │   └── 📄 page.tsx
    │   │
    │   ├── 📁 survey/                # Halaman survey kepuasan
    │   │   └── 📄 page.tsx
    │   │
    │   ├── 📁 admin/                 # Panel admin
    │   │   ├── 📄 page.tsx           # Dashboard admin
    │   │   ├── 📁 guests/            # Manajemen tamu
    │   │   │   └── 📄 page.tsx
    │   │   ├── 📁 reports/           # Laporan dan statistik
    │   │   │   └── 📄 page.tsx
    │   │   └── 📁 services/          # Manajemen layanan
    │   │       └── 📄 page.tsx
    │   │
    │   └── 📁 api/                   # API Routes
    │       └── 📁 guests/
    │           ├── 📄 route.ts       # CRUD tamu
    │           └── 📁 [id]/
    │               └── 📄 route.ts
    │
    ├── 📁 components/                # React Components
    │   ├── 📄 GuestList.tsx          # Komponen daftar tamu
    │   │
    │   ├── 📁 ui/                    # UI Components
    │   │   ├── 📄 index.ts           # Export all UI components
    │   │   ├── 📄 PrimaryButton.tsx  # Komponen button
    │   │   ├── 📄 FormInput.tsx      # Komponen input form
    │   │   ├── 📄 FormSelect.tsx     # Komponen select form
    │   │   ├── 📄 Card.tsx           # Komponen card
    │   │   └── 📄 Modal.tsx          # Komponen modal
    │   │
    │   ├── 📁 forms/                 # Form Components
    │   │   ├── 📄 GuestRegistrationForm.tsx  # Form pendaftaran tamu
    │   │   └── 📄 SurveyFeedbackForm.tsx     # Form survey kepuasan
    │   │
    │   ├── 📁 layout/                # Layout Components
    │   │   └── 📄 Header.tsx         # Header navigasi
    │   │
    │   └── 📁 admin/                 # Admin Components
    │       └── 📄 GuestDataTable.tsx # Tabel data tamu untuk admin
    │
    ├── 📁 backend/                   # Backend Logic
    │   ├── 📁 config/
    │   │   └── 📄 db.ts              # Konfigurasi database
    │   ├── 📁 models/
    │   │   └── 📄 guestModel.ts      # Model data tamu
    │   └── 📁 services/
    │       └── 📄 guestService.ts    # Service layer untuk tamu
    │
    ├── 📁 types/                     # TypeScript Types
    │   └── 📄 guest-book-types.ts    # Interface dan type definitions
    │
    └── 📁 lib/                       # Utilities
        └── 📄 utils.ts               # Helper functions
```

## 🎯 Penjelasan Folder

### 📁 **app/** - App Router (Next.js 15)
- **layout.tsx**: Layout utama dengan header dan footer
- **page.tsx**: Homepage dengan hero section dan navigasi
- **register/**: Halaman pendaftaran tamu baru
- **guests/**: Halaman untuk melihat dan mengelola daftar tamu
- **survey/**: Halaman survey kepuasan pelayanan
- **admin/**: Panel admin dengan sub-halaman manajemen
- **api/**: API endpoints untuk backend functionality

### 📁 **components/** - React Components
- **ui/**: Komponen UI dasar yang reusable (Button, Input, Card, Modal)
- **forms/**: Komponen form untuk pendaftaran dan survey
- **layout/**: Komponen layout seperti Header
- **admin/**: Komponen khusus untuk panel admin
- **GuestList.tsx**: Komponen utama untuk menampilkan daftar tamu

### 📁 **backend/** - Backend Logic
- **config/**: Konfigurasi database dan environment
- **models/**: Model data untuk database
- **services/**: Business logic dan service layer

### 📁 **types/** - TypeScript Types
- **guest-book-types.ts**: Semua interface dan type definitions

### 📁 **lib/** - Utilities
- **utils.ts**: Helper functions dan utilities

## 🎨 **Styling & Design**
- **Tailwind CSS**: Framework CSS utility-first
- **Custom Colors**: 
  - Primary Blue: `#3D5DC3`
  - Secondary Orange: `#F29442`
  - Success Green: `#22C55E`
- **Typography**: Plus Jakarta Sans font
- **Components**: Modern design dengan gradients dan shadows

## 🔧 **Tech Stack**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **Database**: (To be configured)
- **State Management**: React hooks

## 📝 **File Naming Conventions**
- **Components**: PascalCase (e.g., `GuestList.tsx`)
- **Pages**: lowercase (e.g., `page.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Types**: kebab-case (e.g., `guest-book-types.ts`)

## 🚀 **Development**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📋 **Features by Folder**

### 🏠 **Homepage (app/page.tsx)**
- Hero section dengan branding
- Feature cards untuk navigasi
- Call-to-action buttons
- Modern gradient design

### 👤 **Registration (app/register/)**
- Form pendaftaran tamu lengkap
- Validasi form real-time
- Upload file support
- Responsive design

### 👥 **Guest Management (app/guests/)**
- Daftar tamu dengan filter
- Search functionality
- Check-in/check-out buttons
- Detail modal tamu

### 📊 **Survey (app/survey/)**
- Form survey kepuasan
- Rating system dengan bintang
- Multiple rating categories
- Feedback textarea

### 🔧 **Admin Panel (app/admin/)**
- Dashboard overview
- Guest management
- Reports and analytics
- Service management

---

**📅 Last Updated**: January 2024  
**👨‍💻 Developer**: GitHub Copilot  
**🎯 Purpose**: Sistem Buku Tamu Digital Modern

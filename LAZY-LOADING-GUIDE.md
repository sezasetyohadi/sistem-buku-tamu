# Panduan Implementasi Lazy Loading

Dokumentasi ini berisi panduan implementasi sistem lazy loading untuk meningkatkan performa aplikasi sistem buku tamu digital.

## Daftar Isi
1. [Penjelasan](#penjelasan)
2. [Komponen yang Diimplementasikan](#komponen-yang-diimplementasikan)
3. [Cara Penggunaan](#cara-penggunaan)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

## Penjelasan

Lazy loading adalah teknik optimasi web yang menunda pengambilan dan pemrosesan konten sampai benar-benar dibutuhkan, bukan di saat awal load halaman. Ini membantu:

- Mengurangi waktu load awal halaman
- Menghemat bandwidth pengguna
- Meningkatkan performa aplikasi secara keseluruhan
- Mengoptimalkan pengalaman pengguna

## Komponen yang Diimplementasikan

### 1. Dynamic Imports untuk Komponen React

Menggunakan `dynamic` dari Next.js untuk melakukan import komponen secara lazy:

```tsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(
  () => import('./Component'),
  {
    loading: () => <LoadingPlaceholder />,
    ssr: false // Jika diperlukan
  }
);
```

### 2. React Suspense dan Lazy

Menggunakan `Suspense` dan `lazy` untuk memuat komponen ketika diperlukan:

```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./Component'));

// Penggunaan
<Suspense fallback={<LoadingPlaceholder />}>
  <LazyComponent />
</Suspense>
```

### 3. Lazy Image Component

Komponen untuk lazy loading gambar yang menggunakan Intersection Observer API:

```tsx
import { LazyImage } from '@/components/ui/LazyImage';

<LazyImage 
  src="/path-to-image.jpg" 
  alt="Deskripsi gambar" 
  width={400} 
  height={300} 
/>
```

### 4. LazyDataLoader

Komponen untuk lazy loading data dari API:

```tsx
import LazyDataLoader from '@/components/ui/LazyDataLoader';

<LazyDataLoader
  loadData={() => fetchDataFromAPI()}
  renderLoading={() => <LoadingSpinner />}
  renderData={(data) => <DataComponent data={data} />}
  renderError={(error) => <ErrorMessage error={error} />}
/>
```

### 5. useLazyLoading Hook

Hook custom untuk mendeteksi kapan elemen masuk ke viewport:

```tsx
import { useLazyLoading } from '@/hooks/useLazyLoading';

const MyComponent = () => {
  const [isVisible, ref] = useLazyLoading<HTMLDivElement>();
  
  return (
    <div ref={ref}>
      {isVisible && <HeavyComponent />}
    </div>
  );
};
```

## Cara Penggunaan

### Untuk Komponen Berat

1. Gunakan Dynamic Import untuk komponen yang besar seperti form, data tables, atau visualisasi data:

```tsx
// Sebelumnya
import HeavyComponent from './HeavyComponent';

// Diganti dengan
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingPlaceholder />
});
```

### Untuk Gambar dan Media

1. Gunakan LazyImage untuk menunda loading gambar hingga mendekati viewport:

```tsx
<LazyImage 
  src="/image.jpg" 
  alt="Deskripsi" 
  width={600} 
  height={400} 
  className="rounded-lg" 
/>
```

2. Tambahkan attribute `loading="lazy"` untuk tag img standar:

```html
<img src="/logo.svg" alt="Logo" loading="lazy" />
```

### Untuk Data dan API Calls

Gunakan LazyDataLoader untuk mengambil data hanya ketika diperlukan:

```tsx
<LazyDataLoader
  loadData={() => fetchReports()}
  renderLoading={() => <ReportSkeleton />}
  renderData={(reports) => <ReportTable data={reports} />}
  dependencies={[filterParams]} // Reload saat filter berubah
/>
```

## Best Practices

1. **Prioritaskan Konten Utama**: Pastikan konten utama di atas fold dimuat terlebih dahulu
2. **Skeleton Loading**: Gunakan placeholder skeleton untuk menunjukkan konten sedang dimuat
3. **Caching**: Implementasikan caching untuk data yang jarang berubah
4. **Chunking yang Tepat**: Pecah bundle JavaScript menjadi chunk yang masuk akal secara fungsional
5. **Preload untuk Rute Penting**: Gunakan preloading untuk rute yang sering diakses
6. **Ukur Performa**: Pantau metrik Web Vitals untuk memastikan peningkatan performa

## Troubleshooting

### Masalah: Konten Berkedip Saat Loading

**Solusi**: Pastikan ukuran placeholder/skeleton sesuai dengan ukuran konten aktual

### Masalah: Komponen Tidak Muncul

**Solusi**: Periksa apakah Suspense fallback berfungsi dengan benar, dan pastikan tidak ada error saat lazy loading

### Masalah: Performa Tetap Lambat

**Solusi**:
1. Gunakan Chrome DevTools untuk mengidentifikasi bottleneck
2. Periksa waterfall request di network tab
3. Pertimbangkan strategi caching yang lebih agresif
4. Optimasi ukuran gambar dan asset lainnya

---

Untuk pertanyaan lebih lanjut, silakan hubungi tim pengembangan.

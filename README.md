# Proyek Next.js untuk VisitData Hub

Ini adalah proyek Next.js yang dibuat dengan Firebase Studio untuk mengelola dan menampilkan data kunjungan pariwisata.

## Pengaturan Awal

Sebelum menjalankan proyek, Anda perlu mengatur environment variables.

1.  **Salin `.env.local.example`:**
    Buat file baru dengan menyalin dari contoh yang ada.
    ```bash
    cp .env.local.example .env.local
    ```

2.  **Isi Environment Variables:**
    Buka file `.env.local` yang baru Anda buat dan isi semua variabel yang diperlukan, terutama konfigurasi Firebase Anda (`NEXT_PUBLIC_FIREBASE_*`) dan `FIREBASE_SERVICE_ACCOUNT_KEY`.

    `FIREBASE_SERVICE_ACCOUNT_KEY` adalah JSON kredensial yang Anda dapatkan dari Firebase Console. Pastikan untuk menempelkannya sebagai satu baris string.

## Menjalankan Server Pengembangan

Untuk menjalankan server pengembangan secara lokal:

```bash
npm install
npm run dev
```

Buka [http://localhost:9002](http://localhost:9002) di browser Anda untuk melihat hasilnya.

## Seeding Database

Untuk mengisi database dengan data awal (seperti pengguna admin), jalankan perintah berikut. Skrip ini akan membaca `FIREBASE_SERVICE_ACCOUNT_KEY` dari file `.env.local` Anda.

```bash
node seed/seed.js
```

## Ikhtisar Teknis

-   **Framework**: Next.js (dengan App Router)
-   **UI**: React, ShadCN, Tailwind CSS
-   **Database & Auth**: Firebase
-   **Fitur Utama**: Dasbor, Input Data, Laporan, Manajemen Pengguna.

# ✦ Lembaran Kenangan — Galeri & Catatan Abadi

> *"Tempat menyimpan yang tak ingin dilupakan."*

**Lembaran Kenangan** adalah website galeri foto klasik bergaya album/pameran vintage, sekaligus buku catatan hening untuk menyimpan bait puisi dan kutipan indah. Dirancang dengan prinsip **less is more**, bernuansa hangat seperti ruang perpustakaan tua dengan kertas krem gading, aksen emas redup, dan bingkai klasik murni CSS.

---

## 🏛️ Karakteristik & Fitur Unggulan

- **6 Gaya Bingkai Klasik (Murni CSS)**:
  1. *Tanpa Frame*: Foto polos berbayangan lembut realistis.
  2. *Galeri Klasik*: Bingkai hitam-cokelat tegas dengan mat krem (passe-partout).
  3. *Emas Ornamen*: Bingkai emas redup berlapis tekstur bevel.
  4. *Kayu Walnut*: Bingkai kayu cokelat tua dengan serat halus dan mat gading.
  5. *Polaroid Vintage*: Foto polaroid dengan ruang tulisan tangan di bagian bawah.
  6. *Foto Cetak Lama*: Cetakan foto tahun 1950-an dengan pinggiran gerigi halus.
- **Filter Foto Non-Destruktif**: Asli, Sepia Lembut, Hitam Putih Klasik, Pudar Hangat.
- **Kompresi Gambar di Sisi Klien**: Otomatis mengubah ukuran sisi terpanjang maks 2000px dengan kualitas ~0.85 ke format WebP/JPEG sebelum diunggah ke Supabase Storage, menghemat kuota dan mempercepat pemuatan.
- **Lightbox Interaktif**: Navigasi keyboard (panah kiri/kanan, ESC) dan gestur usap layar (*swipe*) di perangkat mobile.
- **5 Gaya Kertas Tulisan**: Gading Polos, Kertas Tua berpatina, Kertas Bergaris buku lama, Surat Klasik dengan ornamen ganda, dan Kertas Sobekan Tepi.
- **Penyimpanan Abadi**: Sinkronisasi database Postgres & Supabase Storage secara *real-time*, tidak bergantung pada *localStorage*, sehingga data tampil identik di semua perangkat.
- **Satu Akun Pemilik**: Autentikasi aman Supabase Auth tanpa pendaftaran publik.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Tipografi**: Cormorant Garamond, EB Garamond, Pinyon Script (Google Fonts via `next/font`)
- **Animasi**: Framer Motion
- **Backend & Storage**: Supabase (PostgreSQL, Supabase Storage, Supabase Auth)
- **Deployment**: Vercel

---

## 🚀 Panduan Setup Langkah Demi Langkah

### 1. Membuat Proyek di Supabase
1. Kunjungi [supabase.com](https://supabase.com) dan masuk atau buat akun baru.
2. Buat proyek baru (*New Project*), tentukan nama proyek (misal: `lembaran-kenangan`) dan buat password database yang kuat.
3. Buka menu **SQL Editor** pada sidebar kiri dashboard Supabase.
4. Buka berkas `supabase/schema.sql` dari repositori ini, salin seluruh kodenya, tempel ke dalam SQL Editor Supabase, lalu klik **Run**.
   - Skrip ini akan membuat tabel `photos` dan `notes` dengan *Row Level Security* (RLS).
   - Skrip juga otomatis membuat Storage Bucket bernama `photos` beserta kebijakan izin aksesnya (*policies*).
5. Pastikan di menu **Storage** terdapat bucket bernama `photos` dengan status *Public*.

### 2. Membuat Akun Pemilik & Menutup Pendaftaran Publik
1. Masuk ke menu **Authentication** -> **Users** di dashboard Supabase.
2. Klik tombol **Add User** -> **Create User**.
3. Masukkan surel (email) pemilik dan kata sandi yang Anda tentukan. Pastikan opsi *Auto Confirm User* dicentang (aktif).
4. **Penting**: Masuk ke menu **Authentication** -> **Providers** -> **Email**. Nonaktifkan pilihan **"Allow new users to sign up"** agar orang luar tidak dapat mendaftar. Dengan begitu, hanya Anda satu-satunya pemilik yang dapat mengelola arsip.

### 3. Konfigurasi Variabel Lingkungan (`.env.local`)
1. Salin berkas `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Dapatkan API Keys dari dashboard Supabase pada menu **Project Settings** -> **API**:
   - `Project URL`: Masukkan ke `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key`: Masukkan ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Pengaturan visibilitas galeri:
   - `NEXT_PUBLIC_PUBLIC_VIEW=true`: Siapa saja yang membuka link website dapat melihat galeri dan tulisan (mode pameran publik).
   - `NEXT_PUBLIC_PUBLIC_VIEW=false`: Hanya pemilik yang login yang dapat melihat galeri dan tulisan (mode album privat murni).

Contoh isi `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_PUBLIC_VIEW=true
```

### 4. Menjalankan di Komputer Lokal
Jalankan perintah berikut di terminal:
```bash
# Pasang dependensi
npm install

# Jalankan server pengembangan lokal
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 5. Deploy ke Vercel
1. Simpan dan dorong (*push*) repositori Anda ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi lembaran kenangan"
   git branch -M main
   git remote add origin https://github.com/username/lembaran-kenangan.git
   git push -u origin main
   ```
2. Buka [vercel.com](https://vercel.com) dan klik **Add New** -> **Project**.
3. Impor repositori GitHub tersebut.
4. Pada bagian **Environment Variables**, tambahkan ketiga variabel yang sama dengan `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_PUBLIC_VIEW`
5. Klik tombol **Deploy**. Dalam beberapa saat website Anda sudah tayang di internet!

### 6. Menguji Sinkronisasi di Perangkat Lain
1. Buka tautan website Vercel di laptop Anda, masuk ke halaman `/masuk`, masukkan surel dan kata sandi pemilik.
2. Masuk ke halaman **Galeri**, klik tombol **+ Tambah Foto**, unggah foto, pilih bingkai `Kayu Walnut` dan filter `Sepia Lembut`, lalu simpan.
3. Masuk ke halaman **Tulisan**, klik **+ Tulis Baru**, tulis sebuah bait puisi, pilih gaya kertas `Kertas Tua` dan tinta `Cokelat Tua`, lalu simpan.
4. Buka tautan website yang sama melalui smartphone atau peramban lain tanpa login.
5. Perhatikan bahwa foto, bingkai, puisi, dan rotasi alami tampil **identik 100%** karena seluruh data bersumber dari database PostgreSQL Supabase, bukan disimpan di *localStorage*.

---

## 📁 Struktur Direktori

```text
├── app/
│   ├── galeri/page.tsx      # Galeri foto & filter tahun
│   ├── tulisan/page.tsx     # Lembaran puisi, kutipan & pencarian
│   ├── masuk/page.tsx       # Ruang login pemilik
│   ├── globals.css          # Palet vintage, 6 bingkai & 5 kertas CSS
│   ├── layout.tsx           # Layout root, Google Fonts, grain texture
│   └── page.tsx             # Beranda & dinding kenangan
├── components/
│   ├── EditPhotoModal.tsx   # Modal sunting & hapus foto
│   ├── Footer.tsx           # Footer klasik berornamen bintang
│   ├── FrameWrapper.tsx     # Komponen 6 bingkai murni CSS
│   ├── Lightbox.tsx         # Lightbox foto (keyboard & swipe)
│   ├── Navbar.tsx           # Navigasi minimalis & status auth
│   ├── NoteCard.tsx         # Kartu lembaran puisi & kutipan
│   ├── NoteReaderModal.tsx  # Modal baca puisi ukuran penuh
│   ├── PaperEditor.tsx      # Editor kertas puisi live-preview
│   ├── PhotoCard.tsx        # Kartu foto galeri
│   ├── Toast.tsx            # Notifikasi toast halus
│   └── UploadPanel.tsx      # Panel unggah banyak foto & kompresi
├── lib/
│   ├── date.ts              # Format tanggal puitis bahasa Indonesia
│   ├── image-compression.ts # Utilitas kompresi canvas ke WebP/JPEG
│   ├── seed-data.ts         # Data awal contoh estetik
│   ├── types.ts             # Definisi tipe TypeScript
│   └── supabase/            # Client, server, dan middleware Supabase
├── supabase/
│   └── schema.sql           # Skema DDL tabel dan storage Supabase
├── .env.example             # Contoh konfigurasi environment
├── middleware.ts            # Middleware pelindung auth Supabase
└── README.md
```

---

*Disusun dengan penuh rasa dan keheningan untuk Lembaran Kenangan.*

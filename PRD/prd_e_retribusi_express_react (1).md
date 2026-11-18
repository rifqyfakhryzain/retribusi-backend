# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Fokus: MVP & Pembelajaran Arsitektur Modular (Express.js + React.js)**

**Nama Produk:** Aplikasi Monitoring Retribusi Pasar (Anti-Pungli)  
**Arsitektur:** Terpisah (*API-Driven / Decoupled*) – *Modular Architecture*  
**Tumpukan Teknologi:** Node.js (Express.js) + React.js + PostgreSQL  
**Target Institusi:** UPTD Pasar Cicalengka  
**Tujuan Pengerjaan:** *Minimum Viable Product* (MVP) untuk riset awal, media pembelajaran (*learning by doing*), & demonstrasi dosen.

---

## 1. Ringkasan Produk (Product Overview)
Aplikasi ini adalah sistem deteksi kecurangan (*fraud detection*) dan pemantauan e-retribusi pasar berskala B2B/B2G. Sistem ini menggantikan rekapitulasi manual dengan komputasi spasial (*Geofencing*) dan Kriptografi (QR Code) untuk memastikan petugas menagih retribusi secara jujur di depan lapak pedagang. Seluruh pergerakan uang setoran dipantau detik itu juga (*real-time*) di dasbor pusat.

## 2. Profil Pengguna (User Personas)
*   **Kepala UPTD / Manajer Operasional (Desktop):** Mengakses dasbor web dari kantor untuk memantau pergerakan uang retribusi secara *real-time* dan mencocokkan total setoran dengan uang tunai fisik di sore hari.
*   **Petugas Penagih (Mobile Web):** Mengakses pemindai dari peramban (Google Chrome/Safari) di ponsel pintar. Bertugas memindai stiker QR di kios dan mengonfirmasi pelunasan tanpa perlu mengunduh aplikasi tambahan (APK).
*   **Pedagang (Pasif):** Memiliki stiker QR Code unik terenkripsi yang tertempel di tiang kios/losnya.

## 3. Target Pembelajaran (Learning by Doing)
Pengembangan dilakukan secara bertahap agar ramah untuk pemula di ekosistem Node.js/React:
*   **Fase 1 (Dasar Backend & DB):** Menyalakan server Express, merancang tabel PostgreSQL dengan Prisma ORM, dan membuat API REST sederhana.
*   **Fase 2 (Antarmuka React):** Membangun UI dengan Vite + Tailwind CSS dan memanggil API dari Fase 1 menggunakan Axios.
*   **Fase 3 (Kriptografi QR):** Membangun logika pembuatan token *Digital Signature* di backend dan mencetaknya menjadi gambar QR Code.
*   **Fase 4 (Sensor Hardware):** Mengaktifkan pustaka `html5-qrcode` dan menarik HTML5 Geolocation API langsung dari peramban ponsel.
*   **Fase 5 (Algoritma Spasial):** Menulis logika matematika (*Geofencing*) dan menerapkannya di *Controller* Express.
*   **Fase 6 (Sinkronisasi WebSockets):** Mengimplementasikan `socket.io` agar dasbor pimpinan berubah angkanya tanpa memuat ulang (*refresh*) halaman.

## 4. Tumpukan Teknologi & Infrastruktur (Deployment MVP)
*   **Frontend (React.js via Vite):**
    *   *Pustaka:* Tailwind CSS, `html5-qrcode`, HTML5 Geolocation API, `axios`, `socket.io-client`.
    *   *Hosting:* **Vercel** (Gratis, kompilasi otomatis dari GitHub, menyediakan HTTPS murni sebagai syarat wajib akses kamera/GPS).
*   **Backend (Express.js):**
    *   *Pustaka:* `prisma` (ORM), `jsonwebtoken` (JWT Auth), `socket.io` (Pemicu Real-Time), `qrcode` (Pembuat stiker).
    *   *Hosting:* **Render.com** (Mendukung WebSockets. Dibantu *cron-job.org* agar server tidak tertidur selama jam operasional).
*   **Database (PostgreSQL):**
    *   *Hosting:* **Neon DB** (Sistem cloud *serverless* gratis 500MB, bebas *auto-pause* mingguan, kompatibel dengan Prisma).

## 5. Keputusan Arsitektur & Struktur Folder
Aplikasi ini menggunakan **Modular Architecture (Domain-Driven Design)** untuk mencegah *Spaghetti Code*, memudahkan pencarian *error*, dan memungkinkan pengembangan per modul.

**A. Struktur Backend (Express.js)**
```text
backend-retribusi/
├── prisma/                  # Konfigurasi skema database PostgreSQL
├── src/
│   ├── config/              # Variabel lingkungan & koneksi DB
│   ├── middlewares/         # Penjaga gerbang API (misal: JWT Auth)
│   ├── modules/             # [FOKUS UTAMA] Laci fitur aplikasi
│   │   ├── auth/            # Modul login (Route, Controller, Service)
│   │   ├── qrcode/          # Modul enkripsi & pembuatan stiker QR
│   │   └── retribusi/       # Modul perhitungan Geofencing & Setoran
│   ├── app.js               # Pengatur lalu lintas URL (Router)
│   └── server.js            # Entry point menyalakan Express & Socket.io
├── .env                     # Kunci rahasia server
└── package.json
```

**B. Struktur Frontend (React.js)**
```text
frontend-retribusi/
├── src/
│   ├── assets/              # Gambar statis & Logo
│   ├── components/          # Elemen UI Global (Tombol standar, Modal)
│   ├── features/            # [FOKUS UTAMA] Laci antarmuka aplikasi
│   │   ├── auth/            # Tampilan Halaman Login
│   │   ├── scanner/         # Tampilan Kamera html5-qrcode & Tarik GPS
│   │   └── dashboard/       # Tampilan Dasbor Real-time Kepala UPTD
│   ├── services/            # Konfigurasi Axios menembak API Express
│   ├── App.jsx              # Pengatur perpindahan halaman (React Router)
│   └── main.jsx             # Entry point Vite
├── index.html
├── tailwind.config.js
└── package.json
```

## 6. Kebutuhan Fitur Inti & Aturan Logika (Core Features)

*   **Modul Kriptografi QR Code (Backend):** Express.js menggabungkan `ID Kios`, `Lantai`, dan `Secret Key` menjadi token *hash* terenkripsi. Pustaka `qrcode` mengubahnya menjadi berkas PNG siap cetak untuk mencegah pemalsuan stiker.
*   **Modul Kamera & Sensor Spasial (Frontend):** Saat memindai QR, React memanggil `navigator.geolocation.getCurrentPosition()` untuk menarik titik Latitude, Longitude, dan Accuracy tepat pada milidetik yang sama.
*   **Modul Validasi Geofencing (Backend):**
    1.  *Batas Poligon:* Menggunakan algoritma *Point-in-Polygon* mengikuti bentuk batas gedung Pasar Cicalengka.
    2.  *Toleransi Sinyal (Buffer Zone):* Pelebaran batas poligon sebesar **5 meter** ke luar gedung untuk antisipasi pergeseran sinyal satelit.
    3.  *Blokir Akurasi Rendah:* Jika nilai `accuracy` ponsel > **20 meter**, transaksi ditolak.
    4.  *Bypass Khusus Basement:* Jika QR Code yang dipindai mengandung parameter `lantai=basement` (area *blind spot* GPS), validasi jarak dimatikan. Transaksi disahkan murni dari keaslian kriptografi QR Code.
*   **Modul Dasbor Real-Time (Full-stack):** Setelah transaksi dinyatakan "Lunas" di Neon DB, Express.js mengeksekusi `socket.emit()`. Dasbor React langsung menangkap siaran tersebut dan seketika menambah angka retribusi tanpa me-*refresh* halaman.

## 7. Kriteria Keberhasilan Eksperimen (Target MVP Minggu Ke-8)
Prototipe awal ini dianggap berhasil untuk uji coba demonstrasi jika:
1.  **Akses Sensor Aman (HTTPS):** Aplikasi diakses melalui URL Vercel di HP dan berhasil membuka kamera tanpa error *Secure Context*.
2.  **Penolakan Spasial Cerdas:** Pindaian uji coba di luar lokasi (misal: di kampus/rumah) otomatis ditolak dengan pesan "Berada di Luar Radius Pasar".
3.  **Sinkronisasi Soket Instan:** Menekan tombol "Konfirmasi Lunas" dari HP akan menambah angka/grafik di Dasbor web komputer secara otomatis dalam jeda maksimal 2 detik.
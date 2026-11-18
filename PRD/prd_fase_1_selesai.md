# DOKUMENTASI PROGRESS & KONTRAK API FASE 1
**Proyek:** Aplikasi Monitoring Retribusi Pasar Cicalengka (Anti-Pungli)  
**Status Fase 1:** SELESAI (100%) – Siap Dilanjutkan ke Fase 2 (Frontend React)  
**Tanggal Penyelesaian:** 18 November 2026  

---

## 1. Ringkasan Eksekutif Fase 1
Fase 1 berfokus pada pembangunan fondasi backend yang modular, integrasi database cloud PostgreSQL, dan implementasi modul autentikasi aman berbasis JWT dan Bcrypt.

---

## 2. Daftar Dependensi / Pustaka yang Di-install & Fungsinya

Berikut rincian seluruh paket (*npm packages*) yang telah dipasang pada `package.json` beserta alasan dan peran teknisnya:

### A. Inti Server & Jaringan (Core Web Framework)
1. **`express` (^5.3.0)**
   * **Fungsi:** Kerangka kerja (*framework*) utama backend Node.js.
   * **Peran:** Mengatur rute URL (*routing*), menangani siklus request-response HTTP, dan mengelola middleware.
2. **`cors` (^2.8.6)**
   * **Fungsi:** *Cross-Origin Resource Sharing* middleware.
   * **Peran:** Mengizinkan aplikasi antarmuka React (yang berjalan di `http://localhost:5173`) untuk menembak API backend Express (di `http://localhost:3000`) tanpa diblokir oleh peramban web (*browser*).
3. **`dotenv` (^18.0.10)**
   * **Fungsi:** Pengelola variabel lingkungan (*Environment Variables*).
   * **Peran:** Mengambil data rahasia dari berkas `.env` (seperti kredensial `DATABASE_URL` dan `JWT_SECRET`) dan memuatnya ke dalam memori aplikasi `process.env`.

### B. Lapisan Database & ORM (Prisma 7 + Neon DB)
4. **`prisma` (^7.10.1) [devDependencies]**
   * **Fungsi:** *Command Line Interface* (CLI) resmi Prisma.
   * **Peran:** Menjalankan perintah perkakas developer seperti `npx prisma db push` (sinkronisasi tabel ke PostgreSQL) dan `npx prisma generate` (merakit client).
5. **`@prisma/client` (^7.10.1)**
   * **Fungsi:** Mesin ORM (*Object-Relational Mapping*) yang diakses dari kode JavaScript.
   * **Peran:** Menyediakan fungsi kueri database yang *type-safe* tanpa menulis kueri SQL mentah (contoh: `prisma.user.findUnique()`, `prisma.user.create()`).
6. **`pg` (^8.23.1)**
   * **Fungsi:** Driver PostgreSQL asli (*native*) untuk Node.js.
   * **Peran:** Mengelola kolam koneksi (*Connection Pooling*) ke Neon DB via `pg.Pool` agar kueri cepat dan tidak boros memori.
7. **`@prisma/adapter-pg` (^7.10.1)**
   * **Fungsi:** Jembatan resmi arsitektur Prisma 7.
   * **Peran:** Menghubungkan eksekusi kueri `@prisma/client` dengan driver `pg.Pool`.

### C. Keamanan, Kriptografi, & Validasi (Security)
8. **`bcrypt` (^5.1.1 / ^6.x)**
   * **Fungsi:** Pustaka algoritma *one-way cryptographic hash*.
   * **Peran:** Mengacak kata sandi akun sebelum disimpan ke database menggunakan *Salt Rounds: 10* (`bcrypt.hash`), serta mencocokkan password saat petugas login (`bcrypt.compare`).
9. **`jsonwebtoken` (^9.0.3)**
   * **Fungsi:** Pustaka penerbitan dan verifikasi *JSON Web Token* (JWT).
   * **Peran:** Menerbitkan tiket digital terenkripsi (algoritma HS256, masa aktif 1 jam) yang dibawa oleh klien (HP Petugas/PC Admin) untuk membuktikan identitas tanpa perlu menyimpan sesi di server (*stateless*).
10. **`zod` (^4.6.7)**
    * **Fungsi:** *Schema declaration & validation library*.
    * **Peran:** Menjadi satpam di middleware (`validator.js`) untuk memvalidasi format data JSON yang masuk dari luar sebelum diteruskan ke controller/database.

### D. Perangkat Pengembang & Real-Time (DevTools & Real-time)
11. **`nodemon` (^3.1.14) [devDependencies]**
    * **Fungsi:** *Live-reload monitor* server.
    * **Peran:** Otomatis memuat ulang server Node.js setiap kali ada file kode yang diubah dan disimpan, tanpa harus mematikan dan menyalakan terminal secara manual.
12. **`socket.io` (^4.8.4)**
    * **Fungsi:** Pustaka komunikasi dua arah berbasis WebSocket.
    * **Peran:** *Dipersiapkan untuk Fase 6:* Menyiarkan notifikasi pelunasan retribusi secara detik itu juga (*real-time*) ke layar dasbor Kepala UPTD tanpa refresh halaman.

---

## 3. Struktur Folder Backend yang Telah Terbentuk
```text
retribusi-backend/
├── prisma/
│   ├── seeds/
│   │   └── user.seed.js        # Logika seeding data admin & petugas dengan hash
│   ├── schema.prisma           # Skema tabel PostgreSQL
│   └── seed.js                 # Konduktor utama eksekusi seeder
├── src/
│   ├── config/
│   │   └── prisma.js           # Singleton koneksi database (Prisma 7 + Pool adapter)
│   ├── middlewares/
│   │   └── validator.js        # Middleware penjaga gerbang skema Zod
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js  # Pengendali HTTP request/response
│   │   │   ├── auth.route.js       # Pengatur rute URL endpoint auth
│   │   │   ├── auth.schema.js      # Aturan validasi input Zod
│   │   │   └── auth.service.js     # Logika bisnis pencocokan password & JWT
│   │   ├── qrcode/             # [Fase 3] Modul enkripsi & pembuatan QR
│   │   └── retribusi/          # [Fase 5] Modul spasial & setoran
│   ├── app.js                  # Konfigurasi middleware Express (CORS, JSON, Routes)
│   └── server.js               # Entry point penyalaan HTTP Server
├── .env                        # Variabel rahasia (DATABASE_URL, JWT_SECRET, PORT)
├── .gitignore                  # Melindungi node_modules, .env, dll.
├── prisma.config.ts            # Konfigurasi Prisma 7
└── package.json
```

---

## 4. Skema Database yang Aktif di Neon DB (`schema.prisma`)
Tabel `user` dan tipe data enumerasi `Role` telah terpasang dan sinkron di cloud database:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  ADMIN
  PETUGAS
}

model user {
  id         Int      @id @default(autoincrement())
  nama       String
  username   String   @unique
  password   String   // Tersimpan dalam bentuk hash bcrypt (60 karakter)
  role       Role     @default(PETUGAS)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

---

## 5. Akun Pengujian (Hasil Seeder Database)
Gunakan akun ini saat menguji login di Frontend (Fase 2):

| Peran (Role) | Nama Lengkap | Username | Password Mentah | Peruntukan di Fase 2 |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Admin Pasar Cicalengka | `admin_cicalengka` | `admincicalengka` | Masuk ke Dasbor Monitoring Desktop |
| **PETUGAS** | Petugas Lapangan 1 | `petugas` | `petugas123` | Masuk ke Antarmuka Scanner HP |

*Catatan: Jalankan `node prisma/seed.js` kapan saja jika ingin mereset kedua akun ini ke kondisi awal.*

---

## 6. Kontrak API (API Specifications) untuk Frontend Fase 2

### Endpoint: Login Petugas / Admin
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/auth/login`
* **Headers:**  
  `Content-Type: application/json`

#### Request Body (JSON):
```json
{
  "username": "petugas",
  "password": "petugas123"
}
```

#### Response Berhasil (HTTP 200 OK):
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJwZXR1Z2FzIiwiaWF0IjoxNzk0OTk1MzM1LCJleHAiOjE3OTQ5OTg5MzV9..."
  }
}
```

#### Isi Payload Token JWT (Decoded):
```json
{
  "id": 3,
  "username": "petugas",
  "iat": 1794995335,
  "exp": 1794998935
}
```

#### Response Gagal (HTTP 400 Bad Request - Validasi Gagal):
```json
{
  "status": "error",
  "message": "Username tidak boleh kosong" // atau "Password harus memiliki minimal 6 karakter!"
}
```

#### Response Gagal (HTTP 401 Unauthorized - Akun/Password Salah):
```json
{
  "status": "error",
  "message": "Username tidak ditemukan" // atau "Password salah"
}
```

---

## 7. Petunjuk Integrasi untuk Frontend (Fase 2)
Saat merakit frontend di `retribusi-frontend` menggunakan Vite + React + Tailwind:

1. **CORS:** Backend sudah mengaktifkan `cors()`, sehingga frontend di port `http://localhost:5173` dapat langsung menembak backend di port `http://localhost:3000`.
2. **Klien HTTP:** Gunakan `axios` dengan base URL:
   ```javascript
   const api = axios.create({
     baseURL: "http://localhost:3000/api"
   });
   ```
3. **Penyimpanan Token:** Simpan string `token` di `localStorage.setItem("token", token)` setelah login berhasil.
4. **Header Otentikasi (Untuk Rute yang Dilindungi):**
   ```javascript
   headers: {
     Authorization: `Bearer ${token}`
   }
   ```
5. **Dua Tampilan Utama Fase 2:**
   - Halaman Login (Form input username, password, dan error feedback).
   - Penentu Arah Halaman (*Routing Guard*): Petugas diarahkan ke halaman pemindai, Admin diarahkan ke halaman dasbor.

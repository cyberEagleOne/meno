# Meno — Matriks Pemenuhan Checkpoint Tugas Dosen (P1 – P7)

Dokumen ini disusun sebagai panduan bagi mahasiswa dan reviewer/dosen penguji untuk memverifikasi pemenuhan seluruh kriteria checkpoint (P1 hingga P7) pada proyek **Meno**.

---

## 1. Ringkasan Status Checkpoint

| Checkpoint | Deskripsi Tugas | Status | Bukti Kode / Implementasi | Bukti Pengujian |
|---|---|:---:|---|---|
| **P1** | `README.md`: 6 Output Wajib (Masalah, Target, Manfaat, Fitur Inti, Out of Scope, Kriteria Sukses) | ✅ **100% LENGKAP** | [`README.md`](../README.md) (Bagian Ringkasan Proyek P1) | Dokumentasi langsung |
| **P2** | `Architecture.md`: Arsitektur, Stack, Data Models, Database Rules, Folder Structure | ✅ **100% LENGKAP** | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) (336 baris, schema SQLite, layering) | Struktur terverifikasi |
| **P3** | Generate Arsitektur / Prototype & Run: Struktur rapi, routing, F5 jalan di emulator | ✅ **100% LENGKAP** | `src/app/`, `src/components/ui/`, routing Expo Router | Berjalan di Android Emulator & Expo Go |
| **P4** | State Management: 2 fitur, 6 kondisi UI, validasi form, anti double-tap | ✅ **100% LENGKAP** | [`src/app/settings.tsx`](../src/app/settings.tsx) & [`src/data/progressContext.tsx`](../src/data/progressContext.tsx) | `settingsValidation.test.ts` & `readerCompletion.test.tsx` |
| **P5** | Local Data & Persistence: SQLite, Model data, CRUD, survives restart | ✅ **100% LENGKAP** | [`src/data/db.ts`](../src/data/db.ts) & [`src/data/sqliteDriver.ts`](../src/data/sqliteDriver.ts) | `db.test.ts` & `dbCompletion.test.ts` |
| **P6** | Integrasi API & Unit Test: Repository, Model, loading/empty/error/retry + 6 unit test | ✅ **100% LENGKAP** | [`src/data/dailyVerseRepository.ts`](../src/data/dailyVerseRepository.ts) & [`src/components/ui/DailyVerseCard.tsx`](../src/components/ui/DailyVerseCard.tsx) | `dailyVerse.test.ts` (6/6 skenario lulus) |
| **P7** | MVP Lengkap + 3 Advanced Features (Notifikasi, Sensor Accelerometer, Autentikasi Biometrik) | ✅ **100% LENGKAP** | [`src/services/notificationService.ts`](../src/services/notificationService.ts), [`src/services/sensorService.ts`](../src/services/sensorService.ts), [`src/services/authService.ts`](../src/services/authService.ts) | Layar UI [`src/app/settings.tsx`](../src/app/settings.tsx) |

---

## 2. Rincian Teknis & Panduan Menjawab Reviewer

### Checkpoint P1: `README.md`
- **Lokasi Kode**: [`README.md`](../README.md)
- **Cara Menjelaskan ke Reviewer**:
  Buka file `README.md`. Tunjukkan 6 subjudul wajib yang telah ditulis dalam bahasa Indonesia:
  1. *Deskripsi Masalah*: Menjelaskan dikotomi aplikasi Alkitab saat ini (terlalu kaku vs terlalu banyak gamifikasi bising).
  2. *Profil Target Pengguna*: Returning Reader & New Reader.
  3. *Manfaat Aplikasi*: One-tap resume, idempotent progress, penyimpanan lokal, kendali pembaca, dorongan tanpa stres.
  4. *Daftar Fitur Inti*: Pembaca Alkitab, SQLite progress tracking, Ayat Harian online, dan Fitur Lanjutan OS.
  5. *Fitur yang Tidak Dikerjakan*: Cloud sync, leaderboard, audio, monetisasi.
  6. *Kriteria Aplikasi Berhasil*: Kelengkapan navigasi, persistensi SQLite, 83 automated tests lulus, UI responsif.

---

### Checkpoint P2: `Architecture.md`
- **Lokasi Kode**: [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
- **Cara Menjelaskan ke Reviewer**:
  - Tunjukkan diagram arsitektur 4-layer: `UI Screens (Expo Router)` → `State/Context (ProgressProvider)` → `Domain Layer (Pure TypeScript)` → `Data Layer (SQLite & Driver Seam)`.
  - Jelaskan skema database pada §3.1: Tabel `last_read`, `completed`, dan `reading_day` dengan aturan idempotensi (BR-1).

---

### Checkpoint P3: Struktur Proyek & Eksekusi Aplikasi
- **Lokasi Kode**: Direktori `src/`
- **Cara Menjelaskan ke Reviewer**:
  - Tunjukkan kerapian folder:
    - `src/app/`: File-based navigation.
    - `src/components/ui/`: Reusable components (`Button`, `Card`, `ProgressRing`, `Mascot`, `DailyVerseCard`, dll.).
    - `src/domain/`: Pure business logic dan model TypeScript.
    - `src/data/`: Modul SQLite dan API repository.
  - Jalankan aplikasi di hadapan reviewer menggunakan perintah:
    ```bash
    npx expo start --android
    ```

---

### Checkpoint P4: State Management & 6 Kondisi UI
- **Lokasi Kode**:
  - Form & UI States: [`src/app/settings.tsx`](../src/app/settings.tsx)
  - State Management Progress: [`src/data/progressContext.tsx`](../src/data/progressContext.tsx)
  - Domain Validation: [`src/domain/settingsValidation.ts`](../src/domain/settingsValidation.ts)
- **Cara Menjelaskan 6 Kondisi UI ke Reviewer**:
  1. **Initial Loading State**: Saat membuka Pengaturan, indikator spinner memuat data preferensi tersimpan.
  2. **Data Berhasil Dimuat**: Kotak *"Target Aktif"* menampilkan target pasal dan catatan komitmen pembaca.
  3. **Empty State**: Kotak kuning *"Belum ada target membaca yang disimpan"* jika data masih kosong.
  4. **Error State dengan Tombol Retry**: Kotak merah dengan tombol *"Coba Lagi"* saat simulasi kegagalan penyimpanan.
  5. **Validasi Input pada Form**: Pesan error merah di bawah input saat target diisi bukan angka 1-50 atau catatan < 5 karakter.
  6. **Loading saat Proses Submit (Anti Double-Tap)**: Tombol *"Menyimpan..."* mematikan aksi klik (`disabled={isSubmitting}`) sehingga pengguna tidak dapat melakukan double-tap.

---

### Checkpoint P5: Local Data & Persistence
- **Lokasi Kode**:
  - SQLite Driver: [`src/data/sqliteDriver.ts`](../src/data/sqliteDriver.ts)
  - Operasi CRUD: [`src/data/db.ts`](../src/data/db.ts)
- **Cara Menjelaskan ke Reviewer**:
  - **Create / Update**: `markCompleted()` menulis ke tabel `completed` & `reading_day`. `saveLastRead()` menyimpan kitab/pasal/scroll terakhir.
  - **Read**: `loadProgress()` mengeksekusi `SELECT` untuk memuat seluruh status saat aplikasi dibuka.
  - **Delete**: `unmarkCompleted()` menghapus baris dari tabel `completed`.
  - **Persistence Proof**: Tunjukkan test otomatis di [`src/data/__tests__/db.test.ts`](../src/data/__tests__/db.test.ts) dan demonstrasikan langsung dengan menutup paksa Expo Go lalu membukanya kembali (data tetap ada).

---

### Checkpoint P6: Integrasi API dan Vertical Slice
- **Lokasi Kode**:
  - Domain Model: [`src/domain/dailyVerse.ts`](../src/domain/dailyVerse.ts)
  - Repository API: [`src/data/dailyVerseRepository.ts`](../src/data/dailyVerseRepository.ts)
  - UI Component: [`src/components/ui/DailyVerseCard.tsx`](../src/components/ui/DailyVerseCard.tsx)
  - Unit Tests: [`src/data/__tests__/dailyVerse.test.ts`](../src/data/__tests__/dailyVerse.test.ts)
- **Cara Menjelaskan ke Reviewer**:
  - Fitur: **Ayat Harian (Daily Verse Online)** yang mengambil data langsung dari public REST API (`https://bible-api.com/john+3:16`).
  - Kondisi UI: Menampilkan loading spinner, teks ayat & referensi saat sukses, pesan error + tombol *"Coba Lagi"* jika koneksi terputus.
  - **6 Unit Test Wajib**:
    1. *Model Valid*: Memastikan payload valid ter-parse ke objek `DailyVerse`.
    2. *Model Invalid*: Memastikan data tanpa teks/referensi melempar `DailyVerseValidationError`.
    3. *API Sukses*: Memastikan respons HTTP 200 diproses dengan benar.
    4. *Data Kosong*: Memastikan body kosong mengembalikan `null` (empty state).
    5. *HTTP Gagal*: Memastikan status 500 / network error melempar `ApiHttpError`.
    6. *JSON Rusak*: Memastikan string non-JSON melempar `ApiJsonError`.

---

### Checkpoint P7: MVP Lengkap & 3 Advanced Features
- **Lokasi Kode**:
  - Layar Pengaturan & Fitur: [`src/app/settings.tsx`](../src/app/settings.tsx)
  - Notifikasi: [`src/services/notificationService.ts`](../src/services/notificationService.ts) (`expo-notifications`)
  - Sensor Gerak: [`src/services/sensorService.ts`](../src/services/sensorService.ts) (`expo-sensors`)
  - Autentikasi Biometrik: [`src/services/authService.ts`](../src/services/authService.ts) (`expo-local-authentication`)
- **Penjelasan 3 Fitur Advanced**:
  1. **Notifikasi Pengingat Membaca Harian (`expo-notifications`)**:
     - *Manfaat*: Membantu pengguna membangun disiplin waktu membaca Alkitab di jam yang tenang setiap hari (pk 07:00).
     - *Penanganan Izin*: Meminta izin notifikasi OS, menangani jika ditolak, serta menyediakan tombol *"Uji Notifikasi Sekarang"*.
  2. **Sensor Gerak Accelerometer / Shake (`expo-sensors`)**:
     - *Manfaat*: Membuka pasal Alkitab secara acak ketika pengguna menggoyangkan perangkat (interaksi kinestetik yang menyenangkan).
     - *Penanganan*: Toggle on/off sensor, debouncing goyangan, dan tombol simulasi goyang untuk emulator.
  3. **Kunci Privasi Aplikasi dengan Biometrik / PIN (`expo-local-authentication`)**:
     - *Manfaat*: Melindungi privasi catatan komitmen dan perjalanan rohani pengguna menggunakan sidik jari / Face ID / PIN perangkat.
     - *Penanganan*: Cek hardware, penanganan pembatalan (*cancellation*), serta status hasil autentikasi.

---

## 3. Hasil Eksekusi Test Suite (Total 83 Tests Lulus)

Jalankan perintah pengujian:
```bash
npx jest --runInBand
```

Hasil:
```text
PASS src/domain/__tests__/settingsValidation.test.ts (P4 validation)
PASS src/data/__tests__/dailyVerse.test.ts (P6 6 scenarios)
PASS src/app/reader/__tests__/readerCompletion.test.tsx
PASS src/domain/__tests__/bibleNavigation.test.ts
PASS src/data/__tests__/canon.test.ts
PASS src/data/__tests__/dbCompletion.test.ts
PASS src/data/__tests__/progressContext.test.tsx
PASS src/domain/__tests__/progress.test.ts
PASS src/data/__tests__/db.test.ts

Test Suites: 9 passed, 9 total
Tests:       83 passed, 83 total
Snapshots:   0 total
```

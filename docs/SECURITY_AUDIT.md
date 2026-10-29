# Meno — Laporan Hasil Uji Security dan Catatan Perubahan

| Dokumen | Nilai |
|---|---|
| Status Dokumen | Final — Siap Diuji & Dievaluasi Dosen |
| Tanggal Pengujian | 2026-10-30 |
| Versi Aplikasi | 1.0.0 (Meno MVP) |
| Environment | Node v22.23.3, Expo SDK 57, React Native 0.86, SQLite 57.0.4 |

---

## 1. Ringkasan Eksekutif Keamanan

Aplikasi **Meno** dirancang dengan filosofi **Privacy-First** dan **Offline-First**. Berbeda dengan aplikasi Alkitab modern yang kerap mengunggah data pembaca, riwayat spiritual, dan telemetri ke cloud server, Meno menyimpan seluruh data secara lokal pada perangkat pengguna.

Pengujian keamanan dilakukan secara komprehensif mencakup:
1. **Audit Kerentanan Dependensi (Software Composition Analysis / SCA)** melalui `npm audit`.
2. **Keamanan Penyimpanan Lokal (Local Data & SQLite Security)**.
3. **Keamanan Jaringan & Integrasi API Eksternal (Network & REST API Security)**.
4. **Keamanan Input Pengguna (Input Validation & Anti-Injection)**.
5. **Keamanan Otentikasi Perangkat (Biometric & Hardware Keystore Security)**.
6. **Manajemen Kredensial & Rahasia (Secret Management)**.

---

## 2. Hasil Uji Keamanan Dependensi (`npm audit`)

### 2.1 Ringkasan Temuan Audit Awal
Sebelum tindakan remediasi, perintah `npm audit` mendeteksi **22 kerentanan** (12 low, 6 moderate, 4 high).

### 2.2 Tindakan Remediasi Otomatis (`npm audit fix`)
Telah dieksekusi perintah remediasi non-breaking:
```bash
npm audit fix
```
Hasil: Kerentanan berkurang dari **22 menjadi 18** (berhasil memperbarui pustaka `node-forge` [High] dan `uuid` [Moderate]). Seluruh 83 automated unit test tetap lulus 100%.

### 2.3 Rincian Kerentanan yang Tersisa & Analisis Risiko (*Risk Assessment*)

| Paket | Keparahan | Advisory / CVE | Analisis Dampak pada Meno | Keputusan Rekayasa |
|---|---|---|---|---|
| `decode-uri-component` | Moderate | [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) (DoS via malformed percent-encoded input) | Terikat secara transitif pada `query-string` di dalam `expo-router`. Meno hanya menggunakan file-based static routing internal (`src/app/`) dan tidak mem-parse query string tak dikenal dari internet terbuka. | **Mitigasi Terpenuhi / Low Risk**. Memaksa update (`--force`) akan merusak integrasi rute Expo Router SDK 57. |
| `deepmerge` | Moderate | [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) (Prototype pollution) | Merupakan dependensi dev/build toolchain (`@expo/cli`, `jest-config`). Tidak dieksekusi di runtime produksi Android client. | **Diterima (Dev Only)**. Tidak mempengaruhi runtime keamanan pada binary APK. |
| `zod` | High | [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) (ReDoS / memory exhaustion on oversized collections) | Digunakan secara internal oleh `@expo/cli` untuk parsing konfigurasi proyek saat proses build (CLI), bukan pada layer domain aplikasi Meno. Validasi aplikasi Meno menggunakan domain validator murni TypeScript (`settingsValidation.ts`). | **Diterima (Build Tooling Only)**. Tidak diekspos ke input publik runtime end-user. |

> **Catatan Akademik / Rekayasa:** Penggunaan `npm audit fix --force` dihindari secara sengaja karena akan menurunkan (*downgrade*) versi inti Expo ke SDK 51, yang menyebabkan ketidakcocokan runtime React 19 dan React Native 0.86.

---

## 3. Hasil Pengujian Keamanan Arsitektur & Kode

### 3.1 Keamanan Database Lokal (SQLite Injection Prevention)
- **Komponen**: `src/data/db.ts`, `src/data/sqliteDriver.ts`
- **Uji Keamanan**: Pengujian terhadap serangan manipulasi input pada query SQL.
- **Hasil**: **LULUS (Aman)**.
  - Seluruh query SQLite ditulis menggunakan parameter binding (`?`), bukan string concatenation.
  - Idempotensi terjamin dengan constraint `PRIMARY KEY (book_id, chapter_index)` pada tabel `completed` dan `date` pada tabel `reading_day`.
  - Tidak ada data kredensial, token akun, atau password yang disimpan di database.

### 3.2 Keamanan Jaringan & API Eksternal
- **Komponen**: `src/data/dailyVerseRepository.ts`
- **Uji Keamanan**: Pengujian transmisi data dan manipulasi respon API.
- **Hasil**: **LULUS (Aman)**.
  - Komunikasi data hanya menggunakan protokol terenkripsi **HTTPS** (`https://bible-api.com/john+3:16`).
  - Payload JSON dari server divalidasi secara ketat oleh fungsi `parseDailyVerse()`. Jika respon server mengandung data corrupt, format tidak sesuai, atau script injeksi, sistem melempar `DailyVerseValidationError` dan mengisolasi error tanpa menyebabkan crash pada aplikasi.

### 3.3 Validasi Input Form (Anti-Buffer Overflow & Type Coercion)
- **Komponen**: `src/domain/settingsValidation.ts`, `src/app/settings.tsx`
- **Uji Keamanan**: Pengujian masukan nilai ekstrim (string acak, angka negatif, angka raksasa, karakter escape XSS).
- **Hasil**: **LULUS (Aman)**.
  - Input target pasal dibatasi hanya bilangan bulat (1 hingga 50).
  - Catatan komitmen di-trim dan divalidasi batas minimum (5 karakter) dan maksimum (200 karakter) untuk mencegah memori overflow.
  - Tombol simpan mematikan interaksi saat proses async berlangsung (`isSubmitting`), mencegah *race condition* dan serangan *double-tap submit*.

### 3.4 Keamanan Otentikasi Biometrik
- **Komponen**: `src/services/authService.ts` (`expo-local-authentication`)
- **Uji Keamanan**: Verifikasi penanganan sensor sidik jari / Face ID / PIN.
- **Hasil**: **LULUS (Aman)**.
  - Verifikasi dilakukan langsung oleh modul keamanan perangkat keras (Hardware Keystore / Secure Enclave). Aplikasi Meno tidak pernah mengakses, membaca, atau menyimpan data biometrik mentah pengguna.
  - Menangani skenario kegagalan: sensor tidak tersedia, pengguna membatalkan otentikasi, atau kegagalan perangkat secara elegan dengan fallback.

### 3.5 Manajemen Secrets & Kredensial
- **Uji Keamanan**: Pencarian kredensial, API Key, dan token rahasia di seluruh codebase.
- **Hasil**: **LULUS (Bersih)**.
  - Tidak ada kredensial, password, atau API key rahasia yang ter-commit ke dalam Git.
  - Repositori bersifat publik dan aman untuk di-clone oleh siapa pun.

---

## 4. Catatan Perubahan yang Relevan (Security Changelog)

| Versi / Tanggal | Modul / Berkas | Jenis Perubahan | Catatan & Alasan Perubahan |
|---|---|---|---|
| **2026-10-30** | `package-lock.json` | Dependency Patch | Eksekusi `npm audit fix` untuk memperbaiki kerentanan pada `node-forge` dan `uuid`. Kerentanan turun dari 22 menjadi 18. |
| **2026-10-29** | `src/domain/settingsValidation.ts` | Input Sanitization | Penambahan sanitasi `trim()` dan pembatasan panjang karakter catatan (maks 200 karakter) untuk mencegah memori overflow pada state storage. |
| **2026-10-29** | `src/app/settings.tsx` | Race-condition Shield | Implementasi `isSubmitting` state guard pada tombol Simpan formulir untuk mencegah double execution pada operasi database SQLite. |
| **2026-10-29** | `src/data/dailyVerseRepository.ts` | Strict Parsing | Menambahkan penanganan `ApiHttpError` dan `ApiJsonError` saat menerima respon non-HTTPS atau JSON yang rusak guna mencegah payload injection. |
| **2026-10-22** | `src/data/sqliteDriver.ts` | SQL Parameterization | Mengisolasi seluruh perintah SQL ke parameterized driver seam (`runAsync(sql, params)`) untuk menjamin zero SQL-injection. |

---

## 5. Kesimpulan & Rekomendasi Audit

1. **Aplikasi Aman Digunakan**: Tidak ada celah keamanan kategori *Critical* yang aktif pada runtime aplikasi.
2. **Kesesuaian Arsitektur**: Arsitektur lokal (SQLite + no backend) meminimalisir attack surface secara drastis dibandingkan aplikasi mobile berbasis cloud.
3. **Status Pengujian**: 83/83 unit test lulus, typecheck TypeScript strict lulus, dan linter bersih tanpa pelanggaran.

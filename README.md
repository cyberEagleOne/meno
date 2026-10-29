# Meno

Meno adalah aplikasi mobile pembaca Alkitab (**Android-first Bible reader**) dengan pendekatan pembiasaan membaca yang tenang (*gentle, habit-building mechanics*), dikembangkan sebagai tugas mata kuliah pengembangan aplikasi. Meno berfokus pada pengalaman membaca firman yang khidmat (*Scripture-first*), bebas dari distraksi, kompetisi berlebihan, maupun rasa bersalah.

---

## Ringkasan Proyek (Checkpoint Pertemuan 1)

### 1. Deskripsi Masalah
Banyak orang memiliki keinginan untuk membaca Alkitab secara teratur, namun kesulitan membangun dan mempertahankan kebiasaan membaca harian. Aplikasi Alkitab yang ada di pasaran saat ini umumnya terbagi menjadi dua ekstrem:
- **Terlalu utilitarian / kaku**: hanya berupa teks digital tanpa motivasi atau pelacakan progres yang jelas.
- **Terlalu banyak gamifikasi bising**: notifikasi agresif, sistem poin, dan *streak guilt* (tekanan berantai) yang justru terasa kurang khidmat dan membuat pengguna menyerah ketika melewatkan satu hari.

Meno hadir mengisi celah tersebut: memberikan pengalaman membaca yang tenang, terstruktur, menghormati teks Kitab Suci, serta didukung pencatatan progres lokal yang terpercaya.

### 2. Profil Target Pengguna
- **Pengguna Utama ("The Returning Reader")**: Orang muda / dewasa yang ingin kembali membiasakan membaca Alkitab setiap hari setelah sempat terhenti. Membutuhkan kemudahan untuk melanjutkan bacaan terakhir dalam satu ketukan tanpa harus mencari ulang pasal, dan menghargai dorongan positif tanpa tekanan.
- **Pengguna Sekunder ("The New Reader")**: Orang yang baru mulai membaca Alkitab dan membutuhkan struktur bacaan yang jelas (pembagian Perjanjian Lama & Baru, ringkasan pasal) dengan beban kognitif yang rendah.

### 3. Manfaat Aplikasi
1. **Kontinuitas Instan (One-tap Resume)**: Aplikasi mengingat kitab, pasal, dan posisi scroll terakhir sehingga pengguna dapat langsung melanjutkan membaca dalam 1 ketukan.
2. **Pencatatan Progres Terpercaya (Idempotent)**: Menandai pasal yang sama berulang kali tidak akan menggandakan statistik bacaan. Angka progres yang dilihat pengguna selalu akurat.
3. **Penyimpanan Lokal & Privasi Penuh**: Semua data progres tersimpan di perangkat melalui SQLite lokal—tidak membutuhkan akun, koneksi internet, maupun backend eksternal.
4. **Kendali Penuh di Tangan Pembaca**: Menandai selesai adalah tindakan sadar pembaca (tombol "Tandai selesai"), bukan otomatis hanya karena membuka pasal.
5. **Dorongan Positif Tanpa Tekanan**: Tonggak pencapaian bertahap (*milestones*) dan visual tenang tanpa papan peringkat (*leaderboard*) atau poin yang menimbulkan stres.

### 4. Daftar Fitur Inti (MVP)
1. **Bible Reader (Pembaca Alkitab)**:
   - Navigasi daftar kitab (Perjanjian Lama & Perjanjian Baru) dan grid nomor pasal.
   - Tampilan pembaca teks per pasal dengan virtualisasi daftar ayat yang responsif.
   - Navigasi lintas kitab (tombol Pasal Selanjutnya / Sebelumnya menyeberang batas kitab secara mulus).
   - Memori bacaan terakhir (*last-read position & scroll*).
2. **Persistent Reading Progress (Pelacakan Progres Lokal)**:
   - Penyimpanan berbasis SQLite (`expo-sqlite`) yang bertahan meskipun aplikasi ditutup/dimatikan.
   - Tombol toggle status selesai (*"Tandai selesai"* / *"Batalkan penandaan"*).
   - Layar Kemajuan: total pasal selesai, persentase Alkitab, jumlah hari membaca (*"X hari membaca"*), dan progress bar per-perjanjian.
3. **Ayat Harian & Devosional (Integrasi API)**:
   - Pemuatan ayat inspirasi harian secara dinamis dari REST API Alkitab online.
4. **Fitur Lanjutan (Hardware & OS Features)**:
   - Notifikasi pengingat membaca harian lokal (*Local Notification*).
   - Sensor gerak (*Shake to Read Random Chapter*).
   - Autentikasi biometrik (*Fingerprint / Face ID App Lock*).

### 5. Fitur yang Tidak Dikerjakan (Out of Scope)
- Akun pengguna di cloud, sinkronisasi multi-device, atau backend server mandiri (fokus pada *offline-first* dan privasi).
- Fitur sosial, komentar publik, obrolan, atau *leaderboard*.
- Audio Alkitab dan kamus konkordansi mendalam.
- Monetisasi, iklan komersial, atau konten berbayar.

### 6. Kriteria Aplikasi Dinyatakan Berhasil
1. **Fungsionalitas Pembaca**: Seluruh 66 kitab dan 1.189 pasal dapat diakses, dibaca, dan dinavigasi maju/mundur dengan benar tanpa crash.
2. **Persistensi Data**: Menandai pasal selesai bertahan saat aplikasi ditutup paksa (*force close*) dan dibuka kembali.
3. **Kualitas Pengujian**: Minimal 70+ pengujian unit (*automated tests*) berjalan bersih (pass 100%) mencakup logika navigasi, idempotensi progres, dan aturan database.
4. **Antarmuka Responsif & Rapi**: Tampilan memenuhi standar desain Meno (Indonesia, tipografi Plus Jakarta Sans, kontras warna yang nyaman, serta penanganan *safe area* Android).
5. **Kesiapan Demo**: Aplikasi dapat dijalankan dan didemonstrasikan langsung di hadapan dosen/evaluator melalui Android Emulator atau perangkat fisik via Expo Go.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Expo (managed) — **SDK 57** |
| Runtime | React Native 0.86, React 19.2 |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based; routes in `src/app/`) |
| Local database | `expo-sqlite` (schema + injectable driver seam implemented; tables created on first launch) |

Verified toolchain versions (2026-10-11): `expo 57.0.27`, `react-native 0.86.3`,
`react 19.2.3`, `expo-router 57.0.25`, `expo-sqlite 57.0.4`,
`typescript 6.0.3`.

## Prerequisites and environment

- **fnm** with **Node 22** (verified with `v22.23.3`) — the Expo scaffolder
  requires `^22.13.0`. The system Node (v20) is **not** sufficient.
- **Temurin JDK 17** — at `~/.local/share/jdks/temurin-17`.
- **Android SDK Platform 36** (Android 16 "Baklava") with build-tools,
  platform-tools, and an emulator — at `~/.local/share/android-sdk`.
- An **Android emulator (AVD)** named `meno_api36`.

## Panduan Fresh Clone & Instalasi Ulang

### 1. Fresh Clone Repository

Untuk menyalin (*clone*) proyek ini dari repositori GitHub ke komputer lokal Anda:

```bash
git clone https://github.com/cyberEagleOne/meno.git
cd meno
```

### 2. Instalasi Dependensi (Standar)

Pastikan Anda menggunakan **Node.js 22** (atau `>= 22.13.0`):

```bash
npm install
```

### 3. Prosedur Instalasi Ulang Bersih (Clean Reinstall)

Jika Anda ingin melakukan instalasi ulang bersih (*fresh re-install*) atau membersihkan cache dependensi lama:

- **Windows (PowerShell)**:
  ```powershell
  Remove-Item -Recurse -Force node_modules, package-lock.json
  npm cache clean --force
  npm install
  ```

- **macOS / Linux**:
  ```bash
  rm -rf node_modules package-lock.json
  npm cache clean --force
  npm install
  ```

---

## Cara Menjalankan & Mengakses Paket Demo Aplikasi

Pilih salah satu cara akses aplikasi sesuai kebutuhan pengujian atau demonstrasi:

### Opsi A: Akses Cepat via Web Preview (Paling Mudah untuk Demo)
Aplikasi Meno mendukung web preview responsif yang dapat langsung dicoba melalui peramban:
```bash
npm run web
# atau
npx expo start --web
```
Aplikasi akan otomatis terbuka pada `http://localhost:8081` (tampilan ramah navigasi mobile).

### Opsi B: Akses via Perangkat Fisik (Expo Go di Android / iOS)
1. Pasang aplikasi **Expo Go** dari Google Play Store atau Apple App Store pada smartphone.
2. Pastikan komputer dan smartphone terhubung pada jaringan Wi-Fi yang sama.
3. Jalankan server Metro:
   ```bash
   npx expo start
   ```
4. Buka Expo Go dan pindai (*scan*) QR Code yang tampil di layar terminal.

### Opsi C: Akses via Android Emulator
Jika Anda telah mengonfigurasi Android SDK dan AVD:
```bash
npm run android
```
*(Lihat rincian konfigurasi AVD di [HowToRun.md](HowToRun.md) jika emulator belum berjalan).*

### Opsi D: Akses Paket Demo Lokal Hasil Build
Jalankan bundle statis yang telah diekspor:
```bash
npx serve dist
```

---

## Prosedur Build & Deployment

### 1. Build Bundle Aplikasi

Meno dapat diekspor menjadi bundle produksi siap pakai tanpa memerlukan Android Studio secara lokal:

- **Build Bundle Android (Hermes + JS Bundle)**:
  ```bash
  npx expo export --platform android
  ```
  *Output:* Direktori `dist/` berisi file `entry-*.hbc` (Hermes bytecode teroptimasi) dan aset grafis.

- **Build Bundle Web Statis**:
  ```bash
  npx expo export --platform web
  ```
  *Output:* Direktori `dist/` berisi seluruh file HTML statis per rute (`/index`, `/settings`, `/library`, dll.) dan bundle JS web.

- **Build Standalone APK Android (via EAS Build)**:
  Jika ingin menghasilkan file installer `.apk` standalone:
  ```bash
  npx eas-cli build --platform android --profile preview
  ```

### 2. Prosedur Deployment

- **Deploy Web Demo ke Vercel**:
  ```bash
  npx vercel deploy --prebuilt
  ```
- **Deploy Web Demo ke GitHub Pages**:
  Unggah seluruh isi direktori `dist/` ke branch `gh-pages` pada repositori GitHub.

---

## Verifikasi Kualitas & Test Suite (Unit Test All Passed)

Sebelum melakukan demonstrasi atau commit, jalankan pengujian untuk memastikan seluruh fungsionalitas berjalan normal:

```bash
# 1. Jalankan seluruh unit test (95 skenario pengujian)
npm test

# 2. Periksa static typing TypeScript
npx tsc --noEmit

# 3. Periksa aturan kode (ESLint)
npm run lint
```

**Status Verifikasi Terkini**:
- ✅ **Unit Tests**: 10 test suites / 95 unit test **100% LULUS (Passed)**.
- ✅ **TypeScript**: Strict clean, 0 error.
- ✅ **Linter**: Clean, 0 warnings/errors.
- ✅ **Bundle Export**: Android & Web build sukses di direktori `dist/`.

Rincian inventaris pengujian tercatat lengkap di [`docs/TESTING.md`](docs/TESTING.md).

---

## MVP status (implemented)

Per [`docs/PRD.md`](docs/PRD.md), MVP mencakup fitur utama yang telah diimplementasikan penuh:

1. **Bible Reader** — navigasi kitab (PL & PB), grid nomor pasal, tampilan teks ayat, navigasi lintas kitab (*cross-book boundaries*), pemulihan posisi bacaan terakhir (*last-read restore*).
2. **Persistent Reading Progress** — pencatatan progres per pasal idempotent berbasis SQLite (bertahan saat restart), pelacakan posisi scroll, kalkulasi persentase dan hari membaca (*reading days*), layar Kemajuan.
3. **Daily Verse Integration** — integrasi REST API online untuk ayat inspirasi harian dengan penanganan loading, error, retry, dan validasi model data.
4. **Hardware & Advanced OS Features** — notifikasi harian lokal (`expo-notifications`), sensor goyang ganti pasal acak (`expo-sensors`), dan proteksi privasi biometrik/PIN (`expo-local-authentication`).
5. **Gentle Gamification & Usability** — Pohon Pertumbuhan Kebiasaan (*The Habit Tree* 6 tahap interaktif), sistem Lencana Prestasi Koleksi (*Collectible Badges*), Maskot Meno Interaktif (*Tap-to-Talk Companion*), serta pengatur ukuran huruf pembaca dinamis (`A±`).

### Explicitly out of scope (for now)

- User accounts, cloud sync, or any backend.
- Social features, leaderboards, or sharing.
- Audio Bible, commentary, or devotionals.
- Multiple translations at launch.
- Monetisation, ads, or paid content.

## Bible content and licensing caveat

No Bible text is bundled in this repository. The intended embedded source is
the **ILT3** translation, and its **redistribution/embedding permission is
unresolved**. Permission must not be assumed granted, and no Bible text will be
added until licensing is confirmed and recorded (see
[`docs/PRD.md`](docs/PRD.md) §5.4).

---

## Dokumentasi Lengkap Proyek

| Dokumen | Deskripsi |
|---|---|
| [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md) | **Hasil Uji Security**, audit dependensi (`npm audit`), dan catatan perubahan relevan |
| [`docs/LOGGING_AND_ERROR_HANDLING.md`](docs/LOGGING_AND_ERROR_HANDLING.md) | **Contoh Log Aman**, mitigasi data PII, penyebab error, dan tindakan perbaikannya |
| [`docs/CHECKPOINT_EVALUATION.md`](docs/CHECKPOINT_EVALUATION.md) | Panduan pemenuhan & pembuktian Checkpoint Dosen (P1–P7) |
| [`docs/TESTING.md`](docs/TESTING.md) | Catatan eksekusi riil pengujian unit (83 tests pass), tsc, lint, dan bundler |
| [`HowToRun.md`](HowToRun.md) | Panduan setup teknis lingkungan Android SDK & AVD |
| [`checklist_mvp.md`](checklist_mvp.md) | Matriks pemenuhan acceptance criteria MVP |
| [`docs/PRD.md`](docs/PRD.md) | Product Requirement Document (PRD) & User Stories |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Dokumentasi arsitektur 4-layer, skema database SQLite, dan data model |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Token desain, tipografi, palet warna, dan aset Meno |
| [`docs/ASSIGNMENT_TRACEABILITY.md`](docs/ASSIGNMENT_TRACEABILITY.md) | Matriks penelusuran requirement ke kode pengujian |
| [`docs/12_MEETING_PLAN.md`](docs/12_MEETING_PLAN.md) | Rencana pertemuan dan catatan kontribusi |

---

## Struktur Direktori Repositori

```
src/app/            Expo Router routes (tabs, library, chapters, reader, settings)
src/data/           SQLite persistence (expo-sqlite driver seam), REST API repository, placeholder dataset
src/domain/         Pure, unit-tested domain logic (navigation, progress rules, form validation, daily verse)
src/services/       Advanced OS features (notifikasi, sensor accelerometer, biometrik)
src/theme/          Design tokens (colors, fonts, spacing)
src/components/ui/  Shared UI components (buttons, rings, icons, cards, mascots)
assets/             Icons, splash, and Meno mascot artwork
docs/               Dokumentasi teknis, audit keamanan, panduan error, dan bukti evaluasi
dist/               Hasil build bundle produksi (Android Hermes & Web static)
app.json  package.json  tsconfig.json  metro.config.js  eslint.config.js
```


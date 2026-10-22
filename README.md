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

## Setup

From the project root:

```bash
fnm exec --using=22 -- npm install
```

## Run on the Android emulator

The AVD must be **running before** you start Expo. Set the environment for the
current shell and boot the existing `meno_api36` AVD:

```bash
export ANDROID_HOME="$HOME/.local/share/android-sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
export JAVA_HOME="$HOME/.local/share/jdks/temurin-17"

# Launch the existing AVD (headless example)
emulator -avd meno_api36 -no-window -no-audio -no-boot-anim \
  -gpu swiftshader_indirect -memory 2048 -no-snapshot -no-metrics &

adb wait-for-device
adb shell getprop sys.boot_completed   # expect: 1
```

Then start Expo and open the app on Android:

```bash
fnm exec --using=22 -- npx expo start --android
```

If you prefer, start Metro separately and open Android from the Expo CLI:

```bash
fnm exec --using=22 -- npx expo start
```

## Verification

```bash
fnm exec --using=22 -- npx tsc --noEmit
fnm exec --using=22 -- npm run lint
fnm exec --using=22 -- bash -c 'CI=1 npm test -- --runInBand'
fnm exec --using=22 -- npx expo-doctor
```

Actual results and the test inventory are recorded in
[`docs/TESTING.md`](docs/TESTING.md).

## MVP status (implemented)

Per [`docs/PRD.md`](docs/PRD.md), the MVP is two features — both now implemented:

1. **Bible Reader** — book list, chapter grid, verse rendering, next/previous
   chapter navigation (cross-book boundaries), last-read restore.
2. **Persistent Reading Progress** — idempotent per-chapter completion stored
   in SQLite (survives restarts), last-read and scroll position persistence,
   chapters-read totals, milestones, per-testament progress (Kemajuan screen).

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

## Documentation

- [`docs/CHECKPOINT_EVALUATION.md`](docs/CHECKPOINT_EVALUATION.md) — panduan pemenuhan & pembuktian Checkpoint Dosen (P1–P7)
- [`HowToRun.md`](HowToRun.md) — setup, run, and verification commands
- [`checklist_mvp.md`](checklist_mvp.md) — acceptance-criteria evidence map
- [`docs/PRD.md`](docs/PRD.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
- [`docs/TESTING.md`](docs/TESTING.md)
- [`docs/ASSIGNMENT_TRACEABILITY.md`](docs/ASSIGNMENT_TRACEABILITY.md)
- [`docs/12_MEETING_PLAN.md`](docs/12_MEETING_PLAN.md)

## Repository layout

```
src/app/        Expo Router routes (tabs, library, chapters, reader)
src/data/       SQLite persistence (expo-sqlite driver seam), placeholder dataset
src/domain/     Pure, unit-tested domain logic (navigation, progress rules)
src/theme/      Design tokens (colors, fonts, spacing)
src/components/ui/  Shared UI components (buttons, rings, icons, mascots)
assets/         Icons, splash, and Meno mascot artwork
docs/           Planning documents and evidence
.opencode/      OpenCode workflow skills
app.json  package.json  tsconfig.json  metro.config.js  eslint.config.js
```

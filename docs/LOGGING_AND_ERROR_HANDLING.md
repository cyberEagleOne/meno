# Meno — Panduan Logging Aman, Penyebab Error, dan Tindakan Perbaikan

| Dokumen | Nilai |
|---|---|
| Status Dokumen | Final — Standar Operasional & Evaluasi Akademik |
| Target Pembaca | Reviewer, Penguji Checkpoint, dan Pengembang Meno |
| Cakupan | Format Log Aman, Analisis Akar Masalah (Root Cause), dan Mitigasi |

---

## 1. Standar & Prinsip Logging Aman (Safe Logging)

Pada aplikasi mobile modern, pencatatan log sistem (*logging*) sangat penting untuk proses debugging dan pemantauan stabilitas. Namun, pencatatan log yang ceroboh berisiko membocorkan data pribadi (*Personally Identifiable Information* / PII) dan membuka celah keamanan.

### 1.1 Aturan Emas Safe Logging di Meno
1. **Tidak Ada Kredensial / Secret di Log**: Dilarang mencatat token, password, atau cryptographic key.
2. **Tidak Ada Data Biometrik Mentah**: Dilarang mencatat citra sidik jari, template biometrik, atau hasil sensor mentah.
3. **Redaksi / Masking Data Pengguna**: Catatan komitmen pengguna (*notes*) dan teks sensitif harus disanitasi atau dicatat panjang karakternya saja (`length`), bukan isi teks lengkapnya.
4. **Format Terstruktur (Structured JSON)**: Seluruh log di level produksi dianjurkan menggunakan format JSON yang mencantumkan `timestamp`, `level`, `context`, `event`, dan `metadata` yang aman.

### 1.2 Perbandingan Log Berbahaya vs Log Aman

| Skenario | ❌ Log Berbahaya (Unsafe Log) | ✅ Log Aman (Safe Log) | Penjelasan Perbaikan |
|---|---|---|---|
| **Penyimpanan Komitmen Pengguna** | `console.log("Menyimpan komitmen: " + userNote + " untuk user Budi");` | `console.log(JSON.stringify({ event: "settings_saved", targetChapters: 5, noteLength: 42, timestamp: "2026-10-30T01:00:00Z" }));` | Menghilangkan identitas nama (*PII*) dan isi refleksi pribadi; hanya mencatat metadata ukuran teks. |
| **Autentikasi Biometrik** | `console.log("Biometric auth fail, PIN: 1234, Raw: " + JSON.stringify(err));` | `console.warn(JSON.stringify({ event: "biometric_auth_failed", reason: "user_cancel", hardwareAvailable: true }));` | Tidak mencatat PIN atau dump objek mentah OS yang mungkin berisi info perangkat keras sensitif. |
| **Request REST API** | `console.log("Fetch URL with Auth: https://api.com?token=xyz987&user=budi");` | `console.info(JSON.stringify({ event: "api_request", endpoint: "https://bible-api.com/john+3:16", method: "GET" }));` | URL tidak mengekspos token rahasia atau identitas pengguna. |

---

## 2. Contoh Log Aman, Penyebab Error, dan Tindakan Perbaikan

Berikut adalah katalog error riil yang dapat terjadi pada aplikasi Meno, representasi log amannya, analisis penyebab, serta tindakan perbaikan teknisnya:

---

### Kasus 1: Kegagalan Koneksi Jaringan saat Mengambil Ayat Harian (HTTP / Network Error)

#### Contoh Log Aman:
```json
{
  "timestamp": "2026-10-30T01:15:22.104Z",
  "level": "WARN",
  "category": "API_INTEGRATION",
  "event": "daily_verse_fetch_failed",
  "errorType": "ApiHttpError",
  "statusCode": 503,
  "endpoint": "https://bible-api.com/john+3:16",
  "message": "Layanan penyedia ayat sedang tidak dapat dijangkau"
}
```

#### Penyebab Error:
1. Perangkat pengguna kehilangan koneksi internet (mode pesawat atau kuota habis).
2. Server eksternal publik (`bible-api.com`) mengalami downtime, overload, atau memberikan status HTTP 500/503.
3. Permintaan jaringan mengalami timeout (lebih dari batas wajar koneksi seluler).

#### Tindakan Perbaikan:
1. **Pada Kode (Layer Repository)**: Menangkap error jaringan di `src/data/dailyVerseRepository.ts` menggunakan blok `try...catch` dan membungkusnya ke dalam class error khusus `ApiHttpError`.
2. **Pada Antarmuka (Layer UI)**: Komponen `src/components/ui/DailyVerseCard.tsx` menangkap `error` state dan secara dinamis menampilkan kotak peringatan ramah pengguna dilengkapi dengan **tombol "Coba Lagi" (Retry)** tanpa membuat aplikasi crash.
3. **Rencana Fallback**: Jika koneksi gagal, sistem dapat menyajikan ayat default offline yang tersimpan di cache lokal.

---

### Kasus 2: Respons API Mengembalikan Format JSON Rusak atau Kosong

#### Contoh Log Aman:
```json
{
  "timestamp": "2026-10-30T01:18:04.551Z",
  "level": "ERROR",
  "category": "API_INTEGRATION",
  "event": "daily_verse_payload_invalid",
  "errorType": "DailyVerseValidationError",
  "payloadKeysReceived": ["status", "error_code"],
  "missingFields": ["text", "reference"]
}
```

#### Penyebab Error:
1. Pihak ketiga penyedia API mengubah skema (*schema drift*) tanpa pemberitahuan.
2. Endpoint API mengembalikan HTML error page alih-alih JSON valid (misal saat terhadang captive portal Wi-Fi publik).
3. Payload respons kosong (*empty body*).

#### Tindakan Perbaikan:
1. **Validasi Strict pada Domain**: Fungsi `parseDailyVerse()` di `src/domain/dailyVerse.ts` memverifikasi keberadaan tipe data string pada properti `text` dan `reference`. Jika tidak sesuai, segera lemparkan `DailyVerseValidationError`.
2. **Fallback UI Graceful**: Tampilkan kondisi *Empty State* yang tenang: *"Ayat harian belum tersedia saat ini"*, menjaga estetika tampilan tetap bersih dan tidak menampilkan teks `undefined` atau `[Object object]`.

---

### Kasus 3: Kegagalan Penyimpanan Database SQLite Lokal

#### Contoh Log Aman:
```json
{
  "timestamp": "2026-10-30T01:20:10.822Z",
  "level": "ERROR",
  "category": "DATABASE",
  "event": "sqlite_write_failed",
  "operation": "mark_completed",
  "bookId": "MAT",
  "chapterIndex": 1,
  "errorType": "SqlDriverError",
  "sanitizedMessage": "SQLite disk I/O error or constraint failure"
}
```

#### Penyebab Error:
1. Ruang penyimpanan internal perangkat pengguna penuh (*device storage full*).
2. File database SQLite lokal terkunci (*database locked*) akibat race-condition proses I/O.
3. Driver SQLite belum selesai diinisialisasi saat aksi simpan dipanggil secara tergesa-gesa.

#### Tindakan Perbaikan:
1. **Driver Seam & Fallback**: Arsitektur Meno menggunakan abstraksi `SqlDriver` (`src/data/sqlDriver.ts`). Jika native driver gagal, sistem mempertahankan status progres di memori sementara (`in-memory state`).
2. **Idempotensi & Transaksi**: Seluruh operasi menggunakan `INSERT OR IGNORE` dan `ON CONFLICT DO UPDATE` agar kegagalan operasi tidak menghasilkan data duplikat atau merusak integritas tabel.
3. **Pemberitahuan UI**: Tombol pada `src/app/reader/` menampilkan status *"Gagal menyimpan, ketuk untuk mencoba lagi"*.

---

### Kasus 4: Kegagalan / Pembatalan Autentikasi Biometrik

#### Contoh Log Aman:
```json
{
  "timestamp": "2026-10-30T01:22:45.330Z",
  "level": "WARN",
  "category": "SECURITY_AUTH",
  "event": "biometric_prompt_cancelled",
  "authType": "fingerprint",
  "userCancelled": true
}
```

#### Penyebab Error:
1. Pengguna sengaja menekan tombol *"Batal"* (*user cancel*) pada dialog pemindaian sidik jari/Face ID.
2. Perangkat Android tidak memiliki sensor biometrik terdaftar (*hardware not enrolled*).
3. Percobaan sidik jari salah beberapa kali sehingga sistem operasi mengunci sensor untuk sementara waktu.

#### Tindakan Perbaikan:
1. **Penanganan Status di Service**: `src/services/authService.ts` memeriksa properti `success` dan `error` dari `LocalAuthentication.authenticateAsync()`.
2. **Opsi Fallback PIN / Passcode**: Sistem secara otomatis mengizinkan pengguna menggunakan PIN perangkat keras bila sensor biometrik tidak dapat digunakan.
3. **Feedback UI**: Menampilkan label status berwarna oranye pada layar Pengaturan: *"Autentikasi dibatalkan. Anda dapat mencoba kembali kapan saja."* tanpa memblokir navigasi membaca firman.

---

### Kasus 5: Validasi Input Pengaturan Tidak Valid (Form Validation Error)

#### Contoh Log Aman:
```json
{
  "timestamp": "2026-10-30T01:24:12.012Z",
  "level": "INFO",
  "category": "FORM_VALIDATION",
  "event": "settings_form_rejected",
  "targetInputLength": 3,
  "isTargetNumeric": false,
  "noteLength": 2,
  "reason": "target_not_number_and_note_too_short"
}
```

#### Penyebab Error:
1. Pengguna memasukkan karakter non-numerik atau nilai di luar batas 1–50 pada input target membaca.
2. Pengguna mengisi catatan komitmen kurang dari 5 karakter.

#### Tindakan Perbaikan:
1. **Validasi Murni TypeScript**: Fungsi `validateSettingsForm()` di `src/domain/settingsValidation.ts` memproses input dan menghasilkan objek error spesifik per kolom.
2. **UI Responsif**: Menampilkan teks error berwarna merah di bawah kolom terkait secara instan, serta menonaktifkan tombol simpan (`disabled={!isValid}`) untuk mencegah pengiriman data yang tidak valid.

---

## 3. Kesimpulan Implementasi

Dengan menerapkan prinsip-prinsip di atas:
- **Keamanan Terjamin**: Tidak ada data sensitif pengguna (PII, komitmen pribadi, atau biometrik) yang bocor ke log console maupun log eksternal.
- **Kemudahan Debugging**: Setiap peristiwa error memiliki jejak log terstruktur yang jelas, mempermudah pengembang dalam mengidentifikasi akar masalah.
- **Resiliensi Aplikasi**: Setiap jenis error telah memiliki mitigasi kode dan penanganan tampilan UI (fallback state / retry button) sehingga aplikasi tidak pernah mengalami *crash* mendadak.

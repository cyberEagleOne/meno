# P12 Security Risk Report — Runtime Error Logging

**Audit date:** 2026-11-26

**Category:** Log
**Scope:** logger implementation and its call sites in the current local checkout. This was a source review, not a penetration test or device logcat inspection.

## Identifikasi Risiko Keamanan

**Nama Risiko:** Pesan exception yang tidak disanitasi dapat masuk ke log konsol dan buffer diagnostik.

**Kategori:** Log.

**Fitur yang Terpengaruh:** Logging kegagalan aplikasi, database, reader, goal form, dan autentikasi.

**Lokasi Implementasi:**

- `src/services/logger.ts`, `Logger.log()` mengubah `Error.message`, `Error.name`, `Error.stack` (di development), dan `status` menjadi `LogEntry.error`.
- `Logger.outputToConsole()` mengirim entry ke `console.error` / `console.warn` / `console.info`; di development error dan metadata diteruskan sebagai argumen console, sementara production memakai JSON satu baris.
- `Logger.sanitizeMetadata()` menyamarkan nilai metadata berdasarkan nama key, termasuk password/token/PIN/credential, serta mengubah catatan refleksi menjadi panjang karakter. Sanitasi tersebut tidak diterapkan pada field `error.message` atau stack.
- Contoh pemanggil: `src/data/db.ts`, `src/data/goalRepository.ts`, `src/data/bibleContext.tsx`, `src/components/ui/ReadingGoalForm.tsx`, dan `src/app/_layout.tsx`.

**Pemicu Risiko:** Suatu dependency, native API, atau operasi aplikasi melempar `Error` yang `message`-nya berisi rahasia, data personal, atau path lokal; pemanggil meneruskan objek itu ke `logger.error()`/`logger.warn()`.

**Data atau Akses yang Terpapar:** Berpotensi berupa teks apa pun yang disisipkan ke exception, termasuk token/password/PIN, path dengan nama pengguna, atau teks pribadi. Audit ini tidak menemukan contoh nyata nilai tersebut dalam exception yang dilempar call site saat ini. Beberapa path dapat muncul dalam stack development, bergantung sumber exception.

**Dampak:** Jika exception semacam itu terjadi, detailnya dapat terlihat dalam console/logcat dan tersimpan sementara dalam ring buffer proses. Developer dengan akses debugging/ADB atau proses tooling yang dapat membaca log sistem mungkin melihatnya. Tidak ditemukan layar aplikasi yang menampilkan log, ekspor log, telemetry, pengiriman ke server, atau penulisan log ke database/file. Buffer hilang saat proses berakhir. Android tetap mengelola retensi logcat di luar aplikasi; audit ini tidak mengukur konfigurasi perangkat atau akses pihak lain.

**Tingkat Risiko:** **Low (risiko potensial)**. Jalur kode tanpa sanitasi terbukti ada, tetapi tidak ada bukti nilai rahasia benar-benar berada di pesan exception, tidak ada akses log melalui UI, dan penyimpanan aplikasi yang ditemukan hanya buffer in-memory serta output console. Dampak baru relevan jika suatu sumber exception menyertakan nilai sensitif dan seseorang memiliki akses ke log perangkat/debug.

**Bukti:**

- `src/services/logger.ts`: metadata disanitasi, tetapi konstruksi `parsedError` menyalin `errorObj.message` langsung. Stack hanya dihilangkan saat `isProduction` true.
- Pencarian referensi `getRecentLogs()` menemukan API tersebut hanya di logger dan test; tidak ditemukan penggunaan UI untuk menampilkan buffer.
- Pencarian logger menunjukkan output melalui console. Tidak ditemukan logger menulis ke SQLite, AsyncStorage, FileSystem, atau backend.
- Test UI yang melempar `Error("SQLite unavailable")` menghasilkan stack dengan absolute path workspace di output Jest lokal karena logger meneruskan `Error.stack` di mode development. Ini membuktikan path lokal bisa muncul pada output test/development; bukan bukti path atau data pribadi pengguna terekspos dari aplikasi yang sedang berjalan.
- Contoh error pada test `src/services/__tests__/logger.test.ts` adalah string simulasi, bukan rahasia pengguna.
- Tidak ditemukan bukti kebocoran aktual. Ini bukan klaim bahwa data sudah terekspos.

**Mitigasi:** Tidak ada perubahan kode yang dilakukan. Bukti aktual belum menunjukkan mitigasi wajib, dan pemangkasan atau penyamaran umum terhadap pesan/stack berisiko menghilangkan detail diagnosis tanpa mengetahui pola sensitif yang benar-benar dikirim. Mitigasi proporsional: jangan memasukkan secret atau input personal ke exception; jika kemudian ditemukan format exception yang membawa secret, sanitasi pola spesifik di boundary logger sambil mempertahankan nama error, kode/status aman, dan stack yang sudah disanitasi. Evaluasi ulang sebelum mengaktifkan telemetry atau log export.

**Hasil Verifikasi:** Pemeriksaan kode dan seluruh pemanggil logger selesai. Test logger yang ada lulus sebagai bagian dari seluruh suite; tidak ada test baru atau perubahan implementasi karena temuan terbatas pada kemungkinan. Seluruh test akhir lulus 316/316. Tidak dilakukan pengambilan logcat baru untuk mengklaim keadaan perangkat.

Bukti tekstual tambahan dari finalisasi: `docs/evidence/P12/logger-implementation-source.txt` berisi source aktual yang diperiksa, dan `docs/evidence/P12/logger-test-verification-excerpt.txt` mengekstrak baris PASS logger serta ringkasan suite dari hasil test yang sudah tersimpan. Ekstrak tersebut bukan run baru.

## Kesimpulan

Status temuan: **risiko potensial, bukan paparan aktual yang terbukti**. Error.message tidak disanitasi. Namun log hanya dicatat ke console dan buffer memori menurut implementasi aplikasi yang ditinjau; tidak ditemukan UI atau penyimpanan permanen aplikasi yang memberikan akses tambahan. Review ini tidak dapat membuktikan siapa yang dapat membaca logcat pada perangkat tertentu.

Screenshot logger/kode dan hasil verifikasi belum tersedia sebagai gambar. Instruksi pengambilan ada di `docs/P11_P12_EVIDENCE_GUIDE.md`.

## Status akhir P12

| Persyaratan | Status | Bukti / batas |
|---|---|---|
| Satu kategori risiko dipilih dan fitur/lokasi/pemicu/data/dampak dijelaskan | DONE | Kategori Log; jalur logger dan call sites diperiksa |
| Tingkat risiko dan klaim aktual vs potensial dibedakan | DONE | Risiko potensial Low; tidak ada bukti kebocoran rahasia aktual |
| Mitigasi ditentukan tanpa menghilangkan detail debugging secara tidak perlu | DONE | Tidak ada perubahan kode; rekomendasi bersyarat dan spesifik bila ditemukan pola sensitif |
| Hasil verifikasi teknis | DONE | Logger dan pemanggil ditinjau; test suite sebelumnya 316/316 PASS; path workspace terlihat hanya pada output lokal test/development |
| Screenshot khusus P12 | PARTIAL | Screenshot kode, laporan, dan hasil verifikasi belum tersedia |

**Status P12 keseluruhan: PARTIAL**, karena screenshot pendukung masih perlu diambil manual.

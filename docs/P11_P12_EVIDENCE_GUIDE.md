# P11/P12 Evidence Guide

Existing images and logs are listed in `docs/P11_AUDIT_REPORT.md`. Do not edit, crop to alter results, or replace historical evidence. Save new screenshots as genuine captures in the paths below; avoid showing tokens, personal device identifiers, or private account data.

## Final audit snapshot (2026-11-26)

- GitHub Issues: **13 total**, **5 labeled `bug`**. #16 and #17 are closed historical fixes.
- GitHub branches: `master` and `feat/assignment-completion`; no `v1.0_dev` branch or tags were returned by the live API.
- Latest Actions run: [45840998030](https://github.com/cyberEagleOne/meno/actions/runs/45840998030), conclusion **success**. Unit tests, TypeScript and lint passed. **Build release APK and Upload APK artifact were skipped** because the ILT3 database was unavailable in that runner. Do not use this screenshot as proof of an APK build.
- Local image inventory: **16 existing PNG screenshots**, listed below. No screenshot for the live GitHub Issues, latest Actions run, isolated test failure/recovery, or P12 logger audit is present.
- Device check: an Android phone was connected. Its initial foreground app was not Meno. Opening Meno showed a saved-progress screen, so no new image was retained. No screenshot of another app was saved.

## Evidence collected automatically

These are actual command/API outputs, not screenshots or reconstructed results:

| File | Contents / provenance |
|---|---|
| `docs/evidence/P11/github-issues-final-2026-11-26.json` | GitHub CLI list with all 13 Issues, states, labels, URLs, and computed total/bug count |
| `docs/evidence/P11/github-issue-16-17-final-2026-11-26.txt` | GitHub API detail and closing comments for #16 and #17, including labels and `completed` close reason |
| `docs/evidence/P11/git-branches-tags-final-2026-11-26.txt` | Default branch, local/tracking refs, remote branch head SHAs, and local/remote tags (none) |
| `docs/evidence/P11/actions-run-45840998030-final.json` | GitHub Actions run/job/step status and conclusion |
| `docs/evidence/P11/actions-run-45840998030-logs.txt` | Records that `gh run view --log` exited 0 but returned no log text; no APK log exists because build was skipped |
| `docs/evidence/P11/unit-tests-restored.txt` | Previously captured full local Jest output: 26 suites / 316 passed / 0 failed / 0 skipped; inspected, not rerun in this pass |
| `docs/evidence/P11/controlled-failure-output.txt` | Previously captured isolated Jest failure and exit code 1; inspected, not rerun in this pass |
| `docs/evidence/testing/controlled-failure.log` | Historical Windows failure output; preserved unchanged |
| `docs/evidence/P12/logger-implementation-source.txt` | Actual source excerpt from `src/services/logger.ts` captured for review |
| `docs/evidence/P12/logger-test-verification-excerpt.txt` | Verbatim lines extracted from restored full-suite output showing logger test PASS and 316-test summary; not a new run |

GitHub facts, branch/tag facts, run status, logger implementation, and test outcomes can be verified from these files without screenshots. `gh run view --log` yielded no raw workflow log; the structured run response still reports each relevant step.

| Screenshot filename | Page/app to open | Required visible condition | Purpose | Status / save folder |
|---|---|---|---|---|
| `p11-github-issues-list.png` | GitHub `cyberEagleOne/meno` → Issues | Issue list showing at least 10 real entries; include repository identity and enough titles to count | Verify issue inventory and live list | `docs/evidence/P11/` |
| `p11-github-bug-issues.png` | GitHub Issues, filtered to bug labels or bug titles | Each claimed bug visible with title and issue number; capture enough pages to show the true count and status | Verify which issues are actual bug reports | `docs/evidence/P11/` |
| `p11-issue-16-closed-fixed.png` | GitHub Issue #16 | Closed state, `bug` label, historical/fixed text and fix/test evidence visible | Verify retrospective Issue #16 is not active | `docs/evidence/P11/` |
| `p11-issue-17-closed-fixed.png` | GitHub Issue #17 | Closed state, `bug` label, historical/fixed text and fix/test evidence visible | Verify retrospective Issue #17 is not active | `docs/evidence/P11/` |
| `p11-github-development-branch.png` | GitHub repository → branch selector/Branches | Show actual branches `master` and `feat/assignment-completion`; make clear no `v1.0_dev` branch exists | Verify branch state and document the available development candidate | `docs/evidence/P11/` |
| `p11-unit-tests-pass.png` | Terminal in project root | Full Jest summary showing `26 passed`, `316 passed`, `0 failed`, `0 skipped` | Visual proof of the restored passing suite | `docs/evidence/P11/` |
| `p11-unit-test-failure.png` | Terminal in project root | Isolated demo's Jest failure summary and process exit code `1` | Show failed assertion and quality-gate nonzero result | `docs/evidence/P11/` |
| `p11-unit-tests-restored.png` | Terminal in project root | Full Jest summary after temporary test removal: `316 passed`, `0 failed`, `0 skipped` | Prove recovery after demonstration | `docs/evidence/P11/` |
| `p11-github-actions-latest.png` | GitHub repository → Actions → latest relevant workflow run | Run ID, commit/branch, conclusion, and job steps/status visible | Verify current hosted CI result (not a historical document claim) | `docs/evidence/P11/` |
| `p11-app-running.png` | Meno on Android device/emulator | App open on a real current screen, with no test or mock UI | Show app running during testing | **Existing evidence:** `docs/evidence/physical-android/release-fdf056c-01-startup.png`; optional fresh capture in `docs/evidence/P11/` |
| `p11-feature-progress.png` | Meno on Android | A feature under test (reader, daily verse, random chapter, reminders, or progress) visibly working | Show development/testing progress | **Existing evidence:** reader and random-chapter images under `docs/evidence/physical-android/`; progress image `docs/evidence/ui-review/03-progress-expo-go-avd.png`; optional fresh capture in `docs/evidence/P11/` |
| `p12-logger-source.png` | Editor at `src/services/logger.ts` | `parsedError` construction and `outputToConsole` visible; no secrets in editor or desktop | Support the code-path finding | `docs/evidence/P12/` |
| `p12-security-finding.png` | This report open in editor/viewer | Risk rating and potential-vs-proven conclusion visible | Show P12 risk assessment | `docs/evidence/P12/` |
| `p12-verification-tests.png` | Terminal in project root | Passing logger tests/full suite after review | Show verification; do not imply a code mitigation was made | `docs/evidence/P12/` |

## Screenshot yang belum tersedia

Screenshot berikut tidak ada di repository. Data GitHub, Git, dan test untuk item terkait sudah tersedia pada artefak tekstual di atas; ambil screenshot manual hanya bila laporan/presentasi mewajibkan gambar UI, bukan sekadar bukti datanya.

- [ ] `p11-github-issues-list.png` — Issues #3–#13, #16, #17 (13 total; #14/#15 adalah PR), bila screenshot GitHub diwajibkan.
- [ ] `p11-github-bug-issues.png` — filter label `bug` untuk #3, #4, #13, #16, #17, bila screenshot GitHub diwajibkan.
- [ ] `p11-issue-16-closed-fixed.png` — detail #16, label `bug`, closed, fix `db4063f` dan test, bila bukti visual Issue diwajibkan.
- [ ] `p11-issue-17-closed-fixed.png` — detail #17 dengan informasi yang sama, bila bukti visual Issue diwajibkan.
- [ ] `p11-github-development-branch.png` — branch page, bila screenshot GitHub diwajibkan (data branch sudah tersimpan otomatis).
- [ ] `p11-github-actions-latest.png` — run #45840998030; tunjukkan tests/type/lint PASS dan APK build/upload **skipped**, bila screenshot Actions diwajibkan.
- [ ] `p11-unit-tests-pass.png`, `p11-unit-test-failure.png`, `p11-unit-tests-restored.png` — hanya bila screenshot terminal diwajibkan; hasil terminal tekstual yang asli sudah tersedia.
- [ ] `p12-logger-source.png`, `p12-security-finding.png`, `p12-verification-tests.png` — hanya bila bukti P12 harus berupa screenshot; source, laporan, dan hasil test tekstual sudah tersedia.

Tidak ada kebutuhan screenshot manual untuk memverifikasi angka Issues, branch/tag, status Actions, atau hasil test karena bukti sumber tekstual langsung sudah dikumpulkan. Satu-satunya visual yang belum bisa dibuktikan otomatis adalah kondisi Meno yang sedang berjalan saat ini; screenshot lama aplikasi tersedia, tetapi bukan capture baru dari sesi audit ini.

### Bukti visual yang sudah memenuhi kategori aplikasi

- [x] Aplikasi berjalan pada layar nyata: `docs/evidence/physical-android/release-fdf056c-01-startup.png` (tangkapan historis, bukan kondisi perangkat saat audit ini).
- [x] Fitur dan progress aplikasi: reader/random chapter ada di `docs/evidence/physical-android/`; progress ada di `docs/evidence/ui-review/03-progress-expo-go-avd.png` dan `docs/evidence/android/07-progress-after-expogo-restart.png`.
- [x] Kegagalan runtime Android: `docs/evidence/android/02-x86_64-storage-error.png` (bukti x86_64/SQLite; bukan bukti unit test gagal).

Screenshot aplikasi Meno sudah tersedia dalam inventaris berikut. Ambil ulang screenshot aplikasi hanya jika perlu bukti kondisi perangkat/build terbaru.

## Existing evidence that can be referenced

- `docs/evidence/android/`: `02-x86_64-storage-error.png`, `04-avd-current-screen.png`, `05-expo-go-launch.png`, `06-home-expo-go-avd.png`, `07-progress-after-expogo-restart.png`.
- `docs/evidence/physical-android/`: `01-startup.png`, `release-db4063f-startup.png`, `release-fdf056c-01-startup.png`, `release-fdf056c-02-reader-real-bible.png`, `release-fdf056c-03-pasal-acak-alert.png`, `release-fdf056c-04-reader-filemon-acak.png`.
- `docs/evidence/ui-review/`: `01-home-expo-go-avd.png`, `02-library-expo-go-avd.png`, `02-reader-expo-go-avd.png`, `03-progress-expo-go-avd.png`, `04-settings-expo-go-avd.png`.
- Historical Windows failure: `docs/evidence/testing/controlled-failure.log` (preserve unchanged).
- New local isolated failure output: `docs/evidence/P11/controlled-failure-output.txt` (raw terminal output and exit code; not a screenshot).
- App screenshots: `docs/evidence/android/`, `docs/evidence/physical-android/`, and `docs/evidence/ui-review/`.
- Historical Android startup and x86_64 failure logs: `docs/evidence/physical-android/` and `docs/evidence/android/`.

Screenshot GitHub dan terminal di checklist harus ditangkap manual dari kondisi live/lokal saat ini. Jangan merepresentasikan dokumen lokal sebagai screenshot GitHub.

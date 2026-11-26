# P11 Audit Report

**Audit date:** 2026-11-26

**Repository state inspected:** local checkout, branch `master`, HEAD `df0f6d9100332eb0fa02c95cfceac2639bcf5708

**Scope:** local project, repository metadata, GitHub Issues and workflow. During the requested finalization, two historical bug Issues (#16, #17) were created, labeled `bug`, and closed as completed. No existing Issue or PR, branch, tag, commit, push, or release was changed.

## Evidence boundary

During the finalization pass on 2026-11-26, `gh auth status`, `gh issue list`, `gh api` (branches/tags), and `gh run view` succeeded. GitHub #14 and #15 are merged Pull Requests, so the two local findings were filed as new Issues #16 and #17. Those new Issues are closed historical records, not active bugs. No existing Issue or PR was edited.

## Repository starting point

| Check | Verified result |
|---|---|
| Working tree before audit | Clean |
| Active branch | `master` |
| HEAD | `df0f6d9`, merge of PR #15 according to local commit metadata |
| Local/remote-tracking branches | `master`, `feat/assignment-completion`, `origin/master`, `origin/feat/assignment-completion`; `origin/HEAD` points at `origin/master` |
| Branch relation | `feat/assignment-completion` is 4 commits behind `master`, 0 commits ahead |
| Local tags | None found |
| App/package version | `1.0.0` in `app.json` and `package.json` |
| ILT3 database | Present locally at `assets/database/ilt3.sqlite`; not added or changed by this work |

The local workflow mentions `v1.0_dev` in its push trigger, but no such local or remote branch is present in the inspected refs. GitHub reported branches `master` and `feat/assignment-completion`; the local checkout has the corresponding tracking refs. No release tag was returned by GitHub or found locally. No branch/tag recommendation was applied.

## Issue inventory

The following inventory transcribes and classifies `docs/ISSUE_TRACKER.md`, then checks it against the live GitHub Issues list. Issues #3–#13, #16 and #17 all exist; titles, labels, and states below match the read-only live query performed on 2026-11-26.

| No | Issue (as recorded locally) | Type / classification | Status in tracker | Evidence / action |
|---:|---|---|---|---|
| 3 | Notification denial keeps the pre-prompt `canAskAgain` value | Bug; fixed | Closed | Live issue #3; resolution and regression tests described in issue body |
| 4 | Goal form load effect triggers lint-blocking synchronous state update | Build/lint defect; fixed | Closed | Live issue #4; resolution and test evidence described in issue body |
| 5 | Decide Bible translation license and replace synthetic reader text | Feature/content decision | Open | Live labels: documentation, enhancement |
| 6 | Verify SQLite CRUD persistence across Android process restart | Needs Verification / acceptance test | Open | Live enhancement label; not a confirmed bug |
| 7 | Exercise Android notification permission grant, denial and scheduling | Needs Verification / acceptance test | Open | Live enhancement label; not a confirmed bug |
| 8 | Verify shake navigation sensor lifecycle and cooldown | Needs Verification / acceptance test | Open | Live enhancement label; not a confirmed bug |
| 9 | Verify biometric and PIN lock success, cancellation and fallback | Needs Verification / acceptance test | Open | Live enhancement label; not a confirmed bug |
| 10 | Capture Android UI, keyboard and accessibility review evidence | Improvement / Needs Verification | Open | Live labels: accessibility, documentation |
| 11 | Upgrade `upload-artifact` action to remove Node 20 runtime deprecation | CI improvement | Open | Live enhancement label |
| 12 | Plan compatible remediation for remaining npm audit advisories | Security improvement | Open | Live enhancement label |
| 13 | Android launch falls into local SQLite bootstrap error | Bug; x86_64 runtime/package defect | Open | Live issue includes APK ABI mismatch, Logcat and screenshot evidence |
| 14* | GitHub #14 is a merged Pull Request: `Feat/assignment completion` | Not an Issue | Closed / merged | Verified through GitHub API; do not use this number for a draft issue |
| 15* | GitHub #15 is a merged Pull Request: `Complete Meno app improvements` | Not an Issue | Closed / merged | Verified through GitHub API; do not use this number for a draft issue |
| 16 | Daily Verse did not normalize external Bible book IDs before navigation (fixed) | Historical bug; fixed, not active | Closed | Created with `bug` label; fix and regression coverage in `db4063f` |
| 17 | Reading Goal accepted fractional targets and overlong notes (fixed) | Historical bug; fixed, not active | Closed | Created with `bug` label; fix and regression coverage in `db4063f` |

`*` Prior versions of this tracker used local finding IDs #14 and #15. These collide with actual GitHub Pull Request numbers. They are now recorded as GitHub Issues #16 (Draft A) and #17 (Draft B).

### Bug count and P11 issue criterion

Five historical defects are supported by repository evidence: #3 (notification permission response), #4 (lint-blocking goal form effect), #13 (x86_64 SQLite runtime failure), #16 (Daily Verse external book ID routing), and #17 (goal validation). **All five are now GitHub Issues labeled `bug`.** Issues #16 and #17 are closed historical records and are not reproducible on current HEAD because fixes have landed. The 13 total Issues comprise five bug Issues and eight feature/improvement/acceptance Issues.

### Issue #16 / Draft A — retrospective fixed bug

**Title:** `[BUG] Daily Verse chapter navigation did not normalize external Bible book IDs`

**Problem:** Before `db4063f`, the REST response's `book_id` was copied to the app's Daily Verse model. External IDs such as `JHN`/`PSA` did not match the app's Indonesian canonical IDs, so the "Baca Pasal Lengkap" link could route to a book the reader could not find. Missing IDs defaulted to `joh` and chapter `3`, which could send the reader to a guessed reference.

**Steps to Reproduce (pre-fix revision):**
1. Run the pre-fix Daily Verse API code with a response containing `book_id: "JHN"`, `chapter: 3`, and a reference such as `John 3:16`.
2. Tap "Baca Pasal Lengkap" on the Daily Verse card.
3. Observe navigation to `/reader/JHN/3`, which does not match the Indonesian canon ID `yohanes`.
4. Repeat with `book_id` missing; the old code defaulted to `joh` and chapter `3` rather than deriving/validating the reference.

**Expected Result:** Normalize recognized external IDs to canonical IDs and navigate only when the book/chapter is verified; otherwise omit the navigation action.

**Actual Result (pre-fix):** The unnormalized identifier failed reader lookup; absent identifiers were guessed as `joh`/chapter 3.

**Evidence:** `git show db4063f^:src/data/dailyVerseRepository.ts` shows the old direct-copy/default behavior at lines 118–119. Commit `db4063f` added normalization/reference parsing and tests; `src/data/__tests__/dailyVerse.test.ts` and `src/components/ui/__tests__/DailyVerseCard.test.tsx` cover mappings and safe omission. Current app uses local ILT3 Daily Verse instead of this REST navigation path, so this is a verified historical bug, fixed and not reproducible on HEAD.

**GitHub disposition:** [Issue #16](https://github.com/cyberEagleOne/meno/issues/16), labeled `bug`, closed as completed. It is a retrospective record, not an active defect.

### Issue #17 / Draft B — retrospective fixed bug

**Title:** `[BUG] Reading Goal validation accepted fractional targets and notes over 200 characters`

**Problem:** Before `db4063f`, `validateReadingGoal` used `parseInt` and only checked the note's minimum length. This accepted numeric prefixes such as `3.5` as 3, strings such as `2 chapters` as 2, and notes longer than the documented 200-character limit.

**Steps to Reproduce (pre-fix revision):**
1. Open Settings and enter `3.5` for target chapters with a valid note.
2. Submit; the old validator parsed the target as 3 and accepted it.
3. Repeat with `2 chapters`; `parseInt` parsed a valid prefix.
4. Enter a 201-character reflection note and submit; no maximum-length validation rejected it.

**Expected Result:** Accept only whole-number targets from 1 to 50 and notes from 5 through 200 trimmed characters.

**Actual Result (pre-fix):** Decimal/mixed strings with a valid integer prefix passed; over-200-character notes passed.

**Evidence:** `git show db4063f^:src/domain/settingsValidation.ts` shows `parseInt` and no upper note bound. Commit `db4063f` introduced the strict integer regex and 200-character maximum. Current regression coverage in `src/domain/__tests__/settingsValidation.test.ts` rejects `3.5`, `2 chapters`, and 201 characters, and accepts the 200-character boundary. Fixed and not reproducible on HEAD.

**GitHub disposition:** [Issue #17](https://github.com/cyberEagleOne/meno/issues/17), labeled `bug`, closed as completed. It is a retrospective record, not an active defect.

### Issue criterion status

- At least 10 Issues: **DONE** — 13 GitHub Issues (#3–#13, #16, #17) verified.
- At least 5 bug Issues: **DONE** — #3, #4, #13, #16 and #17 carry the `bug` label; #16/#17 are marked fixed, closed historical records.
- Relevant feature/improvement Issues: **DONE** — eight Issues (#5–#12) cover content, acceptance, accessibility, CI, and security work.

## Local test and static-check results

| Metric | Result |
|---|---:|
| Test suites | 26 passed |
| Test cases | 316 passed |
| Failed | 0 |
| Skipped | 0 |
| Executed | 316 |
| TypeScript (`fnm exec --using=22 -- npx tsc --noEmit`) | PASS |
| ESLint (`fnm exec --using=22 -- npm run lint`) | PASS |
| `git diff --check` | PASS at the audit verification point |

Run command: `fnm exec --using=22 -- bash -c 'CI=1 npm test -- --runInBand --silent'`. Node 22 is used because the repository's disk-SQLite suite uses Node's `node:sqlite`. The test inventory is in `docs/TESTING.md`. It includes unit/component tests and disk-backed SQLite repository integration coverage. Some application boundaries are intentionally mocked; the 316 count is a Jest case count and is not a claim that every case runs a device or the bundled ILT3 asset.

## Controlled failed-test demonstration

A temporary test with an intentionally false equality assertion was created only for this demonstration under `src/domain/__tests__/controlled-failure.demonstration.test.ts`. Jest ran just that file. It reported **1 failed suite, 1 failed test**, with expected `"expected"` and received `"actual"`; the Jest process exit code was **1**. The captured terminal output, including the explicit exit code, is `docs/evidence/P11/controlled-failure-output.txt`.

The temporary test file was removed immediately after the run. It is not part of the final test tree. The complete suite was rerun after restoration and passed 316/316 (see final validation below). The workflow YAML orders tests before TypeScript, lint, and conditional build steps, with normal sequential Actions behavior; a failed test step prevents later steps in that job from running. This is a workflow-configuration conclusion, not evidence of a currently failing GitHub Actions run. No deployment step exists in the checked-in workflow.

Historical evidence remains untouched at `docs/evidence/testing/controlled-failure.log`. That file is a previous Windows/PowerShell captured failure (154 tests, 1 failed); it is distinct from the new reproducible local demonstration.

## CI/CD audit

Verified from `.github/workflows/android-ci.yml`:

1. Push/PR triggers are configured for selected branches.
2. CI installs dependencies with Node 22.
3. Jest runs before TypeScript and lint.
4. The workflow checks for `assets/database/ilt3.sqlite`.
5. Android export, native prebuild, Gradle ARM64 release APK build, and artifact upload run only when that database is present.
6. No deployment/publication step is configured.

The current local checkout has the ILT3 database. The latest live run inspected, [45840998030](https://github.com/cyberEagleOne/meno/actions/runs/45840998030), completed successfully on `master` at HEAD `df0f6d9`. Unit tests, TypeScript, and lint passed. The database check succeeded as a workflow step, but the runner did not have the local database; Android export, prebuild, APK build, and artifact upload were skipped. This is a successful validation run, not a successful APK build. Branch protection settings were not inspected.

## Screenshot and evidence inventory

Existing committed evidence includes 16 screenshots under `docs/evidence/android/`, `docs/evidence/physical-android/`, and `docs/evidence/ui-review/`. The filenames are enumerated in `docs/P11_P12_EVIDENCE_GUIDE.md`. They show app screens, reader/random chapter flows, an x86_64 SQLite startup failure, and physical-device startup. Text logs document device/app startup and prior testing.

This final evidence collection added direct textual/API evidence under `docs/evidence/P11/`: the complete live Issue inventory, #16/#17 details and close comments, branch/default-branch/tag output, and Actions run status/steps. Test results remain the existing captured files `unit-tests-restored.txt` and `controlled-failure-output.txt`; no tests were rerun. See `docs/P11_P12_EVIDENCE_GUIDE.md` for the evidence index and log availability note.

During this final evidence pass, an Android phone was connected. The initial foreground screen was another app. Bringing Meno forward showed its saved progress screen; no new screenshot was retained because it contained personal reading activity. The existing app screenshots are historical captures and are identified as such in the evidence guide.

Evidence still missing or not verifiable from local files:

- A current GitHub Issues list showing at least 10 Issues and their live state.
- A current GitHub Actions page/run and status.
- A screenshot of the new local controlled failure and a post-restoration PASS screen (the raw terminal output file exists, but no screenshot was generated).
- A screenshot of the development branch in GitHub (no branch changes were made).
- New progress screenshots documenting this audit's work.
- A dedicated P12 screenshot of logger code/findings and verification.

The live GitHub Issues and Actions state is verified through `gh` for this audit; the missing items above are visual screenshot artifacts only.

See `docs/P11_P12_EVIDENCE_GUIDE.md` for manual capture instructions. No screenshots are claimed beyond files actually present in the repository.

## Requirement status summary

| Requirement | Status | Reason |
|---|---|---|
| 10 valid GitHub Issues | DONE | 13 Issues (#3–#13, #16, #17) verified on GitHub |
| 5 genuine bug Issues | DONE | #3, #4, #13, #16, #17 are labeled `bug`; #16/#17 are explicitly fixed historical defects |
| Development branch/version path | PARTIAL | Live branches are `master` and `feat/assignment-completion`; no tags or `v1.0_dev` branch |
| Development/testing | PARTIAL | Local checks pass; current GitHub/physical-device acceptance not re-run here |
| 200+ tests and all required pass | DONE locally | 316/316, no skipped cases in current local Jest run |
| Failed-test demonstration and recovery | DONE locally | Isolated exit code 1 captured; fixture removed; full suite restored and passed |
| CI/CD status verification | DONE for latest run | Run `45840998030` on `master` succeeded; CI skipped Android APK build/export because ILT3 was unavailable on runner |
| Progress and requested screenshot set | PARTIAL | Existing app evidence; several GitHub/test/P12 screenshots remain manual |
| P11 documentation | DONE | This report and evidence guide created; external evidence gaps remain explicit |

**Status P11 keseluruhan: PARTIAL.** Issue count/bug label count, local test results, and latest CI check are evidenced. Screenshot capture remains manual; the development/version branch flow also does not contain a `v1.0_dev` branch or release tags.

## Final verification commands

```bash
fnm exec --using=22 -- bash -c 'CI=1 npm test -- --runInBand --silent'
fnm exec --using=22 -- npx tsc --noEmit
fnm exec --using=22 -- npm run lint
git diff --check
```

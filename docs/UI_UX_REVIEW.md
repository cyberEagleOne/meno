# UI/UX Review

## Current review status

Source inspection confirms Indonesian labels, shared UI components, safe-area use in main routes, form labels/accessibility labels in several controls, loading/error/empty/success feedback, and scrollable screen layouts. This is a source review only.

An API 37 x86_64 AVD screenshot is at `docs/evidence/android/02-x86_64-storage-error.png`, with Logcat and install metadata alongside. It shows the real APK's SQLite bootstrap error because `libexpo-sqlite.so` was packaged only for ARM64. This is failure evidence, not a successful dashboard/UI review. No home, reader, or form success screenshot has been captured. Screen-size comparison, keyboard walkthrough, TalkBack, font scaling, touch-target, and contrast checks remain outstanding.

## Outstanding review checklist

- [ ] Capture home/dashboard from a running build.
- [x] Capture a meaningful SQLite startup error from a running APK (not a passing UI state).
- [ ] Capture an active reader chapter.
- [ ] Capture form validation with keyboard open and submit reachable.
- [ ] Capture a meaningful loading/error/success state.
- [ ] Check compact and larger device dimensions for clipping/overflow.
- [ ] Check keyboard focus, scrolling, submit visibility, and dismissal.
- [ ] Check TalkBack labels/order, font scaling, contrast, and touch targets.
- [ ] Exercise all key actions and confirm immediate feedback.

Do not treat generated/mockup images as runtime screenshots. The current reader's synthetic verse text must remain visibly labelled as a placeholder.

# Meno — Design System

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.1.0 (planning) |
| Last updated | 2026-10-10 |
| Author | AI-assisted draft (opencode), generated with the `ui-ux-pro-max` skill; not yet reviewed by the student |

> **Provenance:** Every recommendation below was produced by running the bundled `ui-ux-pro-max` search script against its local datasets on 2026-10-10. The exact query, domain, and source CSV are recorded so each claim is traceable and reproducible. Where a returned recommendation did not fit a calm mobile Bible app, that is stated explicitly. Tokens marked **[Proposed]** are my synthesis, not raw dataset output.

---

## 1. Design direction

**North star: "A quiet place to read — with gentle encouragement."**

Scripture is the centre. The interface is calm, spacious, and typographically respectful of long-form reading. Habit mechanics (streaks, daily goals, progress) are rendered as a **soft, supportive accent layer**, never as loud, competitive, or attention-stealing graphics.

**Chosen combination (synthesis of dataset results):**
- **Base style:** *Minimalism & Swiss Style* + *Accessible & Ethical* — clarity, spacing, high contrast, reduced motion.
- **Reading texture:** *E-Ink / Paper* feel (warm, low-glare surfaces) for the reader.
- **Gamified accents:** *Soft UI Evolution* + *Micro-interactions* (small, tactile, calm feedback), with *Soft Rounded* type for encouraging moments.
- **Not chosen:** Claymorphism as the overall style (too toy-like for Scripture), Dark Mode (OLED) as the default (offered as an optional theme later).

---

## 2. Raw ui-ux-pro-max outputs (evidence)

### 2.1 Design-system queries
```
python3 .opencode/skills/ui-ux-pro-max/scripts/search.py "mobile bible reading habit app calm scripture gamified" --design-system -p "Meno" -f markdown
python3 .opencode/skills/ui-ux-pro-max/scripts/search.py "calm spiritual scripture reading mobile app" --design-system -p "Meno" -f markdown
```
Both returned the same result (`ui-reasoning`/pattern aggregation). **Assessment: partially off-brief and applied with caution.**
- Pattern → **Hero-Centric Design** (a landing/marketing pattern; **not applicable** to a mobile app shell).
- Style → **Minimalism & Swiss Style** (useful base).
- Colors → red palette (`#DC2626`, `#EF4444`, bg `#FEF2F2`, fg `#450A0A`). **Rejected** for Meno: the "breaking red + link blue" association is wrong for a calm reading app.
- Typography → Heading **Inter**, Body **Playfair Display** (editorial/type-as-hero, "reading platforms" listed). Partially relevant.

### 2.2 Product patterns
```
... --domain product "mobile habit tracker reading progress"
... --domain product "bible religious church scripture"
```
- **Book & Reading Tracker** → Primary style *Swiss Modernism 2.0 + Minimalism & Swiss Style*; secondary *E-Ink / Paper*, *Soft UI Evolution*; palette focus **"Warm paper white + ink brown + reading progress green + book cover colors."**
- **Habit Tracker** → *Claymorphism + Vibrant & Block-based*; secondary *Micro-interactions*; palette **"Streak warm (amber/orange) + progress green + motivational accents."**
- **Church/Religious Organization** → *Accessible & Ethical + Soft UI Evolution*; secondary *Minimalism & Swiss Style*, *Inclusive Design*; palette **"Warm Gold + Deep Purple/Blue + White."**

### 2.3 Color palettes
```
... --domain color "calm spiritual reading wellness"
```
Relevant returned palettes (verbatim hex values):

| Product type (source label) | Primary | Secondary | Accent | Background | Foreground | Notes |
|---|---|---|---|---|---|---|
| **Church/Religious Organization** | `#7C3AED` | `#A78BFA` | `#A16207` | `#FAF5FF` | `#4C1D95` | Spiritual purple + warm gold |
| **Book & Reading Tracker** | `#78716C` | `#92400E` | `#D97706` | `#FFFBEB` | `#0F172A` | Book brown + page amber |
| **Meditation & Mindfulness** | `#7C3AED` | `#8B5CF6` | `#059669` | `#FAF5FF` | `#0F172A` | Calm lavender + mindful green |
| Healthcare App | `#0891B2` | `#22D3EE` | `#059669` | `#ECFEFF` | `#164E63` | Calm cyan + health green |

### 2.4 Style options
```
... --domain style "calm minimal reading dark mode"     -> Dark Mode (OLED)
... --domain style "soft playful gamified friendly mobile" -> Claymorphism; Micro-interactions;
                                                             Tactile Digital / Deformable UI;
                                                             Material 3 Expressive (Mobile)
```
- **Micro-interactions** (chosen for gamified feedback): small 50–100ms animations, tactile/haptic feedback, success/error states. Accessibility: risk low.
- **Claymorphism** (rejected as base, may inform playful badges only): playful/toxic risk `conditional`.
- **Dark Mode (OLED)**: optional future theme; light mode "not recommended" by the dataset, so it is deliberately **not** the default.

### 2.5 Typography
```
... --domain typography "readable serif scripture editorial book"
... --domain typography "friendly modern readable ui sans"
```
Returned pairings (verbatim fonts + URLs):

| Pairing | Heading | Body | Mood | Best for |
|---|---|---|---|---|
| **Editorial Classic** | Cormorant Garamond | Libre Baskerville | editorial, classic, literary, bookish | Publishing, literary reading |
| **News Editorial** | Newsreader | Roboto | readable, informative | News/long-form, UI |
| **Minimalist Monochrome Editorial** | Playfair Display | Source Serif 4 (+ JetBrains Mono) | high-contrast e-reader | E-reader aesthetics |
| **Classic Elegant** | Playfair Display | Inter | elegant, premium | Reading/luxury |
| **Soft Rounded** | Varela Round | Nunito Sans | soft, friendly, warm | Wellness, soft UI |
| **Friendly SaaS** | Plus Jakarta Sans | Plus Jakarta Sans | friendly, modern, clean | Apps/dashboards |

- **Scripture text** → serif, long-form optimised: **Source Serif 4** or **Libre Baskerville** (dataset: "designed for long-form reading").
- **UI/headings** → friendly but calm sans: **Plus Jakarta Sans** or **Inter**.
- **Encouraging moments** (streak badges) → **Varela Round / Nunito Sans** ("Soft Rounded") sparingly.

### 2.6 UX and platform guidance
```
... --domain ux "bottom navigation tab bar mobile reading"   -> Back Button; Sticky Nav; Mobile-first
... --domain ux "streak progress gamification reward"        -> Progress Indicators
... --domain web "bottom tab safe areas accessibilityLabel touch targets"
... --domain chart "habit streak calendar progress"
```
Key rules captured (severity from dataset):
- **[Critical] Touch target size:** 44pt iOS / 48dp Android; platform-select, do not collapse into one number.
- **[Critical] Icon button labels:** icon-only buttons must expose `accessibilityLabel`.
- **[High] Safe Area Insets:** wrap screens in `SafeAreaView`/apply insets; no tappable content under notch/gesture bars.
- **[Medium] Bottom tabs:** max 5 primary items (move extras to More/Settings).
- **[Medium] Touch spacing:** ≥8dp between adjacent touchables.
- **[Medium] Progress indicators:** show progress for multi-step/reading goals.
- Charts for streaks/progress: Raindrop/Heatmap for daily activity, Gauge/Bullet for goal vs target, Line for trend over time.

### 2.7 React Native stack guidance
```
... --stack react-native "virtualized list long list performance"
```
- **[High]** Use `FlatList` for 50+ items (never `ScrollView` + `.map()` for long lists).
- **[High]** Memoize list item components (`React.memo`).
- **[High]** Provide `keyExtractor` with a stable ID (not index).
- **[Medium]** Use context sparingly (theme/auth/locale — not frequently changing data).
- Applies to react-native 0.86.x (the active SDK 57 line).

---

## 3. Proposed design tokens **[Proposed]**

Derived from the *Church/Religious* and *Book & Reading Tracker* palettes above, adjusted for calm and WCAG contrast. Final values to be contrast-checked before implementation.

### 3.1 Color (light — default)
| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#FFFBEB` (warm paper) | App background (from Book & Reading Tracker) |
| `--color-surface` | `#FFFFFF` | Cards, reader paper |
| `--color-ink` | `#1F1B24` | Primary text (near-ink, not pure black) |
| `--color-ink-muted` | `#475569` | Secondary text (dataset muted value) |
| `--color-primary` | `#4C1D95` (deep indigo) | Brand, header (from Church foreground) |
| `--color-accent` | `#B45309` (warm gold) | CTA, highlights (adapts Church `#A16207`) |
| `--color-progress` | `#059669` (calm green) | Progress/streak success (from meditation/health) |
| `--color-streak` | `#D97706` (amber) | Streak flame accent (from Habit Tracker) |
| `--color-border` | `#EEEDED` | Dividers (dataset Book Tracker border) |
| `--color-danger` | `#DC2626` | Destructive only |

### 3.2 Color (dark — optional theme, later)
Based on returned **Dark Mode (OLED)** style: bg `#000000`/`#121212`, text `#E0E0E0`, minimal glow, warm gold and progress-green accents. Deferred until the light theme is complete.

### 3.3 Typography
| Token | Font | Use |
|---|---|---|
| `--font-scripture` | Source Serif 4 (fallback: Georgia, serif) | Bible verse text |
| `--font-ui` | Plus Jakarta Sans (fallback: system sans) | UI labels, navigation |
| `--font-display` | Playfair Display | Section titles / reading headings |
| `--font-reward` | Nunito Sans (rounded) | Streak/achievement moments only |

Scripture sizing: start at 18sp body, line-height ≈ 1.6, user-adjustable size (Dynamic Type / font scale) required by accessibility checks.

### 3.4 Spacing / radius / motion
- Spacing rhythm: 4/8dp system (dataset "8dp spacing rhythm"); scale 4, 8, 12, 16, 24, 32, 48.
- Radius: 12–16px for cards (calm), 999 for pill CTAs (from Material 3 result).
- Motion: micro-interactions 50–100ms for feedback; standard transitions 150–250ms; **respect reduced-motion** and keep hero/reader static under it.
- Depth: minimal shadow; use warm surface separation rather than heavy elevation.

---

## 4. Component guidance **[Proposed, based on dataset rules]**

- **Bottom tab bar:** ≤5 tabs (e.g. Read, Progress, Bookmarks later, Settings).
- **Reader:** FlatList of verses, memoized `VerseRow`, stable `keyExtractor`; prev/next chapter controls ≥44/48pt with `accessibilityLabel`.
- **Streak/goal card:** small progress indicator; amber streak accent + green progress; never rely on colour alone (add icon/label).
- **Buttons:** pill primary CTA in deep indigo/gold; pressed feedback via state layer, no layout shift.
- **Icons:** vector only (e.g. Phosphor/Heroicons per `ui-ux-pro-max`); no emoji as structural icons.

## 5. Pre-delivery checklist (from `ui-ux-pro-max`, mobile scope)

- [ ] No emoji used as structural icons; consistent vector icon family.
- [ ] Touch targets ≥44pt (iOS) / ≥48dp (Android); ≥8dp spacing.
- [ ] Icon-only buttons have `accessibilityLabel`.
- [ ] Safe areas respected for headers, tab bar, bottom CTA.
- [ ] Light-mode text contrast ≥4.5:1; theme tokens used (no ad-hoc hex).
- [ ] Reduced motion supported; user font-size scaling supported.
- [ ] Long Bible chapters virtualized and performant.
- [ ] Dark mode (if added) contrast tested independently.

## 6. Open decisions

- **[Open Question]** Confirm the exact light palette and run a contrast audit.
- **[Open Question]** Choose the scripture reading font (Source Serif 4 vs Libre Baskerville) and license/embed it (`@expo-google-fonts`).
- **[Open Question]** Is an app icon/wordmark needed for the submission? (See `design`/`brand` skills — not used yet.)
- **[Open Question]** Whether to include the dark theme within the 12-meeting scope.

## 7. Change log

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-10-10 | Initial UI/UX direction generated from `ui-ux-pro-max`; tokens proposed (not implemented). |

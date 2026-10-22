# Meno — Design System

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.2.1 (P1 theme exploration) |
| Last updated | 2026-10-15 |
| Author | AI-assisted draft (opencode), generated with the `ui-ux-pro-max` skill; not yet reviewed by the student |

> **Provenance:** Every recommendation below was produced by running the bundled `ui-ux-pro-max` search script against its local datasets on 2026-10-10. The exact query, domain, and source CSV are recorded so each claim is traceable and reproducible. Where a returned recommendation did not fit a calm mobile Bible app, that is stated explicitly. Tokens marked **[Proposed]** are my synthesis, not raw dataset output. **Note (2026-10-15):** the `ui-ux-pro-max` skill directory has since been removed from the working tree for third-party licensing review; the raw outputs preserved in §2 below remain the evidence, and the historical commands can no longer be re-run here.

---

## 0. Implemented design (current, as of 2026-10-15)

The app's visual identity **as actually implemented** in the working tree differs from the dataset-driven proposals in §1–§4 below (which are preserved as historical exploration). The implemented identity comes from an **external design handoff** integrated during the design-integration work session (2026-10-14/15):

> **Provenance of the implemented design:** the palette, type stack, and mascot set were integrated from a design handoff produced with **Figma Make** (a local export containing a handoff specification for tokens, components, and route mapping). The handoff files live **outside this repository**; this note records the provenance from the development-session record, not from an in-repo artefact. No student review of this section has occurred yet.

### 0.1 Tokens (implemented — source of truth: `src/theme/colors.ts`)

| Family | Values (implemented) |
|---|---|
| Brand | indigo `#272A55`, indigoDeep `#14163A`, gold `#B69A57`, goldDeep `#8E7638`, goldText `#7A6228`, goldTint `#EFE5CB` |
| Surfaces | ivory `#F7F1E5` (app background), surface `#FFFBF2`, divider `#E3D9C3` |
| Ink | primary text = indigo `#272A55`, inkMuted `#5B5D80`, stone `#A6A49D`, error `#9B3B30` |
| Stat tints | mint `#6CC4A0` / mintTint / mintInk; lavender `#A99FE0` / lavenderTint / lavenderInk; coral `#F28B6B` / coralTint / coralInk |

Radius: `md 16`, `lg 24`, `full 999`. Spacing scale: 4/8/12/16/20/24/32 (`space` token in `colors.ts`). Chunky-button pattern: 4 px bottom edge that shrinks to 1 px on press with a 3 px translate.

### 0.2 Typography (implemented)

**Plus Jakarta Sans** only, via `@expo-google-fonts/plus-jakarta-sans` — five weights loaded in `src/app/_layout.tsx` (`fonts` token in `colors.ts`: 400/500/600/700/800). The historical §3.3 proposal of Source Serif 4 / Playfair Display / Nunito Sans was **not** adopted.

### 0.3 Artwork (implemented)

Eight mascot PNGs in `assets/meno/` — `Calm`, `Celebrating`, `Curious`, `Encouraging`, `Happy`, `Proud`, `ReadyToRead`, `Welcome` — rendered via `expo-image` and the shared `Mascot` component (`src/components/ui/Mascot.tsx`). The artwork is locked raster art used untinted.

### 0.4 Relationship to the historical exploration (§1–§7)

- The §3.1 proposed light palette (`#FFFBEB` background, `#4C1D95` primary) was **superseded** by the implemented ivory/indigo/gold set in §0.1.
- The §3.3 serif scripture-font proposal was **superseded** by the all-Plus-Jakarta-Sans stack in §0.2.
- The §1 style reasoning (calm, minimal, accessible, soft accents; dark mode deferred) **still matches** the implemented identity and remains valid context.
- The pre-delivery checklist in §5 remains applicable to the implemented UI.

---

## 1. Design direction

**North star: "A quiet place to read — with gentle encouragement."**

Scripture is the centre. The interface is calm, spacious, and typographically respectful of long-form reading. Habit mechanics (streaks, daily goals, progress) are rendered as a **soft, supportive accent layer**, never as loud, competitive, or attention-stealing graphics.

**Chosen combination (synthesis of dataset results):**
- **Base style:** *Minimalism & Swiss Style* + *Accessible & Ethical* — clarity, spacing, high contrast, reduced motion.
- **Reading texture:** *E-Ink / Paper* feel (warm, low-glare surfaces) for the reader.
- **Gamified accents:** *Soft UI Evolution* + *Micro-interactions* (small, tactile, calm feedback), with *Soft Rounded* type for encouraging moments.
- **Not chosen:** Claymorphism as the overall style (too toy-like for Scripture), Dark Mode (OLED) as the default (offered as an optional theme later).

### 1.1 Candidate theme exploration (P1)

Four distinct candidate themes were considered for MENO's overall app theme. This is **design desk-reasoning** derived from the §2 dataset outputs, the PRD positioning (§2, §4), and the implementation constraints — **none of the candidates was tested with users, and no user research backs the strengths or trade-offs below**; they are reasoned expectations, not measured findings.

#### Theme A — "Quiet Paper" (warm minimal editorial) — **SELECTED**

- **Visual direction:** warm ivory paper surfaces (`#F7F1E5`), deep indigo ink (`#272A55`), restrained antique-gold accents (`#B69A57`), soft data tints (mint / lavender / coral) reserved for progress information; one friendly geometric sans (Plus Jakarta Sans); rounded "chunky" controls with a small press-depth; light mascot illustrations used sparingly for encouragement. Long-form verse text sits on low-glare paper-like surfaces (E-Ink / Paper influence, §1).
- **Intended user experience:** a quiet, spacious reading room — Scripture is visually dominant, and habit feedback (progress rings, chapter counts, reading days, milestones) reads as a gentle accent layer rather than a scoreboard. Encouragement arrives at the moment of action (finishing a chapter), then gets out of the way.
- **Strengths:** directly serves the calm/Scripture-first positioning (PRD §2); warm light surfaces suit daytime and commute reading; indigo-on-ivory gives strong text contrast for long sessions; accent colours are semantically reserved for data, so the UI stays quiet; consistent with the deferred-streak scope (PRD §10) because progress is shown as totals, not pressure.
- **Trade-offs:** quieter visual energy means a weaker "excitement" hit than gamified alternatives; the mascot layer risks reading as juvenile if overused (mitigated by using the eight fixed poses only at milestones); one typeface family for both UI and scripture sacrifices the serif/editorial contrast proposed in historical §3.3.

#### Theme B — "Clay Play" (Claymorphism default) — **rejected as base**

- **Visual direction:** puffy extruded 3-D cards and buttons with soft inner highlights and drop shadows, saturated candy colours, exaggerated depth on every surface (the *Claymorphism* style returned for the Habit Tracker query, §2.2/§2.4).
- **Intended user experience:** a playful, toy-like, tactile interface where every control looks squeezable — fun first, formal reading second.
- **Strengths:** distinctive and memorable; inherently strong micro-interaction feedback; friendly to younger or casual users; visually signals "game", which can raise session frequency.
- **Trade-offs:** too toy-like for Scripture (existing §1 verdict, unchanged); universal depth/noise competes with verse text for attention; pastel-on-pastel fills make WCAG contrast harder to guarantee; heavier shadow rendering costs more on low-end devices. Retained in the document as a rejected exploration that may still inform playful badge details only.

#### Theme C — "Night Stand" (Dark / OLED default) — **rejected as default; kept as optional future theme**

- **Visual direction:** near-black surfaces (`#000000`/`#121212`), light grey text, minimal glow, warm gold and progress-green accents (the *Dark Mode (OLED)* style, §2.4; sketch in §3.2).
- **Intended user experience:** a bedside, low-light reading mode that reduces glare and saves battery — the "last chapter before sleep" context of the Returning Reader persona (PRD §4).
- **Strengths:** genuinely useful night-reading scenario; OLED battery savings; the dataset favoured dark for reading apps; would pair well with the deferred dark-theme open decision (§6).
- **Trade-offs:** the mascot artwork and ivory-based identity were designed on light surfaces; long-form text on pure black can halate for some readers; shipping two defaults would double the contrast-audit scope (§5); PRD/§10 treat dark theme as deferred, so it **stays an optional later theme, never the default**.

#### Theme D — "Streak Arena" (competitive habit-tracker gamification) — **rejected**

- **Visual direction:** streak-warm amber/orange flame accents, progress green, large badges and block-based motivational cards, saturated colour throughout (the *Claymorphism + Vibrant & Block-based* Habit Tracker direction and its "streak warm + motivational accents" palette, §2.2).
- **Intended user experience:** urgency and achievement — visible streaks, goals, and rewards that push the reader to keep the chain unbroken.
- **Strengths:** the strongest habit-loop activation of the four; unambiguous feedback; familiar pattern users of mainstream habit apps already understand.
- **Trade-offs:** directly contradicts MENO's stated gap — existing apps that are "heavily gamified in ways that can feel disrespectful of the text" (PRD §2); streak pressure can produce guilt for the lapsed Returning Reader, the primary persona; the mechanics it leans on (streaks, daily goals) are **deferred** in the MVP (PRD §10, BR-3/BR-4), so the theme would promise mechanics the app does not ship; conflicts with benefit B-5 "encouragement without noise".

#### Why MENO selected Theme A

MENO's audience is a low-pressure pair of personas — the **Returning Reader** who wants gentle re-entry into a lapsed habit and the **New Reader** early in faith who needs structure without pressure (PRD §4) — and the product promise is a calm, respectful reading experience with light, encouraging habit mechanics (PRD §2). Theme A is the only candidate that supports *all* of that at once: its paper-quiet surfaces keep Scripture dominant; its accent colour discipline lets the gamified layer (progress rings, completed-chapter counts, distinct reading days, gentle milestones — all implemented per §0 and PRD FR-9/FR-14) feel rewarding without becoming a scoreboard; and it avoids promising deferred mechanics (Theme D) or a juvenile tone (Theme B). Theme C's night-reading benefit is real but can be added later as an optional theme without changing the identity, so it does not need to win the default slot. The selection is **consistent with the implemented interface**: §0.1's ivory/indigo/gold tokens, §0.2's single Plus Jakarta Sans stack, §0.3's mascot set, and the chunky-button press pattern are all Theme A as built; §0.4 records which earlier proposals it superseded. This rationale is design reasoning only — it should be re-validated against the lecturer's feedback and, if the assignment later allows, real user observation; it is **not** a claim that any theme was validated with users.

---

## 2. Raw ui-ux-pro-max outputs (evidence)

> Historical record: the commands below were run on 2026-10-10 against the skill as it existed then. The skill has since been removed from the working tree (see §0 provenance note); the outputs are preserved here verbatim.

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

## 3. Proposed design tokens **[Proposed — historical; superseded by §0 for colour and type]**

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
| 0.2.0 | 2026-10-15 | Added §0 documenting the **implemented** design (Figma Make handoff provenance, `src/theme/colors.ts` tokens, Plus Jakarta Sans, `assets/meno/` mascots); marked §3 colour/type proposals as superseded historical exploration; earlier sections preserved unchanged. |
| 0.2.1 | 2026-10-15 | P1 gap closed: added §1.1 with four explicit candidate themes (Quiet Paper — selected; Clay Play; Night Stand; Streak Arena), each with visual direction, intended UX, strengths, and trade-offs, plus a selection rationale tied to the PRD personas and the implemented §0 design. Explicitly labelled as desk-reasoning with **no user research or user testing** claimed; rejected Claymorphism/Dark-Mode-default exploration and all palette notes preserved unchanged. |

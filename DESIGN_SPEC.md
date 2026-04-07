# Snoof Design Specification

**Version:** 1.2  
**Last Updated:** March 2026  
**Status:** Active

---

## 1. Design Philosophy

Snoof should feel like a warm blanket on a fall afternoon. Every screen should evoke the feeling of curling up with your dog — cozy, unhurried, and emotionally grounding. The design language draws from autumn palettes, natural textures, and the soft comfort of home.

**Core principles:**

- **Warm over clinical.** Pet care apps default to sterile blues and whites. Snoof uses earth tones, cream backgrounds, and soft shadows that feel like home, not a vet's office.
- **Calm over busy.** Generous whitespace, unhurried layouts, and gentle hierarchy. The app should feel spacious even when data-rich.
- **Playful over serious.** Rounded corners, whimsical illustrations, bouncy micro-interactions — but always with restraint. Fun, not childish.
- **Smart over cluttered.** AI features surface naturally. The UI guides without overwhelming. Complexity is hidden behind simplicity.

---

## 2. Color System

### 2.1 Light Mode Palette

#### Primary Colors

| Token                   | Hex       | Usage                                       |
| ----------------------- | --------- | ------------------------------------------- |
| `--color-primary`       | `#C8672E` | Primary actions, key CTAs, active states    |
| `--color-primary-light` | `#E8944F` | Hover states, secondary emphasis            |
| `--color-primary-dark`  | `#A14E1A` | Pressed states, high-contrast text on light |

> Primary is a warm burnt orange — the signature Snoof color. Used sparingly for maximum impact: primary buttons, active tab indicators, and key interactive elements. Not for large fills.

#### Neutral / Background Colors

| Token                 | Hex       | Usage                                  |
| --------------------- | --------- | -------------------------------------- |
| `--color-bg-base`     | `#FAF6F1` | App background (warm cream, not white) |
| `--color-bg-elevated` | `#F2EDE6` | Cards, sheets, timeline items, pills   |
| `--color-bg-subtle`   | `#F3EDE4` | Input backgrounds, top bar icons       |
| `--color-bg-warm`     | `#EDE5D8` | Section dividers, grouped backgrounds  |

> The base background is a warm cream (`#FAF6F1`). Elevated surfaces use a slightly darker off-white (`#F2EDE6`) rather than pure white — this keeps the entire screen feeling like one cohesive warm surface. Cards and list items are defined by their fill and rounded corners, not by borders or harsh contrast.

#### Text Colors

| Token                    | Hex       | Usage                              |
| ------------------------ | --------- | ---------------------------------- |
| `--color-text-primary`   | `#3D3224` | Headings, primary body text        |
| `--color-text-secondary` | `#7A6E5D` | Supporting text, descriptions      |
| `--color-text-tertiary`  | `#A89F91` | Placeholders, timestamps, captions |
| `--color-text-inverse`   | `#FAF6F1` | Text on dark/primary backgrounds   |

> Text is warm dark brown, not black. Even the darkest text has a warm undertone.

#### Accent Colors

| Token                  | Hex       | Usage                                 |
| ---------------------- | --------- | ------------------------------------- |
| `--color-accent-sage`  | `#8BA888` | Health, wellness, positive indicators |
| `--color-accent-gold`  | `#D4A34A` | Achievements, premium, highlights     |
| `--color-accent-peach` | `#E8B89D` | Gentle alerts, warmth, onboarding     |
| `--color-accent-cream` | `#F5E6C8` | Tag fills, light emphasis backgrounds |

#### Semantic Colors

| Token             | Hex       | Usage                            |
| ----------------- | --------- | -------------------------------- |
| `--color-success` | `#6B9E6B` | Completed tasks, positive states |
| `--color-warning` | `#D4943A` | Approaching deadlines, low stock |
| `--color-error`   | `#C45E4A` | Overdue, errors, urgent alerts   |
| `--color-info`    | `#7A96B8` | Informational, neutral prompts   |

> Semantic colors stay warm. Even error red leans terracotta rather than fire-engine red. Warning is amber-gold, success is sage-moss.

### 2.2 Dark Mode Palette

Dark mode uses **deep forest greens and warm charcoal-browns** — never pure black. The goal is "cozy cabin at night," not "OLED void."

| Token                    | Light     | Dark      |
| ------------------------ | --------- | --------- |
| `--color-bg-base`        | `#FAF6F1` | `#1A2B1A` |
| `--color-bg-elevated`    | `#F2EDE6` | `#243324` |
| `--color-bg-subtle`      | `#F3EDE4` | `#1F2D1F` |
| `--color-bg-warm`        | `#EDE5D8` | `#2A3A2A` |
| `--color-text-primary`   | `#3D3224` | `#E8E0D4` |
| `--color-text-secondary` | `#7A6E5D` | `#A8B8A0` |
| `--color-text-tertiary`  | `#A89F91` | `#6E7E68` |
| `--color-primary`        | `#C8672E` | `#E8944F` |

> In dark mode, the primary burnt orange lightens slightly for visibility against dark green backgrounds. All accent colors shift toward lighter/more saturated variants to maintain contrast.

### 2.3 Per-Pet Accent Colors

Each pet profile gets a unique accent color for their hero card and chip indicators. These are in addition to the app-wide palette:

| Pet Color Token | Light Hex | Dark Hex  | Card Gradient Start |
| --------------- | --------- | --------- | ------------------- |
| Pet Color 1     | `#8B6D4A` | `#C49B6A` | `#3D2E1F`           |
| Pet Color 2     | `#6B5B7B` | `#9B8AAB` | `#2E2339`           |
| Pet Color 3     | `#5B7B6B` | `#8AABA0` | `#1F332A`           |
| Pet Color 4     | `#7B5B5B` | `#AB8A8A` | `#331F1F`           |

> Users can eventually customize these. For MVP, auto-assign from this pool based on pet creation order.

---

## 3. Typography

### 3.1 Font Families

| Role      | Font        | Fallback Stack                    | Weight Range  |
| --------- | ----------- | --------------------------------- | ------------- |
| Display   | **Lora**    | Georgia, 'Times New Roman', serif | 500, 600, 700 |
| Headings  | **Nunito**  | 'Nunito Sans', sans-serif         | 600, 700, 800 |
| Body      | **Nunito**  | 'Nunito Sans', sans-serif         | 400, 500, 600 |
| Mono/Data | **DM Mono** | 'Courier New', monospace          | 400, 500      |

**Lora** is the personality font — used for display-size text like the app title on splash/onboarding, empty state headlines, and PawChat greeting messages. Its warm, rounded serifs feel inviting and distinctive without being formal. Use sparingly for emotional impact.

**Nunito** is the workhorse — headings, labels, body text, buttons, navigation. Its rounded terminals perfectly match the rounded-corner philosophy. Highly legible at small sizes, friendly at large sizes.

**DM Mono** is used only for data readouts (weight values, medication dosages, timestamps in logs) where fixed-width alignment matters.

### 3.2 Type Scale

Based on a 1.25 modular ratio with a 16px base:

| Token        | Size | Line Height | Weight | Font    | Usage                         |
| ------------ | ---- | ----------- | ------ | ------- | ----------------------------- |
| `display-lg` | 32px | 40px        | 600    | Lora    | Splash, onboarding hero text  |
| `display-sm` | 26px | 34px        | 600    | Lora    | Empty state headlines         |
| `heading-lg` | 22px | 28px        | 700    | Nunito  | Screen titles                 |
| `heading-md` | 18px | 24px        | 700    | Nunito  | Card titles, section headers  |
| `heading-sm` | 16px | 22px        | 600    | Nunito  | Sub-section titles            |
| `body-lg`    | 16px | 24px        | 400    | Nunito  | Primary body text             |
| `body-md`    | 14px | 20px        | 400    | Nunito  | Secondary body, descriptions  |
| `body-sm`    | 13px | 18px        | 400    | Nunito  | Captions, timestamps          |
| `label-lg`   | 14px | 18px        | 600    | Nunito  | Button labels, tab labels     |
| `label-md`   | 12px | 16px        | 600    | Nunito  | Badges, chip text, overlines  |
| `label-sm`   | 11px | 14px        | 600    | Nunito  | Fine print, tiny indicators   |
| `data`       | 14px | 18px        | 500    | DM Mono | Weight values, dosages, stats |

### 3.3 Typography Rules

- **Letter spacing:** Headings use `-0.3px` to `-0.5px` (tighter). Body uses `0`. Labels/overlines use `+0.5px` to `+0.8px` (looser, especially when uppercase).
- **Section overlines** (like "QUICK LOG", "TODAY", "UPCOMING") are always `label-md`, uppercase, `letter-spacing: 0.8px`, using `--color-text-tertiary`.
- **Numbers in stats** (like "1.2 mi", "2/3 meals") use `heading-md` weight 700 for emphasis, not the mono font — mono is for raw data only.
- **No underlined links.** Interactive text uses `--color-primary` with `font-weight: 500`.

---

## 4. Spacing System

An 8px base grid with a 4px half-step for fine adjustments:

| Token     | Value | Usage                                     |
| --------- | ----- | ----------------------------------------- |
| `space-1` | 4px   | Tight internal padding, icon-to-text gaps |
| `space-2` | 8px   | Default icon-text gaps, compact padding   |
| `space-3` | 12px  | Small card padding, list item gaps        |
| `space-4` | 16px  | Standard content padding (screen edges)   |
| `space-5` | 20px  | Comfortable card padding                  |
| `space-6` | 24px  | Section spacing, generous card padding    |
| `space-7` | 32px  | Section-to-section vertical gaps          |
| `space-8` | 48px  | Major section breaks, screen top padding  |
| `space-9` | 64px  | Extra-large vertical whitespace           |

### 4.1 Layout Constants

| Constant                     | Value   | Notes                               |
| ---------------------------- | ------- | ----------------------------------- |
| Screen horizontal padding    | 16px    | Consistent on all screens           |
| Card internal padding        | 16–20px | 16px compact cards, 20px hero cards |
| Card gap (in lists)          | 12px    | Between stacked cards               |
| Card border-radius           | 16px    | Standard card radius                |
| Hero card border-radius      | 20px    | Slightly larger for emphasis        |
| Section header margin-top    | 24px    | Before each new section title       |
| Section header margin-bottom | 12px    | After section title, before content |
| Tab bar horizontal padding   | 16px    | Scroll container padding            |
| Tab gap                      | 8px     | Between pill tabs                   |

### 4.2 Spacing Philosophy

- **Screen edges are sacred.** Always 16px horizontal padding. Never let content bleed to edges.
- **Vertical rhythm is generous.** 24–32px between sections creates that "breathing room" that makes the app feel relaxed.
- **Cards get comfortable padding.** 16–20px feels spacious without wasting space. Never go below 12px.
- **Group related items tight, separate unrelated items wide.** Timeline and upcoming items at 6px gap; sections at 24–32px gap. Proximity = relationship.

---

## 5. Corner Radius

Everything is rounded. This is non-negotiable.

| Token           | Value  | Usage                                    |
| --------------- | ------ | ---------------------------------------- |
| `radius-sm`     | 8px    | Small badges, chips, input fields        |
| `radius-md`     | 12px   | Buttons, quick-log icons, timeline items |
| `radius-lg`     | 16px   | Cards, modals, sheets                    |
| `radius-xl`     | 20px   | Hero cards, feature cards                |
| `radius-pill`   | 9999px | Pill tabs, toggle switches, FABs         |
| `radius-circle` | 50%    | Avatars, dot indicators, icon containers |

> When in doubt, round it more. The only hard edges in Snoof should be screen boundaries.

---

## 6. Elevation & Shadows

Shadows are warm-tinted and soft. Never cool gray.

| Token       | Value                                | Usage                     |
| ----------- | ------------------------------------ | ------------------------- |
| `shadow-sm` | `0 1px 3px rgba(61, 50, 36, 0.06)`   | Subtle lift: chips, pills |
| `shadow-md` | `0 4px 12px rgba(61, 50, 36, 0.08)`  | Cards, elevated surfaces  |
| `shadow-lg` | `0 8px 24px rgba(61, 50, 36, 0.12)`  | Modals, floating elements |
| `shadow-xl` | `0 16px 48px rgba(61, 50, 36, 0.16)` | Bottom sheets, overlays   |

### 6.1 Shadow Rules

- Shadow color is based on `--color-text-primary` (`#3D3224`) at low opacity — this gives shadows a warm brown tint.
- **No sharp drop shadows anywhere.** All shadows are diffused (large blur, low opacity).
- Dark mode shadows use `rgba(0, 0, 0, 0.3)` minimum — warm backgrounds need stronger shadows to register.
- Cards on `--color-bg-base` use `shadow-md`. Cards within cards (nested) use `shadow-sm` or no shadow (rely on background color difference instead).
- **Bottom sheets** use `shadow-xl` plus a semi-transparent overlay (`rgba(61, 50, 36, 0.4)`).

---

## 7. Iconography

### 7.1 Style Specification

| Property        | Value                                            |
| --------------- | ------------------------------------------------ |
| Style           | Outlined (default), filled for active nav states |
| Stroke width    | 2px                                              |
| Corner radius   | Rounded caps and joins matching app roundness    |
| Grid            | 24x24px with 2px padding (20px visible area)     |
| Color (default) | `--color-text-secondary` (`#7A6E5D`)             |
| Color (active)  | `--color-primary` (`#C8672E`)                    |
| Color (on dark) | `--color-text-inverse`                           |

### 7.2 Icon Library

**Lucide** is the icon library for Snoof. It provides open source, 2px stroke weight icons with rounded joins, an extensive library, and React Native compatibility via `lucide-react-native`.

Custom icons should match Lucide's style exactly: 24x24 grid, 2px stroke, rounded terminals.

### 7.3 Icon Container Backgrounds

For quick-log buttons and category indicators, icons sit inside soft-colored containers:

| Category   | Container Background | Icon Color |
| ---------- | -------------------- | ---------- |
| Walking    | `#E1F5EE`            | `#4A8B6E`  |
| Feeding    | `#FAEEDA`            | `#B8862D`  |
| Potty      | `#FAECE7`            | `#C46B4A`  |
| Medication | `#E6F1FB`            | `#5B82A6`  |
| Training   | `#F3E8F9`            | `#8B6BA6`  |
| Health     | `#E8F5E8`            | `#6B9E6B`  |
| Grooming   | `#FFF3E6`            | `#C8872E`  |
| Finance    | `#F5F0E0`            | `#8B7B4A`  |

> These pastel backgrounds with muted icon colors create the warm, non-clinical feel. Avoid bright saturated icon colors.

---

## 8. Components

### 8.1 Buttons

#### Primary Button

- Background: `--color-primary` (`#C8672E`)
- Text: `--color-text-inverse` (`#FAF6F1`), `label-lg`, 600 weight
- Height: 48px
- Border radius: `radius-md` (12px)
- Shadow: `shadow-sm`
- Pressed state: `--color-primary-dark`, scale(0.98)
- Disabled: 40% opacity

#### Secondary Button

- Background: `--color-bg-subtle` (`#F3EDE4`)
- Text: `--color-text-primary` (`#3D3224`), `label-lg`, 600 weight
- Height: 48px
- Border radius: `radius-md`
- Border: 1px solid `rgba(61, 50, 36, 0.1)`
- Pressed: darken background 5%

#### Ghost Button

- Background: transparent
- Text: `--color-primary`, `label-lg`, 500 weight
- Height: 40px
- Pressed: `--color-bg-subtle`

#### Quick Log Button

- Width: flexible (grid quarter)
- Padding: 12px 6px
- Border radius: `radius-lg` (16px)
- No border (shape defined by fill + radius against base background)
- Background: `--color-bg-elevated`
- Icon container: 36x36px, `radius-md`, category-colored background
- Label: `label-sm`, `--color-text-secondary`
- Logged state: background `--color-bg-subtle`, label changes to "Done", icon 50% opacity

### 8.2 Cards

#### Standard Card

- Background: `--color-bg-elevated`
- Border radius: `radius-lg` (16px)
- Padding: 16px
- No border (defined by fill contrast against `--color-bg-base`)
- Shadow: `shadow-md` only when floating (modals, popovers); omit for inline cards

> **Borderless philosophy:** Throughout Snoof, components are defined by their background fill and rounded corners against the base cream background — not by borders. This creates a softer, more cohesive feel. Borders are reserved only for input fields (focus states) and the secondary button variant.

#### Hero Card (Pet Summary)

- Background: Per-pet gradient (see Section 2.3)
- Border radius: `radius-xl` (20px)
- Padding: 18–20px
- All interior text: white / white-alpha variants
- Stats sub-cards: `rgba(255, 255, 255, 0.08)` background, `radius-md`
- Progress bars: 4px height, `rgba(255, 255, 255, 0.15)` track, `--color-accent-sage` fill

#### Timeline Item

- Background: `--color-bg-elevated`
- Border radius: `radius-md` (12px)
- Padding: 11px 12px
- No border (shape defined by fill + radius against base background)
- Gap between items: 6px
- Status dot: 8px circle, `--color-success` (done) or `--color-text-tertiary` (pending)

### 8.3 Navigation

#### Horizontal Pill Tabs

- Container: horizontally scrollable, 16px side padding
- Pill (inactive): `--color-bg-elevated` background, no border, `--color-text-secondary`
- Pill (active): `--color-text-primary` background (`#3D3224`), white text, no border, `font-weight: 500`
- Pill padding: 7px 16px
- Pill radius: `radius-pill`
- Gap: 8px
- Font: `body-md` (14px)

#### Settings Icon (Top Left)

- Container: 36px circle
- Background: `--color-bg-subtle`
- No border
- Icon: gear (Lucide `settings`), `--color-text-secondary`, 18px

#### Pet Switcher Pill (Top Center)

- Pill-shaped container with pet avatar (26px circle), pet name (`body-md`, 500 weight), and chevron
- Background: `--color-bg-subtle`
- Tap opens bottom sheet

#### PawChat Icon (Top Right)

- Same container style as settings
- Icon: Lucide `message-square`, `--color-text-secondary`, 18px
- Notification dot: 8px circle, `--color-primary`, positioned top-right

### 8.4 Bottom Sheets

- Background: `--color-bg-elevated`
- Top radius: 24px (only top corners rounded)
- Handle: 36px wide, 4px tall, `--color-bg-warm`, centered, 12px top margin
- Overlay: `rgba(61, 50, 36, 0.4)`
- Shadow: `shadow-xl`
- Animation: slide up with spring easing (see Motion section)

### 8.5 Input Fields

- Background: `--color-bg-subtle`
- Border: 1px solid `rgba(61, 50, 36, 0.1)`
- Border (focused): 1.5px solid `--color-primary`
- Border radius: `radius-md`
- Height: 48px
- Padding: 0 16px
- Text: `body-lg`, `--color-text-primary`
- Placeholder: `body-lg`, `--color-text-tertiary`

### 8.6 Badges & Chips

#### Status Badge

- Padding: 3px 8px
- Border radius: `radius-sm` (8px)
- Font: `label-md`, 600 weight
- Variants:
  - Warning: bg `#FEF3C7`, text `#92400E`
  - Info: bg `#DBEAFE`, text `#1E40AF`
  - Success: bg `#D1FAE5`, text `#065F46`
  - Overdue: bg `#FEE2E2`, text `#991B1B`

#### Pet Chip (Multi-Pet Views)

- Inline flex, 2px 7px padding, `radius-sm`
- Per-pet colored background (light variant)
- Small pet emoji + name in `label-sm`

### 8.7 Toggle Switch

- Track: 40px wide, 24px tall, `radius-pill`
- Track (off): `--color-bg-warm`
- Track (on): `--color-accent-sage`
- Knob: 18px circle, white, centered vertically with 3px inset
- Knob shadow: `0 1px 3px rgba(0, 0, 0, 0.2)`
- Animation: 200ms ease-out

### 8.8 Progress Bar

- Track: 4px height, `--color-bg-warm`, `radius-pill`
- Fill: `--color-accent-sage` (or contextual color), `radius-pill`
- Animation: width transition 300ms ease-out on value change

---

## 9. Illustrations & Imagery

### 9.1 Illustration Style

Snoof uses **line-art illustrations with warm color fills** for decorative and functional moments throughout the app. Think simple, charming, slightly hand-drawn quality — not clip art, not hyper-detailed.

**Visual characteristics:**

- Stroke: 2px, `--color-text-secondary` or slightly darker
- Fill colors: drawn from the accent palette (sage, peach, cream, gold) at 60–80% opacity
- Style: flat with minimal layering, gentle curves, no harsh angles
- Subjects: dogs in cozy scenes, nature elements (leaves, paw prints, bones), seasonal motifs
- Watercolor-style washes can be used as background textures behind illustrations for extra warmth

**Where illustrations appear:**

- **Onboarding screens:** Full-width illustrated scenes (dog on a couch, walking in autumn leaves, etc.)
- **Empty states:** Centered illustration with encouraging text ("No walks logged yet — time for an adventure?")
- **Achievement badges:** Small circular illustrations for training milestones
- **PawChat:** Friendly dog avatar in chat interface
- **Loading/splash:** Animated Snoof mascot or paw print

### 9.2 Photography

User-uploaded pet photos appear in:

- Pet profile avatars (circular, 48–64px, `radius-circle`)
- Photo timeline/gallery (rounded corners, `radius-lg`)
- Vet document previews

Photos should always have rounded corners and, when used as hero images, a subtle warm gradient overlay at bottom for text legibility.

---

## 10. Motion & Animation

### 10.1 Core Principles

- **Purposeful, not decorative.** Every animation communicates something: a state change, feedback, spatial relationship, or delight moment.
- **Spring-based easing** for natural feel. Avoid linear or harsh ease-in-out.
- **Fast for interactions, slow for ambiance.** Button presses resolve instantly. Page transitions are smooth. Onboarding illustrations can take their time.
- **Respect reduced motion preferences.** Wrap all animations in `prefers-reduced-motion` checks. Provide instant alternatives.

### 10.2 Duration Scale

| Token              | Duration | Usage                                 |
| ------------------ | -------- | ------------------------------------- |
| `duration-instant` | 100ms    | Opacity changes, color transitions    |
| `duration-fast`    | 150ms    | Button press/release, toggle switches |
| `duration-normal`  | 250ms    | Card transitions, tab switches        |
| `duration-slow`    | 400ms    | Sheet open/close, screen transitions  |
| `duration-scenic`  | 600ms+   | Onboarding animations, illustrations  |

### 10.3 Easing Curves

| Token             | Value                               | Usage                                |
| ----------------- | ----------------------------------- | ------------------------------------ |
| `ease-spring`     | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy: quick log, FAB, achievements |
| `ease-smooth`     | `cubic-bezier(0.25, 0.1, 0.25, 1)`  | Standard: most transitions           |
| `ease-sheet`      | `cubic-bezier(0.32, 0, 0.15, 1)`    | Bottom sheets, modals                |
| `ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)`        | Elements entering view               |

### 10.4 Specific Animations

**Quick Log tap:**

1. Button scales to 0.95 on press (`duration-fast`, `ease-smooth`)
2. Releases with a subtle bounce to 1.0 (`duration-normal`, `ease-spring`)
3. Icon container briefly pulses opacity
4. Label crossfades to "Done"
5. Toast slides up from bottom with fade (`duration-normal`, `ease-decelerate`)
6. Haptic feedback: light impact

**Bottom sheet open:**

1. Overlay fades in (`duration-normal`, `ease-smooth`)
2. Sheet slides up from off-screen (`duration-slow`, `ease-sheet`)
3. Content within sheet has slight stagger (50ms delay per item)

**Pet switcher:**

1. Hero card crossfades background color (`duration-normal`)
2. Stats counter-animate to new values
3. Timeline items fade out then fade in new data (150ms out, 150ms in)

**Onboarding swipe:**

1. Illustration slides/parallax with swipe gesture
2. Text elements stagger in with fade + translateY (`duration-scenic`, 80ms stagger)
3. Dot indicator animates width (active dot stretches to pill shape)

**Splash screen:**

1. Snoof logo or paw print fades in and scales from 0.8 to 1.0 (`duration-scenic`, `ease-spring`)
2. Subtle warm glow pulse behind logo
3. Transition to first screen with a gentle fade

### 10.5 Haptic Feedback

| Action                  | Haptic Type                         |
| ----------------------- | ----------------------------------- |
| Quick log tap           | Light impact                        |
| Pet switcher selection  | Light impact                        |
| Toggle switch           | Light impact                        |
| Pull-to-refresh trigger | Medium impact                       |
| Error / validation fail | Notification error                  |
| Achievement unlocked    | Notification success + heavy impact |
| Button press (primary)  | Selection changed                   |

> Use `expo-haptics` for implementation. Always pair haptics with visual feedback — never haptic-only.

---

## 11. Screen-Level Layout Patterns

### 11.1 Standard Screen Structure

```
┌─────────────────────────────────┐
│  Status Bar                     │  System
├─────────────────────────────────┤
│  [⚙]    Pet Switcher Pill   [💬]│  Top bar: 44px height
├─────────────────────────────────┤
│  [ Tab ] [ Tab ] [ Tab ] →      │  Pill tabs: scrollable
├─────────────────────────────────┤
│                                 │
│        Scrollable Content       │  Padding: 16px horizontal
│                                 │
│  ┌─────────────────────────┐    │
│  │      Hero Card          │    │  20px radius, per-pet color
│  └─────────────────────────┘    │
│                                 │
│  SECTION TITLE          Link >  │  Overline style
│                                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐          │  Quick log grid
│  └──┘ └──┘ └──┘ └──┘          │
│                                 │
│  SECTION TITLE          Link >  │
│                                 │
│  ┌─────────────────────────┐    │  Timeline items
│  │ ● 🚶 Morning walk  7:14a│    │
│  ├─────────────────────────┤    │
│  │ ● 🍜 Breakfast     8:00a│    │
│  └─────────────────────────┘    │
│                                 │
│         ... more content        │
│                                 │
│  (100px bottom padding for      │
│   content to clear any FAB)     │
│                                 │
└─────────────────────────────────┘
```

> **No bottom tab navigation.** Settings is top-left gear icon. Navigation is via horizontal pill tabs. PawChat is top-right icon.

### 11.2 Safe Areas

- Top: respect device safe area inset (Dynamic Island, notch)
- Bottom: 34px home indicator padding on Face ID devices
- Content should never be obscured by system UI

---

## 12. Accessibility Notes

While not the primary design driver, the following should be maintained:

### 12.1 Contrast Ratios

- Body text on `--color-bg-base`: `#3D3224` on `#FAF6F1` = **9.2:1** (passes AAA)
- Body text on `--color-bg-elevated`: `#3D3224` on `#F2EDE6` = **8.3:1** (passes AAA)
- Secondary text on `--color-bg-elevated`: `#7A6E5D` on `#F2EDE6` = **4.2:1** (passes AA)
- Primary button text: `#FAF6F1` on `#C8672E` = **4.6:1** (passes AA)
- Tertiary text on elevated: `#A89F91` on `#F2EDE6` = **2.5:1** (fails AA — use only for non-essential decorative text like timestamps, always pair with a more prominent label nearby)

### 12.2 Touch Targets

- Minimum tap target: 44x44px (Apple HIG standard)
- Quick log buttons, timeline items, and nav elements all meet this
- Small badges and chips that are tappable should have invisible padding to reach 44px

### 12.3 Reduced Motion

- Wrap all `Animated.*` calls in a `useReducedMotion()` check
- Provide instant (0ms) alternatives for all transitions
- Onboarding illustrations should display statically

---

## 13. Design Token Export Format

For use in the Expo/React Native codebase, export tokens as a TypeScript theme object:

```typescript
// theme/tokens.ts
export const colors = {
  primary: "#C8672E",
  primaryLight: "#E8944F",
  primaryDark: "#A14E1A",

  bgBase: "#FAF6F1",
  bgElevated: "#F2EDE6",
  bgSubtle: "#F3EDE4",
  bgWarm: "#EDE5D8",

  textPrimary: "#3D3224",
  textSecondary: "#7A6E5D",
  textTertiary: "#A89F91",
  textInverse: "#FAF6F1",

  accentSage: "#8BA888",
  accentGold: "#D4A34A",
  accentPeach: "#E8B89D",
  accentCream: "#F5E6C8",

  success: "#6B9E6B",
  warning: "#D4943A",
  error: "#C45E4A",
  info: "#7A96B8",
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 48,
  9: 64,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
  circle: 9999,
} as const;

export const typography = {
  displayLg: { fontFamily: "Lora_600SemiBold", fontSize: 32, lineHeight: 40 },
  displaySm: { fontFamily: "Lora_600SemiBold", fontSize: 26, lineHeight: 34 },
  headingLg: { fontFamily: "Nunito_700Bold", fontSize: 22, lineHeight: 28 },
  headingMd: { fontFamily: "Nunito_700Bold", fontSize: 18, lineHeight: 24 },
  headingSm: { fontFamily: "Nunito_600SemiBold", fontSize: 16, lineHeight: 22 },
  bodyLg: { fontFamily: "Nunito_400Regular", fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: "Nunito_400Regular", fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: "Nunito_400Regular", fontSize: 13, lineHeight: 18 },
  labelLg: { fontFamily: "Nunito_600SemiBold", fontSize: 14, lineHeight: 18 },
  labelMd: { fontFamily: "Nunito_600SemiBold", fontSize: 12, lineHeight: 16 },
  labelSm: { fontFamily: "Nunito_600SemiBold", fontSize: 11, lineHeight: 14 },
  data: { fontFamily: "DMMono_500Medium", fontSize: 14, lineHeight: 18 },
} as const;
```

> Load fonts via `expo-google-fonts`: `@expo-google-fonts/lora`, `@expo-google-fonts/nunito`, `@expo-google-fonts/dm-mono`.

---

## 14. Key Reference Inspirations

Documented for future design decisions and onboarding context:

- **Apple Health** — Data density done cleanly, card-based layout, excellent use of color coding
- **Gentler Streak** — Warm, encouraging tone; proves health tracking doesn't need to feel clinical
- **Duolingo** — Gamification, whimsical illustrations, delightful micro-interactions
- **Headspace** — Illustration style, calming palette, onboarding flow
- **Care/Of** — Warm palette, personalization, premium feel on a wellness product
- **Copilot (money app)** — Navigation pattern reference (horizontal pill tabs)
- **Smart home concept (Image 3 reference)** — Brown gradients, white cards on warm backgrounds, rounded components, orange accent usage
- **Coffee app concept (Image 8 reference)** — Cream-throughout palette, warm illustrations, cohesive warm tone
- **Cycling app concept (Image 6 reference)** — Flat illustration style with earth tones, muted accent dots, nature elements

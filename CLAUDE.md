# CLAUDE.md — Snoof

## Project Overview

**Snoof** is an all-in-one dog care management mobile app. It consolidates every aspect of dog ownership — health tracking, daily logging, training, AI assistance, inventory, and finances — into a single, beautifully designed app powered by AI. The app is dog-first by design, but should be extensible to at least cats. We intentionally do not try to serve every pet type. This focus enables deeper, more relevant features for dog owners specifically.

The name "Snoof" is a coined word (a playful riff on "snoot/boop the snoof" dog culture).

**Domain status:** snoof.com and snoof.app are taken. Target domains are snoof.pet (primary) and snoof.ai (secondary). snoof.tech is also available. Acquiring snoof.com is an open consideration.

## Tech Stack

| Layer              | Technology                                                     |
| ------------------ | -------------------------------------------------------------- |
| Framework          | Expo + React Native + TypeScript                               |
| Backend            | Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime) |
| AI                 | Anthropic Claude API (called via Supabase Edge Functions)      |
| Offline Storage    | WatermelonDB or Expo SQLite (local-first, syncs to Supabase)   |
| Subscriptions      | RevenueCat                                                     |
| Analytics          | Mixpanel or PostHog (not yet decided)                          |
| Maps/GPS           | Google Maps API or Mapbox (not yet decided)                    |
| Push Notifications | Expo Notifications (backed by FCM/APNs)                        |

### Key Architecture Decisions

- **AI calls go through Supabase Edge Functions** — keeps API keys server-side and enables rate limiting per subscription tier.
- **Offline-first is required** — dog owners need to log walks, potty breaks, and feedings without signal. Plan to use WatermelonDB or Expo SQLite for local storage that syncs to Supabase when online. This decision is not yet finalized.
- **Row Level Security (RLS)** must be designed carefully from the start — household members share pet data while accounts remain isolated.
- **Realtime** is used for household coordination so all family members see who walked/fed the dog.

## Project Structure

Use a clean, modular folder structure. Features should be isolated into their own directories. This is critical for maintainability and for working effectively with AI coding tools.

```
src/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/             # Auth screens (login, signup, onboarding)
│   ├── (tabs)/             # Main tab navigator
│   │   ├── dashboard/      # Dashboard tab (home screen)
│   │   ├── health/         # Health tab
│   │   ├── activity/       # Activity tab
│   │   └── pawchat/        # PawChat AI tab
│   └── _layout.tsx
├── components/
│   ├── ui/                 # Reusable UI primitives (Button, Card, Input, etc.)
│   ├── pet/                # Pet-related components (PetAvatar, PetSwitcher, HeroCard)
│   ├── dashboard/          # Dashboard-specific components
│   ├── health/             # Health module components
│   ├── activity/           # Activity module components
│   └── pawchat/            # PawChat components
├── lib/
│   ├── supabase.ts         # Supabase client init
│   ├── api/                # API helper functions per module
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # State management (Zustand recommended)
│   └── utils/              # Shared utility functions
├── constants/
│   ├── colors.ts           # Design system colors
│   ├── typography.ts       # Font sizes, weights, families
│   └── layout.ts           # Spacing, border radius constants
├── types/                  # TypeScript type definitions
│   ├── pet.ts
│   ├── health.ts
│   ├── activity.ts
│   └── database.ts         # Supabase-generated types
└── assets/                 # Images, fonts, icons
```

## Navigation Architecture

The app uses **5 horizontal pill tabs** at the top of the screen (inspired by the Copilot money app), not a traditional bottom tab bar:

1. **[Active Pet Name]** — dynamic tab showing the pet's profile/detail screen
2. **Dashboard** — the home screen, central hub (default active tab)
3. **Health** — medications, vaccinations, vet visits, weight, documents
4. **Activity** — walks, potty, feeding, sleep, training logs
5. **PawChat** — AI assistant chat interface

The pill tabs are horizontally swipeable when content overflows. Active tab is filled dark (#111) with white text. Inactive tabs have a light border with gray text. Settings lives as an icon in the top-left of the header bar — it is NOT a tab.

### Pet Switching

Two-tier approach:

1. **Global context switcher** — a pill in the header bar showing the active pet's avatar and name with a dropdown chevron. Tapping opens a bottom sheet to switch between pets. This changes the entire app context.
2. **Per-entry switcher within Quick Log** — for rapid multi-pet logging (e.g., "I just walked both dogs"), quick log buttons can target a specific pet without switching the global context. This is a V2 feature.

### Combined Timeline View

An opt-in toggle (not default) on the **Activity tab** that shows all pets' activities interleaved chronologically with color-coded pet chips. This reduces cognitive load on the primary single-pet use case while still being available for multi-pet households.

## UI/UX Design Direction

### Visual Language

- **Dark hero card** for the active pet at the top of Dashboard (deep navy #0F3460 for primary pet, deep purple #3D1A6E for secondary — each pet gets a unique color)
- **Light, clean background** (#f0f0f0 or white)
- **Card-based layout** with 20px border radius, subtle borders (0.5px rgba(0,0,0,0.08))
- **SF Pro Text / system font stack** — no custom fonts needed for MVP
- **Teal accent color** (#4ECDC4) for progress bars and success states
- **Blue accent** (#2563eb) for interactive links and actions
- Warm, approachable tone — not clinical

### Design Tokens

```typescript
// colors.ts
export const colors = {
  // Backgrounds
  background: "#f0f0f0",
  surface: "#ffffff",
  surfacePressed: "#f4f4f4",

  // Text
  textPrimary: "#111111",
  textSecondary: "#666666",
  textTertiary: "#888888",
  textMuted: "#999999",

  // Accents
  teal: "#4ECDC4", // progress, success, done states
  blue: "#2563eb", // links, interactive actions
  red: "#E24B4A", // overdue, errors, destructive

  // Status badges
  warnBg: "#fef3c7",
  warnText: "#92400e",
  infoBg: "#dbeafe",
  infoText: "#1e40af",
  okBg: "#d1fae5",
  okText: "#065f46",

  // Pet hero card backgrounds (each pet gets a unique dark color)
  heroPrimary: "#0F3460", // deep navy
  heroSecondary: "#3D1A6E", // deep purple
  heroTertiary: "#1B4332", // deep forest

  // Borders
  border: "rgba(0,0,0,0.08)",
  borderMedium: "rgba(0,0,0,0.12)",

  // Tab bar
  tabActive: "#111111",
  tabActiveText: "#ffffff",
  tabInactive: "#ffffff",
  tabInactiveText: "#666666",
};

// layout.ts
export const layout = {
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 20,
    card: 20,
    avatar: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
};
```

### Design Inspiration

Model the UX after these apps (NOT other pet apps — most have mediocre UX):

- **Apple Health** — card-based progressive disclosure, simple at a glance, detailed on tap
- **Gentler Streak** — sustainable tracking UX that doesn't overwhelm
- **Duolingo** — gamification, streaks, achievements (for training module in V2)
- **Headspace** — warm tone, clear microcopy, playful illustrations
- **Care/Of** — personalized onboarding quiz flow (for pet profile creation)
- **Copilot (money app)** — horizontally swipeable pill tabs, dark hero card

### Key UX Principles

- Complete main tasks in **3 taps or fewer**
- Quick-log should be **single-tap** where possible (walk, fed, potty, meds)
- Use cards and progressive disclosure for complex data
- Keep the tone warm and encouraging, not clinical
- Show a toast confirmation for quick-log actions ("Walk logged ✓")

## Dashboard Screen

The Dashboard is the home screen and the most important view. It contains:

1. **Hero Card** — active pet's photo/avatar, name, breed, age, weight. Three stat blocks showing today's progress (distance walked, meals logged, next medication) with progress bars.
2. **Quick Log section** — 4 buttons in a row: Walk (🚶, green bg #E1F5EE), Fed (🍜, warm bg #FAEEDA), Potty (💧, pink bg #FAECE7), Meds (💊, blue bg #E6F1FB). Single-tap to log with toast confirmation.
3. **Today timeline** — chronological list of today's logged activities. Done items have teal dots (#4ECDC4) and timestamps. Pending items have gray dots (#ccc) and a blue "Log" action.
4. **Upcoming section** — upcoming reminders (vet appointments, vaccinations due, flea/tick prevention) with color-coded urgency badges: Overdue (yellow #fef3c7), Soon (blue #dbeafe), On track (green #d1fae5).

## Supabase Database Schema

Design the schema around these core entities. Use UUIDs for all primary keys. All tables need `created_at` and `updated_at` timestamps.

### Core Tables

- **profiles** — extends Supabase auth.users (id, display_name, avatar_url)
- **households** — groups of users who share pet data (id, name, created_by)
- **household_members** — junction table (household_id, user_id, role: owner|member)
- **pets** — (id, household_id, name, breed, date_of_birth, weight_current, gender, spay_neuter_status, microchip_number, photo_url, color, notes)

### Activity/Logging Tables

- **activity_logs** — unified log table (id, pet_id, logged_by, type: walk|feed|potty|water|sleep, data: jsonb, logged_at)
- **walk_sessions** — (id, activity_log_id, distance_meters, duration_seconds, route: jsonb with GPS coords, started_at, ended_at)

### Health Tables

- **medications** — (id, pet_id, name, dosage, frequency, start_date, end_date, refill_date, notes)
- **medication_logs** — (id, medication_id, given_by, given_at, skipped: boolean, notes)
- **vaccinations** — (id, pet_id, name, date_given, next_due_date, vet_name, document_url)
- **vet_visits** — (id, pet_id, date, reason, diagnosis, treatment, cost, vet_name, notes, document_urls: text[])
- **weight_logs** — (id, pet_id, weight, unit, logged_at)
- **documents** — (id, pet_id, type: vet_record|lab_result|insurance|other, title, file_url, uploaded_at)

### Training Tables (V2)

- **commands** — (id, pet_id, name, status: learning|practicing|mastered, started_at, mastered_at)
- **training_sessions** — (id, pet_id, duration_seconds, commands_practiced: text[], notes, logged_at)
- **behaviors** — (id, pet_id, name, frequency_notes, first_observed, last_observed)

### Inventory Tables

- **inventory_items** — (id, pet_id, category: food|treat|medication|toy|accessory, name, quantity, unit, low_stock_threshold, last_purchased, notes)

### Finance Tables

- **expenses** — (id, pet_id, category: food|vet|grooming|supplies|insurance|training|other, amount, currency, date, description, recurring: boolean, recurring_frequency)

### AI Tables

- **pawchat_conversations** — (id, user_id, pet_id, title, created_at)
- **pawchat_messages** — (id, conversation_id, role: user|assistant, content, created_at)

### RLS Policy Guidelines

- Users can only access data for pets in their household
- All logged_by fields reference the auth.users.id of the person who created the entry
- Household members with "member" role can read and create, but only "owner" role can delete pets or manage household membership
- PawChat conversations are private to the user (not shared with household)

## MVP Feature Scope

Ship these features at launch. Resist scope creep — the core validation question is: **"Does a dog owner open Snoof daily because it's genuinely useful?"**

### Must Ship (MVP)

1. **Pet Profile** — create/edit pet with name, breed, DOB, weight, photo, gender, spay/neuter status, microchip/ID storage
2. **Multi-Pet Support** — unlimited pets per household
3. **Daily Dashboard** — hero card, quick log, today timeline, upcoming reminders
4. **Walk Tracker with GPS** — track walks with route, distance, duration
5. **Feeding Log** — log meals with food type, quantity, time
6. **Potty Log** — quick-log bathroom breaks with time
7. **Medication Tracker** — log medications with dosage, frequency, refill dates, smart reminders
8. **Vaccination Records** — track vaccination history with due date alerts
9. **Vet Visit Log** — record visits with date, reason, diagnosis, treatment, cost
10. **Weight Tracking** — log weight over time with charts
11. **Document Storage** — upload vet records, lab results as PDFs/photos
12. **Emergency Card** — one-tap shareable card with critical info (allergies, meds, vet contact)
13. **PawChat (AI Assistant)** — 24/7 AI chatbot powered by Claude, context-aware based on pet profile and history. This is the primary differentiator.
14. **Smart Reminders** — proactive reminders for medications, appointments, and routines
15. **Household Coordination** — multiple family members can log; everyone sees who did what via Realtime
16. **Breed-Specific Intelligence** — all AI responses tailored to the specific breed's needs

### Cut From MVP (V2, 3-6 months post-launch)

- Training video library, built-in clicker, AI training plans
- Food & nutrition analyzer, symptom checker, toxicity scanner
- Water intake tracking, sleep tracking
- Routine builder
- Spending reports & charts, budget setting
- Grooming schedule
- Community/social features, dog park finder
- Barcode/product scanner, shopping list generation
- Photo timeline/gallery
- Pet passport / shareable profile
- Combined multi-pet timeline view (Activity tab toggle)

### Future (6-12+ months)

- Lost pet mode with push alerts to nearby users
- Vet appointment booking integration
- AI health trend analysis (longitudinal anomaly detection)
- Puppy growth predictor
- Playdate matching
- In-app marketplace for local pet services
- Senior dog mode / puppy mode (life stage adjustments)
- Co-parenting/shared custody support with handoff notes
- Lifetime cost calculator

## Monetization

Freemium model with transparent pricing. This directly addresses competitor backlash (Woofz has significant user complaints about aggressive/confusing billing).

|               | Free                             | Plus ($5.99/mo)               | Pro ($9.99/mo)                      |
| ------------- | -------------------------------- | ----------------------------- | ----------------------------------- |
| Pets          | 1                                | Up to 3                       | Unlimited                           |
| Core Tracking | Basic daily logs + med reminders | Full tracking, all modules    | Full tracking + data export         |
| AI (PawChat)  | 5 messages/day                   | Unlimited + food analyzer     | All AI features incl. health trends |
| Training      | Command tracker only             | Full training module + videos | AI training plans + achievements    |
| Reports       | None                             | Monthly summaries             | Custom reports + vet-ready exports  |

Annual discount: 30-40% off ($3.99/mo Plus, $6.99/mo Pro).

RevenueCat handles all subscription management, Apple/Google billing, and receipt validation.

## AI Integration (PawChat)

PawChat is the app's primary differentiator. It uses the Anthropic Claude API via Supabase Edge Functions.

### Architecture

```
React Native UI → Supabase Edge Function → Claude API → Response streamed back
```

### Context Injection

Every PawChat request should include the active pet's profile as system context:

- Pet name, breed, age, weight, gender, spay/neuter status
- Known allergies and health conditions
- Current medications
- Recent activity patterns (last 7 days of logs)
- Vaccination status

This makes responses personalized rather than generic.

### Guardrails

- Always include a disclaimer for health-related responses: "This is not a substitute for professional veterinary advice."
- Rate limit by subscription tier (5/day free, unlimited Plus/Pro)
- Never provide specific medication dosages — always defer to vet
- Log all conversations for the user's reference

### Suggested Prompt Chips

Show contextual suggested prompts on the PawChat screen based on the pet's data:

- "Is [food brand] good for Golden Retrievers?"
- "Baxter has been scratching a lot — what could cause this?"
- "How much exercise does a 3-year-old Golden need?"
- "When should Baxter's next dental cleaning be?"

## Competitive Context

The pet care app market is ~$2-3B (2025) growing at 10-18% CAGR. The market is **fragmented, not saturated** — no strong all-in-one incumbent exists.

Key competitors and their weaknesses that Snoof exploits:
% CAGR. The market is **fragmented, not saturated** — no strong all-in-one incumbent exists.

Key competitors and their weaknesses that Snoof exploits:

- **11pets** — most feature-rich tracker but terrible UX, no AI, no training, recent data migration disaster
- **Woofz** — good training + AI but aggressive billing, no health/inventory management
- **Rover/Wag** — services marketplaces only, no tracking
- **PetDesk** — vet-centric, no daily tracking or training
- **DogLog** — simple household coordination but limited scope, no AI

Snoof's advantages: comprehensive + beautiful + AI-native + dog-first + transparent pricing.

## Development Guidelines

### Code Style

- Use TypeScript strictly — no `any` types
- Functional components with hooks only
- Use Zustand for global state management
- Prefer composition over inheritance
- Keep components small and focused (< 150 lines)
- Co-locate tests with components

### Naming Conventions

- Components: PascalCase (`PetSwitcher.tsx`)
- Hooks: camelCase with `use` prefix (`usePetData.ts`)
- Utils/helpers: camelCase (`formatWeight.ts`)
- Constants: SCREAMING_SNAKE_CASE for values, PascalCase for files
- Database columns: snake_case
- TypeScript types/interfaces: PascalCase

### Testing

- Unit tests for utility functions and hooks
- Component tests for interactive UI elements
- Integration tests for Supabase queries
- Use React Native Testing Library
- **pgTAP** for testing Supabase RLS policies and database logic directly in PostgreSQL

### Git Conventions

- Branch naming: `feature/pet-profile`, `fix/walk-tracker-gps`, `chore/update-deps`
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Keep PRs focused on a single feature or fix

### Performance

- Lazy load screens/tabs that aren't immediately visible
- Use FlashList instead of FlatList for long lists
- Optimize images before upload (compress, resize)
- Cache Supabase queries where appropriate
- Minimize re-renders with proper memoization

## Environment Setup

```bash
# Prerequisites
node >= 20
npm
Expo CLI (npx expo)
Supabase CLI (for local development)

# Getting started
npm install
npx expo start

# Environment variables (.env)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_KEY=
# Note: Claude API key lives in Supabase Edge Functions, NOT in the client
```

## Important Reminders

- **Dog-first, but plan for expansion.** Every feature and AI response is optimized for dogs, but architect the data model and UI to accommodate at least cats in the future. Use a `pet_type` field on the pet profile; don't hard-code dog assumptions into the schema or core logic.
- **Offline support is critical** — log entries must work without network. Sync when back online.
- **The daily dashboard is the most important screen** — it should load instantly and feel effortless.
- **Quick Log must be zero-friction** — single tap to log, toast confirmation, done. No modals or forms for basic actions.
- **PawChat is the differentiator** — invest in making the AI context-aware and genuinely useful, not a generic chatbot wrapper.
- **Trevor's dogs Poppy (Cattle Dog, 2 yrs, 37 lbs) and Ruby (Springer Spaniel, 7 yrs, 40 lbs) are the test cases** — always think about multi-pet households when designing features.

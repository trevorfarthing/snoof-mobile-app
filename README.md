# Snoof Mobile App

Snoof is an all-in-one dog care management app for iOS and Android. It covers daily logging, health tracking, medication reminders, walk tracking, household coordination, and an AI-powered assistant — all in one place. Built with Expo + React Native, backed by Supabase, and differentiated by Snoof AI.

For full product context see [CLAUDE.md](./CLAUDE.md). For UI/UX design tokens and visual language see [DESIGN_SPEC.md](./DESIGN_SPEC.md).

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node | ≥ 20 | [nodejs.org](https://nodejs.org) or `brew install node` |
| Expo CLI | latest | bundled via `npx expo` — no global install needed |
| Supabase CLI | latest | `brew install supabase/tap/supabase` |
| Deno | latest | `brew install deno` |
| EAS CLI | ≥ 18.5.0 | `npm install -g eas-cli` |
| Xcode | latest | Mac App Store (iOS builds only) |

### VS Code Extensions

- **Expo Tools** (`expo.vscode-expo-tools`) — Expo Router intellisense and diagnostics
- **Deno** (`denoland.vscode-deno`) — type checking for Supabase Edge Functions; the workspace is already configured to enable Deno only inside `supabase/functions/`

---

## Accounts & Access

You'll need to be invited to the following before remote features work:

- **Expo** — organisation: `snoof-mobile-app` (contact project owner)
- **Supabase** — project: `Snoof Mobile App` (contact project owner)
- **Apple Developer** — required to run on a physical iOS device; contact project owner to be added to the team *(TestFlight setup TBD)*
- **GitHub** — secrets are managed here; the Gemini API key for the AI insight edge function is stored as a repository secret and does not need to be set locally unless you're testing edge functions

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Where to find it |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard → Project Settings → API |
| `EXPO_PUBLIC_SUPABASE_KEY` | Supabase anon public key | Supabase dashboard → Project Settings → API |

> For local Supabase development, see the [Local Supabase](#local-supabase) section — the URL and key are different.

### 3. Log in to Supabase CLI

```bash
supabase login
```

### 4. Start the app

```bash
npm start
```

Press `i` to open in the iOS Simulator, or scan the QR code with the Expo Go app on your device.

---

## Supabase Setup

### Remote (shared project)

Once you've been invited to the Supabase project, set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` from the dashboard as described above. The remote database already has all migrations applied.

To push new local migrations to the remote database:

```bash
npm run migration:remote:push
```

### Local Supabase

Spin up a full local Supabase stack (Postgres, Auth, Storage, Edge Functions) using Docker:

```bash
npm run supabase:start
```

This will print a block of local credentials. Use the `API URL` and `anon key` values for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` in your `.env.local` during local development.

To stop the local stack:

```bash
npm run supabase:stop
```

To reset the local database and re-run all migrations from scratch:

```bash
npm run migration:local:reset
```

---

## Running the App

### iOS Simulator

```bash
npm start        # then press i
# or
npm run ios      # builds and opens directly in simulator
```

### Physical iOS Device

```bash
npm run ios:device
```

Requires your device to be connected via USB and registered with the Apple Developer account (contact project owner if your UDID isn't registered).

### Web (limited)

```bash
npm run web
```

Most native features won't work on web. Use this only for quick layout checks.

---

## Scripts Reference

| Script | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run ios` | Build and run on iOS Simulator |
| `npm run ios:device` | Build and run on a connected iOS device |
| `npm run android` | Build and run on Android emulator |
| `npm run web` | Start web dev server |
| `npm run lint` | Run ESLint |
| `npm run prebuild` | Run `expo prebuild --clean` to regenerate native folders |
| `npm run supabase:start` | Start local Supabase stack via Docker |
| `npm run supabase:stop` | Stop local Supabase stack |
| `npm run migration:create` | Create a new blank migration file |
| `npm run migration:local:up` | Apply pending migrations to local database |
| `npm run migration:local:down` | Roll back the last local migration |
| `npm run migration:local:reset` | Reset local database and re-run all migrations |
| `npm run migration:pull` | Pull remote schema changes into local migrations |
| `npm run migration:remote:push` | Push local migrations to the remote database |
| `npm run update-types` | Regenerate TypeScript types from the remote Supabase schema (requires `supabase link` to have been run) |
| `npm run eas:development:ios` | Build a development client for iOS via EAS |
| `npm run eas:preview:ios` | Build an internal preview build for iOS via EAS |
| `npm run eas:production:ios` | Build a production iOS build via EAS |
| `npm run eas:submit:ios` | Submit latest iOS build to App Store Connect |

---

## Database Migrations

Migrations live in `supabase/migrations/`. Always create new migrations with:

```bash
npm run migration:create -- <migration_name>
```

Never edit existing migration files — add a new migration instead.

After making schema changes, regenerate the TypeScript types:

```bash
npm run update-types
```

This uses the linked project ref stored by `supabase link` — no extra env var needed.

---

## Edge Functions (Supabase / Deno)

Edge functions live in `supabase/functions/`. They run on Deno — not Node — so dependencies are imported via `jsr:` or `npm:` specifiers rather than `package.json`.

### First-time setup

After cloning, cache Deno dependencies for each function to get type hints in VS Code:

```bash
deno cache supabase/functions/generate-pet-insight/index.ts
```

`deno.lock` is intentionally gitignored — Supabase's deployment pipeline resolves dependencies from the import specifiers automatically.

### Running locally

```bash
supabase functions serve generate-pet-insight
```

### Deploying

```bash
supabase functions deploy generate-pet-insight
```

### Secrets

Edge function secrets are set separately from `.env` files:

```bash
supabase secrets set GEMINI_API_KEY=your-key-here
```

Available secrets used by edge functions:

| Secret | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for the AI insight card (get from Google AI Studio) |
| `SUPABASE_URL` | Auto-injected by Supabase at runtime |
| `SUPABASE_ANON_KEY` | Auto-injected by Supabase at runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected by Supabase at runtime |

---

## EAS Builds

EAS is configured in `eas.json`. You'll need to be logged in to the `snoof-mobile-app` Expo organisation:

```bash
eas login
```

| Profile | Use case |
|---|---|
| `development` | Dev client build for internal distribution |
| `preview` | Internal TestFlight-like build (device only) |
| `production` | App Store submission build |

---

## Project Documentation

| File | Purpose |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | Full product spec: architecture, schema, feature scope, monetisation, coding conventions |
| [DESIGN_SPEC.md](./DESIGN_SPEC.md) | Design tokens, visual language, component patterns, spacing and colour system |

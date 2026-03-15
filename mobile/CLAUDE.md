# CLAUDE.md — Mobile App (React Native + Expo)

This file provides guidance when working in the `mobile/` directory of this monorepo.
The backend lives in `backend/` and is a separate Rails app — do not modify it from here.

## Project Overview

KCDServe mobile app — a React Native + Expo app for students to log volunteer service hours.
Students log hours, attach photos, collect supervisor signatures, and track their stats.

## Stack

- **Framework**: React Native + Expo (SDK 54)
- **Routing**: Expo Router (file-based, lives in `app/`)
- **Styling**: NativeWind (Tailwind class names via `className` prop)
- **Server state**: TanStack Query (React Query) — all API calls go through query/mutation hooks
- **Client state**: Zustand — UI state, auth tokens, form persistence
- **Forms**: React Hook Form + Zod — all forms use RHF; schemas defined with Zod
- **Build / Deployment**: EAS Build + EAS Submit

## Commands

```bash
cd mobile

npx expo start              # start dev server
npx expo start --ios        # iOS simulator
npx expo start --android    # Android emulator

npx expo install <package>  # always use this instead of npm/yarn install for Expo packages

eas build --platform ios --profile preview     # cloud build for testing
eas build --platform ios --profile production  # App Store build
eas submit --platform ios                      # submit to App Store
```

## Folder Structure

```
mobile/
├── app/                    # Expo Router screens (file = route)
│   ├── (auth)/
│   │   ├── login.tsx       # Google / username+password / PIN login
│   │   └── pin.tsx         # PIN entry screen
│   ├── (tabs)/
│   │   ├── dashboard.tsx        # Stats dashboard + Log Hours CTA
│   │   ├── events.tsx      # Admin-posted events browser
│   │   └── history.tsx     # Student's past submissions
│   └── log-hours/
│       ├── index.tsx       # Step 1: Org / event selection
│       ├── details.tsx     # Step 2: Date, hours, notes
│       ├── attachments.tsx # Step 3: Photo attachments
│       └── signature.tsx   # Step 4: Supervisor signature + submit
├── components/             # Shared UI components
├── hooks/                  # Custom hooks (API query hooks live here)
├── lib/
│   ├── api.ts              # Axios/fetch base client, auth headers
│   ├── queryClient.ts      # TanStack Query client config
│   └── schemas/            # Zod schemas (one file per domain)
├── store/                  # Zustand stores (one file per domain)
├── types/                  # Shared TypeScript types
└── assets/                 # Images, fonts, icons
```

## Architecture Conventions

### Routing
- All screens live in `app/`. File name = route. Expo Router handles navigation automatically.
- Authenticated routes are grouped under `(tabs)/`. Auth screens under `(auth)/`.
- Use `router.push()` / `router.replace()` for navigation — never pass navigation props manually.
- The hour-logging flow (`log-hours/`) is a multi-step stack, not a tab.

### API & Server State (TanStack Query)
- All API calls go through custom hooks in `hooks/` — never call fetch/axios directly from a component.
- Queries: `useQuery` with a consistent key array, e.g. `['serviceHours', userId]`.
- Mutations: `useMutation` with `onSuccess` / `onError` handlers.
- The base API client lives in `lib/api.ts`. Auth token is injected via an Axios interceptor (or fetch wrapper) — never manually attach headers in components.
- On 401, clear the auth store and redirect to login.

```ts
// Good
const { data: hours } = useServiceHours(userId)

// Bad — never do this in a component
const hours = await fetch('/api/service_hours')
```

### Client State (Zustand)
- Use Zustand only for state that isn't server data: auth session, UI flags, persisted form drafts.
- Auth store (`store/auth.ts`) holds the JWT token and user object. Persist to `expo-secure-store`.
- Log-hours form state (`store/logHoursForm.ts`) persists draft between steps so backgrounding the app doesn't wipe progress.
- Do not put server data (hours, events, orgs) in Zustand — that belongs in TanStack Query cache.

### Forms (React Hook Form + Zod)
- Every form uses `useForm` from RHF with a `zodResolver`.
- Zod schemas live in `lib/schemas/` — one file per domain (e.g. `lib/schemas/serviceHour.ts`).
- Never do manual validation logic in components. Put it in the schema.
- For the multi-step log-hours flow, each step validates its own partial schema before advancing.

### Styling (NativeWind v2)
- Use `className` props for all styling — no inline `style` objects unless unavoidable (e.g. dynamic values).
- Stick to Tailwind utility classes. Custom values go in `tailwind.config.js` theme extension — do not use arbitrary values like `w-[143px]` unless truly necessary.
- NativeWind v2 is pinned — do not upgrade to v4 without careful testing.

### Auth
- Tokens stored in `expo-secure-store` via the Zustand auth store.
- Three login methods: Google OAuth, email/password, PIN.
- PIN is a convenience shortcut set by the student after first login — it is not a standalone credential. The full credential (JWT) still lives in secure store; PIN just gates access locally.
- Apple Sign-In must be added if Google Sign-In is offered (App Store requirement).

### Permissions
- Camera and photo library access via `expo-image-picker`.
- Request permissions at the moment they're needed (not on app launch).
- Always handle the denial case gracefully — show a message explaining why the permission is needed.

### Signature Collection
- Supervisor signature uses `react-native-signature-canvas`.
- The signature screen should be large, clearly labeled, and include a "Clear" button.
- Capture signature as base64 PNG and include it in the submission payload.
- Also collect supervisor name as a text field on the same screen.

## Key Rules

1. **No direct API calls in components.** Always go through a custom hook.
2. **No server data in Zustand.** TanStack Query owns server state.
3. **All forms go through RHF + Zod.** No manual `useState` form handling.
4. **Expo Router for all navigation.** No React Navigation imports directly.
5. **`npx expo install` for all new packages** — not `npm install` — so Expo can pin compatible versions.
6. **TypeScript everywhere.** No `.js` files in `app/`, `components/`, `hooks/`, or `lib/`.

## Backend Contract

The Rails API lives in `backend/`. Key things to know:
- Service hours have a `status` field: `pending`, `approved`, `rejected`.
- `hours` must be > 0 and ≤ 24.
- `description` is required (10–2000 chars).
- `service_date` must fall within the current school year (Sep 1 – Jun 30).
- Photos must be image, video, or PDF — validate mime type client-side before upload.
- Auth uses JWT (Devise-based). Google OAuth only works when `GOOGLE_CLIENT_ID` is set on the server.

## EAS Build Profiles

Defined in `eas.json`:
- `development` — local dev client
- `preview` — internal TestFlight distribution
- `production` — App Store release

Always test on `preview` before submitting a `production` build.

## Git & Project Structure
This project is a subfolder inside a monorepo at kcdserve/.
The backend lives in kcdserve/backend/ — do not modify anything outside of mobile/.
Never run `git init` inside this folder. A root-level git repo already exists at kcdserve/.
When scaffolding with any tool, always skip git initialization.
# CLAUDE.md — Peer Tracker

## Commands

- `npm run dev` — Start development server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npx tsc --noEmit` — Type-check without emitting

## Tech Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **React 19** (useActionState, useOptimistic)
- **Supabase** (Postgres + Auth + RLS) via `@supabase/ssr`
- **Tailwind CSS v4** + **shadcn/ui** components
- **Zod v4** (validation — uses `.issues` not `.errors` for error access)
- **Libraries**: nanoid, date-fns, lucide-react, sonner

## Project Structure

```
peer-tracker/
├── middleware.ts                        # Auth session refresh + route protection + ?next= redirect
├── supabase/migrations/                 # SQL migrations (run via Supabase SQL Editor)
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout (fonts, metadata)
│   │   ├── page.tsx                     # Redirects to /dashboard
│   │   ├── (auth)/                      # Unauthenticated layout (wrapped in Suspense for useSearchParams)
│   │   │   ├── layout.tsx               # Centered card + Suspense boundary
│   │   │   ├── login/page.tsx           # Supports ?next= redirect param
│   │   │   └── signup/page.tsx          # Supports ?next= redirect param
│   │   ├── (app)/                       # Authenticated layout (sidebar, nav, user menu)
│   │   │   ├── layout.tsx               # Fetches profile, renders sidebar/nav
│   │   │   ├── loading.tsx              # Skeleton loading state
│   │   │   ├── error.tsx                # Error boundary
│   │   │   ├── dashboard/page.tsx       # Overview stats, today's tasks, streak cards
│   │   │   ├── goals/page.tsx           # Tabs: Calendar view + Manage Goals
│   │   │   ├── friends/page.tsx         # Friend list + invite generator
│   │   │   ├── friends/[id]/page.tsx    # Friend detail + confirmations
│   │   │   └── settings/page.tsx        # Profile settings form
│   │   ├── auth/callback/route.ts       # OAuth/magic link callback
│   │   └── invite/[code]/page.tsx       # Public invite acceptance (server component, checks auth)
│   ├── components/
│   │   ├── ui/                          # shadcn/ui primitives (do not edit manually)
│   │   ├── layout/                      # Sidebar, MobileNav, UserMenu
│   │   ├── goals/                       # GoalForm, GoalCard, GoalList
│   │   ├── tasks/                       # TaskCheckbox, DailyChecklist, CalendarView, TaskCalendarPage
│   │   ├── friends/                     # FriendCard, InviteGenerator, AcceptInviteButton, ConfirmButton, FriendProgress
│   │   ├── dashboard/                   # OverviewStats, StreakCard
│   │   └── settings/                    # SettingsForm
│   ├── lib/
│   │   ├── supabase/                    # Client factories: server.ts, browser.ts, middleware.ts
│   │   ├── actions/                     # Server Actions: auth, goals, tasks, friends, confirmations, profile
│   │   ├── queries/                     # Data fetching: auth, goals, tasks, friends, confirmations
│   │   ├── utils/                       # days.ts (recurrence), streaks.ts (streak calc)
│   │   └── utils.ts                     # cn() helper from shadcn
│   └── types/
│       └── database.ts                  # Supabase Database type (hand-written, matches migration)
```

## Existing Server Actions

| File | Functions |
|------|-----------|
| `actions/auth.ts` | `signUp`, `signIn`, `signOut` — auth actions support `next` hidden field for post-auth redirect |
| `actions/goals.ts` | `createGoal`, `updateGoal`, `archiveGoal`, `restoreGoal` |
| `actions/tasks.ts` | `toggleTask` |
| `actions/friends.ts` | `createInvite`, `acceptInvite`, `removeFriend` |
| `actions/confirmations.ts` | `confirmTask`, `removeConfirmation` |
| `actions/profile.ts` | `updateProfile` |

## Existing Query Functions

| File | Functions |
|------|-----------|
| `queries/auth.ts` | `getCurrentUser`, `getCurrentProfile` |
| `queries/goals.ts` | `getGoals`, `getGoalById`, `getArchivedGoals` |
| `queries/tasks.ts` | `getTasksForMonth`, `getTasksForDateRange` |
| `queries/friends.ts` | `getFriends` |
| `queries/confirmations.ts` | `getConfirmationsForTasks` |

## Known Bugs

### Invite flow broken — "invalid header value" error
- **Symptom**: After signing up/logging in via an invite link (`/invite/[code]`), the user gets an error: `Headers.append: "Bearer eyJ..." is an invalid header value`
- **Where**: Happens during the Supabase auth token being set in headers after login redirect
- **Likely cause**: The `?next=/invite/[code]` redirect after auth may have a timing issue where the auth session isn't fully established before the invite page tries to use it. Or there's a cookie/header encoding issue with the token.
- **To reproduce**: Generate invite link → open in same browser (logged out) → sign up with `?next=/invite/...` → error after redirect
- **Status**: Not yet fixed. Needs debugging of the auth redirect + session establishment flow.

## Conventions

### Components

- Server Components by default. Only add `'use client'` to interactive leaf components that need browser APIs, hooks, or event handlers.
- Colocate component files with their feature directory (e.g., goal-related components in `src/components/goals/`).
- Use shadcn/ui primitives from `src/components/ui/` for all base UI elements.

### Supabase Clients

Three client factories in `src/lib/supabase/`. Always use the correct one:

- **`server.ts`** — For Server Components and Server Actions. Uses `cookies()` from `next/headers`.
- **`browser.ts`** — For Client Components. Creates a new client per call.
- **`middleware.ts`** — For `middleware.ts` only. Uses `request`/`response` cookie API.

Never import the browser client in server code or vice versa.

### Data Mutations

- All mutations go through **Server Actions** in `src/lib/actions/`.
- No API routes (`route.ts`) for CRUD — only `auth/callback/route.ts` exists for OAuth.
- Validate inputs with **zod v4** schemas. Access errors via `.issues[0].message` (not `.errors`).
- Call `revalidatePath()` after mutations.

### Data Fetching

- Server Components call functions from `src/lib/queries/`.
- Query functions create their own Supabase server client internally.
- Never pass the Supabase client as a parameter.

### Lazy Task Generation

- Task rows are **not** pre-populated.
- Created on first toggle via upsert (`onConflict: "goal_id,date"`).
- Calendar UI renders checkboxes from goal recurrence; missing task row = incomplete.
- Un-toggle sets `completed = false` (keeps the row).

### Friendship Canonical Ordering

- `friendships` table: constraint `user_a < user_b` (UUID comparison).
- Always sort IDs before insert/query: `const [userA, userB] = a < b ? [a, b] : [b, a]`.
- `are_friends(uuid, uuid)` Postgres function gates cross-user reads in RLS.

### Invite System

- Codes generated with `nanoid(8)`, expire after 7 days, single-use.
- Public acceptance page at `/invite/[code]` — server component that checks auth.
- If not logged in: shows "Create an account" / "Sign in" buttons with `?next=/invite/[code]`.
- If logged in: shows "Accept Invite" button via `AcceptInviteButton` client component.
- Auth actions (`signIn`, `signUp`) read a `next` hidden form field and redirect there after auth.
- Middleware also respects `?next=` param when redirecting authenticated users away from `/login` or `/signup`.

### Optimistic UI

- `useOptimistic` + `useTransition` for task toggles and confirmations.
- Toast errors on failure via `sonner`.

### Row Level Security

- Every table has RLS enabled.
- Own data: `auth.uid() = user_id` policies.
- Friend data: gated by `are_friends()` function.
- Never use the service role key in client-facing code.

### Database Types

- Hand-written in `src/types/database.ts` to match the migration.
- Each table needs `Row`, `Insert`, `Update`, and `Relationships` fields (required by `@supabase/supabase-js`).
- Update this file whenever the migration changes.

### Styling

- Tailwind CSS v4 utility classes.
- shadcn/ui theming via CSS variables in `globals.css`.
- Mobile-first responsive design. Bottom nav on mobile, sidebar on desktop.

### File Naming

- Components: `PascalCase.tsx` (e.g., `GoalCard.tsx`)
- Non-component modules: `kebab-case.ts` or `camelCase.ts`
- Server Actions: grouped by domain in `src/lib/actions/`

### ESLint

- Underscore-prefixed vars (`_prev`, `_formData`) are allowed unused (configured in `eslint.config.mjs`).

## Database Migration

Single migration file: `supabase/migrations/00001_initial_schema.sql`

**Order matters** — tables first, then functions, then RLS policies, then indexes. The `are_friends()` function references `friendships`, so `friendships` must be created before it.

Tables: `profiles`, `goals`, `friendships`, `tasks`, `invites`, `confirmations`

Run migrations via the Supabase SQL Editor (paste and run), not via CLI.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Stored in `.env.local` (gitignored). See `.env.example` for reference.

## Deployment

- **Vercel**: Import from GitHub, add env vars, deploy
- **Supabase**: After deploy, set Site URL and Redirect URLs in Authentication > URL Configuration
- Not yet deployed — deployment was in progress when session ended

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
│   │   │   ├── dashboard/page.tsx       # Streak greeting, 4-card stats, calendar hero, friends today sidebar
│   │   │   ├── goals/page.tsx           # Calendar always visible + active goals + collapsible archived section
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
│   │   ├── dashboard/                   # OverviewStats, StreakCard, FriendsTodaySection
│   │   └── settings/                    # SettingsForm
│   ├── lib/
│   │   ├── supabase/                    # Client factories: server.ts, browser.ts, middleware.ts, admin.ts
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
| `actions/goals.ts` | `createGoal`, `updateGoal`, `archiveGoal`, `restoreGoal`, `deleteGoal` |
| `actions/tasks.ts` | `toggleTask` |
| `actions/friends.ts` | `createInvite`, `acceptInvite`, `removeFriend` |
| `actions/confirmations.ts` | `confirmTask`, `removeConfirmation` |
| `actions/profile.ts` | `updateProfile`, `deleteAccount` |

## Existing Query Functions

| File | Functions |
|------|-----------|
| `queries/auth.ts` | `getCurrentUser`, `getCurrentProfile` |
| `queries/goals.ts` | `getGoals`, `getArchivedGoals` |
| `queries/tasks.ts` | `getTasksForDateRange` |
| `queries/friends.ts` | `getFriends`, `getFriendsWithTodayProgress` |
| `queries/confirmations.ts` | `getConfirmationsForTasks`, `getTodayConfirmationCount`, `getMyConfirmationsForTasks` |

## Conventions

### Components

- Server Components by default. Only add `'use client'` to interactive leaf components that need browser APIs, hooks, or event handlers.
- Colocate component files with their feature directory (e.g., goal-related components in `src/components/goals/`).
- Use shadcn/ui primitives from `src/components/ui/` for all base UI elements.

### Supabase Clients

Four client factories in `src/lib/supabase/`. Always use the correct one:

- **`server.ts`** — For Server Components and Server Actions. Uses `cookies()` from `next/headers`.
- **`browser.ts`** — For Client Components. Creates a new client per call.
- **`middleware.ts`** — For `middleware.ts` only. Uses `request`/`response` cookie API.
- **`admin.ts`** — Service-role client for admin operations (e.g., `deleteAccount`, `acceptInvite`). Server-only, never import from client code. Use for cross-user operations that RLS can't express cleanly.

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
- `acceptInvite` uses the **admin client** (service-role) for the update + friendship insert because invite acceptance is a cross-user operation (user B updating user A's invite row). Auth is verified server-side before any admin operations.

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

- **Navy + Saffron theme** — OKLCH palette in `globals.css`: light mode uses a soft blue-white background (`oklch(0.97 0.008 240)`) with saffron primary (`oklch(0.72 0.17 80)`), teal accent, and white cards. Dark mode inverts to deep navy background.
- Sidebar is always dark/inverted (`oklch(0.22 0.04 240)`) in both light and dark modes, with saffron for active items.
- No paper grain texture.
- Custom animated cursor via `CustomCursor` client component (pure CSS/canvas, no external SVG files).
- CalendarView day cells: emerald tint (all done), amber tint (partial), no tint (nothing done — rose was removed as too jarring).
- DailyChecklist rows cycle through 6 pastel tints: amber, sky, teal, indigo, violet, rose.
- `OverviewStats` renders a 4-card grid on dashboard (no `compact` prop needed). Streak ≥ 7 days gets amber flame icon and "N-day streak!" label.
- Tailwind CSS v4 utility classes.
- shadcn/ui theming via CSS variables in `globals.css`.
- Mobile-first responsive design. Bottom nav on mobile, sidebar on desktop.
- Desktop header (`md:hidden`) — the top header bar is hidden on desktop; UserMenu lives in the sidebar bottom on desktop.

### Layout

- `Sidebar` accepts a `displayName: string` prop and renders `<UserMenu>` at the bottom with sidebar-specific styling.
- `AppLayout` passes `profile.display_name` to `Sidebar` and applies `md:hidden` to the top header.
- `UserMenu` accepts an optional `className` prop for contextual styling (sidebar uses `justify-start text-sidebar-foreground/80`).

### Forms

- All `<form>` elements wrapping `CardContent` + `CardFooter` must have `className="flex flex-col gap-6"` to ensure proper spacing between form sections. `Card`'s built-in `gap-6` only applies to direct flex children — wrapping in a `<form>` breaks this.

### Goal Lifecycle

- Active goals: shown on dashboard calendar and daily checklist.
- Archived goals (`archived=true`): hidden from dashboard; visible in collapsible "Archived" section at bottom of Goals page (dimmed opacity). Can be restored or permanently deleted.
- `deleteGoal` permanently removes the goal and all task history (non-reversible). Only available on archived goals.
- `GoalList` receives both `goals` and `archivedGoals` props; uses `showArchived` toggle state.

### Dashboard Structure

- Heading: streak-based greeting via `getStreakGreeting(streak, name, date)` — tiers at 0, 1, 2–3, 4–6, 7–13, 14–20, 21–29, 30–59, 60+ days. Uses day-of-month to deterministically rotate messages.
- Stats: 4-card `OverviewStats` grid (Goals, Today progress, Best Streak, Kudos received).
- Main: `TaskCalendarPage` with `rightColumnExtra` prop carrying `<FriendsTodaySection>`.
- Right column layout: daily checklist card on top, Friends Today section below.

### Friends Today Section

- `FriendsTodaySection` component in `src/components/dashboard/` — server component.
- `getFriendsWithTodayProgress(today: Date)` in `queries/friends.ts` — batch-fetches profiles, goals, tasks in parallel; returns per-friend `{ completedToday, totalToday }`.
- Color coding: emerald (all done), amber (partial), rose (0/N), muted (no goals today).
- Each pill links to `/friends/[id]`.
- `FriendCard` on the Friends page also shows an inline progress badge (same color logic).

### Confirmation Visibility

- `getMyConfirmationsForTasks(taskIds)` returns confirmations on the current user's own tasks (who confirmed them).
- `DailyChecklist` accepts `confirmations?: TaskConfirmation[]` and shows confirmer initials as small saffron avatar chips on task rows. Up to 3 shown, then `+N`.

### File Naming

- Components: `PascalCase.tsx` (e.g., `GoalCard.tsx`)
- Non-component modules: `kebab-case.ts` or `camelCase.ts`
- Server Actions: grouped by domain in `src/lib/actions/`

### ESLint

- Underscore-prefixed vars (`_prev`, `_formData`) are allowed unused (configured in `eslint.config.mjs`).

## Database Migration

Single consolidated migration file: `supabase/migrations/00000_full_schema.sql`

**Order matters** — tables first, then functions, then RLS policies, then grants, then indexes. The `are_friends()` function references `friendships`, so `friendships` must be created before it.

Tables: `profiles`, `goals`, `friendships`, `tasks`, `invites`, `confirmations`

Key detail: `invites.accepted_by` uses `ON DELETE SET NULL` (not cascade) so old invite records survive when a user deletes their account.

Run migrations via the Supabase SQL Editor (paste and run), not via CLI.

**Critical**: The migration includes `GRANT` statements for `anon`, `authenticated`, and `service_role` roles. Without these grants, RLS policies alone are not sufficient — PostgreSQL requires both table-level grants AND passing RLS checks. The `invites` table uses split policies (separate SELECT/INSERT/DELETE for the inviter, separate UPDATE for the acceptor) instead of a single `FOR ALL` policy, because `FOR ALL` policies apply their `WITH CHECK` to all operations including updates by non-owners.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix — server-only) is used by `admin.ts` for account deletion and invite acceptance. Get it from Supabase dashboard → Settings → API → `service_role` key. **Required** — the app will crash without it when accepting invites or deleting accounts.

Stored in `.env.local` (gitignored). See `.env.example` for reference.

## Deployment

- **Vercel**: Import from GitHub, add env vars, deploy
- **Supabase**: After deploy, set Site URL and Redirect URLs in Authentication > URL Configuration

# CLAUDE.md — Peer Tracker

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npx tsc --noEmit` — Type-check without emitting

## Project Structure

- `src/app/(auth)/` — Unauthenticated routes (login, signup)
- `src/app/(app)/` — Authenticated routes (dashboard, goals, friends, settings)
- `src/app/invite/[code]/` — Public invite acceptance page
- `src/components/ui/` — shadcn/ui primitives (do not edit manually)
- `src/components/` — Feature components grouped by domain (goals/, tasks/, friends/, dashboard/, layout/)
- `src/lib/supabase/` — Supabase client factories (server, browser, middleware)
- `src/lib/actions/` — Server Actions for all mutations
- `src/lib/queries/` — Data fetching functions used by Server Components
- `src/lib/utils/` — Pure utility functions (dates, streaks, invite codes)
- `src/types/` — TypeScript types (database schema types, app-level types)
- `supabase/migrations/` — Versioned SQL migration files
- `middleware.ts` — Auth session refresh and route protection

## Conventions

### Components

- Server Components by default. Only add `'use client'` to interactive leaf components that need browser APIs, hooks, or event handlers.
- Colocate component files with their feature directory (e.g., goal-related components go in `src/components/goals/`).
- Use shadcn/ui primitives from `src/components/ui/` for all base UI elements (Button, Card, Dialog, Input, etc.).

### Supabase Clients

Three client factories exist in `src/lib/supabase/`. Always use the correct one:

- **`server.ts`** — For Server Components and Server Actions. Uses `cookies()` from `next/headers`.
- **`browser.ts`** — For Client Components. Singleton instance, no cookie access.
- **`middleware.ts`** — For `middleware.ts` only. Uses `request`/`response` cookie API.

Never import the browser client in server code or vice versa.

### Data Mutations

- All data mutations go through **Server Actions** in `src/lib/actions/`.
- No API routes (`route.ts`) for CRUD operations.
- Validate inputs with **zod** schemas at the top of each action.
- Server Actions should call `revalidatePath()` after mutations to refresh cached data.

### Data Fetching

- Server Components fetch data using functions from `src/lib/queries/`.
- Query functions create their own Supabase server client internally.
- Never pass the Supabase client as a parameter to query functions.

### Lazy Task Generation

- Task rows in the `tasks` table are **not** pre-populated.
- A task row is created only when the user first interacts with it (e.g., toggling a checkbox).
- The calendar UI renders checkboxes based on the goal's recurrence settings. If no task row exists for a date, it shows as incomplete.
- On toggle: upsert a task row with `completed = true` and the date. On un-toggle: set `completed = false` (keep the row).

### Friendship Canonical Ordering

- The `friendships` table stores pairs with the constraint `user_a < user_b` (UUID comparison).
- When inserting or querying friendships, always sort the two user IDs and assign the smaller one to `user_a` and the larger to `user_b`.
- A Postgres helper function `are_friends(uuid, uuid)` is used in RLS policies to gate cross-user data access.

### Invite System

- Invite codes are generated with `nanoid` (8 characters).
- Invites expire after 7 days and are single-use.
- The invite acceptance page is a public route at `/invite/[code]`.

### Optimistic UI

- Use `useOptimistic` from React for instant feedback on task toggling.
- The Server Action runs in the background; if it fails, the UI reverts.

### Row Level Security

- Every table has RLS policies enabled.
- Users can read/write their own data.
- Cross-user reads (viewing friend progress) are gated by the `are_friends()` database function.
- Never bypass RLS with the service role key in client-facing code.

### Styling

- Use Tailwind CSS utility classes for all styling.
- Follow the shadcn/ui theming system (CSS variables in `globals.css`).
- Mobile-first responsive design.

### TypeScript

- Strict mode enabled.
- Database types are generated from Supabase schema into `src/types/database.ts`.
- Regenerate types after migration changes with `npx supabase gen types typescript --local > src/types/database.ts`.
- Define app-level types (derived/composed from DB types) in `src/types/`.

### File Naming

- Components: `PascalCase.tsx` (e.g., `GoalCard.tsx`)
- Non-component modules: `kebab-case.ts` (e.g., `streak-calc.ts`)
- Server Actions: group by domain in `src/lib/actions/` (e.g., `goals.ts`, `tasks.ts`, `friends.ts`)

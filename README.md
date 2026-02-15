# Peer Tracker

A peer accountability goal-tracking app where users create goals with daily tasks, track them on a calendar, and friends can view each other's progress and confirm task completions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database & Auth | Supabase (Postgres, Auth, Row Level Security) |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Vercel (free tier) |
| Libraries | zod, nanoid, date-fns, lucide-react, sonner |

## Features

- **Goal creation** — Define goals with flexible recurrence (daily, weekdays, weekends, custom days)
- **Daily task tracking** — Calendar view with checkboxes; tasks are lazily created on first interaction
- **Streak tracking** — Automatic streak counting and completion rate stats
- **Friend system** — Invite friends via shareable link codes (7-day expiry, one-time use)
- **Peer confirmations** — Friends can view your progress and confirm task completions
- **Row Level Security** — All data access is gated through Supabase RLS policies

## Data Model

Six tables in Supabase Postgres:

| Table | Purpose |
|-------|---------|
| `profiles` | Public user data, synced from `auth.users` via database trigger |
| `goals` | User goals with recurrence settings |
| `tasks` | Daily task instances, lazily created on first interaction |
| `friendships` | Canonical pairs (`user_a < user_b`) to prevent duplicates |
| `invites` | Invite codes with 7-day expiry, one-time use |
| `confirmations` | Friend confirmations of task completions |

## Project Structure

```
peer-tracker/
├── middleware.ts                     # Auth session refresh + route protection
├── supabase/migrations/              # Versioned SQL migrations
├── src/
│   ├── app/
│   │   ├── (auth)/                   # Login, Signup (unauthenticated layout)
│   │   ├── (app)/                    # Dashboard, Goals, Friends (authenticated layout)
│   │   │   ├── dashboard/
│   │   │   ├── goals/
│   │   │   ├── friends/
│   │   │   └── settings/
│   │   └── invite/[code]/            # Public invite acceptance
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   ├── layout/                   # Sidebar, nav, user menu
│   │   ├── goals/                    # Goal form, card, list
│   │   ├── tasks/                    # Task checkbox, list, calendar
│   │   ├── friends/                  # Friend card, invite generator, confirm button
│   │   └── dashboard/               # Streak display, progress ring
│   ├── lib/
│   │   ├── supabase/                 # Client factories (server, browser, middleware)
│   │   ├── actions/                  # Server Actions (auth, goals, tasks, friends, confirmations)
│   │   ├── queries/                  # Data fetching functions for Server Components
│   │   └── utils/                    # Date helpers, streak calc, invite codes
│   └── types/                        # TypeScript types (database, app-level)
```

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### Setup

1. Clone the repo and install dependencies:

```bash
git clone <repo-url> peer-tracker
cd peer-tracker
npm install
```

2. Create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the Supabase migrations:

```bash
npx supabase db push
```

4. Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting |

## Deployment

1. Push the repo to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel dashboard.
4. Deploy. Vercel auto-detects Next.js and handles the rest.

## Implementation Phases

1. **Foundation** — Scaffold, Supabase setup, auth flow
2. **Goals CRUD** — Create/edit/archive goals with recurrence
3. **Tasks + Calendar** — Calendar view, daily checklists, lazy task creation
4. **Streaks + Progress** — Streak counting, completion rates
5. **Friends + Invites** — Invite links, friend list
6. **Confirmations** — View friend progress, confirm tasks
7. **Polish + Deploy** — Responsive design, loading states, error handling, Vercel deploy

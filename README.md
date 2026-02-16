# Peer Tracker

A peer accountability goal-tracking app where users create goals with daily tasks, track them on a calendar, and friends can view each other's progress and confirm task completions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Database & Auth | Supabase (Postgres, Auth, Row Level Security) |
| Styling | Tailwind CSS v4 + shadcn/ui (construction paper pastel theme) |
| Deployment | Vercel |
| Libraries | zod v4, nanoid, date-fns, lucide-react, sonner |

## Features

- **Goal creation** — Define goals with flexible recurrence (daily, weekdays, weekends, custom days)
- **Calendar-first dashboard** — Full-width calendar as the hero content with pastel-tinted day cells (green/yellow/rose for completion status)
- **Calendar view** — Always-visible calendar on the goals page with per-day task checklist
- **Daily task tracking** — Checkboxes with optimistic UI; tasks lazily created on first toggle
- **Streak tracking** — Automatic streak counting and 30-day completion rate stats
- **Friend system** — Invite friends via shareable link codes (7-day expiry, one-time use)
- **Peer confirmations** — Friends can view your progress and confirm task completions
- **Construction paper theme** — Warm pastel color palette, paper grain texture, and hand-drawn cursors
- **Row Level Security** — All data access gated through Supabase RLS policies

## Data Model

Six tables in Supabase Postgres:

| Table | Purpose |
|-------|---------|
| `profiles` | Public user data, auto-created from `auth.users` via database trigger |
| `goals` | User goals with recurrence settings (daily/weekdays/weekends/custom) |
| `tasks` | Daily task instances, lazily created on first checkbox toggle |
| `friendships` | Canonical pairs (`user_a < user_b`) to prevent duplicate rows |
| `invites` | Invite codes with 7-day expiry, single-use |
| `confirmations` | Friend confirmations of task completions |

## Project Structure

```
peer-tracker/
├── middleware.ts                        # Auth session refresh + route protection
├── public/cursors/                      # Hand-drawn cursor SVGs (arrow, pointer)
├── supabase/migrations/                 # SQL migrations
├── src/
│   ├── app/
│   │   ├── (auth)/                      # Login, Signup (unauthenticated layout)
│   │   ├── (app)/                       # Dashboard, Goals, Friends, Settings (authenticated layout)
│   │   │   ├── dashboard/               # Calendar-first layout: compact stats, calendar hero, streaks
│   │   │   ├── goals/                   # Calendar always visible + goal management below
│   │   │   ├── friends/                 # Friend list, invite generator
│   │   │   ├── friends/[id]/            # Friend detail + confirmations
│   │   │   └── settings/               # Profile settings
│   │   ├── auth/callback/               # OAuth callback route
│   │   └── invite/[code]/               # Public invite acceptance
│   ├── components/
│   │   ├── ui/                          # shadcn/ui primitives
│   │   ├── layout/                      # Sidebar, MobileNav, UserMenu
│   │   ├── goals/                       # GoalForm, GoalCard, GoalList
│   │   ├── tasks/                       # TaskCheckbox, DailyChecklist, CalendarView, TaskCalendarPage
│   │   ├── friends/                     # FriendCard, InviteGenerator, AcceptInviteButton, ConfirmButton, FriendProgress
│   │   ├── dashboard/                   # OverviewStats, StreakCard
│   │   └── settings/                    # SettingsForm
│   ├── lib/
│   │   ├── supabase/                    # Client factories (server, browser, middleware)
│   │   ├── actions/                     # Server Actions (auth, goals, tasks, friends, confirmations, profile)
│   │   ├── queries/                     # Data fetching (auth, goals, tasks, friends, confirmations)
│   │   └── utils/                       # Date helpers, streak calculation
│   └── types/
│       └── database.ts                  # TypeScript types matching Supabase schema
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

2. Create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

Then fill in your Supabase credentials (Project URL and anon key from **Settings > API** in the Supabase dashboard).

3. Run the database migration:

Go to your Supabase dashboard **SQL Editor**, paste the contents of `supabase/migrations/00001_initial_schema.sql`, and run it.

4. Configure auth for local testing:

In Supabase dashboard: **Authentication > Providers > Email**:
- Enable the Email provider
- Toggle off "Confirm email"

5. Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting |

## Deployment

1. Push the repo to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel dashboard.
4. Deploy — Vercel auto-detects Next.js.
5. In Supabase dashboard, go to **Authentication > URL Configuration**:
   - Set **Site URL** to your Vercel production URL.
   - Add `https://your-app.vercel.app/**` to **Redirect URLs**.

## Current Status

- All core features implemented and building cleanly
- Construction paper theme applied: warm pastel palette, paper grain texture, hand-drawn cursors
- Calendar-first dashboard and tab-free goals page
- Supabase project configured and connected
- **Known bug**: Invite flow has an "invalid header value" error when redirecting after signup/login — needs debugging
- Vercel deployment not yet completed

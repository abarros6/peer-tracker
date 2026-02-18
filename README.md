# Peer Tracker

A peer accountability goal-tracking app where users create goals with daily tasks, track them on a calendar, and friends can view each other's progress and confirm task completions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Database & Auth | Supabase (Postgres, Auth, Row Level Security) |
| Styling | Tailwind CSS v4 + shadcn/ui (navy + saffron OKLCH theme) |
| Deployment | Vercel |
| Libraries | zod v4, nanoid, date-fns, lucide-react, sonner |

## Features

- **Goal creation** — Define goals with flexible recurrence (daily, weekdays, weekends, custom days)
- **Calendar-first dashboard** — Full-width calendar as the hero content with emerald/amber day tints for completion status
- **Streak-based greeting** — Dashboard heading rotates motivational messages based on your current streak length
- **Calendar view** — Always-visible calendar on the goals page with per-day task checklist
- **Daily task tracking** — Checkboxes with optimistic UI; tasks lazily created on first toggle
- **Completion banner** — "All done for today!" banner appears in the checklist when all tasks are checked off
- **Streak tracking** — Automatic streak counting displayed with flame icon when ≥ 7 days
- **Friend system** — Invite friends via shareable link codes (7-day expiry, one-time use)
- **Friends Today sidebar** — Color-coded friend progress pills on the dashboard (emerald/amber/rose)
- **Peer confirmations** — Friends can view your progress and confirm task completions; confirmer initials appear on your own task rows
- **Goal archiving** — Archive goals to hide them from your dashboard; restore or permanently delete from the Goals page
- **Account deletion** — Users can delete their account and all data from settings (Danger Zone)
- **Navy + saffron theme** — Clean OKLCH palette, dark inverted sidebar, custom animated cursor
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
├── supabase/migrations/                 # SQL migrations (single consolidated file)
├── src/
│   ├── app/
│   │   ├── (auth)/                      # Login, Signup (unauthenticated layout)
│   │   ├── (app)/                       # Dashboard, Goals, Friends, Settings (authenticated layout)
│   │   │   ├── dashboard/               # Streak greeting, 4-card stats, calendar hero, friends today sidebar
│   │   │   ├── goals/                   # Calendar always visible + active/archived goal management
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
│   │   ├── dashboard/                   # OverviewStats, StreakCard, FriendsTodaySection
│   │   └── settings/                    # SettingsForm
│   ├── lib/
│   │   ├── supabase/                    # Client factories (server, browser, middleware, admin)
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

Then fill in your Supabase credentials from **Settings > API** in the Supabase dashboard:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `anon` public key
- `SUPABASE_SERVICE_ROLE_KEY` — `service_role` secret key (used for account deletion)

3. Run the database migration:

Go to your Supabase dashboard **SQL Editor**, paste the contents of `supabase/migrations/00000_full_schema.sql`, and run it.

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
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) in the Vercel dashboard.
4. Deploy — Vercel auto-detects Next.js.
5. In Supabase dashboard, go to **Authentication > URL Configuration**:
   - Set **Site URL** to your Vercel production URL.
   - Add `https://your-app.vercel.app/**` to **Redirect URLs**.

## Current Status

- All core features implemented and working: signup, login, goals, tasks, calendar, friends, invites, confirmations, account deletion
- Navy + saffron OKLCH theme with dark inverted sidebar and custom animated cursor
- Calendar-first dashboard with streak greeting, friends today sidebar, and confirmation visibility
- Goal archive/restore/delete flow fully functional
- Invite link flow fully functional (signup → accept invite → friendship created)
- Account deletion with admin client + confirmation dialog
- Database consolidated into single migration (`00000_full_schema.sql`) with grants for all Supabase roles

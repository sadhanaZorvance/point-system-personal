# CLAUDE.md — StarPoints

## Project Overview

StarPoints is a gamified point-tracking Progressive Web App (PWA) for children. Parents/admins award or deduct points for tasks and habits; kids earn points and redeem them for rewards. Features include level progression, streak tracking, badges, confetti animations, and a PIN-protected admin panel.

## Tech Stack

- **Framework:** React 18 with Vite 5
- **Styling:** Tailwind CSS 3.4 + CSS custom properties for theming
- **Animations:** Framer Motion + Canvas Confetti
- **Charts:** Recharts
- **PDF:** jsPDF + jsPDF-AutoTable
- **Backend:** Supabase (PostgreSQL + Realtime) with localStorage fallback
- **PWA:** vite-plugin-pwa (Workbox)
- **Routing:** React Router DOM 6

## Quick Commands

```bash
npm run dev       # Start dev server on port 3000
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

There is no test framework, linter, or formatter configured.

## Project Structure

```
src/
├── components/    # Reusable UI components (TaskTile, BottomNav, PinModal, etc.)
├── hooks/         # Custom React hooks (useProfile, useTasks, useTransactions, useTheme)
├── lib/           # Core services (dataLayer.js, supabase.js, useAuth.js)
├── screens/       # Full-page views (HomeScreen, ParentPanel, AdminDashboard, etc.)
│   └── admin/     # Admin sub-screens (TasksManager, RewardsManager, Analytics, etc.)
├── utils/         # Utilities (levels.js, theme.js, timeOfDay.js, generatePDF.js)
├── App.jsx        # Root component with route definitions
├── main.jsx       # Entry point
└── index.css      # Global styles + Tailwind directives
supabase/
├── schema.sql     # PostgreSQL schema with RLS policies
└── seed.sql       # Demo/seed data
```

## Routes

| Path | Screen | Access |
|------|--------|--------|
| `/` | HomeScreen | Public (kid-facing) |
| `/parent` | ParentPanel | PIN-protected |
| `/admin/*` | AdminDashboard | PIN-protected |
| `/activities` | ActivitiesScreen | PIN-protected |
| `/charts` | ChartsScreen | PIN-protected |
| `/settings` | SettingsScreen | Open |

## Data Layer

The app uses a hybrid persistence strategy (`src/lib/dataLayer.js`):

1. **Supabase mode:** When `VITE_SUPABASE_URL` is set, Supabase is the source of truth
2. **localStorage fallback:** Data is always cached in localStorage (prefix: `starpoints_`)
3. **Local-only mode:** Without Supabase env vars, runs entirely on localStorage

Authentication modes (`src/lib/useAuth.js`):
- **Fixed user ID:** Set `VITE_SUPABASE_USER_ID` to skip login (personal/family use)
- **Session mode:** Uses Supabase anonymous auth
- **Local mode:** No auth, single device

## Database Schema (Supabase)

Five tables, all with RLS policies scoped to `auth.uid() = user_id`:
- `profiles` — balance, streaks, level, PINs, theme, bonus multiplier
- `tasks` — task definitions (name, points, category, emoji)
- `rewards` — reward definitions (name, cost, category, weekend_only flag)
- `transactions` — point ledger (type, delta, balance_after, timestamp)
- `badges` — earned achievements (badge_key, earned_at)

## Environment Variables

Copy `.env.example` to `.env`:

```bash
VITE_SUPABASE_URL=         # Supabase project URL (optional)
VITE_SUPABASE_ANON_KEY=    # Supabase anon key (optional)
VITE_SUPABASE_USER_ID=     # Fixed user UUID, bypasses login (optional)
```

All are optional. Leaving them blank runs in localStorage-only mode.

## Key Conventions

- **Components:** `.jsx` files, PascalCase names, functional with hooks
- **Hooks:** `src/hooks/use*.js` — manage state + Supabase sync
- **Utilities:** `src/utils/*.js` — pure functions, camelCase
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_TASKS`, `LEVEL_THRESHOLDS`)
- **Timezone:** All dates use Eastern Time (`America/New_York`), date strings as `YYYY-MM-DD` (en-CA locale)
- **Theming:** CSS custom properties (`--color-primary`, etc.) swapped at runtime via theme packs in `src/utils/theme.js`
- **Animations:** Use Framer Motion (`motion.div`, `AnimatePresence`) for transitions

## Key Domain Concepts

- **Levels:** 5 tiers (Helper → Star → Champion → Hero → Legend) based on lifetime points, defined in `src/utils/levels.js`
- **Streaks:** Consecutive active days; tracked in profile (`current_streak`, `longest_streak`)
- **Time-of-day:** Tasks categorized by Morning/Afternoon/Evening/Night/Weekend windows (`src/utils/timeOfDay.js`)
- **PIN protection:** Parent PIN (4 digits) guards ParentPanel; Admin PIN guards AdminDashboard
- **Transactions:** Immutable ledger with undo support; types include task completion, reward redemption, manual adjustment

# Task & Reward Point System — Architecture & Requirements
**Product Name (Working Title):** StarPoints  
**Document Type:** Ideation & Architecture Spec  
**Audience:** Developer handoff + personal reference  
**Date:** March 24, 2026  
**Status:** Draft v1.0

---

## 1. Overview

A gamified point-tracking Progressive Web App (PWA) for a 10-year-old child. Parents award or deduct points based on tasks, habits, and behavior. The child redeems points for rewards. The app is engaging, visual, and chart-heavy to sustain long-term motivation.

---

## 2. Platform Decision

| Decision | Choice | Rationale |
|---|---|---|
| Platform | Progressive Web App (PWA) | Installable on iOS/Android without App Store, works offline, instant updates |
| Framework | React (with Vite) | Fast, component-based, excellent PWA support |
| Styling | Tailwind CSS | Rapid theming, responsive, utility-first |
| Animation | Framer Motion | Smooth transitions, confetti, level-up animations |
| Charts | Recharts or Chart.js | Both React-compatible, well-documented |
| Backend | Supabase | Open source, PostgreSQL, real-time sync, auth, free tier |
| Hosting | Vercel or Netlify | Free tier, instant deploys, PWA-friendly |
| Commercial Path | React Native (Capacitor wrapper) | Reuse PWA codebase, publish to App Store when ready |

---

## 3. Screen Architecture

### 3.1 Home Screen (Public — No PIN Required)

**Purpose:** Kid-facing display. Always visible. Read-only.

**Elements:**
- Child's name (customizable) — large, prominent, top center
- Current spendable point balance — giant animated number (ticks up/down satisfyingly)
- Active streak — flame emoji, streak count, pulses when growing
- Goal progress bar — "You're saving for: Sleepover Night — 87/150 pts 🎉"
- Level/rank badge — e.g., "Gold Champion 🏆"
- Daily summary — points earned today vs points spent today
- Seasonal/time-of-day theme — auto-switches (morning bright, evening dark/starry, Halloween in October, etc.)
- "Print Chart" button — bottom corner, opens printable PDF (no PIN required)
- Confetti burst — triggers whenever the screen detects a point increase

---

### 3.2 Parent Quick-Action Panel (PIN Protected — Short PIN)

**Purpose:** Fast, daily point management. Optimized for speed.

**Elements:**
- Time-of-day filtered task tiles (auto-surfaced based on Eastern Time — see Section 7)
- Task tiles — color coded:
  - 🟢 Green tiles = positive tasks (tap to add points)
  - 🔴 Red tiles = negative/deduction tasks (tap to deduct points)
- Each tile shows: task name + point value
- Tap → confirmation dialog → animated point update on home screen
- Rewards Redemption section (below tasks):
  - Gold/purple tiles showing reward name + point cost
  - Tap to redeem → deducts points → celebration animation
- Today's activity log — scrollable, timestamped list of all actions taken today
- Undo button — last action can be reversed within 60 seconds

---

### 3.3 Admin Dashboard (PIN Protected — Longer PIN)

**Purpose:** Full configuration and management. Parent-only.

**Tabs / Sections:**

#### Tasks Management
- Add / Edit / Delete tasks
- Fields: Task name, point value (+/-), category (Morning/Afternoon/Evening/Weekend/Any), icon/emoji
- Toggle: Active / Inactive (hide from quick-action without deleting)

#### Rewards Management
- Add / Edit / Delete rewards
- Fields: Reward name, point cost, category (Daily/Weekly/Big), icon/emoji, weekend-only toggle
- Toggle: Active / Inactive

#### Profile Settings
- Child's name
- Avatar / emoji selection
- App theme / color palette
- PIN management (separate PINs for parent panel and admin)
- Timezone confirmation (default: Eastern Time)

#### Point History Log
- Full scrollable log of all point changes
- Filter by: date range, task, positive/negative
- Undo capability (within same session)
- Export to CSV

#### Analytics (Charts — see Section 6)
- All charts displayed here in full detail
- Date range picker

---

## 4. Data Model (Supabase / PostgreSQL)

### Tables

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | Child's display name |
| avatar | text | Emoji or image URL |
| theme | text | Color theme identifier |
| current_balance | integer | Spendable points |
| lifetime_points | integer | Never resets — used for leveling |
| current_streak | integer | Consecutive net-positive days |
| longest_streak | integer | All-time record |
| created_at | timestamp | |

#### `tasks`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | Task display name |
| points | integer | Positive = earn, Negative = deduct |
| category | text | morning / afternoon / evening / weekend / any |
| emoji | text | Display icon |
| is_active | boolean | Show/hide in quick panel |
| created_at | timestamp | |

#### `rewards`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | Reward display name |
| point_cost | integer | Points required to redeem |
| category | text | daily / weekly / big |
| emoji | text | Display icon |
| weekend_only | boolean | Only show on weekends |
| is_active | boolean | |
| created_at | timestamp | |

#### `transactions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| profile_id | uuid | Foreign key → profiles |
| type | text | task_earn / task_deduct / reward_redeem |
| reference_id | uuid | Task or reward ID |
| reference_name | text | Snapshot of name at time of transaction |
| points_delta | integer | +/- change applied |
| balance_after | integer | Running balance after change |
| timestamp | timestamptz | Full datetime with timezone |
| notes | text | Optional parent note |

#### `badges`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| profile_id | uuid | Foreign key → profiles |
| badge_key | text | e.g., "early_bird", "perfect_week" |
| earned_at | timestamp | |

---

## 5. Sync Strategy

- All data lives in Supabase (cloud PostgreSQL)
- Real-time subscriptions: Supabase Realtime — home screen updates instantly when parent adds points from any device
- Offline support: PWA caches last known state via service worker; queues transactions locally when offline; syncs when reconnected
- Auth: Supabase Auth — single family account, no separate child login
- Row Level Security (RLS): All data scoped to authenticated user — safe for multi-family commercial use

---

## 6. Charts & Gamification (All Included)

### 6.1 Points Over Time — Bar Chart
- 7-day and 30-day toggle
- One bar per day
- Green = net positive day, Red = net negative day
- Hover/tap shows breakdown of that day
- Location: Admin Dashboard → Analytics + Weekly Summary Card

### 6.2 Streak Tracker
- Consecutive net-positive days counter
- Flame emoji 🔥 that visually grows (small → medium → large → blazing) at milestones (3, 7, 14, 30 days)
- Streak resets on net-negative day
- Personal record always displayed alongside current streak
- Location: Home Screen (always visible) + Admin Dashboard

### 6.3 Level / Rank System
| Level | Title | Lifetime Points |
|---|---|---|
| 1 | Helper ⭐ | 0 |
| 2 | Rising Star 🌟 | 500 |
| 3 | Gold Champion 🏆 | 1,500 |
| 4 | Super Kid ⚡ | 3,500 |
| 5 | Legend 💎 | 7,500 |

- Level-up triggers full-screen celebration animation
- Lifetime points never decrease (rank is permanent)
- Badge displayed prominently on home screen
- Location: Home Screen + Admin Dashboard

### 6.4 Goal Progress Bar
- Child (or parent) selects a target reward they're saving toward
- Animated progress bar on home screen: "Sleepover Night — 87/150 pts 🎉"
- Bar fills and pulses as points are added
- On goal reached: confetti + special animation
- Location: Home Screen (primary feature)

### 6.5 Weekly Summary Card
- Auto-generated every Sunday evening
- Content:
  - Total points earned this week
  - Total tasks completed
  - Total rewards redeemed
  - Best day of the week
  - Most completed task
  - Motivational message ("You crushed your homework routine! 📚")
- Shareable / printable card format
- Location: Admin Dashboard → Weekly Summary tab

### 6.6 Task Completion Heatmap (GitHub-style)
- Calendar grid — 12 weeks visible
- Each day = colored square: grey (no activity) → light green → dark green (high points)
- Tap any square to see that day's transactions
- Great for spotting patterns (always low on Mondays, great weekends)
- Location: Admin Dashboard → Analytics

### 6.7 Category Breakdown — Donut Chart
- Percentage of points earned by category: Morning / School / Chores / Evening / Weekend
- Toggle between current week / current month / all time
- Helps identify strong areas and gaps
- Location: Admin Dashboard → Analytics

### 6.8 Achievement Badges (One-Time Unlocks)
| Badge | Trigger |
|---|---|
| 🌅 Early Bird | Morning routine 7 days in a row |
| 📚 Bookworm | Reading task completed 10 times |
| 🍽️ Team Player | Helped with dinner 5 times |
| ⚡ Perfect Week | Net positive every day in a week |
| 💎 Century Club | Earned 100+ points in a single day |
| 🔥 On Fire | 14-day streak |
| 🧹 Chore Master | 20 chores completed total |
| 🌙 Wind Down | Bedtime routine completed 10 times |

- Locked badges shown as dark silhouettes → revealed on earn
- Badge wall visible to child on home screen
- Push notification (optional) on badge unlock

### 6.9 Bonus Multiplier Days
- Parent can set a 2x or 3x points day from admin panel
- Banner on home screen: "🌟 DOUBLE POINTS TODAY!"
- Auto-suggested for weekends or special occasions
- Applied automatically in transaction calculation

### 6.10 Delight & Gimmicks
| Feature | Description |
|---|---|
| Confetti burst | Triggers on every point addition — uses canvas-confetti library |
| Coin sound effect | Optional, toggleable in settings, plays on point add |
| Level-up animation | Full-screen shimmer + title reveal |
| Streak flame animation | Pulses on home screen, grows with streak length |
| Sad face animation | Gentle droopy emoji when points are deducted — not punishing |
| Night mode | Auto dark/starry theme after 8:00 PM Eastern |
| Seasonal themes | Auto-applied: Halloween (Oct), Winter/Christmas (Dec), Summer (Jun–Aug) |
| Daily login reward | +5 bonus points just for opening the app (optional, toggleable) |

---

## 7. Time-of-Day Task Suggestions (Eastern Time)

App detects device time in Eastern timezone and surfaces relevant tasks automatically in the Quick-Action Panel.

| Time Window | Label | Suggested Tasks Surfaced |
|---|---|---|
| 6:00–9:00 AM | 🌅 Morning Routine | Wake up on time, brush teeth, shower, get dressed, eat breakfast, pack school bag, make bed |
| 9:00 AM–12:00 PM | 📖 School Morning | Reading time, homework focus (weekends), extra chores |
| 12:00–1:30 PM | 🍽️ Lunchtime | Eat lunch without screen time, help set/clear table |
| 1:30–3:30 PM | ☀️ Afternoon | Outdoor play, weekend chores, reading, instrument practice |
| 3:30–6:00 PM | 🎒 After School | Homework done, snack cleanup, practice |
| 6:00–8:00 PM | 🍴 Evening | Eat dinner with family, help with dishes, pack bag for tomorrow |
| 8:00–9:00 PM | 🌙 Wind Down | Read before bed, brush teeth (night), lights out on time |
| Sat–Sun all day | 🏖️ Weekend Mode | Relaxed task set, bonus multiplier suggested, weekend-only rewards unlocked |

---

## 8. Default Tasks & Point Values

### Positive Tasks (Earn Points)

**Morning**
| Task | Points |
|---|---|
| Woke up without being asked | +10 |
| Brushed teeth (morning) | +5 |
| Showered | +10 |
| Ate breakfast | +5 |
| Packed school bag | +5 |
| Made bed | +5 |

**Daytime / School**
| Task | Points |
|---|---|
| Completed homework without reminders | +20 |
| Read for 20+ minutes | +15 |
| Did an extra chore | +15 |
| Helped a family member | +10 |
| Practiced instrument | +15 |
| Ate lunch well | +5 |

**Evening**
| Task | Points |
|---|---|
| Ate dinner with family, no screens | +10 |
| Helped clear the table | +5 |
| Brushed teeth (night) | +5 |
| In bed on time | +10 |
| No complaints during bedtime | +5 |

### Negative Tasks (Deduct Points)
| Behavior | Points |
|---|---|
| Talked back / disrespectful | −10 |
| Screen time without permission | −15 |
| Didn't do assigned chore | −10 |
| Lied | −20 |
| Physical aggression | −25 |
| Left belongings messy after warning | −5 |

---

## 9. Default Rewards & Point Costs

### Daily Rewards
| Reward | Points |
|---|---|
| 30 min extra screen time | 30 |
| Choose dinner | 40 |
| Stay up 30 min later | 35 |
| Pick the movie/show | 25 |

### Weekly Rewards
| Reward | Points | Weekend Only |
|---|---|---|
| 2hr gaming session | 80 | No |
| iPad day | 100 | No |
| Order from favorite restaurant | 120 | No |
| Friend sleepover | 150 | Yes |
| Family outing of his choice | 200 | Yes |
| Movie night | 80 | Yes |

### Big Rewards
| Reward | Points |
|---|---|
| Toy/game under $20 | 300 |
| Toy/game under $50 | 600 |
| Special trip (bowling, mini golf, etc.) | 400 |
| Theme park day | 1,000 |

---

## 10. Printable Sheet (No PIN Required)

- Accessible from Home Screen — "Print Chart" button (bottom corner)
- Generated as a PDF in-app (consistent across printers and browsers)
- Content:
  - Child's name + current balance + date printed at top
  - Two-column layout: ✅ Earn Points | 🎁 Rewards
  - Full negative tasks section below
  - Color coded (green / red / gold)
  - Checkboxes next to each chore (doubles as paper checklist)
  - Time-of-day grouping optional (Morning / Afternoon / Evening sections)
  - Motivational footer tagline
  - QR code at bottom linking to the app (useful for commercial version)
- Weekend variant: Weekend-only rewards highlighted with a 🏖️ badge

---

## 11. Commercial Roadmap

### Phase 1 — Personal (Now)
- Single profile (one child)
- Supabase free tier
- PWA installed via developer mode on personal devices
- All core features built with commercial architecture from day one

### Phase 2 — Multi-Profile
- Multiple children per household
- Profile switcher on home screen
- Per-child independent data, shared admin account

### Phase 3 — Commercial Launch
- Supabase with paid plan for scale
- Subscription tiers:
  - **Free:** 1 child, basic tasks/rewards, no charts
  - **Family ($4.99/mo):** Up to 3 children, all charts, custom themes, badge system
  - **Premium ($9.99/mo):** Unlimited children, AI task suggestions, analytics export, printable PDF
- App Store via Capacitor (React Native wrapper around PWA)
- Onboarding bundles by age group (6–8, 9–11, 12–14) — pre-loaded task/reward sets
- Push notifications — morning routine reminder, streak at-risk alert
- Analytics dashboard for parents — trends, insights, coaching tips
- Shareable weekly summary — email to co-parents, grandparents

---

## 12. Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| Confetti | canvas-confetti |
| PWA | Vite PWA Plugin + Service Worker |
| PDF Generation | react-pdf or jsPDF |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Hosting | Vercel |
| Commercial mobile | Capacitor (wraps PWA for App Store) |

---

## 13. Open Questions / To Decide

- [ ] Child's name and avatar for v1 (to pre-load in dev)
- [ ] PIN length preference — e.g., 4-digit parent, 6-digit admin
- [ ] Should child be able to see the full reward list, or only ones they can afford?
- [ ] Should the streak reset on a zero-point day, or only on a net-negative day?
- [ ] Daily login bonus — yes or no?
- [ ] Sound effects on by default or off by default?
- [ ] Should the Weekly Summary auto-send anywhere (email, iMessage)?
- [ ] Commercial: sole product or part of a broader family productivity suite?

---

*Document generated: March 24, 2026 — StarPoints Personal v1.0 Spec*

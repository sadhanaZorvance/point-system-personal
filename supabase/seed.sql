-- =============================================================================
-- StarPoints — Supabase Seed Data
-- =============================================================================
--
-- USAGE:
--   1. Create a user via Supabase Auth (Dashboard → Authentication → Users → Invite).
--   2. Copy the UUID from auth.users for that user.
--   3. Replace ALL occurrences of 'YOUR_USER_ID' below with that UUID.
--      Example: sed -i "s/YOUR_USER_ID/a1b2c3d4-0000-0000-0000-000000000000/g" seed.sql
--   4. Run this file in the Supabase SQL Editor, or via the CLI:
--        supabase db execute --file supabase/seed.sql
--
-- NOTE: This seed is idempotent — it uses INSERT ... ON CONFLICT DO NOTHING
--       so you can run it multiple times safely.
-- =============================================================================


-- ─── Profile ──────────────────────────────────────────────────────────────────

INSERT INTO profiles (user_id, name, avatar, theme, current_balance, lifetime_points, current_streak, longest_streak, parent_pin, admin_pin)
VALUES ('cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Vishruth', '🦁', 'cosmic', 0, 0, 0, 0, '1234', '123456')
ON CONFLICT DO NOTHING;


-- ─── Tasks (23 default tasks) ─────────────────────────────────────────────────

-- Replace 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2' with the actual user UUID from auth.users
INSERT INTO tasks (id, user_id, name, points, category, emoji, is_active) VALUES

-- Morning routine
('task_01', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Woke up without being asked',    10,  'morning',   '🌞', true),
('task_02', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Brushed teeth (morning)',         5,  'morning',   '🦷', true),
('task_03', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Showered',                       10,  'morning',   '🚿', true),
('task_04', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Ate breakfast',                   5,  'morning',   '🥣', true),
('task_05', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Packed school bag',               5,  'morning',   '🎒', true),
('task_06', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Made bed',                        5,  'morning',   '🛏️', true),

-- Daytime / school
('task_07', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Completed homework without reminders', 20, 'afternoon', '📚', true),
('task_08', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Read for 20+ minutes',           15,  'any',       '📖', true),
('task_09', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Did an extra chore',             15,  'any',       '🧹', true),
('task_10', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Helped a family member',         10,  'any',       '🤝', true),
('task_11', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Practiced instrument',           15,  'any',       '🎵', true),
('task_12', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Ate lunch well',                  5,  'afternoon', '🥗', true),

-- Evening
('task_13', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Ate dinner with family, no screens', 10, 'evening', '🍽️', true),
('task_14', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Helped clear the table',          5,  'evening',   '🧽', true),
('task_15', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Brushed teeth (night)',            5,  'evening',   '🦷', true),
('task_16', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'In bed on time',                  10,  'evening',   '🛌', true),
('task_17', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'No complaints during bedtime',     5,  'evening',   '😊', true),

-- Negative behaviours (point deductions)
('task_18', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Talked back / disrespectful',   -10,  'any',       '😤', true),
('task_19', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Screen time without permission', -15,  'any',       '📱', true),
('task_20', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Didn''t do assigned chore',      -10,  'any',       '🚫', true),
('task_21', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Lied',                           -20,  'any',       '🤥', true),
('task_22', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Physical aggression',            -25,  'any',       '💥', true),
('task_23', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Left belongings messy after warning', -5, 'any',   '🗑️', true)

ON CONFLICT DO NOTHING;


-- ─── Rewards (14 default rewards) ────────────────────────────────────────────

-- Replace 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2' with the actual user UUID from auth.users
INSERT INTO rewards (id, user_id, name, point_cost, category, emoji, weekend_only, is_active) VALUES

-- Daily rewards
('reward_01', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', '30 min extra screen time',        30,  'daily',  '📱', false, true),
('reward_02', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Choose dinner',                   40,  'daily',  '🍕', false, true),
('reward_03', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Stay up 30 min later',            35,  'daily',  '🌙', false, true),
('reward_04', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Pick the movie/show',             25,  'daily',  '🎬', false, true),

-- Weekly rewards
('reward_05', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', '2hr gaming session',              80,  'weekly', '🎮', false, true),
('reward_06', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'iPad day',                       100,  'weekly', '📱', false, true),
('reward_07', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Order from favorite restaurant', 120,  'weekly', '🍔', false, true),
('reward_08', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Friend sleepover',               150,  'weekly', '🛏️', true,  true),
('reward_09', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Family outing of his choice',    200,  'weekly', '🎡', true,  true),
('reward_10', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Movie night',                     80,  'weekly', '🍿', true,  true),

-- Big / milestone rewards
('reward_11', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Toy/game under $20',             300,  'big',   '🧸', false, true),
('reward_12', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Toy/game under $50',             600,  'big',   '🎮', false, true),
('reward_13', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Special trip (bowling, mini golf, etc.)', 400, 'big', '🎳', false, true),
('reward_14', 'cedec9b2-67eb-465c-8aa8-2cd1de5765d2', 'Theme park day',                1000,  'big',   '🎢', false, true)

ON CONFLICT DO NOTHING;

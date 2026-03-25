import { useState, useCallback, useEffect, useRef } from 'react'
import {
  getTasks,
  saveTasks as saveTasksData,
  getRewards,
  saveRewards as saveRewardsData,
  getBadges,
  addBadge,
} from '../lib/dataLayer'

// ─── DEFAULT TASKS ────────────────────────────────────────────────────────────

const DEFAULT_TASKS = [
  // Morning positive
  { id: 'task_01', name: 'Woke up without being asked', points: 10, category: 'morning', emoji: '🌞', is_active: true },
  { id: 'task_02', name: 'Brushed teeth (morning)', points: 5, category: 'morning', emoji: '🦷', is_active: true },
  { id: 'task_03', name: 'Showered', points: 10, category: 'morning', emoji: '🚿', is_active: true },
  { id: 'task_04', name: 'Ate breakfast', points: 5, category: 'morning', emoji: '🥣', is_active: true },
  { id: 'task_05', name: 'Packed school bag', points: 5, category: 'morning', emoji: '🎒', is_active: true },
  { id: 'task_06', name: 'Made bed', points: 5, category: 'morning', emoji: '🛏️', is_active: true },

  // Daytime / School positive
  { id: 'task_07', name: 'Completed homework without reminders', points: 20, category: 'afternoon', emoji: '📚', is_active: true },
  { id: 'task_08', name: 'Read for 20+ minutes', points: 15, category: 'any', emoji: '📖', is_active: true },
  { id: 'task_09', name: 'Did an extra chore', points: 15, category: 'any', emoji: '🧹', is_active: true },
  { id: 'task_10', name: 'Helped a family member', points: 10, category: 'any', emoji: '🤝', is_active: true },
  { id: 'task_11', name: 'Practiced instrument', points: 15, category: 'any', emoji: '🎵', is_active: true },
  { id: 'task_12', name: 'Ate lunch well', points: 5, category: 'afternoon', emoji: '🥗', is_active: true },

  // Evening positive
  { id: 'task_13', name: 'Ate dinner with family, no screens', points: 10, category: 'evening', emoji: '🍽️', is_active: true },
  { id: 'task_14', name: 'Helped clear the table', points: 5, category: 'evening', emoji: '🧽', is_active: true },
  { id: 'task_15', name: 'Brushed teeth (night)', points: 5, category: 'evening', emoji: '🦷', is_active: true },
  { id: 'task_16', name: 'In bed on time', points: 10, category: 'evening', emoji: '🛌', is_active: true },
  { id: 'task_17', name: 'No complaints during bedtime', points: 5, category: 'evening', emoji: '😊', is_active: true },

  // Negative tasks
  { id: 'task_18', name: 'Talked back / disrespectful', points: -10, category: 'any', emoji: '😤', is_active: true },
  { id: 'task_19', name: 'Screen time without permission', points: -15, category: 'any', emoji: '📱', is_active: true },
  { id: 'task_20', name: "Didn't do assigned chore", points: -10, category: 'any', emoji: '🚫', is_active: true },
  { id: 'task_21', name: 'Lied', points: -20, category: 'any', emoji: '🤥', is_active: true },
  { id: 'task_22', name: 'Physical aggression', points: -25, category: 'any', emoji: '💥', is_active: true },
  { id: 'task_23', name: 'Left belongings messy after warning', points: -5, category: 'any', emoji: '🗑️', is_active: true },
]

// ─── DEFAULT REWARDS ──────────────────────────────────────────────────────────

const DEFAULT_REWARDS = [
  // Daily
  { id: 'reward_01', name: '30 min extra screen time', point_cost: 30, category: 'daily', emoji: '📱', weekend_only: false, is_active: true },
  { id: 'reward_02', name: 'Choose dinner', point_cost: 40, category: 'daily', emoji: '🍕', weekend_only: false, is_active: true },
  { id: 'reward_03', name: 'Stay up 30 min later', point_cost: 35, category: 'daily', emoji: '🌙', weekend_only: false, is_active: true },
  { id: 'reward_04', name: 'Pick the movie/show', point_cost: 25, category: 'daily', emoji: '🎬', weekend_only: false, is_active: true },

  // Weekly
  { id: 'reward_05', name: '2hr gaming session', point_cost: 80, category: 'weekly', emoji: '🎮', weekend_only: false, is_active: true },
  { id: 'reward_06', name: 'iPad day', point_cost: 100, category: 'weekly', emoji: '📱', weekend_only: false, is_active: true },
  { id: 'reward_07', name: 'Order from favorite restaurant', point_cost: 120, category: 'weekly', emoji: '🍔', weekend_only: false, is_active: true },
  { id: 'reward_08', name: 'Friend sleepover', point_cost: 150, category: 'weekly', emoji: '🛏️', weekend_only: true, is_active: true },
  { id: 'reward_09', name: 'Family outing of his choice', point_cost: 200, category: 'weekly', emoji: '🎡', weekend_only: true, is_active: true },
  { id: 'reward_10', name: 'Movie night', point_cost: 80, category: 'weekly', emoji: '🍿', weekend_only: true, is_active: true },

  // Big
  { id: 'reward_11', name: 'Toy/game under $20', point_cost: 300, category: 'big', emoji: '🧸', weekend_only: false, is_active: true },
  { id: 'reward_12', name: 'Toy/game under $50', point_cost: 600, category: 'big', emoji: '🎮', weekend_only: false, is_active: true },
  { id: 'reward_13', name: 'Special trip (bowling, mini golf, etc.)', point_cost: 400, category: 'big', emoji: '🎳', weekend_only: false, is_active: true },
  { id: 'reward_14', name: 'Theme park day', point_cost: 1000, category: 'big', emoji: '🎢', weekend_only: false, is_active: true },
]

// ─── DEFAULT BADGES ───────────────────────────────────────────────────────────

export const ALL_BADGES = [
  { key: 'first_task', name: 'First Step', emoji: '👣', description: 'Complete your very first task' },
  { key: 'streak_3', name: '3-Day Streak', emoji: '🔥', description: '3 days in a row!' },
  { key: 'streak_7', name: 'Week Warrior', emoji: '⚡', description: '7 days in a row!' },
  { key: 'streak_30', name: 'Monthly Champion', emoji: '🏅', description: '30 days in a row!' },
  { key: 'points_100', name: 'Century', emoji: '💯', description: 'Earn 100 lifetime points' },
  { key: 'points_500', name: 'Rising Star', emoji: '🌟', description: 'Earn 500 lifetime points' },
  { key: 'points_1000', name: 'Star Power', emoji: '⭐', description: 'Earn 1,000 lifetime points' },
  { key: 'points_5000', name: 'Super Saver', emoji: '💎', description: 'Earn 5,000 lifetime points' },
  { key: 'first_reward', name: 'Treat Yourself', emoji: '🎁', description: 'Redeem your first reward' },
  { key: 'big_reward', name: 'Big Spender', emoji: '🎮', description: 'Redeem a big reward' },
  { key: 'perfect_morning', name: 'Morning Champion', emoji: '🌅', description: 'Complete all morning tasks in one day' },
  { key: 'perfect_evening', name: 'Evening Star', emoji: '🌙', description: 'Complete all evening tasks in one day' },
]

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadTasksSync() {
  try {
    const raw = localStorage.getItem('starpoints_tasks')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  localStorage.setItem('starpoints_tasks', JSON.stringify(DEFAULT_TASKS))
  return DEFAULT_TASKS
}

function loadRewardsSync() {
  try {
    const raw = localStorage.getItem('starpoints_rewards')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  localStorage.setItem('starpoints_rewards', JSON.stringify(DEFAULT_REWARDS))
  return DEFAULT_REWARDS
}

function loadBadgesSync() {
  try {
    const raw = localStorage.getItem('starpoints_badges')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useTasks(userId = 'local') {
  const [tasks, setTasksState] = useState(() => loadTasksSync())
  const [rewards, setRewardsState] = useState(() => loadRewardsSync())
  const [badges, setBadgesState] = useState(() => loadBadgesSync())

  const tasksSyncedRef = useRef(false)
  const rewardsSyncedRef = useRef(false)
  const badgesSyncedRef = useRef(false)

  // Background sync with Supabase
  useEffect(() => {
    if (!userId || userId === 'local') return
    if (!tasksSyncedRef.current) {
      tasksSyncedRef.current = true
      getTasks(userId).then((data) => {
        if (data && data.length > 0) {
          setTasksState(data)
          localStorage.setItem('starpoints_tasks', JSON.stringify(data))
        }
      }).catch(() => {})
    }
    if (!rewardsSyncedRef.current) {
      rewardsSyncedRef.current = true
      getRewards(userId).then((data) => {
        if (data && data.length > 0) {
          setRewardsState(data)
          localStorage.setItem('starpoints_rewards', JSON.stringify(data))
        }
      }).catch(() => {})
    }
    if (!badgesSyncedRef.current) {
      badgesSyncedRef.current = true
      getBadges(userId).then((data) => {
        if (data) {
          setBadgesState(data)
          localStorage.setItem('starpoints_badges', JSON.stringify(data))
        }
      }).catch(() => {})
    }
  }, [userId])

  // ── Tasks ──────────────────────────────────────────────────────────────────

  const persistTasks = useCallback((next) => {
    localStorage.setItem('starpoints_tasks', JSON.stringify(next))
    setTasksState(next)
    saveTasksData(next, userId).catch(() => {})
  }, [userId])

  const addTask = useCallback((task) => {
    const newTask = { id: crypto.randomUUID(), is_active: true, ...task }
    persistTasks([...tasks, newTask])
    return newTask
  }, [tasks, persistTasks])

  const updateTask = useCallback((id, updates) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    persistTasks(next)
  }, [tasks, persistTasks])

  const deleteTask = useCallback((id) => {
    persistTasks(tasks.filter((t) => t.id !== id))
  }, [tasks, persistTasks])

  const getActiveTasksByCategory = useCallback((categories) => {
    return tasks.filter(
      (t) => t.is_active && (categories.includes(t.category) || categories.includes('any'))
    )
  }, [tasks])

  // ── Rewards ────────────────────────────────────────────────────────────────

  const persistRewards = useCallback((next) => {
    localStorage.setItem('starpoints_rewards', JSON.stringify(next))
    setRewardsState(next)
    saveRewardsData(next, userId).catch(() => {})
  }, [userId])

  const addReward = useCallback((reward) => {
    const newReward = { id: crypto.randomUUID(), is_active: true, weekend_only: false, ...reward }
    persistRewards([...rewards, newReward])
    return newReward
  }, [rewards, persistRewards])

  const updateReward = useCallback((id, updates) => {
    const next = rewards.map((r) => (r.id === id ? { ...r, ...updates } : r))
    persistRewards(next)
  }, [rewards, persistRewards])

  const deleteReward = useCallback((id) => {
    persistRewards(rewards.filter((r) => r.id !== id))
  }, [rewards, persistRewards])

  // ── Badges ─────────────────────────────────────────────────────────────────

  const persistBadge = useCallback((badge) => {
    setBadgesState((prev) => {
      if (prev.some((b) => b.badge_key === badge.badge_key)) return prev
      const next = [...prev, badge]
      localStorage.setItem('starpoints_badges', JSON.stringify(next))
      return next
    })
    addBadge(badge, userId).catch(() => {})
  }, [userId])

  const earnBadge = useCallback((badgeKey) => {
    if (badges.some((b) => b.badge_key === badgeKey)) return false
    const newBadge = {
      id: crypto.randomUUID(),
      badge_key: badgeKey,
      earned_at: new Date().toISOString(),
    }
    persistBadge(newBadge)
    return true
  }, [badges, persistBadge])

  const hasBadge = useCallback((badgeKey) => {
    return badges.some((b) => b.badge_key === badgeKey)
  }, [badges])

  /**
   * Check and award badges based on current profile state.
   * Returns array of newly earned badge keys.
   */
  const checkBadges = useCallback((profile, todayTaskCount) => {
    const newlyEarned = []

    const check = (key) => {
      if (!hasBadge(key)) {
        newlyEarned.push(key)
        earnBadge(key)
      }
    }

    if (todayTaskCount >= 1) check('first_task')
    if (profile.current_streak >= 3) check('streak_3')
    if (profile.current_streak >= 7) check('streak_7')
    if (profile.current_streak >= 30) check('streak_30')
    if (profile.lifetime_points >= 100) check('points_100')
    if (profile.lifetime_points >= 500) check('points_500')
    if (profile.lifetime_points >= 1000) check('points_1000')
    if (profile.lifetime_points >= 5000) check('points_5000')

    return newlyEarned
  }, [hasBadge, earnBadge])

  return {
    tasks,
    rewards,
    badges,
    addTask,
    updateTask,
    deleteTask,
    getActiveTasksByCategory,
    addReward,
    updateReward,
    deleteReward,
    earnBadge,
    hasBadge,
    checkBadges,
  }
}

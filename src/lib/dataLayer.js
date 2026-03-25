/**
 * Abstract data layer.
 * When Supabase is enabled (VITE_SUPABASE_URL set), uses Supabase for persistence.
 * Falls back to localStorage with `starpoints_` prefix when Supabase is unavailable.
 */
import { supabase, isSupabaseEnabled } from './supabase'

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS = {
  get: (key) => {
    try {
      const raw = localStorage.getItem(`starpoints_${key}`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(`starpoints_${key}`, JSON.stringify(value))
    } catch {
      // ignore storage errors
    }
  },
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (data && !error) return data
  }
  return LS.get('profile')
}

export async function saveProfile(profile, userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const { error } = await supabase
      .from('profiles')
      .upsert({ ...profile, user_id: userId }, { onConflict: 'user_id' })
    if (error) console.warn('Supabase saveProfile error:', error.message)
  }
  // Always update localStorage as cache / fallback
  LS.set('profile', profile)
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasks(userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (data && !error && data.length > 0) return data
  }
  return LS.get('tasks')
}

export async function saveTasks(tasks, userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    // Upsert all tasks with user_id
    const withUser = tasks.map((t) => ({ ...t, user_id: userId }))
    const { error } = await supabase.from('tasks').upsert(withUser, { onConflict: 'id' })
    if (error) console.warn('Supabase saveTasks error:', error.message)
  }
  LS.set('tasks', tasks)
}

// ─── Rewards ──────────────────────────────────────────────────────────────────

export async function getRewards(userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (data && !error && data.length > 0) return data
  }
  return LS.get('rewards')
}

export async function saveRewards(rewards, userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const withUser = rewards.map((r) => ({ ...r, user_id: userId }))
    const { error } = await supabase.from('rewards').upsert(withUser, { onConflict: 'id' })
    if (error) console.warn('Supabase saveRewards error:', error.message)
  }
  LS.set('rewards', rewards)
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getTransactions(userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(500)
    if (data && !error) return data
  }
  return LS.get('transactions') || []
}

export async function addTransactionRecord(tx, userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const { error } = await supabase
      .from('transactions')
      .insert({ ...tx, user_id: userId })
    if (error) console.warn('Supabase addTransaction error:', error.message)
  }
  const existing = LS.get('transactions') || []
  LS.set('transactions', [tx, ...existing])
}

export async function removeTransactionRecord(id, userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) console.warn('Supabase removeTransaction error:', error.message)
  }
  const existing = LS.get('transactions') || []
  LS.set('transactions', existing.filter((t) => t.id !== id))
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export async function getBadges(userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
    if (data && !error) return data
  }
  return LS.get('badges') || []
}

export async function addBadge(badge, userId) {
  if (isSupabaseEnabled && supabase && userId && userId !== 'local') {
    const { error } = await supabase
      .from('badges')
      .insert({ ...badge, user_id: userId })
    if (error && !error.message.includes('duplicate')) {
      console.warn('Supabase addBadge error:', error.message)
    }
  }
  const existing = LS.get('badges') || []
  if (!existing.some((b) => b.badge_key === badge.badge_key)) {
    LS.set('badges', [...existing, badge])
  }
}

// ─── Realtime subscription ───────────────────────────────────────────────────

/**
 * Subscribe to profile changes via Supabase Realtime.
 * Returns an unsubscribe function.
 * When Supabase is not enabled, returns a no-op unsubscribe.
 */
export function subscribeToProfile(userId, callback) {
  if (!isSupabaseEnabled || !supabase || !userId || userId === 'local') {
    return () => {}
  }

  const channel = supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) callback(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

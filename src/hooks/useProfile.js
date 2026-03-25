import { useState, useCallback, useEffect, useRef } from 'react'
import { getProfile, saveProfile as saveProfileData, subscribeToProfile } from '../lib/dataLayer'

const DEFAULT_PROFILE = {
  id: 'default',
  name: 'Champion',
  avatar: '🦁',
  theme: 'default',
  current_balance: 0,
  lifetime_points: 0,
  current_streak: 0,
  longest_streak: 0,
  goal_reward_id: null,
  goal_reward_name: null,
  goal_reward_cost: null,
  parent_pin: '1234',
  admin_pin: '123456',
  last_active_date: null,
  sound_enabled: false,
  daily_login_bonus: false,
  bonus_multiplier: 1,
  bonus_multiplier_date: null,
}

/** Load profile from localStorage synchronously (for instant render). */
function loadProfileSync() {
  try {
    const raw = localStorage.getItem('starpoints_profile')
    if (raw) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_PROFILE }
}

/**
 * Hook for managing the user profile.
 * Accepts an optional userId for Supabase integration.
 * Initializes from localStorage instantly, then syncs with Supabase in background.
 */
export function useProfile(userId = 'local') {
  const [profile, setProfileState] = useState(() => loadProfileSync())
  const syncedRef = useRef(false)

  // Sync with Supabase on mount (background, non-blocking)
  useEffect(() => {
    if (!userId || userId === 'local') return
    if (syncedRef.current) return
    syncedRef.current = true

    getProfile(userId).then((data) => {
      if (data) {
        setProfileState((prev) => ({ ...DEFAULT_PROFILE, ...data, ...prev }))
        // Write merged state back to localStorage
        localStorage.setItem('starpoints_profile', JSON.stringify({ ...DEFAULT_PROFILE, ...data }))
      }
    }).catch(() => {
      // Silently ignore — localStorage fallback is already loaded
    })
  }, [userId])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!userId || userId === 'local') return
    const unsubscribe = subscribeToProfile(userId, (newProfile) => {
      setProfileState((prev) => ({ ...DEFAULT_PROFILE, ...prev, ...newProfile }))
    })
    return unsubscribe
  }, [userId])

  const persistProfile = useCallback((next, uid) => {
    localStorage.setItem('starpoints_profile', JSON.stringify(next))
    saveProfileData(next, uid || userId).catch(() => {})
  }, [userId])

  const updateProfile = useCallback((updates) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates }
      persistProfile(next)
      return next
    })
  }, [persistProfile])

  /**
   * Add points (positive or negative delta).
   * Returns { newProfile } so callers can inspect new lifetime_points.
   */
  const applyPointsDelta = useCallback((delta) => {
    let result = null
    setProfileState((prev) => {
      const newBalance = Math.max(0, prev.current_balance + delta)
      const newLifetime = delta > 0 ? prev.lifetime_points + delta : prev.lifetime_points
      const next = {
        ...prev,
        current_balance: newBalance,
        lifetime_points: newLifetime,
      }
      persistProfile(next)
      result = next
      return next
    })
    return result
  }, [persistProfile])

  /**
   * Update streak based on today's activity.
   */
  const updateStreak = useCallback((todayString) => {
    setProfileState((prev) => {
      if (prev.last_active_date === todayString) return prev

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

      const wasYesterday = prev.last_active_date === yesterdayStr
      const newStreak = wasYesterday ? prev.current_streak + 1 : 1
      const newLongest = Math.max(newStreak, prev.longest_streak)

      const next = {
        ...prev,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_active_date: todayString,
      }
      persistProfile(next)
      return next
    })
  }, [persistProfile])

  /** Verify a PIN against stored profile PINs. */
  const verifyPin = useCallback((pin, type = 'parent') => {
    const stored = loadProfileSync()
    if (type === 'parent') return pin === stored.parent_pin
    if (type === 'admin') return pin === stored.admin_pin
    return false
  }, [])

  /** Change a PIN. */
  const changePin = useCallback((type, newPin) => {
    setProfileState((prev) => {
      const key = type === 'parent' ? 'parent_pin' : 'admin_pin'
      const next = { ...prev, [key]: newPin }
      persistProfile(next)
      return next
    })
  }, [persistProfile])

  return {
    profile,
    updateProfile,
    applyPointsDelta,
    updateStreak,
    verifyPin,
    changePin,
  }
}

import { useState, useEffect } from 'react'
import { supabase, isSupabaseEnabled } from './supabase'

// For personal/single-family use: set VITE_SUPABASE_USER_ID in .env to your
// Supabase user UUID. This bypasses anonymous sign-in entirely.
const FIXED_USER_ID = import.meta.env.VITE_SUPABASE_USER_ID || null

/**
 * Auth hook — three modes:
 * 1. VITE_SUPABASE_USER_ID set → use that UUID directly (personal app mode)
 * 2. Supabase enabled, no fixed ID → check for existing session
 * 3. No Supabase → localStorage only (userId = 'local')
 */
export function useAuth() {
  const [userId, setUserId] = useState(() => {
    if (!isSupabaseEnabled) return 'local'
    if (FIXED_USER_ID) return FIXED_USER_ID   // instant, no loading
    return null
  })
  const [isLoading, setIsLoading] = useState(isSupabaseEnabled && !FIXED_USER_ID)

  useEffect(() => {
    // Mode 1: fixed user ID — nothing to do, already set in useState
    if (FIXED_USER_ID) return

    // Mode 3: no Supabase
    if (!isSupabaseEnabled || !supabase) {
      setUserId('local')
      setIsLoading(false)
      return
    }

    // Mode 2: check for existing Supabase session
    let mounted = true

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setUserId(session?.user?.id || 'local')
          setIsLoading(false)
        }
      } catch {
        if (mounted) {
          setUserId('local')
          setIsLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUserId(session?.user?.id || 'local')
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { userId, isLoading }
}

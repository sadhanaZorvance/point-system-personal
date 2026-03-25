import { useState, useEffect } from 'react'
import { supabase, isSupabaseEnabled } from './supabase'

/**
 * Simple Supabase Auth hook.
 * - When Supabase is disabled: returns userId='local', isLoading=false immediately.
 * - When Supabase is enabled: checks for existing session, auto-signs-in anonymously if none.
 */
export function useAuth() {
  const [userId, setUserId] = useState(isSupabaseEnabled ? null : 'local')
  const [isLoading, setIsLoading] = useState(isSupabaseEnabled)

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      setUserId('local')
      setIsLoading(false)
      return
    }

    let mounted = true

    async function initAuth() {
      try {
        // Check for an existing session first
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && mounted) {
          setUserId(session.user.id)
          setIsLoading(false)
          return
        }

        // No session — sign in anonymously
        const { data, error } = await supabase.auth.signInAnonymously()
        if (mounted) {
          if (data?.user) {
            setUserId(data.user.id)
          } else {
            console.warn('Anonymous sign-in failed:', error?.message)
            // Fall back to local mode so the app still works
            setUserId('local')
          }
          setIsLoading(false)
        }
      } catch (err) {
        console.warn('Auth init error:', err)
        if (mounted) {
          setUserId('local')
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth state changes (e.g. tab restore)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && session?.user) {
        setUserId(session.user.id)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    if (!isSupabaseEnabled || !supabase) return { error: 'Supabase not configured' }
    return supabase.auth.signInWithPassword({ email, password })
  }

  return { userId, isLoading, signIn }
}

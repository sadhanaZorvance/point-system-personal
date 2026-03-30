import React, { createContext, useContext, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ParentPanel from './screens/ParentPanel'
import AdminDashboard from './screens/AdminDashboard'
import ActivitiesScreen from './screens/ActivitiesScreen'
import ChartsScreen from './screens/ChartsScreen'
import SettingsScreen from './screens/SettingsScreen'
import { useAuth } from './lib/useAuth'
import { useProfile } from './hooks/useProfile'
import { useTransactions } from './hooks/useTransactions'
import { getTodayString } from './utils/timeOfDay'
import { applyCSSVars, getTheme, THEME_PACKS } from './utils/theme'

// ─── Auth Context ─────────────────────────────────────────────────────────────

export const AuthContext = createContext({ userId: 'local', isLoading: false })

export function useUserId() {
  return useContext(AuthContext).userId
}

// ─── Theme Bootstrapper ───────────────────────────────────────────────────────

/**
 * Reads the theme from localStorage on mount and applies CSS variables immediately.
 * Runs once so the whole app has the right CSS vars before paint.
 */
function ThemeBootstrapper() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('starpoints_profile')
      if (raw) {
        const p = JSON.parse(raw)
        const packIds = THEME_PACKS.map((t) => t.id)
        const themeId = packIds.includes(p.theme) ? p.theme : 'cosmic'
        const theme = getTheme(themeId, p.customPrimary || null, p.customSecondary || null)
        applyCSSVars(theme)
        // Apply custom hue overrides (from hue sliders) on top of pack defaults
        const root = document.documentElement
        if (p.customPrimaryHue != null) {
          const color = p.customPrimary || `hsl(${p.customPrimaryHue}, 70%, 55%)`
          root.style.setProperty('--color-primary', color)
        }
        if (p.customSecondaryHue != null) {
          const color = p.customSecondary || `hsl(${p.customSecondaryHue}, 65%, 50%)`
          root.style.setProperty('--color-secondary', color)
        }
      }
    } catch {
      // ignore — defaults in :root will apply
    }
  }, [])
  return null
}

// ─── Daily Login Bonus ────────────────────────────────────────────────────────

function DailyLoginBonusHandler({ userId }) {
  const { profile, applyPointsDelta } = useProfile()
  const { addTransaction } = useTransactions()
  const firedRef = useRef(false)

  useEffect(() => {
    if (!profile.daily_login_bonus) return
    if (firedRef.current) return

    const today = getTodayString()
    const bonusKey = 'starpoints_daily_bonus_date'
    const lastBonus = localStorage.getItem(bonusKey)

    if (lastBonus === today) return

    firedRef.current = true
    localStorage.setItem(bonusKey, today)

    const newBalance = Math.max(0, profile.current_balance + 5)
    applyPointsDelta(5)
    addTransaction({
      type: 'task_earn',
      reference_id: 'daily_login_bonus',
      reference_name: 'Daily Login Bonus',
      points_delta: 5,
      balance_after: newBalance,
      notes: 'Automatic daily login bonus',
    })
  }, [profile.daily_login_bonus, profile.current_balance, applyPointsDelta, addTransaction])

  return null
}

// ─── Inner App ────────────────────────────────────────────────────────────────

function InnerApp() {
  const { userId } = useContext(AuthContext)

  return (
    <>
      <ThemeBootstrapper />
      <DailyLoginBonusHandler userId={userId} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/parent" element={<ParentPanel />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/activities" element={<ActivitiesScreen />} />
          <Route path="/charts" element={<ChartsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-violet-950 via-indigo-900 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⭐</div>
          <p className="text-white/60 font-semibold">Loading StarPoints...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={auth}>
      <InnerApp />
    </AuthContext.Provider>
  )
}

import React, { createContext, useContext, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ParentPanel from './screens/ParentPanel'
import AdminDashboard from './screens/AdminDashboard'
import { useAuth } from './lib/useAuth'
import { useProfile } from './hooks/useProfile'
import { useTransactions } from './hooks/useTransactions'
import { getTodayString } from './utils/timeOfDay'

// ─── Auth Context ─────────────────────────────────────────────────────────────

export const AuthContext = createContext({ userId: 'local', isLoading: false })

export function useUserId() {
  return useContext(AuthContext).userId
}

// ─── Daily Login Bonus ────────────────────────────────────────────────────────

/**
 * Silently awards +5 points on first app open each day when daily_login_bonus is enabled.
 * Uses a localStorage flag to ensure it only fires once per day.
 */
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

    if (lastBonus === today) return // already given today

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

// ─── Inner App (has access to auth context) ───────────────────────────────────

function InnerApp() {
  const { userId } = useContext(AuthContext)

  return (
    <>
      <DailyLoginBonusHandler userId={userId} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/parent" element={<ParentPanel />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const auth = useAuth()

  // While auth is initializing (Supabase mode), show a minimal loading screen
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-950 flex items-center justify-center">
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

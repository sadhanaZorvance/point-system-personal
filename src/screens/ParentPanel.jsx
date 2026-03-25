import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { useTransactions } from '../hooks/useTransactions'
import { useTasks } from '../hooks/useTasks'
import { useTheme } from '../hooks/useTheme'
import TaskTile, { RewardTile } from '../components/TaskTile'
import LevelUpCelebration from '../components/LevelUpCelebration'
import { fireConfetti } from '../components/ConfettiEffect'
import BottomNav from '../components/BottomNav'
import { getCurrentTimeWindow, formatTimestamp, getTodayString } from '../utils/timeOfDay'
import { getLevelInfo } from '../utils/levels'

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'morning', label: '🌅 Morning' },
  { id: 'afternoon', label: '☀️ Afternoon' },
  { id: 'evening', label: '🌙 Evening' },
  { id: 'any', label: '🔄 Any' },
]

export default function ParentPanel() {
  const { profile, applyPointsDelta, updateStreak } = useProfile()
  const { addTransaction, removeTransaction, getTodayTransactions } = useTransactions()
  const { tasks, rewards, checkBadges } = useTasks()
  const theme = useTheme()

  const [currentWindow, setCurrentWindow] = useState(() => getCurrentTimeWindow())
  const [confirmation, setConfirmation] = useState(null)
  const [lastAction, setLastAction] = useState(null)
  const [undoCountdown, setUndoCountdown] = useState(0)
  const [notification, setNotification] = useState(null)
  const [levelUpInfo, setLevelUpInfo] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deductionsExpanded, setDeductionsExpanded] = useState(false)
  const [logExpanded, setLogExpanded] = useState(false)
  const undoTimerRef = useRef(null)
  const countdownRef = useRef(null)

  // Update time window every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setCurrentWindow(getCurrentTimeWindow()), 30000)
    return () => clearInterval(interval)
  }, [])

  // Undo countdown
  useEffect(() => {
    if (!lastAction) return
    const remaining = Math.max(0, Math.ceil((lastAction.canUndoUntil - Date.now()) / 1000))
    setUndoCountdown(remaining)
    if (remaining <= 0) { setLastAction(null); return }

    countdownRef.current = setInterval(() => {
      const r = Math.max(0, Math.ceil((lastAction.canUndoUntil - Date.now()) / 1000))
      setUndoCountdown(r)
      if (r <= 0) { clearInterval(countdownRef.current); setLastAction(null) }
    }, 1000)

    return () => clearInterval(countdownRef.current)
  }, [lastAction])

  const showNotification = useCallback((msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const getEffectiveMultiplier = useCallback(() => {
    const today = getTodayString()
    if (profile.bonus_multiplier > 1 && profile.bonus_multiplier_date === today) {
      return profile.bonus_multiplier
    }
    return 1
  }, [profile.bonus_multiplier, profile.bonus_multiplier_date])

  const getEffectiveDelta = useCallback((item, type) => {
    const isTask = type === 'task'
    const rawDelta = isTask ? item.points : -item.point_cost
    if (isTask && rawDelta > 0) return rawDelta * getEffectiveMultiplier()
    return rawDelta
  }, [getEffectiveMultiplier])

  const confirmAction = useCallback(() => {
    if (!confirmation) return
    const { item, type } = confirmation
    setConfirmation(null)

    const isTask = type === 'task'
    const multiplier = isTask && item.points > 0 ? getEffectiveMultiplier() : 1
    const rawDelta = isTask ? item.points : -item.point_cost
    const delta = rawDelta * multiplier

    const oldLifetime = profile.lifetime_points
    const oldLevelInfo = getLevelInfo(oldLifetime)
    const newBalance = Math.max(0, profile.current_balance + delta)

    applyPointsDelta(delta)

    const newLifetime = delta > 0 ? oldLifetime + delta : oldLifetime
    const newLevelInfo = getLevelInfo(newLifetime)
    if (newLevelInfo.level > oldLevelInfo.level) {
      setLevelUpInfo({ levelInfo: newLevelInfo, lifetimePoints: newLifetime })
    }

    if (isTask && delta > 0) {
      updateStreak(getTodayString())
      checkBadges({ ...profile, current_balance: newBalance, lifetime_points: newLifetime }, 1)
    }

    const tx = addTransaction({
      type: isTask ? (delta > 0 ? 'task_earn' : 'task_deduct') : 'reward_redeem',
      reference_id: item.id,
      reference_name: item.name,
      points_delta: delta,
      balance_after: newBalance,
      notes: multiplier > 1 ? `${multiplier}x multiplier applied` : '',
    })

    setLastAction({ txId: tx.id, delta, canUndoUntil: Date.now() + 60000 })

    if (delta > 0) fireConfetti(delta >= 15 ? 'high' : 'medium')

    const multiplierLabel = multiplier > 1 ? ` (${multiplier}x!)` : ''
    showNotification(
      isTask
        ? `${item.emoji} ${item.name}: ${delta > 0 ? '+' : ''}${delta} pts${multiplierLabel}`
        : `🎁 Redeemed: ${item.name} (-${item.point_cost} pts)`,
      delta >= 0 ? 'success' : 'deduct'
    )
  }, [confirmation, profile, applyPointsDelta, updateStreak, addTransaction, checkBadges, showNotification, getEffectiveMultiplier])

  const handleUndo = useCallback(() => {
    if (!lastAction) return
    removeTransaction(lastAction.txId)
    applyPointsDelta(-lastAction.delta)
    clearInterval(countdownRef.current)
    setLastAction(null)
    showNotification('Action undone!', 'info')
  }, [lastAction, removeTransaction, applyPointsDelta, showNotification])

  const multiplier = getEffectiveMultiplier()

  // ── Filter tasks ──────────────────────────────────────────────────────────
  const windowCategories = currentWindow.categories
  let positiveTasks = tasks.filter(
    (t) => t.is_active && t.points > 0 &&
      (windowCategories.includes(t.category) || windowCategories.includes('any') || t.category === 'any')
  )

  if (categoryFilter !== 'all') {
    positiveTasks = positiveTasks.filter((t) => t.category === categoryFilter)
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    positiveTasks = positiveTasks.filter((t) => t.name.toLowerCase().includes(q))
  }

  const negativeTasks = tasks.filter((t) => t.is_active && t.points < 0)
  const activeRewards = rewards.filter((r) => r.is_active)
  const todayLog = getTodayTransactions()

  const notifColors = {
    success: 'bg-green-600',
    deduct: 'bg-red-600',
    info: 'bg-indigo-600',
  }

  const confirmDelta = confirmation ? getEffectiveDelta(confirmation.item, confirmation.type) : 0
  const rawDelta = confirmation
    ? (confirmation.type === 'task' ? confirmation.item.points : -confirmation.item.point_cost)
    : 0
  const confirmMultiplier = confirmation
    ? (confirmation.type === 'task' && rawDelta > 0 ? multiplier : 1)
    : 1

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} relative`}>
      {/* Level Up Overlay */}
      {levelUpInfo && (
        <LevelUpCelebration
          levelInfo={levelUpInfo.levelInfo}
          lifetimePoints={levelUpInfo.lifetimePoints}
          onDismiss={() => setLevelUpInfo(null)}
        />
      )}

      {/* ── Thin Top Bar ──────────────────────────────────────────── */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 px-4 py-2.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-sm">{currentWindow.emoji}</span>
          <p className="text-white/70 text-sm font-semibold">{currentWindow.label}</p>
          {multiplier > 1 && (
            <span
              className="text-white text-xs font-black px-2 py-0.5 rounded-full"
              style={{ backgroundColor: theme.accentColor }}
            >
              {multiplier}x
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 font-black text-base">{profile.current_balance}</span>
          <span className="text-white/40 text-xs">pts</span>
        </div>
      </div>

      {/* ── Notification Toast ────────────────────────────────────── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-20 left-1/2 z-50 px-6 py-3 rounded-2xl ${notifColors[notification.type]} text-white font-bold shadow-xl text-center max-w-xs`}
          >
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Undo Bar ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-600/90 px-4 py-2 flex items-center justify-between sticky top-[46px] z-20"
          >
            <span className="text-white text-sm font-semibold">Undo available ({undoCountdown}s)</span>
            <button
              onClick={handleUndo}
              className="bg-white text-amber-700 px-4 py-1.5 rounded-xl font-black text-sm"
            >
              UNDO
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Multiplier Banner ─────────────────────────────────────── */}
      <AnimatePresence>
        {multiplier > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`px-4 py-2 text-center font-black text-sm ${
              multiplier === 3
                ? 'bg-gradient-to-r from-violet-600 to-purple-700'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}
            style={{ animation: 'flamePulse 1.5s ease-in-out infinite' }}
          >
            <span className="text-white">
              {multiplier === 3 ? '⚡ TRIPLE POINTS TODAY! All positive tasks earn 3x!' : '🌟 DOUBLE POINTS TODAY! All positive tasks earn 2x!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <div className="px-4 pb-28 max-w-2xl mx-auto">

        {/* Search bar */}
        <div className="mt-3 mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search tasks..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none text-sm"
            style={{ '--tw-ring-color': theme.accentColor }}
          />
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-3">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setCategoryFilter(f.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0"
              style={
                categoryFilter === f.id
                  ? { backgroundColor: theme.accentColor, color: 'white' }
                  : { backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Positive tasks grid */}
        {positiveTasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white/30 text-sm">No tasks for this filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {positiveTasks.map((task) => (
              <TaskTile
                key={task.id}
                task={task}
                onTap={(t) => setConfirmation({ item: t, type: 'task' })}
                multiplier={multiplier}
              />
            ))}
          </div>
        )}

        {/* Deductions — collapsible */}
        <div className="mb-4">
          <button
            onClick={() => setDeductionsExpanded((v) => !v)}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white/80 font-bold text-sm transition-all"
          >
            <span>⚠️ Deductions ({negativeTasks.length})</span>
            <span className={`transition-transform ${deductionsExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
          <AnimatePresence>
            {deductionsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {negativeTasks.map((task) => (
                    <TaskTile
                      key={task.id}
                      task={task}
                      onTap={(t) => setConfirmation({ item: t, type: 'task' })}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rewards section */}
        <div className="mb-4">
          <h2 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Rewards
          </h2>
          {['daily', 'weekly', 'big'].map((cat) => {
            const catRewards = activeRewards.filter((r) => r.category === cat)
            if (catRewards.length === 0) return null
            const labels = { daily: '📅 Daily', weekly: '📆 Weekly', big: '🎮 Big' }
            return (
              <div key={cat} className="mb-3">
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1.5">{labels[cat]}</p>
                <div className="grid grid-cols-2 gap-2">
                  {catRewards.map((reward) => (
                    <RewardTile
                      key={reward.id}
                      reward={reward}
                      currentBalance={profile.current_balance}
                      onTap={(r) => setConfirmation({ item: r, type: 'reward' })}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Today's Log — collapsible */}
        <div className="mb-4">
          <button
            onClick={() => setLogExpanded((v) => !v)}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white/80 font-bold text-sm transition-all"
          >
            <span>📋 Today's Log ({todayLog.length})</span>
            <span className={`transition-transform ${logExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
          <AnimatePresence>
            {logExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {todayLog.length === 0 ? (
                  <div className="text-center py-8 mt-2">
                    <p className="text-white/30">No activity yet today</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    {todayLog.map((tx) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="star-card flex items-center gap-3 py-2.5 px-3"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs ${
                            tx.points_delta > 0 ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'
                          }`}
                        >
                          {tx.points_delta > 0 ? `+${tx.points_delta}` : tx.points_delta}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{tx.reference_name}</p>
                          <p className="text-white/40 text-xs">{formatTimestamp(tx.timestamp)}</p>
                          {tx.notes && <p className="text-amber-400 text-xs">{tx.notes}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white/40 text-xs">→ {tx.balance_after}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Confirmation Dialog ───────────────────────────────────── */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setConfirmation(null) }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`bg-gradient-to-br ${theme.bgGradient} rounded-3xl p-6 w-full max-w-sm border border-white/20 shadow-2xl mb-4`}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{confirmation.item.emoji}</div>
                <h3 className="text-xl font-black text-white">{confirmation.item.name}</h3>

                {confirmMultiplier > 1 ? (
                  <div className="mt-2">
                    <p className="text-white/50 text-sm line-through">{rawDelta > 0 ? '+' : ''}{rawDelta} pts</p>
                    <p className="text-amber-300 font-black text-3xl">
                      +{rawDelta} × {confirmMultiplier}x = +{confirmDelta} pts
                    </p>
                    <p className="text-amber-400 text-sm font-bold mt-1">
                      {confirmMultiplier === 3 ? '⚡ Triple Points Day!' : '🌟 Double Points Day!'}
                    </p>
                  </div>
                ) : (
                  <p className={`text-3xl font-black mt-2 ${
                    confirmation.type === 'task' && confirmation.item.points > 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {confirmDelta > 0 ? '+' : ''}{confirmDelta} pts
                  </p>
                )}

                {confirmation.type === 'reward' && (
                  <p className="text-white/50 text-sm mt-1">
                    Balance after: {Math.max(0, profile.current_balance - confirmation.item.point_cost)} pts
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmation(null)}
                  className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={confirmAction}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-4 rounded-2xl font-black text-lg text-white shadow-lg ${
                    confirmation.type === 'reward' || (confirmation.type === 'task' && confirmation.item.points < 0)
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                >
                  Confirm! ✓
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}

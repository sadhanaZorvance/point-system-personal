import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { useTransactions } from '../hooks/useTransactions'
import { useTasks } from '../hooks/useTasks'
import TaskTile, { RewardTile } from '../components/TaskTile'
import LevelUpCelebration from '../components/LevelUpCelebration'
import { fireConfetti } from '../components/ConfettiEffect'
import { getCurrentTimeWindow, formatTimestamp, getTodayString } from '../utils/timeOfDay'
import { getLevelInfo } from '../utils/levels'

export default function ParentPanel() {
  const navigate = useNavigate()
  const { profile, applyPointsDelta, updateStreak } = useProfile()
  const { addTransaction, removeTransaction, getTodayTransactions } = useTransactions()
  const { tasks, rewards, checkBadges } = useTasks()

  const [currentWindow, setCurrentWindow] = useState(() => getCurrentTimeWindow())
  const [confirmation, setConfirmation] = useState(null) // { item, type: 'task'|'reward' }
  const [lastAction, setLastAction] = useState(null) // { txId, delta, canUndoUntil }
  const [undoCountdown, setUndoCountdown] = useState(0)
  const [notification, setNotification] = useState(null)
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'rewards' | 'log'
  const [levelUpInfo, setLevelUpInfo] = useState(null) // { levelInfo, lifetimePoints }
  const undoTimerRef = useRef(null)
  const countdownRef = useRef(null)

  // Update time window every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentWindow(getCurrentTimeWindow()), 30000)
    return () => clearInterval(interval)
  }, [])

  // Undo countdown
  useEffect(() => {
    if (!lastAction) return
    const remaining = Math.max(0, Math.ceil((lastAction.canUndoUntil - Date.now()) / 1000))
    setUndoCountdown(remaining)

    if (remaining <= 0) {
      setLastAction(null)
      return
    }

    countdownRef.current = setInterval(() => {
      const r = Math.max(0, Math.ceil((lastAction.canUndoUntil - Date.now()) / 1000))
      setUndoCountdown(r)
      if (r <= 0) {
        clearInterval(countdownRef.current)
        setLastAction(null)
      }
    }, 1000)

    return () => clearInterval(countdownRef.current)
  }, [lastAction])

  const showNotification = useCallback((msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const handleTaskTap = useCallback((task) => {
    setConfirmation({ item: task, type: 'task' })
  }, [])

  const handleRewardTap = useCallback((reward) => {
    setConfirmation({ item: reward, type: 'reward' })
  }, [])

  // ── Bonus multiplier helper ──────────────────────────────────────────────
  const getEffectiveMultiplier = useCallback(() => {
    const today = getTodayString()
    if (
      profile.bonus_multiplier > 1 &&
      profile.bonus_multiplier_date === today
    ) {
      return profile.bonus_multiplier
    }
    return 1
  }, [profile.bonus_multiplier, profile.bonus_multiplier_date])

  // Compute effective points (multiplier only for positive tasks)
  const getEffectiveDelta = useCallback((item, type) => {
    const isTask = type === 'task'
    const rawDelta = isTask ? item.points : -item.point_cost
    if (isTask && rawDelta > 0) {
      return rawDelta * getEffectiveMultiplier()
    }
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

    // Apply to profile
    applyPointsDelta(delta)

    // Check for level up (after applying)
    const newLifetime = delta > 0 ? oldLifetime + delta : oldLifetime
    const newLevelInfo = getLevelInfo(newLifetime)
    if (newLevelInfo.level > oldLevelInfo.level) {
      setLevelUpInfo({ levelInfo: newLevelInfo, lifetimePoints: newLifetime })
    }

    // Update streak on positive task
    if (isTask && delta > 0) {
      updateStreak(getTodayString())
      checkBadges(
        { ...profile, current_balance: newBalance, lifetime_points: newLifetime },
        1
      )
    }

    // Record transaction
    const tx = addTransaction({
      type: isTask ? (delta > 0 ? 'task_earn' : 'task_deduct') : 'reward_redeem',
      reference_id: item.id,
      reference_name: item.name,
      points_delta: delta,
      balance_after: newBalance,
      notes: multiplier > 1 ? `${multiplier}x multiplier applied` : '',
    })

    // Allow undo for 60 seconds
    setLastAction({
      txId: tx.id,
      delta,
      canUndoUntil: Date.now() + 60000,
    })

    // Confetti on positive
    if (delta > 0) {
      fireConfetti(delta >= 15 ? 'high' : 'medium')
    }

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

  // Filtered tasks for current time window
  const windowCategories = currentWindow.categories
  const positiveTasks = tasks.filter(
    (t) => t.is_active && t.points > 0 &&
      (windowCategories.includes(t.category) || windowCategories.includes('any') || t.category === 'any')
  )
  const negativeTasks = tasks.filter((t) => t.is_active && t.points < 0)
  const activeRewards = rewards.filter((r) => r.is_active)
  const todayLog = getTodayTransactions()

  const notifColors = {
    success: 'bg-green-600',
    deduct: 'bg-red-600',
    info: 'bg-violet-600',
  }

  const multiplier = getEffectiveMultiplier()

  // Compute effective delta for confirmation dialog display
  const confirmDelta = confirmation ? getEffectiveDelta(confirmation.item, confirmation.type) : 0
  const rawDelta = confirmation
    ? (confirmation.type === 'task' ? confirmation.item.points : -confirmation.item.point_cost)
    : 0
  const confirmMultiplier = confirmation ? (confirmation.type === 'task' && rawDelta > 0 ? multiplier : 1) : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-950">
      {/* Level Up Overlay */}
      {levelUpInfo && (
        <LevelUpCelebration
          levelInfo={levelUpInfo.levelInfo}
          lifetimePoints={levelUpInfo.lifetimePoints}
          onDismiss={() => setLevelUpInfo(null)}
        />
      )}

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-semibold"
        >
          <span className="text-xl">←</span>
          <span>Home</span>
        </button>
        <div className="text-center">
          <p className="text-white font-black">Parent Panel</p>
          <p className="text-violet-300 text-xs">{currentWindow.emoji} {currentWindow.label}</p>
        </div>
        <div className="text-right">
          <p className="text-amber-400 font-black text-lg">{profile.current_balance}</p>
          <p className="text-white/40 text-xs">pts</p>
        </div>
      </div>

      {/* ── Notification Toast ────────────────────────────────── */}
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

      {/* ── Undo Bar ──────────────────────────────────────────── */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-600/90 px-4 py-2 flex items-center justify-between"
          >
            <span className="text-white text-sm font-semibold">
              Undo available ({undoCountdown}s)
            </span>
            <button
              onClick={handleUndo}
              className="bg-white text-amber-700 px-4 py-1.5 rounded-xl font-black text-sm"
            >
              UNDO
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Multiplier Banner ─────────────────────────────────── */}
      <AnimatePresence>
        {multiplier > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`px-4 py-2.5 text-center font-black text-sm
              ${multiplier === 3
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

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div className="flex gap-1 px-4 pt-4 pb-2">
        {['tasks', 'rewards', 'log'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all capitalize
              ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}
          >
            {tab === 'tasks' ? `⚡ Tasks` : tab === 'rewards' ? '🎁 Rewards' : '📋 Log'}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="px-4 pb-24 overflow-y-auto scrollbar-hide">

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Positive tasks */}
            <div className="mb-5">
              <h2 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Positive Tasks — {currentWindow.emoji} {currentWindow.label}
                {multiplier > 1 && (
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-black">
                    {multiplier}x
                  </span>
                )}
              </h2>
              {positiveTasks.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No tasks for this time window</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {positiveTasks.map((task) => (
                    <TaskTile key={task.id} task={task} onTap={handleTaskTap} multiplier={multiplier} />
                  ))}
                </div>
              )}
            </div>

            {/* Negative tasks */}
            <div>
              <h2 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Deductions
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {negativeTasks.map((task) => (
                  <TaskTile key={task.id} task={task} onTap={handleTaskTap} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {['daily', 'weekly', 'big'].map((cat) => {
              const catRewards = activeRewards.filter((r) => r.category === cat)
              if (catRewards.length === 0) return null
              const labels = { daily: '📅 Daily', weekly: '📆 Weekly', big: '🎮 Big Rewards' }
              return (
                <div key={cat} className="mb-5">
                  <h2 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
                    {labels[cat]}
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    {catRewards.map((reward) => (
                      <RewardTile
                        key={reward.id}
                        reward={reward}
                        currentBalance={profile.current_balance}
                        onTap={handleRewardTap}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* LOG TAB */}
        {activeTab === 'log' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
              Today's Activity
            </h2>
            {todayLog.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">📋</p>
                <p className="text-white/40">No activity yet today</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {todayLog.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="star-card flex items-center gap-3"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm
                        ${tx.points_delta > 0 ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'}`}
                    >
                      {tx.points_delta > 0 ? `+${tx.points_delta}` : tx.points_delta}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{tx.reference_name}</p>
                      <p className="text-white/40 text-xs">{formatTimestamp(tx.timestamp)}</p>
                      {tx.notes && <p className="text-amber-400 text-xs">{tx.notes}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white/40 text-xs">bal: {tx.balance_after}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Confirmation Dialog ───────────────────────────────── */}
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
              className="bg-gradient-to-br from-violet-800 to-indigo-900 rounded-3xl p-6 w-full max-w-sm border border-violet-500/30 shadow-2xl mb-4"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{confirmation.item.emoji}</div>
                <h3 className="text-xl font-black text-white">{confirmation.item.name}</h3>

                {/* Points display with multiplier */}
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
                  className={`flex-1 py-4 rounded-2xl font-black text-lg text-white shadow-lg
                    ${confirmation.type === 'reward' || (confirmation.type === 'task' && confirmation.item.points < 0)
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
    </div>
  )
}

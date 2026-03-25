import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { useTransactions } from '../hooks/useTransactions'
import { useTasks, ALL_BADGES } from '../hooks/useTasks'
import PinModal from '../components/PinModal'
import PointCounter from '../components/PointCounter'
import StreakFlame from '../components/StreakFlame'
import LevelBadge from '../components/LevelBadge'
import GoalProgressBar from '../components/GoalProgressBar'
import { getTheme } from '../utils/theme'
import { getThemeName, getGreeting, getTodayString } from '../utils/timeOfDay'
import { generatePDF } from '../utils/generatePDF'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { profile, verifyPin } = useProfile()
  const { getTodaySummary } = useTransactions()
  const { tasks, rewards, badges } = useTasks()

  const [showParentPin, setShowParentPin] = useState(false)
  const [showAdminPin, setShowAdminPin] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [pdfLoading, setPdfLoading] = useState(false)

  // Update time every minute for live greeting/theme
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const themeName = profile.theme !== 'default' ? profile.theme : getThemeName(currentTime)
  const theme = getTheme(themeName)
  const greeting = getGreeting(profile.name, currentTime)
  const todaySummary = getTodaySummary()

  const earnedBadgeKeys = new Set(badges.map((b) => b.badge_key))

  // Check if multiplier is active today
  const today = getTodayString()
  const effectiveMultiplier =
    profile.bonus_multiplier > 1 && profile.bonus_multiplier_date === today
      ? profile.bonus_multiplier
      : 1

  const handleParentSuccess = useCallback(() => {
    setShowParentPin(false)
    navigate('/parent')
  }, [navigate])

  const handleAdminSuccess = useCallback(() => {
    setShowAdminPin(false)
    navigate('/admin')
  }, [navigate])

  const handlePrint = useCallback(async () => {
    setPdfLoading(true)
    try {
      generatePDF(profile, tasks, rewards)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setPdfLoading(false)
    }
  }, [profile, tasks, rewards])

  // Generate star background for night/evening themes
  const stars = theme.stars
    ? Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 3,
      }))
    : []

  const goalReward = profile.goal_reward_id
    ? { name: profile.goal_reward_name, cost: profile.goal_reward_cost, emoji: '🎯' }
    : null

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} relative overflow-hidden`}>
      {/* Decorative background stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
          }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2 + star.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative z-10 flex flex-col min-h-screen px-4 pt-safe-top pb-safe-bottom max-w-md mx-auto">
        {/* ── Header ────────────────────────────────────────────── */}
        <motion.div
          className="text-center pt-8 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-white/70 text-lg font-semibold">{greeting}</p>
          <h1 className="text-4xl font-black text-white text-shadow-lg mt-1">
            {profile.avatar} {profile.name}
          </h1>
        </motion.div>

        {/* ── Giant Point Balance ────────────────────────────────── */}
        <motion.div
          className="text-center py-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
        >
          <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-1">⭐ StarPoints</p>
          <div className="relative inline-flex flex-col items-center">
            <PointCounter
              value={profile.current_balance}
              className="text-7xl text-white text-shadow-lg"
            />
            <p className="text-white/50 text-sm font-semibold mt-1">current balance</p>
          </div>
        </motion.div>

        {/* ── Bonus Multiplier Banner ───────────────────────────── */}
        <AnimatePresence>
          {effectiveMultiplier > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', stiffness: 260 }}
              className={`mb-4 rounded-2xl px-4 py-3 text-center font-black text-lg shadow-xl
                ${effectiveMultiplier === 3
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 shadow-violet-900/50'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-900/50'
                }`}
              style={{ animation: 'flamePulse 1.5s ease-in-out infinite' }}
            >
              <span className="text-white">
                {effectiveMultiplier === 3
                  ? '⚡ TRIPLE POINTS TODAY!'
                  : '🌟 DOUBLE POINTS TODAY!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Row: Streak + Level ──────────────────────────── */}
        <motion.div
          className="flex justify-center gap-6 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {/* Streak */}
          <div className="star-card flex-1 flex flex-col items-center py-4">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-2">Streak</p>
            <StreakFlame streak={profile.current_streak} />
          </div>

          {/* Level */}
          <div className="star-card flex-1 flex flex-col items-center py-4">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-2">Level</p>
            <LevelBadge lifetimePoints={profile.lifetime_points} showProgress={false} />
          </div>
        </motion.div>

        {/* ── Level Progress ─────────────────────────────────────── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LevelBadge lifetimePoints={profile.lifetime_points} showProgress={true} compact={true} />
        </motion.div>

        {/* ── Goal Progress ──────────────────────────────────────── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GoalProgressBar
            currentBalance={profile.current_balance}
            goalCost={goalReward?.cost}
            goalName={goalReward?.name}
            goalEmoji={goalReward?.emoji}
          />
        </motion.div>

        {/* ── Today's Summary ────────────────────────────────────── */}
        <motion.div
          className="star-card mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-3">📅 Today</p>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-green-400 font-black text-2xl">+{todaySummary.earned}</p>
              <p className="text-white/50 text-xs">earned</p>
            </div>
            <div className="text-center border-x border-white/10 px-6">
              <p className="text-white font-black text-2xl">{todaySummary.net}</p>
              <p className="text-white/50 text-xs">net</p>
            </div>
            <div className="text-center">
              <p className="text-red-400 font-black text-2xl">{todaySummary.spent > 0 ? `-${todaySummary.spent}` : '0'}</p>
              <p className="text-white/50 text-xs">spent</p>
            </div>
          </div>
        </motion.div>

        {/* ── Badge Wall ─────────────────────────────────────────── */}
        <motion.div
          className="star-card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-3">🏅 Badges</p>
          <div className="grid grid-cols-6 gap-2">
            {ALL_BADGES.map((badge) => {
              const earned = earnedBadgeKeys.has(badge.key)
              return (
                <motion.div
                  key={badge.key}
                  className="flex flex-col items-center gap-0.5 cursor-default"
                  title={`${badge.name}: ${badge.description}`}
                  whileHover={{ scale: 1.1 }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl
                      ${earned
                        ? 'bg-white/20 border-2 border-amber-400/60 shadow-md'
                        : 'bg-black/30 border border-white/10 grayscale opacity-40'
                      }`}
                  >
                    {badge.emoji}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Lifetime Points ────────────────────────────────────── */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/40 text-xs">
            🏆 {profile.lifetime_points.toLocaleString()} lifetime points &nbsp;·&nbsp;
            🔥 Best streak: {profile.longest_streak} days
          </p>
        </motion.div>

        {/* ── Action Buttons ─────────────────────────────────────── */}
        <div className="mt-auto pb-8 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              className="star-btn-primary flex items-center justify-center gap-2 py-4"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowParentPin(true)}
            >
              <span className="text-xl">👨‍👩‍👧</span>
              <span>Parent Panel</span>
            </motion.button>

            <motion.button
              className="star-btn bg-indigo-700 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 py-4"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdminPin(true)}
            >
              <span className="text-xl">⚙️</span>
              <span>Admin</span>
            </motion.button>
          </div>

          {/* Print Chart button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            disabled={pdfLoading}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>🖨️</span>
            <span>{pdfLoading ? 'Generating...' : 'Print Chart'}</span>
          </motion.button>
        </div>
      </div>

      {/* ── PIN Modals ─────────────────────────────────────────────── */}
      <PinModal
        isOpen={showParentPin}
        onClose={() => setShowParentPin(false)}
        onSuccess={handleParentSuccess}
        type="parent"
        verifyPin={verifyPin}
      />
      <PinModal
        isOpen={showAdminPin}
        onClose={() => setShowAdminPin(false)}
        onSuccess={handleAdminSuccess}
        type="admin"
        verifyPin={verifyPin}
      />
    </div>
  )
}

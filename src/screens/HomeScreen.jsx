import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { useTransactions } from '../hooks/useTransactions'
import { useTasks, ALL_BADGES } from '../hooks/useTasks'
import { useTheme } from '../hooks/useTheme'
import PointCounter from '../components/PointCounter'
import LevelBadge from '../components/LevelBadge'
import GoalProgressBar from '../components/GoalProgressBar'
import BottomNav from '../components/BottomNav'
import ThemeBackground from '../components/ThemeBackground'
import { getGreeting, getTodayString } from '../utils/timeOfDay'
import { getLevelInfo, getNextLevel, getLevelProgress, pointsToNextLevel } from '../utils/levels'
import { fireConfetti } from '../components/ConfettiEffect'

export default function HomeScreen() {
  const { profile } = useProfile()
  const { getTodaySummary } = useTransactions()
  const { tasks, rewards, badges } = useTasks()
  const theme = useTheme()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [prevBalance, setPrevBalance] = useState(profile.current_balance)

  // Fire confetti when balance increases
  useEffect(() => {
    if (profile.current_balance > prevBalance) {
      fireConfetti(profile.current_balance - prevBalance >= 15 ? 'high' : 'medium')
    }
    setPrevBalance(profile.current_balance)
  }, [profile.current_balance]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update time every minute for live greeting
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const greeting = getGreeting(profile.name, currentTime)
  const todaySummary = getTodaySummary()
  const earnedBadgeKeys = new Set(badges.map((b) => b.badge_key))

  // Bonus multiplier
  const today = getTodayString()
  const effectiveMultiplier =
    profile.bonus_multiplier > 1 && profile.bonus_multiplier_date === today
      ? profile.bonus_multiplier
      : 1

  // Level progress
  const currentLevelInfo = getLevelInfo(profile.lifetime_points)
  const nextLevelInfo = getNextLevel(profile.lifetime_points)
  const levelProgress = getLevelProgress(profile.lifetime_points)
  const ptsToNext = pointsToNextLevel(profile.lifetime_points)

  const goalReward = profile.goal_reward_id || profile.goal_reward_name
    ? { name: profile.goal_reward_name, cost: profile.goal_reward_cost, emoji: '🎯' }
    : null

  // Stars for themes that have them
  const stars = theme.stars
    ? Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 3,
      }))
    : []

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} relative overflow-hidden`}>
      {/* Per-theme SVG background illustration */}
      <ThemeBackground themeId={theme.id || (profile.theme || 'cosmic')} />

      {/* Decorative background stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white star-twinkle pointer-events-none"
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

      <div className="relative z-10 flex flex-col min-h-screen px-4 max-w-md mx-auto pb-28">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          className="text-center pt-4 pb-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-white/70 text-sm font-semibold">{greeting}</p>
          <h1 className="text-2xl font-black text-white text-shadow-lg mt-0.5">
            {profile.avatar} {profile.name}
          </h1>
        </motion.div>

        {/* ── Giant Point Balance ─────────────────────────────────── */}
        <motion.div
          className="text-center py-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
        >
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-0.5">⭐ StarPoints</p>
          <PointCounter
            value={profile.current_balance}
            className="text-6xl text-white text-shadow-lg"
          />
          <p className="text-white/40 text-xs font-semibold mt-0.5">current balance</p>
        </motion.div>

        {/* ── Bonus Multiplier Banner ─────────────────────────────── */}
        <AnimatePresence>
          {effectiveMultiplier > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', stiffness: 260 }}
              className={`mb-3 rounded-2xl px-4 py-3 text-center font-black text-base shadow-xl ${
                effectiveMultiplier === 3
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ animation: 'flamePulse 1.5s ease-in-out infinite' }}
            >
              <span className="text-white">
                {effectiveMultiplier === 3 ? '⚡ TRIPLE POINTS TODAY!' : '🌟 DOUBLE POINTS TODAY!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Streak + Level + XP bar (single compact card) ──────── */}
        <motion.div
          className="star-card mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {/* Streak and Level side by side */}
          <div className="flex gap-3 mb-2">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xl">{profile.current_streak === 0 ? '💤' : profile.current_streak < 14 ? '🔥' : '⚡'}</span>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wide">Streak</p>
                <p className="text-white font-black text-base leading-none">{profile.current_streak} {profile.current_streak === 1 ? 'day' : 'days'}</p>
              </div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xl">{currentLevelInfo.emoji}</span>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wide">Level</p>
                <p className="text-white font-black text-base leading-none">{currentLevelInfo.name}</p>
              </div>
            </div>
          </div>
          {/* XP bar */}
          <div className="h-2 bg-white/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: theme.accentColor }}
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>{profile.lifetime_points.toLocaleString()} pts</span>
            {nextLevelInfo
              ? <span>{ptsToNext} to {nextLevelInfo.emoji} {nextLevelInfo.name}</span>
              : <span className="text-amber-400 font-bold">MAX LEVEL 💎</span>
            }
          </div>
        </motion.div>

        {/* ── Goal Progress ────────────────────────────────────────── */}
        <motion.div
          className="mb-2"
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

        {/* ── Today's Summary ─────────────────────────────────────── */}
        <motion.div
          className="star-card mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-1.5">📅 Today</p>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-green-400 font-black text-lg">+{todaySummary.earned}</p>
              <p className="text-white/40 text-xs">earned</p>
            </div>
            <div className="text-center border-x border-white/10 px-5">
              <p className="text-white font-black text-lg">{todaySummary.net}</p>
              <p className="text-white/40 text-xs">net</p>
            </div>
            <div className="text-center">
              <p className="text-red-400 font-black text-lg">{todaySummary.spent > 0 ? `-${todaySummary.spent}` : '0'}</p>
              <p className="text-white/40 text-xs">spent</p>
            </div>
          </div>
        </motion.div>

        {/* ── Badge Wall ──────────────────────────────────────────── */}
        <motion.div
          className="star-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-2">🏅 Badges</p>
          <div className="grid grid-cols-6 gap-1.5">
            {ALL_BADGES.map((badge) => {
              const earned = earnedBadgeKeys.has(badge.key)
              return (
                <motion.div
                  key={badge.key}
                  className="flex items-center justify-center cursor-default"
                  title={`${badge.name}: ${badge.description}`}
                  whileHover={{ scale: 1.1 }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${
                      earned
                        ? 'bg-white/20 border-2 shadow-md'
                        : 'bg-black/30 border border-white/10 grayscale opacity-40'
                    }`}
                    style={earned ? { borderColor: `${theme.accentColor}80` } : {}}
                  >
                    {badge.emoji}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}

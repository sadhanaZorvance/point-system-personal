import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTransactions } from '../../hooks/useTransactions'
import { useProfile } from '../../hooks/useProfile'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Get ISO YYYY-MM-DD for Monday of the current week (Eastern Time). */
function getMondayOfWeek(date = new Date()) {
  const d = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = d.getDay() // 0=Sun, 1=Mon…6=Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toLocaleDateString('en-CA')
}

function getWeekDates() {
  const monday = getMondayOfWeek()
  const [y, m, dd] = monday.split('-').map(Number)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(y, m - 1, dd + i)
    return d.toLocaleDateString('en-CA')
  })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white text-xs shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function WeeklySummary() {
  const { transactions } = useTransactions()
  const { profile } = useProfile()

  const weekDates = useMemo(() => getWeekDates(), [])

  const weekData = useMemo(() => {
    const byDay = {}
    for (const dateStr of weekDates) {
      byDay[dateStr] = { earned: 0, spent: 0, tasks: 0, rewards: 0, taskNames: {} }
    }

    for (const tx of transactions) {
      const dayKey = new Date(tx.timestamp).toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
      if (!byDay[dayKey]) continue
      if (tx.points_delta > 0) {
        byDay[dayKey].earned += tx.points_delta
        byDay[dayKey].tasks += 1
        const name = tx.reference_name || 'Unknown'
        byDay[dayKey].taskNames[name] = (byDay[dayKey].taskNames[name] || 0) + 1
      } else {
        byDay[dayKey].spent += Math.abs(tx.points_delta)
        if (tx.type === 'reward_redeem') byDay[dayKey].rewards += 1
      }
    }
    return byDay
  }, [transactions, weekDates])

  const chartData = useMemo(() => {
    return weekDates.map((dateStr, i) => ({
      day: DAY_NAMES[i],
      earned: weekData[dateStr]?.earned || 0,
      spent: weekData[dateStr]?.spent || 0,
    }))
  }, [weekDates, weekData])

  const stats = useMemo(() => {
    let totalEarned = 0
    let totalTasks = 0
    let totalRewards = 0
    let bestDay = null
    let bestDayPts = -Infinity
    const allTaskCounts = {}

    for (const dateStr of weekDates) {
      const d = weekData[dateStr]
      totalEarned += d.earned
      totalTasks += d.tasks
      totalRewards += d.rewards
      const net = d.earned - d.spent
      if (net > bestDayPts) {
        bestDayPts = net
        bestDay = dateStr
      }
      for (const [name, count] of Object.entries(d.taskNames)) {
        allTaskCounts[name] = (allTaskCounts[name] || 0) + count
      }
    }

    const totalSpent = weekDates.reduce((s, d) => s + (weekData[d]?.spent || 0), 0)
    const net = totalEarned - totalSpent

    const topTaskEntry = Object.entries(allTaskCounts).sort((a, b) => b[1] - a[1])[0]
    const mostCompletedTask = topTaskEntry ? { name: topTaskEntry[0], count: topTaskEntry[1] } : null

    const bestDayLabel = bestDay
      ? new Date(bestDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      : null

    return { totalEarned, totalTasks, totalRewards, bestDayLabel, bestDayPts, mostCompletedTask, net }
  }, [weekData, weekDates])

  const motivationalMessage = useMemo(() => {
    if (stats.net > 100) return { text: 'What an incredible week! You are absolutely crushing it!', emoji: '🔥', color: 'from-orange-500 to-red-500' }
    if (stats.net >= 50) return { text: 'Great week! Keep up the amazing work!', emoji: '⭐', color: 'from-violet-500 to-indigo-600' }
    if (stats.net >= 10) return { text: 'Good effort this week! Tomorrow is a fresh start!', emoji: '👍', color: 'from-green-500 to-teal-600' }
    return { text: 'This week was tough, but every champion has setbacks. Let\'s bounce back!', emoji: '💪', color: 'from-blue-500 to-indigo-600' }
  }, [stats.net])

  const weekLabel = useMemo(() => {
    const start = new Date(weekDates[0] + 'T12:00:00')
    const end = new Date(weekDates[6] + 'T12:00:00')
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(start)} – ${fmt(end)}`
  }, [weekDates])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: 'spring', stiffness: 200 } }),
  }

  const statCards = [
    { label: 'Points Earned', value: stats.totalEarned, icon: '⭐', color: 'bg-green-600/30 border-green-500/30', textColor: 'text-green-300' },
    { label: 'Tasks Done', value: stats.totalTasks, icon: '✅', color: 'bg-violet-600/30 border-violet-500/30', textColor: 'text-violet-300' },
    { label: 'Rewards Redeemed', value: stats.totalRewards, icon: '🎁', color: 'bg-amber-600/30 border-amber-500/30', textColor: 'text-amber-300' },
    { label: 'Net Points', value: stats.net >= 0 ? `+${stats.net}` : stats.net, icon: '📊', color: 'bg-blue-600/30 border-blue-500/30', textColor: 'text-blue-300' },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-black text-lg">📅 Weekly Summary</h2>
        <span className="text-white/40 text-xs font-semibold">{weekLabel}</span>
      </div>

      {/* ── Motivational Card ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`bg-gradient-to-br ${motivationalMessage.color} rounded-3xl p-5 mb-5 border border-white/20 shadow-xl relative overflow-hidden`}
      >
        {/* shimmer overlay */}
        <div className="absolute inset-0 shine-effect opacity-30 rounded-3xl" />
        <div className="relative z-10">
          <div className="text-4xl mb-2">{motivationalMessage.emoji}</div>
          <p className="text-white font-black text-lg leading-tight">{motivationalMessage.text}</p>
          <p className="text-white/60 text-xs mt-2 font-semibold">
            {profile.avatar} {profile.name} · Week of {weekLabel}
          </p>
        </div>
      </motion.div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`${card.color} rounded-2xl p-3 border`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{card.icon}</span>
              <p className={`${card.textColor} text-xs font-bold`}>{card.label}</p>
            </div>
            <p className="text-white font-black text-2xl">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Extra Insights ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-5"
      >
        <p className="text-white font-black mb-3">This Week's Highlights</p>
        <div className="flex flex-col gap-2 text-sm">
          {stats.bestDayLabel && (
            <div className="flex items-center justify-between">
              <span className="text-white/60">Best Day</span>
              <span className="text-amber-300 font-bold">{stats.bestDayLabel} ({stats.bestDayPts > 0 ? '+' : ''}{stats.bestDayPts} net)</span>
            </div>
          )}
          {stats.mostCompletedTask && (
            <div className="flex items-center justify-between">
              <span className="text-white/60">Top Task</span>
              <span className="text-green-300 font-bold truncate max-w-[55%] text-right">
                {stats.mostCompletedTask.name} ({stats.mostCompletedTask.count}x)
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-white/60">Current Streak</span>
            <span className="text-orange-300 font-bold">{profile.current_streak} days 🔥</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">Longest Streak</span>
            <span className="text-white font-bold">{profile.longest_streak} days</span>
          </div>
        </div>
      </motion.div>

      {/* ── 7-Day Bar Chart ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-5"
      >
        <p className="text-white font-black mb-4">Points by Day</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Print / Share Button ─────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .weekly-print-area, .weekly-print-area * { visibility: visible !important; }
          .weekly-print-area { position: absolute; inset: 0; background: white; color: black; }
        }
      `}</style>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => window.print()}
        className="w-full py-3 rounded-2xl bg-violet-600/50 hover:bg-violet-600 border border-violet-500/40 text-white font-bold transition-all mb-8"
      >
        Share / Print 🖨️
      </motion.button>
    </div>
  )
}

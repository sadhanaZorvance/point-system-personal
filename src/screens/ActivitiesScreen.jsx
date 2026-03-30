import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTransactions } from '../hooks/useTransactions'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../hooks/useTheme'
import BottomNav from '../components/BottomNav'
import { formatTimestamp } from '../utils/timeOfDay'

// ─── Day names for weekly bar chart ───────────────────────────────────────────
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getMondayOfWeek(date = new Date()) {
  const d = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = d.getDay()
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
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

// ─── Weekly Summary Card ──────────────────────────────────────────────────────

function WeeklySummaryCard({ transactions, profile, theme }) {
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
    let totalEarned = 0, totalTasks = 0, totalRewards = 0, bestDay = null, bestDayPts = -Infinity
    const allTaskCounts = {}
    for (const dateStr of weekDates) {
      const d = weekData[dateStr]
      totalEarned += d.earned
      totalTasks += d.tasks
      totalRewards += d.rewards
      const net = d.earned - d.spent
      if (net > bestDayPts) { bestDayPts = net; bestDay = dateStr }
      for (const [name, count] of Object.entries(d.taskNames)) {
        allTaskCounts[name] = (allTaskCounts[name] || 0) + count
      }
    }
    const totalSpent = weekDates.reduce((s, d) => s + (weekData[d]?.spent || 0), 0)
    const net = totalEarned - totalSpent
    const topTaskEntry = Object.entries(allTaskCounts).sort((a, b) => b[1] - a[1])[0]
    const mostCompletedTask = topTaskEntry ? { name: topTaskEntry[0], count: topTaskEntry[1] } : null
    const bestDayLabel = bestDay
      ? new Date(bestDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : null
    return { totalEarned, totalTasks, totalRewards, bestDayLabel, bestDayPts, mostCompletedTask, net }
  }, [weekData, weekDates])

  const weekLabel = useMemo(() => {
    const start = new Date(weekDates[0] + 'T12:00:00')
    const end = new Date(weekDates[6] + 'T12:00:00')
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(start)} – ${fmt(end)}`
  }, [weekDates])

  const motivationalMessage = useMemo(() => {
    if (stats.net > 100) return { text: 'Incredible week! You are crushing it!', emoji: '🔥', color: 'from-orange-500 to-red-500' }
    if (stats.net >= 50) return { text: 'Great week! Keep up the amazing work!', emoji: '⭐', color: 'from-violet-500 to-indigo-600' }
    if (stats.net >= 10) return { text: 'Good effort this week!', emoji: '👍', color: 'from-green-500 to-teal-600' }
    return { text: "Every champion has setbacks. Let's bounce back!", emoji: '💪', color: 'from-blue-500 to-indigo-600' }
  }, [stats.net])

  return (
    <div className="mb-4">
      {/* Motivational card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-br ${motivationalMessage.color} rounded-3xl p-4 mb-3 border border-white/20 shadow-xl relative overflow-hidden`}
      >
        <div className="absolute inset-0 shine-effect opacity-20 rounded-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-3xl">{motivationalMessage.emoji}</span>
          <div>
            <p className="text-white font-black text-base leading-tight">{motivationalMessage.text}</p>
            <p className="text-white/60 text-xs mt-0.5">{profile.avatar} {profile.name} · {weekLabel}</p>
          </div>
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: 'Points Earned', value: stats.totalEarned, icon: '⭐', color: 'bg-green-600/25 border-green-500/25', text: 'text-green-300' },
          { label: 'Tasks Done', value: stats.totalTasks, icon: '✅', color: 'bg-violet-600/25 border-violet-500/25', text: 'text-violet-300' },
          { label: 'Rewards Used', value: stats.totalRewards, icon: '🎁', color: 'bg-amber-600/25 border-amber-500/25', text: 'text-amber-300' },
          { label: 'Net Points', value: stats.net >= 0 ? `+${stats.net}` : stats.net, icon: '📊', color: 'bg-blue-600/25 border-blue-500/25', text: 'text-blue-300' },
        ].map((card) => (
          <div key={card.label} className={`${card.color} rounded-2xl p-3 border`}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{card.icon}</span>
              <p className={`${card.text} text-xs font-bold`}>{card.label}</p>
            </div>
            <p className="text-white font-black text-xl">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 7-day bar chart */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
        <p className="text-white font-black text-sm mb-3">Points by Day</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Point History ────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  task_earn: { label: 'Earned', color: 'text-green-400', bg: 'bg-green-500/20' },
  task_deduct: { label: 'Deduction', color: 'text-red-400', bg: 'bg-red-500/20' },
  reward_redeem: { label: 'Reward', color: 'text-amber-400', bg: 'bg-amber-500/20' },
}

function PointHistoryList({ transactions, exportCSV }) {
  const [filter, setFilter] = useState('all')
  const [showCount, setShowCount] = useState(30)

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions
    if (filter === 'earned') return transactions.filter((t) => t.points_delta > 0)
    if (filter === 'spent') return transactions.filter((t) => t.points_delta < 0)
    return transactions
  }, [transactions, filter])

  const displayed = filtered.slice(0, showCount)

  const handleExport = () => {
    const csv = exportCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `starpoints-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white font-black text-base">Point History</h2>
        <button
          onClick={handleExport}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
        >
          📥 CSV
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-3">
        {[
          { id: 'all', label: '🔄 All' },
          { id: 'earned', label: '✅ Earned' },
          { id: 'spent', label: '💸 Spent' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === f.id ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-5xl mb-3">📋</p>
          <p className="text-white/40">No transactions yet</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {displayed.map((tx, i) => {
              const typeInfo = TYPE_LABELS[tx.type] || { label: tx.type, color: 'text-white', bg: 'bg-white/10' }
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.015, 0.2) }}
                  className="bg-white/10 rounded-2xl p-3 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${typeInfo.bg} ${typeInfo.color}`}>
                      {tx.points_delta > 0 ? `+${tx.points_delta}` : tx.points_delta}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{tx.reference_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold ${typeInfo.color}`}>{typeInfo.label}</span>
                        <span className="text-white/30 text-xs">·</span>
                        <span className="text-white/40 text-xs">{formatTimestamp(tx.timestamp)}</span>
                      </div>
                      {tx.notes && <p className="text-amber-400 text-xs">{tx.notes}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white/50 text-xs">→ {tx.balance_after}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filtered.length > showCount && (
            <button
              onClick={() => setShowCount((n) => n + 30)}
              className="w-full mt-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 text-sm font-bold transition-all"
            >
              Load more ({filtered.length - showCount} remaining)
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main ActivitiesScreen ────────────────────────────────────────────────────

export default function ActivitiesScreen() {
  const { transactions, exportCSV } = useTransactions()
  const { profile } = useProfile()
  const theme = useTheme()

  return (
    <div className={`h-full bg-gradient-to-br ${theme.bgGradient} relative overflow-y-auto scrollbar-hide`}>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-28">

        {/* Page title */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-black text-xl">📅 Activities</h1>
          <p className="text-white/40 text-xs">{transactions.length} total transactions</p>
        </div>

        {/* Weekly Summary */}
        <WeeklySummaryCard transactions={transactions} profile={profile} theme={theme} />

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Point History</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Point History */}
        <PointHistoryList transactions={transactions} exportCSV={exportCSV} />
      </div>

      <BottomNav />
    </div>
  )
}

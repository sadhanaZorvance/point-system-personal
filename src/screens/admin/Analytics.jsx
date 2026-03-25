import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { useTransactions } from '../../hooks/useTransactions'
import { useProfile } from '../../hooks/useProfile'
import { useTasks } from '../../hooks/useTasks'

const COLORS = ['#7c3aed', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

const CATEGORY_COLORS = {
  morning: '#f97316',
  afternoon: '#3b82f6',
  evening: '#7c3aed',
  any: '#22c55e',
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

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function HeatmapCell({ pts, date }) {
  const [showTooltip, setShowTooltip] = useState(false)

  let bg = 'bg-slate-700'
  if (pts > 0 && pts <= 20) bg = 'bg-green-900'
  else if (pts > 20 && pts <= 50) bg = 'bg-green-600'
  else if (pts > 50) bg = 'bg-green-400'

  const label = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <div className={`w-3.5 h-3.5 rounded-sm ${bg} cursor-default`} />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 bg-slate-900 border border-white/20 rounded-lg px-2 py-1 text-white text-xs whitespace-nowrap shadow-xl pointer-events-none">
          {label}: {pts} pts
        </div>
      )}
    </div>
  )
}

function ActivityHeatmap({ transactions }) {
  // 12 weeks = 84 days, aligned to Mon-Sun columns
  const weeks = useMemo(() => {
    const today = new Date()
    const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

    // Find start of 12-week window (Monday, 84 days back)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 83)
    // Adjust to Monday
    const startDay = startDate.getDay()
    const adjust = startDay === 0 ? -6 : 1 - startDay
    startDate.setDate(startDate.getDate() + adjust)

    // Aggregate points per day
    const ptsByDay = {}
    for (const tx of transactions) {
      if (tx.points_delta <= 0) continue
      const d = new Date(tx.timestamp).toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
      ptsByDay[d] = (ptsByDay[d] || 0) + tx.points_delta
    }

    // Build 12 weeks of cells
    const weeksArr = []
    for (let w = 0; w < 12; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate)
        cellDate.setDate(startDate.getDate() + w * 7 + d)
        const dateStr = cellDate.toLocaleDateString('en-CA')
        week.push({ date: dateStr, pts: ptsByDay[dateStr] || 0, future: dateStr > todayStr })
      }
      weeksArr.push(week)
    }

    return weeksArr
  }, [transactions])

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = null
    weeks.forEach((week, wi) => {
      const month = new Date(week[0].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })
      if (month !== lastMonth) {
        labels.push({ index: wi, label: month })
        lastMonth = month
      }
    })
    return labels
  }, [weeks])

  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
      <p className="text-white font-black mb-3">Activity Heatmap (12 Weeks)</p>

      {/* Month labels */}
      <div className="flex gap-1 ml-8 mb-1">
        {weeks.map((_, wi) => {
          const label = monthLabels.find((m) => m.index === wi)
          return (
            <div key={wi} className="w-3.5 text-center">
              {label && <span className="text-white/40 text-[9px]">{label.label}</span>}
            </div>
          )
        })}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="w-4 h-3.5 flex items-center justify-center text-white/30 text-[9px]">{d}</div>
          ))}
        </div>

        {/* Grid: columns = weeks, rows = days */}
        <div className="flex gap-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell, di) => (
                <div key={di} className={cell.future ? 'opacity-20' : ''}>
                  <HeatmapCell pts={cell.pts} date={cell.date} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-white/40 text-xs">Less</span>
        {['bg-slate-700', 'bg-green-900', 'bg-green-600', 'bg-green-400'].map((bg, i) => (
          <div key={i} className={`w-3.5 h-3.5 rounded-sm ${bg}`} />
        ))}
        <span className="text-white/40 text-xs">More</span>
        <span className="text-white/30 text-xs ml-2">0 · 1-20 · 21-50 · 51+ pts/day</span>
      </div>
    </div>
  )
}

// ─── Category Donut ───────────────────────────────────────────────────────────

const TIME_RANGES = ['This Week', 'This Month', 'All Time']

function CategoryDonut({ transactions }) {
  const [range, setRange] = useState('This Week')

  const data = useMemo(() => {
    const now = new Date()
    let cutoff = null

    if (range === 'This Week') {
      cutoff = new Date(now)
      const day = cutoff.getDay()
      const diff = day === 0 ? -6 : 1 - day
      cutoff.setDate(cutoff.getDate() + diff)
      cutoff.setHours(0, 0, 0, 0)
    } else if (range === 'This Month') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const counts = { morning: 0, afternoon: 0, evening: 0, any: 0 }

    for (const tx of transactions) {
      if (tx.type !== 'task_earn') continue
      if (cutoff && new Date(tx.timestamp) < cutoff) continue
      // We don't store category in tx, but we can infer from hour
      const hour = new Date(tx.timestamp).toLocaleString('en-US', {
        timeZone: 'America/New_York', hour: 'numeric', hour12: false,
      })
      const h = parseInt(hour, 10)
      if (h >= 6 && h < 12) counts.morning += tx.points_delta
      else if (h >= 12 && h < 18) counts.afternoon += tx.points_delta
      else if (h >= 18 && h < 21) counts.evening += tx.points_delta
      else counts.any += tx.points_delta
    }

    return [
      { name: 'Morning', value: counts.morning, color: CATEGORY_COLORS.morning },
      { name: 'Afternoon', value: counts.afternoon, color: CATEGORY_COLORS.afternoon },
      { name: 'Evening', value: counts.evening, color: CATEGORY_COLORS.evening },
      { name: 'Other', value: counts.any, color: CATEGORY_COLORS.any },
    ].filter((d) => d.value > 0)
  }, [transactions, range])

  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
        <p className="text-white font-black mb-3">Category Breakdown</p>
        <p className="text-white/30 text-sm text-center py-4">No task data for this period</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-black">Category Breakdown</p>
        <div className="flex gap-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                range === r ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <ResponsiveContainer width="45%" height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 flex flex-col gap-2 pl-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: entry.color }} />
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">{entry.name}</p>
                <p className="text-white/40 text-xs">{entry.value} pts ({Math.round((entry.value / total) * 100)}%)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Analytics Component ─────────────────────────────────────────────────

export default function Analytics() {
  const { transactions, getTransactionsByDay } = useTransactions()
  const { profile } = useProfile()
  const { tasks, rewards } = useTasks()

  // Last 14 days bar chart data
  const last14Days = useMemo(() => {
    const byDay = getTransactionsByDay(14)
    const result = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      result.push({
        date: label,
        earned: byDay[key]?.earned || 0,
        spent: byDay[key]?.spent || 0,
        net: (byDay[key]?.earned || 0) - (byDay[key]?.spent || 0),
      })
    }
    return result
  }, [getTransactionsByDay])

  // Task type distribution donut
  const typeDistribution = useMemo(() => {
    const counts = {}
    for (const tx of transactions) {
      counts[tx.type] = (counts[tx.type] || 0) + 1
    }
    return [
      { name: 'Task Earned', value: counts.task_earn || 0, color: '#22c55e' },
      { name: 'Deduction', value: counts.task_deduct || 0, color: '#ef4444' },
      { name: 'Reward', value: counts.reward_redeem || 0, color: '#f59e0b' },
    ].filter((d) => d.value > 0)
  }, [transactions])

  // Top tasks by frequency
  const topTasks = useMemo(() => {
    const counts = {}
    for (const tx of transactions.filter((t) => t.type === 'task_earn')) {
      counts[tx.reference_name] = (counts[tx.reference_name] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, count }))
  }, [transactions])

  // Top rewards by frequency
  const topRewards = useMemo(() => {
    const counts = {}
    for (const tx of transactions.filter((t) => t.type === 'reward_redeem')) {
      counts[tx.reference_name] = (counts[tx.reference_name] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, count }))
  }, [transactions])

  const totalEarned = transactions.filter((t) => t.points_delta > 0).reduce((s, t) => s + t.points_delta, 0)
  const totalSpent = transactions.filter((t) => t.points_delta < 0).reduce((s, t) => s + Math.abs(t.points_delta), 0)
  const avgPerDay = useMemo(() => {
    const byDay = getTransactionsByDay(30)
    const days = Object.keys(byDay).length
    if (days === 0) return 0
    const total = Object.values(byDay).reduce((s, d) => s + d.earned, 0)
    return Math.round(total / days)
  }, [getTransactionsByDay])

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-4">
        <p className="text-6xl mb-4">📊</p>
        <p className="text-white font-black text-xl mb-2">No data yet!</p>
        <p className="text-white/40 text-center">Start completing tasks in the Parent Panel to see charts here.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 py-4">
      <h2 className="text-white font-black text-lg mb-4">📊 Analytics</h2>

      {/* ── Activity Heatmap (NEW, at top) ─────────────────────── */}
      <ActivityHeatmap transactions={transactions} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-violet-600/30 rounded-2xl p-3 border border-violet-500/30">
          <p className="text-violet-300 text-xs font-bold">Lifetime Earned</p>
          <p className="text-white font-black text-2xl">{totalEarned.toLocaleString()}</p>
          <p className="text-white/40 text-xs">total pts</p>
        </div>
        <div className="bg-amber-600/30 rounded-2xl p-3 border border-amber-500/30">
          <p className="text-amber-300 text-xs font-bold">Total Spent</p>
          <p className="text-white font-black text-2xl">{totalSpent.toLocaleString()}</p>
          <p className="text-white/40 text-xs">total pts</p>
        </div>
        <div className="bg-green-600/30 rounded-2xl p-3 border border-green-500/30">
          <p className="text-green-300 text-xs font-bold">Avg per Day</p>
          <p className="text-white font-black text-2xl">{avgPerDay}</p>
          <p className="text-white/40 text-xs">pts (30-day avg)</p>
        </div>
        <div className="bg-blue-600/30 rounded-2xl p-3 border border-blue-500/30">
          <p className="text-blue-300 text-xs font-bold">Best Streak</p>
          <p className="text-white font-black text-2xl">{profile.longest_streak}</p>
          <p className="text-white/40 text-xs">days</p>
        </div>
      </div>

      {/* 14-Day Earned/Spent Bar Chart */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
        <p className="text-white font-black mb-4">📅 Last 14 Days</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={last14Days} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} interval={1} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Net Points Line Chart */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
        <p className="text-white font-black mb-4">📈 Net Points per Day</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={last14Days} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} interval={1} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="net" name="Net" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Category Breakdown Donut (NEW) ─────────────────────── */}
      <CategoryDonut transactions={transactions} />

      {/* Transaction Type Donut */}
      {typeDistribution.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
          <p className="text-white font-black mb-4">Transaction Types</p>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-2">
              {typeDistribution.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                  <div>
                    <p className="text-white text-xs font-semibold">{entry.name}</p>
                    <p className="text-white/40 text-xs">{entry.value} times</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Tasks */}
      {topTasks.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
          <p className="text-white font-black mb-4">Top Tasks Completed</p>
          <ResponsiveContainer width="100%" height={Math.max(120, topTasks.length * 30)}>
            <BarChart
              data={topTasks}
              layout="vertical"
              margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
            >
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 9 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Times" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Rewards */}
      {topRewards.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
          <p className="text-white font-black mb-4">Most Redeemed Rewards</p>
          <div className="flex flex-col gap-2">
            {topRewards.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-amber-400 font-black text-sm w-5 text-right">{i + 1}.</span>
                <div className="flex-1 bg-white/10 rounded-xl h-6 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-xl"
                    style={{ width: `${(r.count / topRewards[0].count) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-white text-xs font-bold">
                    {r.name}
                  </span>
                </div>
                <span className="text-white/60 text-xs font-bold w-8 text-right">{r.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

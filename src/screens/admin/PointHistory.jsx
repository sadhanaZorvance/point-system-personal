import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTransactions } from '../../hooks/useTransactions'
import { formatTimestamp } from '../../utils/timeOfDay'

const TYPE_LABELS = {
  task_earn: { label: 'Task Earned', color: 'text-green-400', bg: 'bg-green-500/20' },
  task_deduct: { label: 'Deduction', color: 'text-red-400', bg: 'bg-red-500/20' },
  reward_redeem: { label: 'Reward', color: 'text-amber-400', bg: 'bg-amber-500/20' },
}

export default function PointHistory() {
  const { transactions, exportCSV } = useTransactions()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showCount, setShowCount] = useState(50)

  const filtered = useMemo(() => {
    let result = transactions
    if (filter !== 'all') result = result.filter(t => t.type === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t => t.reference_name.toLowerCase().includes(q))
    }
    return result
  }, [transactions, filter, search])

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

  const totalEarned = transactions.filter(t => t.points_delta > 0).reduce((s, t) => s + t.points_delta, 0)
  const totalSpent = transactions.filter(t => t.points_delta < 0).reduce((s, t) => s + Math.abs(t.points_delta), 0)
  const totalRewards = transactions.filter(t => t.type === 'reward_redeem').length

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-black text-lg">📋 Point History</h2>
          <p className="text-white/40 text-xs">{transactions.length} total transactions</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-500/20 rounded-2xl p-3 text-center border border-green-500/30">
          <p className="text-green-400 font-black text-xl">{totalEarned}</p>
          <p className="text-white/50 text-xs">total earned</p>
        </div>
        <div className="bg-red-500/20 rounded-2xl p-3 text-center border border-red-500/30">
          <p className="text-red-400 font-black text-xl">{totalSpent}</p>
          <p className="text-white/50 text-xs">total spent</p>
        </div>
        <div className="bg-amber-500/20 rounded-2xl p-3 text-center border border-amber-500/30">
          <p className="text-amber-400 font-black text-xl">{totalRewards}</p>
          <p className="text-white/50 text-xs">rewards redeemed</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search transactions..."
          className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-400 text-sm"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {['all', 'task_earn', 'task_deduct', 'reward_redeem'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0
              ${filter === f ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50 hover:text-white'}`}
          >
            {f === 'all' ? '🔄 All' : TYPE_LABELS[f]?.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📋</p>
          <p className="text-white/40">No transactions found</p>
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
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
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
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white/50 text-xs">→ {tx.balance_after} pts</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filtered.length > showCount && (
            <button
              onClick={() => setShowCount(n => n + 50)}
              className="w-full mt-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 text-sm font-bold transition-all"
            >
              Load more ({filtered.length - showCount} remaining)
            </button>
          )}
        </>
      )}
    </div>
  )
}

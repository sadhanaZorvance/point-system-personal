import { useState, useCallback, useEffect, useRef } from 'react'
import { getTodayString } from '../utils/timeOfDay'
import {
  getTransactions,
  addTransactionRecord,
  removeTransactionRecord,
} from '../lib/dataLayer'

function loadTransactionsSync() {
  try {
    const raw = localStorage.getItem('starpoints_transactions')
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

/**
 * Hook for managing point transactions.
 * Accepts an optional userId for Supabase integration.
 */
export function useTransactions(userId = 'local') {
  const [transactions, setTransactions] = useState(() => loadTransactionsSync())
  const syncedRef = useRef(false)

  // Sync with Supabase on mount (background)
  useEffect(() => {
    if (!userId || userId === 'local') return
    if (syncedRef.current) return
    syncedRef.current = true

    getTransactions(userId).then((data) => {
      if (data && data.length > 0) {
        setTransactions(data)
        localStorage.setItem('starpoints_transactions', JSON.stringify(data))
      }
    }).catch(() => {})
  }, [userId])

  /**
   * Add a new transaction. Returns the transaction object.
   */
  const addTransaction = useCallback((tx) => {
    const newTx = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...tx,
    }

    setTransactions((prev) => {
      const next = [newTx, ...prev]
      localStorage.setItem('starpoints_transactions', JSON.stringify(next))
      return next
    })

    addTransactionRecord(newTx, userId).catch(() => {})

    return newTx
  }, [userId])

  /**
   * Remove a transaction by ID (for undo).
   */
  const removeTransaction = useCallback((id) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id)
      localStorage.setItem('starpoints_transactions', JSON.stringify(next))
      return next
    })
    removeTransactionRecord(id, userId).catch(() => {})
  }, [userId])

  /**
   * Get transactions for today (Eastern Time).
   */
  const getTodayTransactions = useCallback(() => {
    const today = getTodayString()
    return transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp).toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
      return txDate === today
    })
  }, [transactions])

  /**
   * Get today's earned and spent totals.
   */
  const getTodaySummary = useCallback(() => {
    const todayTxs = getTodayTransactions()
    let earned = 0
    let spent = 0
    for (const tx of todayTxs) {
      if (tx.points_delta > 0) earned += tx.points_delta
      else spent += Math.abs(tx.points_delta)
    }
    return { earned, spent, net: earned - spent }
  }, [getTodayTransactions])

  /**
   * Get last N transactions.
   */
  const getRecentTransactions = useCallback((n = 20) => {
    return transactions.slice(0, n)
  }, [transactions])

  /**
   * Export transactions as CSV string.
   */
  const exportCSV = useCallback(() => {
    const headers = ['Date', 'Time', 'Type', 'Name', 'Points', 'Balance After', 'Notes']
    const rows = transactions.map((tx) => {
      const date = new Date(tx.timestamp)
      return [
        date.toLocaleDateString('en-US'),
        date.toLocaleTimeString('en-US'),
        tx.type,
        `"${tx.reference_name}"`,
        tx.points_delta,
        tx.balance_after,
        `"${tx.notes || ''}"`,
      ].join(',')
    })
    return [headers.join(','), ...rows].join('\n')
  }, [transactions])

  /**
   * Get transactions grouped by day (for analytics).
   */
  const getTransactionsByDay = useCallback((days = 30) => {
    const result = {}
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    for (const tx of transactions) {
      const date = new Date(tx.timestamp)
      if (date < cutoff) continue
      const dayKey = date.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
      if (!result[dayKey]) result[dayKey] = { earned: 0, spent: 0, count: 0 }
      if (tx.points_delta > 0) result[dayKey].earned += tx.points_delta
      else result[dayKey].spent += Math.abs(tx.points_delta)
      result[dayKey].count++
    }

    return result
  }, [transactions])

  return {
    transactions,
    addTransaction,
    removeTransaction,
    getTodayTransactions,
    getTodaySummary,
    getRecentTransactions,
    exportCSV,
    getTransactionsByDay,
  }
}

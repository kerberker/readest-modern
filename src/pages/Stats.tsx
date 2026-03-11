import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { FiBook, FiClock, FiTrendingUp, FiAward } from 'react-icons/fi'
import { getReadingStats, getDailyActivity, type ReadingStats as StatsType } from '../lib/tauri'
import { formatDuration, getDateRange } from '../lib/utils'

interface StatsData {
  totalBooks: number
  booksReading: number
  booksCompleted: number
  totalReadingSeconds: number
  pagesThisWeek: number
  pagesThisMonth: number
  streakDays: number
}

interface DailyData {
  date: string
  pages: number
  seconds: number
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [daily, setDaily] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, d] = await Promise.all([
          getReadingStats(),
          getDailyActivity(30),
        ])
        setStats({
          totalBooks: s.totalBooks,
          booksReading: s.booksReading,
          booksCompleted: s.booksCompleted,
          totalReadingSeconds: s.totalReadingSeconds,
          pagesThisWeek: s.pagesThisWeek,
          pagesThisMonth: s.pagesThisMonth,
          streakDays: s.streakDays,
        })

        // Fill missing dates
        const dates = getDateRange(30)
        const byDate = new Map(d.map((x) => [x.date, x]))
        setDaily(
          dates.map((date) => byDate.get(date) ?? { date, pages: 0, seconds: 0 }),
        )
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Books',
      value: stats?.totalBooks ?? 0,
      icon: <FiBook className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Reading',
      value: stats?.booksReading ?? 0,
      icon: <FiTrendingUp className="w-6 h-6 text-green-500" />,
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Completed',
      value: stats?.booksCompleted ?? 0,
      icon: <FiAward className="w-6 h-6 text-yellow-500" />,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Total Reading Time',
      value: formatDuration(stats?.totalReadingSeconds ?? 0),
      icon: <FiClock className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Pages This Week',
      value: stats?.pagesThisWeek ?? 0,
      icon: <FiBook className="w-6 h-6 text-orange-500" />,
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Pages This Month',
      value: stats?.pagesThisMonth ?? 0,
      icon: <FiBook className="w-6 h-6 text-red-500" />,
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Reading Streak',
      value: `${stats?.streakDays ?? 0} days`,
      icon: <FiAward className="w-6 h-6 text-pink-500" />,
      bg: 'bg-pink-50 dark:bg-pink-900/20',
    },
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reading Statistics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} rounded-xl p-4 border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">{card.icon}</div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Pages Read — Last 30 Days
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: string) => v.slice(5)}
              interval={4}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(val: number) => [val, 'Pages']}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Bar dataKey="pages" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Time Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Reading Time — Last 30 Days (minutes)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: string) => v.slice(5)}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => String(Math.round(v / 60))}
            />
            <Tooltip
              formatter={(val: number) => [Math.round(val / 60), 'Minutes']}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Bar dataKey="seconds" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

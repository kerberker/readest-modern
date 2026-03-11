import React from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../hooks/useTheme'
import type { Theme } from '../types'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <FiSun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <FiMoon className="w-4 h-4" /> },
    { value: 'sepia', label: 'Sepia', icon: <span className="text-xs font-bold">Aa</span> },
  ]

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide px-1 mb-2">
        Theme
      </p>
      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            title={opt.label}
            className={`flex-1 flex items-center justify-center py-2 text-xs transition-colors ${
              theme === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  )
}

import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiBook, FiBarChart2, FiSettings, FiPlus } from 'react-icons/fi'
import { cn } from '../lib/utils'
import ThemeToggle from './ThemeToggle'

interface LayoutProps {
  children: React.ReactNode
  onAddBook?: () => void
}

export default function Layout({ children, onAddBook }: LayoutProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
    )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <FiBook className="w-7 h-7 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Readest</span>
        </div>

        {/* Add Book Button */}
        {onAddBook && (
          <div className="px-4 py-4">
            <button
              onClick={onAddBook}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Book
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          <NavLink to="/" end className={linkClass}>
            <FiBook className="w-5 h-5" />
            Library
          </NavLink>
          <NavLink to="/stats" className={linkClass}>
            <FiBarChart2 className="w-5 h-5" />
            Statistics
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            <FiSettings className="w-5 h-5" />
            Settings
          </NavLink>
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}

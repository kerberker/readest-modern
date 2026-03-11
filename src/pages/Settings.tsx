import React, { useEffect } from 'react'
import { FiMonitor, FiType, FiInfo } from 'react-icons/fi'
import { useSettings } from '../hooks/useSettings'
import { useTheme } from '../hooks/useTheme'
import ThemeToggle from '../components/ThemeToggle'

export default function Settings() {
  const { settings, loaded, fetchSettings, updateSetting, getSingleSetting } = useSettings()
  const { theme } = useTheme()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const fontSize = getSingleSetting('fontSize', '16')
  const windowRemember = getSingleSetting('rememberWindow', 'true')

  return (
    <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* Appearance */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-4">
          <FiMonitor className="w-5 h-5" />
          Appearance
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <ThemeToggle />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiType className="inline w-4 h-4 mr-1" />
              UI Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min={12}
              max={24}
              value={parseInt(fontSize)}
              onChange={(e) => {
                const val = e.target.value
                updateSetting('fontSize', val)
                document.documentElement.style.fontSize = `${val}px`
              }}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>12px</span>
              <span>24px</span>
            </div>
          </div>
        </div>
      </section>

      {/* Window */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-4">
          <FiMonitor className="w-5 h-5" />
          Window
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Remember Window Position &amp; Size
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Restore the window to its last position on startup
            </p>
          </div>
          <button
            onClick={() =>
              updateSetting('rememberWindow', windowRemember === 'true' ? 'false' : 'true')
            }
            className={`relative w-10 h-6 rounded-full transition-colors ${
              windowRemember === 'true' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                windowRemember === 'true' ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-4">
          ⌨️ Keyboard Shortcuts
        </h2>
        <div className="space-y-2 text-sm">
          {[
            ['← / PageUp', 'Previous Page'],
            ['→ / PageDown', 'Next Page'],
            ['N', 'Add Note'],
            ['B', 'Toggle Bookmark'],
            ['Ctrl+F', 'Search Notes'],
            ['Esc', 'Close Panel/Dialog'],
            ['F / F11', 'Fullscreen'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-gray-700 dark:text-gray-300">{desc}</span>
              <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded border border-gray-200 dark:border-gray-600 font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-2">
          <FiInfo className="w-5 h-5" />
          About
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong className="text-gray-900 dark:text-white">Readest Modern</strong> v0.1.0
        </p>
        <p className="text-xs text-gray-400 mt-1">
          A local-first PDF reader. All data stored on your device.
        </p>
        <p className="text-xs text-gray-400">Built with Tauri v2 · React · Vite · SQLite</p>
      </section>
    </div>
  )
}

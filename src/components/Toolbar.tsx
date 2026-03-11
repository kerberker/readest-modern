import React from 'react'
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiList,
  FiBookmark,
  FiEdit3,
  FiDownload,
  FiMaximize,
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

interface ToolbarProps {
  currentPage: number
  totalPages: number
  scale: number
  isSidebarOpen: boolean
  onPrev: () => void
  onNext: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleSidebar: () => void
  onAddBookmark: () => void
  onAddNote: () => void
  onExport: () => void
  onFullscreen: () => void
}

export default function Toolbar({
  currentPage,
  totalPages,
  scale,
  isSidebarOpen,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onToggleSidebar,
  onAddBookmark,
  onAddNote,
  onExport,
  onFullscreen,
}: ToolbarProps) {
  const navigate = useNavigate()
  const pct = totalPages > 0 ? Math.round(((currentPage - 1) / totalPages) * 100) : 0

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 select-none">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Back to Library"
      >
        <FiArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Navigation */}
      <button
        onClick={onPrev}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Previous Page (←)"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200 min-w-[100px] text-center justify-center">
        <span className="font-medium">{currentPage}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500 dark:text-gray-400">{totalPages}</span>
      </div>

      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Next Page (→)"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Zoom */}
      <button
        onClick={onZoomOut}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Zoom Out"
      >
        <FiZoomOut className="w-5 h-5" />
      </button>
      <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-center">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Zoom In"
      >
        <FiZoomIn className="w-5 h-5" />
      </button>

      {/* Progress */}
      <div className="flex-1 mx-4">
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Actions */}
      <button
        onClick={onAddBookmark}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Bookmark (B)"
      >
        <FiBookmark className="w-5 h-5" />
      </button>
      <button
        onClick={onAddNote}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Add Note (N)"
      >
        <FiEdit3 className="w-5 h-5" />
      </button>
      <button
        onClick={onExport}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Export Notes"
      >
        <FiDownload className="w-5 h-5" />
      </button>
      <button
        onClick={onFullscreen}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Fullscreen (F)"
      >
        <FiMaximize className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        className={`p-2 rounded-lg transition-colors ${
          isSidebarOpen
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}
        title="Toggle Notes Sidebar"
      >
        <FiList className="w-5 h-5" />
      </button>
    </div>
  )
}

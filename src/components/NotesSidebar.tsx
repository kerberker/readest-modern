import React, { useState } from 'react'
import {
  FiX,
  FiEdit3,
  FiTrash2,
  FiBookmark,
  FiPenTool,
  FiFileText,
  FiChevronDown,
} from 'react-icons/fi'
import type { Annotation, AnnotationType } from '../types'
import { HIGHLIGHT_COLORS } from '../types'
import { formatDate } from '../lib/utils'

interface NotesSidebarProps {
  annotations: Annotation[]
  currentPage: number
  onClose: () => void
  onDelete: (id: string) => void
  onEdit: (annotation: Annotation) => void
  onJumpToPage: (page: number) => void
}

const TYPE_ICONS: Record<AnnotationType, React.ReactNode> = {
  bookmark: <FiBookmark className="w-4 h-4 text-blue-500" />,
  highlight: <FiPenTool className="w-4 h-4 text-yellow-500" />,
  note: <FiFileText className="w-4 h-4 text-green-500" />,
}

const TYPE_LABELS: Record<AnnotationType, string> = {
  bookmark: 'Bookmark',
  highlight: 'Highlight',
  note: 'Note',
}

type FilterType = 'all' | AnnotationType

export default function NotesSidebar({
  annotations,
  currentPage,
  onClose,
  onDelete,
  onEdit,
  onJumpToPage,
}: NotesSidebarProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = annotations.filter(
    (a) => filter === 'all' || a.type === filter,
  )

  const sorted = [...filtered].sort((a, b) => a.page_number - b.page_number)

  return (
    <aside className="w-80 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Notes & Annotations
          <span className="ml-2 text-xs text-gray-400 font-normal">({annotations.length})</span>
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['all', 'bookmark', 'highlight', 'note'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : TYPE_LABELS[f as AnnotationType]}
          </button>
        ))}
      </div>

      {/* Annotation List */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-600">
            <FiFileText className="w-8 h-8 mb-2" />
            <p className="text-sm">No annotations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sorted.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  ann.page_number === currentPage ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {TYPE_ICONS[ann.type]}
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {TYPE_LABELS[ann.type]}
                    </span>
                    <button
                      onClick={() => onJumpToPage(ann.page_number)}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      p. {ann.page_number}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {ann.type !== 'bookmark' && (
                      <button
                        onClick={() => onEdit(ann)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400"
                      >
                        <FiEdit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(ann.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Color swatch for highlights */}
                {ann.type === 'highlight' && (
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-4 h-3 rounded"
                      style={{ backgroundColor: ann.color }}
                    />
                    {ann.highlighted_text && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-2">
                        "{ann.highlighted_text}"
                      </p>
                    )}
                  </div>
                )}

                {/* Note content */}
                {ann.content && (
                  <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-3 mt-1">
                    {ann.content}
                  </p>
                )}

                {/* Date */}
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                  {formatDate(ann.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

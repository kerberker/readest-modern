import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrash2, FiClock, FiFileText } from 'react-icons/fi'
import type { Book, ReadingProgress } from '../types'
import ProgressBar from './ProgressBar'
import { formatRelativeDate, formatFileSize } from '../lib/utils'

interface BookListProps {
  book: Book
  progress: ReadingProgress | null
  onDelete: (id: string) => void
}

export default function BookList({ book, progress, onDelete }: BookListProps) {
  const navigate = useNavigate()
  const percentage = progress?.percentage ?? 0
  const currentPage = progress?.current_page ?? 1

  return (
    <div
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/reader/${book.id}`)}
    >
      {/* Mini Cover */}
      <div className="w-12 h-16 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {book.cover_path ? (
          <img
            src={`asset://${book.cover_path.replace(/\\/g, '/')}`}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-lg">📖</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
        )}
        <div className="mt-2 flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <ProgressBar percentage={percentage} />
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="hidden md:flex flex-col items-end gap-1 text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-1">
          <FiFileText className="w-3 h-3" />
          <span>p. {currentPage}/{book.total_pages || '?'}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiClock className="w-3 h-3" />
          <span>{formatRelativeDate(book.last_opened_at)}</span>
        </div>
        <span>{formatFileSize(book.file_size)}</span>
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(book.id)
        }}
        className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

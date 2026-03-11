import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrash2, FiMoreVertical } from 'react-icons/fi'
import type { Book, ReadingProgress } from '../types'
import ProgressBar from './ProgressBar'
import { formatRelativeDate, formatFileSize } from '../lib/utils'

interface BookCardProps {
  book: Book
  progress: ReadingProgress | null
  onDelete: (id: string) => void
}

export default function BookCard({ book, progress, onDelete }: BookCardProps) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = React.useState(false)

  const handleOpen = () => navigate(`/reader/${book.id}`)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(book.id)
    setShowMenu(false)
  }

  const percentage = progress?.percentage ?? 0

  return (
    <div
      className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
      onClick={handleOpen}
    >
      {/* Cover */}
      <div className="aspect-[2/3] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
        {book.cover_path ? (
          <img
            src={`asset://${book.cover_path.replace(/\\/g, '/')}`}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <div className="text-white text-4xl mb-2">📖</div>
            <p className="text-white text-xs font-medium line-clamp-3 text-center">
              {book.title}
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
            {book.author}
          </p>
        )}
        <ProgressBar percentage={percentage} showLabel />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {formatRelativeDate(book.last_opened_at)}
        </p>
      </div>

      {/* Menu Button */}
      <button
        className="absolute top-2 right-2 p-1.5 bg-black/30 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu((v) => !v)
        }}
      >
        <FiMoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          className="absolute top-10 right-2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

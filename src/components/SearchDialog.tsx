import React, { useState, useEffect } from 'react'
import { FiX, FiSearch } from 'react-icons/fi'
import type { Annotation } from '../types'
import { useGlobalSearch } from '../hooks/useAnnotations'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../lib/utils'

interface SearchDialogProps {
  onClose: () => void
}

export default function SearchDialog({ onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const { results, loading, search } = useGlobalSearch()
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 300)
    return () => clearTimeout(timeout)
  }, [query, search])

  const handleJump = (ann: Annotation) => {
    navigate(`/reader/${ann.book_id}?page=${ann.page_number}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <FiSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes and highlights…"
            className="flex-1 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No results found
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Start typing to search across all your notes and highlights
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {results.map((ann) => (
                <button
                  key={ann.id}
                  onClick={() => handleJump(ann)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 capitalize">
                      {ann.type}
                    </span>
                    <span className="text-xs text-gray-400">p. {ann.page_number}</span>
                  </div>
                  {ann.highlighted_text && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-1 line-clamp-1">
                      "{ann.highlighted_text}"
                    </p>
                  )}
                  {ann.content && (
                    <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                      {ann.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(ann.created_at)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useState, useCallback } from 'react'
import { FiGrid, FiList, FiSearch, FiFilter } from 'react-icons/fi'
import type { Book, ReadingProgress, ViewMode, SortField, SortDirection } from '../types'
import { useBooks } from '../hooks/useBooks'
import { getProgress } from '../lib/tauri'
import BookCard from '../components/BookCard'
import BookList from '../components/BookList'
import CollectionPanel from '../components/CollectionPanel'
import SearchDialog from '../components/SearchDialog'
import { cn } from '../lib/utils'

interface LibraryProps {
  onAddBook: () => void
  refreshTrigger?: number
}

export default function Library({ onAddBook, refreshTrigger }: LibraryProps) {
  const { books, loading, fetchBooks, removeBook } = useBooks()
  const [progressMap, setProgressMap] = useState<Map<string, ReadingProgress>>(new Map())
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('last_opened_at')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks, refreshTrigger])

  useEffect(() => {
    const loadProgress = async () => {
      const entries = await Promise.all(
        books.map(async (b) => {
          try {
            const p = await getProgress(b.id)
            return p ? ([b.id, p] as [string, ReadingProgress]) : null
          } catch {
            return null
          }
        }),
      )
      const map = new Map(entries.filter(Boolean) as [string, ReadingProgress][])
      setProgressMap(map)
    }
    if (books.length > 0) loadProgress()
  }, [books])

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Delete this book from your library? The file will also be removed.')) {
        await removeBook(id)
      }
    },
    [removeBook],
  )

  // Filter & sort
  const filtered = books
    .filter((b) => {
      const q = search.toLowerCase()
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      let valA: string | number
      let valB: string | number
      if (sortField === 'percentage') {
        valA = progressMap.get(a.id)?.percentage ?? 0
        valB = progressMap.get(b.id)?.percentage ?? 0
      } else {
        valA = (a[sortField] ?? '') as string
        valB = (b[sortField] ?? '') as string
      }
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  return (
    <div className="flex h-full">
      {/* Left sidebar with collections */}
      <aside className="w-56 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <CollectionPanel
          books={books}
          selectedCollectionId={selectedCollection}
          onSelectCollection={setSelectedCollection}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <select
            value={`${sortField}-${sortDir}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split('-')
              setSortField(f as SortField)
              setSortDir(d as SortDirection)
            }}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="last_opened_at-desc">Last Opened</option>
            <option value="added_at-desc">Recently Added</option>
            <option value="title-asc">Title A-Z</option>
            <option value="author-asc">Author A-Z</option>
            <option value="percentage-desc">Most Read</option>
            <option value="percentage-asc">Least Read</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>

          {/* Global search */}
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title="Search Notes (Ctrl+F)"
          >
            <FiFilter className="w-4 h-4" />
          </button>
        </div>

        {/* Book Grid / List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium mb-2">
                {search ? 'No books found' : 'Your library is empty'}
              </h3>
              <p className="text-sm mb-4">
                {search
                  ? 'Try a different search term'
                  : 'Click "Add Book" to import your first PDF'}
              </p>
              {!search && (
                <button
                  onClick={onAddBook}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Add Your First Book
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  progress={progressMap.get(book.id) ?? null}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((book) => (
                <BookList
                  key={book.id}
                  book={book}
                  progress={progressMap.get(book.id) ?? null}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global search dialog */}
      {showSearch && <SearchDialog onClose={() => setShowSearch(false)} />}
    </div>
  )
}

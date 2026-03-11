import React, { useState } from 'react'
import { FiX, FiPlus, FiTrash2, FiBookOpen } from 'react-icons/fi'
import type { Collection, Book } from '../types'
import { useCollections } from '../hooks/useCollections'

interface CollectionPanelProps {
  books: Book[]
  selectedCollectionId: string | null
  onSelectCollection: (id: string | null) => void
}

export default function CollectionPanel({
  books,
  selectedCollectionId,
  onSelectCollection,
}: CollectionPanelProps) {
  const { collections, fetchCollections, addCollection, removeCollection } = useCollections()
  const [newName, setNewName] = useState('')
  const [showInput, setShowInput] = useState(false)

  React.useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addCollection(newName.trim())
    setNewName('')
    setShowInput(false)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-1">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Collections
        </p>
        <button
          onClick={() => setShowInput((v) => !v)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
        >
          <FiPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {showInput && (
        <div className="flex gap-1 px-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Collection name"
            className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      {/* All Books */}
      <button
        onClick={() => onSelectCollection(null)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
          selectedCollectionId === null
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <FiBookOpen className="w-4 h-4" />
        <span>All Books</span>
        <span className="ml-auto text-xs text-gray-400">{books.length}</span>
      </button>

      {collections.map((col) => (
        <div key={col.id} className="flex items-center group">
          <button
            onClick={() => onSelectCollection(col.id)}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCollectionId === col.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-gray-400">📁</span>
            <span className="truncate">{col.name}</span>
          </button>
          <button
            onClick={() => removeCollection(col.id)}
            className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 text-gray-400 transition-all"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

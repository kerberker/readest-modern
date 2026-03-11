import React, { useState, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Library from './pages/Library'
import Reader from './pages/Reader'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import SearchDialog from './components/SearchDialog'
import { importBook, pickPdfFile } from './lib/tauri'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export default function App() {
  const location = useLocation()
  const isReaderPage = location.pathname.startsWith('/reader/')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showSearch, setShowSearch] = useState(false)

  const handleAddBook = useCallback(async () => {
    try {
      const filePath = await pickPdfFile()
      if (!filePath) return
      await importBook(filePath)
      setRefreshTrigger((n) => n + 1)
    } catch (err) {
      console.error('Failed to import book:', err)
    }
  }, [])

  useKeyboardShortcuts(
    {
      'ctrl+f': () => setShowSearch(true),
      escape: () => setShowSearch(false),
    },
    !isReaderPage,
  )

  if (isReaderPage) {
    return (
      <div className="h-screen bg-gray-100 dark:bg-gray-900">
        <Routes>
          <Route path="/reader/:bookId" element={<Reader />} />
        </Routes>
      </div>
    )
  }

  return (
    <Layout onAddBook={handleAddBook}>
      <Routes>
        <Route
          path="/"
          element={<Library onAddBook={handleAddBook} refreshTrigger={refreshTrigger} />}
        />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      {showSearch && <SearchDialog onClose={() => setShowSearch(false)} />}
    </Layout>
  )
}

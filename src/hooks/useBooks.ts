import { useState, useCallback } from 'react'
import type { Book } from '../types'
import {
  listBooks,
  importBook,
  deleteBook,
  updateBookLastOpened,
  pickPdfFile,
} from '../lib/tauri'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listBooks()
      setBooks(result)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const addBook = useCallback(async (): Promise<Book | null> => {
    try {
      const filePath = await pickPdfFile()
      if (!filePath) return null

      setLoading(true)
      const book = await importBook(filePath)
      setBooks((prev) => [book, ...prev])
      return book
    } catch (err) {
      setError(String(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeBook = useCallback(async (bookId: string) => {
    try {
      await deleteBook(bookId)
      setBooks((prev) => prev.filter((b) => b.id !== bookId))
    } catch (err) {
      setError(String(err))
    }
  }, [])

  const touchBook = useCallback(async (bookId: string) => {
    try {
      await updateBookLastOpened(bookId)
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId ? { ...b, last_opened_at: new Date().toISOString() } : b,
        ),
      )
    } catch (err) {
      setError(String(err))
    }
  }, [])

  return { books, loading, error, fetchBooks, addBook, removeBook, touchBook }
}

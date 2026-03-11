import { useState, useCallback } from 'react'
import type { Collection, Book } from '../types'
import {
  listCollections,
  createCollection,
  deleteCollection,
  addBookToCollection,
  removeBookFromCollection,
  getBooksInCollection,
} from '../lib/tauri'

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      const result = await listCollections()
      setCollections(result)
    } finally {
      setLoading(false)
    }
  }, [])

  const addCollection = useCallback(async (name: string, description: string = '') => {
    const col = await createCollection(name, description)
    setCollections((prev) => [...prev, col])
    return col
  }, [])

  const removeCollection = useCallback(async (collectionId: string) => {
    await deleteCollection(collectionId)
    setCollections((prev) => prev.filter((c) => c.id !== collectionId))
  }, [])

  const addBook = useCallback(async (collectionId: string, bookId: string) => {
    await addBookToCollection(collectionId, bookId)
  }, [])

  const removeBook = useCallback(async (collectionId: string, bookId: string) => {
    await removeBookFromCollection(collectionId, bookId)
  }, [])

  const getBooksForCollection = useCallback(async (collectionId: string): Promise<Book[]> => {
    return getBooksInCollection(collectionId)
  }, [])

  return {
    collections,
    loading,
    fetchCollections,
    addCollection,
    removeCollection,
    addBook,
    removeBook,
    getBooksForCollection,
  }
}

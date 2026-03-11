import { useState, useCallback, useRef } from 'react'
import type { ReadingSession } from '../types'
import { startSession, endSession, getSessionsForBook } from '../lib/tauri'

export function useReadingSessions(bookId: string) {
  const [sessions, setSessions] = useState<ReadingSession[]>([])
  const currentSessionRef = useRef<ReadingSession | null>(null)
  const startPageRef = useRef(1)

  const begin = useCallback(
    async (currentPage: number) => {
      try {
        const session = await startSession(bookId, currentPage)
        currentSessionRef.current = session
        startPageRef.current = currentPage
        return session
      } catch {
        return null
      }
    },
    [bookId],
  )

  const finish = useCallback(async (endPage: number) => {
    const session = currentSessionRef.current
    if (!session) return
    const pagesRead = Math.abs(endPage - startPageRef.current) + 1
    try {
      await endSession(session.id, endPage, pagesRead)
    } catch {
      // ignore
    }
    currentSessionRef.current = null
  }, [])

  const fetchSessions = useCallback(async () => {
    try {
      const result = await getSessionsForBook(bookId)
      setSessions(result)
    } catch {
      // ignore
    }
  }, [bookId])

  return { sessions, currentSession: currentSessionRef.current, begin, finish, fetchSessions }
}

import { useState, useCallback, useRef } from 'react'
import type { ReadingProgress } from '../types'
import { getProgress, saveProgress, addReadingTime } from '../lib/tauri'

export function useReadingProgress(bookId: string) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null)
  const timerRef = useRef<number | null>(null)
  const secondsRef = useRef(0)

  const fetchProgress = useCallback(async () => {
    try {
      const p = await getProgress(bookId)
      setProgress(p)
      return p
    } catch {
      return null
    }
  }, [bookId])

  const updateProgress = useCallback(
    async (
      currentPage: number,
      totalPages: number,
      scrollPosition: number = 0,
    ) => {
      const percentage = totalPages > 0 ? ((currentPage - 1) / totalPages) * 100 : 0
      try {
        await saveProgress(bookId, currentPage, totalPages, scrollPosition, percentage)
        setProgress((prev) => ({
          id: prev?.id ?? bookId,
          book_id: bookId,
          current_page: currentPage,
          total_pages: totalPages,
          scroll_position: scrollPosition,
          percentage,
          reading_time_seconds: prev?.reading_time_seconds ?? 0,
          last_read_at: new Date().toISOString(),
        }))
      } catch {
        // ignore
      }
    },
    [bookId],
  )

  const startTimer = useCallback(() => {
    if (timerRef.current) return
    timerRef.current = window.setInterval(() => {
      secondsRef.current += 1
      if (secondsRef.current % 30 === 0) {
        addReadingTime(bookId, 30).catch(() => {})
        setProgress((prev) =>
          prev
            ? { ...prev, reading_time_seconds: prev.reading_time_seconds + 30 }
            : prev,
        )
      }
    }, 1000)
  }, [bookId])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const remaining = secondsRef.current % 30
    if (remaining > 0) {
      addReadingTime(bookId, remaining).catch(() => {})
    }
    secondsRef.current = 0
  }, [bookId])

  return { progress, fetchProgress, updateProgress, startTimer, stopTimer }
}

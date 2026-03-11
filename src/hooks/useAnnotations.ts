import { useState, useCallback } from 'react'
import type { Annotation, AnnotationType } from '../types'
import {
  getAnnotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  searchAnnotations,
} from '../lib/tauri'

export function useAnnotations(bookId: string) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAnnotations = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAnnotations(bookId)
      setAnnotations(result)
    } finally {
      setLoading(false)
    }
  }, [bookId])

  const addAnnotation = useCallback(
    async (
      pageNumber: number,
      type: AnnotationType,
      content: string = '',
      highlightedText: string = '',
      color: string = '#FFFF00',
      position: string = '{}',
    ) => {
      const ann = await createAnnotation(
        bookId,
        pageNumber,
        type,
        content,
        highlightedText,
        color,
        position,
      )
      setAnnotations((prev) => [...prev, ann])
      return ann
    },
    [bookId],
  )

  const editAnnotation = useCallback(
    async (annotationId: string, content: string, color: string) => {
      const updated = await updateAnnotation(annotationId, content, color)
      setAnnotations((prev) => prev.map((a) => (a.id === annotationId ? updated : a)))
      return updated
    },
    [],
  )

  const removeAnnotation = useCallback(async (annotationId: string) => {
    await deleteAnnotation(annotationId)
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId))
  }, [])

  return { annotations, loading, fetchAnnotations, addAnnotation, editAnnotation, removeAnnotation }
}

export function useGlobalSearch() {
  const [results, setResults] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const found = await searchAnnotations(query)
      setResults(found)
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, search }
}

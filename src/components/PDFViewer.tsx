import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { loadPdf, renderPage } from '../lib/pdf'

interface PDFViewerProps {
  filePath: string
  currentPage: number
  scale: number
  onPageChange?: (page: number, total: number) => void
  onError?: (err: string) => void
}

export default function PDFViewer({
  filePath,
  currentPage,
  scale,
  onPageChange,
  onError,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfRef = useRef<PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)

  // Load PDF document
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    loadPdf(filePath)
      .then((pdf) => {
        if (cancelled) return
        pdfRef.current = pdf
        onPageChange?.(currentPage, pdf.numPages)
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          onError?.(String(err))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      pdfRef.current?.destroy()
      pdfRef.current = null
    }
  }, [filePath])

  // Render current page
  useEffect(() => {
    const pdf = pdfRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas || loading) return

    setRendering(true)

    renderPage(pdf, currentPage, canvas, scale)
      .then(() => setRendering(false))
      .catch((err) => {
        setRendering(false)
        if (!String(err).includes('cancelled')) {
          onError?.(String(err))
        }
      })
  }, [currentPage, scale, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading PDF…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-auto bg-gray-300 dark:bg-gray-900">
      {rendering && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="shadow-xl max-w-full"
        style={{ display: 'block' }}
      />
    </div>
  )
}

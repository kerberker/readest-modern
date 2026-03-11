import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import type { Book, Annotation } from '../types'
import { getBook, exportAnnotationsAsMarkdown, updateBookLastOpened, updateBookPages } from '../lib/tauri'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { useAnnotations } from '../hooks/useAnnotations'
import { useReadingSessions } from '../hooks/useReadingSessions'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import PDFViewer from '../components/PDFViewer'
import Toolbar from '../components/Toolbar'
import NotesSidebar from '../components/NotesSidebar'
import AddNoteDialog from '../components/AddNoteDialog'

const MIN_SCALE = 0.5
const MAX_SCALE = 3.0
const SCALE_STEP = 0.25

export default function Reader() {
  const { bookId } = useParams<{ bookId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [book, setBook] = useState<Book | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [scale, setScale] = useState(1.5)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { progress, fetchProgress, updateProgress, startTimer, stopTimer } =
    useReadingProgress(bookId!)
  const { annotations, fetchAnnotations, addAnnotation, editAnnotation, removeAnnotation } =
    useAnnotations(bookId!)
  const { begin, finish } = useReadingSessions(bookId!)

  // Load book
  useEffect(() => {
    if (!bookId) return
    getBook(bookId).then((b) => {
      if (!b) navigate('/')
      else setBook(b)
    })
  }, [bookId, navigate])

  // Restore progress & start session
  useEffect(() => {
    if (!bookId) return
    fetchProgress().then((p) => {
      if (p) {
        const pageFromUrl = parseInt(searchParams.get('page') ?? '', 10)
        setCurrentPage(pageFromUrl || p.current_page)
      }
    })
    fetchAnnotations()
    begin(currentPage)
    startTimer()

    return () => {
      stopTimer()
      finish(currentPage)
    }
  }, [bookId])

  // Auto-save progress on page change
  useEffect(() => {
    if (totalPages > 0) {
      updateProgress(currentPage, totalPages)
    }
  }, [currentPage, totalPages])

  const handlePageChange = useCallback(
    (page: number, total: number) => {
      setTotalPages(total)
      // Update total pages in db if we just discovered it
      if (bookId && total > 0) {
        updateBookPages(bookId, total).catch(() => {})
        updateBookLastOpened(bookId).catch(() => {})
      }
    },
    [bookId],
  )

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(clamped)
    },
    [totalPages],
  )

  const handleZoomIn = useCallback(
    () => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP)),
    [],
  )
  const handleZoomOut = useCallback(
    () => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP)),
    [],
  )

  const handleAddBookmark = useCallback(async () => {
    await addAnnotation(currentPage, 'bookmark', '', '', '#FFFF00')
    await fetchAnnotations()
  }, [currentPage, addAnnotation, fetchAnnotations])

  const handleAddNote = useCallback(() => {
    setEditingAnnotation(null)
    setShowNoteDialog(true)
  }, [])

  const handleSaveNote = useCallback(
    async (content: string, highlightedText: string, color: string) => {
      if (editingAnnotation) {
        await editAnnotation(editingAnnotation.id, content, color)
      } else {
        await addAnnotation(currentPage, 'note', content, highlightedText, color)
      }
      await fetchAnnotations()
    },
    [currentPage, editingAnnotation, addAnnotation, editAnnotation, fetchAnnotations],
  )

  const handleExport = useCallback(async () => {
    if (!bookId) return
    try {
      const markdown = await exportAnnotationsAsMarkdown(bookId)
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${book?.title ?? 'notes'}-annotations.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(String(err))
    }
  }, [bookId, book])

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    arrowleft: () => goToPage(currentPage - 1),
    arrowright: () => goToPage(currentPage + 1),
    pageup: () => goToPage(currentPage - 1),
    pagedown: () => goToPage(currentPage + 1),
    n: handleAddNote,
    b: handleAddBookmark,
    'ctrl+f': () => navigate('/?search=true'),
    escape: () => {
      if (isSidebarOpen) setIsSidebarOpen(false)
      if (showNoteDialog) setShowNoteDialog(false)
    },
    f: handleFullscreen,
    f11: handleFullscreen,
  })

  if (!book) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <Toolbar
        currentPage={currentPage}
        totalPages={totalPages}
        scale={scale}
        isSidebarOpen={isSidebarOpen}
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        onAddBookmark={handleAddBookmark}
        onAddNote={handleAddNote}
        onExport={handleExport}
        onFullscreen={handleFullscreen}
      />

      {/* Reader area */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF */}
        <div className="flex-1 overflow-auto">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-500">
                <p className="text-lg font-medium mb-2">Failed to load PDF</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <PDFViewer
              filePath={book.file_path}
              currentPage={currentPage}
              scale={scale}
              onPageChange={handlePageChange}
              onError={setError}
            />
          )}
        </div>

        {/* Notes Sidebar */}
        {isSidebarOpen && (
          <NotesSidebar
            annotations={annotations}
            currentPage={currentPage}
            onClose={() => setIsSidebarOpen(false)}
            onDelete={async (id) => {
              await removeAnnotation(id)
            }}
            onEdit={(ann) => {
              setEditingAnnotation(ann)
              setShowNoteDialog(true)
            }}
            onJumpToPage={goToPage}
          />
        )}
      </div>

      {/* Note Dialog */}
      {showNoteDialog && (
        <AddNoteDialog
          pageNumber={currentPage}
          onClose={() => setShowNoteDialog(false)}
          onSave={handleSaveNote}
          editAnnotation={editingAnnotation}
        />
      )}
    </div>
  )
}

import React, { useState } from 'react'
import { FiX } from 'react-icons/fi'
import type { Annotation } from '../types'
import { HIGHLIGHT_COLORS } from '../types'

interface AddNoteDialogProps {
  pageNumber: number
  onClose: () => void
  onSave: (content: string, highlightedText: string, color: string) => void
  editAnnotation?: Annotation | null
}

export default function AddNoteDialog({
  pageNumber,
  onClose,
  onSave,
  editAnnotation,
}: AddNoteDialogProps) {
  const [content, setContent] = useState(editAnnotation?.content ?? '')
  const [highlightedText, setHighlightedText] = useState(
    editAnnotation?.highlighted_text ?? '',
  )
  const [color, setColor] = useState(editAnnotation?.color ?? HIGHLIGHT_COLORS[0].value)

  const handleSave = () => {
    onSave(content, highlightedText, color)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {editAnnotation ? 'Edit Note' : 'Add Note'} — Page {pageNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Highlighted Text */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Highlighted Text (optional)
            </label>
            <input
              type="text"
              value={highlightedText}
              onChange={(e) => setHighlightedText(e.target.value)}
              placeholder="Paste text you want to highlight…"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Highlight Color
            </label>
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c.value
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Note Text */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here…"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {editAnnotation ? 'Save Changes' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  )
}

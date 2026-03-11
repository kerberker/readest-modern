import React from 'react'
import { cn } from '../lib/utils'

interface ProgressBarProps {
  percentage: number
  className?: string
  showLabel?: boolean
}

export default function ProgressBar({ percentage, className, showLabel = false }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, percentage))

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}

// ─── Core Data Types ────────────────────────────────────────────────────────

export interface Book {
  id: string
  title: string
  author: string
  file_path: string
  cover_path: string | null
  total_pages: number
  file_size: number
  added_at: string
  last_opened_at: string | null
  metadata: string
}

export interface ReadingProgress {
  id: string
  book_id: string
  current_page: number
  total_pages: number
  scroll_position: number
  percentage: number
  reading_time_seconds: number
  last_read_at: string
}

export type AnnotationType = 'note' | 'highlight' | 'bookmark'

export interface Annotation {
  id: string
  book_id: string
  page_number: number
  type: AnnotationType
  content: string
  highlighted_text: string
  color: string
  position: string
  created_at: string
  updated_at: string
}

export interface ReadingSession {
  id: string
  book_id: string
  started_at: string
  ended_at: string | null
  pages_read: number
  start_page: number
  end_page: number
}

export interface Collection {
  id: string
  name: string
  description: string
  created_at: string
}

export interface CollectionBook {
  collection_id: string
  book_id: string
  added_at: string
}

export interface Setting {
  key: string
  value: string
}

// ─── View / UI Types ────────────────────────────────────────────────────────

export type ViewMode = 'grid' | 'list'
export type SortField = 'title' | 'author' | 'last_opened_at' | 'added_at' | 'percentage'
export type SortDirection = 'asc' | 'desc'
export type Theme = 'light' | 'dark' | 'sepia'

export interface LibraryFilter {
  search: string
  collectionId: string | null
  sortField: SortField
  sortDirection: SortDirection
}

// ─── Stats Types ─────────────────────────────────────────────────────────────

export interface ReadingStats {
  totalBooks: number
  booksReading: number
  booksCompleted: number
  totalReadingSeconds: number
  pagesThisWeek: number
  pagesThisMonth: number
  streakDays: number
  dailyActivity: DailyActivity[]
}

export interface DailyActivity {
  date: string
  pages: number
  seconds: number
}

// ─── Highlight Colors ────────────────────────────────────────────────────────

export const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#FFFF00', bg: 'bg-yellow-300' },
  { label: 'Green', value: '#90EE90', bg: 'bg-green-300' },
  { label: 'Blue', value: '#87CEEB', bg: 'bg-blue-300' },
  { label: 'Pink', value: '#FFB6C1', bg: 'bg-pink-300' },
  { label: 'Orange', value: '#FFA500', bg: 'bg-orange-300' },
] as const

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number]['value']

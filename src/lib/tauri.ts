/**
 * Database abstraction layer.
 * Uses @tauri-apps/plugin-sql (SQLite) for all persistence.
 */
import Database from '@tauri-apps/plugin-sql'
import { invoke } from '@tauri-apps/api/core'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { v4 as uuidv4 } from 'uuid'
import type {
  Book,
  ReadingProgress,
  Annotation,
  AnnotationType,
  ReadingSession,
  Collection,
  Setting,
} from '../types'

const DB_URL = 'sqlite:readest.db'

async function db(): Promise<Database> {
  return Database.load(DB_URL)
}

// ─── File Dialog ─────────────────────────────────────────────────────────────

export async function pickPdfFile(): Promise<string | null> {
  const selected = await openDialog({
    multiple: false,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  })
  return selected as string | null
}

// ─── Book Operations ─────────────────────────────────────────────────────────

export async function importBook(filePath: string): Promise<Book> {
  const conn = await db()

  // Copy file to app data dir via Rust command
  const destPath: string = await invoke('copy_book_file', { sourcePath: filePath })
  const fileSize: number = await invoke('get_file_size', { filePath: destPath })

  // Extract title from filename
  const fileName = destPath.split(/[/\\]/).pop() ?? destPath
  const title = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ')

  const id = uuidv4()
  const now = new Date().toISOString()

  await conn.execute(
    `INSERT INTO books (id, title, author, file_path, cover_path, total_pages, file_size, added_at, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, title, '', destPath, null, 0, fileSize, now, '{}'],
  )

  return {
    id,
    title,
    author: '',
    file_path: destPath,
    cover_path: null,
    total_pages: 0,
    file_size: fileSize,
    added_at: now,
    last_opened_at: null,
    metadata: '{}',
  }
}

export async function listBooks(): Promise<Book[]> {
  const conn = await db()
  return conn.select<Book[]>(
    `SELECT id, title, author, file_path, cover_path, total_pages, file_size,
            added_at, last_opened_at, metadata
     FROM books
     ORDER BY CASE WHEN last_opened_at IS NULL THEN 1 ELSE 0 END,
              last_opened_at DESC, added_at DESC`,
  )
}

export async function getBook(bookId: string): Promise<Book | null> {
  const conn = await db()
  const rows = await conn.select<Book[]>(
    `SELECT id, title, author, file_path, cover_path, total_pages, file_size,
            added_at, last_opened_at, metadata
     FROM books WHERE id = $1`,
    [bookId],
  )
  return rows[0] ?? null
}

export async function deleteBook(bookId: string): Promise<void> {
  const conn = await db()

  // Get paths before deleting
  const rows = await conn.select<Pick<Book, 'file_path' | 'cover_path'>[]>(
    'SELECT file_path, cover_path FROM books WHERE id = $1',
    [bookId],
  )

  await conn.execute('DELETE FROM books WHERE id = $1', [bookId])

  if (rows[0]) {
    await invoke('delete_file', { filePath: rows[0].file_path }).catch(() => {})
    if (rows[0].cover_path) {
      await invoke('delete_file', { filePath: rows[0].cover_path }).catch(() => {})
    }
  }
}

export async function updateBookLastOpened(bookId: string): Promise<void> {
  const conn = await db()
  await conn.execute(
    "UPDATE books SET last_opened_at = datetime('now') WHERE id = $1",
    [bookId],
  )
}

export async function updateBookPages(bookId: string, totalPages: number): Promise<void> {
  const conn = await db()
  await conn.execute('UPDATE books SET total_pages = $1 WHERE id = $2', [totalPages, bookId])
}

// ─── Reading Progress ─────────────────────────────────────────────────────────

export async function getProgress(bookId: string): Promise<ReadingProgress | null> {
  const conn = await db()
  const rows = await conn.select<ReadingProgress[]>(
    `SELECT id, book_id, current_page, total_pages, scroll_position,
            percentage, reading_time_seconds, last_read_at
     FROM reading_progress WHERE book_id = $1`,
    [bookId],
  )
  return rows[0] ?? null
}

export async function saveProgress(
  bookId: string,
  currentPage: number,
  totalPages: number,
  scrollPosition: number,
  percentage: number,
): Promise<void> {
  const conn = await db()
  const id = uuidv4()
  await conn.execute(
    `INSERT INTO reading_progress (id, book_id, current_page, total_pages, scroll_position, percentage, last_read_at)
     VALUES ($1, $2, $3, $4, $5, $6, datetime('now'))
     ON CONFLICT(book_id) DO UPDATE SET
       current_page = excluded.current_page,
       total_pages = excluded.total_pages,
       scroll_position = excluded.scroll_position,
       percentage = excluded.percentage,
       last_read_at = datetime('now')`,
    [id, bookId, currentPage, totalPages, scrollPosition, percentage],
  )
}

export async function addReadingTime(bookId: string, seconds: number): Promise<void> {
  const conn = await db()
  await conn.execute(
    `UPDATE reading_progress SET reading_time_seconds = reading_time_seconds + $1
     WHERE book_id = $2`,
    [seconds, bookId],
  )
}

// ─── Annotations ─────────────────────────────────────────────────────────────

export async function getAnnotations(bookId: string): Promise<Annotation[]> {
  const conn = await db()
  return conn.select<Annotation[]>(
    `SELECT id, book_id, page_number, type, content, highlighted_text,
            color, position, created_at, updated_at
     FROM annotations WHERE book_id = $1 ORDER BY page_number, created_at`,
    [bookId],
  )
}

export async function createAnnotation(
  bookId: string,
  pageNumber: number,
  annotationType: AnnotationType,
  content: string,
  highlightedText: string,
  color: string,
  position: string,
): Promise<Annotation> {
  const conn = await db()
  const id = uuidv4()
  const now = new Date().toISOString()

  await conn.execute(
    `INSERT INTO annotations (id, book_id, page_number, type, content, highlighted_text, color, position, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
    [id, bookId, pageNumber, annotationType, content, highlightedText, color, position, now],
  )

  return {
    id,
    book_id: bookId,
    page_number: pageNumber,
    type: annotationType,
    content,
    highlighted_text: highlightedText,
    color,
    position,
    created_at: now,
    updated_at: now,
  }
}

export async function updateAnnotation(
  annotationId: string,
  content: string,
  color: string,
): Promise<Annotation> {
  const conn = await db()
  const now = new Date().toISOString()
  await conn.execute(
    `UPDATE annotations SET content = $1, color = $2, updated_at = $3 WHERE id = $4`,
    [content, color, now, annotationId],
  )
  const rows = await conn.select<Annotation[]>(
    `SELECT id, book_id, page_number, type, content, highlighted_text,
            color, position, created_at, updated_at
     FROM annotations WHERE id = $1`,
    [annotationId],
  )
  return rows[0]!
}

export async function deleteAnnotation(annotationId: string): Promise<void> {
  const conn = await db()
  await conn.execute('DELETE FROM annotations WHERE id = $1', [annotationId])
}

export async function searchAnnotations(query: string): Promise<Annotation[]> {
  const conn = await db()
  const like = `%${query}%`
  return conn.select<Annotation[]>(
    `SELECT id, book_id, page_number, type, content, highlighted_text,
            color, position, created_at, updated_at
     FROM annotations
     WHERE content LIKE $1 OR highlighted_text LIKE $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [like],
  )
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function listCollections(): Promise<Collection[]> {
  const conn = await db()
  return conn.select<Collection[]>(
    'SELECT id, name, description, created_at FROM collections ORDER BY created_at',
  )
}

export async function createCollection(name: string, description: string): Promise<Collection> {
  const conn = await db()
  const id = uuidv4()
  const now = new Date().toISOString()
  await conn.execute(
    'INSERT INTO collections (id, name, description, created_at) VALUES ($1, $2, $3, $4)',
    [id, name, description, now],
  )
  return { id, name, description, created_at: now }
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const conn = await db()
  await conn.execute('DELETE FROM collections WHERE id = $1', [collectionId])
}

export async function addBookToCollection(collectionId: string, bookId: string): Promise<void> {
  const conn = await db()
  const now = new Date().toISOString()
  await conn.execute(
    `INSERT OR IGNORE INTO collection_books (collection_id, book_id, added_at) VALUES ($1, $2, $3)`,
    [collectionId, bookId, now],
  )
}

export async function removeBookFromCollection(
  collectionId: string,
  bookId: string,
): Promise<void> {
  const conn = await db()
  await conn.execute(
    'DELETE FROM collection_books WHERE collection_id = $1 AND book_id = $2',
    [collectionId, bookId],
  )
}

export async function getBooksInCollection(collectionId: string): Promise<Book[]> {
  const conn = await db()
  return conn.select<Book[]>(
    `SELECT b.id, b.title, b.author, b.file_path, b.cover_path, b.total_pages,
            b.file_size, b.added_at, b.last_opened_at, b.metadata
     FROM books b
     JOIN collection_books cb ON cb.book_id = b.id
     WHERE cb.collection_id = $1
     ORDER BY cb.added_at DESC`,
    [collectionId],
  )
}

// ─── Reading Sessions ─────────────────────────────────────────────────────────

export async function startSession(bookId: string, startPage: number): Promise<ReadingSession> {
  const conn = await db()
  const id = uuidv4()
  const now = new Date().toISOString()
  await conn.execute(
    `INSERT INTO reading_sessions (id, book_id, started_at, start_page)
     VALUES ($1, $2, $3, $4)`,
    [id, bookId, now, startPage],
  )
  return {
    id,
    book_id: bookId,
    started_at: now,
    ended_at: null,
    pages_read: 0,
    start_page: startPage,
    end_page: startPage,
  }
}

export async function endSession(
  sessionId: string,
  endPage: number,
  pagesRead: number,
): Promise<void> {
  const conn = await db()
  const now = new Date().toISOString()
  await conn.execute(
    `UPDATE reading_sessions SET ended_at = $1, end_page = $2, pages_read = $3 WHERE id = $4`,
    [now, endPage, pagesRead, sessionId],
  )
}

export async function getSessionsForBook(bookId: string): Promise<ReadingSession[]> {
  const conn = await db()
  return conn.select<ReadingSession[]>(
    `SELECT id, book_id, started_at, ended_at, pages_read, start_page, end_page
     FROM reading_sessions WHERE book_id = $1 ORDER BY started_at DESC`,
    [bookId],
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<Setting | null> {
  const conn = await db()
  const rows = await conn.select<Setting[]>('SELECT key, value FROM settings WHERE key = $1', [key])
  return rows[0] ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const conn = await db()
  await conn.execute(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  )
}

export async function getAllSettings(): Promise<Setting[]> {
  const conn = await db()
  return conn.select<Setting[]>('SELECT key, value FROM settings')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

export interface ReadingStats {
  totalBooks: number
  booksReading: number
  booksCompleted: number
  totalReadingSeconds: number
  pagesThisWeek: number
  pagesThisMonth: number
  streakDays: number
}

export interface DailyActivity {
  date: string
  pages: number
  seconds: number
}

export async function getReadingStats(): Promise<ReadingStats> {
  const conn = await db()

  const [totalResult, readingResult, completedResult, timeResult, weekResult, monthResult] =
    await Promise.all([
      conn.select<{ count: number }[]>('SELECT COUNT(*) as count FROM books'),
      conn.select<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM reading_progress WHERE percentage > 0 AND percentage < 100`,
      ),
      conn.select<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM reading_progress WHERE percentage >= 100`,
      ),
      conn.select<{ total: number }[]>(
        `SELECT COALESCE(SUM(reading_time_seconds), 0) as total FROM reading_progress`,
      ),
      conn.select<{ pages: number }[]>(
        `SELECT COALESCE(SUM(pages_read), 0) as pages FROM reading_sessions
         WHERE started_at >= datetime('now', '-7 days')`,
      ),
      conn.select<{ pages: number }[]>(
        `SELECT COALESCE(SUM(pages_read), 0) as pages FROM reading_sessions
         WHERE started_at >= datetime('now', '-30 days')`,
      ),
    ])

  // Calculate streak
  const streakDays = await calculateStreak(conn)

  return {
    totalBooks: totalResult[0]?.count ?? 0,
    booksReading: readingResult[0]?.count ?? 0,
    booksCompleted: completedResult[0]?.count ?? 0,
    totalReadingSeconds: timeResult[0]?.total ?? 0,
    pagesThisWeek: weekResult[0]?.pages ?? 0,
    pagesThisMonth: monthResult[0]?.pages ?? 0,
    streakDays,
  }
}

async function calculateStreak(conn: Database): Promise<number> {
  const rows = await conn.select<{ date: string }[]>(
    `SELECT DISTINCT DATE(started_at) as date
     FROM reading_sessions
     WHERE ended_at IS NOT NULL
     ORDER BY date DESC
     LIMIT 365`,
  )

  if (rows.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  let expected = today

  for (const row of rows) {
    if (row.date === expected) {
      streak++
      const d = new Date(expected)
      d.setDate(d.getDate() - 1)
      expected = d.toISOString().split('T')[0]
    } else {
      break
    }
  }

  return streak
}

export async function getDailyActivity(days: number): Promise<DailyActivity[]> {
  const conn = await db()
  return conn.select<DailyActivity[]>(
    `SELECT DATE(started_at) as date,
            COALESCE(SUM(pages_read), 0) as pages,
            0 as seconds
     FROM reading_sessions
     WHERE started_at >= datetime('now', '-' || $1 || ' days')
       AND ended_at IS NOT NULL
     GROUP BY DATE(started_at)
     ORDER BY date ASC`,
    [days],
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function exportAnnotationsAsMarkdown(bookId: string): Promise<string> {
  const conn = await db()

  const book = await getBook(bookId)
  const annotations = await getAnnotations(bookId)

  const lines: string[] = [
    `# ${book?.title ?? 'Unknown Book'}`,
    book?.author ? `**Author:** ${book.author}` : '',
    '',
    `*Exported on ${new Date().toLocaleDateString()}*`,
    '',
    '---',
    '',
  ]

  if (annotations.length === 0) {
    lines.push('*No annotations yet.*')
  } else {
    // Group by page
    const byPage = new Map<number, typeof annotations>()
    for (const ann of annotations) {
      const page = ann.page_number
      if (!byPage.has(page)) byPage.set(page, [])
      byPage.get(page)!.push(ann)
    }

    for (const [page, anns] of [...byPage.entries()].sort((a, b) => a[0] - b[0])) {
      lines.push(`## Page ${page}`, '')
      for (const ann of anns) {
        if (ann.type === 'bookmark') {
          lines.push(`- 🔖 **Bookmark**`)
        } else if (ann.type === 'highlight') {
          lines.push(`- 🖊 **Highlight** (${ann.color})`)
          if (ann.highlighted_text) lines.push(`  > "${ann.highlighted_text}"`)
          if (ann.content) lines.push(`  Note: ${ann.content}`)
        } else if (ann.type === 'note') {
          lines.push(`- 📝 **Note**`)
          if (ann.highlighted_text) lines.push(`  > "${ann.highlighted_text}"`)
          if (ann.content) lines.push(`  ${ann.content}`)
        }
        lines.push(`  *${ann.created_at}*`, '')
      }
    }
  }

  return lines.filter((l) => l !== undefined).join('\n')
}

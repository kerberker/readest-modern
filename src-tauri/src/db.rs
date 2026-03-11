use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "initial_schema",
        sql: r#"
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  file_path TEXT NOT NULL,
  cover_path TEXT,
  total_pages INTEGER DEFAULT 0,
  file_size INTEGER DEFAULT 0,
  added_at TEXT DEFAULT (datetime('now')),
  last_opened_at TEXT,
  metadata TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS reading_progress (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 0,
  scroll_position REAL DEFAULT 0,
  percentage REAL DEFAULT 0,
  reading_time_seconds INTEGER DEFAULT 0,
  last_read_at TEXT DEFAULT (datetime('now')),
  UNIQUE(book_id)
);

CREATE TABLE IF NOT EXISTS annotations (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('note', 'highlight', 'bookmark')),
  content TEXT DEFAULT '',
  highlighted_text TEXT DEFAULT '',
  color TEXT DEFAULT '#FFFF00',
  position TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reading_sessions (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  started_at TEXT DEFAULT (datetime('now')),
  ended_at TEXT,
  pages_read INTEGER DEFAULT 0,
  start_page INTEGER DEFAULT 0,
  end_page INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS collection_books (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  added_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (collection_id, book_id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
        "#,
        kind: MigrationKind::Up,
    }]
}

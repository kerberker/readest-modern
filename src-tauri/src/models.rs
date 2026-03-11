use serde::{Deserialize, Serialize};

// ─── Book ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub author: String,
    pub file_path: String,
    pub cover_path: Option<String>,
    pub total_pages: i64,
    pub file_size: i64,
    pub added_at: String,
    pub last_opened_at: Option<String>,
    pub metadata: String,
}

// ─── Reading Progress ─────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadingProgress {
    pub id: String,
    pub book_id: String,
    pub current_page: i64,
    pub total_pages: i64,
    pub scroll_position: f64,
    pub percentage: f64,
    pub reading_time_seconds: i64,
    pub last_read_at: String,
}

// ─── Annotation ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Annotation {
    pub id: String,
    pub book_id: String,
    pub page_number: i64,
    #[serde(rename = "type")]
    pub annotation_type: String,
    pub content: String,
    pub highlighted_text: String,
    pub color: String,
    pub position: String,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Reading Session ──────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadingSession {
    pub id: String,
    pub book_id: String,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub pages_read: i64,
    pub start_page: i64,
    pub end_page: i64,
}

// ─── Collection ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub description: String,
    pub created_at: String,
}

// ─── Setting ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
}

// ─── Stats ────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadingStats {
    pub total_books: i64,
    pub books_reading: i64,
    pub books_completed: i64,
    pub total_reading_seconds: i64,
    pub pages_this_week: i64,
    pub pages_this_month: i64,
    pub streak_days: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyActivity {
    pub date: String,
    pub pages: i64,
    pub seconds: i64,
}

# Readest Modern

A **local-first PDF/ebook reader** desktop application for Windows, inspired by Readest.

All your books, notes, and reading progress are stored entirely on your device — no cloud, no accounts, no internet required.

Built with **Tauri v2** · **React** · **Vite** · **TypeScript** · **SQLite** · **PDF.js**

---

## Features

### 📚 Library Management
- Import PDFs from your filesystem via native file picker
- Grid view and list view for your book library
- Sort by title, author, last opened, date added, or reading progress
- Search/filter books by title or author
- Reading progress percentage shown on each book card
- Delete books from library (removes file from disk too)
- Organize books into **collections / shelves**

### 📖 PDF Reader
- Render PDFs using **PDF.js** on a canvas
- Page-by-page navigation (prev/next buttons + keyboard arrows)
- Zoom in/out controls
- Progress bar showing current position
- Auto-saves reading progress on every page change
- Restores last reading position when reopening a book

### 📝 Notes & Annotations
- Add text notes attached to specific pages
- Highlight text with multiple color options (yellow, green, blue, pink, orange)
- Bookmark pages
- Notes sidebar panel showing all annotations for the current book
- Edit and delete existing annotations
- Timestamps on all annotations
- **Export** all annotations for a book as a Markdown file

### 📊 Reading Statistics
- Total books, currently reading, completed
- Total reading time
- Pages read this week / month
- Reading streak tracker (consecutive days)
- Bar charts for daily reading activity (pages & time)

### 🔍 Search
- Global search across all notes and highlights from all books
- Jump to the specific book and page from search results (`Ctrl+F`)

### 🎨 Appearance
- Light mode, Dark mode, Sepia mode
- Customizable UI font size
- Theme is persisted across sessions

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `←` / `PageUp` | Previous page |
| `→` / `PageDown` | Next page |
| `N` | Add note |
| `B` | Toggle bookmark |
| `Ctrl+F` | Search notes |
| `Esc` | Close panel/dialog |
| `F` / `F11` | Toggle fullscreen |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Framework | Tauri v2 (Rust) |
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via `@tauri-apps/plugin-sql` |
| PDF Rendering | PDF.js (`pdfjs-dist`) |
| Charts | Recharts |
| Icons | react-icons |
| Target Platform | Windows |

---

## Database Schema

```sql
books                 -- Book metadata and file paths
reading_progress      -- Per-book reading position and time
annotations           -- Notes, highlights, and bookmarks
reading_sessions      -- Individual reading session tracking
collections           -- Named bookshelves
collection_books      -- Many-to-many: collections <-> books
settings              -- App settings (theme, font size, etc.)
```

---

## Project Structure

```
readest-modern/
├── src-tauri/                    # Tauri/Rust backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── lib.rs               # Plugin registration & command handlers
│   │   ├── db.rs                # SQLite migrations
│   │   ├── models.rs            # Rust data structs
│   │   └── commands/
│   │       └── books.rs         # File I/O commands (copy, delete, size)
│   ├── capabilities/
│   │   └── default.json         # Tauri permission declarations
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                          # React frontend
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── pages/
│   │   ├── Library.tsx
│   │   ├── Reader.tsx
│   │   ├── Stats.tsx
│   │   └── Settings.tsx
│   ├── components/
│   │   ├── PDFViewer.tsx
│   │   ├── Toolbar.tsx
│   │   ├── NotesSidebar.tsx
│   │   ├── BookCard.tsx
│   │   ├── BookList.tsx
│   │   ├── CollectionPanel.tsx
│   │   ├── SearchDialog.tsx
│   │   ├── AddNoteDialog.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Layout.tsx
│   ├── hooks/
│   │   ├── useBooks.ts
│   │   ├── useReadingProgress.ts
│   │   ├── useAnnotations.ts
│   │   ├── useCollections.ts
│   │   ├── useReadingSessions.ts
│   │   ├── useSettings.ts
│   │   ├── useTheme.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── lib/
│   │   ├── tauri.ts             # SQLite DB layer + Tauri invoke wrappers
│   │   ├── pdf.ts               # PDF.js utilities
│   │   └── utils.ts             # General utilities
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

---

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Rust** 1.77+ and **Cargo** (install via [rustup](https://rustup.rs/))
- **Tauri v2 prerequisites for Windows**:
  - Microsoft Visual Studio C++ Build Tools
  - WebView2 Runtime (usually pre-installed on Windows 10/11)

Install Tauri CLI:
```bash
npm install --save-dev @tauri-apps/cli
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kerberker/readest-modern.git
cd readest-modern
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run tauri dev
```

This starts:
- Vite dev server on `http://localhost:1420`
- Tauri window connected to the dev server with hot-reload

### 4. Build for production

```bash
npm run tauri build
```

The installer will be in `src-tauri/target/release/bundle/`.

---

## Data Storage

The app stores all data in:
```
%APPDATA%\com.readest.modern\
├── readest.db          # SQLite database
├── books\              # Imported PDF files
├── covers\             # Generated cover thumbnails (future)
└── exports\            # Exported Markdown files
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT

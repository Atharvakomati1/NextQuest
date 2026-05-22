const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// Auto-creates the DB file if it doesn't exist
const dbPath = path.resolve(__dirname, 'backlog.db');
const db = new DatabaseSync(dbPath);

// Initialize database schema
const initDB = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      platform TEXT,
      genre TEXT,
      status TEXT DEFAULT 'backlog',
      mood_tags TEXT,
      rating INTEGER,
      notes TEXT,
      color_tag TEXT DEFAULT '#6c63ff',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('Database initialized');
};

initDB();

module.exports = db;

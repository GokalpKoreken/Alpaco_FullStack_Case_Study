const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_FILE || path.join(__dirname, 'data.db');
const db = new Database(dbPath);

function init() {
  const initSql = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS drops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    claim_open INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drop_id INTEGER NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at INTEGER NOT NULL,
    priority_score INTEGER DEFAULT 0,
    UNIQUE(drop_id,user_id)
  );

  CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drop_id INTEGER NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claim_code TEXT NOT NULL UNIQUE,
    claimed_at INTEGER NOT NULL
  );
  `;

  db.exec(initSql);
}

module.exports = { db, init };

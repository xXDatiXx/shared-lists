import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database schema
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      avatar TEXT NOT NULL,
      isAdmin INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      listId TEXT NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      addedBy TEXT NOT NULL,
      completedBy TEXT,
      createdAt INTEGER NOT NULL,
      completedAt INTEGER,
      FOREIGN KEY (listId) REFERENCES lists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_members (
      groupId TEXT NOT NULL,
      userId TEXT NOT NULL,
      PRIMARY KEY (groupId, userId),
      FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_lists (
      groupId TEXT NOT NULL,
      listId TEXT NOT NULL,
      PRIMARY KEY (groupId, listId),
      FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (listId) REFERENCES lists(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_items_listId ON items(listId);
    CREATE INDEX IF NOT EXISTS idx_group_members_groupId ON group_members(groupId);
    CREATE INDEX IF NOT EXISTS idx_group_members_userId ON group_members(userId);
    CREATE INDEX IF NOT EXISTS idx_group_lists_groupId ON group_lists(groupId);
    CREATE INDEX IF NOT EXISTS idx_group_lists_listId ON group_lists(listId);
  `);

  console.log('Database initialized successfully');
}

// Initialize admin user if it doesn't exist
function initializeAdmin() {
  const adminToken = 'admin-setup-token';
  const existingAdmin = db.prepare('SELECT * FROM users WHERE isAdmin = 1').get();
  
  if (!existingAdmin) {
    const adminId = generateId();
    db.prepare(`
      INSERT INTO users (id, name, token, avatar, isAdmin, createdAt)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run(adminId, 'Admin', adminToken, '👑', Date.now());
    
    console.log('Admin user initialized with token:', adminToken);
  }
}

// Generate UUID v4
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialize database on startup
initializeDatabase();
initializeAdmin();

export { db, generateId };

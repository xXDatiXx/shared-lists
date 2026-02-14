import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import crypto from 'crypto';

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
db.pragma('busy_timeout = 5000'); // 5 seconds timeout
db.pragma('synchronous = NORMAL'); // Balance between safety and speed
db.pragma('cache_size = -64000'); // 64MB cache
db.pragma('temp_store = MEMORY'); // Use memory for temp operations

console.log('Database pragmas:', {
  journal_mode: db.pragma('journal_mode', { simple: true }),
  synchronous: db.pragma('synchronous', { simple: true }),
  busy_timeout: db.pragma('busy_timeout', { simple: true })
});

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
      createdBy TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS list_shares (
      listId TEXT NOT NULL,
      userId TEXT NOT NULL,
      PRIMARY KEY (listId, userId),
      FOREIGN KEY (listId) REFERENCES lists(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
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
    CREATE INDEX IF NOT EXISTS idx_list_shares_listId ON list_shares(listId);
    CREATE INDEX IF NOT EXISTS idx_list_shares_userId ON list_shares(userId);
  `);

  // Add createdBy column if missing (migration for existing DBs)
  try {
    db.prepare("SELECT createdBy FROM lists LIMIT 1").get();
  } catch {
    db.exec("ALTER TABLE lists ADD COLUMN createdBy TEXT REFERENCES users(id) ON DELETE SET NULL");
  }

  console.log('Database initialized successfully');
}

// Initialize admin user if it doesn't exist
function initializeAdmin() {
  const existingAdmin = db.prepare('SELECT * FROM users WHERE isAdmin = 1').get();
  
  if (!existingAdmin) {
    // Read admin token from environment or generate a secure one
    let adminToken = process.env.ADMIN_TOKEN;
    let wasGenerated = false;
    
    if (!adminToken) {
      adminToken = generateSecureToken(32);
      wasGenerated = true;
    } else if (adminToken.length < 32) {
      console.warn('WARNING: ADMIN_TOKEN is shorter than recommended 32 characters. Consider using a longer token for better security.');
    }
    
    const adminId = generateId();
    db.prepare(`
      INSERT INTO users (id, name, token, avatar, isAdmin, createdAt)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run(adminId, 'Admin', adminToken, '👑', Date.now());
    
    if (wasGenerated) {
      console.log('='.repeat(80));
      console.log('ADMIN USER INITIALIZED');
      console.log('='.repeat(80));
      console.log('Admin token (auto-generated):', adminToken);
      console.log('');
      console.log('IMPORTANT: Save this token securely!');
      console.log('To use a custom token, set the ADMIN_TOKEN environment variable.');
      console.log('='.repeat(80));
    } else {
      console.log('Admin user initialized with token from ADMIN_TOKEN environment variable');
    }
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

// Generate secure random token
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Initialize database on startup
initializeDatabase();
initializeAdmin();

// Add process handlers for cleanup
process.on('exit', () => {
  console.log('Closing database connection...');
  db?.close();
});
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export { db, generateId, generateSecureToken };

import express from 'express';
import { db, generateId } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Login with token
router.post('/login', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE token = ?').get(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Convert isAdmin to boolean
    res.json({
      ...user,
      isAdmin: Boolean(user.isAdmin)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create user
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    if (!name || !avatar) {
      return res.status(400).json({ error: 'Name and avatar are required' });
    }

    const id = generateId();
    const token = generateId().slice(0, 8);
    const createdAt = Date.now();

    db.prepare(`
      INSERT INTO users (id, name, token, avatar, isAdmin, createdAt)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(id, name, token, avatar, createdAt);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    res.status(201).json({
      ...user,
      isAdmin: Boolean(user.isAdmin)
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
router.get('/', authenticateToken, (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
    
    res.json(users.map(user => ({
      ...user,
      isAdmin: Boolean(user.isAdmin)
    })));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting the only admin
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (user?.isAdmin) {
      const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE isAdmin = 1').get();
      if (adminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the only admin user' });
      }
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Initialize admin (public endpoint for setup)
router.post('/init-admin', (req, res) => {
  try {
    const adminToken = 'admin-setup-token';
    const existingAdmin = db.prepare('SELECT * FROM users WHERE isAdmin = 1').get();
    
    if (existingAdmin) {
      return res.json({
        ...existingAdmin,
        isAdmin: Boolean(existingAdmin.isAdmin)
      });
    }

    const id = generateId();
    const createdAt = Date.now();

    db.prepare(`
      INSERT INTO users (id, name, token, avatar, isAdmin, createdAt)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run(id, 'Admin', adminToken, '👑', createdAt);

    const admin = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    res.status(201).json({
      ...admin,
      isAdmin: Boolean(admin.isAdmin)
    });
  } catch (error) {
    console.error('Init admin error:', error);
    res.status(500).json({ error: 'Failed to initialize admin' });
  }
});

export default router;

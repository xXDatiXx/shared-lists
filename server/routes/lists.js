import express from 'express';
import { db, generateId } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all lists with their items (filtered by ownership/collaboration)
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get lists where user is creator or collaborator
    const lists = db.prepare(`
      SELECT DISTINCT l.* FROM lists l
      LEFT JOIN list_collaborators lc ON l.id = lc.listId
      WHERE l.creatorId = ? OR lc.userId = ?
      ORDER BY l.updatedAt DESC
    `).all(userId, userId);

    // Get items for each list
    const listsWithItems = lists.map(list => {
      const items = db.prepare(`
        SELECT * FROM items WHERE listId = ? ORDER BY createdAt ASC
      `).all(list.id);

      return {
        ...list,
        items: items.map(item => ({
          ...item,
          completed: Boolean(item.completed)
        }))
      };
    });

    res.json(listsWithItems);
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ error: 'Failed to get lists' });
  }
});

// Get single list by ID (check permissions)
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check if user has permission to view this list
    const hasPermission = list.creatorId === userId || 
      db.prepare('SELECT 1 FROM list_collaborators WHERE listId = ? AND userId = ?').get(id, userId);

    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to view this list' });
    }

    const items = db.prepare(`
      SELECT * FROM items WHERE listId = ? ORDER BY createdAt ASC
    `).all(id);

    res.json({
      ...list,
      items: items.map(item => ({
        ...item,
        completed: Boolean(item.completed)
      }))
    });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ error: 'Failed to get list' });
  }
});

// Create list
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    const creatorId = req.user.id;

    if (!name || !emoji || !color) {
      return res.status(400).json({ error: 'Name, emoji, and color are required' });
    }

    const id = generateId();
    const now = Date.now();

    db.prepare(`
      INSERT INTO lists (id, name, emoji, color, createdAt, updatedAt, creatorId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, emoji, color, now, now, creatorId);

    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    
    res.status(201).json({
      ...list,
      items: []
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Update list
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, emoji, color } = req.body;

    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (emoji !== undefined) {
      updates.push('emoji = ?');
      values.push(emoji);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updatedAt = ?');
    values.push(Date.now());
    values.push(id);

    db.prepare(`
      UPDATE lists SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    const updatedList = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    const items = db.prepare('SELECT * FROM items WHERE listId = ?').all(id);

    res.json({
      ...updatedList,
      items: items.map(item => ({
        ...item,
        completed: Boolean(item.completed)
      }))
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Delete list
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Items will be deleted automatically due to CASCADE
    const result = db.prepare('DELETE FROM lists WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Add item to list
router.post('/:id/items', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { text, addedBy } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const itemId = generateId();
    const now = Date.now();

    db.prepare(`
      INSERT INTO items (id, listId, text, completed, addedBy, createdAt)
      VALUES (?, ?, ?, 0, ?, ?)
    `).run(itemId, id, text, addedBy || 'Tú', now);

    // Update list's updatedAt
    db.prepare('UPDATE lists SET updatedAt = ? WHERE id = ?').run(now, id);

    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);

    res.status(201).json({
      ...item,
      completed: Boolean(item.completed)
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update item
router.put('/:listId/items/:itemId', authenticateToken, (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const { text, completed, completedBy } = req.body;

    const item = db.prepare('SELECT * FROM items WHERE id = ? AND listId = ?').get(itemId, listId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updates = [];
    const values = [];

    if (text !== undefined) {
      updates.push('text = ?');
      values.push(text);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed ? 1 : 0);
      
      if (completed) {
        updates.push('completedBy = ?');
        updates.push('completedAt = ?');
        values.push(completedBy || 'Tú');
        values.push(Date.now());
      } else {
        updates.push('completedBy = NULL');
        updates.push('completedAt = NULL');
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(itemId);

    db.prepare(`
      UPDATE items SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    // Update list's updatedAt
    db.prepare('UPDATE lists SET updatedAt = ? WHERE id = ?').run(Date.now(), listId);

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);

    res.json({
      ...updatedItem,
      completed: Boolean(updatedItem.completed)
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
router.delete('/:listId/items/:itemId', authenticateToken, (req, res) => {
  try {
    const { listId, itemId } = req.params;

    const result = db.prepare('DELETE FROM items WHERE id = ? AND listId = ?').run(itemId, listId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update list's updatedAt
    db.prepare('UPDATE lists SET updatedAt = ? WHERE id = ?').run(Date.now(), listId);

    res.status(204).send();
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Get collaborators for a list
router.get('/:id/collaborators', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if list exists and user has permission
    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const hasPermission = list.creatorId === userId || 
      db.prepare('SELECT 1 FROM list_collaborators WHERE listId = ? AND userId = ?').get(id, userId);

    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to view collaborators' });
    }

    // Get all collaborators with user details
    const collaborators = db.prepare(`
      SELECT u.id, u.name, u.avatar, lc.addedAt
      FROM list_collaborators lc
      JOIN users u ON lc.userId = u.id
      WHERE lc.listId = ?
      ORDER BY lc.addedAt ASC
    `).all(id);

    res.json(collaborators);
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({ error: 'Failed to get collaborators' });
  }
});

// Add collaborator to list (creator only)
router.post('/:id/collaborators', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const requestUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if list exists
    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Only creator can add collaborators
    if (list.creatorId !== requestUserId) {
      return res.status(403).json({ error: 'Only the list creator can add collaborators' });
    }

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a collaborator
    const existing = db.prepare('SELECT 1 FROM list_collaborators WHERE listId = ? AND userId = ?').get(id, userId);
    if (existing) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    // Add collaborator
    const collaboratorId = generateId();
    const now = Date.now();
    db.prepare(`
      INSERT INTO list_collaborators (id, listId, userId, addedAt)
      VALUES (?, ?, ?, ?)
    `).run(collaboratorId, id, userId, now);

    res.status(201).json({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      addedAt: now
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// Remove collaborator from list (creator only)
router.delete('/:id/collaborators/:userId', authenticateToken, (req, res) => {
  try {
    const { id, userId } = req.params;
    const requestUserId = req.user.id;

    // Check if list exists
    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Only creator can remove collaborators
    if (list.creatorId !== requestUserId) {
      return res.status(403).json({ error: 'Only the list creator can remove collaborators' });
    }

    const result = db.prepare('DELETE FROM list_collaborators WHERE listId = ? AND userId = ?').run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

export default router;

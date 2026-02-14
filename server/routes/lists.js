import express from 'express';
import { db, generateId } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper: get sharedWith user IDs for a list
function getSharedWith(listId) {
  return db.prepare('SELECT userId FROM list_shares WHERE listId = ?').all(listId).map(r => r.userId);
}

// Get all lists with their items
router.get('/', authenticateToken, (req, res) => {
  try {
    const lists = db.prepare('SELECT * FROM lists ORDER BY updatedAt DESC').all();

    const listsWithItems = lists.map(list => {
      const items = db.prepare('SELECT * FROM items WHERE listId = ? ORDER BY createdAt ASC').all(list.id);
      return {
        ...list,
        sharedWith: getSharedWith(list.id),
        items: items.map(item => ({ ...item, completed: Boolean(item.completed) }))
      };
    });

    res.json(listsWithItems);
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ error: 'Failed to get lists' });
  }
});

// Get single list by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] User ${req.user.name} (${req.user.id}) requested list ${id}`);
    
    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) return res.status(404).json({ error: 'List not found' });

    const items = db.prepare('SELECT * FROM items WHERE listId = ? ORDER BY createdAt ASC').all(id);
    res.json({
      ...list,
      sharedWith: getSharedWith(id),
      items: items.map(item => ({ ...item, completed: Boolean(item.completed) }))
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
    if (!name || !emoji || !color) return res.status(400).json({ error: 'Name, emoji, and color are required' });

    const id = generateId();
    const now = Date.now();
    const createdBy = req.user.id;

    db.prepare('INSERT INTO lists (id, name, emoji, color, createdBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, name, emoji, color, createdBy, now, now);

    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    res.status(201).json({ ...list, sharedWith: [], items: [] });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Share list with user
router.post('/:id/share', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) return res.status(404).json({ error: 'List not found' });

    // Only owner or admin can share
    if (list.createdBy !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only the list owner can share' });
    }

    db.prepare('INSERT OR IGNORE INTO list_shares (listId, userId) VALUES (?, ?)').run(id, userId);
    res.json({ listId: id, userId });
  } catch (error) {
    console.error('Share list error:', error);
    res.status(500).json({ error: 'Failed to share list' });
  }
});

// Unshare list
router.delete('/:id/share/:userId', authenticateToken, (req, res) => {
  try {
    const { id, userId } = req.params;

    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) return res.status(404).json({ error: 'List not found' });

    if (list.createdBy !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only the list owner can unshare' });
    }

    db.prepare('DELETE FROM list_shares WHERE listId = ? AND userId = ?').run(id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Unshare list error:', error);
    res.status(500).json({ error: 'Failed to unshare list' });
  }
});

// Update list
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, emoji, color } = req.body;

    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) return res.status(404).json({ error: 'List not found' });

    const updates = [];
    const values = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (emoji !== undefined) { updates.push('emoji = ?'); values.push(emoji); }
    if (color !== undefined) { updates.push('color = ?'); values.push(color); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push('updatedAt = ?');
    values.push(Date.now());
    values.push(id);

    db.prepare(`UPDATE lists SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedList = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    const items = db.prepare('SELECT * FROM items WHERE listId = ?').all(id);

    res.json({
      ...updatedList,
      sharedWith: getSharedWith(id),
      items: items.map(item => ({ ...item, completed: Boolean(item.completed) }))
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
    const result = db.prepare('DELETE FROM lists WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'List not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Add item to list
router.post('/:id/items', authenticateToken, (req, res) => {
  // Transaction for atomic multi-write operation
  const addItemTransaction = db.transaction((id, itemId, text, addedBy, now) => {
    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
    if (!list) throw new Error('List not found');
    
    db.prepare('INSERT INTO items (id, listId, text, completed, addedBy, createdAt) VALUES (?, ?, ?, 0, ?, ?)').run(itemId, id, text, addedBy || 'Tú', now);
    db.prepare('UPDATE lists SET updatedAt = ? WHERE id = ?').run(now, id);
    
    return db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  });

  try {
    const { id } = req.params;
    const { text, addedBy } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const itemId = generateId();
    const now = Date.now();

    const item = addItemTransaction(id, itemId, text, addedBy, now);
    res.status(201).json({ ...item, completed: Boolean(item.completed) });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: error.message || 'Failed to add item' });
  }
});

// Update item
router.put('/:listId/items/:itemId', authenticateToken, (req, res) => {
  // Transaction for atomic multi-write operation
  const updateItemTransaction = db.transaction((listId, itemId, updates, values) => {
    const item = db.prepare('SELECT * FROM items WHERE id = ? AND listId = ?').get(itemId, listId);
    if (!item) throw new Error('Item not found');

    db.prepare(`UPDATE items SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    db.prepare('UPDATE lists SET updatedAt = ? WHERE id = ?').run(Date.now(), listId);
    
    return db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  });

  try {
    const { listId, itemId } = req.params;
    const { text, completed, completedBy } = req.body;

    const updates = [];
    const values = [];

    if (text !== undefined) { updates.push('text = ?'); values.push(text); }
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

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(itemId);

    const updatedItem = updateItemTransaction(listId, itemId, updates, values);
    res.json({ ...updatedItem, completed: Boolean(updatedItem.completed) });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: error.message || 'Failed to update item' });
  }
});

// Delete item
router.delete('/:listId/items/:itemId', authenticateToken, (req, res) => {
  // Transaction for atomic multi-write operation
  const deleteItemTransaction = db.transaction((listId, itemId) => {
    const result = db.prepare('DELETE FROM items WHERE id = ? AND listId = ?').run(itemId, listId);
    if (result.changes === 0) throw new Error('Item not found');
    db.prepare('UPDATE lists SET updatedAt = ? WHERE id = ?').run(Date.now(), listId);
  });

  try {
    const { listId, itemId } = req.params;
    deleteItemTransaction(listId, itemId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete item error:', error);
    if (error.message === 'Item not found') {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
});

export default router;

import express from 'express';
import { db, generateId } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all groups
router.get('/', authenticateToken, (req, res) => {
  try {
    const groups = db.prepare('SELECT * FROM groups ORDER BY updatedAt DESC').all();

    const groupsWithDetails = groups.map(group => {
      const members = db.prepare(`
        SELECT userId FROM group_members WHERE groupId = ?
      `).all(group.id).map(m => m.userId);

      const lists = db.prepare(`
        SELECT listId FROM group_lists WHERE groupId = ?
      `).all(group.id).map(l => l.listId);

      return {
        ...group,
        memberIds: members,
        listIds: lists
      };
    });

    res.json(groupsWithDetails);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

// Get single group by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const members = db.prepare(`
      SELECT userId FROM group_members WHERE groupId = ?
    `).all(id).map(m => m.userId);

    const lists = db.prepare(`
      SELECT listId FROM group_lists WHERE groupId = ?
    `).all(id).map(l => l.listId);

    res.json({
      ...group,
      memberIds: members,
      listIds: lists
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

// Create group
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, emoji, ownerId } = req.body;

    if (!name || !emoji || !ownerId) {
      return res.status(400).json({ error: 'Name, emoji, and ownerId are required' });
    }

    const id = generateId();
    const now = Date.now();

    // Use transaction for group creation
    const createGroup = db.transaction(() => {
      db.prepare(`
        INSERT INTO groups (id, name, emoji, ownerId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, name, emoji, ownerId, now, now);

      // Add owner as first member
      db.prepare(`
        INSERT INTO group_members (groupId, userId) VALUES (?, ?)
      `).run(id, ownerId);
    });

    createGroup();

    res.status(201).json({
      id,
      name,
      emoji,
      ownerId,
      memberIds: [ownerId],
      listIds: [],
      createdAt: now,
      updatedAt: now
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, emoji } = req.body;

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
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

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updatedAt = ?');
    values.push(Date.now());
    values.push(id);

    db.prepare(`
      UPDATE groups SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    const updatedGroup = db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
    const members = db.prepare('SELECT userId FROM group_members WHERE groupId = ?').all(id).map(m => m.userId);
    const lists = db.prepare('SELECT listId FROM group_lists WHERE groupId = ?').all(id).map(l => l.listId);

    res.json({
      ...updatedGroup,
      memberIds: members,
      listIds: lists
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    // Members and lists associations will be deleted automatically due to CASCADE
    const result = db.prepare('DELETE FROM groups WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Add member to group
router.post('/:id/members', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      db.prepare(`
        INSERT INTO group_members (groupId, userId) VALUES (?, ?)
      `).run(id, userId);

      // Update group's updatedAt
      db.prepare('UPDATE groups SET updatedAt = ? WHERE id = ?').run(Date.now(), id);

      res.status(201).json({ groupId: id, userId });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'User is already a member' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from group
router.delete('/:id/members/:userId', authenticateToken, (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = db.prepare(`
      DELETE FROM group_members WHERE groupId = ? AND userId = ?
    `).run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    // Update group's updatedAt
    db.prepare('UPDATE groups SET updatedAt = ? WHERE id = ?').run(Date.now(), id);

    res.status(204).send();
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Add list to group
router.post('/:id/lists', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { listId } = req.body;

    if (!listId) {
      return res.status(400).json({ error: 'ListId is required' });
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    try {
      db.prepare(`
        INSERT INTO group_lists (groupId, listId) VALUES (?, ?)
      `).run(id, listId);

      // Update group's updatedAt
      db.prepare('UPDATE groups SET updatedAt = ? WHERE id = ?').run(Date.now(), id);

      res.status(201).json({ groupId: id, listId });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'List is already in group' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Add list error:', error);
    res.status(500).json({ error: 'Failed to add list' });
  }
});

// Remove list from group
router.delete('/:id/lists/:listId', authenticateToken, (req, res) => {
  try {
    const { id, listId } = req.params;

    const result = db.prepare(`
      DELETE FROM group_lists WHERE groupId = ? AND listId = ?
    `).run(id, listId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'List not found in group' });
    }

    // Update group's updatedAt
    db.prepare('UPDATE groups SET updatedAt = ? WHERE id = ?').run(Date.now(), id);

    res.status(204).send();
  } catch (error) {
    console.error('Remove list error:', error);
    res.status(500).json({ error: 'Failed to remove list' });
  }
});

export default router;

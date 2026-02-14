import { db } from '../database.js';

export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE token = ?').get(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Convert isAdmin from integer to boolean
    req.user = {
      ...user,
      isAdmin: Boolean(user.isAdmin)
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

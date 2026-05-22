const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all games (with optional status filter)
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let games;
    if (status) {
      games = db.prepare('SELECT * FROM games WHERE status = ? ORDER BY updated_at DESC').all(status);
    } else {
      games = db.prepare('SELECT * FROM games ORDER BY updated_at DESC').all();
    }
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// POST add a new game
router.post('/', (req, res) => {
  try {
    const { title, platform, genre, status, mood_tags, rating, notes, color_tag } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO games (title, platform, genre, status, mood_tags, rating, notes, color_tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      title,
      platform || null,
      genre || null,
      status || 'backlog',
      mood_tags || null,
      rating || null,
      notes || null,
      color_tag || '#6c63ff'
    );
    
    const newGame = db.prepare('SELECT * FROM games WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add game' });
  }
});

// PUT update full game details
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, platform, genre, status, mood_tags, rating, notes, color_tag } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const stmt = db.prepare(`
      UPDATE games 
      SET title = ?, platform = ?, genre = ?, status = ?, mood_tags = ?, rating = ?, notes = ?, color_tag = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    
    const info = stmt.run(
      title, 
      platform || null, 
      genre || null, 
      status, 
      mood_tags || null, 
      rating || null, 
      notes || null, 
      color_tag, 
      id
    );
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const updatedGame = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
    res.json(updatedGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// PATCH update only status
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['backlog', 'playing', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const stmt = db.prepare(`
      UPDATE games 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    
    const info = stmt.run(status, id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const updatedGame = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
    res.json(updatedGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE a game
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM games WHERE id = ?');
    const info = stmt.run(id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

module.exports = router;

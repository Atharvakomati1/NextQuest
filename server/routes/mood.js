const express = require('express');
const router = express.Router();
const db = require('../db/database');

const moodMap = {
  'chill': ['casual', 'story', 'indie'],
  'competitive': ['fps', 'fighting', 'sports'],
  'quick': ['short', 'arcade', 'puzzle'],
  'lost': ['rpg', 'open-world', 'adventure']
};

// GET random backlog game based on mood
router.get('/:mood', (req, res) => {
  try {
    const { mood } = req.params;
    
    let tags = [];
    // If it's a predefined mood, use those tags, otherwise use the mood itself as a tag
    if (moodMap[mood]) {
      tags = moodMap[mood];
    } else {
      tags = [mood];
    }

    // SQLite doesn't have a simple array intersection, so we construct a LIKE query
    // e.g., mood_tags LIKE '%casual%' OR mood_tags LIKE '%story%' ...
    const conditions = tags.map(() => `mood_tags LIKE ?`).join(' OR ');
    const params = tags.map(tag => `%${tag}%`);
    
    const query = `
      SELECT * FROM games 
      WHERE (${conditions})
      ORDER BY CASE WHEN status = 'backlog' THEN 1 ELSE 0 END DESC, RANDOM() 
      LIMIT 1
    `;
    
    const game = db.prepare(query).get(...params);
    
    if (!game) {
      return res.status(404).json({ error: 'No games match this vibe' });
    }
    
    res.json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch mood suggestion' });
  }
});

module.exports = router;

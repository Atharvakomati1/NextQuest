require('dotenv').config();
const express = require('express');
const path = require('path');

const db = require('./db/database'); // Ensure DB is initialized
const gamesRoutes = require('./routes/games');
const moodRoutes = require('./routes/mood');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/games', gamesRoutes);
app.use('/api/mood', moodRoutes);

// Stats API route
app.get('/api/stats', (req, res) => {
  try {
    const counts = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM games 
      GROUP BY status
    `).all();
    
    const topPlatformRow = db.prepare(`
      SELECT platform, COUNT(*) as count 
      FROM games 
      WHERE platform IS NOT NULL AND platform != '' 
      GROUP BY platform 
      ORDER BY count DESC 
      LIMIT 1
    `).get();

    const totalCount = db.prepare(`SELECT COUNT(*) as count FROM games`).get().count;

    const stats = {
      total: totalCount,
      backlog: 0,
      playing: 0,
      completed: 0,
      topPlatform: topPlatformRow ? topPlatformRow.platform : 'None'
    };

    counts.forEach(row => {
      if (stats[row.status] !== undefined) {
        stats[row.status] = row.count;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

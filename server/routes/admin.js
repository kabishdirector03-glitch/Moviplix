const express = require('express');
const router = express.Router();
const { AdminAuth, MovieQueries, db } = require('../db');

/**
 * POST /api/admin/login
 * Username: Moviplix
 * Password: moviplix@admin
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  const result = AdminAuth.verify(username, password);
  if (!result.success) {
    return res.status(401).json(result);
  }

  res.json({
    success: true,
    token: result.token,
    username: result.username,
    message: 'Welcome to Moviplix Admin Studio'
  });
});

/**
 * GET /api/admin/verify
 */
router.get('/verify', (req, res) => {
  const token = req.headers['x-admin-token'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const isValid = AdminAuth.validateToken(token);
  res.json({ authenticated: isValid, username: isValid ? 'Moviplix' : null });
});

/**
 * POST /api/admin/logout
 */
router.post('/logout', (req, res) => {
  const token = req.headers['x-admin-token'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  AdminAuth.logout(token);
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * POST /api/admin/clear-all
 * Reset database to completely empty fresh start (0 movies)
 */
router.post('/clear-all', (req, res) => {
  try {
    MovieQueries.clearAllData();
    res.json({ success: true, message: 'Database wiped clean. Fresh start with 0 movies.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/stats
 * Full analytics overview for the admin dashboard
 */
router.get('/stats', (req, res) => {
  try {
    const totalMovies = db.prepare('SELECT COUNT(*) as count FROM movies').get().count;
    const driveMovies = db.prepare('SELECT COUNT(*) as count FROM movies WHERE is_drive = 1').get().count;
    const featuredMovies = db.prepare('SELECT COUNT(*) as count FROM movies WHERE is_featured = 1').get().count;
    const trendingMovies = db.prepare('SELECT COUNT(*) as count FROM movies WHERE is_trending = 1').get().count;
    const top10Count = db.prepare('SELECT COUNT(*) as count FROM movies WHERE top_10_rank > 0').get().count;
    const totalViews = db.prepare('SELECT SUM(views) as views FROM movies').get().views || 0;
    const categories = db.prepare('SELECT category, COUNT(*) as count FROM movies GROUP BY category').all();

    res.json({
      totalMovies,
      driveMovies,
      featuredMovies,
      trendingMovies,
      top10Count,
      totalViews,
      categories
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

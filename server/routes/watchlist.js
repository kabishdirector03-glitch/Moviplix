const express = require('express');
const router = express.Router();
const { WatchlistQueries, ContinueWatchingQueries, MovieQueries } = require('../db');
const { resolveVideoSource } = require('../driveHelper');

function formatMovie(m) {
  if (!m) return null;
  return {
    ...m,
    is_drive: Boolean(m.is_drive),
    is_featured: Boolean(m.is_featured),
    is_trending: Boolean(m.is_trending),
    genres: safeJsonParse(m.genres, []),
    languages: safeJsonParse(m.languages, []),
    cast: safeJsonParse(m.cast, []),
    videoResolved: resolveVideoSource(m.video_url)
  };
}

function safeJsonParse(val, fallback) {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

// GET all watchlist items
router.get('/', (req, res) => {
  try {
    const list = WatchlistQueries.getAll();
    res.json(list.map(formatMovie));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if a specific movie is in watchlist
router.get('/check/:movieId', (req, res) => {
  try {
    const inWatchlist = WatchlistQueries.has(req.params.movieId);
    res.json({ inWatchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle watchlist status
router.post('/toggle/:movieId', (req, res) => {
  try {
    const movieId = req.params.movieId;
    const movie = MovieQueries.getById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const result = WatchlistQueries.toggle(movieId);
    res.json({ success: true, inWatchlist: result.inWatchlist, movieId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET continue watching items
router.get('/continue', (req, res) => {
  try {
    const items = ContinueWatchingQueries.getAll();
    res.json(items.map(m => ({
      ...formatMovie(m),
      progress_seconds: m.progress_seconds,
      duration_seconds: m.duration_seconds,
      percentage: m.duration_seconds > 0 ? Math.min(100, Math.round((m.progress_seconds / m.duration_seconds) * 100)) : 0
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save playback progress
router.post('/progress', (req, res) => {
  try {
    const { movieId, progressSeconds, durationSeconds } = req.body;
    if (!movieId) {
      return res.status(400).json({ error: 'movieId is required' });
    }
    ContinueWatchingQueries.updateProgress(movieId, progressSeconds || 0, durationSeconds || 0);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from continue watching
router.delete('/continue/:movieId', (req, res) => {
  try {
    ContinueWatchingQueries.remove(req.params.movieId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

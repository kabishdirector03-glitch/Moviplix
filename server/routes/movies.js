const express = require('express');
const router = express.Router();
const { MovieQueries } = require('../db');
const { resolveVideoSource } = require('../driveHelper');

/**
 * Format movie object for JSON client consumption
 */
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
    if (typeof val === 'string') {
      return val.split(',').map(s => s.trim());
    }
    return fallback;
  }
}

/**
 * GET /api/movies - Query movies with filters
 */
router.get('/', (req, res) => {
  try {
    const { category, genre, language, search, featured, trending, top10, limit } = req.query;

    const filter = {
      category,
      genre,
      language,
      search,
      is_featured: featured === 'true',
      is_trending: trending === 'true',
      top10: top10 === 'true',
      limit: limit ? parseInt(limit, 10) : undefined
    };

    const movies = MovieQueries.getAll(filter);
    res.json(movies.map(formatMovie));
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/movies/curated - Curated feed for home page
 * In home page only show Top 10 and Trending Now as requested
 */
router.get('/curated', (req, res) => {
  try {
    const all = MovieQueries.getAll().map(formatMovie);

    const featured = all.filter(m => m.is_featured);
    const top10 = all.filter(m => m.top_10_rank > 0).sort((a, b) => a.top_10_rank - b.top_10_rank);
    const trending = all.filter(m => m.is_trending);

    res.json({
      featured: featured.length ? featured : all.slice(0, 5),
      trays: [
        {
          id: 'top10',
          title: 'Top 10 Today',
          badge: 'TOP 10',
          isTop10: true,
          items: top10
        },
        {
          id: 'trending',
          title: 'Trending Now',
          items: trending
        }
      ]
    });
  } catch (err) {
    console.error('Error fetching curated feed:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/movies/:id - Get movie details and increment view count
 */
router.get('/:id', (req, res) => {
  try {
    const movie = MovieQueries.getById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Increment view counter asynchronously
    MovieQueries.incrementViews(movie.id);

    // Fetch related movies based on primary genre
    const parsedMovie = formatMovie(movie);
    const primaryGenre = parsedMovie.genres[0];
    const related = MovieQueries.getAll({ genre: primaryGenre, limit: 6 })
      .filter(m => m.id !== movie.id)
      .map(formatMovie);

    res.json({
      ...parsedMovie,
      related
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/movies - Add a new movie (with Google Drive or direct stream)
 */
router.post('/', (req, res) => {
  try {
    const {
      title,
      description,
      poster_url,
      backdrop_url,
      video_url,
      trailer_url,
      duration,
      release_year,
      rating,
      imdb_rating,
      genres,
      languages,
      cast,
      director,
      category,
      is_featured,
      is_trending,
      top_10_rank
    } = req.body;

    if (!title || !video_url) {
      return res.status(400).json({ error: 'Title and video_url (Drive link or direct URL) are required' });
    }

    const created = MovieQueries.create({
      title,
      description,
      poster_url: poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
      backdrop_url: backdrop_url || poster_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
      video_url,
      trailer_url: trailer_url || video_url,
      duration: duration || '2h 15m',
      release_year: release_year ? parseInt(release_year, 10) : new Date().getFullYear(),
      rating: rating || 'U/A 13+',
      imdb_rating: imdb_rating ? parseFloat(imdb_rating) : 8.0,
      genres: Array.isArray(genres) ? JSON.stringify(genres) : (genres || '["Action", "Drama"]'),
      languages: Array.isArray(languages) ? JSON.stringify(languages) : (languages || '["Hindi", "English"]'),
      cast: Array.isArray(cast) ? JSON.stringify(cast) : (cast || '[]'),
      director: director || 'Director',
      category: category || 'movie',
      is_featured: Boolean(is_featured),
      is_trending: Boolean(is_trending),
      top_10_rank: top_10_rank ? parseInt(top_10_rank, 10) : 0,
      views: 1200
    });

    res.status(201).json(formatMovie(created));
  } catch (err) {
    console.error('Error creating movie:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/movies/:id - Update movie
 */
router.put('/:id', (req, res) => {
  try {
    const updated = MovieQueries.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(formatMovie(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/movies/:id - Delete movie
 */
router.delete('/:id', (req, res) => {
  try {
    MovieQueries.delete(req.params.id);
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/movies/reset - Reset sample library
 */
router.post('/reset', (req, res) => {
  try {
    MovieQueries.resetDatabase();
    res.json({ success: true, message: 'Database reset to default blockbuster catalogue' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

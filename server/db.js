const Database = require('better-sqlite3');
const path = require('path');
const { extractDriveId, resolveVideoSource } = require('./driveHelper');

const dbPath = path.join(__dirname, 'moviplix.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance & sub-millisecond query response
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Initialize schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT,
      poster_url TEXT,
      backdrop_url TEXT,
      trailer_url TEXT,
      video_url TEXT,
      drive_file_id TEXT,
      is_drive INTEGER DEFAULT 0,
      duration TEXT,
      release_year INTEGER,
      rating TEXT,
      imdb_rating REAL,
      genres TEXT,
      languages TEXT,
      cast TEXT,
      director TEXT,
      category TEXT DEFAULT 'movie',
      is_featured INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      top_10_rank INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL UNIQUE,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS continue_watching (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL UNIQUE,
      progress_seconds REAL DEFAULT 0,
      duration_seconds REAL DEFAULT 0,
      last_watched DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_movies_trending ON movies (is_trending);
    CREATE INDEX IF NOT EXISTS idx_movies_featured ON movies (is_featured);
    CREATE INDEX IF NOT EXISTS idx_movies_top10 ON movies (top_10_rank);
    CREATE INDEX IF NOT EXISTS idx_movies_category ON movies (category);
  `);
}

// Clear all data for fresh start (Zero sample data)
function clearAllData() {
  db.exec(`
    DELETE FROM movies;
    DELETE FROM watchlist;
    DELETE FROM continue_watching;
    DELETE FROM admin_sessions;
  `);
  console.log('[DB] Database wiped clean for a fresh start with 0 sample data.');
}

// Database helper queries (Ultra-fast synchronous queries)
const MovieQueries = {
  getAll: (filter = {}) => {
    let query = 'SELECT * FROM movies WHERE 1=1';
    const params = [];

    if (filter.category) {
      query += ' AND category = ?';
      params.push(filter.category);
    }
    if (filter.is_featured) {
      query += ' AND is_featured = 1';
    }
    if (filter.is_trending) {
      query += ' AND is_trending = 1';
    }
    if (filter.top10) {
      query += ' AND top_10_rank > 0 ORDER BY top_10_rank ASC';
      return db.prepare(query).all(...params);
    }
    if (filter.genre) {
      query += ' AND genres LIKE ?';
      params.push(`%"${filter.genre}"%`);
    }
    if (filter.language) {
      query += ' AND languages LIKE ?';
      params.push(`%"${filter.language}"%`);
    }
    if (filter.search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR cast LIKE ? OR director LIKE ?)';
      const s = `%${filter.search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY id DESC';
    if (filter.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);
    }

    return db.prepare(query).all(...params);
  },

  getById: (id) => {
    return db.prepare('SELECT * FROM movies WHERE id = ?').get(id);
  },

  getBySlug: (slug) => {
    return db.prepare('SELECT * FROM movies WHERE slug = ?').get(slug);
  },

  create: (data) => {
    const videoRes = resolveVideoSource(data.video_url);
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
    
    const stmt = db.prepare(`
      INSERT INTO movies (
        title, slug, description, poster_url, backdrop_url, trailer_url, video_url,
        drive_file_id, is_drive, duration, release_year, rating, imdb_rating,
        genres, languages, cast, director, category, is_featured, is_trending,
        top_10_rank, views
      ) VALUES (
        @title, @slug, @description, @poster_url, @backdrop_url, @trailer_url, @video_url,
        @drive_file_id, @is_drive, @duration, @release_year, @rating, @imdb_rating,
        @genres, @languages, @cast, @director, @category, @is_featured, @is_trending,
        @top_10_rank, @views
      )
    `);

    const result = stmt.run({
      title: data.title,
      slug,
      description: data.description || '',
      poster_url: data.poster_url || '',
      backdrop_url: data.backdrop_url || data.poster_url || '',
      trailer_url: data.trailer_url || data.video_url || '',
      video_url: data.video_url || '',
      drive_file_id: videoRes.driveId,
      is_drive: videoRes.isDrive ? 1 : 0,
      duration: data.duration || '2h 15m',
      release_year: data.release_year || new Date().getFullYear(),
      rating: data.rating || 'U/A 13+',
      imdb_rating: data.imdb_rating || 8.0,
      genres: typeof data.genres === 'string' ? data.genres : JSON.stringify(data.genres || ['Action']),
      languages: typeof data.languages === 'string' ? data.languages : JSON.stringify(data.languages || ['Hindi', 'English']),
      cast: typeof data.cast === 'string' ? data.cast : JSON.stringify(data.cast || []),
      director: data.director || '',
      category: data.category || 'movie',
      is_featured: data.is_featured ? 1 : 0,
      is_trending: data.is_trending ? 1 : 0,
      top_10_rank: data.top_10_rank || 0,
      views: data.views || 0
    });

    return db.prepare('SELECT * FROM movies WHERE id = ?').get(result.lastInsertRowid);
  },

  update: (id, data) => {
    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(id);
    if (!movie) return null;

    const videoRes = data.video_url ? resolveVideoSource(data.video_url) : { driveId: movie.drive_file_id, isDrive: movie.is_drive };

    const stmt = db.prepare(`
      UPDATE movies SET
        title = COALESCE(@title, title),
        description = COALESCE(@description, description),
        poster_url = COALESCE(@poster_url, poster_url),
        backdrop_url = COALESCE(@backdrop_url, backdrop_url),
        trailer_url = COALESCE(@trailer_url, trailer_url),
        video_url = COALESCE(@video_url, video_url),
        drive_file_id = @drive_file_id,
        is_drive = @is_drive,
        duration = COALESCE(@duration, duration),
        release_year = COALESCE(@release_year, release_year),
        rating = COALESCE(@rating, rating),
        imdb_rating = COALESCE(@imdb_rating, imdb_rating),
        genres = COALESCE(@genres, genres),
        languages = COALESCE(@languages, languages),
        [cast] = COALESCE(@cast, [cast]),
        director = COALESCE(@director, director),
        category = COALESCE(@category, category),
        is_featured = COALESCE(@is_featured, is_featured),
        is_trending = COALESCE(@is_trending, is_trending),
        top_10_rank = COALESCE(@top_10_rank, top_10_rank)
      WHERE id = @id
    `);

    stmt.run({
      id,
      title: data.title ?? movie.title,
      description: data.description ?? movie.description,
      poster_url: data.poster_url ?? movie.poster_url,
      backdrop_url: data.backdrop_url ?? movie.backdrop_url,
      trailer_url: data.trailer_url ?? movie.trailer_url,
      video_url: data.video_url ?? movie.video_url,
      drive_file_id: videoRes.driveId,
      is_drive: videoRes.isDrive ? 1 : 0,
      duration: data.duration ?? movie.duration,
      release_year: data.release_year ?? movie.release_year,
      rating: data.rating ?? movie.rating,
      imdb_rating: data.imdb_rating ?? movie.imdb_rating,
      genres: data.genres ? (typeof data.genres === 'string' ? data.genres : JSON.stringify(data.genres)) : movie.genres,
      languages: data.languages ? (typeof data.languages === 'string' ? data.languages : JSON.stringify(data.languages)) : movie.languages,
      cast: data.cast ? (typeof data.cast === 'string' ? data.cast : JSON.stringify(data.cast)) : movie.cast,
      director: data.director ?? movie.director,
      category: data.category ?? movie.category,
      is_featured: data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : movie.is_featured,
      is_trending: data.is_trending !== undefined ? (data.is_trending ? 1 : 0) : movie.is_trending,
      top_10_rank: data.top_10_rank !== undefined ? data.top_10_rank : movie.top_10_rank
    });

    return db.prepare('SELECT * FROM movies WHERE id = ?').get(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM movies WHERE id = ?').run(id);
  },

  incrementViews: (id) => {
    db.prepare('UPDATE movies SET views = views + 1 WHERE id = ?').run(id);
  },

  clearAllData
};

const WatchlistQueries = {
  getAll: () => {
    return db.prepare(`
      SELECT m.*, w.added_at 
      FROM watchlist w
      JOIN movies m ON w.movie_id = m.id
      ORDER BY w.added_at DESC
    `).all();
  },

  has: (movieId) => {
    const row = db.prepare('SELECT id FROM watchlist WHERE movie_id = ?').get(movieId);
    return Boolean(row);
  },

  toggle: (movieId) => {
    const exists = db.prepare('SELECT id FROM watchlist WHERE movie_id = ?').get(movieId);
    if (exists) {
      db.prepare('DELETE FROM watchlist WHERE movie_id = ?').run(movieId);
      return { inWatchlist: false };
    } else {
      db.prepare('INSERT INTO watchlist (movie_id) VALUES (?)').run(movieId);
      return { inWatchlist: true };
    }
  }
};

const ContinueWatchingQueries = {
  getAll: () => {
    return db.prepare(`
      SELECT m.*, c.progress_seconds, c.duration_seconds, c.last_watched
      FROM continue_watching c
      JOIN movies m ON c.movie_id = m.id
      ORDER BY c.last_watched DESC
      LIMIT 10
    `).all();
  },

  updateProgress: (movieId, progressSeconds, durationSeconds) => {
    const stmt = db.prepare(`
      INSERT INTO continue_watching (movie_id, progress_seconds, duration_seconds, last_watched)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(movie_id) DO UPDATE SET
        progress_seconds = excluded.progress_seconds,
        duration_seconds = excluded.duration_seconds,
        last_watched = CURRENT_TIMESTAMP
    `);
    return stmt.run(movieId, progressSeconds, durationSeconds);
  },

  remove: (movieId) => {
    return db.prepare('DELETE FROM continue_watching WHERE movie_id = ?').run(movieId);
  }
};

// Admin Auth Helper (Username: Moviplix | Password: moviplix@admin)
const AdminAuth = {
  verify: (username, password) => {
    if (username === 'Moviplix' && password === 'moviplix@admin') {
      const token = 'moviplix_adm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      db.prepare('INSERT INTO admin_sessions (token, username) VALUES (?, ?)').run(token, username);
      return { success: true, token, username: 'Moviplix' };
    }
    return { success: false, error: 'Invalid admin username or password' };
  },

  validateToken: (token) => {
    if (!token) return false;
    const session = db.prepare('SELECT * FROM admin_sessions WHERE token = ?').get(token);
    return Boolean(session);
  },

  logout: (token) => {
    if (token) {
      db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    }
    return true;
  }
};

initSchema();

// Note: No sample data seeded. Starts completely empty for user-driven control via the Admin Panel.

module.exports = {
  db,
  MovieQueries,
  WatchlistQueries,
  ContinueWatchingQueries,
  AdminAuth
};

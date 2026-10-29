const express = require('express');
const cors = require('cors');
const path = require('path');
const { MovieQueries, db } = require('./db');

const moviesRouter = require('./routes/movies');
const streamRouter = require('./routes/stream');
const watchlistRouter = require('./routes/watchlist');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Performance timing middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  // Intercept writeHead or log response time
  const origWriteHead = res.writeHead;
  res.writeHead = function(...args) {
    const diff = process.hrtime(start);
    const ms = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${ms}ms`);
    }
    return origWriteHead.apply(this, args);
  };
  next();
});

// API Routes
app.use('/api/movies', moviesRouter);
app.use('/api/stream', streamRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/admin', adminRouter);

// System Stats & Lightning-speed benchmark endpoint
app.get('/api/stats', (req, res) => {
  const start = process.hrtime();
  const totalMovies = db.prepare('SELECT COUNT(*) as count FROM movies').get().count;
  const driveMovies = db.prepare('SELECT COUNT(*) as count FROM movies WHERE is_drive = 1').get().count;
  const totalViews = db.prepare('SELECT SUM(views) as total FROM movies').get().total || 0;
  const topCategories = db.prepare('SELECT category, COUNT(*) as count FROM movies GROUP BY category').all();
  const diff = process.hrtime(start);
  const dbLatencyMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

  res.json({
    app: 'Moviplix Streaming Engine',
    version: '1.0.0',
    status: 'online',
    dbLatency: `${dbLatencyMs}ms`,
    speed: 'Lightning Fast (SQLite WAL Mode)',
    totalMovies,
    driveMovies,
    totalViews,
    topCategories
  });
});

// Serve frontend build if present in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback for client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Moviplix API</title></head>
          <body style="background:#0f1014;color:#fff;font-family:sans-serif;padding:2rem;">
            <h1>Moviplix Backend API is Running</h1>
            <p>Access the Vite development server on <a href="http://localhost:5173" style="color:#0084ff">http://localhost:5173</a> or run <code>npm run build</code></p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Moviplix Backend] Server running on http://localhost:${PORT}`);
  console.log(`[Moviplix Backend] Database initialized with WAL mode for ultra-fast response`);
});

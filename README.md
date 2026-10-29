# 🎬 MOVIPLIX - Jio-Hotstar Streaming Web Platform

A lightning-speed full-stack streaming web application built with the signature aesthetic of **JioCinema & Disney+ Hotstar**, featuring direct **Google Drive cloud video integration**, a dedicated **Admin Panel**, and an ultra-fast **SQLite (WAL mode)** database.

---

## 🔐 Admin Panel Credentials

All movie additions, edits, rank adjustments, and stream configurations are controlled from the **Admin Studio**:

- **Username**: `Moviplix`
- **Password**: `moviplix@admin`

---

## ⚡ Key Highlights & Features

### 🌟 1. Small Bar Edition in Nav Bar (Hotstar Signature Strip)
- **Region / Edition Selector**: `🇮🇳 India Edition (IN)` • `🌐 Global Edition` • `👑 VIP Ultra 4K Edition`.
- **Quick Language Switcher**: `All` • `Hindi` • `English` • `Tamil` • `Telugu` pills.
- **Live Ticker**: `⚡ Google Drive Cloud Streaming Enabled • Ultra HD 4K`.
- **Admin Status Indicator**: Real-time status showing `Admin: Moviplix` with live green pulse or login lock.
- **Engine Speed**: Displays live SQLite WAL query response time (`< 1ms`).

---

### 🛡️ 2. Comprehensive Admin Studio (All Changes Here)
- **Fresh Start Ready**: Zero pre-loaded sample data. The database starts completely empty for your custom catalogue.
- **Google Drive Integration**:
  - Paste any Google Drive link or File ID.
  - Interactive **"Verify Drive"** tester checks ID and displays preview iframe before saving.
  - Dual playback: Drive Preview Cinema Player & direct HTTP 206 range stream proxy.
- **Movie Management**:
  - Search and filter all titles.
  - 1-click toggles: **Hero Spotlight Billboard**, **Trending Tray**, **Top 10 Rank (1-10)**.
  - Edit full metadata: title, synopsis, duration, rating, IMDb score, audio languages, cast, director, posters.
  - Instant deletion with database cleanup.
- **Database Tools**:
  - Single-click **"Wipe All Movies (Fresh Start)"** button.
  - Performance latency monitoring.

---

### 🎥 3. Hotstar Cinema Video Player
- Custom dark theater interface with ambient backdrop glow.
- **Controls**:
  - Play / Pause (`Space` or click)
  - 10s Rewind (`J` or `←`) / 10s Fast Forward (`L` or `→`)
  - Volume slider with mute toggle (`M`)
  - Playback speed (`0.5x`, `0.75x`, `1x`, `1.25x`, `1.5x`, `2x`)
  - Audio language selector (`Hindi`, `English`, `Tamil`, `Telugu`, etc.)
  - Fullscreen toggle (`F`)
  - Automatic progress reporting every 5s for the "Continue Watching" tray.

---

## 🚀 Running the App

The application is running live on:
👉 **[http://localhost:5000](http://localhost:5000)**

### Quick Commands:
```bash
# Production server (API + built client):
npm start

# Development mode (Hot-reload Vite + Server):
npm run dev
```

---

## 📂 Project Structure

```
Moviplix/
├── client/                     # Vite + React + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Jio-Hotstar navbar + Small Bar Edition
│   │   │   ├── AdminPanel.jsx        # Dedicated Admin Panel (Moviplix / moviplix@admin)
│   │   │   ├── HeroBillboard.jsx     # Spotlight carousel
│   │   │   ├── Top10Tray.jsx         # Giant 1-10 ranking tray
│   │   │   ├── ContentTray.jsx       # Category trays
│   │   │   ├── MovieCard.jsx         # Hotstar hover-scale card
│   │   │   ├── VideoPlayerModal.jsx  # Cinema theater player (Drive + HTML5)
│   │   │   ├── MovieDetailsModal.jsx # Rich movie details & recommendations
│   │   │   ├── SearchOverlay.jsx     # Instant live search (Ctrl + K)
│   │   │   └── WatchlistPage.jsx     # "My Space" watchlist & progress
│   │   ├── services/
│   │   │   └── api.js                # API & Admin client
│   │   └── App.jsx                   # Main application router
│   └── dist/                         # Production build
│
├── server/                     # High-Speed Node.js Backend
│   ├── db.js                   # SQLite WAL database & Admin authentication
│   ├── driveHelper.js          # Google Drive link parser & resolver
│   ├── moviplix.db             # Ultra-fast SQLite database file
│   ├── routes/
│   │   ├── admin.js            # Admin authentication & stats routes
│   │   ├── movies.js           # Curated feeds, filters, CRUD
│   │   ├── stream.js           # Drive resolver & HTTP Range stream proxy
│   │   └── watchlist.js        # Watchlist & playback progress
│   └── index.js                # Express server with timing & static serving
│
└── package.json
```

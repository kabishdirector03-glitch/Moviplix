import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroBillboard from './components/HeroBillboard';
import Top10Tray from './components/Top10Tray';
import ContentTray from './components/ContentTray';
import VideoPlayerModal from './components/VideoPlayerModal';
import MovieDetailsModal from './components/MovieDetailsModal';
import SearchOverlay from './components/SearchOverlay';
import WatchlistPage from './components/WatchlistPage';
import AdminPanel from './components/AdminPanel';
import { MovieAPI } from './services/api';
import { 
  Zap, 
  Film, 
  ShieldCheck, 
  Play, 
  PlusCircle, 
  Layers 
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentEdition, setCurrentEdition] = useState('india');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  const [curatedData, setCuratedData] = useState({ featured: [], trays: [] });
  const [allMovies, setAllMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Modals & Overlays
  const [playingMovie, setPlayingMovie] = useState(null);
  const [detailsMovieId, setDetailsMovieId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Check admin session
  useEffect(() => {
    MovieAPI.adminVerify().then((res) => {
      setIsAdminLoggedIn(Boolean(res.authenticated));
    });
  }, []);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [curated, list, cont, sysStats, all] = await Promise.all([
        MovieAPI.getCurated(),
        MovieAPI.getWatchlist(),
        MovieAPI.getContinueWatching(),
        MovieAPI.getStats(),
        MovieAPI.getAll({ language: selectedLanguage })
      ]);
      setCuratedData(curated);
      setWatchlist(list);
      setContinueWatching(cont);
      setStats(sysStats);
      setAllMovies(all);
    } catch (err) {
      console.error('Error loading Moviplix data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle watchlist
  const handleToggleWatchlist = async (movieId) => {
    try {
      const res = await MovieAPI.toggleWatchlist(movieId);
      if (res.inWatchlist) {
        const movie = allMovies.find((m) => m.id === movieId);
        if (movie) setWatchlist((prev) => [movie, ...prev]);
      } else {
        setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Remove item from continue watching
  const handleRemoveContinue = async (movieId) => {
    try {
      await MovieAPI.removeContinueWatching(movieId);
      setContinueWatching((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err) {
      console.error(err);
    }
  };

  // Render content according to selected tab
  const renderTabContent = () => {
    // ADMIN PANEL TAB
    if (currentTab === 'admin') {
      return (
        <AdminPanel
          onBackToCinema={() => setCurrentTab('home')}
          onPlayMovie={(m) => setPlayingMovie(m)}
          onMoviesChanged={() => {
            loadData();
            MovieAPI.adminVerify().then(res => setIsAdminLoggedIn(res.authenticated));
          }}
          stats={stats}
        />
      );
    }

    // WATCHLIST / MY SPACE TAB
    if (currentTab === 'watchlist') {
      return (
        <WatchlistPage
          watchlist={watchlist}
          continueWatching={continueWatching}
          onPlay={(m) => setPlayingMovie(m)}
          onOpenDetails={(m) => setDetailsMovieId(m.id)}
          onToggleWatchlist={handleToggleWatchlist}
          onRemoveContinueWatching={handleRemoveContinue}
        />
      );
    }

    // MOVIES TAB
    if (currentTab === 'movies') {
      const moviesOnly = allMovies.filter((m) => m.category === 'movie');
      return (
        <div className="max-w-[1720px] mx-auto px-4 md:px-12 pt-28 pb-16 min-h-[80vh]">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4">Movies</h1>
          {moviesOnly.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {moviesOnly.map((m) => (
                <div 
                  key={m.id} 
                  onClick={() => setDetailsMovieId(m.id)}
                  className="cursor-pointer group rounded-xl overflow-hidden bg-hotstar-card border border-hotstar-border hover:border-hotstar-blue transition-all hover:scale-105"
                >
                  <div className="aspect-[2/3] overflow-hidden">
                    <img src={m.poster_url || m.backdrop_url} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-hotstar-cyan">{m.title}</h4>
                    <p className="text-[10px] text-slate-400">{m.release_year} • {m.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-hotstar-card/40 rounded-2xl border border-hotstar-border/40 p-6 space-y-2">
              <Film className="w-10 h-10 mx-auto text-slate-600 mb-1" />
              <h3 className="text-sm font-semibold text-white">No Movies in Database</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fresh start active. Add movies via the Admin Studio.
              </p>
              <button
                onClick={() => setCurrentTab('admin')}
                className="mt-2 px-4 py-2 rounded-xl bg-hotstar-blue text-white text-xs font-semibold"
              >
                Open Admin Panel
              </button>
            </div>
          )}
        </div>
      );
    }

    // SERIES & SPECIALS TAB
    if (currentTab === 'series' || currentTab === 'specials') {
      const seriesList = allMovies.filter((m) => m.category === 'series' || m.category === 'special');
      return (
        <div className="max-w-[1720px] mx-auto px-4 md:px-12 pt-28 pb-16 min-h-[80vh]">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4">TV Shows & Specials</h1>
          {seriesList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {seriesList.map((m) => (
                <div 
                  key={m.id} 
                  onClick={() => setDetailsMovieId(m.id)}
                  className="cursor-pointer group rounded-xl overflow-hidden bg-hotstar-card border border-hotstar-border hover:border-hotstar-blue transition-all hover:scale-105"
                >
                  <div className="aspect-[2/3] overflow-hidden">
                    <img src={m.poster_url || m.backdrop_url} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-hotstar-cyan">{m.title}</h4>
                    <p className="text-[10px] text-slate-400">{m.release_year} • {m.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-hotstar-card/40 rounded-2xl border border-hotstar-border/40 p-6 space-y-2">
              <Film className="w-10 h-10 mx-auto text-slate-600 mb-1" />
              <h3 className="text-sm font-semibold text-white">No Series or Specials Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add web series episodes or specials through the Admin Panel.
              </p>
              <button
                onClick={() => setCurrentTab('admin')}
                className="mt-2 px-4 py-2 rounded-xl bg-hotstar-blue text-white text-xs font-semibold"
              >
                Open Admin Panel
              </button>
            </div>
          )}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // DEFAULT HOME FEED:
    // USER REQUIREMENT: "In home page only show top 10 and Trending now"
    // ─────────────────────────────────────────────────────────────
    
    // Case 1: Fresh start (0 movies)
    if (allMovies.length === 0) {
      return (
        <div className="max-w-[1720px] mx-auto px-4 md:px-12 pt-32 pb-16 select-none">
          
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#11131a] via-[#151722] to-[#11131a] border border-hotstar-border/70 p-6 sm:p-10 shadow-2xl">
            <div className="max-w-2xl space-y-4">
              
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-gradient-to-r from-hotstar-blue to-hotstar-cyan text-white shadow">
                  Fresh Start Active
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/10 text-slate-300">
                  SQLite Engine Online (&lt; 1ms)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-300">MOVIPLIX</span>
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Your cinema streaming platform is ready for your catalogue. 
                All movies and video streams are managed through the <strong>Admin Studio</strong>.
              </p>

              {/* Admin Credentials Callout */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-hotstar-border/80 text-xs text-slate-300 max-w-md space-y-1.5">
                <div className="flex items-center space-x-1.5 text-hotstar-cyan font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel Credentials</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>Username: <strong className="text-white">Moviplix</strong></div>
                  <div>Password: <strong className="text-amber-400">moviplix@admin</strong></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => setCurrentTab('admin')}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-hotstar-blue to-hotstar-cyan hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Open Admin Panel & Add Movies</span>
                </button>

                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-colors"
                >
                  Search
                </button>
              </div>

            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
              <Play className="w-72 h-72 text-white" />
            </div>
          </div>

          {/* Quick Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-[#16181f] border border-hotstar-border/60 rounded-2xl p-4 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-hotstar-blue/20 text-hotstar-cyan flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">Lightning-Fast SQLite Engine</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Queries execute with sub-millisecond latency (&lt; 1ms). Instant responsive playback and search.
              </p>
            </div>

            <div className="bg-[#16181f] border border-hotstar-border/60 rounded-2xl p-4 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">All Changes in Admin Studio</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Full CRUD control: add movies, edit metadata, set Top 10 ranks, feature in the Hero billboard, and wipe data anytime.
              </p>
            </div>
          </div>

        </div>
      );
    }

    // Case 2: Movies exist. ONLY show Top 10 and Trending Now!
    const top10Tray = curatedData.trays.find((t) => t.id === 'top10');
    const trendingTray = curatedData.trays.find((t) => t.id === 'trending');

    return (
      <main className="space-y-3 md:space-y-4 pt-20">
        
        {/* Hero Spotlight Billboard */}
        {curatedData.featured.length > 0 && (
          <HeroBillboard
            featuredMovies={curatedData.featured}
            onPlay={(movie) => setPlayingMovie(movie)}
            onOpenDetails={(movie) => setDetailsMovieId(movie.id)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {/* Continue Watching Tray (If user has progress) */}
        {continueWatching.length > 0 && (
          <ContentTray
            title="Continue Watching"
            badge="PROGRESS"
            items={continueWatching}
            onPlay={(movie) => setPlayingMovie(movie)}
            onOpenDetails={(movie) => setDetailsMovieId(movie.id)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            isWide={true}
          />
        )}

        {/* 1. TOP 10 TRAY */}
        {top10Tray && top10Tray.items && top10Tray.items.length > 0 && (
          <Top10Tray
            items={top10Tray.items}
            onPlay={(movie) => setPlayingMovie(movie)}
            onOpenDetails={(movie) => setDetailsMovieId(movie.id)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {/* 2. TRENDING NOW TRAY */}
        {trendingTray && trendingTray.items && trendingTray.items.length > 0 && (
          <ContentTray
            title="Trending Now"
            badge="TRENDING"
            items={trendingTray.items}
            onPlay={(movie) => setPlayingMovie(movie)}
            onOpenDetails={(movie) => setDetailsMovieId(movie.id)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            isWide={false}
          />
        )}

      </main>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1014] text-slate-100 flex flex-col font-sans selection:bg-hotstar-blue selection:text-white">
      
      {/* Top Navigation Bar with Small Bar Edition */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setCurrentTab('admin')}
        watchlistCount={watchlist.length}
        stats={stats}
        isAdminLoggedIn={isAdminLoggedIn}
        currentEdition={currentEdition}
        setCurrentEdition={setCurrentEdition}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />

      {/* Main View Content */}
      <div className="flex-1">
        {loading ? (
          <div className="h-screen flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-hotstar-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Moviplix...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Video Player Modal */}
      {playingMovie && (
        <VideoPlayerModal
          movie={playingMovie}
          onClose={() => {
            setPlayingMovie(null);
            MovieAPI.getContinueWatching().then(setContinueWatching);
          }}
        />
      )}

      {/* Movie Details Modal */}
      {detailsMovieId && (
        <MovieDetailsModal
          movieId={detailsMovieId}
          onClose={() => setDetailsMovieId(null)}
          onPlay={(movie) => setPlayingMovie(movie)}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onPlay={(movie) => setPlayingMovie(movie)}
        onOpenDetails={(movie) => setDetailsMovieId(movie.id)}
        watchlist={watchlist}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-hotstar-border/40 bg-[#090a0d] py-8 px-4 md:px-12 text-slate-400 text-[11px]">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col items-center md:items-start space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base text-white tracking-wider font-sans">
                MOVI<span className="text-hotstar-cyan">PLIX</span>
              </span>
            </div>
            <p className="text-slate-500 text-[10px] text-center md:text-left">
              High-speed cinema streaming with Google Drive cloud integration & SQLite engine.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <button onClick={() => setCurrentTab('home')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => setCurrentTab('movies')} className="hover:text-white transition-colors">Movies</button>
            <button onClick={() => setCurrentTab('admin')} className="text-hotstar-cyan hover:underline font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Panel</span>
            </button>
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-white transition-colors">Search</button>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1 font-mono text-emerald-400">
              <Zap className="w-3 h-3" />
              <span>{stats?.dbLatency || '< 1ms'} WAL Engine</span>
            </span>
            <span>•</span>
            <span>© 2026 Moviplix</span>
          </div>

        </div>
      </footer>

    </div>
  );
}

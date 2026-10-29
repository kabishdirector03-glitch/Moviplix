import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  HardDrive, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  Search, 
  Film, 
  Tv, 
  Check, 
  X,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { MovieAPI } from '../services/api';

export default function AdminPanel({ 
  onBackToCinema, 
  onPlayMovie, 
  onMoviesChanged, 
  stats 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin tabs: 'movies' | 'add' | 'settings'
  const [activeTab, setActiveTab] = useState('movies');

  // Movies list & search
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMovies, setLoadingMovies] = useState(true);

  // Form state for Add/Edit
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'movie',
    video_url: '',
    description: '',
    poster_url: '',
    backdrop_url: '',
    duration: '2h 15m',
    release_year: 2024,
    rating: 'U/A 16+',
    imdb_rating: 8.5,
    genres: 'Action, Thriller',
    languages: 'Hindi, English',
    cast: 'Lead Actor, Co-Star',
    director: 'Director Name',
    is_featured: true,
    is_trending: true,
    top_10_rank: 1,
  });

  const [testingDrive, setTestingDrive] = useState(false);
  const [driveTestResult, setDriveTestResult] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    MovieAPI.adminVerify().then((res) => {
      if (res.authenticated) {
        setIsAuthenticated(true);
        loadMovies();
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  const loadMovies = async () => {
    setLoadingMovies(true);
    try {
      const data = await MovieAPI.getAll();
      setMovies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      await MovieAPI.adminLogin(usernameInput.trim(), passwordInput.trim());
      setIsAuthenticated(true);
      loadMovies();
      onMoviesChanged?.();
    } catch (err) {
      setLoginError(err.message || 'Invalid username or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await MovieAPI.adminLogout();
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleTestDriveLink = async () => {
    if (!formData.video_url) {
      setFormError('Please enter a Google Drive link or video URL first.');
      return;
    }
    setTestingDrive(true);
    setFormError('');
    try {
      const res = await MovieAPI.resolveDrive(formData.video_url);
      setDriveTestResult(res);
      if (!res.valid) {
        setFormError(res.message || 'Could not parse Google Drive file ID.');
      }
    } catch (err) {
      setFormError('Error verifying Drive link: ' + err.message);
    } finally {
      setTestingDrive(false);
    }
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url) {
      setFormError('Title and Video URL / Drive link are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        ...formData,
        genres: typeof formData.genres === 'string' ? formData.genres.split(',').map((s) => s.trim()).filter(Boolean) : formData.genres,
        languages: typeof formData.languages === 'string' ? formData.languages.split(',').map((s) => s.trim()).filter(Boolean) : formData.languages,
        cast: typeof formData.cast === 'string' ? formData.cast.split(',').map((s) => s.trim()).filter(Boolean) : formData.cast,
      };

      if (editingMovieId) {
        await MovieAPI.update(editingMovieId, payload);
        setFormSuccess(`Movie "${formData.title}" updated successfully!`);
      } else {
        await MovieAPI.create(payload);
        setFormSuccess(`Movie "${formData.title}" added to Moviplix!`);
      }

      await loadMovies();
      onMoviesChanged?.();

      // Reset form if creating
      if (!editingMovieId) {
        setFormData({
          title: '',
          category: 'movie',
          video_url: '',
          description: '',
          poster_url: '',
          backdrop_url: '',
          duration: '2h 15m',
          release_year: 2024,
          rating: 'U/A 16+',
          imdb_rating: 8.5,
          genres: 'Action, Thriller',
          languages: 'Hindi, English',
          cast: 'Lead Actor, Co-Star',
          director: 'Director Name',
          is_featured: false,
          is_trending: true,
          top_10_rank: 0,
        });
        setDriveTestResult(null);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save movie');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditClick = (movie) => {
    setEditingMovieId(movie.id);
    setFormData({
      title: movie.title,
      category: movie.category || 'movie',
      video_url: movie.video_url || '',
      description: movie.description || '',
      poster_url: movie.poster_url || '',
      backdrop_url: movie.backdrop_url || '',
      duration: movie.duration || '2h 15m',
      release_year: movie.release_year || 2024,
      rating: movie.rating || 'U/A 16+',
      imdb_rating: movie.imdb_rating || 8.0,
      genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : (movie.genres || ''),
      languages: Array.isArray(movie.languages) ? movie.languages.join(', ') : (movie.languages || ''),
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : (movie.cast || ''),
      director: movie.director || '',
      is_featured: Boolean(movie.is_featured),
      is_trending: Boolean(movie.is_trending),
      top_10_rank: movie.top_10_rank || 0,
    });
    setDriveTestResult(null);
    setFormError('');
    setFormSuccess('');
    setActiveTab('add');
  };

  const handleDeleteClick = async (movieId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from Moviplix?`)) {
      return;
    }
    try {
      await MovieAPI.delete(movieId);
      await loadMovies();
      onMoviesChanged?.();
    } catch (err) {
      alert('Error deleting movie: ' + err.message);
    }
  };

  const handleQuickToggle = async (movieId, field, currentValue) => {
    try {
      await MovieAPI.update(movieId, { [field]: !currentValue });
      await loadMovies();
      onMoviesChanged?.();
    } catch (err) {
      alert('Error updating toggle: ' + err.message);
    }
  };

  const handleWipeDatabase = async () => {
    if (window.confirm('⚠️ ARE YOU SURE? This will delete ALL movies in Moviplix for a completely clean fresh start (0 movies).')) {
      try {
        await MovieAPI.adminClearAll();
        await loadMovies();
        onMoviesChanged?.();
        alert('Database wiped clean. Ready for fresh uploads.');
      } catch (err) {
        alert('Error clearing database: ' + err.message);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. LOGIN SCREEN (Username: Moviplix | Password: moviplix@admin)
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4 pt-28 select-none">
        <div className="w-full max-w-md bg-[#16181f] border border-hotstar-border/70 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-hotstar-blue/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Logo & Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-hotstar-blue to-hotstar-cyan flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Moviplix Admin Studio
            </h1>
            <p className="text-xs text-slate-400">
              Sign in to manage movies, Google Drive streams & platform settings
            </p>
          </div>

          {loginError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Admin Username</label>
              <input
                type="text"
                required
                placeholder="Enter admin username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Admin Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-hotstar-blue to-hotstar-cyan hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loginLoading ? 'Verifying...' : 'Sign In to Admin Studio'}</span>
            </button>

          </form>

          {/* Quick Helper Pill */}
          <div className="mt-6 pt-5 border-t border-hotstar-border/60 text-center">
            <p className="text-[11px] text-slate-400 mb-2 font-medium">Pre-configured Admin Credentials:</p>
            <div className="bg-slate-900/90 border border-hotstar-border rounded-xl p-2.5 text-xs text-slate-300 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Username:</span>
                <span className="text-hotstar-cyan font-semibold">Moviplix</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <span className="text-amber-400 font-semibold">moviplix@admin</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setUsernameInput('Moviplix');
                setPasswordInput('moviplix@admin');
              }}
              className="mt-2 text-[11px] text-hotstar-blue hover:text-hotstar-cyan font-semibold underline"
            >
              Autofill Credentials
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onBackToCinema}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Cinema
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AUTHENTICATED ADMIN STUDIO
  // ─────────────────────────────────────────────────────────────
  const filteredMovies = movies.filter((m) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      m.title.toLowerCase().includes(s) ||
      (m.category && m.category.toLowerCase().includes(s)) ||
      (m.director && m.director.toLowerCase().includes(s))
    );
  });

  return (
    <div className="min-h-screen bg-[#0c0d12] text-slate-100 pt-28 pb-20 px-4 md:px-12 select-none">
      <div className="max-w-[1720px] mx-auto space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-hotstar-border/60">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hotstar-blue to-emerald-400 flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>Moviplix Admin Studio</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Signed in as <strong className="text-hotstar-cyan">Moviplix</strong> • Complete database & Google Drive control
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToCinema}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Film className="w-4 h-4" />
              <span>View Live Cinema</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Analytics Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#16181f] border border-hotstar-border/60 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Movies</span>
            <div className="text-2xl font-black text-white">{movies.length}</div>
            <span className="text-[10px] text-slate-500">In SQLite database</span>
          </div>

          <div className="bg-[#16181f] border border-hotstar-border/60 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Google Drive Cloud</span>
            <div className="text-2xl font-black text-emerald-400">
              {movies.filter(m => m.is_drive).length}
            </div>
            <span className="text-[10px] text-slate-500">Direct Drive streams</span>
          </div>

          <div className="bg-[#16181f] border border-hotstar-border/60 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Hero Billboard Active</span>
            <div className="text-2xl font-black text-hotstar-cyan">
              {movies.filter(m => m.is_featured).length}
            </div>
            <span className="text-[10px] text-slate-500">Spotlight titles</span>
          </div>

          <div className="bg-[#16181f] border border-hotstar-border/60 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Engine Speed</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {stats?.dbLatency || '< 1ms'}
            </div>
            <span className="text-[10px] text-slate-500">SQLite WAL latency</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-hotstar-border/60 pb-3">
          <button
            onClick={() => {
              setActiveTab('movies');
              setEditingMovieId(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'movies'
                ? 'bg-hotstar-blue text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Movie Library ({movies.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('add');
              if (!editingMovieId) {
                // fresh form
                setFormData({
                  title: '',
                  category: 'movie',
                  video_url: '',
                  description: '',
                  poster_url: '',
                  backdrop_url: '',
                  duration: '2h 15m',
                  release_year: 2024,
                  rating: 'U/A 16+',
                  imdb_rating: 8.5,
                  genres: 'Action, Thriller',
                  languages: 'Hindi, English',
                  cast: 'Lead Actor, Co-Star',
                  director: 'Director Name',
                  is_featured: true,
                  is_trending: true,
                  top_10_rank: 1,
                });
                setDriveTestResult(null);
                setFormError('');
                setFormSuccess('');
              }
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'add'
                ? 'bg-hotstar-blue text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingMovieId ? 'Edit Movie' : '+ Add Movie / Drive Stream'}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ml-auto ${
              activeTab === 'settings'
                ? 'bg-hotstar-blue text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Tools</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: MOVIE LIBRARY TABLE (ALL CHANGES)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'movies' && (
          <div className="space-y-4">
            
            {/* Search Bar & Quick Add Button */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter movies by title, director, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan text-sm text-white focus:outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setEditingMovieId(null);
                  setActiveTab('add');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-hotstar-blue to-hotstar-cyan text-white text-xs sm:text-sm font-bold shadow flex items-center space-x-1.5 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Movie</span>
              </button>
            </div>

            {/* Movies Table */}
            <div className="bg-[#16181f] border border-hotstar-border/60 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-hotstar-border/60">
                    <tr>
                      <th className="py-3 px-4">Poster</th>
                      <th className="py-3 px-4">Title & Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Source Type</th>
                      <th className="py-3 px-4 text-center">Hero Billboard</th>
                      <th className="py-3 px-4 text-center">Trending</th>
                      <th className="py-3 px-4 text-center">Top 10 Rank</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-hotstar-border/40 font-medium">
                    {filteredMovies.map((movie) => (
                      <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                        
                        {/* Poster */}
                        <td className="py-2.5 px-4 w-16">
                          <img
                            src={movie.poster_url || movie.backdrop_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200'}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded-lg border border-hotstar-border"
                          />
                        </td>

                        {/* Title & Info */}
                        <td className="py-2.5 px-4">
                          <h4 className="font-bold text-white text-sm line-clamp-1">{movie.title}</h4>
                          <p className="text-[11px] text-slate-400">
                            {movie.release_year} • {movie.duration} • {movie.rating} • IMDb {movie.imdb_rating}
                          </p>
                          <p className="text-[10px] text-hotstar-cyan line-clamp-1">
                            {Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-4">
                          <span className="capitalize px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                            {movie.category}
                          </span>
                        </td>

                        {/* Source Type (Drive vs Direct) */}
                        <td className="py-2.5 px-4">
                          {movie.is_drive ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 w-max">
                              <HardDrive className="w-3 h-3 text-emerald-400" />
                              <span>Drive Cloud</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1 w-max">
                              <Film className="w-3 h-3 text-blue-400" />
                              <span>Direct Stream</span>
                            </span>
                          )}
                        </td>

                        {/* Toggle Hero Billboard */}
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => handleQuickToggle(movie.id, 'is_featured', movie.is_featured)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                              movie.is_featured 
                                ? 'bg-hotstar-blue text-white border-hotstar-cyan shadow' 
                                : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300'
                            }`}
                            title="Toggle in Hero Billboard"
                          >
                            {movie.is_featured ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>

                        {/* Toggle Trending */}
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => handleQuickToggle(movie.id, 'is_trending', movie.is_trending)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                              movie.is_trending 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow' 
                                : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300'
                            }`}
                            title="Toggle in Trending Tray"
                          >
                            {movie.is_trending ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>

                        {/* Top 10 Rank */}
                        <td className="py-2.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            movie.top_10_rank > 0 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : 'text-slate-600'
                          }`}>
                            {movie.top_10_rank > 0 ? `#${movie.top_10_rank}` : 'Off'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => onPlayMovie(movie)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white"
                              title="Play / Test Stream"
                            >
                              <Play className="w-4 h-4 fill-white" />
                            </button>

                            <button
                              onClick={() => handleEditClick(movie)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-hotstar-cyan"
                              title="Edit Movie Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteClick(movie.id, movie.title)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
                              title="Delete Movie"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredMovies.length === 0 && (
                <div className="text-center py-16 text-slate-400 space-y-3">
                  <Film className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                  <h3 className="text-base font-semibold text-white">No Movies in Library</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your database is currently empty (fresh start). Click below to add your first movie with a Google Drive link!
                  </p>
                  <button
                    onClick={() => {
                      setEditingMovieId(null);
                      setActiveTab('add');
                    }}
                    className="px-4 py-2 rounded-xl bg-hotstar-blue text-white text-xs font-bold"
                  >
                    + Add First Movie
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: ADD / EDIT MOVIE WITH DRIVE INTEGRATION
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'add' && (
          <div className="bg-[#16181f] border border-hotstar-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-hotstar-border/60">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{editingMovieId ? `Edit Movie: ${formData.title}` : 'Add New Movie / Google Drive Stream'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Integrate public or shared Google Drive links, custom video streams, and full movie metadata
                </p>
              </div>

              {editingMovieId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMovieId(null);
                    setActiveTab('movies');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/15 text-slate-300"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {formError && (
              <div className="p-3 mb-6 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 mb-6 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveMovie} className="space-y-6">
              
              {/* Google Drive Video Link & Verify */}
              <div className="space-y-2 bg-slate-900/60 border border-hotstar-border/70 rounded-2xl p-4 sm:p-5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span>Google Drive Video Link / Video URL *</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-normal">
                    Supports Drive Share URLs, Preview URLs & File IDs
                  </span>
                </label>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view"
                    value={formData.video_url}
                    onChange={(e) => {
                      setFormData({ ...formData, video_url: e.target.value });
                      setDriveTestResult(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />

                  <button
                    type="button"
                    onClick={handleTestDriveLink}
                    disabled={testingDrive}
                    className="px-5 py-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>{testingDrive ? 'Checking...' : 'Verify Drive'}</span>
                  </button>
                </div>

                {/* Drive Test Result Preview */}
                {driveTestResult && driveTestResult.valid && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Valid Google Drive Video Identified!</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-2">
                      <span>Drive ID:</span>
                      <code className="bg-black/60 px-2 py-0.5 rounded text-emerald-300 font-mono">
                        {driveTestResult.driveId}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* Title, Category & Release Year */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Movie Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oppenheimer, Jawan"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">TV Show / Series</option>
                    <option value="special">Special Premiere</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Release Year</label>
                  <input
                    type="number"
                    value={formData.release_year}
                    onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              {/* Poster URL & Backdrop URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Poster Image URL (2:3 Portrait)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.poster_url}
                    onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Backdrop Banner URL (16:9 Landscape)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.backdrop_url}
                    onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Synopsis / Description</label>
                <textarea
                  rows="3"
                  placeholder="Enter movie storyline and details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />
              </div>

              {/* Genres, Languages & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Genres (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Action, Sci-Fi, Drama"
                    value={formData.genres}
                    onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Audio Languages</label>
                  <input
                    type="text"
                    placeholder="Hindi, English, Telugu"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Cast / Starring</label>
                  <input
                    type="text"
                    placeholder="Lead Actor, Co-Star"
                    value={formData.cast}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              {/* Duration, Rating, IMDb & Top 10 Rank */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Duration</label>
                  <input
                    type="text"
                    placeholder="2h 45m"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Age Certification</label>
                  <input
                    type="text"
                    placeholder="U/A 16+"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">IMDb Score</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.imdb_rating}
                    onChange={(e) => setFormData({ ...formData, imdb_rating: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Top 10 Rank (0 for Off)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.top_10_rank}
                    onChange={(e) => setFormData({ ...formData, top_10_rank: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-hotstar-blue bg-slate-900 border-hotstar-border"
                  />
                  <span>Featured in Hero Spotlight Carousel</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_trending}
                    onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                    className="w-4 h-4 rounded text-hotstar-blue bg-slate-900 border-hotstar-border"
                  />
                  <span>Show in Trending Tray</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-hotstar-border/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('movies')}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-hotstar-blue to-hotstar-cyan hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {formSubmitting 
                      ? 'Saving to Database...' 
                      : editingMovieId 
                        ? 'Update Movie' 
                        : 'Add to Moviplix Database'}
                  </span>
                </button>
              </div>

            </form>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: DATABASE TOOLS & FRESH START CONTROLS
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            
            <div className="bg-[#16181f] border border-hotstar-border/60 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-hotstar-cyan" />
                <span>SQLite Engine Controls</span>
              </h3>
              <p className="text-xs text-slate-400">
                Moviplix runs on an ultra-low latency embedded SQLite engine with WAL mode (&lt; 1ms queries).
              </p>

              <div className="p-4 rounded-2xl bg-slate-900 border border-hotstar-border space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="font-semibold text-emerald-400">SQLite 3 (WAL Enabled)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Query Response Time:</span>
                  <span className="font-semibold text-amber-400 font-mono">{stats?.dbLatency || '< 1ms'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Total Entries:</span>
                  <span className="font-semibold text-white">{movies.length} titles</span>
                </div>
              </div>
            </div>

            <div className="bg-[#16181f] border border-rose-500/30 rounded-3xl p-6 space-y-3">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <span>Reset to Fresh Start (0 Movies)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Wipes all records from the database so you can start completely clean without any sample data.
              </p>
              <button
                type="button"
                onClick={handleWipeDatabase}
                className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors"
              >
                Wipe All Movies (Fresh Start)
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

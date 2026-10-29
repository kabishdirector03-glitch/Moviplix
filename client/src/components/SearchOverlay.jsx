import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, HardDrive, Star, Film, Sparkles } from 'lucide-react';
import { MovieAPI } from '../services/api';

export default function SearchOverlay({ 
  isOpen, 
  onClose, 
  onPlay, 
  onOpenDetails, 
  watchlist = [], 
  onToggleWatchlist 
}) {
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const filterChips = [
    { label: 'All', value: '' },
    { label: 'Action', value: 'Action' },
    { label: 'Sci-Fi', value: 'Sci-Fi' },
    { label: 'Drama', value: 'Drama' },
    { label: 'Thriller', value: 'Thriller' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'English', value: 'English' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      performSearch('', '');
    } else {
      setQuery('');
      setGenreFilter('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpenSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const performSearch = async (searchTerm, filter) => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filter === 'drive') {
        // Will filter on client or server
      } else if (filter) {
        params.genre = filter;
      }
      const data = await MovieAPI.getAll(params);
      let filtered = data;
      if (filter === 'drive') {
        filtered = data.filter((m) => m.is_drive);
      }
      setResults(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (val) => {
    setQuery(val);
    performSearch(val, genreFilter);
  };

  const handleFilterClick = (filter) => {
    setGenreFilter(filter);
    performSearch(query, filter);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-8 animate-in fade-in duration-200 select-none overflow-y-auto">
      
      {/* Search Header Bar */}
      <div className="max-w-5xl w-full mx-auto flex flex-col space-y-4">
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search movies, TV shows, actors, or Google Drive titles..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full pl-14 pr-12 py-4 rounded-2xl bg-[#16181f] border border-hotstar-border focus:border-hotstar-cyan text-white text-base sm:text-lg focus:outline-none shadow-2xl transition-all placeholder:text-slate-500"
            />
            {query && (
              <button
                onClick={() => handleQueryChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center"
            title="Close Search (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {filterChips.map((chip) => {
            const isActive = genreFilter === chip.value;
            return (
              <button
                key={chip.label}
                onClick={() => handleFilterClick(chip.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-hotstar-blue to-hotstar-cyan text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Search Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-b border-hotstar-border/40 pb-2">
          <span>{loading ? 'Searching...' : `Found ${results.length} title${results.length === 1 ? '' : 's'}`}</span>
          <span className="font-mono text-emerald-400">Lightning-fast SQLite Search</span>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
          {results.map((movie) => (
            <div
              key={movie.id}
              onClick={() => {
                onClose();
                onOpenDetails(movie);
              }}
              className="group cursor-pointer rounded-xl overflow-hidden bg-hotstar-card border border-hotstar-border/40 hover:border-hotstar-blue transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={movie.poster_url || movie.backdrop_url}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                />

                {movie.imdb_rating && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-amber-400 text-[10px] font-bold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <span>{movie.imdb_rating}</span>
                  </div>
                )}

                {/* Hover Play Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      onPlay(movie);
                    }}
                    className="p-3 rounded-full bg-white text-slate-950 shadow-xl hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5">
                <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-hotstar-cyan">
                  {movie.title}
                </h4>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                  <span>{movie.release_year}</span>
                  <span>•</span>
                  <span>{Array.isArray(movie.genres) ? movie.genres[0] : movie.genres}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Film className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="text-base font-semibold text-slate-300">No movies found matching "{query}"</p>
            <p className="text-xs">Try searching for "Oppenheimer", "Jawan", "Drive", or explore categories</p>
          </div>
        )}

      </div>

    </div>
  );
}

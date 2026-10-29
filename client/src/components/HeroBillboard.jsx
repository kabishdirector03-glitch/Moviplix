import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Info, 
  Plus, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Star
} from 'lucide-react';

export default function HeroBillboard({ 
  featuredMovies = [], 
  onPlayMovie, 
  onOpenDetails, 
  watchlist = [], 
  onToggleWatchlist 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 7 seconds
  useEffect(() => {
    if (!featuredMovies.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (!featuredMovies.length) return null;

  const current = featuredMovies[currentIndex] || featuredMovies[0];
  const inWatchlist = watchlist.some((m) => m.id === current.id);

  return (
    <div className="relative w-full h-[65vh] min-h-[460px] max-h-[720px] overflow-hidden select-none">
      
      {/* Background Image with Cinematic Backdrop */}
      <div className="absolute inset-0 transition-all duration-700 ease-out">
        <img
          src={current.backdrop_url || current.poster_url}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-[0.88] transition-transform duration-1000 transform scale-105"
        />

        {/* Double Gradient Feather (Left & Bottom) */}
        <div className="absolute inset-0 hero-gradient-overlay"></div>
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-[1720px] h-full mx-auto px-4 md:px-12 flex flex-col justify-end pb-12 md:pb-16">
        
        <div className="max-w-xl space-y-3">
          
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            {current.category === 'special' ? (
              <span className="px-2 py-0.5 font-bold uppercase tracking-wider rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-1 shadow">
                <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
                Special Premiere
              </span>
            ) : (
              <span className="px-2 py-0.5 font-bold uppercase tracking-wider rounded bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center gap-1 shadow">
                Featured Blockbuster
              </span>
            )}

            <span className="px-1.5 py-0.5 font-medium rounded bg-white/10 text-slate-200 border border-white/10">
              {current.rating || 'U/A 16+'}
            </span>

            <span className="px-1.5 py-0.5 font-medium rounded bg-white/10 text-slate-200 border border-white/10">
              4K UHD • 5.1
            </span>

            {current.imdb_rating && (
              <span className="flex items-center space-x-1 font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                <span>{current.imdb_rating}</span>
              </span>
            )}
          </div>

          {/* Title - Refined compact size */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight">
            {current.title}
          </h1>

          {/* Meta Information: Year, Duration, Genres */}
          <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
            <span>{current.release_year}</span>
            <span>•</span>
            <span>{current.duration || '2h 30m'}</span>
            <span>•</span>
            <span className="text-hotstar-cyan font-semibold">
              {Array.isArray(current.genres) ? current.genres.join(', ') : current.genres}
            </span>
          </div>

          {/* Synopsis Description - Small refined text */}
          <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed font-normal max-w-lg text-shadow">
            {current.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 pt-1.5">
            
            {/* Watch Now Button */}
            <button
              onClick={() => onPlayMovie(current)}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950 ml-0.5" />
              <span>Watch Now</span>
            </button>

            {/* More Details */}
            <button
              onClick={() => onOpenDetails(current)}
              className="px-4 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 border border-white/10 hover:border-white/30 transition-all duration-200"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>

            {/* Watchlist Toggle */}
            <button
              onClick={() => onToggleWatchlist(current.id)}
              className={`p-2.5 rounded-lg border transition-all duration-200 backdrop-blur-md ${
                inWatchlist
                  ? 'bg-hotstar-blue/30 border-hotstar-cyan text-hotstar-cyan'
                  : 'bg-white/15 border-white/10 hover:border-white/30 text-white hover:bg-white/25'
              }`}
              title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

          </div>

        </div>

      </div>

      {/* Bottom Carousel Controls */}
      <div className="absolute bottom-6 right-6 md:right-12 z-30 flex items-center space-x-1.5">
        <button
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1))}
          className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white backdrop-blur-sm transition-colors"
          title="Previous banner"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center space-x-1 px-1.5">
          {featuredMovies.map((m, idx) => (
            <button
              key={m.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-hotstar-cyan' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)}
          className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white backdrop-blur-sm transition-colors"
          title="Next banner"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}

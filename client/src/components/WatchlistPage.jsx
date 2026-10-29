import React from 'react';
import { Bookmark, Play, Trash2, Clock, Film } from 'lucide-react';
import MovieCard from './MovieCard';

export default function WatchlistPage({ 
  watchlist = [], 
  continueWatching = [],
  onPlay, 
  onOpenDetails, 
  onToggleWatchlist,
  onRemoveContinueWatching 
}) {
  return (
    <div className="max-w-[1720px] mx-auto px-4 md:px-12 pt-24 pb-16 min-h-[80vh] select-none">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-hotstar-blue/20 border border-hotstar-blue/40 flex items-center justify-center text-hotstar-cyan shadow-lg">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">My Space</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Your personal watchlist, bookmarks, and continue watching queue
          </p>
        </div>
      </div>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-4 h-4 text-hotstar-cyan" />
            <h2 className="text-lg font-bold text-white">Continue Watching</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {continueWatching.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {continueWatching.map((movie) => (
              <div 
                key={movie.id} 
                className="relative group rounded-xl overflow-hidden bg-hotstar-card border border-hotstar-border hover:border-hotstar-blue transition-all"
              >
                <div 
                  className="relative aspect-video cursor-pointer"
                  onClick={() => onPlay(movie)}
                >
                  <img
                    src={movie.backdrop_url || movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="p-3 rounded-full bg-white/90 text-slate-950 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-hotstar-blue to-hotstar-cyan"
                      style={{ width: `${movie.percentage || 30}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{movie.title}</h4>
                    <span className="text-[11px] text-hotstar-cyan font-semibold">
                      {movie.percentage}% completed
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveContinueWatching(movie.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watchlist Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Bookmark className="w-4 h-4 text-hotstar-cyan" />
          <h2 className="text-lg font-bold text-white">Watchlist</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {watchlist.length}
          </span>
        </div>

        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlist.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                inWatchlist={true}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-hotstar-card/40 rounded-2xl border border-hotstar-border/40 p-8 space-y-3">
            <Film className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <h3 className="text-base font-semibold text-white">Your watchlist is empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore blockbusters, web series, and Google Drive integrated cinema, then tap "+ Watchlist" to save them here!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

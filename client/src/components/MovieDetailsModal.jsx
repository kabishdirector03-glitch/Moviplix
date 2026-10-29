import React, { useEffect, useState } from 'react';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Star, 
  Film, 
  HardDrive, 
  Sparkles, 
  Share2, 
  Clock, 
  Calendar, 
  Globe 
} from 'lucide-react';
import { MovieAPI } from '../services/api';

export default function MovieDetailsModal({ 
  movieId, 
  onClose, 
  onPlay, 
  watchlist = [], 
  onToggleWatchlist 
}) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    MovieAPI.getById(movieId)
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [movieId]);

  if (!movieId) return null;

  const inWatchlist = movie ? watchlist.some((m) => m.id === movie.id) : false;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 select-none">
      
      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-4xl bg-[#16181f] border border-hotstar-border rounded-2xl overflow-hidden shadow-2xl text-slate-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !movie ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-hotstar-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {/* Header Backdrop Banner */}
            <div className="relative h-72 sm:h-96 w-full overflow-hidden">
              <img
                src={movie.backdrop_url || movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover filter brightness-[0.85]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16181f] via-[#16181f]/40 to-transparent" />

              {/* Title & Actions floating on backdrop bottom */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col space-y-3">
                
                <div className="flex flex-wrap items-center gap-2">
                  {movie.imdb_rating && (
                    <span className="px-2 py-0.5 rounded bg-black/60 text-amber-400 text-xs font-bold flex items-center gap-1 border border-white/10">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {movie.imdb_rating} IMDb
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-white/15 text-white text-xs font-semibold">
                    {movie.rating || 'U/A 16+'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/15 text-white text-xs font-semibold">
                    {movie.duration}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">
                  {movie.title}
                </h2>

                {/* Primary Action Buttons */}
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      onPlay(movie);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white hover:bg-hotstar-cyan text-slate-950 font-bold text-sm flex items-center space-x-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-slate-950 text-slate-950 ml-0.5" />
                    <span>Watch Now</span>
                  </button>

                  <button
                    onClick={() => onToggleWatchlist(movie.id)}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center space-x-2 backdrop-blur-md transition-all ${
                      inWatchlist 
                        ? 'bg-hotstar-blue/30 border-hotstar-cyan text-hotstar-cyan' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Movie link copied to clipboard!');
                    }}
                    className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* Modal Body Information */}
            <div className="p-6 space-y-6">
              
              {/* Synopsis */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Overview</h4>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                  {movie.description}
                </p>
              </div>

              {/* Grid Details: Cast, Director, Genres, Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-hotstar-border/60 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block mb-1 font-medium">Starring:</span>
                  <p className="text-slate-200 font-semibold">
                    {Array.isArray(movie.cast) && movie.cast.length > 0 
                      ? movie.cast.join(', ') 
                      : (movie.cast || 'Top Ensemble Cast')}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 font-medium">Director:</span>
                  <p className="text-slate-200 font-semibold">{movie.director || 'Acclaimed Director'}</p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 font-medium">Genres:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(Array.isArray(movie.genres) ? movie.genres : ['Action', 'Drama']).map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-hotstar-cyan font-medium text-xs">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 font-medium">Audio Languages Available:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(Array.isArray(movie.languages) ? movie.languages : ['Hindi', 'English']).map((l) => (
                      <span key={l} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-xs">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Related & Recommended Movies */}
              {movie.related && movie.related.length > 0 && (
                <div className="pt-4 border-t border-hotstar-border/60">
                  <h4 className="text-sm font-bold text-white mb-3">More Like This</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {movie.related.slice(0, 4).map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => {
                          onClose();
                          setTimeout(() => onPlay(rel), 100);
                        }}
                        className="group cursor-pointer rounded-xl overflow-hidden bg-hotstar-card border border-hotstar-border/40 hover:border-hotstar-blue transition-all"
                      >
                        <div className="aspect-[2/3] overflow-hidden">
                          <img
                            src={rel.poster_url || rel.backdrop_url}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-hotstar-cyan">
                            {rel.title}
                          </p>
                          <span className="text-[10px] text-slate-400">{rel.release_year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

    </div>
  );
}

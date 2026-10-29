import React, { useState } from 'react';
import { Play, Plus, Check, Info, Star } from 'lucide-react';

export default function MovieCard({ 
  movie, 
  onPlay, 
  onOpenDetails, 
  inWatchlist, 
  onToggleWatchlist,
  progressPercentage = 0,
  isWide = false
}) {
  const [isHovered, setIsHovered] = useState(false);

  const displayImage = isWide ? (movie.backdrop_url || movie.poster_url) : (movie.poster_url || movie.backdrop_url);

  return (
    <div 
      className="relative flex-shrink-0 group cursor-pointer transition-all duration-300 select-none"
      style={{ width: isWide ? '270px' : '175px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenDetails(movie)}
    >
      {/* Card Image Container */}
      <div className={`relative overflow-hidden rounded-xl bg-hotstar-card border border-hotstar-border/40 shadow-md group-hover:shadow-card-hover group-hover:border-hotstar-blue/50 group-hover:scale-105 transition-all duration-300 ${
        isWide ? 'aspect-video' : 'aspect-[2/3]'
      }`}>
        
        <img
          src={displayImage}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center filter group-hover:brightness-105 transition-all duration-300"
        />

        {/* Card Gradient on Hover */}
        <div className={`absolute inset-0 hotstar-card-gradient transition-opacity duration-300 ${
          isHovered ? 'opacity-95' : 'opacity-0 md:opacity-30'
        }`} />

        {/* Rating Badge */}
        {movie.imdb_rating && (
          <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-amber-400 text-[9px] font-bold flex items-center gap-0.5 border border-white/10">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            <span>{movie.imdb_rating}</span>
          </div>
        )}

        {/* Continue Watching Progress Bar */}
        {progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 z-20">
            <div 
              className="h-full bg-gradient-to-r from-hotstar-blue to-hotstar-cyan rounded-r-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Hover Action Bar & Information Overlay */}
        <div className={`absolute inset-0 p-2.5 flex flex-col justify-end z-20 transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
        }`}>
          
          {/* Quick Play & Action Buttons */}
          <div className="flex items-center space-x-1.5 mb-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
              className="p-2 rounded-full bg-white hover:bg-hotstar-cyan text-slate-950 shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
              title="Watch Now"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950 ml-0.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(movie.id);
              }}
              className={`p-2 rounded-full border backdrop-blur-md transition-all duration-200 ${
                inWatchlist
                  ? 'bg-hotstar-blue/40 border-hotstar-cyan text-hotstar-cyan'
                  : 'bg-black/60 border-white/20 text-white hover:border-white/50'
              }`}
              title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(movie);
              }}
              className="p-2 rounded-full bg-black/60 border border-white/20 text-white hover:border-white/50 backdrop-blur-md ml-auto"
              title="Details & Trailer"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title - Small refined */}
          <h4 className="font-bold text-white text-xs line-clamp-1 drop-shadow">
            {movie.title}
          </h4>

          {/* Metadata */}
          <div className="flex items-center space-x-1 text-[9px] text-slate-300 font-medium mt-0.5">
            <span>{movie.release_year}</span>
            <span>•</span>
            <span className="border border-white/20 px-1 rounded text-[8px]">{movie.rating || 'U/A 13+'}</span>
            <span>•</span>
            <span className="text-hotstar-cyan font-semibold">
              {Array.isArray(movie.genres) ? movie.genres[0] : (movie.genres || 'Movie')}
            </span>
          </div>

        </div>

      </div>

      {/* Static Sub-text */}
      <div className="mt-1.5 px-0.5">
        <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-hotstar-cyan transition-colors">
          {movie.title}
        </h3>
        <p className="text-[10px] text-slate-400 line-clamp-1">
          {Array.isArray(movie.genres) ? movie.genres.join(' • ') : movie.genres}
        </p>
      </div>

    </div>
  );
}

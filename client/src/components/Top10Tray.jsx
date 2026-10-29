import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Check } from 'lucide-react';

export default function Top10Tray({ 
  items = [], 
  onPlay, 
  onOpenDetails, 
  watchlist = [], 
  onToggleWatchlist 
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative py-4 my-1 group select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-12 mb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-1 h-4 bg-gradient-to-b from-hotstar-blue to-hotstar-cyan rounded-full"></div>
          <h2 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span>Top 10 Today</span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-red-600 text-white">
              Trending
            </span>
          </h2>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 md:left-6 top-1/2 mt-2 z-30 w-8 h-8 -translate-y-1/2 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md shadow-lg hover:scale-110"
        aria-label="Scroll Left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-2 md:right-6 top-1/2 mt-2 z-30 w-8 h-8 -translate-y-1/2 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md shadow-lg hover:scale-110"
        aria-label="Scroll Right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Horizontal Tray List with Stylized Rank Numbers */}
      <div 
        ref={scrollRef}
        className="flex space-x-3 md:space-x-5 overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-12 py-3"
      >
        {items.slice(0, 10).map((movie, index) => {
          const rank = index + 1;
          const inWatchlist = watchlist.some(m => m.id === movie.id);

          return (
            <div 
              key={movie.id}
              className="relative flex-shrink-0 flex items-center cursor-pointer group/card"
              style={{ width: '210px' }}
              onClick={() => onOpenDetails(movie)}
            >
              {/* Stylized Rank Number */}
              <div className="relative -mr-5 md:-mr-7 select-none z-0 pointer-events-none">
                <span 
                  className="font-black text-7xl md:text-8xl tracking-tighter leading-none"
                  style={{
                    color: '#12141a',
                    WebkitTextStroke: '2px #333a48',
                    filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.8))'
                  }}
                >
                  {rank}
                </span>
              </div>

              {/* Movie Poster Card */}
              <div className="relative z-10 w-[130px] md:w-[145px] aspect-[2/3] rounded-xl overflow-hidden bg-hotstar-card border border-hotstar-border/50 shadow-lg group-hover/card:scale-105 group-hover/card:border-hotstar-cyan transition-all duration-300">
                <img
                  src={movie.poster_url || movie.backdrop_url}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover filter group-hover/card:brightness-110 transition-all duration-300"
                />

                {/* Hover Details */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5">
                  <div className="flex items-center space-x-1.5 mb-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(movie);
                      }}
                      className="p-1.5 rounded-full bg-white text-slate-950 hover:bg-hotstar-cyan shadow-md"
                      title="Play"
                    >
                      <Play className="w-3 h-3 fill-slate-950 text-slate-950 ml-0.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(movie.id);
                      }}
                      className="p-1.5 rounded-full bg-black/60 border border-white/20 text-white"
                      title="Watchlist"
                    >
                      {inWatchlist ? <Check className="w-3 h-3 text-hotstar-cyan" /> : <Plus className="w-3 h-3" />}
                    </button>
                  </div>
                  <h4 className="text-[11px] font-bold text-white line-clamp-1">{movie.title}</h4>
                  <p className="text-[9px] text-hotstar-cyan font-medium">#{rank} Today</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

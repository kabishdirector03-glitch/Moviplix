import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function ContentTray({ 
  title, 
  badge, 
  description,
  items = [], 
  onPlay, 
  onOpenDetails, 
  watchlist = [], 
  onToggleWatchlist,
  isWide = false
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
    <div className="relative py-3 my-1 group select-none">
      
      {/* Tray Title Header */}
      <div className="flex items-baseline justify-between px-4 md:px-12 mb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-1 h-4 bg-gradient-to-b from-hotstar-blue to-hotstar-cyan rounded-full"></div>
          <h2 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-2 group-hover:text-slate-100">
            <span>{title}</span>
            {badge && (
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-hotstar-blue/20 text-hotstar-cyan border border-hotstar-blue/30">
                {badge}
              </span>
            )}
          </h2>
          {description && (
            <span className="hidden lg:inline text-[11px] text-slate-400 font-normal">
              {description}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 md:left-6 top-1/2 mt-1 z-30 w-8 h-8 -translate-y-1/2 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md shadow-lg hover:scale-110"
        aria-label="Scroll Left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-2 md:right-6 top-1/2 mt-1 z-30 w-8 h-8 -translate-y-1/2 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md shadow-lg hover:scale-110"
        aria-label="Scroll Right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Horizontal Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex space-x-2.5 md:space-x-3.5 overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-12 py-2"
      >
        {items.map((movie) => {
          const inWatchlist = watchlist.some((m) => m.id === movie.id);
          return (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              inWatchlist={inWatchlist}
              onToggleWatchlist={onToggleWatchlist}
              progressPercentage={movie.percentage || 0}
              isWide={isWide}
            />
          );
        })}
      </div>

    </div>
  );
}

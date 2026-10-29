import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Bookmark, 
  Crown, 
  Film, 
  Tv, 
  Sparkles, 
  Zap, 
  Layers, 
  ShieldCheck,
  Lock,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  onOpenSearch, 
  onOpenAdmin, 
  watchlistCount = 0,
  stats,
  isAdminLoggedIn,
  currentEdition,
  setCurrentEdition,
  selectedLanguage,
  setSelectedLanguage
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showEditionDropdown, setShowEditionDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Drive Movies nav option and Drive badge removed as requested
  const navItems = [
    { id: 'home', label: 'Home', icon: Layers },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'series', label: 'TV Shows', icon: Tv },
    { id: 'specials', label: 'Specials', icon: Sparkles },
    { id: 'watchlist', label: 'My Space', icon: Bookmark, badge: watchlistCount },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
  ];

  const editions = [
    { id: 'india', name: 'India (IN)', flag: '🇮🇳' },
    { id: 'global', name: 'Global (US/UK)', flag: '🌐' },
    { id: 'vip', name: 'VIP Ultra 4K', flag: '👑' },
  ];

  const quickLanguages = ['All', 'Hindi', 'English', 'Tamil', 'Telugu'];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 select-none">
      
      {/* ──────────────────────────────────────────────────────────
          SMALL BAR EDITION (Compact, Refined, Adjustable)
          ────────────────────────────────────────────────────────── */}
      <div className="bg-[#090a0d] border-b border-hotstar-border/40 text-[10px] text-slate-300 py-1 px-4 md:px-8">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between">
          
          {/* Left: Region / Edition & Language Filter */}
          <div className="flex items-center space-x-3">
            
            <div className="relative">
              <button
                onClick={() => setShowEditionDropdown(!showEditionDropdown)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
                title="Change Region / Edition"
              >
                <span>{editions.find(e => e.id === (currentEdition || 'india'))?.flag || '🇮🇳'}</span>
                <span>{editions.find(e => e.id === (currentEdition || 'india'))?.name || 'India (IN)'}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
              </button>

              {showEditionDropdown && (
                <div className="absolute left-0 mt-1 w-40 bg-[#16181f] border border-hotstar-border rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-slate-400 border-b border-hotstar-border/60">
                    Edition
                  </div>
                  {editions.map((ed) => (
                    <button
                      key={ed.id}
                      onClick={() => {
                        setCurrentEdition?.(ed.id);
                        setShowEditionDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-[11px] text-slate-200 hover:text-white hover:bg-white/5 flex items-center space-x-1.5"
                    >
                      <span>{ed.flag}</span>
                      <span>{ed.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Language Filter in Small Bar */}
            <div className="hidden sm:flex items-center space-x-1 border-l border-white/10 pl-2.5">
              <span className="text-[10px] text-slate-500 font-medium mr-1">Lang:</span>
              {quickLanguages.map((lang) => {
                const isActive = (selectedLanguage || 'All') === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage?.(lang === 'All' ? '' : lang)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      isActive 
                        ? 'bg-hotstar-blue/30 text-hotstar-cyan font-bold border border-hotstar-blue/40' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>

            {/* Subtle Resolution Tag */}
            <div className="hidden xl:flex items-center space-x-1 text-[10px] text-slate-400 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-hotstar-cyan animate-pulse"></span>
              <span className="text-slate-300">Cinema 4K UHD</span>
              <span>•</span>
              <span className="text-slate-400">Dolby 5.1</span>
            </div>

          </div>

          {/* Right: Latency & Admin Panel Status */}
          <div className="flex items-center space-x-2.5 text-[10px]">
            <div className="hidden md:flex items-center space-x-1 text-slate-400">
              <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              <span>Speed:</span>
              <span className="text-emerald-400 font-mono font-semibold">{stats?.dbLatency || '< 1ms'}</span>
            </div>

            <span className="hidden md:inline text-slate-700">|</span>

            {/* Admin Access Indicator */}
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-all ${
                isAdminLoggedIn
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {isAdminLoggedIn ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Admin: Moviplix</span>
                </>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  <span>Admin Panel</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          MAIN NAVBAR
          ────────────────────────────────────────────────────────── */}
      <nav className={`transition-all duration-300 ${
        isScrolled 
          ? 'hotstar-nav-glass shadow-xl py-2 border-b border-hotstar-border/40' 
          : 'bg-gradient-to-b from-[#0f1014]/95 via-[#0f1014]/80 to-transparent py-2.5'
      }`}>
        <div className="max-w-[1720px] mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Brand Logo & Nav Links */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setCurrentTab('home')}
              className="flex items-center space-x-2 group focus:outline-none"
            >
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0084ff] to-[#00d2ff] flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <div className="flex flex-col text-left">
                {/* Clean MOVIPLIX name without any Jio-Hotstar text */}
                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-200 uppercase font-sans leading-none">
                  MOVI<span className="text-hotstar-cyan">PLIX</span>
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`relative px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                      isActive 
                        ? 'text-white font-semibold' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-hotstar-cyan' : 'text-slate-400'}`} />
                    <span>{item.label}</span>

                    {item.badge > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-hotstar-blue text-white">
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-hotstar-blue to-hotstar-cyan rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Actions: Search, Admin Button, Subscribe */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white text-xs transition-all duration-200"
              title="Search titles (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] bg-white/10 rounded text-slate-400">Ctrl K</kbd>
            </button>

            {/* Admin Studio Button */}
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-hotstar-blue to-hotstar-cyan text-white shadow-md'
                  : 'bg-hotstar-blue/15 hover:bg-hotstar-blue/25 text-hotstar-cyan border-hotstar-blue/30'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Studio</span>
            </button>

            {/* Subscribe VIP Button */}
            <button 
              onClick={() => alert("🎉 You have VIP Premium Access to Moviplix!")}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center space-x-1 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Crown className="w-3 h-3 fill-slate-950" />
              <span>Subscribe</span>
            </button>

          </div>

        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center justify-around py-1.5 px-2 border-t border-hotstar-border/50 bg-[#0f1014]/95 text-[10px] mt-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center py-0.5 px-1.5 rounded ${
                  isActive ? 'text-hotstar-cyan font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </header>
  );
}

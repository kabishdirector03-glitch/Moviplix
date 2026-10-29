import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  MessageSquare, 
  HardDrive, 
  ExternalLink,
  ChevronLeft,
  Check,
  Sparkles
} from 'lucide-react';
import { MovieAPI } from '../services/api';

export default function VideoPlayerModal({ movie, onClose }) {
  if (!movie) return null;

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    Array.isArray(movie.languages) && movie.languages[0] ? movie.languages[0] : 'Hindi'
  );
  const [selectedQuality, setSelectedQuality] = useState('1080p Full HD');

  // Drive playback mode: 'embed' or 'direct'
  const isDriveMovie = Boolean(movie.is_drive || movie.drive_file_id || (movie.video_url && movie.video_url.includes('drive.google.com')));
  const [driveMode, setDriveMode] = useState(isDriveMovie ? 'embed' : 'direct');

  // Extract drive preview URL
  const driveId = movie.drive_file_id || (movie.video_url && movie.video_url.match(/[-\w]{25,}/)?.[0]);
  const driveEmbedUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : movie.video_url;

  // Controls auto-hide timer
  const controlsTimeoutRef = useRef(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  // Keyboard navigation & playback controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          seek(-10);
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          seek(10);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, isMuted, currentTime, duration]);

  // Periodic progress saving to SQLite backend
  useEffect(() => {
    if (!videoRef.current || driveMode === 'embed') return;

    const interval = setInterval(() => {
      if (videoRef.current && currentTime > 5 && duration > 0) {
        MovieAPI.saveProgress(movie.id, currentTime, duration);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [movie.id, currentTime, duration, driveMode]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seek = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  const handleSeekChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[100] bg-black flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Ambient Theater Back-Glow */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none blur-3xl scale-125 transition-all duration-1000"
        style={{
          backgroundImage: `url(${movie.backdrop_url || movie.poster_url})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />

      {/* TOP BAR: Title, Drive Status, Mode Toggle, Close Button */}
      <div className={`relative z-50 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        
        {/* Left: Back button & Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 group"
            title="Back (Esc)"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base md:text-lg font-bold text-white tracking-tight drop-shadow">
                {movie.title}
              </h2>
            </div>

            <p className="text-xs text-slate-400">
              {movie.release_year} • {movie.rating || 'U/A 16+'} • {movie.duration} • Audio: {selectedLanguage}
            </p>
          </div>
        </div>

        {/* Right: Drive Mode Switch & Close */}
        <div className="flex items-center space-x-3">
          {isDriveMovie && (
            <div className="flex items-center rounded-lg bg-white/10 p-1 border border-white/10 text-xs">
              <button
                onClick={() => setDriveMode('embed')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  driveMode === 'embed'
                    ? 'bg-hotstar-blue text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Drive Preview Player
              </button>
              <button
                onClick={() => setDriveMode('direct')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  driveMode === 'direct'
                    ? 'bg-hotstar-blue text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Direct Stream
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/80 text-white transition-colors"
            title="Close Player (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* VIDEO CONTAINER */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {driveMode === 'embed' && isDriveMovie ? (
          /* Google Drive Official Preview Cinema Embed */
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto p-2 md:p-6 flex flex-col justify-center">
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-black">
              <iframe
                src={driveEmbedUrl}
                title={movie.title}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
              />
            </div>
            <div className="text-center py-2 text-xs text-slate-400 flex items-center justify-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Playing directly from Google Drive Cloud storage with adaptive bitrate</span>
              <a 
                href={driveEmbedUrl.replace('/preview', '/view')} 
                target="_blank" 
                rel="noreferrer"
                className="text-hotstar-cyan hover:underline flex items-center gap-1 ml-2"
              >
                <span>Open in Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          /* High Performance HTML5 Player with Range Requests */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={movie.video_url}
              autoPlay
              playsInline
              onClick={togglePlay}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Play/Pause Large Center Pulse Indicator */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute z-30 p-6 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md hover:scale-110 active:scale-95 transition-all shadow-2xl"
              >
                <Play className="w-12 h-12 fill-white ml-1" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS (Only for Direct Stream mode) */}
      {driveMode !== 'embed' && (
        <div className={`relative z-50 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 space-y-3 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          
          {/* Progress Timeline Scrubber */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-300 font-semibold w-12 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 group">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-hotstar-blue group-hover:h-2 transition-all"
              />
            </div>

            <span className="text-xs font-mono text-slate-400 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Control Buttons Bar */}
          <div className="flex items-center justify-between">
            
            {/* Left Controls: Play, Rewind 10s, Forward 10s, Volume */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={togglePlay}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
              </button>

              <button
                onClick={() => seek(-10)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Rewind 10s (J)"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => seek(10)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Forward 10s (L)"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center space-x-2 group">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                  title="Mute/Unmute (M)"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 md:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-hotstar-blue opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            {/* Right Controls: Audio/Subtitles, Speed/Quality, Fullscreen */}
            <div className="flex items-center space-x-3 md:space-x-4 relative">
              
              {/* Audio & Subtitles Selector */}
              <button
                onClick={() => {
                  setShowAudioMenu(!showAudioMenu);
                  setShowSettingsMenu(false);
                }}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                  showAudioMenu ? 'text-hotstar-cyan bg-white/10' : 'text-white'
                }`}
                title="Audio & Subtitles"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {showAudioMenu && (
                <div className="absolute right-12 bottom-12 w-56 bg-[#16181f] border border-hotstar-border rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Audio Languages</h4>
                  <div className="space-y-1">
                    {(Array.isArray(movie.languages) ? movie.languages : ['Hindi', 'English', 'Tamil', 'Telugu']).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setShowAudioMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                          selectedLanguage === lang ? 'bg-hotstar-blue/20 text-hotstar-cyan font-semibold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{lang}</span>
                        {selectedLanguage === lang && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings / Speed Menu */}
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowAudioMenu(false);
                }}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                  showSettingsMenu ? 'text-hotstar-cyan bg-white/10' : 'text-white'
                }`}
                title="Playback Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-12 bottom-12 w-48 bg-[#16181f] border border-hotstar-border rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Playback Speed</h4>
                  <div className="space-y-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                          playbackSpeed === speed ? 'bg-hotstar-blue/20 text-hotstar-cyan font-semibold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{speed === 1 ? 'Normal (1.0x)' : `${speed}x`}</span>
                        {playbackSpeed === speed && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

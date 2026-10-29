import React, { useState } from 'react';
import { 
  X, 
  HardDrive, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  Film, 
  Play,
  Upload,
  RefreshCw
} from 'lucide-react';
import { MovieAPI } from '../services/api';

export default function AdminMovieModal({ onClose, onMovieAdded, onResetDB }) {
  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    description: '',
    poster_url: '',
    backdrop_url: '',
    duration: '2h 30m',
    release_year: 2024,
    rating: 'U/A 16+',
    imdb_rating: 8.5,
    genres: 'Action, Thriller',
    languages: 'Hindi, English',
    cast: 'Lead Actor, Co-Star',
    director: 'Director Name',
    category: 'movie',
    is_featured: false,
    is_trending: true,
  });

  const [testingDrive, setTestingDrive] = useState(false);
  const [driveTestResult, setDriveTestResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Preset Templates to test Google Drive integration easily
  const presets = [
    {
      name: 'Google Drive Stream (Demo 1)',
      title: 'Drive Cinematic Showcase: Cyberpunk 2088',
      video_url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
      poster_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
      backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
      description: 'Streamed directly from connected Google Drive cloud storage. A high-stakes futuristic cyberpunk adventure with jaw-dropping visual effects.',
      genres: 'Sci-Fi, Action, Thriller',
      languages: 'Hindi, English',
      release_year: 2024,
      rating: 'U/A 16+',
      imdb_rating: 8.7,
      category: 'movie',
      is_featured: true,
    },
    {
      name: 'Google Drive Stream (Demo 2)',
      title: 'Drive Cloud Feature: The Himalayan Ascent',
      video_url: 'https://drive.google.com/file/d/1u3N0bJp2W7YqV8cKm4L_sample_rrr_drive/preview',
      poster_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      backdrop_url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1600&q=80',
      description: 'An exhilarating documentary adventure following elite mountaineers as they attempt a winter traverse across treacherous mountain ridges.',
      genres: 'Adventure, Documentary',
      languages: 'English, Hindi',
      release_year: 2023,
      rating: 'U/A 13+',
      imdb_rating: 8.9,
      category: 'special',
      is_featured: false,
    },
    {
      name: 'Direct MP4 Stream',
      title: 'Tears of Steel (4K Cinema Cut)',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
      backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
      description: 'Futuristic sci-fi film set in a dystopian future where human resistance fighters execute a critical plan at the Amsterdam Oude Kerk.',
      genres: 'Sci-Fi, VFX, Thriller',
      languages: 'English',
      release_year: 2024,
      rating: 'U/A 16+',
      imdb_rating: 8.4,
      category: 'movie',
      is_featured: false,
    }
  ];

  const handleTestDriveLink = async () => {
    if (!formData.video_url) {
      setErrorMsg('Please enter a Google Drive link or video URL first.');
      return;
    }
    setTestingDrive(true);
    setErrorMsg('');
    try {
      const res = await MovieAPI.resolveDrive(formData.video_url);
      setDriveTestResult(res);
      if (!res.valid) {
        setErrorMsg(res.message || 'Could not parse Google Drive file ID.');
      }
    } catch (err) {
      setErrorMsg('Error testing Drive link: ' + err.message);
    } finally {
      setTestingDrive(false);
    }
  };

  const applyPreset = (preset) => {
    setFormData({
      ...formData,
      ...preset
    });
    setDriveTestResult(null);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url) {
      setErrorMsg('Title and Video URL / Drive link are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        genres: formData.genres.split(',').map((s) => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map((s) => s.trim()).filter(Boolean),
        cast: formData.cast.split(',').map((s) => s.trim()).filter(Boolean),
      };

      await MovieAPI.create(payload);
      onMovieAdded();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save movie to database');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none">
      
      <div 
        className="relative w-full max-w-3xl bg-[#16181f] border border-hotstar-border rounded-2xl overflow-hidden shadow-2xl text-slate-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-hotstar-border/60 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hotstar-blue to-emerald-400 flex items-center justify-center text-white shadow-lg">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Add Movie with Google Drive</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SQLite Cloud Sync
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Paste any Google Drive shareable link or video URL to integrate and stream instantly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ⚡ Quick Fill Presets (Test Drive Integration)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-slate-200 hover:text-white transition-all flex items-center justify-between"
                >
                  <span className="truncate">{preset.name}</span>
                  <Sparkles className="w-3.5 h-3.5 text-hotstar-cyan ml-1 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Google Drive Link Input & Verify Button */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Google Drive Video Link / File ID / Video Stream URL *</span>
                <span className="text-emerald-400 font-normal">Supports Drive share URLs & direct streams</span>
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
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />

                <button
                  type="button"
                  onClick={handleTestDriveLink}
                  disabled={testingDrive}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>{testingDrive ? 'Checking...' : 'Verify Drive'}</span>
                </button>
              </div>

              {/* Drive Link Verification Result */}
              {driveTestResult && driveTestResult.valid && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 space-y-2 mt-2">
                  <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Valid Google Drive Video Source Detected!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    File ID: <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-400">{driveTestResult.driveId}</code>
                  </p>
                </div>
              )}
            </div>

            {/* Title & Release Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-300">Movie Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jawan, Oppenheimer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Release Year</label>
                <input
                  type="number"
                  value={formData.release_year}
                  onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            {/* Poster & Backdrop URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Poster Image URL (Portrait 2:3)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.poster_url}
                  onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Backdrop Banner URL (Landscape 16:9)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.backdrop_url}
                  onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Synopsis / Description</label>
              <textarea
                rows="2"
                placeholder="Enter storyline..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
              />
            </div>

            {/* Genres & Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Genres (comma separated)</label>
                <input
                  type="text"
                  placeholder="Action, Sci-Fi, Drama"
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Languages (comma separated)</label>
                <input
                  type="text"
                  placeholder="Hindi, English, Telugu"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            {/* Duration, IMDb Rating & Category */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Duration</label>
                <input
                  type="text"
                  placeholder="2h 45m"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">IMDb Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={formData.imdb_rating}
                  onChange={(e) => setFormData({ ...formData, imdb_rating: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-hotstar-border focus:border-hotstar-cyan focus:outline-none text-white text-sm"
                >
                  <option value="movie">Movie</option>
                  <option value="series">TV Show / Series</option>
                  <option value="special">Hotstar Special</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center space-x-6 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded text-hotstar-blue focus:ring-0 bg-slate-900 border-hotstar-border"
                />
                <span>Hero Billboard Spotlight</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.is_trending}
                  onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                  className="w-4 h-4 rounded text-hotstar-blue focus:ring-0 bg-slate-900 border-hotstar-border"
                />
                <span>Trending Tray</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-hotstar-border/60 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-hotstar-blue to-hotstar-cyan hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Saving to Database...' : 'Add to Moviplix'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

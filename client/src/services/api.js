/**
 * Moviplix API Client
 * Lightning-fast calls to SQLite backend & Admin controls
 */

const API_BASE = '/api';

const getHeaders = (extra = {}) => {
  const token = localStorage.getItem('moviplix_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...extra
  };
  if (token) {
    headers['x-admin-token'] = token;
  }
  return headers;
};

export const MovieAPI = {
  // Get curated trays for homepage
  getCurated: async () => {
    const res = await fetch(`${API_BASE}/movies/curated`);
    if (!res.ok) throw new Error('Failed to fetch curated movies');
    return res.json();
  },

  // Get all movies with optional filters
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/movies?${query}`);
    if (!res.ok) throw new Error('Failed to fetch movies');
    return res.json();
  },

  // Get single movie by ID
  getById: async (id) => {
    const res = await fetch(`${API_BASE}/movies/${id}`);
    if (!res.ok) throw new Error('Failed to fetch movie');
    return res.json();
  },

  // Create new movie (Admin)
  create: async (data) => {
    const res = await fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create movie');
    }
    return res.json();
  },

  // Update movie (Admin)
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update movie');
    return res.json();
  },

  // Delete movie (Admin)
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/movies/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete movie');
    return res.json();
  },

  // Admin Authentication
  adminLogin: async (username, password) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid credentials');
    }
    localStorage.setItem('moviplix_admin_token', data.token);
    localStorage.setItem('moviplix_admin_user', data.username);
    return data;
  },

  adminVerify: async () => {
    const token = localStorage.getItem('moviplix_admin_token');
    if (!token) return { authenticated: false };

    try {
      const res = await fetch(`${API_BASE}/admin/verify`, {
        headers: getHeaders()
      });
      if (!res.ok) return { authenticated: false };
      return res.json();
    } catch {
      return { authenticated: false };
    }
  },

  adminLogout: async () => {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (e) {
      console.warn(e);
    }
    localStorage.removeItem('moviplix_admin_token');
    localStorage.removeItem('moviplix_admin_user');
  },

  adminClearAll: async () => {
    const res = await fetch(`${API_BASE}/admin/clear-all`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear database');
    return res.json();
  },

  adminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  // Test & resolve Google Drive link
  resolveDrive: async (url) => {
    const res = await fetch(`${API_BASE}/stream/resolve-drive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return res.json();
  },

  // Watchlist operations
  getWatchlist: async () => {
    const res = await fetch(`${API_BASE}/watchlist`);
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    return res.json();
  },

  toggleWatchlist: async (movieId) => {
    const res = await fetch(`${API_BASE}/watchlist/toggle/${movieId}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle watchlist');
    return res.json();
  },

  // Continue watching
  getContinueWatching: async () => {
    const res = await fetch(`${API_BASE}/watchlist/continue`);
    if (!res.ok) return [];
    return res.json();
  },

  saveProgress: async (movieId, progressSeconds, durationSeconds) => {
    try {
      await fetch(`${API_BASE}/watchlist/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, progressSeconds, durationSeconds }),
      });
    } catch (e) {
      console.warn('Could not save progress', e);
    }
  },

  removeContinueWatching: async (movieId) => {
    const res = await fetch(`${API_BASE}/watchlist/continue/${movieId}`, { method: 'DELETE' });
    return res.json();
  },

  // Backend Stats
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch system stats');
    return res.json();
  }
};

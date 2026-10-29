const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const { MovieQueries } = require('../db');
const { extractDriveId, getDrivePreviewUrl, getDriveDirectStreamUrl, resolveVideoSource } = require('../driveHelper');

/**
 * Resolve stream information for a movie by ID
 * Returns embed URL, direct stream URL, Drive status, and metadata
 */
router.get('/info/:id', (req, res) => {
  try {
    const movie = MovieQueries.getById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const videoSource = resolveVideoSource(movie.video_url);

    res.json({
      id: movie.id,
      title: movie.title,
      isDrive: videoSource.isDrive,
      driveId: videoSource.driveId,
      previewUrl: videoSource.previewUrl,
      streamUrl: videoSource.streamUrl,
      embedUrl: videoSource.embedUrl,
      duration: movie.duration,
      trailerUrl: movie.trailer_url
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Resolve an arbitrary Google Drive URL or ID
 * Useful for admin dashboard when testing links before adding
 */
router.post('/resolve-drive', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL or File ID is required' });
  }

  const driveId = extractDriveId(url);
  if (!driveId) {
    return res.status(400).json({
      valid: false,
      message: 'Could not extract a valid Google Drive File ID from this URL.'
    });
  }

  return res.json({
    valid: true,
    driveId,
    previewUrl: getDrivePreviewUrl(driveId),
    directStreamUrl: getDriveDirectStreamUrl(driveId),
    embedHtml: `<iframe src="${getDrivePreviewUrl(driveId)}" width="100%" height="100%" allow="autoplay" allowfullscreen></iframe>`
  });
});

/**
 * High-performance streaming proxy with HTTP 206 Partial Content (Range requests)
 * Handles fast buffer scrubbing and seamless playback
 */
router.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('url parameter is required');
  }

  try {
    const client = targetUrl.startsWith('https') ? https : http;
    const rangeHeader = req.headers.range;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    };

    if (rangeHeader) {
      options.headers['Range'] = rangeHeader;
    }

    const proxyReq = client.get(targetUrl, options, (proxyRes) => {
      // Handle redirects
      if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        return res.redirect(proxyRes.headers.location);
      }

      res.status(proxyRes.statusCode);

      // Forward relevant headers
      const headersToForward = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
        'cache-control'
      ];

      headersToForward.forEach((h) => {
        if (proxyRes.headers[h]) {
          res.setHeader(h, proxyRes.headers[h]);
        }
      });

      if (!proxyRes.headers['accept-ranges']) {
        res.setHeader('Accept-Ranges', 'bytes');
      }

      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[Stream Proxy Error]', err.message);
      if (!res.headersSent) {
        res.status(502).send('Error streaming media: ' + err.message);
      }
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;

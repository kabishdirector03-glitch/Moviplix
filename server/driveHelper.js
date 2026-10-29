/**
 * Google Drive Video Integration Helper for Moviplix
 * Handles parsing, stream resolution, and preview generation for Google Drive files.
 */

// Regex to capture Google Drive File IDs from various formats:
// 1. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// 2. https://drive.google.com/open?id=FILE_ID
// 3. https://drive.google.com/uc?id=FILE_ID&export=download
// 4. https://docs.google.com/file/d/FILE_ID
// 5. Raw 25-50 char alphanumeric ID with - or _
const DRIVE_ID_REGEX = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/(?:file\/d\/))([a-zA-Z0-9_-]{25,})|(^[a-zA-Z0-9_-]{25,50}$)/i;

/**
 * Extract Google Drive file ID from URL or string
 * @param {string} input - Drive URL or file ID
 * @returns {string|null} - Extracted File ID or null
 */
function extractDriveId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  const match = trimmed.match(DRIVE_ID_REGEX);
  if (match) {
    return match[1] || match[2] || null;
  }
  return null;
}

/**
 * Checks if input is or contains a Google Drive identifier/URL
 * @param {string} input
 * @returns {boolean}
 */
function isDriveSource(input) {
  if (!input) return false;
  return Boolean(extractDriveId(input) || input.includes('drive.google.com') || input.includes('docs.google.com'));
}

/**
 * Generates Google Drive preview embed URL
 * This allows streaming any public or shared Drive video directly without API key limits.
 * @param {string} fileId
 * @returns {string}
 */
function getDrivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Generates direct download/stream URL for Google Drive
 * @param {string} fileId
 * @returns {string}
 */
function getDriveDirectStreamUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Resolve video metadata and streaming configurations for Moviplix
 * @param {string} source - Direct URL or Google Drive link
 */
function resolveVideoSource(source) {
  if (!source) return { isDrive: false, streamUrl: '', previewUrl: '', driveId: null };

  const driveId = extractDriveId(source);
  if (driveId) {
    return {
      isDrive: true,
      driveId: driveId,
      previewUrl: getDrivePreviewUrl(driveId),
      streamUrl: getDriveDirectStreamUrl(driveId),
      embedUrl: getDrivePreviewUrl(driveId),
      rawSource: source
    };
  }

  return {
    isDrive: false,
    driveId: null,
    previewUrl: source,
    streamUrl: source,
    embedUrl: source,
    rawSource: source
  };
}

module.exports = {
  extractDriveId,
  isDriveSource,
  getDrivePreviewUrl,
  getDriveDirectStreamUrl,
  resolveVideoSource
};

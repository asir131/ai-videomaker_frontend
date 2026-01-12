import { api } from './api.js';

/**
 * Check FFmpeg installation status
 * @returns {Promise<Object>} Status object with installed flag
 */
export async function checkFFmpegStatus() {
  const response = await api.get('/api/ffmpeg-status');
  return response;
}

/**
 * Render videos using FFmpeg
 * @param {Array} scenes - Array of scene objects
 * @param {string} audioUrl - Audio URL
 * @param {string} projectName - Project name
 * @param {Object} transition - Transition settings
 * @param {boolean} renderFullVideo - Whether to render full merged video
 * @param {Object} captions - Caption settings (optional)
 * @returns {Promise<Object>} Render result data
 */
export async function renderVideos(scenes, audioUrl, projectName, transition, renderFullVideo, captions = null) {
  const response = await api.post('/api/render-videos', {
    scenes,
    audioUrl,
    projectName,
    transition,
    renderFullVideo,
    captions
  });
  return response;
}

/**
 * Get download URL for a specific video file
 * @param {string} sessionId - Session ID
 * @param {string} filename - Filename
 * @returns {string} Download URL
 */
export function getDownloadUrl(sessionId, filename) {
  return `/api/download-video/${sessionId}/${filename}`;
}

/**
 * Get download all URL for a session
 * @param {string} sessionId - Session ID
 * @returns {string} Download all URL
 */
export function getDownloadAllUrl(sessionId) {
  return `/api/download-all-videos/${sessionId}`;
}


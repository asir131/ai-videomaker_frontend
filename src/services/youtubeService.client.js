// =====================================================================
// Frontend YouTube Service - Client-side API calls
// This file is for the frontend/browser, not the backend
// =====================================================================

import { api } from './api.js';

/**
 * Get YouTube OAuth authorization URL
 * @returns {Promise<Object>} Auth URL and state
 */
export async function getYouTubeAuthUrl() {
  const response = await api.get('/api/youtube/auth');
  return response;
}

/**
 * Get YouTube connection status
 * @param {string} channelId - Channel ID
 * @returns {Promise<Object>} Connection status
 */
export async function getYouTubeStatus(channelId) {
  const response = await api.get(`/api/youtube/status?channelId=${channelId}`);
  return response;
}

/**
 * Disconnect YouTube account
 * @param {string} channelId - Channel ID
 * @returns {Promise<Object>} Disconnect result
 */
export async function disconnectYouTube(channelId) {
  const response = await api.post('/api/youtube/disconnect', { channelId });
  return response;
}

/**
 * Upload video to YouTube
 * @param {string} channelId - Channel ID
 * @param {string} sessionId - Video session ID
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @param {string} tags - Video tags (comma-separated)
 * @param {string} privacyStatus - Privacy status (private, unlisted, public)
 * @returns {Promise<Object>} Upload result
 */
export async function uploadToYouTube(channelId, sessionId, title, description, tags, privacyStatus) {
  const response = await api.post('/api/youtube/upload', {
    channelId,
    sessionId,
    title,
    description,
    tags,
    privacyStatus
  });
  return response;
}


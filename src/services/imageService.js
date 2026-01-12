import { api } from './api.js';

/**
 * Generate image using Ideogram API
 * @param {string} prompt - Image generation prompt
 * @param {string} aspectRatio - Aspect ratio (16:9, 9:16, 1:1, etc.)
 * @param {string} renderingSpeed - Rendering speed (FLASH, TURBO, DEFAULT, QUALITY)
 * @param {string} styleType - Style type (AUTO, GENERAL, REALISTIC, DESIGN, FICTION)
 * @returns {Promise<Object>} API response with image data
 */
export async function generateImage(prompt, aspectRatio = '16:9', renderingSpeed = 'TURBO', styleType = 'REALISTIC') {
  const response = await api.post('/api/generate-image', {
    prompt,
    aspectRatio,
    renderingSpeed,
    styleType
  });
  return response;
}

/**
 * Get proxy image URL (for downloading images)
 * @param {string} imageUrl - Original image URL
 * @returns {string} Proxy URL
 */
export function getProxyImageUrl(imageUrl) {
  return `/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
}


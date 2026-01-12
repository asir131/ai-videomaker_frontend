import { api } from './api.js';

/**
 * Generate script using Claude API
 * @param {string} prompt - The user prompt for script generation
 * @param {number} maxTokens - Maximum tokens (default: 4096)
 * @returns {Promise<Object>} Claude API response
 */
export async function generateScript(prompt, maxTokens = 4096) {
  const response = await api.post('/api/claude', {
    prompt,
    max_tokens: maxTokens
  });
  return response;
}

/**
 * Generate image prompt using Claude API
 * @param {string} prompt - The prompt for image generation
 * @param {number} maxTokens - Maximum tokens (default: 500)
 * @returns {Promise<Object>} API response with image prompt
 */
export async function generateImagePrompt(prompt, maxTokens = 500) {
  const response = await api.post('/api/chatgpt', {
    prompt,
    max_tokens: maxTokens
  });
  return response;
}


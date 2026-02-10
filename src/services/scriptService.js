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

/**
 * Generate a short description/summary for a video script (e.g. for YouTube or metadata).
 * @param {string} script - The full script text
 * @returns {Promise<string>} The generated description text
 */
export async function generateScriptDescription(script) {
  if (!script || !script.trim()) {
    throw new Error('Script is empty');
  }
  const prompt = `Write a brief video description in 2-4 sentences. It should summarize the story or topic for viewers (e.g. for a video title or YouTube description). Be concise and engaging. Do not include the script itself.
On the last line, add 3-5 hashtags separated by spaces (e.g. #Topic #Keyword #Category).

SCRIPT:
${script.trim().slice(0, 8000)}`;

  const response = await api.post('/api/claude', {
    prompt,
    max_tokens: 300
  });

  if (response && response.content && response.content[0] && response.content[0].text) {
    return response.content[0].text.trim();
  }
  throw new Error('Invalid response from description API');
}


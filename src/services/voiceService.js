import { api } from './api.js';

/**
 * Generate voice from text using AI33.pro backend
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - Voice ID (default: Juniper)
 * @param {Object} voiceSettings - Voice settings (stability, similarity_boost)
 * @returns {Promise<Object>} API response with audio data
 */
export async function generateVoice(text, voiceId = 'aMSt68OGf4xUZAnLpTU8', voiceSettings = {}) {
  const response = await api.post('/api/generate-voice', {
    text,
    voice_id: voiceId,
    voice_settings: voiceSettings
  });
  return response;
}


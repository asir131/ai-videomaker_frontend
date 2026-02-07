import { api } from './api.js';
import { API_BASE_URL, API_ENDPOINTS, SPEECHIFY_VOICES as FALLBACK_SPEECHIFY_VOICES } from '../utils/constants.js';

/** In-memory cache for Speechify voices from API. Null until first successful fetch. */
let cachedSpeechifyVoices = null;

/**
 * Sync getter for cached Speechify voices. Returns null until fetchSpeechifyVoices() has succeeded.
 * Callers should use this ?? SPEECHIFY_VOICES from constants as fallback.
 * @returns {Array<{ id: string, name: string, gender: string, accent?: string }> | null}
 */
export function getSpeechifyVoicesCache() {
  return cachedSpeechifyVoices;
}

/**
 * Fetch Speechify voices from backend and normalize to UI shape. Caches on success.
 * On failure returns fallback list from constants so user can still select a voice.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{ id: string, name: string, gender: string, accent?: string }>>}
 */
export async function fetchSpeechifyVoices(signal) {
  const url = API_BASE_URL ? `${API_BASE_URL}${API_ENDPOINTS.SPEECHIFY_VOICES}` : API_ENDPOINTS.SPEECHIFY_VOICES;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const raw = data.voices || [];
    const normalized = raw.map((v) => ({
      id: v.id,
      name: v.display_name ?? v.name ?? v.id,
      gender: (v.gender || 'unknown').toLowerCase(),
      accent: v.locale || v.accent || undefined,
      style: v.style,
      locale: v.locale
    }));
    cachedSpeechifyVoices = normalized;
    return normalized;
  } catch (e) {
    return FALLBACK_SPEECHIFY_VOICES;
  }
}

/**
 * Generate speech via Speechify backend. Returns a playable data URL.
 * @param {string} text - Input text (or SSML)
 * @param {string} voiceId - Voice ID from GET /api/speechify/voices
 * @param {{ audio_format?: string, language?: string, model?: string }} [options]
 * @param {AbortSignal} [signal]
 * @returns {Promise<string>} Data URL for audio (e.g. data:audio/mpeg;base64,...)
 */
export async function generateSpeechifySpeech(text, voiceId, options = {}, signal) {
  const url = API_BASE_URL ? `${API_BASE_URL}${API_ENDPOINTS.SPEECHIFY_SPEECH}` : API_ENDPOINTS.SPEECHIFY_SPEECH;
  const body = {
    input: text,
    voice_id: voiceId,
    audio_format: options.audio_format ?? 'mp3'
  };
  if (options.language) body.language = options.language;
  if (options.model) body.model = options.model;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = errBody.error || errBody.message || await res.text().catch(() => `HTTP ${res.status}`);
    if (res.status === 401) throw new Error('Speechify API key invalid.');
    if (res.status === 402) throw new Error('Speechify payment required.');
    throw new Error(msg || `Speechify error (${res.status})`);
  }

  const data = await res.json();
  const audio = data.audio;
  const contentType = data.contentType || 'audio/mpeg';
  if (!audio) throw new Error('No audio in Speechify response');
  return `data:${contentType};base64,${audio}`;
}

/**
 * Generate voice from text using ElevenLabs (AI33.pro backend)
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


# Frontend API Documentation

This document describes how the frontend should call the StoryVid AI backend. **API keys (e.g. Speechify) are never exposed to the frontend** — the backend holds them and proxies requests.

---

## Base URL

- **Development:** Backend port is written to `.backend-port` (default `3000`). Frontend typically runs on Vite (e.g. `5173`) and proxies `/api` to the backend.
- **Production:** Same origin as the frontend; use relative paths like `/api/...` or your deployed backend URL.

Example base URL: `http://localhost:3000` (replace with your backend origin when different).

---

## Speechify (Text-to-Speech)

The backend uses `SPEECHIFY_API_KEY` from `.env` to call Speechify. The frontend only talks to our backend.

### 1. List available voices

Use this to let the user pick a voice before generating speech.

**Request**

```http
GET /api/speechify/voices
```

No body. No auth required from frontend (backend uses the API key).

**Response**

```json
{
  "voices": [
    {
      "id": "voice-uuid-here",
      "display_name": "Voice name",
      "gender": "male",
      "locale": "en-US",
      "type": "shared",
      "preview_audio": null,
      "avatar_image": null,
      "models": [...],
      "tags": []
    }
  ]
}
```

Use each voice’s **`id`** as `voice_id` in `POST /api/speechify/speech`. Use `display_name` for UI labels.

---

### 2. Generate speech (TTS)

**Request**

```http
POST /api/speechify/speech
Content-Type: application/json
```

**Body**

| Field           | Type   | Required | Description |
|----------------|--------|----------|-------------|
| `input`        | string | Yes      | Plain text or SSML to synthesize. |
| `voice_id`     | string | Yes      | Voice ID from `GET /api/speechify/voices`. |
| `audio_format` | string | No       | One of: `wav`, `mp3`, `ogg`, `aac`, `pcm`. Default: `wav` (backend default for speech is `mp3`). |
| `language`     | string | No       | e.g. `en-US`. See [Speechify language support](https://docs.sws.speechify.com/docs/language-support). |
| `model`        | string | No       | `simba-english` or `simba-multilingual`. |

**Example**

```json
{
  "input": "Hello, this is a test.",
  "voice_id": "your-voice-id-from-voices-endpoint",
  "audio_format": "mp3"
}
```

**Success response (200)**

```json
{
  "audio": "<base64-encoded-audio>",
  "contentType": "audio/mpeg",
  "audio_format": "mp3",
  "billable_characters_count": 24,
  "speech_marks": { ... }
}
```

- **`audio`** — Base64-encoded audio. Decode and play via an `<audio>` element or `Audio` API (e.g. `src = "data:audio/mpeg;base64," + audio`).
- **`contentType`** — Use for the Data URL or `Blob` type (e.g. `audio/mpeg` for mp3).
- **`speech_marks`** — Optional word-level timing/metadata if you need highlights or sync.

**Error responses**

| Status | Meaning |
|--------|---------|
| 400   | Missing `input` or `voice_id`. |
| 401   | Backend Speechify API key invalid. |
| 402   | Speechify payment required. |
| 500   | Backend or Speechify error (check response body). |

---

### Frontend usage example (JavaScript)

```javascript
// 1. Get voices (e.g. on settings or voice picker load)
const voicesRes = await fetch(`${API_BASE}/api/speechify/voices`);
const { voices } = await voicesRes.json();
// use voices[0].id or the field your backend returns as voice id

// 2. Generate speech
const res = await fetch(`${API_BASE}/api/speechify/speech`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: 'Text to speak',
    voice_id: selectedVoiceId,
    audio_format: 'mp3'
  })
});
if (!res.ok) throw new Error(await res.text());
const { audio, contentType } = await res.json();

// 3. Play base64 audio
const dataUrl = `data:${contentType};base64,${audio}`;
const audioEl = new Audio(dataUrl);
audioEl.play();
```

---

## Other backend endpoints (reference)

- `POST /api/claude` — Script generation  
- `POST /api/generate-image` — Image generation  
- `POST /api/generate-voice` — Voice generation (AI33/ElevenLabs)  
- `POST /api/render-videos` — Video rendering  
- `GET /api/proxy-image` — Image proxy  
- `GET /api/health` — Health check  
- YouTube: `GET /api/youtube/auth`, `GET /api/youtube/callback`, `POST /api/youtube/upload`  

---

## Notes for frontend

1. **Never put Speechify (or any) API keys in frontend code.** All TTS goes through the backend.
2. **CORS:** Backend allows `*` for API; use your backend origin for `fetch` in production.
3. **Rate limits / size:** Speechify has input limits; see [Speechify API limits](https://docs.sws.speechify.com/docs/api-limits). Backend does not impose extra limits beyond that.
4. **Voices response shape:** If `GET /api/speechify/voices` returns a different structure, use the array of voice objects and the id field they provide for `voice_id`.

// Video History Service
// Manages video history storage and retrieval

const VIDEO_HISTORY_KEY = 'storyvid_video_history';

/**
 * Get all video history for current user
 */
export function getVideoHistory() {
  try {
    const history = localStorage.getItem(VIDEO_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading video history:', error);
    return [];
  }
}

/**
 * Add a video to history
 */
export function addVideoToHistory(videoData) {
  try {
    const history = getVideoHistory();
    const newVideo = {
      sessionId: videoData.sessionId,
      title: videoData.title || videoData.projectName || 'Untitled Video',
      date: videoData.date || Date.now(),
      duration: videoData.duration || 0,
      thumbnail: videoData.thumbnail || null,
      filePath: videoData.filePath || null,
      scenes: videoData.scenes || 0,
      transition: videoData.transition || null,
      creditsUsed: videoData.creditsUsed || 0,
      downloadUrl: videoData.downloadUrl || null,
      sceneVideos: videoData.sceneVideos || []
    };

    // Check if video already exists (update if exists)
    const existingIndex = history.findIndex(v => v.sessionId === newVideo.sessionId);
    if (existingIndex >= 0) {
      history[existingIndex] = newVideo;
    } else {
      history.unshift(newVideo); // Add to beginning
    }

    // Keep only last 100 videos
    if (history.length > 100) {
      history.splice(100);
    }

    localStorage.setItem(VIDEO_HISTORY_KEY, JSON.stringify(history));
    return newVideo;
  } catch (error) {
    console.error('Error adding video to history:', error);
    return null;
  }
}

/**
 * Remove a video from history
 */
export function removeVideoFromHistory(sessionId) {
  try {
    const history = getVideoHistory();
    const filtered = history.filter(v => v.sessionId !== sessionId);
    localStorage.setItem(VIDEO_HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing video from history:', error);
    return false;
  }
}

/**
 * Get a specific video by sessionId
 */
export function getVideoBySessionId(sessionId) {
  const history = getVideoHistory();
  return history.find(v => v.sessionId === sessionId) || null;
}

/**
 * Clear all video history
 */
export function clearVideoHistory() {
  try {
    localStorage.removeItem(VIDEO_HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing video history:', error);
    return false;
  }
}

/**
 * Export video history as JSON
 */
export function exportVideoHistory() {
  const history = getVideoHistory();
  const dataStr = JSON.stringify(history, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `video-history-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


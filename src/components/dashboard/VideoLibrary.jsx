import React, { useState, useEffect } from 'react';
import { Search, Grid3x3, List, Film, Download } from 'lucide-react';
import { getVideoHistory, removeVideoFromHistory } from '../../services/videoHistoryService';
import VideoCard from './VideoCard';

const VideoLibrary = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [searchQuery, videos]);

  const loadVideos = () => {
    const history = getVideoHistory();
    setVideos(history);
    setFilteredVideos(history);
  };

  const filterVideos = () => {
    if (!searchQuery.trim()) {
      setFilteredVideos(videos);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = videos.filter(video =>
      video.title.toLowerCase().includes(query) ||
      video.sessionId.toLowerCase().includes(query)
    );
    setFilteredVideos(filtered);
  };

  const handleDelete = (video) => {
    if (window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
      removeVideoFromHistory(video.sessionId);
      loadVideos();
    }
  };

  const handleDownload = (video) => {
    if (video.downloadUrl) {
      window.open(video.downloadUrl, '_blank');
    } else {
      // Fallback to session download
      window.open(`/api/download-video/${video.sessionId}/final_video_with_audio.mp4`, '_blank');
    }
  };

  const handlePlay = (video) => {
    // Open video in modal or new tab
    const url = video.downloadUrl || `/api/download-video/${video.sessionId}/final_video_with_audio.mp4`;
    window.open(url, '_blank');
  };

  const handleUploadToYouTube = (video) => {
    // Navigate to YouTube integration with video pre-selected
    window.location.href = `/app/youtube?video=${video.sessionId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Video Library</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
          </p>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 shadow-md'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Grid3x3 size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 shadow-md'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Videos */}
      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
            <Film className="text-indigo-600 dark:text-indigo-400" size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No videos found' : 'No videos yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Start creating your first video to see it here'}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.sessionId}
              video={video}
              viewMode={viewMode}
              onPlay={handlePlay}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onUploadToYouTube={handleUploadToYouTube}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;


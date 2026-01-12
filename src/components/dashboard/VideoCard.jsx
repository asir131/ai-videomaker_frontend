import React, { useState } from 'react';
import { 
  Play, 
  Download, 
  Trash2, 
  Youtube, 
  MoreVertical,
  Calendar,
  Clock,
  Film
} from 'lucide-react';

const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const VideoCard = ({ video, onPlay, onDownload, onDelete, onUploadToYouTube, viewMode = 'grid' }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
        {/* Thumbnail */}
        <div className="relative w-32 h-20 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
          ) : (
            <Film className="text-white" size={24} />
          )}
          <button
            onClick={() => onPlay && onPlay(video)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-all"
          >
            <Play className="text-white" size={20} fill="white" />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{video.title}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatTimeAgo(video.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatDuration(video.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Film size={14} />
              {video.scenes} scenes
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload && onDownload(video)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Download"
          >
            <Download size={18} />
          </button>
          {onUploadToYouTube && (
            <button
              onClick={() => onUploadToYouTube && onUploadToYouTube(video)}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Upload to YouTube"
            >
              <Youtube size={18} className="text-red-600 dark:text-red-400" />
            </button>
          )}
          <button
            onClick={() => onDelete && onDelete(video)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="relative group rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <Film className="text-white" size={48} />
        )}
        <button
          onClick={() => onPlay && onPlay(video)}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="text-indigo-600" size={24} fill="currentColor" />
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-2">{video.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{formatTimeAgo(video.date)}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatDuration(video.duration)}
          </span>
        </div>
      </div>

      {/* Actions Overlay */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDownload && onDownload(video)}
          className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg"
          title="Download"
        >
          <Download size={16} />
        </button>
        {onUploadToYouTube && (
          <button
            onClick={() => onUploadToYouTube && onUploadToYouTube(video)}
            className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg"
            title="Upload to YouTube"
          >
            <Youtube size={16} className="text-red-600 dark:text-red-400" />
          </button>
        )}
        <button
          onClick={() => onDelete && onDelete(video)}
          className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg"
          title="Delete"
        >
          <Trash2 size={16} className="text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default VideoCard;


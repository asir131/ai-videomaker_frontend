import React, { useState, useEffect } from 'react';
import { Youtube, CheckCircle, XCircle, Upload, Settings, History } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../../utils/constants';

const YouTubeIntegration = () => {
  const [connected, setConnected] = useState(false);
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);

  useEffect(() => {
    checkConnection();
    loadSettings();
  }, []);

  const checkConnection = async () => {
    try {
      // Construct URL - if API_BASE_URL is empty, use relative path (goes through Vite proxy)
      const url = API_BASE_URL ? `${API_BASE_URL}${API_ENDPOINTS.YOUTUBE_STATUS}` : API_ENDPOINTS.YOUTUBE_STATUS;
      const response = await fetch(url);
      const data = await response.json();
      if (data.connected) {
        setConnected(true);
        setChannelInfo(data.channel);
      }
    } catch (error) {
      console.error('Error checking YouTube connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const settings = localStorage.getItem('storyvid_youtube_settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setAutoUpload(parsed.autoUpload || false);
      } catch (error) {
        console.error('Error loading YouTube settings:', error);
      }
    }
  };

  const handleConnect = async () => {
    try {
      // Construct URL - if API_BASE_URL is empty, use relative path (goes through Vite proxy)
      const url = API_BASE_URL ? `${API_BASE_URL}${API_ENDPOINTS.YOUTUBE_AUTH}` : API_ENDPOINTS.YOUTUBE_AUTH;
      const response = await fetch(url);
      const data = await response.json();
      if (data.authUrl) {
        window.open(data.authUrl, 'youtube-oauth', 'width=600,height=700');
        
        // Poll for connection status
        const pollInterval = setInterval(async () => {
          try {
            // Construct URL - if API_BASE_URL is empty, use relative path (goes through Vite proxy)
            const statusUrl = API_BASE_URL ? `${API_BASE_URL}${API_ENDPOINTS.YOUTUBE_STATUS}` : API_ENDPOINTS.YOUTUBE_STATUS;
            const statusResponse = await fetch(statusUrl);
            const statusData = await statusResponse.json();
            if (statusData.connected) {
              setConnected(true);
              setChannelInfo(statusData.channel);
              clearInterval(pollInterval);
            }
          } catch (error) {
            console.error('Error checking connection status:', error);
          }
        }, 2000);
        
        // Clear interval after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch (error) {
      console.error('Error initiating YouTube connection:', error);
      alert('Failed to connect to YouTube. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect your YouTube channel?')) {
      try {
        // Construct URL - if API_BASE_URL is empty, use relative path (goes through Vite proxy)
        const url = API_BASE_URL ? `${API_BASE_URL}${API_ENDPOINTS.YOUTUBE_DISCONNECT}` : API_ENDPOINTS.YOUTUBE_DISCONNECT;
        await fetch(url, { method: 'POST' });
        setConnected(false);
        setChannelInfo(null);
      } catch (error) {
        console.error('Error disconnecting YouTube:', error);
        alert('Failed to disconnect. Please try again.');
      }
    }
  };

  const handleToggleAutoUpload = () => {
    const newValue = !autoUpload;
    setAutoUpload(newValue);
    localStorage.setItem('storyvid_youtube_settings', JSON.stringify({ autoUpload: newValue }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">YouTube Integration</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Connect your YouTube channel to upload videos directly</p>
      </div>

      {/* Connection Status */}
      <div className={`p-6 rounded-xl border-2 ${
        connected
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              connected
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {connected ? (
                <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
              ) : (
                <XCircle className="text-gray-400" size={32} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {connected ? 'Connected' : 'Not Connected'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {connected
                  ? 'Your YouTube channel is connected'
                  : 'Connect your YouTube channel to get started'}
              </p>
            </div>
          </div>
          {connected ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
            >
              <Youtube size={20} />
              Connect YouTube
            </button>
          )}
        </div>
      </div>

      {/* Channel Info */}
      {connected && channelInfo && (
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {channelInfo.avatar && (
              <img
                src={channelInfo.avatar}
                alt={channelInfo.name}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {channelInfo.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {channelInfo.subscribers || '0'} subscribers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Settings size={24} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Auto-Upload</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically upload videos to YouTube after rendering
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoUpload}
                onChange={handleToggleAutoUpload}
                disabled={!connected}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Upload History */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <History size={24} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload History</h2>
        </div>
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Upload size={48} className="mx-auto mb-2 opacity-50" />
          <p>No uploads yet</p>
          <p className="text-sm mt-1">Your uploaded videos will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default YouTubeIntegration;


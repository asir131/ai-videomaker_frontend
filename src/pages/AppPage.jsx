import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import VideoCreationWizard from '../components/dashboard/VideoCreationWizard';
import VideoLibrary from '../components/dashboard/VideoLibrary';
import CreditsDashboard from '../components/dashboard/CreditsDashboard';
import Settings from '../components/dashboard/Settings';
import YouTubeIntegration from '../components/dashboard/YouTubeIntegration';

const AppPage = () => {
    console.log('AppPage: Using new DashboardLayout');

    return (
        <DashboardLayout>
            <Routes>
                <Route
                    index
                    element={<VideoCreationWizard />}
                />
                <Route path="library" element={<VideoLibrary />} />
                <Route path="credits" element={<CreditsDashboard />} />
                <Route path="youtube" element={<YouTubeIntegration />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

const HelpPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Get help with using StoryVid AI</p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Welcome to StoryVid AI! Start by creating a script, then generate images and voice, and finally render your video.
                </p>
            </div>
        </div>
    );
};

export default AppPage;


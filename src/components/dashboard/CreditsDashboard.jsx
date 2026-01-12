import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, ShoppingCart, History, Zap, Image, Mic, Video as VideoIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CreditsDashboard = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [usageHistory, setUsageHistory] = useState([]);

  useEffect(() => {
    loadCredits();
    loadUsageHistory();
  }, [user]);

  const loadCredits = () => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userKey = `user_${currentUser}`;
        const userData = localStorage.getItem(userKey);
        if (userData) {
          const parsed = JSON.parse(userData);
          setCredits(parsed.credits || 0);
        }
      }
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  };

  const loadUsageHistory = () => {
    try {
      const history = localStorage.getItem('storyvid_credit_history');
      if (history) {
        setUsageHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading usage history:', error);
    }
  };

  const usageByFeature = {
    script: usageHistory.filter(h => h.type === 'script').reduce((sum, h) => sum + h.amount, 0),
    image: usageHistory.filter(h => h.type === 'image').reduce((sum, h) => sum + h.amount, 0),
    voice: usageHistory.filter(h => h.type === 'voice').reduce((sum, h) => sum + h.amount, 0),
    video: usageHistory.filter(h => h.type === 'video').reduce((sum, h) => sum + h.amount, 0),
  };

  const totalUsed = Object.values(usageByFeature).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credits & Billing</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your credits and view usage</p>
      </div>

      {/* Current Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-1">Current Balance</p>
              <h2 className="text-5xl font-bold">{credits}</h2>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Coins size={40} />
            </div>
          </div>
          <button className="mt-4 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl">
            <ShoppingCart size={18} className="inline mr-2" />
            Purchase Credits
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Zap className="text-yellow-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{usageByFeature.script}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Script Generation</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Image className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{usageByFeature.image}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Image Generation</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Mic className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{usageByFeature.voice}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Voice Generation</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <VideoIcon className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{usageByFeature.video}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Video Rendering</p>
        </div>
      </div>

      {/* Usage Chart Placeholder */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} />
            Usage Overview
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
            <p>Usage chart coming soon</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <History size={20} />
            Recent Transactions
          </h3>
        </div>
        {usageHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <History size={48} className="mx-auto mb-2 opacity-50" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {usageHistory.slice(0, 10).map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    {transaction.type === 'script' && <Zap className="text-indigo-600 dark:text-indigo-400" size={20} />}
                    {transaction.type === 'image' && <Image className="text-blue-600 dark:text-blue-400" size={20} />}
                    {transaction.type === 'voice' && <Mic className="text-green-600 dark:text-green-400" size={20} />}
                    {transaction.type === 'video' && <VideoIcon className="text-purple-600 dark:text-purple-400" size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{transaction.type} Generation</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 dark:text-red-400">-{transaction.amount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditsDashboard;


import React, { useState, useEffect } from 'react';
import { Coins, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CreditsNavbar = ({ onClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    // Load credits from localStorage
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

    loadCredits();
    
    // Listen for credit updates
    const handleStorageChange = () => {
      loadCredits();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (in case of same-tab updates)
    const interval = setInterval(loadCredits, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Only navigate if not already on credits page
      if (location.pathname !== '/app/credits') {
        navigate('/app/credits');
      }
    }
  };

  const isLowBalance = credits < 10;

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        isLowBalance
          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
          : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
      } shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0`}
    >
      {isLowBalance ? (
        <AlertCircle size={18} className="animate-pulse" />
      ) : (
        <Coins size={18} />
      )}
      <span className="font-bold text-lg">{credits}</span>
      <span className="hidden sm:inline text-sm opacity-90">Credits</span>
    </button>
  );
};

export default CreditsNavbar;


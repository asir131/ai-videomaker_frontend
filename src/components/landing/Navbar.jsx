import React, { useState } from 'react';
import { Video, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../auth/AuthModal';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/app');
        } else {
            setAuthModalOpen(true);
        }
    };

    return (
        <>
            <nav className="fixed w-full top-0 z-50 glass border-b border-white/20 dark:border-gray-800/50">
                <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <Video size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-heading font-bold text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            StoryVid AI
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 font-medium text-gray-600 dark:text-gray-300">
                        <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            Features
                        </a>
                        <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            Pricing
                        </a>
                        <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            How It Works
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => navigate('/app')}
                                    className="px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 min-h-[44px] text-sm sm:text-base"
                                >
                                    Go to App
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {user?.name || 'User'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={20} className="text-gray-600 dark:text-gray-300" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="px-4 sm:px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 min-h-[44px] text-sm sm:text-base"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </nav>
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </>
    );
};

export default Navbar;


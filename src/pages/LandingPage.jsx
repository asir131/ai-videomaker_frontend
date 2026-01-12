import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import PricingSection from '../components/landing/PricingSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/app');
        } else {
            setAuthModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <HeroSection onGetStarted={handleGetStarted} />
            <div id="features">
                <FeaturesSection />
            </div>
            <div id="pricing">
                <PricingSection onGetStarted={handleGetStarted} />
            </div>
            <div id="how-it-works">
                <HowItWorksSection />
            </div>
            <TestimonialsSection />
            <FAQSection />
            <CTASection onGetStarted={handleGetStarted} />
            
            {/* Footer */}
            <footer className="py-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                © 2024 StoryVid AI. Built with React & Tailwind.
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#features" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium">
                                Features
                            </a>
                            <a href="#pricing" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium">
                                Pricing
                            </a>
                            <a href="#how-it-works" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium">
                                How It Works
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>
    );
};

export default LandingPage;


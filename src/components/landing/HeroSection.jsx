import React, { useRef, useEffect } from 'react';
import { Sparkles, Zap, Video } from 'lucide-react';
import { fadeInUp } from '../../utils/animations';

const HeroSection = ({ onGetStarted }) => {
    const heroRef = useRef(null);

    useEffect(() => {
        if (heroRef.current) {
            fadeInUp(heroRef.current.children, 0.2);
        }
    }, []);

    return (
        <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] opacity-50 mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] opacity-30 mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="container mx-auto px-6 text-center" ref={heroRef}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium text-sm mb-8 border border-indigo-100 dark:border-indigo-800">
                    <Sparkles size={16} />
                    <span>AI Video Generation 2.0 is here</span>
                </div>

                <h1 className="font-heading text-5xl lg:text-7xl font-bold leading-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                    Turn Text into <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Cinematic Videos</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Create professional videos in minutes with our advanced AI pipeline.
                    Script, images, voiceover, and editing - all automated.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onGetStarted}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={20} />
                        Get Started
                    </button>
                    <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                        <Video size={20} />
                        Watch Demo
                    </button>
                </div>
            </div>
        </header>
    );
};

export default HeroSection;


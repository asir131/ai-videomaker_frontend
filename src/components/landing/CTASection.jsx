import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';

const CTASection = ({ onGetStarted }) => {
    return (
        <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
                        Ready to Create Amazing Videos?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join thousands of creators who are already using StoryVid AI to transform their content creation process.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onGetStarted}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            <Zap size={20} />
                            Get Started Free
                            <ArrowRight size={20} />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                            View Pricing
                        </button>
                    </div>
                    <p className="text-white/80 text-sm mt-6">
                        No credit card required • 5 free videos per month • Cancel anytime
                    </p>
                </div>
            </div>
        </section>
    );
};

export default CTASection;


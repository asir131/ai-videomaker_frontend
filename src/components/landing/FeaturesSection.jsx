import React, { useRef, useEffect } from 'react';
import { Layers, Sparkles, Music, Film } from 'lucide-react';
import { staggerFadeIn } from '../../utils/animations';

const FeaturesSection = () => {
    const featuresRef = useRef(null);

    useEffect(() => {
        if (featuresRef.current) {
            staggerFadeIn(featuresRef.current.children, 0.1);
        }
    }, []);

    const features = [
        { icon: <Layers className="text-blue-500" size={24} />, title: "AI Scripting", desc: "Claude 3.5 powered storytelling" },
        { icon: <Sparkles className="text-purple-500" size={24} />, title: "Visuals", desc: "Ideogram generated scenes" },
        { icon: <Music className="text-pink-500" size={24} />, title: "Voiceover", desc: "ElevenLabs neural voices" },
        { icon: <Film className="text-orange-500" size={24} />, title: "Rendering", desc: "Automated FFmpeg assembly" }
    ];

    return (
        <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-y border-gray-100 dark:border-gray-800">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8" ref={featuresRef}>
                    {features.map((feature, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;


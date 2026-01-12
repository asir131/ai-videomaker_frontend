import React from 'react';
import { FileText, Image, Mic, Film, ArrowRight } from 'lucide-react';

const HowItWorksSection = () => {
    const steps = [
        {
            number: 1,
            icon: <FileText className="text-indigo-600" size={32} />,
            title: 'Enter Title',
            description: 'Simply type your video idea or title. Our AI will understand your concept and create a compelling script.'
        },
        {
            number: 2,
            icon: <Image className="text-purple-600" size={32} />,
            title: 'Generate Script',
            description: 'Our advanced AI creates an engaging, retention-optimized script tailored to your title and style preferences.'
        },
        {
            number: 3,
            icon: <Mic className="text-pink-600" size={32} />,
            title: 'Add Media',
            description: 'AI generates stunning visuals and professional voiceover. Choose from multiple styles and voices to match your brand.'
        },
        {
            number: 4,
            icon: <Film className="text-orange-600" size={32} />,
            title: 'Render Video',
            description: 'We automatically assemble everything into a polished video with smooth transitions and perfect timing.'
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Create professional videos in just 4 simple steps
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-700 mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {step.icon}
                                    </div>
                                    <div className="absolute top-10 -right-4 hidden lg:block">
                                        {idx < steps.length - 1 && (
                                            <ArrowRight className="text-gray-300 dark:text-gray-600" size={24} />
                                        )}
                                    </div>
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm mb-4">
                                        {step.number}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;


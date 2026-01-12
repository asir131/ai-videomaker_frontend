import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Content Creator',
            avatar: '👩‍💼',
            rating: 5,
            text: 'StoryVid AI has completely transformed my content creation process. I can now produce high-quality videos in minutes instead of hours!'
        },
        {
            name: 'Michael Chen',
            role: 'Marketing Director',
            avatar: '👨‍💻',
            rating: 5,
            text: 'The AI-generated scripts are incredibly engaging. Our video retention rates have increased by 40% since we started using StoryVid.'
        },
        {
            name: 'Emily Rodriguez',
            role: 'YouTuber',
            avatar: '👩‍🎤',
            rating: 5,
            text: 'The voice options are amazing, and the image generation is top-notch. This tool has become essential to my workflow.'
        },
        {
            name: 'David Thompson',
            role: 'Agency Owner',
            avatar: '👨‍💼',
            rating: 5,
            text: 'We use StoryVid for all our client projects. It saves us time and money while delivering professional results every time.'
        }
    ];

    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                        What Our Users Say
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Join thousands of creators who are already using StoryVid AI
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {testimonials.map((testimonial, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="text-yellow-400 fill-yellow-400" size={16} />
                                ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                "{testimonial.text}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;


import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: 'How does StoryVid AI generate scripts?',
            answer: 'StoryVid AI uses advanced Claude 3.5 models to create engaging, retention-optimized scripts. Simply provide a title or concept, and our AI will generate a compelling narrative tailored to your needs.'
        },
        {
            question: 'What video styles are available?',
            answer: 'We offer multiple styles including cinematic, realistic, anime, comic book, oil painting, and many more. You can choose the style that best matches your content and brand.'
        },
        {
            question: 'Can I customize the generated content?',
            answer: 'Yes! You can edit scripts, regenerate images, choose different voices, and adjust various settings to match your exact requirements before rendering your final video.'
        },
        {
            question: 'How long does it take to generate a video?',
            answer: 'Typically, a complete video can be generated in 5-10 minutes, depending on the length and complexity. Script generation takes seconds, image generation takes a few minutes, and video rendering is the longest step.'
        },
        {
            question: 'What file formats are supported?',
            answer: 'We support standard video formats including MP4. You can download your videos in high quality and use them on any platform including YouTube, TikTok, Instagram, and more.'
        },
        {
            question: 'Is there a free trial?',
            answer: 'Yes! Our free plan includes 5 videos per month so you can try out all features. No credit card required to get started.'
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Everything you need to know about StoryVid AI
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden transition-all duration-300"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                                        openIndex === idx ? 'rotate-180' : ''
                                    }`}
                                    size={20}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;


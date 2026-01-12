import React from 'react';
import { Check } from 'lucide-react';

const PricingSection = ({ onGetStarted }) => {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            description: 'Perfect for trying out our platform',
            features: [
                '5 videos per month',
                'Basic AI scripts',
                'Standard quality images',
                'Community support'
            ],
            popular: false,
            cta: 'Get Started'
        },
        {
            name: 'Pro',
            price: '$29',
            period: 'per month',
            description: 'For content creators and professionals',
            features: [
                'Unlimited videos',
                'Advanced AI scripts',
                'HD quality images',
                'Premium voice options',
                'Priority support',
                'Custom branding'
            ],
            popular: true,
            cta: 'Start Free Trial'
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For teams and agencies',
            features: [
                'Everything in Pro',
                'Team collaboration',
                'API access',
                'Dedicated support',
                'Custom integrations',
                'SLA guarantee'
            ],
            popular: false,
            cta: 'Contact Sales'
        }
    ];

    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Choose the plan that's right for you. All plans include our core features.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                                plan.popular
                                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-500 shadow-xl scale-105'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                <div className="mb-2">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-gray-600 dark:text-gray-400 text-lg ml-2">/{plan.period}</span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, featureIdx) => (
                                    <li key={featureIdx} className="flex items-start gap-3">
                                        <Check className={`flex-shrink-0 mt-0.5 ${plan.popular ? 'text-indigo-600' : 'text-green-500'}`} size={20} />
                                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={onGetStarted}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${
                                    plan.popular
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                                }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;


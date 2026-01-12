import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ id, type, message, onClose, duration }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (duration <= 0) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - (100 / (duration / 50));
                return newProgress < 0 ? 0 : newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300); // Wait for animation
    };

    const config = {
        success: {
            icon: CheckCircle2,
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-800',
            textColor: 'text-green-800 dark:text-green-200',
            iconColor: 'text-green-600 dark:text-green-400',
            progressColor: 'bg-green-500'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-200 dark:border-red-800',
            textColor: 'text-red-800 dark:text-red-200',
            iconColor: 'text-red-600 dark:text-red-400',
            progressColor: 'bg-red-500'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            borderColor: 'border-yellow-200 dark:border-yellow-800',
            textColor: 'text-yellow-800 dark:text-yellow-200',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            progressColor: 'bg-yellow-500'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            textColor: 'text-blue-800 dark:text-blue-200',
            iconColor: 'text-blue-600 dark:text-blue-400',
            progressColor: 'bg-blue-500'
        }
    };

    const { icon: Icon, bgColor, borderColor, textColor, iconColor, progressColor } = config[type];

    return (
        <div
            className={`
        relative w-full max-w-sm rounded-xl border shadow-lg overflow-hidden
        ${bgColor} ${borderColor}
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
            role="alert"
        >
            {/* Progress bar */}
            {duration > 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                    <div
                        className={`h-full ${progressColor} transition-all duration-50 linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="flex items-start gap-3 p-4 pt-5">
                {/* Icon */}
                <div className={`flex-shrink-0 ${iconColor}`}>
                    <Icon size={24} />
                </div>

                {/* Message */}
                <div className={`flex-1 ${textColor} text-sm font-medium pt-0.5`}>
                    {message}
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className={`
            flex-shrink-0 ${iconColor} hover:opacity-70 transition-opacity
            rounded p-1 hover:bg-black/5 dark:hover:bg-white/5
          `}
                    aria-label="Close notification"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default Toast;

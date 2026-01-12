import React from 'react';

const ProgressBar = ({
    progress = 0,
    status = '',
    current = null,
    total = null,
    variant = 'info',
    showPercentage = true,
    className = ''
}) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    const variantStyles = {
        success: {
            bg: 'bg-green-100 dark:bg-green-900/20',
            bar: 'bg-gradient-to-r from-green-500 to-emerald-500',
            text: 'text-green-700 dark:text-green-400'
        },
        info: {
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            bar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
            text: 'text-blue-700 dark:text-blue-400'
        },
        warning: {
            bg: 'bg-yellow-100 dark:bg-yellow-900/20',
            bar: 'bg-gradient-to-r from-yellow-500 to-orange-500',
            text: 'text-yellow-700 dark:text-yellow-400'
        },
        error: {
            bg: 'bg-red-100 dark:bg-red-900/20',
            bar: 'bg-gradient-to-r from-red-500 to-rose-500',
            text: 'text-red-700 dark:text-red-400'
        }
    };

    const styles = variantStyles[variant] || variantStyles.info;

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Status and Counter */}
            <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${styles.text}`}>
                    {status}
                </span>
                <div className="flex items-center gap-2">
                    {current !== null && total !== null && (
                        <span className={`text-xs font-semibold ${styles.text}`}>
                            {current} / {total}
                        </span>
                    )}
                    {showPercentage && (
                        <span className={`text-xs font-bold ${styles.text}`}>
                            {Math.round(clampedProgress)}%
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className={`w-full h-3 rounded-full overflow-hidden ${styles.bg}`}>
                <div
                    className={`h-full ${styles.bar} transition-all duration-500 ease-out rounded-full shadow-lg`}
                    style={{ width: `${clampedProgress}%` }}
                >
                    {/* Shimmer effect */}
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;

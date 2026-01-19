import React from 'react';
import { Palette, Check } from 'lucide-react';

const StyleStatusCard = ({
    selectedStyle,
    onOpenStyleCreator,
    onOpenStyleModal
}) => {
    if (selectedStyle) {
        return (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <Check size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Style Selected: {selectedStyle.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {selectedStyle.language} • {selectedStyle.wordCount} words • {selectedStyle.mode} mode
                    </p>
                </div>
                <button
                    onClick={onOpenStyleModal}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors flex-shrink-0"
                >
                    Change
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Palette size={20} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">Style Required</p>
                <p className="text-xs text-red-700 dark:text-red-300">
                    Please select or create a style to continue
                </p>
            </div>
            <button
                onClick={onOpenStyleCreator}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex-shrink-0"
            >
                Create Style
            </button>
        </div>
    );
};

export default StyleStatusCard;

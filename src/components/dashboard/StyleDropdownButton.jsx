import React from 'react';
import { Palette, Plus, Settings } from 'lucide-react';

const StyleDropdownButton = ({
    selectedStyle,
    showStyleDropdown,
    setShowStyleDropdown,
    styleDropdownRef,
    onOpenStyleCreator,
    onOpenStyleManager
}) => {
    return (
        <div className="relative" ref={styleDropdownRef}>
            <button
                onClick={() => setShowStyleDropdown(prev => !prev)}
                className={`h-full aspect-square flex items-center justify-center rounded-xl border transition-all relative ${selectedStyle
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border-indigo-300'
                    : 'bg-white dark:bg-gray-800 text-red-500 hover:text-indigo-500 border-red-300 hover:border-indigo-300 animate-pulse'
                    }`}
                title={selectedStyle ? `Style: ${selectedStyle.name}` : "⚠️ Style Required - Click to select"}
            >
                <Palette size={36} />
                {!selectedStyle && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
            </button>
            {showStyleDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
                    <button
                        onClick={onOpenStyleCreator}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Plus size={16} />
                        Create New Style
                    </button>
                    <button
                        onClick={onOpenStyleManager}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Settings size={16} />
                        Manage Styles
                    </button>
                </div>
            )}
        </div>
    );
};

export default StyleDropdownButton;

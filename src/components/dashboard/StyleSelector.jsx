import React, { useState } from 'react';
import { Palette, Plus, Check, Edit, Trash2, Sparkles } from 'lucide-react';

const StyleSelector = ({
    styles,
    selectedStyle,
    onSelectStyle,
    onCreateNew,
    onEditStyle,
    onDeleteStyle,
    onOpenModal
}) => {
    const [showAllStyles, setShowAllStyles] = useState(false);
    const [hoveredStyleId, setHoveredStyleId] = useState(null);

    // Show first 3 styles, rest in expanded view
    const displayedStyles = showAllStyles ? styles : styles.slice(0, 3);
    const hasMoreStyles = styles.length > 3;

    return (
        <div className="space-y-4">
            {/* Style Selection Grid */}
            {styles.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {selectedStyle ? 'Change Style' : 'Select a Style'}
                        </h4>
                        {hasMoreStyles && (
                            <button
                                onClick={() => setShowAllStyles(!showAllStyles)}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                            >
                                {showAllStyles ? 'Show Less' : `Show All (${styles.length})`}
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {displayedStyles.map((style) => {
                            const isSelected = selectedStyle?.id === style.id;
                            const isHovered = hoveredStyleId === style.id;

                            return (
                                <div
                                    key={style.id}
                                    onClick={() => onSelectStyle(style)}
                                    onMouseEnter={() => setHoveredStyleId(style.id)}
                                    onMouseLeave={() => setHoveredStyleId(null)}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all group ${isSelected
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                                        }`}
                                >
                                    {/* Selected Indicator */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                            <Check size={14} />
                                        </div>
                                    )}

                                    {/* Style Icon */}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${isSelected
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30'
                                        }`}>
                                        <Sparkles size={18} />
                                    </div>

                                    {/* Style Name */}
                                    <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-1 truncate">
                                        {style.name}
                                    </h5>

                                    {/* Style Details */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{style.language}</span>
                                        <span>•</span>
                                        <span>{style.wordCount} words</span>
                                    </div>
                                    <div className='flex gap-2 mt-1'>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditStyle(style);
                                            }}
                                            className="px-3 w-full py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md transition-colors flex items-center gap-1.5"
                                        >
                                            <Edit size={12} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteStyle(e, style.id);
                                            }}
                                            className="px-3 w-full py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 shadow-md transition-colors flex items-center gap-1.5"
                                        >
                                            <Trash2 size={12} />
                                            Delete
                                        </button>
                                    </div>
                                    {/* Action Buttons on Hover */}
                                    {/* {isHovered && !isSelected && (
                                        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditStyle(style);
                                                }}
                                                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md transition-colors flex items-center gap-1.5"
                                            >
                                                <Edit size={12} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteStyle(e, style.id);
                                                }}
                                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 shadow-md transition-colors flex items-center gap-1.5"
                                            >
                                                <Trash2 size={12} />
                                                Delete
                                            </button>
                                        </div>
                                    )} */}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Create New Style Button */}
            <button
                onClick={onCreateNew}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
                <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <Plus size={20} />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        Create New Style
                    </span>
                </div>
            </button>

            {/* Empty State */}
            {styles.length === 0 && (
                <div className="text-center py-8 px-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                        <Palette size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        No styles created yet. Create your first style to get started!
                    </p>
                </div>
            )}
        </div>
    );
};

export default StyleSelector;

import React, { useState, useRef, useEffect } from 'react';
import { useScript } from '../context/ScriptContext';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import { generateScript } from '../services/scriptService';
import { DEFAULTS, LANGUAGES } from '../utils/constants';
import { Sparkles, Settings, FileText, ChevronDown, Loader2, Upload, X, Palette, Plus, Edit, Trash2, ArrowLeft, Check } from 'lucide-react';
import { generateMockStory } from '../utils/mockStoryGenerator';
// Animation imports removed to prevent runtime errors

import ScriptEditor from './ScriptEditor';

const ScriptGenerator = () => {
    const containerRef = useRef(null);
    const {
        title, setTitle,
        script, setScript,
        wordCount, setWordCount,
        isGenerating, setIsGenerating
    } = useScript();

    const { setLoading } = useUI();
    const { showSuccess, showError, showWarning } = useToast();

    const [additionalContext, setAdditionalContext] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState(null);

    // Style System State
    const [styles, setStyles] = useState([]);
    const [selectedStyle, setSelectedStyle] = useState(null);
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [styleViewMode, setStyleViewMode] = useState('list'); // 'list', 'create', 'edit'
    const [showStyleDropdown, setShowStyleDropdown] = useState(false);
    const [newStyle, setNewStyle] = useState({
        name: '',
        wordCount: DEFAULTS.DEFAULT_WORD_COUNT,
        language: 'English',
        referenceVideo: '',
        mode: 'Fast',
        context: '',
        voiceSpeed: 80,
        similarity: 100,
        stability: 100,
        exaggeration: 100,
    });

    const fileInputRef = useRef(null);
    const styleDropdownRef = useRef(null);

    // Close style dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target)) {
                setShowStyleDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [styleDropdownRef]);

    // Load styles from localStorage
    useEffect(() => {
        const savedStyles = localStorage.getItem('ai-videomakr-styles');
        if (savedStyles) {
            try {
                const parsed = JSON.parse(savedStyles);
                setStyles(parsed);
            } catch (e) {
                console.error('Failed to parse saved styles', e);
            }
        }
    }, []);

    // Save styles to localStorage whenever they change
    useEffect(() => {
        if (styles.length > 0) {
            localStorage.setItem('ai-videomakr-styles', JSON.stringify(styles));
        } else {
            localStorage.removeItem('ai-videomakr-styles'); // Clear if no styles
        }
    }, [styles]);

    // ESC key handler for modal
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showStyleModal) {
                setShowStyleModal(false);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showStyleModal]);

    // Animation effect removed - was causing runtime errors
    // useEffect(() => {
    //     fadeInUp(containerRef.current);
    // }, []);

    const handleGenerate = async () => {
        if (!title) {
            showWarning('Please enter a title');
            return;
        }

        setIsGenerating(true);
        setLoading(prev => ({ ...prev, script: true }));

        try {
            const mainWordCount = wordCount || DEFAULTS.DEFAULT_WORD_COUNT;
            let userPrompt = `Write a ${mainWordCount}-word story for this title: "${title}".`;

            if (selectedStyle) {
                userPrompt += ` Language: ${selectedStyle.language}.`;
                userPrompt += ` Writing Mode: ${selectedStyle.mode}.`;
                if (selectedStyle.referenceVideo) {
                    userPrompt += ` Style Reference: ${selectedStyle.referenceVideo}.`;
                }
            }

            if (additionalContext) {
                userPrompt += ` Additional context: ${additionalContext}`;
            }

            const fullPrompt = `NARRATION RULES - STRICTLY FOLLOW:
- Write in pure narrative form only - NO subtitles, headings, or section breaks
- Do NOT use any special characters like #, *, _, or formatting symbols
- Do NOT include [Scene descriptions] or (parenthetical notes)
- NO chapter markers, timestamps, or labeled segments
- Write as one continuous flowing story from beginning to end
- Use natural paragraph breaks only
- Write EXACTLY as it should be spoken aloud by a narrator

STORYTELLING RULES FOR 90%+ RETENTION:
- Start with an immediate hook in the first 5 seconds that creates curiosity or shock
- Use the "open loop" technique - raise questions early and answer them later
- Build tension constantly - every paragraph should make viewers want to know "what happens next"
- Include unexpected plot twists every 30-45 seconds of narration
- Use cliffhangers before natural pause points
- Add specific, vivid details that paint mental pictures
- Include emotional moments that connect with viewers
- Use short, punchy sentences mixed with longer descriptive ones for rhythm
- Employ "pattern interrupts" - sudden changes in tone, pace, or revelation
- Foreshadow future events to create anticipation: "Little did they know..." or "But that was before..."
- End paragraphs with questions or incomplete thoughts that pull readers forward
- Use power words: "suddenly", "but then", "without warning", "the truth was"
- Build to a climactic reveal or satisfying conclusion
- Pace the story like a rollercoaster - tension, release, bigger tension
- Make every sentence earn its place - cut all filler
- Create relatable stakes - make audience care about what happens

USER REQUEST:
${userPrompt}`;

            const data = await generateScript(fullPrompt, 8000);

            if (data && data.content && data.content[0] && data.content[0].text) {
                setScript(data.content[0].text);
                showSuccess('Script generated successfully! Transitioning to editor...');
            } else {
                throw new Error('Invalid response from script generation API');
            }

        } catch (error) {
            console.error('Error generating script:', error);
            
            // Check if it's a quota exceeded error
            const isQuotaError = error.message?.toLowerCase().includes('quota') || 
                                 error.message?.toLowerCase().includes('exceeded') ||
                                 error.message?.toLowerCase().includes('billing');
            
            if (isQuotaError) {
                // Generate mock story as fallback
                console.log('⚠️ API quota exceeded, generating mock story...');
                const mockStory = generateMockStory(title, 150);
                setScript(mockStory);
                showWarning('API quota exceeded. Generated a sample 150-word story. Upgrade your plan for AI-generated content.');
            } else {
                showError('Failed to generate script: ' + error.message);
            }
        } finally {
            setIsGenerating(false);
            setLoading(prev => ({ ...prev, script: false }));
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.txt')) {
            showWarning('Please upload a .txt file');
            return;
        }

        // Validate file size (max 1MB)
        if (file.size > 1024 * 1024) {
            showWarning('File size must be less than 1MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                parseUploadedScript(content, file.name);
            } catch (error) {
                console.error('Error reading file:', error);
                showError('Failed to read file. Please try again.');
            }
        };
        reader.onerror = () => {
            showError('Error reading file. Please try again.');
        };
        reader.readAsText(file);
    };

    const parseUploadedScript = (content, fileName) => {
        // Try to extract title from first line or filename
        let scriptContent = content.trim();
        let extractedTitle = '';

        // Check if first line looks like a title (short, no punctuation at end, or has "Title:" prefix)
        const lines = scriptContent.split('\n').filter(line => line.trim());

        if (lines.length > 0) {
            const firstLine = lines[0].trim();

            // Check for "Title:" prefix
            if (firstLine.toLowerCase().startsWith('title:')) {
                extractedTitle = firstLine.substring(6).trim();
                scriptContent = lines.slice(1).join('\n').trim();
            }
            // Check if first line is short and looks like a title
            else if (firstLine.length < 100 && !firstLine.match(/[.!?]$/)) {
                // Check if second line is empty or starts with capital (likely paragraph start)
                if (lines.length > 1 && (lines[1].trim() === '' || /^[A-Z]/.test(lines[1].trim()))) {
                    extractedTitle = firstLine;
                    scriptContent = lines.slice(1).join('\n').trim();
                }
            }
        }

        // If no title extracted, use filename without extension
        if (!extractedTitle && fileName) {
            extractedTitle = fileName.replace(/\.txt$/i, '').replace(/[_-]/g, ' ');
        }

        // Set the script and title
        if (extractedTitle) {
            setTitle(extractedTitle);
        }

        setScript(scriptContent);
        setUploadedFileName(fileName);

        // Show success message
        showSuccess(`Script uploaded successfully!${extractedTitle ? ` Title: ${extractedTitle}` : ''}`);
        setTimeout(() => {
            showSuccess('You can now proceed to edit and parse it into scenes.');
        }, 500);
    };

    const handleRemoveUpload = () => {
        setUploadedFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCreateStyle = () => {
        if (!newStyle.name || !newStyle.language) {
            showWarning('Please fill in required fields (Name and Language)');
            return;
        }

        const style = { ...newStyle, id: Date.now() };
        const updatedStyles = [...styles, style];
        setStyles(updatedStyles);
        handleSelectStyle(style);

        // Return to list view
        setStyleViewMode('list');
        showSuccess(`Style "${style.name}" created!`);
    };

    const handleUpdateStyle = () => {
        if (!newStyle.name || !newStyle.language) {
            showWarning('Please fill in required fields');
            return;
        }

        const updatedStyles = styles.map(s => s.id === newStyle.id ? newStyle : s);
        setStyles(updatedStyles);

        if (selectedStyle && selectedStyle.id === newStyle.id) {
            setSelectedStyle(newStyle);
        }

        setStyleViewMode('list');
        showSuccess(`Style "${newStyle.name}" updated!`);
    };

    const handleDeleteStyle = (e, id) => {
        e.stopPropagation();
        const updatedStyles = styles.filter(s => s.id !== id);
        setStyles(updatedStyles);

        if (selectedStyle && selectedStyle.id === id) {
            setSelectedStyle(null);
            setWordCount(DEFAULTS.DEFAULT_WORD_COUNT);
            setAdditionalContext('');
        }

        // Update localStorage immediately if empty
        if (updatedStyles.length === 0) {
            localStorage.removeItem('ai-videomakr-styles');
        }
    };

    const startEditStyle = (e, style) => {
        e.stopPropagation();
        setNewStyle({
            ...{ // Defaults for older styles
                voiceSpeed: 80,
                similarity: 50,
                stability: 50,
                exaggeration: 50
            },
            ...style
        });
        setStyleViewMode('edit');
        setShowStyleDropdown(false);
        setShowStyleModal(true);
    };

    const handleSelectStyle = (style) => {
        setSelectedStyle(style);
        setWordCount(style.wordCount);
        setAdditionalContext(style.context || '');
        setShowStyleModal(false);
        setShowStyleDropdown(false);
    };

    const openStyleCreator = () => {
        setStyleViewMode('create');
        setNewStyle({
            name: '',
            wordCount: DEFAULTS.DEFAULT_WORD_COUNT,
            language: 'English',
            referenceVideo: '',
            mode: 'Fast',
            context: '',
            voiceSpeed: 80,
            similarity: 100,
            stability: 100,
            exaggeration: 100,
        });
        setShowStyleDropdown(false);
        setShowStyleModal(true);
    }

    const openStyleManager = () => {
        setStyleViewMode('list');
        setShowStyleDropdown(false);
        setShowStyleModal(true);
    }

    // Debug: Log when component renders
    useEffect(() => {
        console.log('ScriptGenerator: Component rendered, upload section should be visible');
    }, []);


    if (showStyleModal) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowStyleModal(false)}
            >
                <div
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col"
                    onClick={e => e.stopPropagation()}
                >

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                            {styleViewMode !== 'list' && (
                                <button
                                    onClick={() => setStyleViewMode('list')}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                                </button>
                            )}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {styleViewMode === 'list' ? 'Style Library' : (styleViewMode === 'edit' ? 'Edit Style' : 'Create New Style')}
                            </h3>
                        </div>
                        <button
                            onClick={() => setShowStyleModal(false)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                        {/* LIST VIEW */}
                        {styleViewMode === 'list' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Create New Card */}
                                    <button
                                        onClick={() => {
                                            setNewStyle({
                                                name: '',
                                                wordCount: DEFAULTS.DEFAULT_WORD_COUNT,
                                                language: 'English',
                                                referenceVideo: '',
                                                mode: 'Fast',
                                                context: ''
                                            });
                                            setStyleViewMode('create');
                                        }}
                                        className="flex flex-col items-center justify-center min-h-[180px] p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                                            <Plus size={24} />
                                        </div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Create New Style</span>
                                    </button>

                                    {/* Style Cards */}
                                    {styles.map(style => (
                                        <div
                                            key={style.id}
                                            onClick={() => handleSelectStyle(style)}
                                            className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-lg ${selectedStyle?.id === style.id
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-indigo-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                                                    <FileText size={20} />
                                                </div>
                                                {selectedStyle?.id === style.id && (
                                                    <div className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                        <Check size={12} /> Active
                                                    </div>
                                                )}
                                            </div>

                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1 truncate">{style.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{style.language} • {style.wordCount} words</p>

                                            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                                <button
                                                    onClick={(e) => startEditStyle(e, style)}
                                                    className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteStyle(e, style.id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {styles.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500 dark:text-gray-400">No styles created yet. Create one to get started!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CREATE / EDIT FORM */}
                        {(styleViewMode === 'create' || styleViewMode === 'edit') && (
                            <div className=" mx-auto space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Style Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={newStyle.name}
                                        onChange={(e) => setNewStyle({ ...newStyle, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="e.g., Mystery Narration"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Word Count</label>
                                        <input
                                            type="number"
                                            value={newStyle.wordCount}
                                            onChange={(e) => setNewStyle({ ...newStyle, wordCount: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language <span className="text-red-500">*</span></label>
                                        <div className="relative group">
                                            <select
                                                value={newStyle.language}
                                                onChange={(e) => setNewStyle({ ...newStyle, language: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer transition-all"
                                            >
                                                {LANGUAGES.map(lang => (
                                                    <option key={lang} value={lang}>{lang}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reference Video Link</label>
                                    <input
                                        type="text"
                                        value={newStyle.referenceVideo}
                                        onChange={(e) => setNewStyle({ ...newStyle, referenceVideo: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>

                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setShowSettings(!showSettings)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Settings size={18} /> Advanced Settings
                                        </span>
                                        <ChevronDown size={18} className={`text-gray-500 transform transition-transform duration-300 ${showSettings ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showSettings ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4 bg-white dark:bg-gray-900">
                                            {/* Voice Controls START */}
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
                                                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">Voice Controls</h4>
                                                <div className="space-y-4">
                                                    {/* Voice Speed */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Speed</label>
                                                            <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400">{newStyle.voiceSpeed}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="120"
                                                            value={newStyle.voiceSpeed}
                                                            onChange={(e) => setNewStyle({ ...newStyle, voiceSpeed: Number(e.target.value) })}
                                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>
                                                    {/* Similarity */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Similarity</label>
                                                            <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400">{newStyle.similarity}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={newStyle.similarity}
                                                            onChange={(e) => setNewStyle({ ...newStyle, similarity: Number(e.target.value) })}
                                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>
                                                    {/* Stability */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stability</label>
                                                            <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400">{newStyle.stability}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={newStyle.stability}
                                                            onChange={(e) => setNewStyle({ ...newStyle, stability: Number(e.target.value) })}
                                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>
                                                    {/* Exaggeration */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exaggeration</label>
                                                            <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400">{newStyle.exaggeration}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={newStyle.exaggeration}
                                                            onChange={(e) => setNewStyle({ ...newStyle, exaggeration: Number(e.target.value) })}
                                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Voice Controls END */}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Script Writing Mode</label>
                                                <div className="flex gap-4">
                                                    {['Fast', 'Slow'].map(mode => (
                                                        <label key={mode} className="flex items-center gap-2 cursor-pointer group/radio">
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${newStyle.mode === mode ? 'border-indigo-600' : 'border-gray-300 dark:border-gray-600 group-hover/radio:border-indigo-400'}`}>
                                                                {newStyle.mode === mode && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                                            </div>
                                                            <input
                                                                type="radio"
                                                                name="mode"
                                                                value={mode}
                                                                checked={newStyle.mode === mode}
                                                                onChange={(e) => setNewStyle({ ...newStyle, mode: e.target.value })}
                                                                className="hidden"
                                                            />
                                                            <span className="text-gray-700 dark:text-gray-300 capitalize">{mode}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Context</label>
                                                <textarea
                                                    value={newStyle.context}
                                                    onChange={(e) => setNewStyle({ ...newStyle, context: e.target.value })}
                                                    rows="3"
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                                    placeholder="Extra instructions..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setStyleViewMode('list')}
                                        className="px-6 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={styleViewMode === 'create' ? handleCreateStyle : handleUpdateStyle}
                                        disabled={!newStyle.name || !newStyle.language}
                                        className={`px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${!newStyle.name || !newStyle.language
                                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none'
                                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-95'
                                            }`}
                                    >
                                        {styleViewMode === 'create' ? 'Create Style' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {script ? (
                <div className="animate-in fade-in duration-500">
                    <ScriptEditor />
                </div>
            ) : (
                <div ref={containerRef} className="glass-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors duration-500" />

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Script Generation</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Start your video creation journey here</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* File Upload Section - Prominent - MUST BE VISIBLE */}
                        <div className="p-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border-2 border-dashed border-indigo-400 dark:border-indigo-500 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-lg" style={{ display: 'block !important', visibility: 'visible !important' }}>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-200 dark:bg-indigo-900/50 mb-4 shadow-md">
                                    <Upload className="text-indigo-700 dark:text-indigo-300" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Upload Your Script
                                </h3>
                                <p className="text-base text-gray-700 dark:text-gray-300 mb-6 font-medium">
                                    Have a script ready? Upload a .txt file to get started instantly
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".txt"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="script-upload"
                                    />
                                    <label
                                        htmlFor="script-upload"
                                        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 text-lg"
                                    >
                                        <Upload size={24} />
                                        Choose .txt File
                                    </label>
                                    {uploadedFileName && (
                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                                            <FileText size={18} />
                                            <span className="text-sm font-medium">{uploadedFileName}</span>
                                            <button
                                                onClick={handleRemoveUpload}
                                                className="ml-2 hover:bg-green-200 dark:hover:bg-green-900/50 rounded p-1 transition-colors"
                                                title="Remove file"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative flex items-center my-6">
                            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                            <span className="px-4 text-sm text-gray-500 dark:text-gray-400 font-semibold bg-white dark:bg-gray-800">OR</span>
                            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                        </div>

                        <div className="group/input">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                Video Title
                            </label>
                            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., The Mystery of the Lost City"
                                    className="w-full px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-indigo-500 transition-all outline-none text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm hover:shadow-md"
                                />

                                <div className="relative" ref={styleDropdownRef}>
                                    <button
                                        onClick={() => setShowStyleDropdown(prev => !prev)}
                                        className={`h-full aspect-square flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 transition-all ${selectedStyle
                                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border-indigo-300'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-indigo-500 hover:border-indigo-300'
                                            }`}
                                        title="Manage Styles"
                                    >
                                        <Palette size={36} />
                                    </button>
                                    {showStyleDropdown && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
                                            <button
                                                onClick={openStyleCreator}
                                                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Plus size={16} />
                                                Create New Style
                                            </button>
                                            <button
                                                onClick={openStyleManager}
                                                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Settings size={16} />
                                                Manage Styles
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>



                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !title}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform flex items-center justify-center gap-3 min-h-[56px]
                                ${isGenerating || !title
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'}`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Generating Magic...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    <span>Generate Script</span>
                                </>
                            )}
                        </button>
                    </div>


                </div>
            )}
        </>
    );
};


export default ScriptGenerator;

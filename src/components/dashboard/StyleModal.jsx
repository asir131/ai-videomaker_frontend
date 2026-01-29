import React, { useState, useRef } from 'react';
import { X, ArrowLeft, Plus, Edit, Trash2, Check, Settings, ChevronDown, FileText, Play, Pause, Mic, Loader2, StopCircle, XCircle } from 'lucide-react';
import { DEFAULTS, LANGUAGES, VOICES, VOICE_PROVIDERS, API_BASE_URL } from '../../utils/constants';

// Voice preview function
const generateVoicePreview = async (text, voiceId, provider) => {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/generate-voice` : '/api/generate-voice';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            voice_id: voiceId,
            voice_settings: provider
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.audio_url || data.url || data.audioUrl || data;
};

const StyleModal = ({
    showModal,
    onClose,
    styleViewMode,
    setStyleViewMode,
    styles,
    selectedStyle,
    newStyle,
    setNewStyle,
    showSettings,
    setShowSettings,
    onSelectStyle,
    onCreateStyle,
    onUpdateStyle,
    onDeleteStyle,
    onStartEditStyle
}) => {
    // Voice preview state
    const [voiceProvider, setVoiceProvider] = useState(newStyle.voiceProvider || VOICE_PROVIDERS.ELEVENLABS);
    const [previewPlayingId, setPreviewPlayingId] = useState(null);
    const [previewLoadingId, setPreviewLoadingId] = useState(null);
    const previewAudioRef = useRef(new Audio());
    const previewCache = useRef({});

    // Update voice provider when newStyle changes
    React.useEffect(() => {
        if (newStyle.voiceProvider) {
            setVoiceProvider(newStyle.voiceProvider);
        } else {
            // Default to ElevenLabs if not set
            setVoiceProvider(VOICE_PROVIDERS.ELEVENLABS);
        }
    }, [newStyle.voiceProvider]);

    const handleVoicePreview = async (e, voice) => {
        e.stopPropagation();
        const voiceId = voice.id;

        if (previewPlayingId === voiceId) {
            previewAudioRef.current.pause();
            previewAudioRef.current.currentTime = 0;
            setPreviewPlayingId(null);
            return;
        }

        // Stop any other preview
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
        setPreviewPlayingId(null);

        try {
            setPreviewLoadingId(voiceId);
            let url = previewCache.current[voiceId];
            if (!url) {
                const text = `Hello, I am ${voice.name}. This is a preview of my voice.`;
                url = await generateVoicePreview(text, voiceId, voiceProvider);
                previewCache.current[voiceId] = url;
            }

            previewAudioRef.current.src = url;
            previewAudioRef.current.onended = () => setPreviewPlayingId(null);

            const playPromise = previewAudioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Playback failed:", error);
                    setPreviewPlayingId(null);
                });
            }
            setPreviewPlayingId(voiceId);
        } catch (error) {
            console.error('Preview error:', error);
        } finally {
            setPreviewLoadingId(null);
        }
    };

    if (!showModal) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
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
                        onClick={onClose}
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
                                            referenceVideo: [],
                                            mode: 'Fast',
                                            context: '',
                                            voiceSpeed: 80,
                                            similarity: 100,
                                            stability: 100,
                                            exaggeration: 100,
                                            voiceProvider: VOICE_PROVIDERS.ELEVENLABS,
                                            voiceId: VOICES[VOICE_PROVIDERS.ELEVENLABS][0]?.id || null,
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
                                        onClick={() => onSelectStyle(style)}
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
                                                onClick={(e) => onStartEditStyle(e, style)}
                                                className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={(e) => onDeleteStyle(e, style.id)}
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
                        <div className="mx-auto space-y-6">
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reference Video Links (Max 5)
                                </label>
                                <div className="space-y-2">
                                    {(() => {
                                        // Convert to array if needed (backward compatibility)
                                        let links = Array.isArray(newStyle.referenceVideo)
                                            ? [...newStyle.referenceVideo]
                                            : (newStyle.referenceVideo ? [newStyle.referenceVideo] : []);
                                        // Always show at least one input field
                                        if (links.length === 0) {
                                            links = [''];
                                        }
                                        return links;
                                    })().map((link, index, array) => {
                                        const canRemove = array.length > 1;

                                        return (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={link}
                                                    onChange={(e) => {
                                                        const currentLinks = Array.isArray(newStyle.referenceVideo)
                                                            ? [...newStyle.referenceVideo]
                                                            : (newStyle.referenceVideo ? [newStyle.referenceVideo] : []);
                                                        const updatedLinks = currentLinks.length === 0 ? [''] : [...currentLinks];
                                                        updatedLinks[index] = e.target.value;
                                                        setNewStyle({ ...newStyle, referenceVideo: updatedLinks });
                                                    }}
                                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                    placeholder="https://youtube.com/..."
                                                />
                                                {canRemove && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentLinks = Array.isArray(newStyle.referenceVideo)
                                                                ? [...newStyle.referenceVideo]
                                                                : (newStyle.referenceVideo ? [newStyle.referenceVideo] : []);
                                                            const updatedLinks = [...currentLinks];
                                                            updatedLinks.splice(index, 1);
                                                            setNewStyle({ ...newStyle, referenceVideo: updatedLinks.length > 0 ? updatedLinks : [] });
                                                        }}
                                                        className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex-shrink-0"
                                                        title="Remove link"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {(() => {
                                        // Count all input fields (including empty ones)
                                        const allLinks = Array.isArray(newStyle.referenceVideo)
                                            ? newStyle.referenceVideo
                                            : (newStyle.referenceVideo ? [newStyle.referenceVideo] : []);
                                        const totalInputFields = allLinks.length === 0 ? 1 : allLinks.length;
                                        const canAddMore = totalInputFields < 5;

                                        // Only show button if we can add more
                                        if (!canAddMore) {
                                            return null;
                                        }

                                        return (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const links = Array.isArray(newStyle.referenceVideo)
                                                        ? [...newStyle.referenceVideo]
                                                        : (newStyle.referenceVideo ? [newStyle.referenceVideo] : []);
                                                    const updatedLinks = links.length === 0 ? [''] : [...links];
                                                    setNewStyle({ ...newStyle, referenceVideo: [...updatedLinks, ''] });
                                                }}
                                                className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} />
                                                Add Another Link
                                            </button>
                                        );
                                    })()}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {(() => {
                                        // Count all input fields (including empty ones)
                                        const allLinks = Array.isArray(newStyle.referenceVideo)
                                            ? newStyle.referenceVideo
                                            : (newStyle.referenceVideo ? [newStyle.referenceVideo] : []);
                                        const totalInputFields = allLinks.length === 0 ? 1 : allLinks.length;
                                        const remaining = 5 - totalInputFields;
                                        return remaining > 0
                                            ? `You can add up to ${remaining} more video link${remaining > 1 ? 's' : ''} (Maximum 5)`
                                            : 'Maximum of 5 reference videos reached';
                                    })()}
                                </p>
                            </div>

                            {/* Voice Selection Section */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                    Voice Selection
                                </label>

                                {/* Provider Tabs */}
                                <div className="mb-4">
                                    <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                        {Object.values(VOICE_PROVIDERS).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => {
                                                    setVoiceProvider(p);
                                                    setNewStyle({ ...newStyle, voiceProvider: p, voiceId: VOICES[p][0]?.id || null });
                                                }}
                                                className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all min-h-[40px]
                                                    ${voiceProvider === p
                                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
                                            >
                                                {p.charAt(0).toUpperCase() + p.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Voice List - Compact Design */}
                                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-2">
                                    {VOICES[voiceProvider].map((voice) => {
                                        const isSelected = newStyle.voiceId === voice.id;
                                        return (
                                            <div
                                                key={voice.id}
                                                onClick={() => setNewStyle({ ...newStyle, voiceId: voice.id, voiceProvider: voiceProvider })}
                                                className={`relative flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer group
                                                    ${isSelected
                                                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-sm'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                            >
                                                {/* Selected Check */}
                                                {isSelected && (
                                                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                                        <Check size={10} className="text-white" />
                                                    </div>
                                                )}

                                                {/* Preview Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleVoicePreview(e, voice)}
                                                    className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex-shrink-0"
                                                    title="Preview Voice"
                                                >
                                                    {previewLoadingId === voice.id ? (
                                                        <Loader2 size={12} className="animate-spin text-indigo-600" />
                                                    ) : previewPlayingId === voice.id ? (
                                                        <StopCircle size={12} className="text-red-500" />
                                                    ) : (
                                                        <Play size={12} className="text-gray-600 dark:text-gray-400 ml-0.5" />
                                                    )}
                                                </button>

                                                {/* Voice Icon */}
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0
                                                    ${isSelected
                                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                                                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30'}`}
                                                >
                                                    <Mic size={14} className={isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'} />
                                                </div>

                                                {/* Voice Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <div className={`font-semibold text-sm truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                                                            {voice.name}
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isSelected ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                                                {voice.gender}
                                                            </span>
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isSelected ? 'bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                                                {voice.accent || 'Standard'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {voice.style}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
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
                                        {/* Voice Controls */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
                                            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">Voice Controls</h4>
                                            <div className="space-y-4">
                                                {['voiceSpeed', 'similarity', 'stability', 'exaggeration'].map((key) => (
                                                    <div key={key}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                                                {key === 'voiceSpeed' ? 'Voice Speed' : key}
                                                            </label>
                                                            <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400">{newStyle[key]}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max={key === 'voiceSpeed' ? '120' : '100'}
                                                            value={newStyle[key]}
                                                            onChange={(e) => setNewStyle({ ...newStyle, [key]: Number(e.target.value) })}
                                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

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
                                    onClick={styleViewMode === 'create' ? onCreateStyle : onUpdateStyle}
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
    );
};

export default StyleModal;

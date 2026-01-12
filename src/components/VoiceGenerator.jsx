import React, { useState, useRef } from 'react';
import { useScript } from '../context/ScriptContext';
import { useMedia } from '../context/MediaContext';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import { VOICES, VOICE_PROVIDERS, API_BASE_URL } from '../utils/constants';
import { Mic, Play, Pause, Volume2, StopCircle, Music, Download, Check, Loader2 } from 'lucide-react';
import ProgressBar from './common/ProgressBar';

// Direct API call with abort support
const generateVoice = async (text, voiceId, voiceSettings, signal) => {
    // Construct URL - if API_BASE_URL is empty, use relative path (goes through Vite proxy)
    const url = API_BASE_URL ? `${API_BASE_URL}/api/generate-voice` : '/api/generate-voice';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            voice_id: voiceId,
            voice_settings: voiceSettings
        }),
        signal // AbortController signal
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.audio_url || data.url || data.audioUrl || data;
};

const VoiceGenerator = () => {
    const audioRef = useRef(null);
    const abortControllerRef = useRef(null);

    const { script } = useScript();
    const {
        generatedAudioUrl, setGeneratedAudioUrl,
        setAudioDuration,
        isGeneratingVoice, setIsGeneratingVoice,
        voiceGenerationProgress, setVoiceGenerationProgress
    } = useMedia();
    const { setLoading } = useUI();
    const { showSuccess, showError } = useToast();

    const [provider, setProvider] = useState(VOICE_PROVIDERS.ELEVENLABS);
    const [selectedVoiceId, setSelectedVoiceId] = useState(VOICES[VOICE_PROVIDERS.ELEVENLABS][0].id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progressStage, setProgressStage] = useState('');
    const [showAllVoices, setShowAllVoices] = useState(false);

    // Preview state
    const [previewPlayingId, setPreviewPlayingId] = useState(null);
    const [previewLoadingId, setPreviewLoadingId] = useState(null);
    const previewAudioRef = useRef(new Audio());
    const previewCache = useRef({});

    const handlePreview = async (e, voice) => {
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
                const text = `Hello, I am ${voice.name}. This is a preview.`;
                // Use undefined for signal to avoid aborting previews with the main controller
                // Also pass provider as the voiceSettings
                url = await generateVoice(text, voiceId, provider);
                previewCache.current[voiceId] = url;
            }

            previewAudioRef.current.src = url;
            previewAudioRef.current.onended = () => setPreviewPlayingId(null);

            // Handle play promise rejection (e.g. user interaction policy)
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
            showError('Failed to play preview');
        } finally {
            setPreviewLoadingId(null);
        }
    };

    const handleGenerateVoice = async () => {
        if (!script) return;

        // Create new AbortController for this generation
        abortControllerRef.current = new AbortController();

        setIsGeneratingVoice(true);
        setLoading(prev => ({ ...prev, voice: true }));
        setVoiceGenerationProgress(0);

        try {
            // Stage 1: Preparing
            setProgressStage('Preparing text...');
            setVoiceGenerationProgress(20);
            await new Promise(resolve => setTimeout(resolve, 500));

            // Stage 2: Sending
            setProgressStage('Sending to AI...');
            setVoiceGenerationProgress(40);

            // Stage 3: Generating
            setProgressStage('Generating audio...');
            setVoiceGenerationProgress(60);

            const audioUrl = await generateVoice(
                script,
                selectedVoiceId,
                provider,
                abortControllerRef.current.signal
            );

            // Stage 4: Complete
            setProgressStage('Processing...');
            setVoiceGenerationProgress(90);

            setGeneratedAudioUrl(audioUrl);

            // Get duration
            const audio = new Audio(audioUrl);
            audio.onloadedmetadata = () => {
                setAudioDuration(audio.duration);
            };

            setVoiceGenerationProgress(100);
            setProgressStage('Complete!');
            showSuccess('Voiceover generated successfully!');

        } catch (error) {
            if (error.name === 'AbortError') {
                showError('Voice generation stopped');
            } else {
                console.error('Error generating voice:', error);
                showError('Failed to generate voice: ' + error.message);
            }
        } finally {
            setIsGeneratingVoice(false);
            setLoading(prev => ({ ...prev, voice: false }));
            setVoiceGenerationProgress(0);
            setProgressStage('');
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    if (!script) return null;

    return (
        <div className="glass-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -z-10" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm">
                    <Mic size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Voiceover</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Choose a voice and generate audio</p>
                </div>
            </div>

            {/* Provider Tabs */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Voice Provider
                </label>
                <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    {Object.values(VOICE_PROVIDERS).map((p) => (
                        <button
                            key={p}
                            onClick={() => setProvider(p)}
                            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all min-h-[44px]
                                ${provider === p
                                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Voice Selection - Card Grid */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Voice
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {VOICES[provider].slice(0, showAllVoices ? undefined : 8).map((voice) => {
                        const isSelected = selectedVoiceId === voice.id;
                        return (
                            <div
                                key={voice.id}
                                onClick={() => setSelectedVoiceId(voice.id)}
                                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 group hover:scale-105 cursor-pointer
                                    ${isSelected
                                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 shadow-xl shadow-green-500/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg'}`}
                            >
                                {/* Selected Check */}
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}

                                {/* Preview Button */}
                                <button
                                    onClick={(e) => handlePreview(e, voice)}
                                    className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm flex items-center justify-center hover:scale-110 transition-transform hover:bg-white dark:hover:bg-gray-700"
                                    title="Preview Voice"
                                >
                                    {previewLoadingId === voice.id ? (
                                        <Loader2 size={14} className="animate-spin text-green-600" />
                                    ) : previewPlayingId === voice.id ? (
                                        <StopCircle size={14} className="text-red-500" />
                                    ) : (
                                        <Play size={14} className="text-gray-700 dark:text-gray-300 ml-0.5" />
                                    )}
                                </button>

                                {/* Icon */}
                                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all
                                    ${isSelected
                                        ? 'bg-gradient-to-br from-green-500 to-teal-500 shadow-lg'
                                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'}`}
                                >
                                    <Mic size={32} className={isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'} />
                                </div>

                                {/* Voice Info */}
                                <div className="text-center">
                                    <div className={`font-bold mb-1 ${isSelected ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                        {voice.name}
                                    </div>
                                    <div className="flex items-center justify-center gap-1 text-xs">
                                        <span className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                            {voice.gender}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-teal-200 dark:bg-teal-800 text-teal-700 dark:text-teal-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                            {voice.accent || 'Standard'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Show More/Less Button */}
                {VOICES[provider].length > 8 && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setShowAllVoices(!showAllVoices)}
                            className="px-6 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors underline underline-offset-4"
                        >
                            {showAllVoices ? 'Show Less' : `Show ${VOICES[provider].length - 8} More Voices`}
                        </button>
                    </div>
                )}
            </div>

            {/* Generate / Stop Button */}
            <div className="mb-6">
                {!isGeneratingVoice ? (
                    <button
                        onClick={handleGenerateVoice}
                        className="w-full py-5 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Volume2 size={24} />
                        <span>Generate Voiceover</span>
                    </button>
                ) : (
                    <button
                        onClick={handleStop}
                        className="w-full py-5 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <StopCircle size={24} />
                        <span>Stop Generation</span>
                    </button>
                )}

                {/* Progress Bar */}
                {isGeneratingVoice && (
                    <div className="mt-4">
                        <ProgressBar
                            progress={voiceGenerationProgress}
                            status={progressStage}
                            variant="success"
                            showPercentage={true}
                        />
                    </div>
                )}
            </div>

            {/* Audio Player */}
            {generatedAudioUrl && (
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                                <Music size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">Generated Audio</div>
                                <div className="text-sm text-green-600 dark:text-green-400">Ready to use</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={togglePlay}
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-teal-600 text-white flex items-center justify-center hover:from-green-700 hover:to-teal-700 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-green-500/30"
                            >
                                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                            </button>
                            <a
                                href={generatedAudioUrl}
                                download="voiceover.mp3"
                                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-all hover:scale-110 active:scale-95"
                            >
                                <Download size={20} />
                            </a>
                        </div>
                    </div>

                    <audio
                        ref={audioRef}
                        src={generatedAudioUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                    />

                    {/* Waveform Visualization */}
                    <div className="flex items-center gap-1 h-16">
                        {[...Array(40)].map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-green-500 to-teal-500 rounded-full transition-all duration-300"
                                style={{
                                    height: isPlaying ? `${20 + Math.random() * 80}%` : '20%',
                                    opacity: isPlaying ? 0.8 : 0.4
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceGenerator;

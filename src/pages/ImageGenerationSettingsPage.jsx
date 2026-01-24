import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useScript } from "../context/ScriptContext";
import { useMedia } from "../context/MediaContext";
import { useUI } from "../context/UIContext";
import {
    Palette,
    Loader2,
    Sparkles,
    Play,
    Pause,
    Music,
    Download,
    Check
} from "lucide-react";
import { API_BASE_URL } from "../utils/constants.js";

// --- API Helpers (Duplicated to ensure exact functionality) ---
const generateImagePromptAPI = async (prompt, maxTokens = 500) => {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/chatgpt` : "/api/chatgpt";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            max_tokens: maxTokens,
        }),
    });

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({ error: "Request failed" }));
        throw new Error(
            errorData.error || errorData.message || `HTTP ${response.status}`,
        );
    }

    return await response.json();
};

const generateImageAPI = async (
    prompt,
    aspectRatio = "16:9",
    renderingSpeed = "TURBO",
    styleType = "REALISTIC",
) => {
    const url = API_BASE_URL
        ? `${API_BASE_URL}/api/generate-image`
        : "/api/generate-image";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            aspectRatio,
            renderingSpeed,
            styleType,
        }),
    });

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({ error: "Request failed" }));
        throw new Error(
            errorData.error || errorData.message || `HTTP ${response.status}`,
        );
    }

    return await response.json();
};

const IMAGE_STYLES = {
    cinematic: {
        name: "Cinematic",
        image: "/style-previews/cinematic.png",
        gradient: "from-slate-700 via-slate-600 to-slate-500",
        icon: "🎬",
    },
    realistic: {
        name: "Realistic",
        image: "/style-previews/realistic.png",
        gradient: "from-amber-600 via-amber-500 to-yellow-500",
        icon: "📸",
    },
    "black & white": {
        name: "Black & White",
        image: "/style-previews/blackwhite.png",
        gradient: "from-gray-900 via-gray-600 to-gray-300",
        icon: "⚫",
    },
    "oil painting": {
        name: "Oil Painting",
        image: "/style-previews/oilpainting.png",
        gradient: "from-orange-700 via-amber-600 to-yellow-600",
        icon: "🎨",
    },
    "3d model": {
        name: "3D Model",
        image: "/style-previews/3dmodel.png",
        gradient: "from-blue-600 via-cyan-500 to-teal-500",
        icon: "🔷",
    },
    drawing: {
        name: "Drawing",
        image: "/style-previews/drawing.png",
        gradient: "from-purple-600 via-purple-500 to-pink-500",
        icon: "✏️",
    },
    "comic book": {
        name: "Comic Book",
        gradient: "from-red-600 via-yellow-500 to-blue-600",
        icon: "💥",
    },
    anime: {
        name: "Anime",
        gradient: "from-pink-500 via-rose-500 to-red-500",
        icon: "🌸",
    },
    "pixel art": {
        name: "Pixel Art",
        gradient: "from-green-600 via-emerald-500 to-teal-500",
        icon: "🎮",
    },
    "pop art": {
        name: "Pop Art",
        gradient: "from-fuchsia-600 via-pink-500 to-rose-500",
        icon: "🎭",
    },
    watercolor: {
        name: "Watercolor",
        gradient: "from-sky-400 via-blue-400 to-indigo-400",
        icon: "💧",
    },
    "stick-style": {
        name: "Stick Style",
        gradient: "from-gray-700 via-gray-600 to-gray-500",
        icon: "🖊️",
    },
    "naruto anime": {
        name: "Naruto Anime",
        gradient: "from-orange-600 via-orange-500 to-yellow-500",
        icon: "🍥",
    },
    "game of thrones": {
        name: "Game of Thrones",
        gradient: "from-gray-800 via-red-900 to-gray-900",
        icon: "⚔️",
    },
};

const getIdeogramStyleType = (styleName) => {
    const styleMap = {
        realistic: "REALISTIC",
        cinematic: "REALISTIC",
        "black & white": "REALISTIC",
        "oil painting": "GENERAL",
        "3d model": "RENDER_3D",
        drawing: "GENERAL",
        "comic book": "GENERAL",
        anime: "ANIME",
        "pixel art": "GENERAL",
        "pop art": "GENERAL",
        watercolor: "GENERAL",
        "stick-style": "DESIGN",
        "stick style": "DESIGN",
        "naruto anime": "ANIME",
        "naruto-anime": "ANIME",
        "game of thrones": "REALISTIC",
        "game-of-thrones": "REALISTIC",
    };
    const lowerStyle = styleName.toLowerCase();
    return styleMap[lowerStyle] || "GENERAL";
};

const ImageGenerationSettingsPage = () => {
    const navigate = useNavigate();
    const { scenes } = useScript();
    const {
        images,
        setImages,
        isGeneratingImages,
        setIsGeneratingImages,
        setImageGenerationProgress,
        generatedAudioUrl
    } = useMedia();
    const { setLoading } = useUI();

    // Local State for Settings
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [generationSettings, setGenerationSettings] = useState({
        aspectRatio: "16:9",
        quality: "Best",
        animate: false,
        imageCount: null,
        selectedStyle: "realistic",
        additionalContext: "",
        promptSafety: true,
        pacing: 6.35,
    });

    const [showStyleModal, setShowStyleModal] = useState(false);

    // Timeline State
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [timelineZoom, setTimelineZoom] = useState(50);
    const audioRef = useRef(null);

    // Audio Playback
    const toggleAudioPlay = () => {
        if (!audioRef.current) return;
        if (isAudioPlaying) {
            audioRef.current.pause();
            setIsAudioPlaying(false);
            setIsAudioLoading(false);
        } else {
            setIsAudioLoading(true);
            audioRef.current.play()
                .then(() => {
                    setIsAudioPlaying(true);
                    setIsAudioLoading(false);
                })
                .catch(err => {
                    console.error("Audio play failed:", err);
                    setIsAudioPlaying(false);
                    setIsAudioLoading(false);
                });
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleEnded = () => setIsAudioPlaying(false);
            audio.addEventListener("ended", handleEnded);
            return () => audio.removeEventListener("ended", handleEnded);
        }
    }, []);

    // Validation
    const isFormValid = () => {
        if (!generationSettings.selectedStyle) return false;
        if ((!generationSettings.imageCount || generationSettings.imageCount < 1) && !isAdvancedMode) return false;
        return true;
    };

    // Generation Logic (Async - Continues after navigation)
    const handleGenerateImages = async (finalSettings) => {
        // Note: We use the context setters which persist after component unmount
        console.log("🚀 Starting generation with settings:", finalSettings);

        if (!scenes.length) return;

        setIsGeneratingImages(true);
        setLoading((prev) => ({ ...prev, images: true }));
        setImageGenerationProgress(0);

        // Navigate back immediately so user sees the progress page
        // Using setTimeout to ensure state updates trigger first if needed
        setTimeout(() => {
            navigate('/app', { state: { step: 3 } });
        }, 100);

        try {
            const requestedCount = finalSettings.imageCount ? parseInt(finalSettings.imageCount, 10) : 0;
            const targetCount = requestedCount > 0 ? Math.min(requestedCount, scenes.length) : 1;

            // Initialize images
            const newImages = Array(targetCount).fill(null).map((_, index) => {
                return images[index] || { status: "pending", url: null };
            });
            setImages(newImages);

            for (let i = 0; i < targetCount; i++) {
                const scene = scenes[i];

                // Optimistic update of specific index
                setImages(prev => {
                    const next = [...prev];
                    if (next[i]) next[i] = { ...next[i], status: 'generating' };
                    return next;
                });

                try {
                    // 1. Generate Prompt
                    const styleName = finalSettings.selectedStyle || "cinematic";
                    const promptText = `You are an expert at creating ULTRA-DETAILED, ACCURATE image prompts for ${styleName} style.

SCENE ${i + 1} TEXT:
${scene.text}

Create a detailed image prompt (55-75 words) that accurately represents this scene, including all characters, their interactions, the setting, and key visual details. Match emotions, colors, actions, and props exactly as described in the scene text.

Output ONLY the final prompt - no analysis or additional text.`;

                    const promptResponse = await generateImagePromptAPI(promptText, 1000);
                    let prompt = "";
                    if (promptResponse?.content && promptResponse.content[0]?.text) {
                        prompt = promptResponse.content[0].text;
                    } else if (promptResponse?.choices && promptResponse.choices[0]?.message?.content) {
                        prompt = promptResponse.choices[0].message.content;
                    } else if (typeof promptResponse === "string") {
                        prompt = promptResponse;
                    } else {
                        throw new Error("Invalid response format from image prompt API");
                    }
                    prompt = prompt.replace(/^["']|["']$/g, "").trim();

                    // 2. Generate Image
                    const styleType = getIdeogramStyleType(finalSettings.selectedStyle);
                    let renderingSpeed = "TURBO";
                    if (finalSettings.quality === "Best") renderingSpeed = "QUALITY";
                    else if (finalSettings.quality === "Better") renderingSpeed = "NORMAL";
                    else if (finalSettings.quality === "Good") renderingSpeed = "NORMAL";

                    const imageResponse = await generateImageAPI(
                        prompt,
                        finalSettings.aspectRatio,
                        renderingSpeed,
                        styleType
                    );

                    let imageUrl = "";
                    if (imageResponse?.data && imageResponse.data[0]?.url) {
                        imageUrl = imageResponse.data[0].url;
                    } else {
                        throw new Error("No image URL found in response");
                    }

                    // Update success
                    setImages(prev => {
                        const next = [...prev];
                        next[i] = { status: "completed", url: imageUrl, prompt };
                        return next;
                    });

                } catch (error) {
                    console.error(`Error generating image for scene ${i + 1}:`, error);
                    setImages(prev => {
                        const next = [...prev];
                        next[i] = { status: "error", error: error.message || "Unknown error" };
                        return next;
                    });
                }
                // Update progress
                setImageGenerationProgress(((i + 1) / targetCount) * 100);
            }

        } catch (error) {
            console.error("Critical generation error:", error);
            alert("Failed to generate images: " + error.message);
        } finally {
            setIsGeneratingImages(false);
            setLoading((prev) => ({ ...prev, images: false }));
        }
    };

    const handleGenerateClick = async () => {
        if (!isAdvancedMode) {
            if (!generationSettings.imageCount || generationSettings.imageCount < 1) {
                alert("Please enter a valid image count.");
                return;
            }
        } else {
            if (!generationSettings.imageCount || generationSettings.imageCount < 1) {
                const settingsWithImageCount = {
                    ...generationSettings,
                    imageCount: Math.min(scenes.length, 15),
                };
                await handleGenerateImages(settingsWithImageCount);
                return;
            }
        }
        await handleGenerateImages(generationSettings);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Image Generation Settings
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Configure your image generation preferences
                        </p>
                    </div>
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between p-2 pl-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-w-[200px]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {isAdvancedMode ? "A" : "B"}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {isAdvancedMode ? "Advanced" : "Basic"}
                                </h4>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ml-4 ${isAdvancedMode
                                ? "bg-gradient-to-r from-purple-600 to-blue-600"
                                : "bg-gray-300 dark:bg-gray-600"
                                } shadow-inner`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAdvancedMode ? "translate-x-7" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 md:p-6 space-y-6">
                    {/* Row 1: Dynamic fields based on mode */}
                    <div
                        className={
                            isAdvancedMode
                                ? "w-full"
                                : "grid gap-6 grid-cols-1 md:grid-cols-4"
                        }
                    >
                        {!isAdvancedMode ? (
                            <>
                                {/* Aspect Ratio */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Aspect Ratio
                                    </label>
                                    <select
                                        value={generationSettings.aspectRatio}
                                        onChange={(e) =>
                                            setGenerationSettings({
                                                ...generationSettings,
                                                aspectRatio: e.target.value,
                                            })
                                        }
                                        className="w-full pl-6 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="16:9">16:9 Landscape</option>
                                        <option value="9:16">9:16 Portrait</option>
                                    </select>
                                </div>

                                {/* Quality */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Quality Level
                                    </label>
                                    <select
                                        value={generationSettings.quality}
                                        onChange={(e) =>
                                            setGenerationSettings({
                                                ...generationSettings,
                                                quality: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="Fine">Fine</option>
                                        <option value="Good">Good</option>
                                        <option value="Better">Better</option>
                                        <option value="Best">Best</option>
                                    </select>
                                </div>

                                {/* Animate Images */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Animation
                                    </label>
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {generationSettings.animate ? "Enabled" : "Disabled"}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setGenerationSettings({
                                                    ...generationSettings,
                                                    animate: !generationSettings.animate,
                                                })
                                            }
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${generationSettings.animate
                                                ? "bg-indigo-600"
                                                : "bg-gray-300 dark:bg-gray-600"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${generationSettings.animate
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Image Count */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Image Count <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-1">
                                        <input
                                            type="number"
                                            min="1"
                                            max={Math.min(scenes.length, 15)}
                                            value={generationSettings.imageCount || ""}
                                            onChange={(e) => {
                                                const maxAllowed = Math.min(scenes.length, 15);
                                                const inputValue = e.target.value;
                                                if (inputValue === "") {
                                                    setGenerationSettings((prev) => ({
                                                        ...prev,
                                                        imageCount: null,
                                                    }));
                                                    return;
                                                }

                                                const numValue = parseInt(inputValue, 10);
                                                if (!isNaN(numValue) && numValue >= 1) {
                                                    const value = Math.min(
                                                        maxAllowed,
                                                        Math.max(1, numValue),
                                                    );
                                                    setGenerationSettings((prev) => ({
                                                        ...prev,
                                                        imageCount: value,
                                                    }));
                                                }
                                            }}
                                            placeholder="1-15"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Max: {Math.min(scenes.length, 15)} scenes available
                                        </p>
                                    </div>
                                </div>

                                {/* Choose Style (Basic) */}
                                <div className="md:col-span-4 w-full mt-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Choose Style <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        onClick={() => setShowStyleModal(true)}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-pink-500 dark:hover:border-pink-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-all flex items-center justify-between"
                                    >
                                        <span className="flex items-center gap-2">
                                            {generationSettings.selectedStyle && IMAGE_STYLES[generationSettings.selectedStyle.toLowerCase()]?.icon}
                                            {generationSettings.selectedStyle || "Click to select a style"}
                                        </span>
                                        <Palette size={20} />
                                    </button>
                                </div>

                                {/* Additional Context (Basic) */}
                                <div className="md:col-span-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Additional Context (Optional)
                                    </label>
                                    <textarea
                                        value={generationSettings.additionalContext}
                                        onChange={(e) =>
                                            setGenerationSettings({
                                                ...generationSettings,
                                                additionalContext: e.target.value,
                                            })
                                        }
                                        rows="3"
                                        placeholder="Add any additional instructions or context for image generation..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                                    />
                                </div>
                            </>
                        ) : (
                            // --- ADVANCED MODE CONTENT ---
                            <div className="space-y-8">
                                {/* Voiceover Section */}
                                <div className="bg-white dark:bg-gray-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shrink-0">
                                            <Music size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-slate-800 dark:text-white truncate">
                                                Use Generated Voiceover
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                Use your generated voiceover to create visuals
                                            </p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                        <div className="text-xs font-semibold text-slate-500 mb-3">
                                            Your generated voiceover is ready to use
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <button
                                                    onClick={toggleAudioPlay}
                                                    className="text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors shrink-0"
                                                >
                                                    {isAudioPlaying ? (
                                                        <Pause size={20} />
                                                    ) : (
                                                        <Play size={20} />
                                                    )}
                                                </button>
                                                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden">
                                                    <div
                                                        className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-100"
                                                        style={{
                                                            width: audioRef.current
                                                                ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`
                                                                : "0%",
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500">
                                                    {audioRef.current
                                                        ? `${Math.floor(audioRef.current.currentTime / 60)}:${Math.floor(
                                                            audioRef.current.currentTime % 60,
                                                        )
                                                            .toString()
                                                            .padStart(2, "0")}`
                                                        : "0:00"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button className="text-slate-500">
                                                    <Music size={14} />
                                                </button>
                                                <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                                                    <div className="w-4/5 h-full bg-indigo-500 rounded-full"></div>
                                                </div>
                                                {generatedAudioUrl && (
                                                    <a
                                                        href={generatedAudioUrl}
                                                        download="voiceover.mp3"
                                                        className="text-slate-500 hover:text-indigo-500"
                                                    >
                                                        <Download size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Configuration Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                    {/* Column 1: Aspect Ratio */}
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                            <span className="text-slate-400">1.</span> Aspect
                                            ratio
                                        </h4>
                                        <div className="relative group">
                                            <label className="absolute left-3 -top-2 px-1 bg-white dark:bg-gray-900 text-[10px] font-bold text-slate-400 z-10">
                                                Aspect Ratio
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={generationSettings.aspectRatio}
                                                    onChange={(e) =>
                                                        setGenerationSettings({
                                                            ...generationSettings,
                                                            aspectRatio: e.target.value,
                                                        })
                                                    }
                                                    className="w-full h-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl pl-12 pr-4 text-sm font-semibold appearance-none focus:border-indigo-500 outline-none transition-all"
                                                >
                                                    <option value="16:9">16:9</option>
                                                    <option value="9:16">9:16</option>
                                                    <option value="1:1">1:1</option>
                                                </select>
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <div className="w-4 h-3 border-2 border-slate-400 rounded-sm"></div>
                                                </div>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg
                                                        width="12"
                                                        height="12"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M2 4l4 4 4-4" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Safe Prompts */}
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                            <span className="text-slate-400">2.</span> Safe
                                            prompts
                                        </h4>
                                        <div className="flex h-12 items-center justify-between bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4">
                                            <button
                                                onClick={() =>
                                                    setGenerationSettings((prev) => ({
                                                        ...prev,
                                                        promptSafety: !prev.promptSafety,
                                                    }))
                                                }
                                                className={`relative w-12 h-6 rounded-full transition-colors ${generationSettings.promptSafety ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"}`}
                                            >
                                                <div
                                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${generationSettings.promptSafety ? "right-1" : "left-1"}`}
                                                />
                                            </button>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-3">
                                                {generationSettings.promptSafety ? "On" : "Off"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Column 3: Style */}
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                            <span className="text-slate-400">3.</span> Choose
                                            style
                                        </h4>
                                        <button
                                            onClick={() => setShowStyleModal(true)}
                                            className="w-full h-12 flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-1.5 pr-4 hover:border-indigo-500 transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                                {IMAGE_STYLES[
                                                    generationSettings.selectedStyle?.toLowerCase()
                                                ]?.image ? (
                                                    <img
                                                        src={
                                                            IMAGE_STYLES[
                                                                generationSettings.selectedStyle.toLowerCase()
                                                            ].image
                                                        }
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs">
                                                        🎨
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-bold text-blue-500">
                                                {generationSettings.selectedStyle}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Column 4: Context */}
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                            <span className="text-slate-400">4.</span> Additional
                                            context (Optional)
                                        </h4>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Add any additional context..."
                                                value={generationSettings.additionalContext}
                                                onChange={(e) =>
                                                    setGenerationSettings({
                                                        ...generationSettings,
                                                        additionalContext: e.target.value,
                                                    })
                                                }
                                                className="w-full h-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Segment Settings */}
                                <div className="bg-slate-50/50 dark:bg-slate-900/30 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Segment Settings
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <Loader2 size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
                                                01:03 / 01:03
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Quality Preset */}
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                                Quality Preset
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {["Fine", "Good", "Better", "Best", "Custom"].map(
                                                    (q) => (
                                                        <button
                                                            key={q}
                                                            onClick={() =>
                                                                setGenerationSettings({
                                                                    ...generationSettings,
                                                                    quality: q,
                                                                })
                                                            }
                                                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${generationSettings.quality === q
                                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                                : "bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-200"
                                                                }`}
                                                        >
                                                            {q}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        {/* Animation & Pacing */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-white dark:border-slate-700 flex items-center justify-between">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                        Animate Segment
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Add motion to generated images
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setGenerationSettings((prev) => ({
                                                            ...prev,
                                                            animate: !prev.animate,
                                                        }))
                                                    }
                                                    className={`relative w-12 h-6 rounded-full transition-colors ${generationSettings.animate ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"}`}
                                                >
                                                    <div
                                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${generationSettings.animate ? "right-1" : "left-1"}`}
                                                    />
                                                </button>
                                            </div>

                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-white dark:border-slate-700 flex items-center justify-between">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                        Pacing
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Speed of image transitions
                                                    </p>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold font-mono border border-blue-100 dark:border-blue-800">
                                                    ~6.35s
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image Count Slider */}
                                        <div>
                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                <span>Image Count</span>
                                                <span className="text-slate-500">
                                                    {generationSettings.imageCount || 10}/
                                                    {scenes.length} images
                                                </span>
                                            </div>
                                            <div className="relative group py-4">
                                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden">
                                                    <div
                                                        className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full"
                                                        style={{
                                                            width: `${((generationSettings.imageCount || 10) / scenes.length) * 100}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max={scenes.length}
                                                    value={generationSettings.imageCount || 10}
                                                    onChange={(e) =>
                                                        setGenerationSettings({
                                                            ...generationSettings,
                                                            imageCount: parseInt(e.target.value),
                                                        })
                                                    }
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md z-0 pointer-events-none"
                                                    style={{
                                                        left: `calc(${((generationSettings.imageCount || 10) / scenes.length) * 100}% - 8px)`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Section */}
                                <div className="bg-white dark:bg-slate-800/30 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="text-slate-400">
                                                <Loader2 size={18} />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                                Timeline
                                            </h3>
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {Math.floor(audioCurrentTime / 60)
                                                    .toString()
                                                    .padStart(2, "0")}
                                                :
                                                {Math.floor(audioCurrentTime % 60)
                                                    .toString()
                                                    .padStart(2, "0")}
                                                /
                                                {audioDuration
                                                    ? `${Math.floor(audioDuration / 60)
                                                        .toString()
                                                        .padStart(2, "0")}:${Math.floor(
                                                            audioDuration % 60,
                                                        )
                                                            .toString()
                                                            .padStart(2, "0")}`
                                                    : "00:00"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-blue-100 dark:border-blue-900 text-blue-500 text-[10px] font-bold uppercase transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/40">
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                >
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                    <rect
                                                        x="3"
                                                        y="11"
                                                        width="18"
                                                        height="11"
                                                        rx="2"
                                                        ry="2"
                                                    />
                                                </svg>
                                                Split
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                                    Zoom
                                                </span>
                                                <div className="w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-full relative group cursor-pointer">
                                                    <div
                                                        className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full"
                                                        style={{ width: `${timelineZoom}%` }}
                                                    ></div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={timelineZoom}
                                                        onChange={(e) =>
                                                            setTimelineZoom(parseInt(e.target.value))
                                                        }
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div
                                                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow-sm z-0 pointer-events-none"
                                                        style={{ left: `calc(${timelineZoom}% - 6px)` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative h-24 bg-blue-50 dark:bg-indigo-900/20 rounded-xl border border-blue-100 dark:border-indigo-900/50 overflow-hidden px-2">
                                        {/* Segments Visualization */}
                                        <div className="absolute inset-0 flex items-center px-4">
                                            <div className="w-full h-1 bg-white/30 dark:bg-slate-700/50 absolute top-1/2 -translate-y-1/2 left-1"></div>
                                            {[...Array(8)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 border-l-2 border-white/20 dark:border-white/10 h-1 absolute top-1/2 -translate-y-1/2"
                                                    style={{ left: `${(i + 1) * 12.5}%` }}
                                                ></div>
                                            ))}
                                        </div>

                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                            <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-1">
                                                Total Scenes: {scenes.length}
                                            </div>
                                            <div className="bg-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm inline-block mb-1">
                                                BEST
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                {generationSettings.imageCount || scenes.length} img
                                            </div>
                                        </div>

                                        {/* Playhead showing live audio position */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-16 bg-blue-500 transition-all duration-100"
                                            style={{
                                                left: audioDuration
                                                    ? `${(audioCurrentTime / audioDuration) * 100}%`
                                                    : "0%",
                                            }}
                                        >
                                            <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white"></div>
                                        </div>

                                        <div className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-400">
                                            {Math.floor(audioCurrentTime / 60)
                                                .toString()
                                                .padStart(2, "0")}
                                            :
                                            {Math.floor(audioCurrentTime % 60)
                                                .toString()
                                                .padStart(2, "0")}
                                        </div>
                                        <div className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-400">
                                            {audioDuration
                                                ? `${Math.floor(audioDuration / 60)
                                                    .toString()
                                                    .padStart(2, "0")}:${Math.floor(
                                                        audioDuration % 60,
                                                    )
                                                        .toString()
                                                        .padStart(2, "0")}`
                                                : "00:00"}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <button className="px-3 py-1 bg-blue-50 dark:bg-indigo-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg border border-blue-100 dark:border-indigo-900/50 transition-colors hover:bg-blue-100 dark:hover:bg-indigo-900/50">
                                            Active:{" "}
                                            {generationSettings.imageCount || scenes.length}{" "}
                                            images
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-wrap justify-end gap-3 sticky bottom-0 z-20 backdrop-blur-md">
                    <button
                        onClick={() => navigate('/app')}
                        className="px-6 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerateClick}
                        disabled={!isFormValid() || isGeneratingImages}
                        className={`px-10 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 ${!isFormValid() || isGeneratingImages
                            ? "bg-slate-200 dark:bg-slate-700 cursor-not-allowed text-slate-400"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                            }`}
                    >
                        {isGeneratingImages ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        Generate {generationSettings.imageCount || (isAdvancedMode ? 10 : 0)} Images
                    </button>
                </div>
            </div>

            {/* Audio Element Hidden */}
            <audio
                ref={audioRef}
                src={generatedAudioUrl}
                onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                onEnded={() => setIsAudioPlaying(false)}
                className="hidden"
            />

            {/* Style Selection Modal (Nested since it's a sub-modal of the settings page) */}
            {showStyleModal && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowStyleModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold">Choose Image Style</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(IMAGE_STYLES).map(([key, style]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setGenerationSettings({ ...generationSettings, selectedStyle: style.name });
                                        setShowStyleModal(false);
                                    }}
                                    className={`group relative overflow-hidden rounded-xl border-2 transition-all ${generationSettings.selectedStyle === style.name
                                        ? "border-pink-500"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                                        {style.image ? <img src={style.image} className="w-full h-full object-cover" /> : <span className="text-4xl">{style.icon}</span>}
                                        {style.image && <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0`}></div>}
                                    </div>
                                    <div className="p-3 font-semibold text-center">{style.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGenerationSettingsPage;

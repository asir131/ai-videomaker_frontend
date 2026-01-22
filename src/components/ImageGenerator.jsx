import React, { useState, useRef, useEffect } from 'react';
import { useScript } from '../context/ScriptContext';
import { useMedia } from '../context/MediaContext';
import { useUI } from '../context/UIContext';
import { ImageIcon, Palette, Loader2, Sparkles, Download, RefreshCw, Play, Pause, Music, Upload, X } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants.js';
import ProgressBar from './common/ProgressBar';

// Module-level debug
console.log('🟢 ImageGenerator module loading...');
console.log('🟢 API_BASE_URL:', API_BASE_URL || '(empty - using relative URLs via Vite proxy)');

// Animation imports removed to fix "u is not a function" error
// Animations are non-critical UI enhancements

// Direct API calls to avoid import issues
const generateImagePromptAPI = async (prompt, maxTokens = 500) => {
    // Construct URL - if API_BASE_URL is empty, use relative path (goes through Vite proxy)
    const url = API_BASE_URL ? `${API_BASE_URL}/api/chatgpt` : '/api/chatgpt';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
};

const generateImageAPI = async (prompt, aspectRatio = '16:9', renderingSpeed = 'TURBO', styleType = 'REALISTIC') => {
    // Construct URL - if API_BASE_URL is empty, use relative path (goes through Vite proxy)
    const url = API_BASE_URL ? `${API_BASE_URL}/api/generate-image` : '/api/generate-image';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            aspectRatio,
            renderingSpeed,
            styleType
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
};

// Image styles configuration with preview images
const IMAGE_STYLES = {
    cinematic: {
        name: 'Cinematic',
        image: '/style-previews/cinematic.png',
        gradient: 'from-slate-700 via-slate-600 to-slate-500',
        icon: '🎬'
    },
    realistic: {
        name: 'Realistic',
        image: '/style-previews/realistic.png',
        gradient: 'from-amber-600 via-amber-500 to-yellow-500',
        icon: '📸'
    },
    'black & white': {
        name: 'Black & White',
        image: '/style-previews/blackwhite.png',
        gradient: 'from-gray-900 via-gray-600 to-gray-300',
        icon: '⚫'
    },
    'oil painting': {
        name: 'Oil Painting',
        image: '/style-previews/oilpainting.png',
        gradient: 'from-orange-700 via-amber-600 to-yellow-600',
        icon: '🎨'
    },
    '3d model': {
        name: '3D Model',
        image: '/style-previews/3dmodel.png',
        gradient: 'from-blue-600 via-cyan-500 to-teal-500',
        icon: '🔷'
    },
    drawing: {
        name: 'Drawing',
        image: '/style-previews/drawing.png',
        gradient: 'from-purple-600 via-purple-500 to-pink-500',
        icon: '✏️'
    },
    'comic book': {
        name: 'Comic Book',
        gradient: 'from-red-600 via-yellow-500 to-blue-600',
        icon: '💥'
    },
    anime: {
        name: 'Anime',
        gradient: 'from-pink-500 via-rose-500 to-red-500',
        icon: '🌸'
    },
    'pixel art': {
        name: 'Pixel Art',
        gradient: 'from-green-600 via-emerald-500 to-teal-500',
        icon: '🎮'
    },
    'pop art': {
        name: 'Pop Art',
        gradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
        icon: '🎭'
    },
    watercolor: {
        name: 'Watercolor',
        gradient: 'from-sky-400 via-blue-400 to-indigo-400',
        icon: '💧'
    },
    'stick-style': {
        name: 'Stick Style',
        gradient: 'from-gray-700 via-gray-600 to-gray-500',
        icon: '🖊️'
    },
    'naruto anime': {
        name: 'Naruto Anime',
        gradient: 'from-orange-600 via-orange-500 to-yellow-500',
        icon: '🍥'
    },
    'game of thrones': {
        name: 'Game of Thrones',
        gradient: 'from-gray-800 via-red-900 to-gray-900',
        icon: '⚔️'
    }
};

// Inline getIdeogramStyleType function to avoid import issues
const getIdeogramStyleType = (styleName) => {
    const styleMap = {
        'realistic': 'REALISTIC',
        'cinematic': 'REALISTIC',
        'black & white': 'REALISTIC',
        'oil painting': 'GENERAL',
        '3d model': 'RENDER_3D',
        'drawing': 'GENERAL',
        'comic book': 'GENERAL',
        'anime': 'ANIME',
        'pixel art': 'GENERAL',
        'pop art': 'GENERAL',
        'watercolor': 'GENERAL',
        'stick-style': 'DESIGN',
        'stick style': 'DESIGN',
        'naruto anime': 'ANIME',
        'naruto-anime': 'ANIME',
        'game of thrones': 'REALISTIC',
        'game-of-thrones': 'REALISTIC'
    };
    const lowerStyle = styleName.toLowerCase();
    return styleMap[lowerStyle] || 'GENERAL';
};

const ImageGenerator = () => {
    const containerRef = useRef(null);
    const scenesRef = useRef(null);
    const { scenes } = useScript();
    const { images, setImages, isGeneratingImages, setIsGeneratingImages, imageGenerationProgress, setImageGenerationProgress, generatedAudioUrl } = useMedia();
    const { setLoading } = useUI();

    const [selectedStyle, setSelectedStyle] = useState('cinematic');
    const [showPrompts, setShowPrompts] = useState(false);

    // Modal states
    const [showGenerationModal, setShowGenerationModal] = useState(false);
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    // Mode toggle state
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    // Drag-and-drop states for timeline reordering
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Generation settings
    const [generationSettings, setGenerationSettings] = useState({
        aspectRatio: '16:9',
        quality: 'Better',
        animate: false,
        imageCount: null, // User must choose - no default
        selectedStyle: null,
        additionalContext: ''
    });

    // Audio playback state
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const audioRef = useRef(null);

    // Upload state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadingImages, setUploadingImages] = useState({});
    const fileInputRef = useRef(null);

    // Debug modal state
    useEffect(() => {
        console.log('🔍 Modal State Changed:');
        console.log('   showImageModal:', showImageModal);
        console.log('   selectedImageIndex:', selectedImageIndex);
    }, [showImageModal, selectedImageIndex]);

    // Animation effect removed - was causing runtime errors
    // useEffect(() => {
    //     if (scenes.length > 0 && containerRef.current) {
    //         // fadeInUp animation removed
    //     }
    // }, [scenes]);

    // Animation effect removed - was causing runtime errors
    // useEffect(() => {
    //     if (images.length > 0 && scenesRef.current) {
    //         // staggerFadeIn animation removed
    //     }
    // }, [images]);

    const handleGenerateImages = async (checkSettings = null) => {
        // Use passed settings or current state
        const currentSettings = checkSettings || generationSettings;

        console.log('🚀 handleGenerateImages CALLED!');
        console.log('🚀 scenes.length:', scenes.length);
        console.log('🚀 Settings used:', JSON.stringify(currentSettings));

        if (!scenes.length) {
            console.log('⚠️ No scenes, returning early');
            return;
        }

        console.log('✅ Starting image generation...');
        // Early validation - check imports at the very start
        try {
            if (typeof generateImagePromptAPI !== 'function') {
                throw new Error(`generateImagePromptAPI is ${typeof generateImagePromptAPI}, expected function`);
            }
            if (typeof generateImageAPI !== 'function') {
                throw new Error(`generateImageAPI is ${typeof generateImageAPI}, expected function`);
            }
            if (typeof getIdeogramStyleType !== 'function') {
                throw new Error(`getIdeogramStyleType is ${typeof getIdeogramStyleType}, expected function`);
            }
        } catch (error) {
            console.error('❌ Import validation failed:', error);
            alert(`Error: ${error.message}. Please refresh the page.`);
            return;
        }

        // Debug: Check if functions are imported correctly
        console.log('🔍 Debug - generateImagePromptAPI:', typeof generateImagePromptAPI);
        console.log('🔍 Debug - generateImageAPI:', typeof generateImageAPI);
        console.log('🔍 Debug - getIdeogramStyleType:', typeof getIdeogramStyleType);

        setIsGeneratingImages(true);
        setLoading(prev => ({ ...prev, images: true }));
        setImageGenerationProgress(0);

        try {
            // STRICT: Use the exact imageCount from settings, don't fallback to scenes.length
            const requestedCount = currentSettings.imageCount ? parseInt(currentSettings.imageCount, 10) : 0;
            const targetCount = requestedCount > 0 ? Math.min(requestedCount, scenes.length) : 1;

            console.log('📊 Image Generation Debug:');
            console.log('   requestedCount:', requestedCount);
            console.log('   scenes.length:', scenes.length);
            console.log('   targetCount:', targetCount);
            console.log('   currentSettings.imageCount:', currentSettings.imageCount);

            // RESET images array to match targetCount exactly.
            // This ensures if user requests 2 images, the array becomes length 2, removing any extra previous images.
            const newImages = Array(targetCount).fill(null).map((_, index) => {
                // Preserve existing state if available (though we are about to overwrite it with 'generating')
                return images[index] || { status: 'pending', url: null };
            });
            setImages(newImages);

            for (let i = 0; i < targetCount; i++) {
                const scene = scenes[i];
                newImages[i] = { ...newImages[i], status: 'generating' };
                setImages([...newImages]);

                try {
                    // 1. Generate Prompt
                    const styleName = currentSettings.selectedStyle || 'cinematic';
                    const promptText = `You are an expert at creating ULTRA-DETAILED, ACCURATE image prompts for ${styleName} style.

SCENE ${i + 1} TEXT:
${scene.text}

Create a detailed image prompt (55-75 words) that accurately represents this scene, including all characters, their interactions, the setting, and key visual details. Match emotions, colors, actions, and props exactly as described in the scene text.

Output ONLY the final prompt - no analysis or additional text.`;

                    console.log(`🎨 Generating prompt for scene ${i + 1} with style: ${styleName}...`);

                    // Ensure function is available before calling
                    if (!generateImagePromptAPI || typeof generateImagePromptAPI !== 'function') {
                        throw new Error('generateImagePromptAPI is not available');
                    }

                    const promptResponse = await generateImagePromptAPI(promptText, 1000);
                    let prompt = '';
                    // Handle Claude format: { content: [{ text: "..." }] }
                    if (promptResponse?.content && promptResponse.content[0] && promptResponse.content[0].text) {
                        prompt = promptResponse.content[0].text;
                    }
                    // Handle ChatGPT-compatible format: { choices: [{ message: { content: "..." } }] }
                    else if (promptResponse?.choices && promptResponse.choices[0] && promptResponse.choices[0].message && promptResponse.choices[0].message.content) {
                        prompt = promptResponse.choices[0].message.content;
                    }
                    // Handle direct string response
                    else if (typeof promptResponse === 'string') {
                        prompt = promptResponse;
                    } else {
                        console.error('Invalid response format:', promptResponse);
                        throw new Error('Invalid response format from image prompt API');
                    }
                    prompt = prompt.replace(/^["']|["']$/g, '').trim();
                    newImages[i].prompt = prompt;

                    // Generate image
                    console.log(`🖼️ Generating image for scene ${i + 1} with style: ${currentSettings.selectedStyle}...`);

                    // Ensure function is available before calling
                    if (!generateImageAPI || typeof generateImageAPI !== 'function') {
                        throw new Error('generateImageAPI is not available');
                    }

                    const styleType = getIdeogramStyleType(currentSettings.selectedStyle);
                    console.log(`📐 Style type: ${styleType}`);
                    console.log(`📐 Aspect ratio: ${currentSettings.aspectRatio}`);
                    console.log(`🎨 Requesting ${currentSettings.selectedStyle} style for ALL images in this batch`);
                    const imageResponse = await generateImageAPI(prompt, currentSettings.aspectRatio, 'TURBO', styleType);
                    console.log(`✅ Image response received for scene ${i + 1}:`, imageResponse);

                    let imageUrl = '';
                    if (imageResponse?.data && imageResponse.data[0] && imageResponse.data[0].url) {
                        imageUrl = imageResponse.data[0].url;
                    } else {
                        console.error('Invalid image response:', imageResponse);
                        throw new Error('No image URL found in response');
                    }

                    newImages[i] = { status: 'completed', url: imageUrl, prompt };
                } catch (error) {
                    console.error(`Error generating image for scene ${i + 1}:`, error);
                    newImages[i] = { status: 'error', error: error.message || 'Unknown error occurred' };
                }

                setImages([...newImages]);
                setImageGenerationProgress(((i + 1) / targetCount) * 100);
            }

        } catch (error) {
            console.error('Error in image generation flow:', error);
            alert('Failed to generate images: ' + error.message);
        } finally {
            setIsGeneratingImages(false);
            setLoading(prev => ({ ...prev, images: false }));
        }
    };

    const handleGenerateWithSettings = async () => {
        if (!generationSettings.selectedStyle) {
            alert('Please select a style before generating images.');
            return;
        }

        if (!generationSettings.imageCount || generationSettings.imageCount < 1) {
            alert('Please enter a valid image count (1-' + Math.min(scenes.length, 15) + ').');
            return;
        }

        setShowGenerationModal(false);
        // Pass the current settings state explicitly to avoid closure staleness
        console.log('Passing settings to generator:', generationSettings);
        await handleGenerateImages(generationSettings);
    };

    const handleRegenerateImage = async (imageIndex) => {
        if (!generationSettings.selectedStyle) {
            alert('Please select a style in the generation settings first.');
            return;
        }

        const scene = scenes[imageIndex];
        if (!scene) {
            alert('Scene not found.');
            return;
        }

        setShowImageModal(false);
        setIsGeneratingImages(true);
        setLoading(prev => ({ ...prev, images: true }));

        try {
            console.log(`🔄 Regenerating image for scene ${imageIndex + 1}...`);

            // Update image status to 'generating'
            const updatedImages = [...images];
            updatedImages[imageIndex] = { status: 'generating' };
            setImages(updatedImages);

            // Generate prompt
            const styleName = generationSettings.selectedStyle || 'cinematic';
            const promptText = `You are an expert at creating ULTRA-DETAILED, ACCURATE image prompts for ${styleName} style.

SCENE ${imageIndex + 1} TEXT:
${scene.text}

Create a detailed image prompt (55-75 words) that accurately represents this scene, including all characters, their interactions, the setting, and key visual details. Match emotions, colors, actions, and props exactly as described in the scene text.

Output ONLY the final prompt - no analysis or additional text.`;

            const promptResponse = await generateImagePromptAPI(promptText, 1000);
            let prompt = '';
            if (promptResponse?.content && promptResponse.content[0] && promptResponse.content[0].text) {
                prompt = promptResponse.content[0].text;
            } else if (promptResponse?.choices && promptResponse.choices[0] && promptResponse.choices[0].message && promptResponse.choices[0].message.content) {
                prompt = promptResponse.choices[0].message.content;
            } else if (typeof promptResponse === 'string') {
                prompt = promptResponse;
            } else {
                throw new Error('Invalid response format from image prompt API');
            }
            prompt = prompt.replace(/^["']|["']$/g, '').trim();

            // Generate image
            const styleType = getIdeogramStyleType(generationSettings.selectedStyle);
            const imageResponse = await generateImageAPI(prompt, generationSettings.aspectRatio, 'TURBO', styleType);

            let imageUrl = '';
            if (imageResponse?.data && imageResponse.data[0] && imageResponse.data[0].url) {
                imageUrl = imageResponse.data[0].url;
            } else {
                throw new Error('No image URL found in response');
            }

            // Update image with new data
            updatedImages[imageIndex] = { status: 'completed', url: imageUrl, prompt };
            setImages(updatedImages);

            console.log(`✅ Image ${imageIndex + 1} regenerated successfully!`);
        } catch (error) {
            console.error(`Error regenerating image for scene ${imageIndex + 1}:`, error);
            const updatedImages = [...images];
            updatedImages[imageIndex] = { status: 'error', error: error.message || 'Unknown error occurred' };
            setImages(updatedImages);
            alert('Failed to regenerate image: ' + error.message);
        } finally {
            setIsGeneratingImages(false);
            setLoading(prev => ({ ...prev, images: false }));
        }
    };

    const handleImageClick = (index) => {
        console.log('🖼️ Image clicked! Index:', index);
        console.log('🖼️ Setting selectedImageIndex to:', index);
        console.log('🖼️ Setting showImageModal to: true');
        setSelectedImageIndex(index);
        setShowImageModal(true);
        console.log('🖼️ State updated');
    };

    // Drag-and-drop handlers for timeline reordering
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target);
        // Add visual feedback
        e.target.style.opacity = '0.5';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = (e) => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        // Reorder scenes
        const newScenes = [...scenes];
        const [draggedScene] = newScenes.splice(draggedIndex, 1);
        newScenes.splice(dropIndex, 0, draggedScene);
        setScenes(newScenes);

        // Reorder images to match
        const newImages = [...images];
        const [draggedImage] = newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, draggedImage);
        setImages(newImages);

        console.log(`🔄 Reordered: Scene ${draggedIndex + 1} moved to position ${dropIndex + 1}`);

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        // Delay resetting to prevent click from firing
        setTimeout(() => {
            setIsDragging(false);
            setDraggedIndex(null);
            setDragOverIndex(null);
        }, 100);
    };

    // Audio playback functions
    const toggleAudioPlay = () => {
        if (!audioRef.current) return;

        if (isAudioPlaying) {
            audioRef.current.pause();
            setIsAudioPlaying(false);
            setIsAudioLoading(false);
        } else {
            setIsAudioLoading(true);
            audioRef.current.play().then(() => {
                setIsAudioPlaying(true);
                setIsAudioLoading(false);
            }).catch(error => {
                console.error('Audio play failed:', error);
                setIsAudioPlaying(false);
                setIsAudioLoading(false);
            });
        }
    };

    // Handle audio end event
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleEnded = () => setIsAudioPlaying(false);
            audio.addEventListener('ended', handleEnded);
            return () => audio.removeEventListener('ended', handleEnded);
        }
    }, []);

    // Upload functions
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Validate files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file.`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert(`${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Limit to number of scenes
        const maxImages = scenes.length;
        const imagesToUpload = validFiles.slice(0, maxImages);

        if (validFiles.length > maxImages) {
            alert(`You can only upload up to ${maxImages} images for ${maxImages} scenes.`);
        }

        setUploadingImages({});
        setShowUploadModal(false);

        // Create image objects for upload
        const newImages = Array(scenes.length).fill(null).map((_, index) => {
            return images[index] || { status: 'pending', url: null };
        });

        // Process each uploaded image
        for (let i = 0; i < imagesToUpload.length; i++) {
            const file = imagesToUpload[i];
            const sceneIndex = i;

            try {
                setUploadingImages(prev => ({ ...prev, [sceneIndex]: true }));

                // Convert file to base64 data URL for immediate display
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                newImages[sceneIndex] = {
                    status: 'completed',
                    url: dataUrl,
                    file: file,
                    fileName: file.name,
                    uploaded: true
                };

            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                newImages[sceneIndex] = {
                    status: 'error',
                    error: `Failed to process ${file.name}: ${error.message}`
                };
            } finally {
                setUploadingImages(prev => ({ ...prev, [sceneIndex]: false }));
            }
        }

        setImages(newImages);

        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const removeUploadedImage = (index) => {
        const newImages = [...images];
        newImages[index] = { status: 'pending', url: null };
        setImages(newImages);
    };

    if (!scenes.length) return null;

    return (
        <>
            {/* Image Generation Settings Modal */}
            {showGenerationModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowGenerationModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Image Generation Settings</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your image generation preferences</p>
                            {/* Mode Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {isAdvancedMode ? 'A' : 'B'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {isAdvancedMode ? 'Advanced Mode' : 'Basic Mode'}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {isAdvancedMode ? 'Full control with advanced options' : 'Simple settings for quick generation'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${isAdvancedMode
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                        } shadow-lg`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAdvancedMode ? 'translate-x-8' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Row 1: Dynamic fields based on mode */}
                            <div className={`grid gap-6 ${isAdvancedMode ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'}`}>
                                {!isAdvancedMode ? (
                                    <>
                                        {/* Basic Mode Fields */}
                                        {/* Aspect Ratio */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                Aspect Ratio
                                            </label>
                                            <select
                                                value={generationSettings.aspectRatio}
                                                onChange={(e) => setGenerationSettings({ ...generationSettings, aspectRatio: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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
                                                onChange={(e) => setGenerationSettings({ ...generationSettings, quality: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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
                                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {generationSettings.animate ? 'Enabled' : 'Disabled'}
                                                </span>
                                                <button
                                                    onClick={() => setGenerationSettings({ ...generationSettings, animate: !generationSettings.animate })}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${generationSettings.animate
                                                        ? 'bg-indigo-600'
                                                        : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${generationSettings.animate ? 'translate-x-6' : 'translate-x-1'
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
                                                    value={generationSettings.imageCount || ''}
                                                    onChange={(e) => {
                                                        const maxAllowed = Math.min(scenes.length, 15);
                                                        const inputValue = e.target.value;
                                                        if (inputValue === '') {
                                                            setGenerationSettings(prev => ({ ...prev, imageCount: null }));
                                                            return;
                                                        }

                                                        const numValue = parseInt(inputValue, 10);
                                                        if (!isNaN(numValue) && numValue >= 1) {
                                                            const value = Math.min(maxAllowed, Math.max(1, numValue));
                                                            setGenerationSettings(prev => ({ ...prev, imageCount: value }));
                                                        }
                                                    }}
                                                    placeholder="1-15"
                                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Max: {Math.min(scenes.length, 15)} scenes available
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Advanced Mode Fields */}
                                        {/* Animation */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                Animation
                                            </label>
                                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {generationSettings.animate ? 'Enabled' : 'Disabled'}
                                                </span>
                                                <button
                                                    onClick={() => setGenerationSettings({ ...generationSettings, animate: !generationSettings.animate })}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${generationSettings.animate
                                                        ? 'bg-indigo-600'
                                                        : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${generationSettings.animate ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Image Count with Prompt Safety */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                Image Count <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={Math.min(scenes.length, 15)}
                                                    value={generationSettings.imageCount || ''}
                                                    onChange={(e) => {
                                                        const maxAllowed = Math.min(scenes.length, 15);
                                                        const inputValue = e.target.value;
                                                        if (inputValue === '') {
                                                            setGenerationSettings(prev => ({ ...prev, imageCount: null }));
                                                            return;
                                                        }

                                                        const numValue = parseInt(inputValue, 10);
                                                        if (!isNaN(numValue) && numValue >= 1) {
                                                            const value = Math.min(maxAllowed, Math.max(1, numValue));
                                                            setGenerationSettings(prev => ({ ...prev, imageCount: value }));
                                                        }
                                                    }}
                                                    placeholder="1-15"
                                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="promptSafety"
                                                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <label htmlFor="promptSafety" className="text-xs text-gray-600 dark:text-gray-400">
                                                        Enable prompt safety filters
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timeline Options */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                Timeline Options
                                            </label>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="timelineSplits"
                                                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <label htmlFor="timelineSplits" className="text-sm text-gray-700 dark:text-gray-300">
                                                        Enable timeline splits
                                                    </label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="timelineView"
                                                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <label htmlFor="timelineView" className="text-sm text-gray-700 dark:text-gray-300">
                                                        Timeline view
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Row 3: Style Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Choose Style <span className="text-red-500">*</span>
                                </label>
                                <button
                                    onClick={() => setShowStyleModal(true)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-pink-500 dark:hover:border-pink-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-all flex items-center justify-between"
                                >
                                    <span>{generationSettings.selectedStyle || 'Click to select a style'}</span>
                                    <Palette size={20} />
                                </button>
                            </div>

                            {/* Row 4: Additional Context (Basic Mode Only) */}
                            {!isAdvancedMode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Additional Context (Optional)
                                    </label>
                                    <textarea
                                        value={generationSettings.additionalContext}
                                        onChange={(e) => setGenerationSettings({ ...generationSettings, additionalContext: e.target.value })}
                                        rows="3"
                                        placeholder="Add any additional instructions or context for image generation..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowGenerationModal(false)}
                                className="px-6 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateWithSettings}
                                disabled={!generationSettings.selectedStyle || !generationSettings.imageCount || generationSettings.imageCount < 1}
                                className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${!generationSettings.selectedStyle || !generationSettings.imageCount || generationSettings.imageCount < 1
                                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                Generate Images
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Style Selection Modal */}
            {showStyleModal && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowStyleModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Image Style</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select a style for your generated images</p>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Object.entries(IMAGE_STYLES).map(([key, style]) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setGenerationSettings({ ...generationSettings, selectedStyle: style.name });
                                            setShowStyleModal(false);
                                        }}
                                        className={`group relative overflow-hidden rounded-xl border-2 transition-all ${generationSettings.selectedStyle === style.name
                                            ? 'border-pink-500 shadow-lg shadow-pink-500/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-md'
                                            }`}
                                    >
                                        {/* Preview Image/Gradient */}
                                        <div className="h-32 relative overflow-hidden">
                                            {style.image ? (
                                                <img
                                                    src={style.image}
                                                    alt={style.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback to gradient if image fails to load
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={`h-full bg-gradient-to-br ${style.gradient} flex items-center justify-center text-4xl ${style.image ? 'hidden' : ''}`}
                                                style={{ display: style.image ? 'none' : 'flex' }}
                                            >
                                                {style.icon}
                                            </div>
                                        </div>

                                        {/* Style Name */}
                                        <div className={`p-3 text-center font-semibold transition-colors ${generationSettings.selectedStyle === style.name
                                            ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 group-hover:bg-gray-50 dark:group-hover:bg-gray-750'
                                            }`}>
                                            {style.name}
                                        </div>

                                        {/* Selected Indicator */}
                                        {generationSettings.selectedStyle === style.name && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                                                ✓
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {showImageModal && selectedImageIndex !== null && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowImageModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Scene {selectedImageIndex + 1}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{scenes[selectedImageIndex]?.text}</p>
                            </div>
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <span className="text-2xl text-gray-500 dark:text-gray-400">×</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {images[selectedImageIndex]?.status === 'completed' ? (
                                <>
                                    {/* Image Display */}
                                    <div className="mb-6 rounded-xl overflow-hidden bg-black">
                                        <img
                                            src={images[selectedImageIndex].url}
                                            alt={`Scene ${selectedImageIndex + 1}`}
                                            className="w-full h-auto"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href={images[selectedImageIndex].url}
                                            download={`scene-${selectedImageIndex + 1}.jpg`}
                                            className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-center font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download size={20} />
                                            Download Image
                                        </a>
                                        <button
                                            onClick={() => handleRegenerateImage(selectedImageIndex)}
                                            disabled={isGeneratingImages}
                                            className={`flex-1 min-w-[200px] px-6 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isGeneratingImages
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white hover:shadow-xl'
                                                }`}
                                        >
                                            <RefreshCw size={20} />
                                            Regenerate Image
                                        </button>
                                    </div>

                                    {/* Prompt Display (if available) */}
                                    {images[selectedImageIndex].prompt && (
                                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Generated Prompt:</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{images[selectedImageIndex].prompt}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <p>Image not available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload Images</h3>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload size={32} className="text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Choose Images</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Upload up to {scenes.length} images for your {scenes.length} scenes
                                    </p>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />

                                <button
                                    onClick={openFileDialog}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-lg transition-all hover:scale-105"
                                >
                                    Select Images
                                </button>

                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Supported formats: JPG, PNG, GIF, WebP (Max 10MB each)
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-2">
                                    💡 Uploaded images work exactly like AI-generated ones for video creation
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div id="image-generator" ref={containerRef} className="glass-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -z-10" />

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-sm">
                        <ImageIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Visuals</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Generate cinematic scenes with AI</p>
                    </div>
                </div>

                {/* Upload Status */}
                {images.some(img => img && img.status === 'completed') && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                                    <ImageIcon size={16} />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {images.filter(img => img && img.status === 'completed').length} of {scenes.length} Scenes Ready
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                        {images.filter(img => img && img.uploaded).length} uploaded, {images.filter(img => img && !img.uploaded && img.status === 'completed').length} generated
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Audio Preview Section */}
                {generatedAudioUrl && (
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                                    <Music size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-lg">Voiceover Ready</div>
                                    <div className="text-sm text-green-600 dark:text-green-400">Your narration is prepared for the video</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleAudioPlay}
                                    disabled={!generatedAudioUrl || isAudioLoading}
                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-teal-600 text-white flex items-center justify-center hover:from-green-700 hover:to-teal-700 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    title={isAudioLoading ? 'Loading...' : isAudioPlaying ? 'Pause voiceover' : 'Play voiceover'}
                                >
                                    {isAudioLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : isAudioPlaying ? (
                                        <Pause size={20} />
                                    ) : (
                                        <Play size={20} className="ml-0.5" />
                                    )}
                                </button>
                                <a
                                    href={generatedAudioUrl}
                                    download="voiceover.mp3"
                                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-all hover:scale-110 active:scale-95"
                                    title="Download voiceover"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        </div>

                        <audio
                            ref={audioRef}
                            src={generatedAudioUrl}
                            className="hidden"
                        />

                        {/* Waveform Visualization */}
                        <div className="flex items-center gap-1 h-16 mt-4">
                            {[...Array(40)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-gradient-to-t from-green-500 to-teal-500 rounded-full transition-all duration-300"
                                    style={{
                                        height: isAudioPlaying ? `${20 + Math.random() * 80}%` : '20%',
                                        opacity: isAudioPlaying ? 0.8 : 0.4
                                    }}
                                />
                            ))}
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Listen to your voiceover while generating matching visuals
                            </p>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowGenerationModal(true)}
                            disabled={isGeneratingImages}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform flex items-center justify-center gap-3 min-h-[56px]
                            ${isGeneratingImages
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98]'}`}
                        >
                            {isGeneratingImages ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Generating... {Math.round((images.filter(i => i.status === 'completed').length / Math.min(generationSettings.imageCount || scenes.length, scenes.length)) * 100)}%</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    <span>Generate with AI</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setShowUploadModal(true)}
                            disabled={isGeneratingImages}
                            className={`w-full py-4 rounded-xl font-bold text-lg border-2 border-pink-600 text-pink-600 dark:text-pink-400 bg-white dark:bg-gray-800 shadow-lg transition-all transform flex items-center justify-center gap-3 min-h-[56px] hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:scale-[1.02] active:scale-[0.98]
                            ${isGeneratingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Upload size={24} />
                            <span>Upload Images</span>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {isGeneratingImages && (
                        <div className="mt-4">
                            <ProgressBar
                                progress={imageGenerationProgress}
                                status={`Generating scene images...`}
                                current={images.filter(i => i.status === 'completed').length}
                                total={Math.min(generationSettings.imageCount || scenes.length, scenes.length)}
                                variant="info"
                                showPercentage={true}
                            />
                        </div>
                    )}

                </div>

                {images.some(img => img && img.status === 'completed') && (
                    <div ref={scenesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img, index) => {
                            // Skip empty slots
                            if (!img || img.status !== 'completed') return null;

                            // Find the corresponding scene for this image
                            const scene = scenes[index];
                            if (!scene) return null; // Safety check

                            return (
                                <div
                                    key={index}
                                    className="group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                                    onClick={() => handleImageClick(index)}
                                >
                                    {img.status === 'completed' ? (
                                        <>
                                            <img
                                                src={img.url}
                                                alt={`Scene ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${img.uploaded
                                                        ? 'bg-blue-500/80 text-white'
                                                        : 'bg-purple-500/80 text-white'
                                                        }`}>
                                                        {img.uploaded ? 'Uploaded' : 'Generated'}
                                                    </span>
                                                </div>
                                                <p className="text-white text-sm line-clamp-2 mb-2">{scene.text}</p>
                                                <div className="flex gap-2 pointer-events-auto">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Download functionality
                                                            const link = document.createElement('a');
                                                            link.href = img.url;
                                                            link.download = img.uploaded ? (img.fileName || `scene-${index + 1}.jpg`) : `scene-${index + 1}.jpg`;
                                                            link.click();
                                                        }}
                                                        className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30 transition-all hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="Download image"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                    {img.uploaded ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeUploadedImage(index);
                                                            }}
                                                            className="p-2 bg-red-500/80 backdrop-blur-md rounded-lg text-white hover:bg-red-600/80 transition-all hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                            title="Remove uploaded image"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRegenerateImage(index);
                                                            }}
                                                            className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30 transition-all hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                            title="Regenerate image"
                                                        >
                                                            <RefreshCw size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : img.status === 'generating' ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                            <Loader2 className="animate-spin mb-2" size={32} />
                                            <span className="text-sm font-medium">Creating Scene {index + 1}...</span>
                                        </div>
                                    ) : img.status === 'error' ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-4 text-center">
                                            <span className="text-sm font-medium">Generation Failed</span>
                                            <button className="mt-2 text-xs underline">Retry</button>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}

                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-xs font-bold text-white">
                                        Scene {index + 1}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default ImageGenerator;

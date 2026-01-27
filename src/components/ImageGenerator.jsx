import { useState, useRef, useEffect } from "react";
import { useScript } from "../context/ScriptContext";
import { useMedia } from "../context/MediaContext";
import { useUI } from "../context/UIContext";
import {
  ImageIcon,
  Palette,
  Loader2,
  Sparkles,
  Download,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  Music,
  Upload,
  X,
  Check,
} from "lucide-react";
import { API_BASE_URL } from "../utils/constants.js";
import ProgressBar from "./common/ProgressBar";

console.log("ImageGenerator module loading...");
console.log(
  "API_BASE_URL:",
  API_BASE_URL || "(empty - using relative URLs via Vite proxy)",
);

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

const ImageGenerator = () => {
  const containerRef = useRef(null);
  const scenesRef = useRef(null);
  const { scenes, sceneCount, setSceneCount, updateScenes, script } = useScript();
  const {
    images,
    setImages,
    isGeneratingImages,
    setIsGeneratingImages,
    imageGenerationProgress,
    setImageGenerationProgress,
    generatedAudioUrl,
    setGeneratedAudioUrl,
  } = useMedia();
  const { setLoading } = useUI();

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);

  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Generation settings
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

  const [timelineZoom, setTimelineZoom] = useState(50);

  // Audio playback state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Audio State
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(1);
  const audioRef = useRef(null);

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const [resultPreviewIndex, setResultPreviewIndex] = useState(0);
  const [expandedAccordions, setExpandedAccordions] = useState({});

  // Reset preview index when images change
  useEffect(() => {
    const firstCompleted = images.findIndex(
      (img) => img && img.status === "completed",
    );
    if (firstCompleted !== -1) {
      setResultPreviewIndex(firstCompleted);
    }
  }, [images]);

  const handleAudioReplacement = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGeneratedAudioUrl(url);
      // Reset duration so it recalculates
      setAudioDuration(0);
      // setAudioCurrentTime(0); // Optional: reset time
    }
  };

  // Debug modal state
  useEffect(() => {
    console.log("🔍 Modal State Changed:");
    console.log("   showImageModal:", showImageModal);
    console.log("   selectedImageIndex:", selectedImageIndex);
  }, [showImageModal, selectedImageIndex]);



  const handleGenerateImages = async (checkSettings = null) => {
    // Use passed settings or current state
    const currentSettings = checkSettings || generationSettings;

    console.log("🚀 handleGenerateImages CALLED!");
    console.log("🚀 scenes.length:", scenes.length);
    console.log("🚀 Settings used:", JSON.stringify(currentSettings));

    if (!scenes.length) {
      console.log("⚠️ No scenes, returning early");
      return;
    }

    console.log("✅ Starting image generation...");
    // Early validation - check imports at the very start
    try {
      if (typeof generateImagePromptAPI !== "function") {
        throw new Error(
          `generateImagePromptAPI is ${typeof generateImagePromptAPI}, expected function`,
        );
      }
      if (typeof generateImageAPI !== "function") {
        throw new Error(
          `generateImageAPI is ${typeof generateImageAPI}, expected function`,
        );
      }
      if (typeof getIdeogramStyleType !== "function") {
        throw new Error(
          `getIdeogramStyleType is ${typeof getIdeogramStyleType}, expected function`,
        );
      }
    } catch (error) {
      console.error("❌ Import validation failed:", error);
      alert(`Error: ${error.message}. Please refresh the page.`);
      return;
    }

    console.log(
      "🔍 Debug - generateImagePromptAPI:",
      typeof generateImagePromptAPI,
    );
    console.log("🔍 Debug - generateImageAPI:", typeof generateImageAPI);
    console.log(
      "🔍 Debug - getIdeogramStyleType:",
      typeof getIdeogramStyleType,
    );

    setIsGeneratingImages(true);
    setLoading((prev) => ({ ...prev, images: true }));
    setImageGenerationProgress(0);

    try {
      const requestedCount = currentSettings.imageCount
        ? parseInt(currentSettings.imageCount, 10)
        : scenes.length;
      const targetCount =
        requestedCount > 0 ? Math.min(requestedCount, 15) : scenes.length;

      console.log("📊 Image Generation Debug:");
      console.log("   requestedCount:", requestedCount);
      console.log("   scenes.length:", scenes.length);
      console.log("   targetCount:", targetCount);
      console.log("   currentSettings.imageCount:", currentSettings.imageCount);

      const newImages = Array(targetCount)
        .fill(null)
        .map((_, index) => {
          return images[index] || { status: "pending", url: null };
        });
      setImages(newImages);

      for (let i = 0; i < targetCount; i++) {
        const scene = scenes[i];
        newImages[i] = { ...newImages[i], status: "generating" };
        setImages([...newImages]);

        try {
          // 1. Generate Prompt
          const styleName = currentSettings.selectedStyle || "cinematic";
          const promptText = `You are an expert at creating ULTRA-DETAILED, ACCURATE image prompts for ${styleName} style.

SCENE ${i + 1} TEXT:
${scene.text}

Create a detailed image prompt (55-75 words) that accurately represents this scene, including all characters, their interactions, the setting, and key visual details. Match emotions, colors, actions, and props exactly as described in the scene text.

Output ONLY the final prompt - no analysis or additional text.`;

          console.log(
            `🎨 Generating prompt for scene ${i + 1} with style: ${styleName}...`,
          );

          // Ensure function is available before calling
          if (
            !generateImagePromptAPI ||
            typeof generateImagePromptAPI !== "function"
          ) {
            throw new Error("generateImagePromptAPI is not available");
          }

          const promptResponse = await generateImagePromptAPI(promptText, 1000);
          let prompt = "";
          // Handle Claude format: { content: [{ text: "..." }] }
          if (
            promptResponse?.content &&
            promptResponse.content[0] &&
            promptResponse.content[0].text
          ) {
            prompt = promptResponse.content[0].text;
          }
          // Handle ChatGPT-compatible format: { choices: [{ message: { content: "..." } }] }
          else if (
            promptResponse?.choices &&
            promptResponse.choices[0] &&
            promptResponse.choices[0].message &&
            promptResponse.choices[0].message.content
          ) {
            prompt = promptResponse.choices[0].message.content;
          }
          // Handle direct string response
          else if (typeof promptResponse === "string") {
            prompt = promptResponse;
          } else {
            console.error("Invalid response format:", promptResponse);
            throw new Error("Invalid response format from image prompt API");
          }
          prompt = prompt.replace(/^["']|["']$/g, "").trim();
          newImages[i].prompt = prompt;

          // Generate image
          console.log(
            `🖼️ Generating image for scene ${i + 1} with style: ${currentSettings.selectedStyle}...`,
          );

          // Ensure function is available before calling
          if (!generateImageAPI || typeof generateImageAPI !== "function") {
            throw new Error("generateImageAPI is not available");
          }

          const styleType = getIdeogramStyleType(currentSettings.selectedStyle);
          console.log(`📐 Style type: ${styleType}`);
          console.log(`📐 Aspect ratio: ${currentSettings.aspectRatio}`);
          console.log(`🎨 Quality/Speed: ${currentSettings.quality}`);
          console.log(
            `🎨 Requesting ${currentSettings.selectedStyle} style for ALL images in this batch`,
          );

          // Map quality preset to rendering speed
          let renderingSpeed = "TURBO"; // Default
          if (currentSettings.quality === "Best") renderingSpeed = "QUALITY";
          else if (currentSettings.quality === "Better")
            renderingSpeed = "NORMAL";
          else if (currentSettings.quality === "Good")
            renderingSpeed = "NORMAL";
          else if (currentSettings.quality === "Fine") renderingSpeed = "TURBO";

          const imageResponse = await generateImageAPI(
            prompt,
            currentSettings.aspectRatio,
            renderingSpeed,
            styleType,
          );
          console.log(
            `✅ Image response received for scene ${i + 1}:`,
            imageResponse,
          );

          let imageUrl = "";
          if (
            imageResponse?.data &&
            imageResponse.data[0] &&
            imageResponse.data[0].url
          ) {
            imageUrl = imageResponse.data[0].url;
          } else {
            console.error("Invalid image response:", imageResponse);
            throw new Error("No image URL found in response");
          }

          newImages[i] = { status: "completed", url: imageUrl, prompt };
        } catch (error) {
          console.error(`Error generating image for scene ${i + 1}:`, error);
          newImages[i] = {
            status: "error",
            error: error.message || "Unknown error occurred",
          };
        }

        setImages([...newImages]);
        setImageGenerationProgress(((i + 1) / targetCount) * 100);
      }
    } catch (error) {
      console.error("Error in image generation flow:", error);
      alert("Failed to generate images: " + error.message);
    } finally {
      setIsGeneratingImages(false);
      setLoading((prev) => ({ ...prev, images: false }));
    }
  };

  const handleRegenerateImage = async (imageIndex) => {
    if (!generationSettings.selectedStyle) {
      alert("Please select a style in the generation settings first.");
      return;
    }

    const scene = scenes[imageIndex];
    if (!scene) {
      alert("Scene not found.");
      return;
    }

    setShowImageModal(false);
    setIsGeneratingImages(true);
    setLoading((prev) => ({ ...prev, images: true }));

    try {
      console.log(`🔄 Regenerating image for scene ${imageIndex + 1}...`);
      const updatedImages = [...images];
      updatedImages[imageIndex] = { status: "generating" };
      setImages(updatedImages);
      const styleName = generationSettings.selectedStyle || "cinematic";
      const promptText = `You are an expert at creating ULTRA-DETAILED, ACCURATE image prompts for ${styleName} style.

SCENE ${imageIndex + 1} TEXT:
${scene.text}

Create a detailed image prompt (55-75 words) that accurately represents this scene, including all characters, their interactions, the setting, and key visual details. Match emotions, colors, actions, and props exactly as described in the scene text.

Output ONLY the final prompt - no analysis or additional text.`;

      const promptResponse = await generateImagePromptAPI(promptText, 1000);
      let prompt = "";
      if (
        promptResponse?.content &&
        promptResponse.content[0] &&
        promptResponse.content[0].text
      ) {
        prompt = promptResponse.content[0].text;
      } else if (
        promptResponse?.choices &&
        promptResponse.choices[0] &&
        promptResponse.choices[0].message &&
        promptResponse.choices[0].message.content
      ) {
        prompt = promptResponse.choices[0].message.content;
      } else if (typeof promptResponse === "string") {
        prompt = promptResponse;
      } else {
        throw new Error("Invalid response format from image prompt API");
      }
      prompt = prompt.replace(/^["']|["']$/g, "").trim();

      const styleType = getIdeogramStyleType(generationSettings.selectedStyle);
      const imageResponse = await generateImageAPI(
        prompt,
        generationSettings.aspectRatio,
        "TURBO",
        styleType,
      );

      let imageUrl = "";
      if (
        imageResponse?.data &&
        imageResponse.data[0] &&
        imageResponse.data[0].url
      ) {
        imageUrl = imageResponse.data[0].url;
      } else {
        throw new Error("No image URL found in response");
      }

      updatedImages[imageIndex] = {
        status: "completed",
        url: imageUrl,
        prompt,
      };
      setImages(updatedImages);

      console.log(`✅ Image ${imageIndex + 1} regenerated successfully!`);
    } catch (error) {
      console.error(
        `Error regenerating image for scene ${imageIndex + 1}:`,
        error,
      );
      const updatedImages = [...images];
      updatedImages[imageIndex] = {
        status: "error",
        error: error.message || "Unknown error occurred",
      };
      setImages(updatedImages);
      alert("Failed to regenerate image: " + error.message);
    } finally {
      setIsGeneratingImages(false);
      setLoading((prev) => ({ ...prev, images: false }));
    }
  };

  const handleGenerateClick = async () => {
    const targetCount = generationSettings.imageCount || sceneCount;

    // If the requested count is different from current scenes, update it
    if (targetCount !== scenes.length) {
      setSceneCount(targetCount);
      updateScenes(script, targetCount, audioDuration, true);
    }

    const settingsWithImageCount = {
      ...generationSettings,
      imageCount: targetCount,
    };
    await handleGenerateImages(settingsWithImageCount);
    if (typeof setShowSettings === 'function') setShowSettings(false);
  };


  const isFormValid = () => {
    return !!generationSettings.selectedStyle;
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
      audioRef.current
        .play()
        .then(() => {
          setIsAudioPlaying(true);
          setIsAudioLoading(false);
        })
        .catch((error) => {
          console.error("Audio play failed:", error);
          setIsAudioPlaying(false);
          setIsAudioLoading(false);
        });
    }
  };

  const formatTimeMMSS = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleAudioSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioCurrentTime(time);
    }
  };

  const handleAudioVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };


  // Handle audio end event
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsAudioPlaying(false);
      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, []);

  // Upload functions
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Dynamically adjust scene count to match number of uploaded images
    const imagesToUpload = validFiles.slice(0, 15);
    const newCount = imagesToUpload.length;

    if (newCount !== scenes.length) {
      setSceneCount(newCount);
      updateScenes(script, newCount, audioDuration, true);
    }

    setUploadingImages({});
    setShowUploadModal(false);

    // Create image objects for upload
    const newImages = Array(newCount)
      .fill(null)
      .map((_, index) => {
        return images[index] || { status: "pending", url: null };
      });

    // Process each uploaded image
    for (let i = 0; i < imagesToUpload.length; i++) {
      const file = imagesToUpload[i];
      const sceneIndex = i;

      try {
        setUploadingImages((prev) => ({ ...prev, [sceneIndex]: true }));

        // Convert file to base64 data URL for immediate display
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages[sceneIndex] = {
          status: "completed",
          url: dataUrl,
          file: file,
          fileName: file.name,
          uploaded: true,
        };
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        newImages[sceneIndex] = {
          status: "error",
          error: `Failed to process ${file.name}: ${error.message}`,
        };
      } finally {
        setUploadingImages((prev) => ({ ...prev, [sceneIndex]: false }));
      }
    }

    setImages(newImages);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeUploadedImage = (index) => {
    const newImages = [...images];
    newImages[index] = { status: "pending", url: null };
    setImages(newImages);
  };

  if (!scenes.length) return null;

  return (
    <>
      {/* Image Viewer Modal */}
      {showImageModal && selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Scene {selectedImageIndex + 1}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {scenes[selectedImageIndex]?.text}
                </p>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500 dark:text-gray-400">
                  ×
                </span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {images[selectedImageIndex]?.status === "completed" ? (
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
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white hover:shadow-xl"
                        }`}
                    >
                      <RefreshCw size={20} />
                      Regenerate Image
                    </button>
                  </div>

                  {/* Prompt Display (if available) */}
                  {images[selectedImageIndex].prompt && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Generated Prompt:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {images[selectedImageIndex].prompt}
                      </p>
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upload Images
                </h3>
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
                    <Upload
                      size={32}
                      className="text-pink-600 dark:text-pink-400"
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Choose Images
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Upload up to {scenes.length} images for your {scenes.length}{" "}
                    scenes
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
                  💡 Uploaded images work exactly like AI-generated ones for
                  video creation
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        id="image-generator"
        ref={containerRef}
        className="glass-card relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-sm">
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              Visuals
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Generate cinematic scenes with AI
            </p>
          </div>
        </div>

        {/* Upload Status */}
        {images.some((img) => img && img.status === "completed") && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {
                      images.filter((img) => img && img.status === "completed")
                        .length
                    }{" "}
                    of {scenes.length} Scenes Ready
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {images.filter((img) => img && img.uploaded).length}{" "}
                    uploaded,{" "}
                    {
                      images.filter(
                        (img) =>
                          img && !img.uploaded && img.status === "completed",
                      ).length
                    }{" "}
                    generated
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redesigned Audio Preview Section */}
        {generatedAudioUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={toggleAudioPlay}
                disabled={!generatedAudioUrl || isAudioLoading}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAudioLoading ? (
                  <Loader2 size={18} className="animate-spin text-blue-600" />
                ) : isAudioPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" className="ml-0.5" />
                )}
              </button>

              {/* Current Time */}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[40px]">
                {formatTimeMMSS(audioCurrentTime)}
              </span>

              {/* Progress Bar */}
              <div className="flex-1 relative flex items-center group">
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 0}
                  value={audioCurrentTime}
                  onChange={handleAudioSeek}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                />
              </div>

              {/* Total Duration */}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[40px]">
                {formatTimeMMSS(audioDuration)}
              </span>

              {/* Volume Control */}
              <div className="flex items-center gap-2 group/volume relative">
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  <Volume2 size={20} />
                </button>
                <div className="w-20 hidden group-hover/volume:block absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl lg:static lg:block lg:shadow-none lg:p-0 lg:border-none">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioVolume}
                    onChange={handleAudioVolumeChange}
                    className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
              {/* Download Button */}
              <a
                href={generatedAudioUrl}
                download="voiceover.mp3"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Download Audio"
              >
                <Download size={20} />
              </a>

              {/* Replace Button */}
              {/* <button
                onClick={() => audioInputRef.current?.click()}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Replace with custom audio"
              >
                <RefreshCw size={20} />
              </button> */}
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioReplacement}
                className="hidden"
              />
            </div>

            <audio
              ref={audioRef}
              src={generatedAudioUrl}
              onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
              onEnded={() => setIsAudioPlaying(false)}
              className="hidden"
            />
          </div>
        )}


        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Settings Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Generation Settings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure and generate scenes ({scenes.length} available)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Upload Button integrated here */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold text-gray-700 dark:text-gray-300"
                >
                  <Upload size={18} />
                  <span>Upload Images</span>
                </button>

                {/* Mode Toggle */}
                <div className="flex items-center justify-between p-2 pl-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-w-[180px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {isAdvancedMode ? "A" : "B"}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {isAdvancedMode ? "Advanced" : "Basic"}
                    </h4>
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
            </div>

            {/* Settings Body */}
            <div className="p-6 space-y-6">
              {!isAdvancedMode ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
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
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                      <option value="Fine">Fine</option>
                      <option value="Good">Good</option>
                      <option value="Better">Better</option>
                      <option value="Best">Best</option>
                    </select>
                  </div>

                  {/* Image Count */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Image Count ({Math.min(scenes.length, 15)} max)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={Math.min(scenes.length, 15)}
                      value={generationSettings.imageCount || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setGenerationSettings({ ...generationSettings, imageCount: isNaN(val) ? null : val });
                      }}
                      placeholder="1-15"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Animation */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Animation
                    </label>
                    <div className="flex h-12 items-center justify-between px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <span className="text-sm text-gray-500">
                        {generationSettings.animate ? "On" : "Off"}
                      </span>
                      <button
                        onClick={() => setGenerationSettings({ ...generationSettings, animate: !generationSettings.animate })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${generationSettings.animate ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${generationSettings.animate ? "translate-x-5" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Style Selection (Full Width) */}
                  <div className="md:col-span-2 lg:col-span-4 space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Art Style
                    </label>
                    <button
                      onClick={() => setShowStyleModal(true)}
                      className="w-full h-12 px-4 flex items-center justify-between rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-600 dark:text-gray-400 group transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Palette size={18} />
                        <span className="font-bold text-blue-500">{generationSettings.selectedStyle || "Select a theme..."}</span>
                      </div>
                      <Check size={18} className={generationSettings.selectedStyle ? "text-green-500" : "opacity-0"} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Detailed Advanced Mode */
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

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center gap-4">
                        {/* Play/Pause Button */}
                        <button
                          onClick={toggleAudioPlay}
                          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex-shrink-0"
                        >
                          {isAudioPlaying ? (
                            <Pause size={18} fill="currentColor" />
                          ) : (
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          )}
                        </button>

                        {/* Current Time */}
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[40px]">
                          {formatTimeMMSS(audioCurrentTime)}
                        </span>

                        {/* Progress Bar */}
                        <div className="flex-1 relative flex items-center group">
                          <input
                            type="range"
                            min="0"
                            max={audioDuration || 0}
                            value={audioCurrentTime}
                            onChange={handleAudioSeek}
                            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Total Duration */}
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[40px]">
                          {formatTimeMMSS(audioDuration)}
                        </span>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 group/volume relative">
                          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            <Volume2 size={20} />
                          </button>
                          <div className="w-20 hidden group-hover/volume:block absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl lg:static lg:block lg:shadow-none lg:p-0 lg:border-none">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={audioVolume}
                              onChange={handleAudioVolumeChange}
                              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        </div>

                        {/* Download Button */}
                        {generatedAudioUrl && (
                          <a
                            href={generatedAudioUrl}
                            download="voiceover.mp3"
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            title="Download Audio"
                          >
                            <Download size={20} />
                          </a>
                        )}
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
                        context
                      </h4>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Add context..."
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
                          {formatTimeMMSS(audioDuration)} / {formatTimeMMSS(audioDuration)}
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
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-between">
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
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${generationSettings.animate ? "right-1" : "left-1"}`}
                            />
                          </button>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-between">
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
                                width: scenes.length > 0
                                  ? `${((generationSettings.imageCount || 10) / scenes.length) * 100}%`
                                  : "0%",
                              }}
                            ></div>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max={scenes.length || 1}
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
                              left: scenes.length > 0
                                ? `calc(${((generationSettings.imageCount || 10) / scenes.length) * 100}% - 8px)`
                                : "0%",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="bg-white dark:bg-gray-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400">
                          <Loader2 size={18} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                          Timeline
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500">
                          {formatTimeMMSS(audioCurrentTime)} / {formatTimeMMSS(audioDuration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
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
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative h-24 bg-blue-50 dark:bg-indigo-900/20 rounded-xl border border-blue-100 dark:border-indigo-900/50 overflow-hidden px-2">
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

                      {/* Playhead */}
                      <div
                        className="absolute top-0 bottom-0 w-[2px] bg-blue-500 z-10"
                        style={{
                          left: audioDuration
                            ? `${(audioCurrentTime / audioDuration) * 100}%`
                            : "0%",
                        }}
                      >
                        <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Combined Progress Bar & Generation Button */}
          <div className="px-6 py-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 space-y-4">
            {isGeneratingImages && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    AI Generation in Progress
                  </span>
                  <span className="text-xs font-mono text-gray-500">{Math.round(imageGenerationProgress)}%</span>
                </div>
                <ProgressBar
                  progress={imageGenerationProgress}
                  status="Creating visuals..."
                  variant="gradient"
                  showPercentage={false}
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleGenerateClick}
                disabled={!isFormValid() || isGeneratingImages}
                className="px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] justify-center"
              >
                {isGeneratingImages ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Generating Scenes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate {generationSettings.imageCount || scenes.length} Images</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Generation Result View */}
      {images.some(
        (img) =>
          img && (img.status === "completed" || img.status === "generating"),
      ) && (
          <div
            ref={scenesRef}
            className="mt-8 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Once the image is generated
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              {/* Preview Card Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  First image preview
                </h3>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Image Preview */}
                  <div className="w-full lg:w-1/2 aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative group">
                    {images[resultPreviewIndex] &&
                      images[resultPreviewIndex].status === "completed" ? (
                      <img
                        src={images[resultPreviewIndex].url}
                        alt={`Scene ${resultPreviewIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {images[resultPreviewIndex]?.status === "generating" ? (
                          <div className="text-center">
                            <Loader2 className="animate-spin mb-2 mx-auto" />
                            <span>Generating...</span>
                          </div>
                        ) : (
                          <span>Select a completed scene</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Controls */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-between">
                    <div>
                      {/* Scene Selector Dropdown */}
                      <div className="mb-6 relative">
                        <select
                          value={resultPreviewIndex}
                          onChange={(e) =>
                            setResultPreviewIndex(parseInt(e.target.value))
                          }
                          className="w-full appearance-none px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                        >
                          {scenes.map((scene, i) => (
                            <option
                              key={i}
                              value={i}
                              disabled={
                                !images[i] || images[i].status !== "completed"
                              }
                            >
                              Scene {i + 1} - {scene.text.substring(0, 30)}...{" "}
                              {!images[i] || images[i].status !== "completed"
                                ? "(Pending)"
                                : ""}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            handleRegenerateImage(resultPreviewIndex)
                          }
                          disabled={isGeneratingImages}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Regenerate
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = images[resultPreviewIndex].url;
                            link.download = `scene-${resultPreviewIndex + 1}.jpg`;
                            link.click();
                          }}
                          disabled={
                            !images[resultPreviewIndex] ||
                            images[resultPreviewIndex].status !== "completed"
                          }
                          className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remaining Prompts List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Remaining prompts ({scenes.length})
                  </h3>
                  <button
                    onClick={() => {
                      if (
                        Object.keys(expandedAccordions).length === scenes.length
                      ) {
                        setExpandedAccordions({});
                      } else {
                        const all = {};
                        scenes.forEach((_, i) => (all[i] = true));
                        setExpandedAccordions(all);
                      }
                    }}
                    className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
                  >
                    {Object.keys(expandedAccordions).length === scenes.length
                      ? "Collapse All"
                      : "Expand All"}
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
                  {scenes.map((scene, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800/50">
                      <button
                        onClick={() =>
                          setExpandedAccordions((prev) => ({
                            ...prev,
                            [i]: !prev[i],
                          }))
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <div className="font-semibold text-gray-700 dark:text-gray-200">
                          Scene {i + 1}
                        </div>
                        <div
                          className={`transform transition-transform ${expandedAccordions[i] ? "rotate-180" : ""}`}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {expandedAccordions[i] && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex gap-4">
                            {images[i] && images[i].status === "completed" ? (
                              <img
                                src={images[i].url}
                                alt={`Scene ${i + 1}`}
                                className="w-24 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                              />
                            ) : (
                              <div className="w-24 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <ImageIcon size={16} className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {scene.text}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRegenerateImage(i)}
                                  className="text-xs text-blue-600 font-semibold hover:underline"
                                >
                                  Regenerate
                                </button>
                                {images[i] &&
                                  images[i].status === "completed" && (
                                    <button
                                      onClick={() => {
                                        setResultPreviewIndex(i);
                                        window.scrollTo({
                                          top: scenesRef.current.offsetTop - 100,
                                          behavior: "smooth",
                                        });
                                      }}
                                      className="text-xs text-gray-500 font-semibold hover:underline"
                                    >
                                      View in Preview
                                    </button>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Controls */}
              <div className="mt-8 flex items-center justify-end border-t border-gray-100 dark:border-gray-700 pt-6">
                <button
                  onClick={() => window.scrollTo({ top: containerRef.current?.offsetTop || 0, behavior: "smooth" })}
                  disabled={isGeneratingImages}
                  className="px-6 py-2.5 border border-blue-600 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Change generation settings
                </button>
              </div>
            </div>
          </div>
        )}
      {/* Hidden Audio Element for Tracking Time */}
      <audio
        ref={audioRef}
        src={generatedAudioUrl}
        onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
        onEnded={() => setIsAudioPlaying(false)}
        className="hidden"
      />
      {/* Style Selection Modal */}
      {
        showStyleModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowStyleModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Art Style</h3>
                <button
                  onClick={() => setShowStyleModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(IMAGE_STYLES).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setGenerationSettings({ ...generationSettings, selectedStyle: style.name });
                      setShowStyleModal(false);
                    }}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${generationSettings.selectedStyle === style.name
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                      : "border-gray-100 dark:border-gray-800 hover:border-blue-200"
                      }`}
                  >
                    <div className="h-28 bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative">
                      {style.image ? (
                        <img src={style.image} className="w-full h-full object-cover" alt={style.name} />
                      ) : (
                        <span className="text-3xl">{style.icon}</span>
                      )}
                    </div>
                    <div className="p-3 font-bold text-sm text-gray-700 dark:text-gray-300">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default ImageGenerator;


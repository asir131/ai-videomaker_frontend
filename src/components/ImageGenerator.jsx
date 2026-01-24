import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Music,
  Upload,
  X,
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
  const navigate = useNavigate();
  const { scenes } = useScript();
  const {
    images,
    setImages,
    isGeneratingImages,
    setIsGeneratingImages,
    imageGenerationProgress,
    setImageGenerationProgress,
    generatedAudioUrl,
  } = useMedia();
  const { setLoading } = useUI();

  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [showPrompts, setShowPrompts] = useState(false);

  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Drag-and-drop states for timeline reordering
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
        : 0;
      const targetCount =
        requestedCount > 0 ? Math.min(requestedCount, scenes.length) : 1;

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

  // Helper function to check if form is valid
  // const isFormValid = ... (Removed as moved to settings page)

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

  const handleImageClick = (index) => {
    console.log("🖼️ Image clicked! Index:", index);
    console.log("🖼️ Setting selectedImageIndex to:", index);
    console.log("🖼️ Setting showImageModal to: true");
    setSelectedImageIndex(index);
    setShowImageModal(true);
    console.log("🖼️ State updated");
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target);
    // Add visual feedback
    e.target.style.opacity = "0.5";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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

    console.log(
      `🔄 Reordered: Scene ${draggedIndex + 1} moved to position ${dropIndex + 1}`,
    );

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
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

    // Limit to number of scenes
    const maxImages = scenes.length;
    const imagesToUpload = validFiles.slice(0, maxImages);

    if (validFiles.length > maxImages) {
      alert(
        `You can only upload up to ${maxImages} images for ${maxImages} scenes.`,
      );
    }

    setUploadingImages({});
    setShowUploadModal(false);

    // Create image objects for upload
    const newImages = Array(scenes.length)
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
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
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

        {/* Audio Preview Section */}
        {generatedAudioUrl && (
          <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                  <Music size={24} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-lg">
                    Voiceover Ready
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Your narration is prepared for the video
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleAudioPlay}
                  disabled={!generatedAudioUrl || isAudioLoading}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-teal-600 text-white flex items-center justify-center hover:from-green-700 hover:to-teal-700 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title={
                    isAudioLoading
                      ? "Loading..."
                      : isAudioPlaying
                        ? "Pause voiceover"
                        : "Play voiceover"
                  }
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
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-all hover:scale-110 active:scale-95"
                  title="Replace with custom audio"
                >
                  <RefreshCw size={20} />
                </button>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioReplacement}
                  className="hidden"
                />
              </div>
            </div>

            <audio ref={audioRef} src={generatedAudioUrl} className="hidden" />

            {/* Waveform Visualization */}
            <div className="flex items-center gap-1 h-16 mt-4">
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-green-500 to-teal-500 rounded-full transition-all duration-300"
                  style={{
                    height: isAudioPlaying
                      ? `${20 + Math.random() * 80}%`
                      : "20%",
                    opacity: isAudioPlaying ? 0.8 : 0.4,
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

        {/* Generate Button / Header */}
        <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${!scenes.length
          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          : "bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/50 shadow-sm"
          }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div>
                <h3 className="font-bold">Scene to Image</h3>
                <p className="text-xs text-gray-500">{scenes.length} scenes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/image-settings')}
                className={`relative overflow-hidden group px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto flex items-center justify-center gap-2 ${isGeneratingImages
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/20"
                  }`}
                disabled={isGeneratingImages}
              >
                {isGeneratingImages ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
              <button onClick={() => setShowUploadModal(true)} className="p-2 border rounded-xl">
                <Upload size={20} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {isGeneratingImages && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Generating Images...
                </span>
                <span className="text-xs font-mono text-gray-500">
                  {Math.round(imageGenerationProgress)}%
                </span>
              </div>
              <ProgressBar
                progress={imageGenerationProgress}
                status="Processing scenes..."
                variant="gradient"
                showPercentage={false}
              />
            </div>
          )}
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
              <div className="mt-8 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
                <button
                  onClick={() => navigate('/app/image-settings')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Back to settings
                </button>
                <button
                  onClick={() => navigate('/app/image-settings')}
                  disabled={isGeneratingImages}
                  className="px-6 py-2.5 border border-blue-600 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Generate {generationSettings.imageCount || 10} more Images
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
    </>
  );
};

export default ImageGenerator;

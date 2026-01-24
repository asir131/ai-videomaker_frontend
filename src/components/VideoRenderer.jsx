import React, { useState, useRef, useEffect } from "react";
import { useScript } from "../context/ScriptContext";
import { useMedia } from "../context/MediaContext";
import { useUI } from "../context/UIContext";
import { renderVideos, checkFFmpegStatus } from "../services/videoService";
import { addVideoToHistory } from "../services/videoHistoryService";
import {
  Film,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Video,
  Settings,
  X,
} from "lucide-react";
// Animation imports removed to prevent runtime errors

const VideoRenderer = () => {
  const containerRef = useRef(null);
  const { script, title, scenes } = useScript();
  const {
    images,
    generatedAudioUrl,
    isRenderingVideo,
    setIsRenderingVideo,
    renderedVideos,
    setRenderedVideos,
  } = useMedia();
  const { setLoading } = useUI();

  const [renderResult, setRenderResult] = useState(null);

  // Transition Settings State
  const [showTransitionSettings, setShowTransitionSettings] = useState(false);
  const [transitionSettings, setTransitionSettings] = useState({
    duration: 0.55,
    type: "fade",
    enabled: true,
  });

  // Animation effect removed - was causing runtime errors
  // useEffect(() => {
  //     if (script && containerRef.current) {
  //         fadeInUp(containerRef.current);
  //     }
  // }, [script]);

  const handleRender = async () => {
    if (!scenes.length || !images.length || !generatedAudioUrl) {
      alert("Please generate script, images, and voice first.");
      return;
    }

    // Filter to only use scenes that have corresponding valid images
    const validScenes = scenes.filter((scene, index) => {
      const img = images[index];
      return img && img.url && img.status === "completed";
    });

    if (validScenes.length === 0) {
      alert(
        "No valid images available. Please generate at least one image before rendering.",
      );
      return;
    }

    // Warn user if not all scenes have images
    if (validScenes.length < scenes.length) {
      const proceed = confirm(
        `You have generated ${validScenes.length} out of ${scenes.length} scene images.\n\n` +
        `The video will be rendered using only the ${validScenes.length} available scene(s).\n\n` +
        `Do you want to proceed?`,
      );
      if (!proceed) return;
    }

    setIsRenderingVideo(true);
    setLoading((prev) => ({ ...prev, video: true }));

    try {
      const status = await checkFFmpegStatus();
      if (!status.installed) {
        alert(
          "FFmpeg is not installed on the server. Automatic rendering is disabled.",
        );
        throw new Error("FFmpeg not installed");
      }

      // Only use the scenes that have valid images
      const scenesData = validScenes.map((s, originalIndex) => {
        // Find the actual index in the original scenes array
        const sceneIndex = scenes.findIndex(
          (scene) => scene.number === s.number,
        );
        return {
          number: s.number,
          imageUrl: images[sceneIndex].url,
          startTime: s.startTime,
          endTime: s.endTime,
          startSeconds: s.startSeconds,
          endSeconds: s.endSeconds,
          duration: (s.endSeconds - s.startSeconds).toFixed(3),
          text: s.text || "",
        };
      });

      const result = await renderVideos(
        scenesData,
        generatedAudioUrl,
        title,
        title,
        {
          type: transitionSettings.enabled ? transitionSettings.type : "none",
          duration: transitionSettings.enabled
            ? Number(transitionSettings.duration)
            : 0,
        },
        true, // renderFullVideo
      );

      if (result.success) {
        setRenderResult(result);
        // Add to library (simplified)
        const newVideo = {
          title: title,
          videoUrl: result.finalVideo,
          createdAt: new Date().toISOString(),
        };
        setRenderedVideos((prev) => [newVideo, ...prev]);

        // Save to video history
        const totalDuration =
          scenes.length > 0 ? scenes[scenes.length - 1].endSeconds : 0;

        addVideoToHistory({
          sessionId: result.sessionId,
          title: title || "Untitled Video",
          date: Date.now(),
          duration: totalDuration,
          filePath: result.finalVideo,
          scenes: scenes.length,
          transition: { type: "fade", duration: 0.5 },
          creditsUsed: 0, // TODO: Calculate actual credits used
          downloadUrl: result.finalVideo,
          sceneVideos: result.sceneVideos || [],
        });
      } else {
        throw new Error(result.message || "Rendering failed");
      }
    } catch (error) {
      console.error("Error rendering video:", error);
      const errorMessage = error.details
        ? `${error.message}\n\n${error.details}`
        : error.message;
      alert("Failed to render video: " + errorMessage);
    } finally {
      setIsRenderingVideo(false);
      setLoading((prev) => ({ ...prev, video: false }));
    }
  };

  const handleDownloadAllAssets = async () => {
    // 1. Download Audio
    if (generatedAudioUrl) {
      const link = document.createElement("a");
      link.href = generatedAudioUrl;
      link.download = "voiceover.mp3";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // 2. Download Images (Sequential to avoid browser blocking)
    const completedImages = images.filter(
      (img) => img && img.status === "completed",
    );

    for (let i = 0; i < completedImages.length; i++) {
      const img = completedImages[i];
      await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay

      const link = document.createElement("a");
      link.href = img.url;
      link.download = `scene-${i + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!script) return null;

  return (
    <div ref={containerRef} className="glass-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -z-10" />

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm">
          <Film size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Final Render
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Assemble your masterpiece
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="mb-6 md:mb-0">
            {/* <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {generatedAudioUrl && images.some((img) => img.url)
                ? "Ready to Render!"
                : "Almost Ready"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              {generatedAudioUrl && images.some((img) => img.url)
                ? `We'll combine your script, ${scenes.length} scenes, and voiceover into a complete video.`
                : "Please generate images and voiceover first, then come back here to render your video."}
            </p> */}
            {!generatedAudioUrl && (
              <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <AlertCircle size={16} />
                <span>Voiceover required for video rendering</span>
              </div>
            )}
            {!images.some((img) => img.url) && (
              <div className="mt-1 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <AlertCircle size={16} />
                <span>Scene images required for video rendering</span>
              </div>
            )}
          </div>

          {/* Project Assets Download Section */}
          {generatedAudioUrl && images.some((img) => img.url) && (
            <div className="w-full md:w-auto mb-6 md:mb-0 md:mr-6 flex-1 md:text-right border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 pt-6 md:pt-0 md:pr-6">
              <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wider">
                Project Media
              </h4>
              <div className="flex flex-col md:items-end gap-1 mb-3">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {images.filter((i) => i.status === "completed").length} Images
                  Ready
                </span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  Voiceover Track Ready
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowTransitionSettings(true)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Settings size={16} />
                  Transitions
                </button>
                <button
                  onClick={handleDownloadAllAssets}
                  className="px-5 py-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg text-sm font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Download Assets
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleRender}
            disabled={isRenderingVideo}
            className={`px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform flex items-center gap-3 min-h-[56px]
                            ${isRenderingVideo
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
              }`}
          >
            {isRenderingVideo ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Rendering Video...</span>
              </>
            ) : (
              <>
                <Video size={24} />
                <span>Render Final Video</span>
              </>
            )}
          </button>
        </div>

        {renderResult && (
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-2xl p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="text-green-500" size={28} />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Video Rendered Successfully!
              </h3>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="rounded-xl overflow-hidden shadow-2xl bg-black">
                <video
                  controls
                  className="w-full aspect-video"
                  src={renderResult.finalVideo}
                />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <a
                  href={renderResult.finalVideo}
                  download
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-center font-bold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 min-h-[56px]"
                >
                  <Download size={20} />
                  Download Full Video
                </a>
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href={renderResult.script}
                    download
                    className="py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium hover:shadow-md min-h-[44px] flex items-center justify-center"
                  >
                    Download Script
                  </a>
                  <a
                    href={renderResult.audio}
                    download
                    className="py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium hover:shadow-md min-h-[44px] flex items-center justify-center"
                  >
                    Download Audio
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transition Settings Modal */}
      {showTransitionSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-800 animate-in zoom-in-50 duration-200">
            <div className="p-6 space-y-6">
              {/* Duration Input */}
              <div className="flex items-center justify-between">
                <label className="text-lg font-medium text-gray-900 dark:text-white">
                  Transition Duration:
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="5.0"
                  value={transitionSettings.duration}
                  onChange={(e) =>
                    setTransitionSettings((prev) => ({
                      ...prev,
                      duration: parseFloat(e.target.value),
                    }))
                  }
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-lg text-center focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                />
              </div>

              {/* Presets */}
              <div className="flex justify-between px-1">
                {[
                  { label: "0.25 (Quick)", value: 0.25 },
                  { label: "1.05 (Balanced)", value: 1.05 },
                  { label: "2.0 (Dramatic)", value: 2.0 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() =>
                      setTransitionSettings((prev) => ({
                        ...prev,
                        duration: preset.value,
                      }))
                    }
                    className={`text-xs ${transitionSettings.duration === preset.value ? "text-blue-600 font-bold" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Basic Label */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${!transitionSettings.enabled ? "border-blue-600" : "border-gray-400"}`}
                >
                  {!transitionSettings.enabled && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
                <span className="font-medium">Basic</span>
              </div>

              {/* Enable Toggle Box */}
              <div
                onClick={() =>
                  setTransitionSettings((prev) => ({
                    ...prev,
                    enabled: !prev.enabled,
                  }))
                }
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${transitionSettings.enabled ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${transitionSettings.enabled ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                >
                  {transitionSettings.enabled && <CheckCircle2 size={14} />}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  Enable transition to merge{" "}
                  <span className="font-bold">full video</span>
                </span>
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                {["fade", "FadeBlack"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setTransitionSettings((prev) => ({
                        ...prev,
                        type:
                          type.toLowerCase() === "fadeblack"
                            ? "fade_black"
                            : "fade",
                      }))
                    }
                    className={`py-3 px-4 rounded-lg text-center font-medium transition-all ${(type === "FadeBlack" &&
                      transitionSettings.type === "fade_black") ||
                      (type === "fade" && transitionSettings.type === "fade")
                      ? "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
                      : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setShowTransitionSettings(false)}
                  className="px-6 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowTransitionSettings(false)}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRenderer;

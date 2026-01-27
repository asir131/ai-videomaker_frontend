import React, { useState, useEffect, useRef } from "react";
import { useScript } from "../context/ScriptContext";
import { useMedia } from "../context/MediaContext";
import { parseScriptIntoScenes } from "../utils/scriptUtils";
import {
  Edit3,
  Loader2,
  Copy,
  Download,
  ChevronRight,
  FileText,
  Zap,
  Palette,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "../context/ToastContext";

const ScriptEditor = ({ handleNext }) => {
  const containerRef = useRef(null);
  const timeoutsRef = useRef([]);
  const { script, setScript, setScenes, sceneCount, setSceneCount, updateScenes, title, selectedStyle, userEdited, setUserEdited } = useScript();
  const { audioDuration } = useMedia();
  const { showSuccess, showError } = useToast();
  const [displayedScript, setDisplayedScript] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Cleanup function for animation timeouts
  const cleanupAnimation = () => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    if (script && !userEdited) {
      // Cleanup any existing animation
      cleanupAnimation();

      // Word-by-word animation
      const words = script.split(/(\s+)/); // Split by whitespace, keeping the separator
      setDisplayedScript(""); // Reset for animation
      setIsAnimating(true);

      words.forEach((word, index) => {
        const timeout = setTimeout(() => {
          setDisplayedScript((prev) => prev + word);

          // Check if this is the last word
          if (index === words.length - 1) {
            setIsAnimating(false);
          }
        }, index * 50); // Reduced from 75ms to 50ms for smoother animation

        timeoutsRef.current.push(timeout);
      });

      // Split script into chosen number of scenes
      updateScenes(script, sceneCount, audioDuration);
    }

    // Cleanup on unmount
    return () => {
      cleanupAnimation();
    };
  }, [script, audioDuration, updateScenes, userEdited, sceneCount]);

  const isEnglishContent = (text) => {
    const nonEnglishPattern = /[\u0080-\uFFFF]/g;
    const banglaPattern = /[\u0980-\u09FF]/g;
    const arabicPattern = /[\u0600-\u06FF]/g;
    const cyrillicPattern = /[\u0400-\u04FF]/g;
    const chinesePattern = /[\u4E00-\u9FFF]/g;

    const hasNonEnglish = nonEnglishPattern.test(text);
    const hasBangla = banglaPattern.test(text);
    const hasArabic = arabicPattern.test(text);
    const hasCyrillic = cyrillicPattern.test(text);
    const hasChinese = chinesePattern.test(text);

    return {
      isEnglish: !hasNonEnglish,
      detectedLanguages: {
        bangla: hasBangla,
        arabic: hasArabic,
        cyrillic: hasCyrillic,
        chinese: hasChinese,
      },
    };
  };

  const handleScriptChange = (e) => {
    if (isAnimating) {
      cleanupAnimation();
      setIsAnimating(false);
    }

    const newScript = e.target.value;

    if (newScript.length > 10) {
      const languageCheck = isEnglishContent(newScript);
      if (!languageCheck.isEnglish && !userEdited) {
        const detectedLangs = Object.entries(languageCheck.detectedLanguages)
          .filter(([lang, detected]) => detected)
          .map(([lang]) => lang.charAt(0).toUpperCase() + lang.slice(1));

        if (detectedLangs.length > 0) {
          showWarning(
            `Non-English content detected (${detectedLangs.join(", ")}). For best results with voice generation and video creation, please use English content.`,
          );
          setUserEdited(true);
        }
      }
    }

    setUserEdited(true);
    setScript(newScript);
    setDisplayedScript(newScript);
    updateScenes(newScript, sceneCount, audioDuration);
  };

  const handleSceneCountChange = (e) => {
    const newCount = parseInt(e.target.value);
    if (!isNaN(newCount) && newCount >= 1 && newCount <= 15) {
      setSceneCount(newCount);
      updateScenes(script, newCount, audioDuration);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(script);
    showSuccess("Script copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();

      const splitText = doc.splitTextToSize(script, 180);

      doc.text(splitText, 15, 15);
      doc.save("video-script.pdf");
      showSuccess("Script downloaded as PDF!");
    } catch (error) {
      console.error("PDF Download Error:", error);
      showError("Failed to download PDF");
    }
  };

  const getScriptStats = () => {
    if (!script) return null;

    const words = script
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const wordCount = words.length;
    const charCount = script.length;
    const estimatedReadTime = Math.ceil(wordCount / 150);
    const estimatedAudioDuration = Math.ceil((wordCount / 150) * 60);

    return {
      wordCount,
      charCount,
      estimatedReadTime,
      estimatedAudioDuration,
    };
  };

  const scriptStats = getScriptStats();

  if (!script) return null;

  return (
    <div ref={containerRef} className="glass-card relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
            <Edit3 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              Review and Edit Your Script
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isAnimating
                ? "Animating your script..."
                : `Refine your story. Script will be split into ${sceneCount} scenes for image generation.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Scene Count Selector */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50">
            <label className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider whitespace-nowrap">
              Scenes:
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={sceneCount}
              onChange={handleSceneCountChange}
              className="w-24 h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 w-5">
              {sceneCount}
            </span>
          </div>

          {/* Word Count / Description Info */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50">
            <FileText size={16} />
            <span className="text-xs font-bold whitespace-nowrap">{scriptStats?.wordCount || 0} words</span>
          </div>

          <button
            onClick={handleCopyScript}
            className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:shadow-md"
            title="Copy Script"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={handleDownloadPDF}
            className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:shadow-md"
            title="Download PDF"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Script Information Section */}
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          <textarea
            value={displayedScript}
            onChange={handleScriptChange}
            className="relative w-full h-80 px-8 py-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:border-purple-500 outline-none font-jakarta text-lg leading-relaxed resize-y shadow-sm hover:shadow-md transition-all scrollbar-hide"
            placeholder="Your generated script will appear here..."
          />
        </div>

        {/* Animation Progress Indicator */}
        {isAnimating && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span>Displaying script word by word...</span>
          </div>
        )}

        {/* Continue Button */}
        {!isAnimating && script && (
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Continue to Audio
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptEditor;

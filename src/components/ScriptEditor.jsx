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
  Clock,
  Zap,
  Palette,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "../context/ToastContext";

const ScriptEditor = ({ handleNext }) => {
  const containerRef = useRef(null);
  const timeoutsRef = useRef([]);
  const { script, setScript, setScenes, title, selectedStyle } = useScript();
  const { audioDuration } = useMedia();
  const { showSuccess, showError } = useToast();
  const [displayedScript, setDisplayedScript] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [userEdited, setUserEdited] = useState(false);

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

      // Always split script into 15 scenes - user can choose how many images to generate (1-15)
      const sceneCount = 15;
      const scenes = parseScriptIntoScenes(script, sceneCount, audioDuration);
      setScenes(scenes);
    }

    // Cleanup on unmount
    return () => {
      cleanupAnimation();
    };
  }, [script, audioDuration, setScenes, userEdited]);

  // Language validation function
  const isEnglishContent = (text) => {
    // Check for common non-English character ranges
    const nonEnglishPattern = /[\u0080-\uFFFF]/g; // Non-ASCII characters
    const banglaPattern = /[\u0980-\u09FF]/g; // Bangla characters
    const arabicPattern = /[\u0600-\u06FF]/g; // Arabic characters
    const cyrillicPattern = /[\u0400-\u04FF]/g; // Cyrillic characters
    const chinesePattern = /[\u4E00-\u9FFF]/g; // Chinese characters

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
    // Stop animation when user starts editing
    if (isAnimating) {
      cleanupAnimation();
      setIsAnimating(false);
    }

    const newScript = e.target.value;

    // Language validation (only warn if significant amount of non-English content)
    if (newScript.length > 10) {
      // Only check after some content is entered
      const languageCheck = isEnglishContent(newScript);
      if (!languageCheck.isEnglish && !userEdited) {
        // Only show warning once per editing session
        const detectedLangs = Object.entries(languageCheck.detectedLanguages)
          .filter(([lang, detected]) => detected)
          .map(([lang]) => lang.charAt(0).toUpperCase() + lang.slice(1));

        if (detectedLangs.length > 0) {
          showWarning(
            `Non-English content detected (${detectedLangs.join(", ")}). For best results with voice generation and video creation, please use English content.`,
          );
          setUserEdited(true); // Prevent repeated warnings
        }
      }
    }

    setUserEdited(true);
    setScript(newScript);
    setDisplayedScript(newScript);

    // Update scenes when script changes
    const sceneCount = 15;
    const scenes = parseScriptIntoScenes(newScript, sceneCount, audioDuration);
    setScenes(scenes);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(script);
    showSuccess("Script copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();

      // Split text into lines that fit the page width
      // A4 width is 210mm. Margins approx 10mm each side -> 190mm usable.
      const splitText = doc.splitTextToSize(script, 180);

      doc.text(splitText, 15, 15);
      doc.save("video-script.pdf");
      showSuccess("Script downloaded as PDF!");
    } catch (error) {
      console.error("PDF Download Error:", error);
      showError("Failed to download PDF");
    }
  };

  // Calculate script statistics
  const getScriptStats = () => {
    if (!script) return null;

    const words = script
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const wordCount = words.length;
    const charCount = script.length;
    const estimatedReadTime = Math.ceil(wordCount / 150); // Average reading speed: 150 words/minute
    const estimatedAudioDuration = Math.ceil((wordCount / 150) * 60); // Convert to seconds

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
                : "Refine your story. Script will be split into 15 scenes for image generation."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyScript}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md"
            title="Copy Script"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={handleDownloadPDF}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md"
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
            className="relative w-full h-80 px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:border-purple-500 outline-none font-mono text-sm leading-relaxed resize-y shadow-sm hover:shadow-md transition-all"
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

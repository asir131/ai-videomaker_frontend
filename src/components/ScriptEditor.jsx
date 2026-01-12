import React, { useState, useEffect, useRef } from "react";
import { useScript } from "../context/ScriptContext";
import { useMedia } from "../context/MediaContext";
import { parseScriptIntoScenes } from "../utils/scriptUtils";
import { Edit3, SkipForward, Loader2, Copy, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "../context/ToastContext";

const ScriptEditor = ({ handleNext }) => {
  const containerRef = useRef(null);
  const timeoutsRef = useRef([]);
  const { script, setScript, setScenes } = useScript();
  const { audioDuration } = useMedia();
  const { showSuccess, showError } = useToast();
  const [displayedScript, setDisplayedScript] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [userEdited, setUserEdited] = useState(false);

  // Cleanup function for animation timeouts
  const cleanupAnimation = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Skip animation and show full script
  const skipAnimation = () => {
    cleanupAnimation();
    setDisplayedScript(script);
    setIsAnimating(false);
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
          setDisplayedScript(prev => prev + word);

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

  const handleScriptChange = (e) => {
    // Stop animation when user starts editing
    if (isAnimating) {
      cleanupAnimation();
      setIsAnimating(false);
    }

    setUserEdited(true);
    setScript(e.target.value);
    setDisplayedScript(e.target.value);
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
              {isAnimating ? "Animating your script..." : "Refine your story."}
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

          {/* Skip Animation Button */}
          {isAnimating && (
            <button
              onClick={skipAnimation}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all font-medium shadow-sm hover:shadow-md"
            >
              <SkipForward size={18} />
              Skip Animation
            </button>
          )}
        </div>
      </div>

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
      </div>
    </div>
  );
};

export default ScriptEditor;

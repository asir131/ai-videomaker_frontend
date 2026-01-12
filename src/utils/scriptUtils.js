import { formatTimestamp } from './formatters';

/**
 * Parse script into scenes with timestamps
 * @param {string} scriptText - The full script text
 * @param {number} targetCount - Target number of scenes
 * @param {number} audioDuration - Actual audio duration in seconds (optional)
 * @returns {Array} Array of scene objects
 */
export function parseScriptIntoScenes(scriptText, targetCount, audioDuration = 0) {
    const words = scriptText.split(/\s+/);
    const wordsPerScene = Math.floor(words.length / targetCount);
    const scenes = [];

    // Use actual audio duration if available, otherwise estimate (150 words per minute)
    const totalDuration = audioDuration > 0 ? audioDuration : (words.length / (150 / 60));

    // Helper function: Find nearest sentence ending after target word position
    function findSentenceEnd(words, targetWordIndex) {
        const textFromTarget = words.slice(targetWordIndex).join(' ');
        const sentenceEndMatch = textFromTarget.match(/[.!?]\s+(?=[A-Z"])/);

        if (!sentenceEndMatch) {
            return targetWordIndex;
        }

        const endPosition = sentenceEndMatch.index + sentenceEndMatch[0].length;
        const textUpToEnd = textFromTarget.slice(0, endPosition);
        const wordsUpToEnd = textUpToEnd.trim().split(/\s+/).length;

        return targetWordIndex + wordsUpToEnd;
    }

    // Store scene boundaries to ensure next scene starts where previous ended
    const sceneBoundaries = [];

    for (let i = 0; i < targetCount; i++) {
        const startWord = i === 0 ? 0 : sceneBoundaries[i - 1];
        let endWord = (i === targetCount - 1) ? words.length : (i + 1) * wordsPerScene;

        // For all scenes except the last, find the nearest sentence ending
        if (i < targetCount - 1) {
            endWord = findSentenceEnd(words, endWord);
            if (endWord > words.length) endWord = words.length;
        }

        sceneBoundaries.push(endWord);

        const sceneText = words.slice(startWord, endWord).join(' ');

        // Calculate timestamps
        const startRatio = startWord / words.length;
        const endRatio = endWord / words.length;
        const startTime = startRatio * totalDuration;
        const endTime = endRatio * totalDuration;

        scenes.push({
            number: i + 1,
            text: sceneText,
            startTime: formatTimestamp(startTime),
            endTime: formatTimestamp(endTime),
            startSeconds: startTime,
            endSeconds: endTime,
            imageUrl: null,
            prompt: null
        });
    }

    return scenes;
}

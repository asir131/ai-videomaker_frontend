import React, { useState, useRef, useEffect } from 'react';
import { useScript } from '../context/ScriptContext';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import { generateScript } from '../services/scriptService';
import { DEFAULTS, VOICE_PROVIDERS, VOICES } from '../utils/constants';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import { generateMockStory } from '../utils/mockStoryGenerator';
import StyleModal from './dashboard/StyleModal';
import StyleSelector from './dashboard/StyleSelector';
import FileUploadSection from './dashboard/FileUploadSection';

const ScriptGenerator = () => {
    const containerRef = useRef(null);
    const {
        title, setTitle,
        script, setScript,
        wordCount, setWordCount,
        isGenerating, setIsGenerating,
        selectedStyle, setSelectedStyle
    } = useScript();

    const { setLoading } = useUI();
    const { showSuccess, showError, showWarning } = useToast();

    const [additionalContext, setAdditionalContext] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState(null);

    // Style System State
    const [styles, setStyles] = useState([]);
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [styleViewMode, setStyleViewMode] = useState('list'); // 'list', 'create', 'edit'
    const [newStyle, setNewStyle] = useState({
        name: '',
        wordCount: DEFAULTS.DEFAULT_WORD_COUNT,
        language: 'English',
        referenceVideo: [],
        mode: 'Fast',
        context: '',
        voiceSpeed: 80,
        similarity: 100,
        stability: 100,
        exaggeration: 100,
        voiceProvider: VOICE_PROVIDERS.ELEVENLABS,
        voiceId: VOICES[VOICE_PROVIDERS.ELEVENLABS][0]?.id || null,
    });

    const fileInputRef = useRef(null);

    // Load styles from localStorage
    useEffect(() => {
        const savedStyles = localStorage.getItem('ai-videomakr-styles');
        if (savedStyles) {
            try {
                const parsed = JSON.parse(savedStyles);
                setStyles(parsed);
            } catch (e) {
                console.error('Failed to parse saved styles', e);
            }
        }
    }, []);

    // Save styles to localStorage whenever they change
    useEffect(() => {
        if (styles.length > 0) {
            localStorage.setItem('ai-videomakr-styles', JSON.stringify(styles));
        } else {
            localStorage.removeItem('ai-videomakr-styles'); // Clear if no styles
        }
    }, [styles]);

    // ESC key handler for modal
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showStyleModal) {
                setShowStyleModal(false);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showStyleModal]);

    const handleGenerate = async () => {
        if (!title) {
            showWarning('Please enter a title');
            return;
        }

        if (!selectedStyle) {
            showWarning('Please select or create a style before generating');
            return;
        }

        setIsGenerating(true);
        setLoading(prev => ({ ...prev, script: true }));

        try {
            const mainWordCount = wordCount || DEFAULTS.DEFAULT_WORD_COUNT;
            // Always generate content in English for consistency and best voice generation results
            let userPrompt = `Write a ${mainWordCount}-word story for this title: "${title}". IMPORTANT: Write the entire story in ENGLISH only, regardless of any language settings.`;

            if (selectedStyle) {
                userPrompt += ` Writing Mode: ${selectedStyle.mode}.`;
                if (selectedStyle.referenceVideo) {
                    const referenceVideos = Array.isArray(selectedStyle.referenceVideo) 
                        ? selectedStyle.referenceVideo.filter(link => link && link.trim())
                        : (selectedStyle.referenceVideo ? [selectedStyle.referenceVideo] : []);
                    if (referenceVideos.length > 0) {
                        userPrompt += ` Style Reference: ${referenceVideos.join(', ')}.`;
                    }
                }
            }

            if (additionalContext) {
                userPrompt += ` Additional context: ${additionalContext}`;
            }

            const fullPrompt = `NARRATION RULES - STRICTLY FOLLOW:
- Write in pure narrative form only - NO subtitles, headings, or section breaks
- Do NOT use any special characters like #, *, _, or formatting symbols
- Do NOT include [Scene descriptions] or (parenthetical notes)
- NO chapter markers, timestamps, or labeled segments
- Write as one continuous flowing story from beginning to end
- Use natural paragraph breaks only
- Write EXACTLY as it should be spoken aloud by a narrator
- CRITICAL: Write the ENTIRE story in ENGLISH language only

STORYTELLING RULES FOR 90%+ RETENTION:
- Start with an immediate hook in the first 5 seconds that creates curiosity or shock
- Use the "open loop" technique - raise questions early and answer them later
- Build tension constantly - every paragraph should make viewers want to know "what happens next"
- Include unexpected plot twists every 30-45 seconds of narration
- Use cliffhangers before natural pause points
- Add specific, vivid details that paint mental pictures
- Include emotional moments that connect with viewers
- Use short, punchy sentences mixed with longer descriptive ones for rhythm
- Employ "pattern interrupts" - sudden changes in tone, pace, or revelation
- Foreshadow future events to create anticipation: "Little did they know..." or "But that was before..."
- End paragraphs with questions or incomplete thoughts that pull readers forward
- Use power words: "suddenly", "but then", "without warning", "the truth was"
- Build to a climactic reveal or satisfying conclusion
- Pace the story like a rollercoaster - tension, release, bigger tension
- Make every sentence earn its place - cut all filler
- Create relatable stakes - make audience care about what happens

USER REQUEST:
${userPrompt}`;

            const data = await generateScript(fullPrompt, 8000);

            if (data && data.content && data.content[0] && data.content[0].text) {
                setScript(data.content[0].text);
                showSuccess('Script generated successfully! Transitioning to editor...');
            } else {
                throw new Error('Invalid response from script generation API');
            }

        } catch (error) {
            console.error('Error generating script:', error);
            
            // Check if it's a quota exceeded error
            const isQuotaError = error.message?.toLowerCase().includes('quota') || 
                                 error.message?.toLowerCase().includes('exceeded') ||
                                 error.message?.toLowerCase().includes('billing');
            
            if (isQuotaError) {
                // Generate mock story as fallback
                console.log('⚠️ API quota exceeded, generating mock story...');
                const mockStory = generateMockStory(title, 150);
                setScript(mockStory);
                showWarning('API quota exceeded. Generated a sample 150-word story. Upgrade your plan for AI-generated content.');
            } else {
                showError('Failed to generate script: ' + error.message);
            }
        } finally {
            setIsGenerating(false);
            setLoading(prev => ({ ...prev, script: false }));
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check if style is selected
        if (!selectedStyle) {
            showWarning('Please select or create a style before uploading a script');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Validate file type
        if (!file.name.endsWith('.txt')) {
            showWarning('Please upload a .txt file');
            return;
        }

        // Validate file size (max 1MB)
        if (file.size > 1024 * 1024) {
            showWarning('File size must be less than 1MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                parseUploadedScript(content, file.name);
            } catch (error) {
                console.error('Error reading file:', error);
                showError('Failed to read file. Please try again.');
            }
        };
        reader.onerror = () => {
            showError('Error reading file. Please try again.');
        };
        reader.readAsText(file);
    };

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
                chinese: hasChinese
            }
        };
    };

    const parseUploadedScript = (content, fileName) => {
        // Language validation
        const languageCheck = isEnglishContent(content);
        if (!languageCheck.isEnglish) {
            const detectedLangs = Object.entries(languageCheck.detectedLanguages)
                .filter(([lang, detected]) => detected)
                .map(([lang]) => lang.charAt(0).toUpperCase() + lang.slice(1));

            if (detectedLangs.length > 0) {
                showWarning(`Warning: Non-English content detected (${detectedLangs.join(', ')}). Please ensure your script is in English for best results.`);
            }
        }

        // Try to extract title from first line or filename
        let scriptContent = content.trim();
        let extractedTitle = '';

        // Check if first line looks like a title (short, no punctuation at end, or has "Title:" prefix)
        const lines = scriptContent.split('\n').filter(line => line.trim());

        if (lines.length > 0) {
            const firstLine = lines[0].trim();

            // Check for "Title:" prefix
            if (firstLine.toLowerCase().startsWith('title:')) {
                extractedTitle = firstLine.substring(6).trim();
                scriptContent = lines.slice(1).join('\n').trim();
            }
            // Check if first line is short and looks like a title
            else if (firstLine.length < 100 && !firstLine.match(/[.!?]$/)) {
                // Check if second line is empty or starts with capital (likely paragraph start)
                if (lines.length > 1 && (lines[1].trim() === '' || /^[A-Z]/.test(lines[1].trim()))) {
                    extractedTitle = firstLine;
                    scriptContent = lines.slice(1).join('\n').trim();
                }
            }
        }

        // If no title extracted, use filename without extension
        if (!extractedTitle && fileName) {
            extractedTitle = fileName.replace(/\.txt$/i, '').replace(/[_-]/g, ' ');
        }

        // Set the script and title
        if (extractedTitle) {
            setTitle(extractedTitle);
        }

        setScript(scriptContent);
        setUploadedFileName(fileName);

        // Show success message
        showSuccess(`Script uploaded successfully!${extractedTitle ? ` Title: ${extractedTitle}` : ''}`);
        setTimeout(() => {
            showSuccess('You can now proceed to edit and parse it into scenes.');
        }, 500);
    };

    const handleRemoveUpload = () => {
        setUploadedFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCreateStyle = () => {
        if (!newStyle.name || !newStyle.language) {
            showWarning('Please fill in required fields (Name and Language)');
            return;
        }

        const style = { ...newStyle, id: Date.now() };
        const updatedStyles = [...styles, style];
        setStyles(updatedStyles);
        handleSelectStyle(style);

        // Return to list view
        setStyleViewMode('list');
        showSuccess(`Style "${style.name}" created!`);
    };

    const handleUpdateStyle = () => {
        if (!newStyle.name || !newStyle.language) {
            showWarning('Please fill in required fields');
            return;
        }

        const updatedStyles = styles.map(s => s.id === newStyle.id ? newStyle : s);
        setStyles(updatedStyles);

        if (selectedStyle && selectedStyle.id === newStyle.id) {
            setSelectedStyle(newStyle);
        }

        setStyleViewMode('list');
        showSuccess(`Style "${newStyle.name}" updated!`);
    };

    const handleDeleteStyle = (e, id) => {
        e.stopPropagation();
        const updatedStyles = styles.filter(s => s.id !== id);
        setStyles(updatedStyles);

        if (selectedStyle && selectedStyle.id === id) {
            setSelectedStyle(null);
            setWordCount(DEFAULTS.DEFAULT_WORD_COUNT);
            setAdditionalContext('');
        }

        // Update localStorage immediately if empty
        if (updatedStyles.length === 0) {
            localStorage.removeItem('ai-videomakr-styles');
        }
    };

    const startEditStyle = (e, style) => {
        e.stopPropagation();
        setNewStyle({
            ...{ // Defaults for older styles
                voiceSpeed: 80,
                similarity: 50,
                stability: 50,
                exaggeration: 50
            },
            ...style
        });
        setStyleViewMode('edit');
        setShowStyleModal(true);
    };

    const handleSelectStyle = (style) => {
        setSelectedStyle(style);
        setWordCount(style.wordCount);
        setAdditionalContext(style.context || '');
        setShowStyleModal(false);
    };

    const openStyleCreator = () => {
        setStyleViewMode('create');
        setNewStyle({
            name: '',
            wordCount: DEFAULTS.DEFAULT_WORD_COUNT,
            language: 'English', // Always default to English for consistency
            referenceVideo: [],
            mode: 'Fast',
            context: '',
            voiceSpeed: 80,
            similarity: 100,
            stability: 100,
            exaggeration: 100,
            voiceProvider: VOICE_PROVIDERS.ELEVENLABS,
            voiceId: VOICES[VOICE_PROVIDERS.ELEVENLABS][0]?.id || null,
        });
        setShowStyleModal(true);
    }

    const openStyleManager = () => {
        setStyleViewMode('list');
        setShowStyleModal(true);
    }

    // Debug: Log when component renders
    useEffect(() => {
        console.log('ScriptGenerator: Component rendered, upload section should be visible');
    }, []);


    return (
        <>
            <StyleModal
                showModal={showStyleModal}
                onClose={() => setShowStyleModal(false)}
                styleViewMode={styleViewMode}
                setStyleViewMode={setStyleViewMode}
                styles={styles}
                selectedStyle={selectedStyle}
                newStyle={newStyle}
                setNewStyle={setNewStyle}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                onSelectStyle={handleSelectStyle}
                onCreateStyle={handleCreateStyle}
                onUpdateStyle={handleUpdateStyle}
                onDeleteStyle={handleDeleteStyle}
                onStartEditStyle={startEditStyle}
            />
            
            {!showStyleModal && (
                <div ref={containerRef} className="glass-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors duration-500" />

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Script Generation</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Start your video creation journey here</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <FileUploadSection
                            fileInputRef={fileInputRef}
                            onFileUpload={handleFileUpload}
                            uploadedFileName={uploadedFileName}
                            onRemoveUpload={handleRemoveUpload}
                        />

                        <div className="relative flex items-center my-6">
                            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                            <span className="px-4 text-sm text-gray-500 dark:text-gray-400 font-semibold bg-white dark:bg-gray-800">OR</span>
                            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                        </div>

                        <div className="group/input">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                Video Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., The Mystery of the Lost City"
                                className="w-full px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-indigo-500 transition-all outline-none text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm hover:shadow-md"
                            />
                        </div>

                        <StyleSelector
                            styles={styles}
                            selectedStyle={selectedStyle}
                            onSelectStyle={handleSelectStyle}
                            onCreateNew={openStyleCreator}
                            onEditStyle={(style) => {
                                startEditStyle({ stopPropagation: () => {}, preventDefault: () => {} }, style);
                            }}
                            onDeleteStyle={handleDeleteStyle}
                            onOpenModal={openStyleManager}
                        />

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !title || !selectedStyle}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform flex items-center justify-center gap-3 min-h-[56px]
                                ${isGenerating || !title || !selectedStyle
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'}`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Generating Magic...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    <span>Generate Script</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};


export default ScriptGenerator;

// Main application entry point
import { uiStore } from './store/uiStore.js';
import { scriptStore } from './store/scriptStore.js';
import { imageStore } from './store/imageStore.js';
import { videoStore } from './store/videoStore.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import * as Constants from './utils/constants.js';
import { storage, appStorage, creditStorage } from './utils/storage.js';
import { initializeUI, toggleDarkMode, updateDarkIcon } from './components/AppInitializer.js';
import { generateFullScript as generateScript, parseScriptIntoScenes, typeWriterEffect } from './components/ScriptGenerator.js';
import { copyScript, downloadScript, updateScriptWordCount, setCopyDownloadEnabled, initializeScriptManager } from './components/ScriptManager.js';
import { showWordCountModal, hideWordCountModal, saveWordCount, showContextModal, hideContextModal, saveAdditionalContext, handleIconClick, initializeModals, liveUpdateWordCount } from './components/Modals.js';
import { generateImagePrompt, extractAndSaveCharacters, callIdeogramAPI, generateImagesForScript, generateRemainingImages, getIdeogramStyleType, setSelectedStyle, getSelectedStyle, getGeneratedScenes, setGeneratedScenes, getCurrentImageIndex, setCurrentImageIndex, getTotalImagesToGenerate, setTotalImagesToGenerate } from './components/ImageGenerator.js';
import { openStyleSelector, closeStyleSelector, showStylePage, nextStylePage, previousStylePage, selectImageStyle, updateImageCreditsEstimate, displayGeneratedScenes, showGenerateNextButton, hideGenerateNextButton, initializeImageModal, openRegenerateModal, closeRegenerateModal, regenerateScene, downloadScene, viewSceneDetail, toggleSceneText, toggleFirstSceneText, toggleScriptVisibility } from './components/ImageModal.js';
import { generateVoiceFromText, getSelectedVoiceId, setSelectedVoiceId, getSelectedVoiceIdx, setSelectedVoiceIdx, getCurrentVoiceProvider, setCurrentVoiceProvider, getGeneratedAudioUrl, setGeneratedAudioUrl, getActualAudioDuration, setActualAudioDuration, calculateVoiceCost, getAudioDurationWithTimeout, toggleVoiceDropdownModal, closeVoiceDropdownModal, selectVoiceFromModal, selectSpeechifyVoice, toggleSpeechifyVoiceModal, closeSpeechifyVoiceModal, playVoicePreview, switchVoiceProvider, initializeVoiceGenerator } from './components/VoiceGenerator.js';
import { renderVideos, renderVideosManual, showVideoDownloadModal, closeVideoDownloadModal, getVideoLibrary, saveVideoToLibrary, deleteVideoFromLibrary, renderVideoLibrary, playVideoInLibrary, closeVideoPlayer, initializeVideoRenderer } from './components/VideoRenderer.js';
import { connectYouTube, disconnectYouTube, openYouTubeUpload, closeYouTubeModal, uploadToYouTube, showYouTubeConnectionRequired, closeYouTubeConnectionRequiredModal, checkYouTubeAuth, checkYouTubeConnection, initializeYouTubeIntegration, getYouTubeSessionId, setYouTubeSessionId, getYouTubeChannelInfo, setYouTubeChannelInfo } from './components/YouTubeIntegration.js';
import { handleTextFileUpload, initializeTextFileUpload } from './components/TextFileUpload.js';

// Initialize error boundary
const errorBoundary = new ErrorBoundary(document.body);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ StoryVid AI - Application initialized');
  console.log('✅ Constants loaded from src/utils/constants.js');
  console.log('✅ Storage utilities loaded from src/utils/storage.js');
  console.log('✅ UI Initializer loaded from src/components/AppInitializer.js');
  
  // Initialize UI (dropdowns, dark mode, form validation, credit balance)
  initializeUI();
  
  // Initialize script manager (disable buttons, set up observers)
  initializeScriptManager();
  
  // Initialize modals (set up event listeners, load saved values)
  initializeModals();
  
  // Initialize image modal (set up event listeners, credits estimate)
  initializeImageModal();
  
  // Initialize voice generator (set up event listeners)
  initializeVoiceGenerator();
  
  // Initialize video renderer (set up event listeners)
  initializeVideoRenderer();
  
  // Initialize YouTube integration (set up event listeners, check OAuth)
  initializeYouTubeIntegration();
  
  // Initialize text file upload handler
  initializeTextFileUpload();

  // Expose stores globally for backward compatibility during migration
  window.uiStore = uiStore;
  window.scriptStore = scriptStore;
  window.imageStore = imageStore;
  window.videoStore = videoStore;

  // Expose constants globally for backward compatibility
  // This allows old app.js to access constants if needed during migration
  window.Constants = Constants;
  window.ELEVENLABS_VOICES = Constants.ELEVENLABS_VOICES;
  window.SPEECHIFY_VOICES = Constants.SPEECHIFY_VOICES;
  window.ELEVENLABS_VOICE_MAP = Constants.ELEVENLABS_VOICE_MAP;
  window.VOICE_RATE_WORDS_PER_CREDIT = Constants.VOICE_RATE_WORDS_PER_CREDIT;
  window.API_BASE_URL = Constants.API_BASE_URL;

  // Expose storage utilities globally for backward compatibility
  window.storage = storage;
  window.appStorage = appStorage;
  window.creditStorage = creditStorage;
  
  // Expose specific storage functions for backward compatibility
  window.saveCurrentSession = appStorage.saveCurrentSession.bind(appStorage);
  window.getSavedSession = appStorage.getSavedSession.bind(appStorage);
  window.clearCurrentSession = appStorage.clearCurrentSession.bind(appStorage);
  window.updateCreditBalance = creditStorage.updateBalance.bind(creditStorage);

  // Expose UI functions for backward compatibility
  window.initializeUI = initializeUI; // Expose so old app.js can use it
  window.toggleDarkMode = toggleDarkMode;
  window.updateDarkIcon = updateDarkIcon;

  // Expose script generation functions for backward compatibility
  // These will be used by the old app.js if available
  window.generateFullScriptNew = generateScript;
  window.parseScriptIntoScenesNew = parseScriptIntoScenes;
  window.typeWriterEffectNew = typeWriterEffect;
  
  // Expose script management functions for backward compatibility
  window.copyScriptNew = copyScript;
  window.downloadScriptNew = downloadScript;
  window.updateScriptWordCountNew = updateScriptWordCount;
  window.setCopyDownloadEnabledNew = setCopyDownloadEnabled;
  
  // Expose modal functions for backward compatibility
  window.showWordCountModalNew = showWordCountModal;
  window.hideWordCountModalNew = hideWordCountModal;
  window.saveWordCountNew = saveWordCount;
  window.showContextModalNew = showContextModal;
  window.hideContextModalNew = hideContextModal;
  window.saveAdditionalContextNew = saveAdditionalContext;
  window.handleIconClickNew = handleIconClick;
  window.liveUpdateWordCountNew = liveUpdateWordCount;
  
  // Expose image generation functions for backward compatibility
  window.generateImagesForScriptNew = generateImagesForScript;
  window.generateRemainingImagesNew = generateRemainingImages;
  window.generateImagePromptNew = generateImagePrompt;
  window.extractAndSaveCharactersNew = extractAndSaveCharacters;
  window.callIdeogramAPINew = callIdeogramAPI;
  window.getIdeogramStyleTypeNew = getIdeogramStyleType;
  window.setSelectedStyleNew = setSelectedStyle;
  window.getSelectedStyleNew = getSelectedStyle;
  window.getGeneratedScenesNew = getGeneratedScenes;
  window.setGeneratedScenesNew = setGeneratedScenes;
  window.getCurrentImageIndexNew = getCurrentImageIndex;
  window.setCurrentImageIndexNew = setCurrentImageIndex;
  window.getTotalImagesToGenerateNew = getTotalImagesToGenerate;
  window.setTotalImagesToGenerateNew = setTotalImagesToGenerate;
  
  // Expose image modal functions for backward compatibility
  window.openStyleSelectorNew = openStyleSelector;
  window.closeStyleSelectorNew = closeStyleSelector;
  window.showStylePageNew = showStylePage;
  window.nextStylePageNew = nextStylePage;
  window.previousStylePageNew = previousStylePage;
  window.selectImageStyleNew = selectImageStyle;
  window.updateImageCreditsEstimateNew = updateImageCreditsEstimate;
  window.displayGeneratedScenesNew = displayGeneratedScenes;
  window.showGenerateNextButtonNew = showGenerateNextButton;
  window.hideGenerateNextButtonNew = hideGenerateNextButton;
  
  // Expose image regeneration and error handling functions for backward compatibility
  window.openRegenerateModalNew = openRegenerateModal;
  window.closeRegenerateModalNew = closeRegenerateModal;
  window.regenerateSceneNew = regenerateScene;
  window.downloadSceneNew = downloadScene;
  window.viewSceneDetailNew = viewSceneDetail;
  window.toggleSceneTextNew = toggleSceneText;
  window.toggleFirstSceneTextNew = toggleFirstSceneText;
  window.toggleScriptVisibilityNew = toggleScriptVisibility;
  
  // Expose voice generation functions for backward compatibility
  window.generateVoiceFromTextNew = generateVoiceFromText;
  window.getSelectedVoiceIdNew = getSelectedVoiceId;
  window.setSelectedVoiceIdNew = setSelectedVoiceId;
  window.getSelectedVoiceIdxNew = getSelectedVoiceIdx;
  window.setSelectedVoiceIdxNew = setSelectedVoiceIdx;
  window.getCurrentVoiceProviderNew = getCurrentVoiceProvider;
  window.setCurrentVoiceProviderNew = setCurrentVoiceProvider;
  window.getGeneratedAudioUrlNew = getGeneratedAudioUrl;
  window.setGeneratedAudioUrlNew = setGeneratedAudioUrl;
  window.getActualAudioDurationNew = getActualAudioDuration;
  window.setActualAudioDurationNew = setActualAudioDuration;
  window.calculateVoiceCostNew = calculateVoiceCost;
  window.getAudioDurationWithTimeoutNew = getAudioDurationWithTimeout;
  window.toggleVoiceDropdownModalNew = toggleVoiceDropdownModal;
  window.closeVoiceDropdownModalNew = closeVoiceDropdownModal;
  window.selectVoiceFromModalNew = selectVoiceFromModal;
  window.selectSpeechifyVoiceNew = selectSpeechifyVoice;
  window.toggleSpeechifyVoiceModalNew = toggleSpeechifyVoiceModal;
  window.closeSpeechifyVoiceModalNew = closeSpeechifyVoiceModal;
  window.playVoicePreviewNew = playVoicePreview;
  window.switchVoiceProviderNew = switchVoiceProvider;
  
  // Expose video rendering functions for backward compatibility
  window.renderVideosNew = renderVideos;
  window.renderVideosManualNew = renderVideosManual;
  window.showVideoDownloadModalNew = showVideoDownloadModal;
  window.closeVideoDownloadModalNew = closeVideoDownloadModal;
  window.getVideoLibraryNew = getVideoLibrary;
  window.saveVideoToLibraryNew = saveVideoToLibrary;
  window.deleteVideoFromLibraryNew = deleteVideoFromLibrary;
  window.renderVideoLibraryNew = renderVideoLibrary;
  window.playVideoInLibraryNew = playVideoInLibrary;
  window.closeVideoPlayerNew = closeVideoPlayer;
  
  // Expose YouTube integration functions for backward compatibility
  window.connectYouTubeNew = connectYouTube;
  window.disconnectYouTubeNew = disconnectYouTube;
  window.openYouTubeUploadNew = openYouTubeUpload;
  window.closeYouTubeModalNew = closeYouTubeModal;
  window.uploadToYouTubeNew = uploadToYouTube;
  window.showYouTubeConnectionRequiredNew = showYouTubeConnectionRequired;
  window.closeYouTubeConnectionRequiredModalNew = closeYouTubeConnectionRequiredModal;
  window.checkYouTubeAuthNew = checkYouTubeAuth;
  window.checkYouTubeConnectionNew = checkYouTubeConnection;
  window.getYouTubeSessionIdNew = getYouTubeSessionId;
  window.setYouTubeSessionIdNew = setYouTubeSessionId;
  window.getYouTubeChannelInfoNew = getYouTubeChannelInfo;
  window.setYouTubeChannelInfoNew = setYouTubeChannelInfo;
  
  // Expose text file upload function for backward compatibility
  window.handleTextFileUpload = handleTextFileUpload;
  
  // Expose showYouTubeConnectionRequired immediately (before old app.js loads)
  window.showYouTubeConnectionRequired = showYouTubeConnectionRequired;
  window.closeYouTubeConnectionRequiredModal = closeYouTubeConnectionRequiredModal;
});

// Export for use in other modules
export { uiStore, scriptStore, imageStore, videoStore, Constants, storage, appStorage, creditStorage };


// =====================================================================
// CONSTANTS - MIGRATED TO src/utils/constants.js
// These are kept here for backward compatibility during migration
// TODO: Remove after full migration to new structure
// =====================================================================
// how many words per 1 credit for TTS
const VOICE_RATE_WORDS_PER_CREDIT = 120;

// ⚡ DARK MODE - Initialize immediately (before page loads)
(function() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }
})();

// Backend API configuration - All API keys are now stored securely on the backend
const API_BASE_URL = window.location.origin;

// Validate API_BASE_URL is set correctly
console.log('✅ API Configuration Loaded:');
console.log('   API_BASE_URL:', API_BASE_URL);
console.log('   All API calls will go through the backend server');
console.log('   No direct API calls to external services!');

if (!API_BASE_URL || API_BASE_URL === 'null') {
  console.error('❌ API_BASE_URL is not set correctly!');
  alert('Configuration Error: API_BASE_URL is not set. Please check your setup.');
}

// ⚡ FORCE DEFAULT: Transitions always start UNCHECKED
// User must manually enable transitions - it never defaults to ON
if (!localStorage.getItem('enableTransitions')) {
  localStorage.setItem('enableTransitions', 'false');
  console.log('🔧 Transitions defaulting to UNCHECKED (user must enable manually)');
}

// Additional safety check on page load
document.addEventListener('DOMContentLoaded', function() {
  // If enableTransitions is not explicitly 'true', force it to 'false'
  if (localStorage.getItem('enableTransitions') !== 'true') {
    localStorage.setItem('enableTransitions', 'false');
    console.log('🔒 Page load: Ensuring transitions are OFF by default');
  }
});

// Initialize voice functionality after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const voiceIcon = document.getElementById('voiceIcon');
  const scriptEl  = document.getElementById('scriptContent');

  if (!voiceIcon || !scriptEl) {
    console.error('❌ Voice elements not found in DOM');
    return;
  }

  window.voiceCharged = false;
  window.isGenerating = true;

  function scriptHasText() {
    const txt = (scriptEl?.innerText || '').trim();
    return txt.length > 0;
  }
  function isScriptReady() { return !window.isGenerating && scriptHasText(); }

  function refreshVoiceIcon() {
    const ready = isScriptReady();
    console.log('🔄 Refresh voice icon - Ready:', ready, '| isGenerating:', window.isGenerating, '| hasText:', scriptHasText());
    voiceIcon.classList.toggle('disabled', !ready);
    voiceIcon.setAttribute('aria-disabled', String(!ready));
    
    // Always ensure pointer events are enabled when ready
    if (ready) {
      voiceIcon.style.pointerEvents = 'auto';
      voiceIcon.style.cursor = 'pointer';
    }
  }

  const obs = new MutationObserver(refreshVoiceIcon);
  obs.observe(scriptEl, { childList: true, subtree: true, characterData: true });
  refreshVoiceIcon();

  function onScriptGenerationComplete() {
    window.isGenerating = false;
    
    // Force enable voice icon directly (don't rely on scriptHasText check)
    if (voiceIcon) {
      voiceIcon.classList.remove('disabled');
      voiceIcon.setAttribute('aria-disabled', 'false');
      voiceIcon.style.pointerEvents = 'auto'; // Force enable pointer events
      voiceIcon.style.cursor = 'pointer'; // Force cursor
      console.log('✅ Voice icon enabled directly');
    }
    
    // Also call refreshVoiceIcon to update state
    refreshVoiceIcon();
    
    // Enable image icon after script is complete
    const imageIcon = document.getElementById('imageIcon');
    if (imageIcon) {
      imageIcon.classList.remove('disabled');
      imageIcon.setAttribute('aria-disabled', 'false');
      imageIcon.style.pointerEvents = 'auto'; // Force enable pointer events
      imageIcon.style.cursor = 'pointer'; // Force cursor
      console.log('✅ Image icon enabled after script generation');
    }
    
    // Re-check after a short delay to ensure everything is synced
    setTimeout(() => {
      refreshVoiceIcon();
      if (typeof window.refreshImageIcon === 'function') {
        window.refreshImageIcon();
      }
    }, 500);
  }
  
  // Create refreshImageIcon function
  function refreshImageIcon() {
    const imageIcon = document.getElementById('imageIcon');
    if (imageIcon) {
      const hasScript = scriptHasText();
      // Image icon should be enabled if script exists (voice check happens on click)
      const shouldEnable = hasScript;
      
      imageIcon.classList.toggle('disabled', !shouldEnable);
      imageIcon.setAttribute('aria-disabled', String(!shouldEnable));
      console.log('🔄 Refresh image icon - Enabled:', shouldEnable, '| hasScript:', hasScript);
    }
  }
  
  window.refreshImageIcon = refreshImageIcon;

  // Make functions globally available
  window.refreshVoiceIcon = refreshVoiceIcon;
  window.onScriptGenerationComplete = onScriptGenerationComplete;
});

// Initialize voice estimate functionality after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const voiceEstWrap   = document.getElementById('voiceEstWrap');
  const voiceCredVal   = document.getElementById('voiceCredVal');
  const voiceProgress  = document.getElementById('voiceProgress');
  const audioContainer = document.getElementById('audioContainer');
  const voiceIcon = document.getElementById('voiceIcon');

  if (!voiceEstWrap || !voiceCredVal || !voiceProgress || !audioContainer || !voiceIcon) {
    console.error('❌ Voice estimate elements not found');
    return;
  }

  function getVoiceCost() {
    const wc = parseInt(document.getElementById('wordCount')?.textContent || '0', 10);
    return Math.max(1, Math.round(wc / VOICE_RATE_WORDS_PER_CREDIT));
  }
  
  function updateVoiceEstimate() {
    if (voiceIcon.classList.contains('disabled')) {
      voiceEstWrap.classList.add('hidden');
      voiceProgress.classList.add('hidden');
      return;
    }
    const cost = getVoiceCost();
    voiceCredVal.textContent = cost;
    voiceEstWrap.classList.remove('hidden');
  }

  // Wrap existing refreshVoiceIcon if it exists
  const originalRefresh = window.refreshVoiceIcon;
  if (originalRefresh) {
    window.refreshVoiceIcon = function () {
      originalRefresh();
      updateVoiceEstimate();
    };
  }

  // Wrap existing onScriptGenerationComplete if it exists
  const originalComplete = window.onScriptGenerationComplete;
  if (originalComplete) {
    const oldOnScriptComplete = originalComplete;
    window.onScriptGenerationComplete = function () {
      window.voiceCharged = false;
      oldOnScriptComplete();
      updateVoiceEstimate();
    };
  }
});

// =====================================================================
// VOICE CONSTANTS - MIGRATED TO src/utils/constants.js
// These are kept here for backward compatibility during migration
// TODO: Remove after full migration to new structure
// =====================================================================
// Full list of 21 ElevenLabs voices - ALL available for selection!
  const ELEVENLABS_VOICES = [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", style: "Calm and professional" },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", style: "Strong and confident" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", style: "Soft and gentle" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni", style: "Warm and friendly" },
    { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", style: "Young and energetic" },
    { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", style: "Deep narrator" },
    { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", style: "Crisp storyteller" },
    { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", style: "Clear and articulate" },
    { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", style: "Raspy character" },
    { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Serena", style: "Pleasant narrator" },
    { id: "ODq5zmih8GrVes37Dizd", name: "Patrick", style: "Smooth baritone" },
    { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", style: "Casual Australian" },
    { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", style: "British narrator" },
    { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", style: "British woman" },
    { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", style: "English Swedish" },
    { id: "iP95p4xoKVk53GoZ742B", name: "Chris", style: "Casual American" },
    { id: "nPczCjzI2devNBz1zQrb", name: "Brian", style: "Fairy tale voice" },
    { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", style: "Hoarse male" },
    { id: "Zlb1dXrM653N07WRdFW3", name: "Emily", style: "Calm American" },
    { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", style: "Pleasant British" },
    { id: "aMSt68OGf4xUZAnLpTU8", name: "Juniper", style: "Expressive storyteller" }
  ];
  
  // Speechify voices for non-premium option
  const SPEECHIFY_VOICES = [
    { id: 'henry', name: 'Henry', style: 'Warm and friendly' },
    { id: 'snoop', name: 'Snoop', style: 'Cool and laid-back' },
    { id: 'gwyneth', name: 'Gwyneth', style: 'Elegant and sophisticated' },
    { id: 'mrbeast', name: 'Mr. Beast', style: 'Energetic and enthusiastic' },
    { id: 'james', name: 'James', style: 'Professional narrator' },
    { id: 'olivia', name: 'Olivia', style: 'Clear and articulate' },
    { id: 'noah', name: 'Noah', style: 'Confident and strong' },
    { id: 'emma', name: 'Emma', style: 'Gentle and soothing' }
  ];
  
  // Map old style names to ElevenLabs voices (for backwards compatibility)
  const ELEVENLABS_VOICE_MAP = {
    "Rachel":    "21m00Tcm4TlvDq8ikWAM",
    "Domi":      "AZnzlk1XvdvUeBnXmlld",
    "Bella":     "EXAVITQu4vr4xnSDxMaL",
    "Antoni":    "ErXwobaYiN019PkySvjV",
    "Elli":      "MF3mGyEYCl7XYWbV9V6O",
    "Josh":      "TxGEqnHWrfWFTfGW9XjX",
    "Arnold":    "VR6AewLTigWG4xSOukaG",
    "Adam":      "pNInz6obpgDQGcFmaJgB",
    "Sam":       "yoZ06aMxZJJ28mfd3POQ",
    "Serena":    "CwhRBWXzGAHq8TQ4Fs17",
    "Patrick":   "ODq5zmih8GrVes37Dizd",
    "Charlie":   "IKne3meq5aSn9XLyUdCD",
    "Daniel":    "onwK4e9ZLuTAKqWW03F9",
    "Lily":      "pFZP5JQG7iQjIQuC4Bku",
    "Charlotte": "XB0fDUnXU5powFXDhCwa",
    "Chris":     "iP95p4xoKVk53GoZ742B",
    "Brian":     "nPczCjzI2devNBz1zQrb",
    "Callum":    "N2lVS1w4EtoT3dr4eOWO",
    "Emily":     "Zlb1dXrM653N07WRdFW3",
    "Dorothy":   "ThT5KcBeYPX3keUQqHPh",
    "Juniper":   "aMSt68OGf4xUZAnLpTU8"
  };

  // =====================================================================
  // VOICE SELECTION - MIGRATED TO src/components/VoiceGenerator.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  function getSelectedVoiceId() {
    if (window.getSelectedVoiceIdNew && typeof window.getSelectedVoiceIdNew === 'function') {
      return window.getSelectedVoiceIdNew();
    }
    // Fallback to old implementation
    try {
      const styles = JSON.parse(localStorage.getItem('styles')||'[]');
      const idxStr = localStorage.getItem('currentStyleIdx');
      
      console.log('=== Voice Selection Debug ===');
      console.log('currentStyleIdx string:', idxStr);
      
      // Check if we have a valid style index
      if (idxStr === null || idxStr === undefined || idxStr === '') {
        console.log('No style selected, using default voice: aMSt68OGf4xUZAnLpTU8 (Juniper - Always Works)');
        return "aMSt68OGf4xUZAnLpTU8"; // Juniper default - GUARANTEED TO WORK
      }
      
      const idx = parseInt(idxStr);
      if (isNaN(idx) || idx < 0 || idx >= styles.length) {
        console.log('Invalid style index, using default voice: aMSt68OGf4xUZAnLpTU8 (Juniper - Always Works)');
        return "aMSt68OGf4xUZAnLpTU8"; // Juniper default - GUARANTEED TO WORK
      }
      
      const chosenVoice = styles[idx]?.voice;
      
      console.log('Current style index:', idx);
      console.log('All styles:', styles);
      console.log('Selected style:', styles[idx]);
      console.log('Chosen voice value:', chosenVoice);
      
      if (!chosenVoice) {
        console.log('No voice found in style, using default: aMSt68OGf4xUZAnLpTU8 (Juniper)');
        return "aMSt68OGf4xUZAnLpTU8"; // Juniper default - ALWAYS WORKS
      }
      
      // Check if it's already a valid voice ID (IDs are long alphanumeric strings)
      if (chosenVoice.length > 15 && /^[A-Za-z0-9_-]+$/.test(chosenVoice)) {
        console.log('✅ Valid voice ID found:', chosenVoice);
        return chosenVoice;
      }
      
      // Otherwise it's a name, map it to ID
      const mappedId = ELEVENLABS_VOICE_MAP[chosenVoice] || "aMSt68OGf4xUZAnLpTU8";
      console.log('Voice name mapped to ID:', chosenVoice, '->', mappedId);
      return mappedId;
    } catch (err) {
      console.error('Error getting voice ID:', err);
      return "aMSt68OGf4xUZAnLpTU8"; // Juniper default - ALWAYS WORKS
    }
  }

// Voice icon click handler - wrapped in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  const voiceIcon = document.getElementById('voiceIcon');
  const voiceEstWrap = document.getElementById('voiceEstWrap');
  const voiceProgress = document.getElementById('voiceProgress');
  const audioContainer = document.getElementById('audioContainer');
  
  if (!voiceIcon) {
    console.error('❌ Voice icon not found');
    return;
  }

  function getVoiceCost() {
    const wc = parseInt(document.getElementById('wordCount')?.textContent || '0', 10);
    return Math.max(1, Math.round(wc / VOICE_RATE_WORDS_PER_CREDIT));
  }

  // Function to handle voice icon click
  async function handleVoiceIconClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎤 Voice icon clicked - HANDLER FIRED!');
    console.log('   Icon disabled?', voiceIcon.classList.contains('disabled'));
    console.log('   Icon element:', voiceIcon);
    console.log('   Event target:', e.target);
    console.log('   Current classes:', voiceIcon.className);
    
    // Force enable pointer events (in case CSS is blocking)
    voiceIcon.style.pointerEvents = 'auto';
    voiceIcon.style.cursor = 'pointer';
    
    // Check if disabled class is present (which blocks pointer events)
    if (voiceIcon.classList.contains('disabled')) {
      console.warn('⚠️ Voice icon is disabled - removing disabled class');
      voiceIcon.classList.remove('disabled');
      voiceIcon.setAttribute('aria-disabled', 'false');
    }
    
    // Double-check pointer-events style
    const computedStyle = window.getComputedStyle(voiceIcon);
    if (computedStyle.pointerEvents === 'none') {
      console.warn('⚠️ Voice icon has pointer-events: none - fixing');
      voiceIcon.style.pointerEvents = 'auto';
    }
    
    const text = document.getElementById('scriptContent')?.innerText?.trim() || '';
    console.log('   Script text length:', text.length);
    
    if (!text) {
      console.warn('⚠️ No script text found');
      alert('No script text found. Please generate a script first.');
      return;
    }

    const cost = getVoiceCost();
    const balEl = document.getElementById('creditBalance');
    const current = parseInt(balEl?.textContent || '0', 10);
    if (current < cost && !window.voiceCharged) {
      alert(`Not enough credits for voiceover. Need ${cost}, you have ${current}.`);
      return;
    }

    const voiceEstWrapEl = document.getElementById('voiceEstWrap');
    const voiceProgressEl = document.getElementById('voiceProgress');
    
    if (voiceEstWrapEl) voiceEstWrapEl.classList.add('hidden');
    if (voiceProgressEl) {
      voiceProgressEl.classList.remove('hidden');
      voiceProgressEl.textContent = '0%';
    }
    voiceIcon.classList.add('disabled');
    voiceIcon.setAttribute('aria-disabled','true');

    let p = 0;
    const timer = setInterval(() => {
      p = Math.min(95, p + 2);
      const progressEl = document.getElementById('voiceProgress');
      if (progressEl) progressEl.textContent = p + '%';
    }, 60);

    try {
      // ElevenLabs TTS via AI33.pro backend
      const voiceName = getSelectedVoiceId(); // Gets voice ID from localStorage style settings
      console.log('🎤 Using voice ID for generation:', voiceName);
      console.log('🎤 Script text preview:', text.substring(0, 100) + '...');
      
      const textSpeed = (() => {
        try {
          const styles = JSON.parse(localStorage.getItem('styles')||'[]');
          const idx = parseInt(localStorage.getItem('currentStyleIdx'));
          return Math.max(0.25, Math.min(4, parseFloat(styles?.[idx]?.voiceSpeed) || 1));
        } catch { return 1; }
      })();
      
      // ✅ FIXED: Get similarity and stability from style settings
      const voiceSettings = (() => {
        try {
          const styles = JSON.parse(localStorage.getItem('styles')||'[]');
          const idx = parseInt(localStorage.getItem('currentStyleIdx'));
          const style = styles?.[idx];
          return {
            stability: (style?.stability !== undefined ? style.stability / 100 : 0.5),
            similarity_boost: (style?.similarity !== undefined ? style.similarity / 100 : 0.75)
          };
        } catch {
          return { stability: 0.5, similarity_boost: 0.75 };
        }
      })();
      
      console.log('🎤 Voice settings from style:', voiceSettings);

      // Call backend voice generation endpoint
      const progressEl = document.getElementById('voiceProgress');
      if (progressEl) progressEl.textContent = '10%';
      const response = await fetch(`${API_BASE_URL}/api/generate-voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          voice_id: voiceName,
          voice_settings: voiceSettings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate voice');
      }
      
      const data = await response.json();
      clearInterval(timer);
      voiceProgress.textContent = '100%';
      
      // Create audio element with base64 data
      const audioUrl = `data:${data.contentType};base64,${data.audio}`;
      generatedAudioUrl = audioUrl; // Store for later use in downloads
      audioContainer.innerHTML = `
        <audio controls class="block h-[28px] w-full m-0 p-0">
          <source src="${audioUrl}" type="${data.contentType}">
        </audio>`;
      audioContainer.classList.remove('hidden');
      
      // ✅ SHOW AUDIO IMMEDIATELY - Don't wait for duration!
      setTimeout(() => voiceProgress.classList.add('hidden'), 500);
      
      // ✅ Get duration in BACKGROUND (non-blocking) with 5-second timeout
      getAudioDurationWithTimeout(audioUrl, 5000).then(duration => {
        actualAudioDuration = duration;
        console.log('✅ Audio duration stored:', actualAudioDuration, 'seconds');
      }).catch(err => {
        console.warn('⚠️ Could not get audio duration, will use word estimation:', err);
        actualAudioDuration = 0; // Will fall back to word-based estimation
      });
      
      if (!window.voiceCharged) {
        const balEl = document.getElementById('creditBalance');
        const current = parseInt(balEl?.textContent || '0', 10);
        if (typeof updateCreditBalance === 'function') {
          updateCreditBalance(Math.max(0, current - cost));
        } else if (balEl) {
          balEl.textContent = Math.max(0, current - cost);
        }
        window.voiceCharged = true;
      }
      
      // Enable image generation icon after voice is generated
      const imageIcon = document.getElementById('imageIcon');
      if (imageIcon) {
        imageIcon.classList.remove('disabled');
        imageIcon.setAttribute('aria-disabled', 'false');
      }
      
      return;
      
    } catch (err) {
      clearInterval(timer);
      voiceProgress.classList.add('hidden');
      console.error('❌ Voice generation failed:', err);
      console.error('   Error details:', {
        message: err?.message,
        response: err?.response,
        stack: err?.stack
      });
      alert('Voice generation failed: ' + (err?.message || err));
      voiceEstWrap.classList.remove('hidden');
    } finally {
      voiceIcon.classList.remove('disabled');
      voiceIcon.setAttribute('aria-disabled','false');
      voiceIcon.style.pointerEvents = 'auto';
      voiceIcon.style.cursor = 'pointer';
    }
  }
  
  // Attach click handler with multiple event types for better coverage
  voiceIcon.addEventListener('click', handleVoiceIconClick, true); // Use capture phase
  voiceIcon.addEventListener('mousedown', (e) => {
    console.log('🖱️ Voice icon mousedown event');
    if (!voiceIcon.classList.contains('disabled')) {
      handleVoiceIconClick(e);
    }
  });
  
  // Also attach to parent container as fallback (event delegation)
  const scriptOutput = document.getElementById('scriptOutput');
  if (scriptOutput) {
    scriptOutput.addEventListener('click', (e) => {
      const clickedIcon = e.target.closest('#voiceIcon');
      if (clickedIcon) {
        console.log('🎤 Voice icon clicked via event delegation');
        handleVoiceIconClick(e);
      }
    }, true); // Use capture phase
  }
  
  // Test: Add a simple click test
  voiceIcon.onclick = function(e) {
    console.log('🎤 Voice icon onclick (direct) - TEST');
    e.stopPropagation();
  };
  
  console.log('✅ Voice icon click handler attached');
  console.log('   Voice icon element:', voiceIcon);
  console.log('   Voice icon classes:', voiceIcon.className);
  
  // Function to handle image icon click
  function handleImageIconClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖼️ Image icon clicked - HANDLER FIRED!');
    console.log('   Icon disabled?', imageIcon.classList.contains('disabled'));
    console.log('   Icon element:', imageIcon);
    
    // Force enable pointer events (in case CSS is blocking)
    imageIcon.style.pointerEvents = 'auto';
    imageIcon.style.cursor = 'pointer';
    
    if (imageIcon.classList.contains('disabled')) {
      console.warn('⚠️ Image icon is disabled - removing disabled class');
      imageIcon.classList.remove('disabled');
      imageIcon.setAttribute('aria-disabled', 'false');
    }
    
    // Check if voice has been generated (required for image generation)
    if (!generatedAudioUrl) {
      alert('Please generate voice over first before creating images.');
      return;
    }
    
    console.log('🖼️ Opening image modal...');
    // Open image generation modal
    if (typeof openImageModal === 'function') {
      openImageModal();
    } else {
      console.error('❌ openImageModal function not found');
      alert('Image modal function not available. Please refresh the page.');
    }
  }
  
  // Image icon click handler - only works after voice generation
  const imageIcon = document.getElementById('imageIcon');
  if (!imageIcon) {
    console.error('❌ Image icon not found in DOMContentLoaded');
  } else {
    // Function to handle image icon click (defined here so it has access to imageIcon)
    function handleImageIconClick(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🖼️ Image icon clicked - HANDLER FIRED!');
      console.log('   Icon disabled?', imageIcon.classList.contains('disabled'));
      console.log('   Icon element:', imageIcon);
      console.log('   generatedAudioUrl:', generatedAudioUrl);
      
      // Force enable pointer events (in case CSS is blocking)
      imageIcon.style.pointerEvents = 'auto';
      imageIcon.style.cursor = 'pointer';
      
      if (imageIcon.classList.contains('disabled')) {
        console.warn('⚠️ Image icon is disabled - removing disabled class');
        imageIcon.classList.remove('disabled');
        imageIcon.setAttribute('aria-disabled', 'false');
      }
      
      // Temporarily allow image generation without voice (for testing)
      // Check if voice has been generated (required for image generation)
      if (!generatedAudioUrl) {
        const proceed = confirm('Voice has not been generated yet. Do you want to proceed with image generation anyway? (Normally voice is required first)');
        if (!proceed) {
          return;
        }
      }
      
      console.log('🖼️ Opening image modal...');
      // Open image generation modal - try multiple ways
      if (typeof window.openImageModal === 'function') {
        window.openImageModal();
      } else if (typeof openImageModal === 'function') {
        openImageModal();
      } else {
        console.error('❌ openImageModal function not found');
        // Try to open modal directly
        const modal = document.getElementById('imageGenerationModal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          console.log('✅ Image modal opened directly');
        } else {
          alert('Image modal function not available. Please refresh the page.');
        }
      }
    }
    
    imageIcon.addEventListener('click', handleImageIconClick, true); // Use capture phase
    imageIcon.addEventListener('mousedown', (e) => {
      console.log('🖱️ Image icon mousedown event');
      if (!imageIcon.classList.contains('disabled')) {
        handleImageIconClick(e);
      }
    });
    
    // Also attach to parent container as fallback (event delegation)
    const scriptOutput = document.getElementById('scriptOutput');
    if (scriptOutput) {
      scriptOutput.addEventListener('click', (e) => {
        const clickedIcon = e.target.closest('#imageIcon');
        if (clickedIcon) {
          console.log('🖼️ Image icon clicked via event delegation');
          handleImageIconClick(e);
        }
      }, true); // Use capture phase
    }
    
    // Test: Add a simple click test
    imageIcon.onclick = function(e) {
      console.log('🖼️ Image icon onclick (direct) - TEST');
      handleImageIconClick(e);
    };
    
    console.log('✅ Image icon click handler attached');
    console.log('   Image icon element:', imageIcon);
    console.log('   Image icon classes:', imageIcon.className);
  }
});

// Image modal functions
function openImageModal() {
    console.log('🖼️ openImageModal called');
    const modal = document.getElementById('imageGenerationModal');
    console.log('   Modal element:', modal);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      console.log('✅ Image modal opened');
      if (typeof updateImageCreditsEstimate === 'function') {
        updateImageCreditsEstimate();
      } else {
        console.warn('⚠️ updateImageCreditsEstimate not found');
      }
    } else {
      console.error('❌ Image generation modal not found in DOM');
    }
  }
  
  // Expose globally
  window.openImageModal = openImageModal;
  
  function closeImageModal() {
    const modal = document.getElementById('imageGenerationModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  
  // Style selector functions
  // =====================================================================
  // STYLE SELECTOR - MIGRATED TO src/components/ImageModal.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  let currentStylePage = 1;
  let selectedStyle = { id: 'realistic', name: 'Realistic' };
  
  function openStyleSelector() {
    if (window.openStyleSelectorNew && typeof window.openStyleSelectorNew === 'function') {
      return window.openStyleSelectorNew();
    }
    // Fallback to old implementation
    const modal = document.getElementById('styleSelectorModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      currentStylePage = 1;
      showStylePage(1);
    }
  }
  
  function closeStyleSelector() {
    if (window.closeStyleSelectorNew && typeof window.closeStyleSelectorNew === 'function') {
      return window.closeStyleSelectorNew();
    }
    // Fallback to old implementation
    const modal = document.getElementById('styleSelectorModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  
  function showStylePage(page) {
    if (window.showStylePageNew && typeof window.showStylePageNew === 'function') {
      return window.showStylePageNew(page);
    }
    // Fallback to old implementation
    // Hide all pages
    document.getElementById('stylesPage1').classList.add('hidden');
    document.getElementById('stylesPage2').classList.add('hidden');
    document.getElementById('stylesPage3').classList.add('hidden');
    
    // Show selected page
    document.getElementById(`stylesPage${page}`).classList.remove('hidden');
    document.getElementById(`stylesPage${page}`).classList.add('grid');
    
    // Update page number
    document.getElementById('currentPage').textContent = page;
    
    // Update button states
    document.getElementById('prevPageBtn').disabled = page === 1;
    document.getElementById('nextPageBtn').disabled = page === 3;
    
    currentStylePage = page;
  }
  
  function nextStylePage() {
    if (window.nextStylePageNew && typeof window.nextStylePageNew === 'function') {
      return window.nextStylePageNew();
    }
    // Fallback to old implementation
    if (currentStylePage < 3) {
      showStylePage(currentStylePage + 1);
    }
  }
  
  function previousStylePage() {
    if (window.previousStylePageNew && typeof window.previousStylePageNew === 'function') {
      return window.previousStylePageNew();
    }
    // Fallback to old implementation
    if (currentStylePage > 1) {
      showStylePage(currentStylePage - 1);
    }
  }
  
  window.selectImageStyle = function selectImageStyle(styleId, styleName, imageUrl, event) {
    if (window.selectImageStyleNew && typeof window.selectImageStyleNew === 'function') {
      return window.selectImageStyleNew(styleId, styleName, imageUrl, event);
    }
    // Fallback to old implementation
    // Prevent event bubbling
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    selectedStyle = { id: styleId, name: styleName };
    
    console.log('🎨 Style selected:', styleId, styleName);
    
    // Update the selected style display in main modal
    const nameElement = document.getElementById('selectedStyleName');
    if (nameElement) {
      nameElement.textContent = styleName;
      console.log('✅ Updated style name to:', styleName);
    }
    
    // Update the image preview
    const imageElement = document.getElementById('selectedStyleImage');
    if (imageElement) {
      if (imageUrl) {
        // Use provided imageUrl
        imageElement.src = imageUrl;
        imageElement.alt = styleName;
        console.log('✅ Updated image URL');
      } else {
        // Try to find the image from the style card
        const styleCards = document.querySelectorAll('.style-card');
        for (const card of styleCards) {
          const cardImage = card.querySelector('img');
          if (cardImage && cardImage.alt === styleName) {
            imageElement.src = cardImage.src;
            imageElement.alt = styleName;
            console.log('✅ Found and updated image from card');
            break;
          }
        }
      }
    }
    
    // Highlight selected style card
    document.querySelectorAll('.style-card').forEach(card => {
      card.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
    });
    
    // Find the clicked card - could be the element itself or a parent
    let clickedCard = null;
    if (event) {
      // Start from the event target and go up until we find style-card
      let element = event.target || event.srcElement;
      while (element && element !== document.body) {
        if (element.classList && element.classList.contains('style-card')) {
          clickedCard = element;
          break;
        }
        element = element.parentElement;
      }
      
      // If not found, try currentTarget
      if (!clickedCard && event.currentTarget && event.currentTarget.classList && event.currentTarget.classList.contains('style-card')) {
        clickedCard = event.currentTarget;
      }
    }
    
    // Add highlight to clicked card
    if (clickedCard) {
      clickedCard.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
      console.log('✅ Highlighted selected card');
    }
    
    // Close style selector
    closeStyleSelector();
    
    console.log('✅ Style selection complete:', selectedStyle);
    
    return false; // Prevent default behavior
  }
  
  // =====================================================================
  // IMAGE CREDITS ESTIMATE - MIGRATED TO src/components/ImageModal.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // Update credits estimate based on settings
  function updateImageCreditsEstimate() {
    if (window.updateImageCreditsEstimateNew && typeof window.updateImageCreditsEstimateNew === 'function') {
      return window.updateImageCreditsEstimateNew();
    }
    // Fallback to old implementation
    const quality = document.getElementById('imageQuality')?.value || 'better';
    const count = parseInt(document.getElementById('imageCount')?.value || 3);
    const animate = document.getElementById('imageAnimate')?.checked || false;
    
    let costPerImage = quality === 'standard' ? 30 : quality === 'better' ? 60 : 120;
    if (animate) costPerImage *= 2; // Animation doubles the cost
    
    const total = costPerImage * count;
    const estimateEl = document.getElementById('imageCreditsEstimate');
    if (estimateEl) estimateEl.textContent = total;
  }
  
  // Add event listeners for credits estimate
  // This is now handled by initializeImageModal() in src/components/ImageModal.js
  document.addEventListener('DOMContentLoaded', () => {
    // Only set up if new modal hasn't been initialized
    if (!window.imageModalInitialized) {
      const qualitySelect = document.getElementById('imageQuality');
      const countInput = document.getElementById('imageCount');
      const animateCheckbox = document.getElementById('imageAnimate');
      
      if (qualitySelect) qualitySelect.addEventListener('change', updateImageCreditsEstimate);
      if (countInput) countInput.addEventListener('input', updateImageCreditsEstimate);
      if (animateCheckbox) animateCheckbox.addEventListener('change', updateImageCreditsEstimate);
    }
  });
  
  // Generate images button handler
  let generatedScenes = [];
  let currentProjectData = null;
  let generatedAudioUrl = null;
  let actualAudioDuration = 0; // Store actual audio duration in seconds
  let characterMemory = {};
  let currentSceneIndex = 0;
  // Get actual duration from audio element
  async function getAudioDuration(audioUrl) {
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        console.log('🎵 Audio duration loaded:', audio.duration, 'seconds');
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        console.warn('⚠️ Could not load audio duration, using estimation');
        resolve(0);
      });
    });
  }
  
  // Get audio duration with timeout (don't wait forever for large files)
  async function getAudioDurationWithTimeout(audioUrl, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      let resolved = false;
      
      // Set timeout - if duration takes too long, give up and use estimation
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn(`⚠️ Audio duration timeout after ${timeoutMs}ms, will use word-based estimation`);
          resolve(0); // Return 0 = will use word-based estimation
        }
      }, timeoutMs);
      
      audio.addEventListener('loadedmetadata', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          console.log('🎵 Audio duration loaded:', audio.duration, 'seconds');
          resolve(audio.duration);
        }
      });
      
      audio.addEventListener('error', (e) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          console.warn('⚠️ Error loading audio duration:', e);
          resolve(0);
        }
      });
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateImagesBtn');
    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        // Images are now generated using OpenAI DALL-E via backend
        
        const aspectRatio = document.getElementById('imageAspectRatio')?.value || '16:9';
        const quality = document.getElementById('imageQuality')?.value || 'standard';
        const animate = document.getElementById('imageAnimate')?.checked || false;
        let count = parseInt(document.getElementById('imageCount')?.value || 3);
        const context = document.getElementById('imageContext')?.value.trim() || '';
        const style = selectedStyle;
        
        // Get the script content first
        const scriptText = document.getElementById('scriptContent')?.textContent || document.getElementById('scriptContent')?.innerText || '';
        if (!scriptText) {
          alert('Please generate a script first!');
          return;
        }
        
        // 📊 Calculate dynamic minimum images based on audio duration
        const wordCount = scriptText.trim().split(/\s+/).length;
        const wordsPerMinute = 150; // Average speaking rate
        const durationMinutes = wordCount / wordsPerMinute;
        
        // Dynamic minimum based on audio duration (1 image per 10 minutes):
        // 0-10 min: 1 image
        // 10-20 min: 2 images
        // 20-30 min: 3 images
        // 30-40 min: 4 images
        // 40-50 min: 5 images
        // 50-60 min: 6 images
        // 60+ min: Math.ceil(duration / 10)
        let minimumImages = Math.max(1, Math.ceil(durationMinutes / 10));
        
        // Enforce minimum
        if (count < minimumImages) {
          count = minimumImages;
          console.log(`⚠️ Voice duration: ${durationMinutes.toFixed(1)} minutes - Setting minimum ${minimumImages} images (1 per 10 minutes)`);
          alert(`Based on your ${durationMinutes.toFixed(1)}-minute voiceover, minimum ${minimumImages} images required (1 per 10 minutes). Adjusted automatically.`);
        } else {
          console.log(`✅ Voice duration: ${durationMinutes.toFixed(1)} minutes - Using ${count} images (minimum: ${minimumImages})`);
        }
        
        const settings = { aspectRatio, quality, animate, count, context, style };
        
        console.log('Image generation settings:', settings);
        
        // Close image modal and open generated media modal
        closeImageModal();
        openGeneratedMediaModal();
        
        // Start image generation
        await generateImagesForScript(scriptText, settings);
      });
    }
  });
  
  // =====================================================================
  // PARSE SCRIPT INTO SCENES - MIGRATED TO src/components/ScriptGenerator.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  
  // Parse script into scenes with timestamps
async function parseScriptIntoScenes(scriptText, targetCount) {
  // Use new component if available
  if (window.parseScriptIntoScenesNew && typeof window.parseScriptIntoScenesNew === 'function') {
    return await window.parseScriptIntoScenesNew(scriptText, targetCount);
  }
  
  // Fallback to old implementation
  const words = scriptText.split(/\s+/);
  const wordsPerScene = Math.floor(words.length / targetCount);
  const scenes = [];
  
  console.log(`📝 Parsing script into ${targetCount} scenes and generating image prompts...`);
  
  // ✅ Use actual audio duration if available, otherwise estimate
  const useActualDuration = actualAudioDuration > 0;
  const totalDuration = useActualDuration ? actualAudioDuration : (words.length / (150 / 60));
  
  if (useActualDuration) {
    console.log('✅ Using ACTUAL audio duration:', actualAudioDuration, 'seconds');
  } else {
    console.log('⚠️ Audio duration not available, using word-based estimation');
  }
  
  // 🆕 RESET CHARACTER MEMORY for new generation
  characterMemory = {};
  currentSceneIndex = 0;
  
  // Helper function: Find nearest sentence ending after target word position
  function findSentenceEnd(words, targetWordIndex) {
    // Join words from target onwards to search for sentence endings
    const textFromTarget = words.slice(targetWordIndex).join(' ');
    
    // Find first occurrence of sentence-ending punctuation followed by space and capital letter
    const sentenceEndMatch = textFromTarget.match(/[.!?]\s+(?=[A-Z"])/);
    
    if (!sentenceEndMatch) {
      // No sentence ending found, return target as-is
      return targetWordIndex;
    }
    
    // Calculate position AFTER the punctuation and space (where next sentence starts)
    const endPosition = sentenceEndMatch.index + sentenceEndMatch[0].length;
    
    // Count how many words that represents
    const textUpToEnd = textFromTarget.slice(0, endPosition);
    const wordsUpToEnd = textUpToEnd.trim().split(/\s+/).length;
    
    return targetWordIndex + wordsUpToEnd;
  }
  
  // Store scene boundaries to ensure next scene starts where previous ended
  const sceneBoundaries = [];
  
  for (let i = 0; i < targetCount; i++) {
    // For first scene, start at 0. For others, start where previous scene ended
    const startWord = i === 0 ? 0 : sceneBoundaries[i - 1];
    let endWord = (i === targetCount - 1) ? words.length : (i + 1) * wordsPerScene;
    
    // For all scenes except the last, find the nearest sentence ending
    if (i < targetCount - 1) {
      endWord = findSentenceEnd(words, endWord);
      // Make sure we don't go past the end
      if (endWord > words.length) endWord = words.length;
    }
    
    // Store this boundary for next scene to use
    sceneBoundaries.push(endWord);
    
    const sceneText = words.slice(startWord, endWord).join(' ');
    
    // Calculate timestamps
    const startRatio = startWord / words.length;
    const endRatio = endWord / words.length;
    const startTime = startRatio * totalDuration;
    const endTime = endRatio * totalDuration;
    
    // 🆕 Generate AI-powered image prompt WITH character memory
    const imagePrompt = await generateImagePrompt(sceneText, i);
    
    scenes.push({
      number: i + 1,
      text: sceneText,
      startTime: formatTimestamp(startTime),
      endTime: formatTimestamp(endTime),
      startSeconds: startTime,
      endSeconds: endTime,
      imageUrl: null,
      prompt: imagePrompt
    });
    
    console.log(`✅ Scene ${i + 1} prompt generated (${formatTimestamp(startTime)} - ${formatTimestamp(endTime)})`);
  }
  
  return scenes;
}
  // Format seconds to HH:MM:SS.MS
  function formatTimestamp(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }
  
  // =====================================================================
  // IMAGE PROMPT GENERATION - MIGRATED TO src/components/ImageGenerator.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // Generate image prompt from scene text using Claude API (TUBEGEN STYLE)
async function generateImagePrompt(sceneText, sceneIndex) {
  if (window.generateImagePromptNew && typeof window.generateImagePromptNew === 'function') {
    return window.generateImagePromptNew(sceneText, sceneIndex);
  }
  // Fallback to old implementation
  console.log('🎨 Generating ultra-detailed image prompt with Claude API...');
  
  currentSceneIndex = sceneIndex;
  
  // Get the selected style
  const styleName = selectedStyle ? selectedStyle.name : 'Realistic';
  console.log('📌 Using style:', styleName);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/chatgpt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `You are an expert at creating ULTRA-DETAILED, ACCURATE image prompts for ${styleName} style.

SCENE ${sceneIndex + 1} TEXT:
${sceneText}

${Object.keys(characterMemory).length > 0 ? `
PREVIOUS CHARACTERS (keep consistent):
${Object.entries(characterMemory).map(([name, desc]) => `${name}: ${desc}`).join('\n')}
` : ''}

${styleName === 'Naruto Anime' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STYLE: NARUTO ANIME - REAL CHARACTERS ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL RULES:
✅ Use ONLY real Naruto characters from the actual show
✅ Convert real-world settings to Naruto universe locations
✅ Use official Studio Pierrot anime art style
✅ Include character names explicitly in the prompt
✅ NEVER add physical descriptions for real characters (hair color, clothing, etc.)
✅ AI already knows what Hiruzen Sarutobi, Naruto Uzumaki, Minato, etc. look like!

IMPORTANT: If the script mentions "Hiruzen" or "Third Hokage" → Use "Hiruzen Sarutobi" ONLY
If script mentions "Naruto" as a child → Use "young Naruto Uzumaki" ONLY
Do NOT add "with gray hair" or "wearing robes" or any physical descriptors!

CHARACTER MAPPING (match scene role to Naruto character):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Elderly man → Hiruzen Sarutobi (Third Hokage) OR Danzo
- Elderly woman → Tsunade (Fifth Hokage) OR Chiyo
- Middle-aged man → Kakashi Hatake OR Jiraiya OR Minato Namikaze (Fourth Hokage)
- Young adult male → Naruto Uzumaki (adult) OR Sasuke Uchiha
- Young adult female → Sakura Haruno OR Hinata Hyuga OR Kushina Uzumaki
- Child (5-12 years) → Young Naruto Uzumaki OR Young Sasuke OR Young Sakura
- Baby/infant → Baby Naruto (with Nine-Tails seal)
- Authority figure → Current Hokage OR Village elder
- Businessman/lawyer → Ninja council member
- Aggressive person → Rogue ninja OR Orochimaru

LOCATION MAPPING (adapt real settings to Naruto world):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- House/home → Ninja apartment in Konoha village
- Garage/workshop → Ninja weapon workshop OR training grounds equipment area
- Office/bank → Hokage's office OR Village administration building
- Street/outdoor → Konoha village streets with iconic architecture
- Storage unit → Ninja scroll storage room OR weapon vault
- Car → Ninja summoning animal (giant toad, hawk, etc.)
- Hospital → Konoha hospital with medical ninja

PROMPT FORMAT (55-65 words):
"An official Naruto anime illustration showing [CHARACTER NAME like Hiruzen Sarutobi/Naruto Uzumaki/etc.] [specific action from scene], [emotional expression], in [Naruto location like Konoha village/Hokage office/etc.], Studio Pierrot animation style, vibrant anime colors, bold black outlines"

CRITICAL: For real Naruto characters, ONLY use their names - NO physical descriptions needed!
Example: "Hiruzen Sarutobi" NOT "Hiruzen Sarutobi with gray hair and robes"

EXAMPLES OF PERFECT NARUTO PROMPTS:
- "An official Naruto anime illustration showing Tsunade standing shocked in doorway of ninja weapon workshop in Konoha with vintage ninja scrolls behind her, dramatic expression, vibrant colors, Studio Pierrot animation style, bold black outlines"

- "An official Naruto anime illustration showing adult Sakura Haruno sitting at wooden desk with laptop and papers inside traditional Konoha apartment, determined expression, vibrant anime colors, Studio Pierrot style with bold cel-shaded outlines"

- "An official Naruto anime illustration showing Kakashi Hatake confronting a rogue ninja outside Konoha storage building at dawn with police ninja in background, dramatic lighting, official Naruto Shippuden style, bold anime outlines and vibrant cel-shading"

Write your ULTRA-DETAILED Naruto prompt (55-65 words):
` : styleName === 'Game of Thrones' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STYLE: GAME OF THRONES - REAL HBO CHARACTERS ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL RULES:
✅ Use ONLY real Game of Thrones characters from HBO show
✅ Convert modern settings to medieval Westeros locations
✅ Use HBO production quality, dramatic cinematic lighting
✅ Include character names explicitly in the prompt
✅ NEVER add physical descriptions for real characters (hair color, age details, etc.)
✅ AI already knows what Cersei Lannister, Jon Snow, Tyrion, etc. look like!

IMPORTANT: If script mentions a GoT character name → Use name ONLY
Example: "Cersei Lannister" NOT "Cersei Lannister (blonde woman)"

CHARACTER MAPPING (match scene role to GoT character):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Elderly woman → Olenna Tyrell OR Old Nan
- Middle-aged woman → Cersei Lannister OR Catelyn Stark
- Middle-aged man → Tyrion Lannister OR Ned Stark OR Jon Snow (adult)
- Young adult female → Daenerys Targaryen OR Sansa Stark OR Arya Stark
- Young adult male → Jon Snow OR Robb Stark OR Theon Greyjoy
- Child → Young Arya Stark OR Young Bran Stark OR Rickon Stark
- Authority figure → King's Hand OR Lord of Winterfell OR Master of Coin
- Businessman/lawyer → Iron Bank representative OR Maester
- Aggressive person → Joffrey Baratheon OR Ramsay Bolton OR The Mountain

LOCATION MAPPING (adapt settings to Westeros):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- House/home → Castle chambers OR inn quarters
- Garage/workshop → Blacksmith forge OR castle armory
- Office/bank → Iron Bank of Braavos OR castle great hall
- Street/outdoor → King's Landing cobblestone streets OR Winterfell courtyard
- Storage unit → Castle vault OR dragon pit storage
- Car → Horse-drawn carriage OR royal wheelhouse
- Hospital → Maester's healing chambers
- Court → Throne room OR small council chamber

PROMPT FORMAT (55-65 words):
"A cinematic Game of Thrones photograph from HBO showing [CHARACTER NAME like Cersei Lannister/Jon Snow/etc.] [specific action from scene], [emotional expression], in [Westeros location like King's Landing/Winterfell/etc.], dramatic medieval lighting, HBO production quality, authentic costume design"

CRITICAL: For real GoT characters, ONLY use their names - NO physical descriptions!
Example: "Cersei Lannister" NOT "Cersei Lannister (blonde woman in red gown)"

EXAMPLES OF PERFECT GAME OF THRONES PROMPTS:
- "A cinematic Game of Thrones photograph from HBO showing Olenna Tyrell standing frozen in doorway of castle armory with antique swords and shields on walls, dramatic torchlight casting shadows, authentic HBO production quality"

- "A cinematic Game of Thrones photograph from HBO showing Cersei Lannister sitting at ornate desk with parchment scrolls and wine goblet, cold determined expression, inside Red Keep chambers, candlelit medieval atmosphere, authentic HBO cinematography"

- "A cinematic Game of Thrones photograph from HBO showing Tyrion Lannister confronting a knight in armor outside Iron Bank of Braavos at dawn on medieval cobblestone street, dramatic lighting, official HBO cinematography and authentic costume design"

Write your ULTRA-DETAILED Game of Thrones prompt (55-65 words):
` : styleName === 'Stick Style' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STYLE: STICK FIGURE (XKCD STYLE) - SIMPLE BLACK CHARACTERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL RULES:
✅ Stick figures = SIMPLE BLACK LINES (circle head, stick body, stick limbs)
✅ Environment = BRIGHT SOLID COLORS (yellow, blue, green, orange, brown, etc.)
✅ Like XKCD webcomic style - minimalist and clean
✅ NO faces on stick figures (just circle heads)
✅ Keep it EXTREMELY SIMPLE

STICK FIGURE ANATOMY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Head: Simple black circle
- Body: One vertical black line
- Arms: Two black lines from shoulders
- Legs: Two black lines from bottom of body
- NO clothing details, NO facial features
- Use stick figure positioning to show action

ENVIRONMENT COLORS (use vibrant solids):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Sky: Bright blue or light blue
- Sun: Yellow or orange circle
- Water/Ocean: Dark blue or cyan
- Grass: Bright green
- Ground: Brown or tan
- Buildings: Simple colored rectangles (gray, white, beige)
- Cars: Simple colored rectangles (red, blue, etc.)

PROMPT FORMAT (50-60 words):
"A simple minimalist stick figure illustration in xkcd webcomic style showing [number] black stick figure person(s) [specific action], simple black lines with circle heads, NO facial features, set against [detailed colored environment with specific colors], clean minimal art style, colorful background"

EXAMPLES OF PERFECT STICK STYLE PROMPTS:
- "A simple minimalist stick figure illustration in xkcd style showing one black stick figure person standing on an orange and white rectangular boat surrounded by blue water, yellow sun in bright blue sky, clean minimal art with colorful environment"

- "A simple minimalist stick figure illustration in xkcd style showing two black stick figure people sitting at brown rectangular table on green grass ground with bright blue sky and yellow sun, clean minimal webcomic art, black line characters on colorful background"

- "A simple minimalist stick figure illustration in xkcd style showing one black stick figure person walking on brown ground with green grass on sides and bright blue sky with orange setting sun, minimalist webcomic aesthetic with clean black line character"

Write your STICK FIGURE prompt (50-60 words, simple and concise):

⚠️ CHARACTER CONSISTENCY: 
${currentSceneIndex > 0 ? `THIS IS SCENE ${currentSceneIndex + 1} - Keep SAME number of stick figures and SAME environment colors from Scene 1!` : `THIS IS SCENE 1 - Establish number of characters`}

` : styleName === '3D Model' ? `
STYLE: 3D RENDERED MODEL (PIXAR/DISNEY QUALITY)

🎬 CREATE A CINEMATIC 3D SCENE like Pixar/Disney movies!

**ANALYZE THE SCENE:**
✅ ALL characters present and their interactions
✅ Specific setting with environmental details
✅ Key dramatic moment with emotional expressions
✅ Props and objects that tell the story

Format: "A professional 3D rendered illustration of [FULL SCENE with ALL characters interacting] in [SPECIFIC SETTING], Pixar/Disney CGI quality, high resolution 8K, smooth studio lighting, vibrant saturated colors, detailed 3D textures, sharp focus, crystal clear rendering, commercial animation quality"

⚠️ CHARACTER CONSISTENCY:
${currentSceneIndex > 0 && Object.keys(characterMemory).length > 0 ? `
THIS IS SCENE ${currentSceneIndex + 1} - MAINTAIN SAME CHARACTERS!
Previous: ${Object.entries(characterMemory).map(([name, desc]) => `${name}`).join(', ')}

${characterMemory['SPECIES_LOCK'] === 'ANIMAL' ? `
🔒 SPECIES LOCK: ${characterMemory['MAIN_SPECIES']?.toUpperCase() || 'ANIMAL'} ONLY!
Scene 1 = ${characterMemory['MAIN_SPECIES'] || 'animal'}, ALL scenes = SAME ${characterMemory['MAIN_SPECIES'] || 'animal'}!
❌ NO humans! ✅ ONLY the ${characterMemory['MAIN_SPECIES'] || 'animal'}!
` : characterMemory['SPECIES_LOCK'] === 'HUMAN' ? `
🔒 HUMANS ONLY! ❌ NO animals!
` : ''}

✅ Keep SAME characters (DO NOT change species, race, age, gender!)
` : `THIS IS SCENE 1 - Establish characters for future scenes`}

⚠️⚠️⚠️ ACCURACY REQUIREMENTS:
- Emotions: If script says "devastated" → show SAD face! If "laughing" → show HAPPY face!
- Colors: If script says "red dress" → MUST be RED! If "emerald gown" → MUST be GREEN!
- Actions: If script says "hand on arm" → SHOW hand touching arm!
- Props: If script says "champagne fountain" → MUST be visible!
- Ages: If "45-year-old" → look MATURE! If "28-year-old" → look YOUNG!

Example: "A professional 3D rendered illustration of a woman in green watching her husband laugh with another woman beside a glowing fountain at a grand ballroom filled with guests, crystal chandeliers overhead, Pixar CGI quality"

Write your CINEMATIC 3D prompt (55-75 words):
` : styleName === 'Oil Painting' ? `
STYLE: CLASSICAL OIL PAINTING

🎬 CREATE A CINEMATIC CLASSICAL PAINTING like Renaissance/Baroque masters!

**ANALYZE THE SCENE:**
✅ ALL characters and their interactions/positioning
✅ Specific setting and composition
✅ Dramatic lighting and mood
✅ Key emotional moment

Format: "A classical oil painting of [FULL SCENE with ALL characters] in [SPECIFIC SETTING], traditional art style, visible impasto brushstrokes, rich vivid color palette, high detail, sharp focus on faces, Renaissance/Baroque composition, museum quality, masterpiece level detail"

⚠️ CHARACTER CONSISTENCY:
${currentSceneIndex > 0 && Object.keys(characterMemory).length > 0 ? `
THIS IS SCENE ${currentSceneIndex + 1} - MAINTAIN SAME CHARACTERS!
Previous: ${Object.entries(characterMemory).map(([name, desc]) => `${name}`).join(', ')}

${characterMemory['SPECIES_LOCK'] === 'ANIMAL' ? `
🔒 SPECIES LOCK: ${characterMemory['MAIN_SPECIES']?.toUpperCase() || 'ANIMAL'} ONLY!
Scene 1 = ${characterMemory['MAIN_SPECIES'] || 'animal'}, ALL scenes = SAME ${characterMemory['MAIN_SPECIES'] || 'animal'}!
❌ NO humans! ✅ ONLY the ${characterMemory['MAIN_SPECIES'] || 'animal'}!
` : characterMemory['SPECIES_LOCK'] === 'HUMAN' ? `
🔒 HUMANS ONLY! ❌ NO animals!
` : ''}

✅ Keep SAME characters (DO NOT change species, race, age, gender!)
` : `THIS IS SCENE 1 - Establish characters for future scenes`}

⚠️⚠️⚠️ ACCURACY REQUIREMENTS:
- Emotions: If "devastated" → show SAD expression! If "laughing" → show JOY!
- Colors: If "red dress" → RED! If "emerald" → GREEN! If "silver" → SILVER!
- Actions: If "hand on arm" → show touching! If "clutching" → show gripping!
- Props: If "champagne fountain" → must be visible! If "martini" → show glass!
- Ages: Match the exact age from script!

Example: "A classical oil painting of a woman in emerald silk observing her husband conversing with a younger woman at an opulent ballroom gathering under chandeliers, dramatic chiaroscuro lighting, Renaissance composition"

Write your CINEMATIC oil painting prompt (55-75 words):
` : styleName === 'Realistic' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STYLE: ULTRA-REALISTIC PHOTOGRAPHY (TUBEGEN AI QUALITY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 YOUR JOB: Create a CINEMATIC, STORY-DRIVEN image prompt that captures the ENTIRE scene, not just one character!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: ANALYZE THE SCENE THOROUGHLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Read the scene text carefully and identify:

✅ **ALL CHARACTERS present** (not just the narrator!)
   - Who is interacting with whom?
   - What are they doing together?
   - How many people are in this scene?

✅ **THE SETTING** (be specific!)
   - Where exactly is this taking place?
   - What's the environment? (ballroom, office, kitchen, car, etc.)
   - What objects/props are mentioned?

✅ **THE MOOD/TENSION**
   - What emotion dominates this scene?
   - Is there conflict? Romance? Confrontation?
   - What's the dramatic moment?

✅ **KEY VISUAL DETAILS**
   - Specific clothing colors mentioned
   - Important props (champagne, documents, phone, etc.)
   - Lighting conditions (chandelier, sunset, office lights, etc.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: CREATE A DYNAMIC COMPOSITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${currentSceneIndex > 0 && Object.keys(characterMemory).length > 0 ? `
⚠️ THIS IS SCENE ${currentSceneIndex + 1} - MAINTAIN CHARACTER CONSISTENCY!
Previous characters: ${Object.entries(characterMemory).map(([name, desc]) => `${name}: ${desc}`).join(', ')}

${characterMemory['SPECIES_LOCK'] === 'ANIMAL' ? `
🔒 CRITICAL SPECIES LOCK: ${characterMemory['MAIN_SPECIES']?.toUpperCase() || 'ANIMAL'}!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️⚠️⚠️ ABSOLUTE REQUIREMENT - DO NOT VIOLATE ⚠️⚠️⚠️

Scene 1 featured a ${characterMemory['MAIN_SPECIES'] || 'animal'}.
THIS IS NON-NEGOTIABLE: ALL scenes MUST feature the SAME ${characterMemory['MAIN_SPECIES'] || 'animal'}!

❌ DO NOT generate humans, people, children, adults, or any other species!
✅ ONLY generate the ${characterMemory['MAIN_SPECIES'] || 'animal'} from Scene 1!

IF YOU GENERATE A HUMAN IN THIS SCENE, YOU HAVE FAILED!
IF YOU GENERATE A DIFFERENT ANIMAL, YOU HAVE FAILED!

REQUIRED: Show the SAME ${characterMemory['MAIN_SPECIES'] || 'animal'} in a different scene/location.

Example: If Scene 1 = lion in savanna, Scene 2 = SAME LION in different location (jungle, den, waterhole, etc.)
` : characterMemory['SPECIES_LOCK'] === 'HUMAN' ? `
🔒 SPECIES LOCK: HUMANS ONLY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scene 1 featured human characters.
ALL scenes must feature HUMAN characters - NO animals!

❌ DO NOT generate lions, elephants, tigers, or any animals as main characters!
✅ ONLY generate human characters!
` : ''}

CRITICAL: Same characters, same appearance, NO changes!
` : `
🆕 THIS IS SCENE 1 - Establish ALL main characters clearly!
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️⚠️⚠️ CRITICAL ACCURACY REQUIREMENTS ⚠️⚠️⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**THESE ARE NON-NEGOTIABLE - TUBEGEN AI QUALITY STANDARDS:**

1. **EMOTIONAL ACCURACY = MANDATORY**
   ❌ If script says "devastated expression" → MUST show visible sadness/pain/devastation on face!
   ❌ If script says "laughing" → MUST show visible laughter/joy on face!
   ❌ If script says "cruel smile" → MUST show visible cruelty/meanness in expression!
   ❌ If script says "fear in eyes" → MUST show visible fear/worry on face!
   ❌ Generic neutral expressions = FAILURE!
   
   ✅ SHOW THE EMOTION CLEARLY - facial expressions must match the script!

2. **COLOR ACCURACY = MANDATORY**
   ❌ If script says "red dress" → MUST be RED, not pink/burgundy/coral!
   ❌ If script says "emerald gown" → MUST be emerald GREEN, not blue/teal!
   ❌ If script says "silver gown" → MUST be SILVER/grey, not white/gold!
   ❌ Wrong colors = FAILURE!
   
   ✅ EXACT COLOR MATCH - if the script specifies a color, use that EXACT color!

3. **ACTION/INTERACTION ACCURACY = MANDATORY**
   ❌ If script says "hand on his arm" → MUST show hand touching arm!
   ❌ If script says "clutching champagne flute" → MUST show hand gripping glass tightly!
   ❌ If script says "standing too close" → MUST show intimate proximity!
   ❌ If script says "approaching with martini" → MUST show person walking toward with drink!
   ❌ Static poses with no interaction = FAILURE!
   
   ✅ SHOW THE ACTION - if script describes physical interaction, SHOW IT CLEARLY!

4. **PROP/OBJECT ACCURACY = MANDATORY**
   ❌ If script says "champagne fountain" → MUST be visible in the image!
   ❌ If script says "crystal chandeliers" → MUST be visible overhead!
   ❌ If script says "briefcase with documents" → MUST show briefcase open with papers!
   ❌ If script says "martini with three olives" → MUST show martini glass with olives!
   ❌ Missing key props = FAILURE!
   
   ✅ INCLUDE KEY PROPS - if the script mentions an important object, SHOW IT!

5. **AGE ACCURACY = MANDATORY**
   ❌ If script says "45-year-old woman" → MUST look 40-50 years old (mature, not young!)
   ❌ If script says "28-year-old" → MUST look 25-30 years old (young adult!)
   ❌ If script says "73-year-old" → MUST look elderly (70+)!
   ❌ Wrong age appearance = FAILURE!
   
   ✅ AGE MATTERS - show characters at the age specified in the script!

6. **DETAIL SPECIFICITY = MANDATORY**
   ❌ Generic "woman in dress" = FAILURE!
   ❌ Generic "man in suit" = FAILURE!
   ❌ Vague backgrounds = FAILURE!
   
   ✅ SPECIFIC DETAILS - use exact descriptions from the scene:
      - "45-year-old woman in emerald evening gown clutching champagne with devastated expression"
      - "28-year-old blonde in form-fitting red dress with hand on his arm, laughing"
      - "Silver-haired older woman in shimmering gown approaching with cruel smile holding martini"

**REMEMBER: TUBEGEN AI QUALITY = ACCURACY IN EVERY DETAIL!**
Every emotion, every color, every action, every prop must match the script EXACTLY!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**COMPOSITION RULES:**

1. **SHOW INTERACTIONS, NOT PORTRAITS**
   ❌ BAD: "A woman standing alone in a bathroom"
   ✅ GOOD: "A woman watching her husband laugh with another woman at a gala"

2. **INCLUDE ALL RELEVANT CHARACTERS**
   - If scene mentions multiple people, show them ALL
   - Position them to show relationships/tensions
   - Use body language to tell the story

3. **SET THE ENVIRONMENT**
   - Don't just say "room" - be specific!
   - Include props that matter to the story
   - Show the atmosphere (crowded, empty, tense, etc.)

4. **CAPTURE THE MOMENT**
   - What's the KEY dramatic beat?
   - Show action, not static poses
   - Include emotional expressions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: WRITE THE PERFECT PROMPT (55-75 words)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT:
"A realistic photograph of [FULL SCENE with ALL characters, their actions, and interactions] in [SPECIFIC DETAILED SETTING with props and lighting], [TIME OF DAY if relevant], [MOOD/ATMOSPHERE], cinematic composition, photorealistic style"

**TUBEGEN AI STYLE EXAMPLES:**

Example 1 - Multi-character gala scene:
"A realistic photograph of a glittering modern gala ballroom under crystal chandeliers, a 45-year-old woman in an emerald evening gown clutching a champagne flute with a tense expression as she watches her husband laugh with a 28-year-old blonde woman in a red dress beside a sparkling champagne fountain, while an austere older woman in a silver gown looks on nearby"

Example 2 - Two-person confrontation:
"A realistic photograph of a tense private moment in a mansion alcove near a wood-paneled library: a 45-year-old woman in an emerald evening gown faces her husband, a similarly aged man in a dark tuxedo checking his watch with a tight, dismissive expression as ornate old-money furniture and framed oil paintings fill the background, warm chandelier light casting dramatic shadows"

Example 3 - Solo scene with context:
"A realistic photograph of a 45-year-old woman in an emerald evening gown standing in a modern kitchen at night, pouring red wine into a glass while a laptop on the marble counter displays open emails and PDF documents, papers scattered nearby and city lights visible through the window"

**KEY DIFFERENCES FROM OLD STYLE:**
❌ OLD: Single character portrait, no context
✅ NEW: Full scene composition, multiple characters when present, environmental storytelling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOW CREATE YOUR TUBEGEN-QUALITY PROMPT (55-75 words):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Remember:
- Analyze ENTIRE scene, not just narrator
- Include ALL characters present
- Show interactions and relationships
- Set the environment specifically
- Capture the dramatic moment
- Tell a visual story in one frame

Write your CINEMATIC, STORY-DRIVEN realistic prompt:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL OUTPUT FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT ONLY THE FINAL PROMPT - NOTHING ELSE!

❌ DO NOT include:
   - Analysis text like "ANALYZING SCENE:"
   - Bullet points like "✅ CHARACTERS:"
   - Thinking process like "SETTING:" or "KEY MOMENT:"
   - Section headers like "**TUBEGEN-QUALITY PROMPT:**"
   - Separator lines like "━━━━━━"

✅ DO include:
   - ONLY the single-paragraph image prompt
   - Starting with "A professional photograph of..." or "A realistic photograph of..."
   - Ending with professional photography specs (see below)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️⚠️⚠️ PROFESSIONAL PHOTOGRAPHY SPECIFICATIONS ⚠️⚠️⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CRITICAL: Add these photography specs to EVERY prompt for CRYSTAL-CLEAR quality:**

ENDING FORMAT (REQUIRED):
"...[your scene description]..., professional photography, studio lighting, high resolution 8K, sharp focus on faces, vivid colors, high contrast, dramatic lighting, cinematic composition, photorealistic style, commercial photography quality, shot with professional camera, detailed textures, crystal clear image (no visible text)"

**WHY THIS MATTERS:**
- "professional photography" → Makes Ideogram AI use pro camera simulation
- "studio lighting" → Creates dramatic, well-lit faces
- "high resolution 8K" → Forces maximum detail and sharpness
- "sharp focus on faces" → Makes faces crystal clear (most important!)
- "vivid colors" → Makes colors pop (RED is RED, not muted!)
- "high contrast" → Dark backgrounds, bright subjects (cinematic!)
- "dramatic lighting" → Professional movie-quality lighting
- "commercial photography quality" → Magazine/advertisement level
- "detailed textures" → Fabric, jewelry, props all sharp
- "crystal clear image" → No blur, no soft focus

**TUBEGEN AI USES THESE SPECS - NOW YOU DO TOO!** 📸

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXAMPLE CORRECT OUTPUT WITH PROFESSIONAL SPECS:
"A professional photograph of a glittering modern gala ballroom under crystal chandeliers, a 45-year-old woman in an emerald evening gown clutching a champagne flute with a devastated expression as she watches her husband laugh intimately with a stunning 28-year-old blonde woman in a bright red dress beside a sparkling champagne fountain, while a silver-haired older woman in a shimmering gown approaches with a cruel smile holding a martini, professional photography, studio lighting, high resolution 8K, sharp focus on faces, vivid colors, high contrast, dramatic lighting, cinematic composition, photorealistic style, commercial photography quality, crystal clear image (no visible text)"

COMPARE TO OLD FORMAT (INFERIOR):
"A realistic photograph of a gala ballroom... cinematic composition, photorealistic style, sharp details (no visible text)"
❌ This is too simple! Missing professional specs!

NEW FORMAT (TUBEGEN AI QUALITY):
"A professional photograph of a gala ballroom... professional photography, studio lighting, high resolution 8K, sharp focus on faces, vivid colors, high contrast, dramatic lighting, cinematic composition, photorealistic style, commercial photography quality, crystal clear image (no visible text)"
✅ This will generate CRYSTAL CLEAR images!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOW OUTPUT YOUR PROMPT WITH PROFESSIONAL SPECS (JUST THE PROMPT, NO ANALYSIS!):
` : `
STYLE: ${styleName}

🎬 CREATE A CINEMATIC, STORY-DRIVEN IMAGE PROMPT!

**ANALYZE THE SCENE:**
✅ Who are ALL the characters present? (not just the narrator!)
✅ What's the specific setting? (not generic "room")
✅ What interactions/conflicts are happening?
✅ What's the key dramatic moment?
✅ What props/environment details matter?

${currentSceneIndex > 0 && Object.keys(characterMemory).length > 0 ? `
⚠️ THIS IS SCENE ${currentSceneIndex + 1} - MAINTAIN CHARACTER CONSISTENCY!
Previous characters: ${Object.entries(characterMemory).map(([name, desc]) => `${name}: ${desc}`).join(', ')}

${characterMemory['SPECIES_LOCK'] === 'ANIMAL' ? `
🔒 CRITICAL SPECIES LOCK: ${characterMemory['MAIN_SPECIES']?.toUpperCase() || 'ANIMAL'}!
⚠️⚠️⚠️ ABSOLUTE REQUIREMENT ⚠️⚠️⚠️
Scene 1 = ${characterMemory['MAIN_SPECIES'] || 'animal'}
ALL SCENES = SAME ${characterMemory['MAIN_SPECIES'] || 'animal'}!
❌ NO humans! ❌ NO different animals!
✅ ONLY the SAME ${characterMemory['MAIN_SPECIES'] || 'animal'} from Scene 1!
` : characterMemory['SPECIES_LOCK'] === 'HUMAN' ? `
🔒 SPECIES LOCK: HUMANS ONLY!
❌ NO animals as main characters!
✅ ONLY human characters!
` : ''}

CRITICAL:
✅ Keep SAME characters from Scene 1
✅ DO NOT change species (if Scene 1 = lion, ALL scenes = lion!)
✅ DO NOT change race/ethnicity, age, or gender
✅ Maintain consistent appearance
` : `
🆕 THIS IS SCENE 1 - Establish ALL main characters clearly!
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️⚠️⚠️ ACCURACY = QUALITY! ⚠️⚠️⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MATCH THE SCRIPT EXACTLY:
✅ Emotions: "devastated" = SAD face! "laughing" = HAPPY face! "cruel smile" = MEAN expression!
✅ Colors: "red dress" = RED (not pink)! "emerald gown" = GREEN! "silver" = SILVER/GREY!
✅ Actions: "hand on arm" = show touching! "clutching glass" = show gripping tightly!
✅ Props: "champagne fountain" = must be visible! "briefcase with documents" = show it open!
✅ Ages: "45-year-old" = MATURE (40-50)! "28-year-old" = YOUNG (25-30)! Match the age!

**COMPOSITION RULES:**
1. Show INTERACTIONS between characters (not solo portraits)
2. Include ALL relevant people in the scene
3. Set specific environment (not vague "room")
4. Capture the dramatic moment with emotional expressions
5. Include important props and environmental details

**PROMPT FORMAT (55-75 words):**
"A [style] image of [FULL SCENE describing ALL characters, their interactions, and what they're doing] in [SPECIFIC DETAILED SETTING with props], [lighting/time of day], [mood/atmosphere]"

Example multi-character scene:
"A [style] image showing a woman in a green dress watching tensely as her husband laughs with a blonde woman in red beside a champagne fountain at an elegant gala under crystal chandeliers, while an older woman in silver observes nearby"

NOT just: "A woman in a green dress standing in a room"

Write your CINEMATIC, STORY-DRIVEN ${styleName} prompt (55-75 words):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL OUTPUT FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT ONLY THE FINAL PROMPT - NO ANALYSIS OR DEBUG TEXT!

❌ DO NOT include analysis, bullet points, headers, or separators
✅ DO include ONLY the single-paragraph image prompt

EXAMPLE: "A ${styleName} image of [full scene]..."

NOW OUTPUT YOUR PROMPT (JUST THE PROMPT!):
`}`,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    let imagePrompt = data.response || data.content || data.choices?.[0]?.message?.content || data.message || '';
    
    // ⚠️ CRITICAL CLEANUP: Remove ALL analysis/debug text
    // Claude sometimes includes analysis before the prompt, we only want the final prompt!
    
    // Remove opening quotes
    imagePrompt = imagePrompt.replace(/^["']|["']$/g, '').trim();
    
    // If there are multiple paragraphs, take the LAST ONE (the actual prompt)
    const paragraphs = imagePrompt.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) {
      // Find the paragraph that starts with "A realistic photograph" or "An official" or "A professional"
      const promptParagraph = paragraphs.find(p => 
        p.startsWith('A realistic photograph') || 
        p.startsWith('An official') || 
        p.startsWith('A professional') ||
        p.startsWith('A classical') ||
        p.startsWith('A stick figure') ||
        p.match(/^A .+ (image|illustration|photograph|painting)/)
      );
      if (promptParagraph) {
        imagePrompt = promptParagraph;
      } else {
        // Fall back to last paragraph
        imagePrompt = paragraphs[paragraphs.length - 1];
      }
    }
    
    // Remove any lines that look like analysis headers
    imagePrompt = imagePrompt.split('\n')
      .filter(line => {
        const trimmed = line.trim();
        // Remove lines with analysis markers
        if (trimmed.startsWith('**ANALYZING') ||
            trimmed.startsWith('✅') ||
            trimmed.startsWith('❌') ||
            trimmed.startsWith('━━━') ||
            trimmed.startsWith('TUBEGEN-QUALITY') ||
            trimmed.startsWith('**TUBEGEN') ||
            trimmed.startsWith('CHARACTERS:') ||
            trimmed.startsWith('SETTING:') ||
            trimmed.startsWith('KEY MOMENT:') ||
            trimmed.startsWith('MOOD:') ||
            trimmed === '') {
          return false;
        }
        return true;
      })
      .join(' ')
      .trim();
    
    // Remove markdown bold markers
    imagePrompt = imagePrompt.replace(/\*\*/g, '');
    
    // Remove any remaining section headers
    imagePrompt = imagePrompt.replace(/^(ANALYZING SCENE|CHARACTERS|SETTING|KEY MOMENT|MOOD|TUBEGEN-QUALITY PROMPT):/gi, '');
    
    // Extract and save character descriptions for future scenes
    extractAndSaveCharacters(sceneText, imagePrompt);
    
    // Ensure it ends properly with professional photography specs
    if (!imagePrompt.includes('(no visible text)')) {
      // Remove any old-style endings first
      imagePrompt = imagePrompt.replace(/,?\s*(cinematic composition|photorealistic style|sharp details).*$/i, '');
      
      // Add professional photography specs ending
      imagePrompt = imagePrompt.trim() + ', professional photography, studio lighting, high resolution 8K, sharp focus on faces, vivid colors, high contrast, dramatic lighting, cinematic composition, photorealistic style, commercial photography quality, crystal clear image (no visible text)';
    }
    
    console.log('✅ Generated professional quality prompt:', imagePrompt);
    return imagePrompt;
  } catch (error) {
    console.warn('⚠️ Claude prompt generation failed, using smart fallback:', error.message);
    
    // SMART FALLBACK: Extract basic details from scene text
    const firstSentences = sceneText.slice(0, 800);
    
    // Find character names (capitalized words)
    const characters = [];
    const nameMatches = firstSentences.match(/\b[A-Z][a-z]+\b/g) || [];
    nameMatches.forEach(name => {
      if (!['The', 'A', 'An', 'I', 'He', 'She', 'They', 'It'].includes(name) && !characters.includes(name)) {
        characters.push(name);
      }
    });
    
    // Find setting keywords
    let setting = 'indoor setting';
    if (firstSentences.match(/bank|office|conference/i)) setting = 'bank conference room';
    if (firstSentences.match(/car|vehicle|driving/i)) setting = 'car interior';
    if (firstSentences.match(/outdoor|street|park|forest/i)) setting = 'outdoor location';
    if (firstSentences.match(/home|house|kitchen|bedroom/i)) setting = 'home interior';
    
    // Find age mentions
    const ageMatch = firstSentences.match(/(\d+)[-\s]year[-\s]old/i);
    const age = ageMatch ? ageMatch[1] : '';
    
    // Build medium-shot prompt showing upper body
    const mainChar = characters[0] || 'a person';
    const secondChar = characters[1] || null;
    const ageDesc = age ? `${age}-year-old ` : '';
    
    let mediumShotPrompt = `A realistic photograph of a ${ageDesc}${mainChar} with expressive face`;
    
    // Add action if found
    if (firstSentences.match(/grip|hold/i)) mediumShotPrompt += ' holding something';
    if (firstSentences.match(/sit|seat/i)) mediumShotPrompt += ' seated';
    if (firstSentences.match(/stand/i)) mediumShotPrompt += ' standing';
    
    // Add second character
    if (secondChar) {
      mediumShotPrompt += `, with ${secondChar} nearby`;
    }
    
    // Add setting naturally
    mediumShotPrompt += ` in ${setting}, natural lighting, cinematic composition, photorealistic style, sharp details (no visible text)`;
    
    return mediumShotPrompt;
  }
}


  // =====================================================================
  // CHARACTER EXTRACTION - MIGRATED TO src/components/ImageGenerator.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // 🆕 NEW FUNCTION: Extract and save character descriptions (ENHANCED v2.0)
function extractAndSaveCharacters(sceneText, generatedPrompt) {
  if (window.extractAndSaveCharactersNew && typeof window.extractAndSaveCharactersNew === 'function') {
    return window.extractAndSaveCharactersNew(sceneText, generatedPrompt);
  }
  // Fallback to old implementation
  // 🔒 CRITICAL: SPECIES DETECTION AND LOCKING
  // If Scene 1 has a lion, ALL scenes must have the SAME lion!
  // If Scene 1 has a human, ALL scenes must have the SAME human!
  
  if (currentSceneIndex === 0) {
    // SCENE 1: Detect the species from the generated prompt
    const promptLower = generatedPrompt.toLowerCase();
    
    // Check for animals (lion, elephant, tiger, etc.)
    const animalSpecies = [
      'lion', 'lioness', 'elephant', 'tiger', 'leopard', 'cheetah',
      'wolf', 'bear', 'fox', 'deer', 'giraffe', 'zebra', 'monkey',
      'dog', 'cat', 'bird', 'eagle', 'hawk', 'owl', 'horse', 'rabbit'
    ];
    
    let detectedSpecies = null;
    for (const animal of animalSpecies) {
      if (promptLower.includes(animal)) {
        detectedSpecies = animal;
        break;
      }
    }
    
    if (detectedSpecies) {
      // 🦁 ANIMAL STORY DETECTED!
      characterMemory['MAIN_SPECIES'] = detectedSpecies;
      characterMemory['SPECIES_LOCK'] = 'ANIMAL';
      console.log(`🦁 SPECIES LOCKED: ${detectedSpecies.toUpperCase()} - ALL scenes will feature this animal!`);
      
      // Extract animal description from prompt
      const animalDescPattern = new RegExp(`(a[^,\\.]*${detectedSpecies}[^,\\.]{0,100})`, 'i');
      const animalMatch = generatedPrompt.match(animalDescPattern);
      if (animalMatch) {
        characterMemory['MainCharacter'] = animalMatch[1].trim();
        console.log(`📝 Animal character saved: ${characterMemory['MainCharacter']}`);
      }
    } else if (promptLower.includes('person') || promptLower.includes('man') || 
               promptLower.includes('woman') || promptLower.includes('child') ||
               promptLower.match(/\d+[-\s]year[-\s]old/)) {
      // 👤 HUMAN STORY DETECTED!
      characterMemory['SPECIES_LOCK'] = 'HUMAN';
      console.log(`👤 SPECIES LOCKED: HUMAN - ALL scenes will feature human characters!`);
    }
  }
  
  // Extract names (capitalized words that appear multiple times)
  const namePattern = /\b([A-Z][a-z]+)\b/g;
  const names = {};
  let match;
  
  while ((match = namePattern.exec(sceneText)) !== null) {
    const name = match[1];
    // Skip common words and pronouns
    if (['The', 'This', 'That', 'She', 'He', 'They', 'I', 'It', 'We', 'You', 'A', 'An', 'In', 'On', 'At'].includes(name)) continue;
    names[name] = (names[name] || 0) + 1;
  }
  
  // Save frequently mentioned names (appeared 2+ times OR update existing)
  Object.entries(names).forEach(([name, count]) => {
    // Save if appeared 2+ times, OR if it's already in memory (to update/enhance description)
    const shouldSave = count >= 2 || characterMemory[name];
    
    if (shouldSave) {
      // Try multiple extraction strategies for better accuracy
      const nameLower = name.toLowerCase();
      
      // Strategy 1: Find age-based descriptions (e.g., "73-year-old woman named Cordelia")
      const ageDescPattern = new RegExp(`(\\d+[\\s-]year[\\s-]old[^,\\.]*\\b${nameLower}\\b[^,\\.]*)`, 'i');
      const ageMatch = generatedPrompt.match(ageDescPattern);
      
      // Strategy 2: Find descriptive phrases with name
      const contextPattern = new RegExp(`([^,\\.]{10,80}\\b${nameLower}\\b[^,\\.]{10,80})`, 'i');
      const contextMatch = generatedPrompt.match(contextPattern);
      
      // Strategy 3: Find "character in clothing" patterns
      const clothingPattern = new RegExp(`(${nameLower}[^,\\.]*(?:wearing|in a|in an|with)[^,\\.]{10,50})`, 'i');
      const clothingMatch = generatedPrompt.match(clothingPattern);
      
      // Use the best match (prefer age descriptions first for accuracy)
      let bestDescription = null;
      if (ageMatch && ageMatch[1]) {
        bestDescription = ageMatch[1].trim();
      } else if (clothingMatch && clothingMatch[1]) {
        bestDescription = clothingMatch[1].trim();
      } else if (contextMatch && contextMatch[1]) {
        bestDescription = contextMatch[1].trim();
      }
      
      // Only update if we found a better/first description
      if (bestDescription) {
        // If character exists, only update if new description is longer/more detailed
        if (!characterMemory[name] || bestDescription.length > characterMemory[name].length) {
          characterMemory[name] = bestDescription;
          console.log(`📝 Character saved: ${name} → ${characterMemory[name].substring(0, 60)}...`);
        }
      }
    }
  });
}

  // =====================================================================
  // IMAGE GENERATION - MIGRATED TO src/components/ImageGenerator.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // Generate images using AI33.pro API - PROGRESSIVE MODE
  let currentImageIndex = 0;
  let totalImagesToGenerate = 0;
  
  async function generateImagesForScript(scriptText, settings) {
    if (window.generateImagesForScriptNew && typeof window.generateImagesForScriptNew === 'function') {
      return window.generateImagesForScriptNew(scriptText, settings);
    }
    // Fallback to old implementation
    const scenes = await parseScriptIntoScenes(scriptText, settings.count);
    generatedScenes = scenes;
    currentImageIndex = 0;
    totalImagesToGenerate = scenes.length;
    
    const container = document.getElementById('generatedScenesContainer');
    const loading = document.getElementById('scenesLoading');
    
    // Show initial display with all scenes
    displayGeneratedScenes(scenes);
    
    // Show loading for first image only (with null check)
    if (loading) {
      loading.innerHTML = `
        <div class="text-center mb-6">
          <div class="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400 font-semibold">Generating first image...</p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Image 1 of ${settings.count}</p>
        </div>
      `;
      loading.classList.remove('hidden');
    }
    
    // Generate ONLY the first image
    try {
      console.log(`\n🎨 Generating first image (1/${scenes.length})...`);
      const imageUrl = await callOpenAIAPI(scenes[0].prompt, settings);
      scenes[0].imageUrl = imageUrl;
      console.log(`✅ First image completed`);
      
      // Update display after first image
      displayGeneratedScenes(scenes);
      currentImageIndex = 1; // Move to next
      
    } catch (error) {
      console.error(`❌ Error generating first image:`, error);
      scenes[0].imageUrl = 'error';
      scenes[0].error = error.message;
      displayGeneratedScenes(scenes);
    }
    
    // Hide loading (with null check)
    if (loading) {
      loading.classList.add('hidden');
    }
    
    // Show "Generate Next" button if more images to generate
    if (currentImageIndex < totalImagesToGenerate) {
      showGenerateNextButton();
    }
    
    // Store project data
    currentProjectData = {
      title: document.getElementById('video-title')?.value || 'Untitled',
      script: scriptText,
      scenes: scenes,
      settings: settings,
      timestamp: new Date().toISOString()
    };
  }
  
  // =====================================================================
  // GENERATE REMAINING IMAGES - MIGRATED TO src/components/ImageGenerator.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // Generate ALL remaining images at once
  async function generateRemainingImages() {
    if (window.generateRemainingImagesNew && typeof window.generateRemainingImagesNew === 'function') {
      return window.generateRemainingImagesNew();
    }
    // Fallback to old implementation
    console.log('🎬 generateRemainingImages called');
    console.log('   generatedScenes:', generatedScenes);
    console.log('   currentImageIndex:', currentImageIndex);
    console.log('   totalImagesToGenerate:', totalImagesToGenerate);
    
    if (!generatedScenes || currentImageIndex >= totalImagesToGenerate) {
      console.error('❌ Cannot generate: No scenes or already at end');
      alert('No more images to generate!');
      return;
    }
    
    const loading = document.getElementById('scenesLoading');
    const settings = currentProjectData.settings;
    const remainingCount = totalImagesToGenerate - currentImageIndex;
    
    console.log(`✅ Starting generation of ${remainingCount} remaining images...`);
    
    // Hide the button immediately
    hideGenerateNextButton();
    
    // Show loading (with null check)
    if (loading) {
      loading.innerHTML = `
        <div class="text-center mb-6">
          <div class="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400 font-semibold text-lg">Generating ${remainingCount} images...</p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few moments</p>
          <div id="generationProgress" class="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span class="font-semibold">0</span> / ${remainingCount} completed
          </div>
        </div>
      `;
      loading.classList.remove('hidden');
    }
    
    // Generate all remaining images
    let completed = 0;
    const progressElement = document.getElementById('generationProgress');
    
    for (let i = currentImageIndex; i < totalImagesToGenerate; i++) {
      try {
        console.log(`
🎨 Generating image ${i + 1}/${totalImagesToGenerate}...`);
        const imageUrl = await callOpenAIAPI(generatedScenes[i].prompt, settings);
        generatedScenes[i].imageUrl = imageUrl;
        console.log(`✅ Image ${i + 1} completed`);
        
        completed++;
        if (progressElement) {
          progressElement.innerHTML = `<span class="font-semibold">${completed}</span> / ${remainingCount} completed`;
        }
        
        // Update display after each image so user can see progress
        displayGeneratedScenes(generatedScenes);
        
      } catch (error) {
        console.error(`❌ Error generating image ${i + 1}:`, error);
        generatedScenes[i].imageUrl = 'error';
        generatedScenes[i].error = error.message;
        
        completed++;
        if (progressElement) {
          progressElement.innerHTML = `<span class="font-semibold">${completed}</span> / ${remainingCount} completed (1 failed)`;
        }
        
        displayGeneratedScenes(generatedScenes);
      }
    }
    
    // Hide loading (with null check)
    if (loading) {
      loading.classList.add('hidden');
    }
    currentImageIndex = totalImagesToGenerate;
    
    alert(`🎉 All ${remainingCount} images generated!`);
  }
  
  // Show "Generate X More Images" button
  function showGenerateNextButton() {
    const remainingCount = totalImagesToGenerate - currentImageIndex;
    
    // Find the main container
    const container = document.getElementById('generatedScenesContainer');
    
    if (!container) return;
    
    // Check if button already exists
    let btn = document.getElementById('generateNextBtn');
    
    if (!btn) {
      // Create button as separate element in the main container
      btn = document.createElement('div');
      btn.id = 'generateNextBtn';
      btn = document.createElement('div');
btn.id = 'generateNextBtn';
btn.className = 'py-1 pr-5 text-right';  // ✅ Changed py-6 to py-3
btn.innerHTML = `
  <button onclick="generateRemainingImages()" 
          class="px-6 py-2 bg-amber-700 hover:bg-amber-800 
                 text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl 
                 transition-all transform hover:scale-[1.02] 
                 flex items-center gap-1 ml-auto">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
    Generate ${remainingCount} More Image${remainingCount > 1 ? 's' : ''}
  </button>
  <p class="text-sm text-gray-500 dark:text-gray-400 text-right mt-1">
    Click to generate all remaining images at once
  </p>
`;
      
      // Append to the main container (after all scenes)
      container.appendChild(btn);
    } else {
      // Update existing button
      btn.classList.remove('hidden');
      const buttonEl = btn.querySelector('button');
      if (buttonEl) {
        buttonEl.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Generate ${remainingCount} More Image${remainingCount > 1 ? 's' : ''}
        `;
      }
    }
  }
  
  // Hide "Generate More Images" button
  function hideGenerateNextButton() {
    if (window.hideGenerateNextButtonNew && typeof window.hideGenerateNextButtonNew === 'function') {
      return window.hideGenerateNextButtonNew();
    }
    // Fallback to old implementation
    const btn = document.getElementById('generateNextBtn');
    if (btn) btn.classList.add('hidden');
  }

  
  // Call AI33.pro Image Generation API
  // =====================================================================
  // IDEogram API CALL - MIGRATED TO src/components/ImageGenerator.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
 async function callOpenAIAPI(prompt, settings) {
   if (window.callIdeogramAPINew && typeof window.callIdeogramAPINew === 'function') {
     return window.callIdeogramAPINew(prompt, settings);
   }
   // Fallback to old implementation
 
   // ✅ V3 Optimization: Use the detailed prompt as-is
   // The new Claude-generated prompts are already complete with all details
   let fullPrompt = prompt;
   
   console.log('🎨 Generating image with Ideogram V3 API...');
   console.log('Detailed Prompt (first 200 chars):', prompt.substring(0, 200) + '...');
   console.log('Style:', settings.style.name || 'Realistic');
   console.log('Quality:', settings.quality);
   console.log('Aspect Ratio:', settings.aspectRatio);
 
   // ✅ Map quality to Ideogram V3 rendering speeds with CORRECT PRICES
   // Standard → V3 TURBO ($0.06/image - fast)
   // Better → V3 DEFAULT ($0.12/image - balanced) 
   // Best → V3 QUALITY ($0.18/image - best quality)
   let renderingSpeed = 'TURBO'; // Default: Fast generation
   
   if (settings.quality === 'standard') {
     renderingSpeed = 'TURBO'; // Fast - $0.06
   } else if (settings.quality === 'better') {
     renderingSpeed = 'DEFAULT'; // Balanced - $0.12
   } else if (settings.quality === 'best') {
     renderingSpeed = 'QUALITY'; // Best quality - $0.18
   }
   
   console.log(`📊 Using Ideogram V3 with Speed: ${renderingSpeed}`);

   // Ideogram V3 API call via backend WITH RETRY LOGIC
   let retryCount = 0;
   const maxRetries = 3;
   let lastError = null;
   
   while (retryCount < maxRetries) {
     try {
       const backendUrl = `${API_BASE_URL}/api/generate-image`;
       console.log(`🌐 Backend URL: ${backendUrl} (Attempt ${retryCount + 1}/${maxRetries})`);
       console.log('📤 Sending request to BACKEND → Ideogram V3');
       
       const response = await fetch(backendUrl, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           prompt: fullPrompt,
           aspectRatio: settings.aspectRatio || '16:9',
           renderingSpeed: renderingSpeed,
           styleType: settings.imageStyle === 'realistic' ? 'REALISTIC' : 
                      settings.imageStyle === '3d model' ? 'RENDER_3D' : 
                      settings.imageStyle === 'oil painting' || settings.imageStyle === 'naruto anime' || settings.imageStyle === 'game of thrones' ? 'DESIGN' : 
                      'REALISTIC'
         })
       });
   
       if (!response.ok) {
         const errorData = await response.json();
         console.error('❌ Ideogram V3 API error:', response.status, errorData);
         throw new Error(`Ideogram API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
       }
   
       const data = await response.json();
       console.log('✅ Ideogram V3 Full Response:', JSON.stringify(data, null, 2));
       console.log('🔍 Response keys:', Object.keys(data));
       console.log('🔍 Has data property?', 'data' in data);
       
       // Process the data to extract image URL
       if (data.data) {
         console.log('🔍 data.data is array?', Array.isArray(data.data));
         console.log('🔍 data.data length:', data.data.length);
         if (data.data[0]) {
           console.log('🔍 First item keys:', Object.keys(data.data[0]));
           console.log('🔍 First item:', JSON.stringify(data.data[0]));
         }
       }
       
       // Ideogram V3 returns image URL in data array
       if (data.data && data.data[0] && data.data[0].url) {
         console.log('✅ Image generated successfully:', data.data[0].url);
         return data.data[0].url;
       } else {
         console.error('❌ Unexpected response format:', data);
         console.error('❌ Expected: data.data[0].url');
         console.error('❌ Got:', {
           hasData: !!data.data,
           hasFirstItem: !!(data.data && data.data[0]),
           hasUrl: !!(data.data && data.data[0] && data.data[0].url)
         });
         throw new Error('No image URL found in Ideogram response');
       }
       
     } catch (error) {
       lastError = error;
       retryCount++;
       
       // Check if it's an SSL error
       if (error.message && error.message.includes('SSL') || error.message.includes('ECONNRESET')) {
         console.warn(`⚠️ SSL/Connection error (attempt ${retryCount}/${maxRetries}):`, error.message);
         
         if (retryCount < maxRetries) {
           // Wait before retrying (exponential backoff)
           const waitTime = 1000 * Math.pow(2, retryCount - 1); // 1s, 2s, 4s
           console.log(`⏳ Waiting ${waitTime}ms before retry...`);
           await new Promise(resolve => setTimeout(resolve, waitTime));
           continue; // Try again
         }
       }
       
       // If not SSL error or max retries reached, throw
       throw error;
     }
   }
   
   // If we get here, all retries failed
   throw lastError || new Error('Image generation failed after retries');
}
 
 // Map style names to Ideogram style types
 function getIdeogramStyleType(styleName) {
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
 }
 
 // Poll for image generation result (NOT NEEDED for Ideogram - it returns immediately)
 // NOTE: This function is deprecated - OpenAI DALL-E returns images immediately
 async function pollForImageResult(taskId, maxAttempts = 30) {
   console.log('📊 Polling for image result, task_id:', taskId);
   console.warn('This polling function is deprecated and not used with OpenAI DALL-E');
   return null;
 }
  
  // Display generated scenes
  function displayGeneratedScenes(scenes) {
    const container = document.getElementById('generatedScenesContainer');
    const loading = document.getElementById('scenesLoading');
    
    // ✅ NULL CHECK - Don't try to access classList if element doesn't exist
    if (!container) {
      console.error('❌ generatedScenesContainer element not found in HTML!');
      return;
    }
    
    if (loading) {
      loading.classList.add('hidden');
    } else {
      console.warn('⚠️ scenesLoading element not found - skipping hide');
    }
    
    // Separate first scene and remaining scenes
    const firstScene = scenes[0];
    const remainingScenes = scenes.slice(1);
    
    let html = '';
    
    // === SCRIPT + AUDIO SECTION (Like Reference Screenshots) ===
    if (currentProjectData) {
      const wordCount = currentProjectData.script ? currentProjectData.script.split(/\s+/).length : 0;
      const hasAudio = generatedAudioUrl && generatedAudioUrl !== '';
      
      html += `
        <div class="mb-8">
          <div class="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
            <!-- Header with Icons -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Script</h2>
                
                <!-- Audio Player (if available) -->
                ${hasAudio ? `
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <audio controls class="h-8" style="max-width: 320px;">
                      <source src="${generatedAudioUrl}" type="audio/mpeg">
                    </audio>
                  </div>
                ` : ''}
              </div>
              
              <!-- Copy & Download Buttons -->
              <div class="flex items-center gap-2">
                <button onclick="copyScriptToClipboard(this)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Copy Script">
                  <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                  </svg>
                </button>
                <button onclick="downloadScriptFile()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Download Script">
                  <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Script Content - Collapsible -->
            <div id="scriptContentCollapse" class="px-6 py-4 max-h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900 hidden">
              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">${currentProjectData.script || ''}</p>
            </div>
            
            <!-- Toggle Button -->
            <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button onclick="toggleScriptVisibility()" class="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2">
                <svg id="scriptToggleIcon" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                <span id="scriptToggleText">Show Full Script</span>
              </button>
            </div>
            
            <!-- Footer with Word Count -->
            <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Word Count: ${wordCount}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // === FIRST IMAGE PREVIEW (Medium Size, Side-by-Side) ===
    if (firstScene) {
      html += `
        <div class="mb-8">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">First Image Preview</h2>
          <div class="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-4">
            <!-- Side-by-Side Layout -->
            <div class="flex flex-col lg:flex-row gap-4">
              <!-- Image Container (Left Side, Compact Size) -->
              <div class="relative flex-shrink-0 w-full lg:w-2/5 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden" style="aspect-ratio: 16/9;">
                ${firstScene.imageUrl && firstScene.imageUrl !== 'error' 
                  ? `<img src="${firstScene.imageUrl}" 
                          alt="Scene ${firstScene.number}" 
                          class="w-full h-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
                          onclick="viewSceneDetail(0)">`
                  : firstScene.imageUrl === 'error'
                  ? `<div class="w-full h-full flex flex-col items-center justify-center text-red-500">
                       <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                       </svg>
                       <p class="text-sm font-semibold">Failed to generate</p>
                     </div>`
                  : `<div class="w-full h-full flex flex-col items-center justify-center">
                       <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                       <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Generating...</p>
                     </div>`
                }
              </div>
              
              <!-- Content (Right Side) -->
              <div class="flex-1 min-w-0">
                <div class="mb-4">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Scene ${firstScene.number} (${firstScene.startTime} - ${firstScene.endTime})</h3>
                </div>
                
                <!-- Script Text (What the image covers) - Collapsible -->
                <div class="mb-4">
                  <button onclick="toggleFirstSceneText()" class="w-full text-left flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm mb-2">
                    <svg id="firstSceneTextIcon" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                    <span id="firstSceneTextToggle">Show Scene Text</span>
                  </button>
                  <div id="firstSceneTextContent" class="hidden">
                    <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">${firstScene.text}</p>
                  </div>
                </div>
                
                <!-- Action Buttons -->
                ${firstScene.imageUrl && firstScene.imageUrl !== 'error' ? `
                  <div class="flex flex-wrap gap-2 mt-4">
                    <button onclick="openRegenerateModal(0)" 
                            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm hover:shadow-md">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      REGENERATE
                    </button>
                    
                    <button onclick="downloadScene(0)" 
                            class="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm hover:shadow-md">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      DOWNLOAD IMAGE
                    </button>
                  </div>
                ` : firstScene.imageUrl === 'error' ? `
                  <button onclick="openRegenerateModal(0)" 
                          class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    REGENERATE
                  </button>
                ` : ''}
                
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // === ALL OTHER SCENES (Same Layout as Scene 1) ===
    if (remainingScenes.length > 0) {
      remainingScenes.forEach((scene, idx) => {
        const sceneIndex = idx + 1; // Actual index in full array
        
        html += `
          <div class="mb-8">
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-4">
              <!-- Side-by-Side Layout (Same as Scene 1) -->
              <div class="flex flex-col lg:flex-row gap-4">
                <!-- Image Container (Left Side) -->
                <div class="relative flex-shrink-0 w-full lg:w-2/5 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden" style="aspect-ratio: 16/9;">
                  ${scene.imageUrl && scene.imageUrl !== 'error' 
                    ? `<img src="${scene.imageUrl}" 
                            alt="Scene ${scene.number}" 
                            class="w-full h-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
                            onclick="viewSceneDetail(${sceneIndex})">`
                    : scene.imageUrl === 'error'
                    ? `<div class="w-full h-full flex flex-col items-center justify-center text-red-500">
                         <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                         </svg>
                         <p class="text-sm font-semibold">Failed to generate</p>
                       </div>`
                    : `<div class="w-full h-full flex flex-col items-center justify-center">
                         <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                         <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Generating...</p>
                       </div>`
                  }
                </div>
                
                <!-- Content (Right Side) -->
                <div class="flex-1 min-w-0">
                  <div class="mb-4">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Scene ${scene.number} (${scene.startTime} - ${scene.endTime})</h3>
                  </div>
                  
                  <!-- Show Scene Text Dropdown (Same as Scene 1) -->
                  <div class="mb-4">
                    <button onclick="toggleSceneText(${sceneIndex})" class="w-full text-left flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm mb-2">
                      <svg id="sceneTextIcon${sceneIndex}" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                      <span id="sceneTextToggle${sceneIndex}">Show Scene Text</span>
                    </button>
                    <div id="sceneTextContent${sceneIndex}" class="hidden">
                      <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">${scene.text}</p>
                    </div>
                  </div>
                  
                  <!-- Action Buttons -->
                  ${scene.imageUrl && scene.imageUrl !== 'error' ? `
                    <div class="flex flex-wrap gap-2 mt-4">
                      <button onclick="openRegenerateModal(${sceneIndex})" 
                              class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm hover:shadow-md">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        REGENERATE
                      </button>
                      
                      <button onclick="downloadScene(${sceneIndex})" 
                              class="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm hover:shadow-md">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        DOWNLOAD IMAGE
                      </button>
                    </div>
                  ` : scene.imageUrl === 'error' ? `
                    <button onclick="openRegenerateModal(${sceneIndex})" 
                            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm hover:shadow-md">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      REGENERATE
                    </button>
                  ` : ''}
                  
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    container.innerHTML = html;
  }
  
  // Toggle all remaining scenes at once (Expand All / Collapse All)
  function toggleAllRemainingScenes() {
    const scenes = document.querySelectorAll('[id^="sceneDetails"]');
    const icons = document.querySelectorAll('[id^="sceneToggleIcon"]');
    const expandText = document.getElementById('expandAllText');
    
    // Check if any are hidden
    const anyHidden = Array.from(scenes).some(s => s.classList.contains('hidden'));
    
    scenes.forEach((scene, idx) => {
      if (anyHidden) {
        scene.classList.remove('hidden');
        if (icons[idx]) icons[idx].style.transform = 'rotate(180deg)';
      } else {
        scene.classList.add('hidden');
        if (icons[idx]) icons[idx].style.transform = 'rotate(0deg)';
      }
    });
    
    expandText.textContent = anyHidden ? 'Collapse All' : 'Expand All';
  }
  
  // Toggle individual scene details
  function toggleScene(index) {
    const details = document.getElementById(`sceneDetails${index}`);
    const icon = document.getElementById(`sceneToggleIcon${index}`);
    
    if (details.classList.contains('hidden')) {
      details.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
    } else {
      details.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
    }
  }

  
  // Regenerate a single scene
  // =====================================================================
  // TOGGLE SCRIPT VISIBILITY - MIGRATED TO src/components/ImageModal.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // Toggle script visibility
  function toggleScriptVisibility() {
    if (window.toggleScriptVisibilityNew && typeof window.toggleScriptVisibilityNew === 'function') {
      return window.toggleScriptVisibilityNew();
    }
    // Fallback to old implementation
    const scriptContent = document.getElementById('scriptContentCollapse');
    const toggleIcon = document.getElementById('scriptToggleIcon');
    const toggleText = document.getElementById('scriptToggleText');
    
    if (scriptContent && toggleIcon && toggleText) {
      if (scriptContent.classList.contains('hidden')) {
        // Show script
        scriptContent.classList.remove('hidden');
        toggleIcon.style.transform = 'rotate(180deg)';
        toggleText.textContent = 'Hide Full Script';
      } else {
        // Hide script
        scriptContent.classList.add('hidden');
        toggleIcon.style.transform = 'rotate(0deg)';
        toggleText.textContent = 'Show Full Script';
      }
    }
  }
  
  // =====================================================================
  // TOGGLE FIRST SCENE TEXT - MIGRATED TO src/components/ImageModal.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // Toggle first scene text visibility
  function toggleFirstSceneText() {
    if (window.toggleFirstSceneTextNew && typeof window.toggleFirstSceneTextNew === 'function') {
      return window.toggleFirstSceneTextNew();
    }
    // Fallback to old implementation
    const textContent = document.getElementById('firstSceneTextContent');
    const toggleIcon = document.getElementById('firstSceneTextIcon');
    const toggleText = document.getElementById('firstSceneTextToggle');
    
    if (textContent && toggleIcon && toggleText) {
      if (textContent.classList.contains('hidden')) {
        // Show text
        textContent.classList.remove('hidden');
        toggleIcon.style.transform = 'rotate(180deg)';
        toggleText.textContent = 'Hide Scene Text';
      } else {
        // Hide text
        textContent.classList.add('hidden');
        toggleIcon.style.transform = 'rotate(0deg)';
        toggleText.textContent = 'Show Scene Text';
      }
    }
  }
  
  // Toggle Scene Text for Scene 2+ (same logic as Scene 1)
  function toggleSceneText(index) {
    const textContent = document.getElementById(`sceneTextContent${index}`);
    const toggleIcon = document.getElementById(`sceneTextIcon${index}`);
    const toggleText = document.getElementById(`sceneTextToggle${index}`);
    
    if (textContent && toggleIcon && toggleText) {
      if (textContent.classList.contains('hidden')) {
        // Show text
        textContent.classList.remove('hidden');
        toggleIcon.style.transform = 'rotate(180deg)';
        toggleText.textContent = 'Hide Scene Text';
      } else {
        // Hide text
        textContent.classList.add('hidden');
        toggleIcon.style.transform = 'rotate(0deg)';
        toggleText.textContent = 'Show Scene Text';
      }
    }
  }
  
  // =====================================================================
  // IMAGE REGENERATION - MIGRATED TO src/components/ImageModal.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  async function regenerateScene(index) {
    if (window.regenerateSceneNew && typeof window.regenerateSceneNew === 'function') {
      return window.regenerateSceneNew(index);
    }
    // Fallback to old implementation
    // 🚨 FIX #3: Better error messages for regenerate
    console.log('🔍 DEBUG regenerateScene called with index:', index);
    console.log('🔍 DEBUG generatedScenes:', generatedScenes);
    console.log('🔍 DEBUG generatedScenes length:', generatedScenes ? generatedScenes.length : 'null/undefined');
    
    if (!generatedScenes) {
      console.error('❌ Cannot regenerate: generatedScenes array is null/undefined');
      alert('⚠️ No scenes available. Please generate images first before trying to regenerate.');
      return;
    }
    
    // 🔧 FIX: Check if index is within bounds (not if scene is truthy)
    if (index < 0 || index >= generatedScenes.length) {
      console.error(`❌ Cannot regenerate: Index ${index} out of bounds (array length: ${generatedScenes.length})`);
      alert(`⚠️ Scene ${index + 1} not found. Available scenes: ${generatedScenes.length}`);
      return;
    }
    
    const scene = generatedScenes[index];
    if (!scene || typeof scene !== 'object') {
      console.error(`❌ Cannot regenerate: Scene at index ${index} is null/undefined or not an object`);
      console.error('Scene value:', scene);
      console.error('Array contents:', JSON.stringify(generatedScenes, null, 2));
      alert(`⚠️ Scene ${index + 1} data is missing. Please try regenerating all images.`);
      return;
    }
    
    if (!scene.prompt) {
      console.error(`❌ Cannot regenerate: Scene at index ${index} has no prompt`);
      alert(`⚠️ Scene ${index + 1} has no prompt. Please try regenerating all images.`);
      return;
    }
    
    console.log(`🔄 Regenerating scene ${index + 1}/${generatedScenes.length}...`);
    
    // ✅ FIX: Get settings from current project or use defaults
    const settings = currentProjectData?.settings || { 
      aspectRatio: '16:9', 
      quality: 'better',
      style: selectedStyle || { name: 'realistic' }
    };
    
    console.log('📊 Using settings for regeneration:', JSON.stringify(settings, null, 2));
    
    // Show loading state with spinner
    scene.imageUrl = null; // This will show the loading spinner
    scene.error = null; // Clear any previous errors
    displayGeneratedScenes(generatedScenes);
    
    console.log(`🎨 Using prompt: ${scene.prompt}`);
    console.log(`📊 Quality: ${settings.quality}, Aspect: ${settings.aspectRatio}`);
    
    try {
      const imageUrl = await callOpenAIAPI(scene.prompt, settings);
      console.log(`✅ Scene ${index + 1} regenerated successfully`);
      
      generatedScenes[index].imageUrl = imageUrl;
      generatedScenes[index].error = null;
      displayGeneratedScenes(generatedScenes);
      
      // Update stored project data
      if (currentProjectData) {
        currentProjectData.scenes = generatedScenes;
      }
      
      // Show success message
      alert(`✅ Scene ${index + 1} regenerated successfully!`);
      
    } catch (error) {
      console.error(`❌ Error regenerating scene ${index + 1}:`, error);
      generatedScenes[index].imageUrl = 'error';
      generatedScenes[index].error = error.message;
      displayGeneratedScenes(generatedScenes);
      alert(`❌ Failed to regenerate scene ${index + 1}: ${error.message}`);
    }
  }
  
  // Download a single scene image
  // =====================================================================
  // IMAGE DOWNLOAD - MIGRATED TO src/components/ImageModal.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  async function downloadScene(index) {
    if (window.downloadSceneNew && typeof window.downloadSceneNew === 'function') {
      return window.downloadSceneNew(index);
    }
    // Fallback to old implementation
    if (!generatedScenes || !generatedScenes[index]) return;
    
    const scene = generatedScenes[index];
    if (!scene.imageUrl || scene.imageUrl === 'error') return;
    
    try {
      console.log(`📥 Downloading scene ${scene.number}...`);
      
      // Use server proxy to avoid CORS issues
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(scene.imageUrl)}`;
      
      // Create download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = proxyUrl;
      a.download = `scene-${scene.number}.jpg`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
      
      console.log(`✅ Scene ${scene.number} download started`);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again or contact support.');
    }
  }
  
  // View scene detail in modal
  // =====================================================================
  // VIEW SCENE DETAIL - MIGRATED TO src/components/ImageModal.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  function viewSceneDetail(index) {
    if (window.viewSceneDetailNew && typeof window.viewSceneDetailNew === 'function') {
      return window.viewSceneDetailNew(index);
    }
    // Fallback to old implementation
    if (!generatedScenes || !generatedScenes[index]) return;
    
    const scene = generatedScenes[index];
    if (!scene.imageUrl || scene.imageUrl === 'error') return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('sceneDetailModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sceneDetailModal';
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 hidden items-center justify-center p-4';
      modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white" id="sceneDetailTitle"></h2>
            <button onclick="closeSceneDetailModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-6">
            <img id="sceneDetailImage" class="w-full rounded-lg mb-4" src="" alt="">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Script Text:</h3>
              <p id="sceneDetailText" class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"></p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Close on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSceneDetailModal();
      });
    }
    
    // Update modal content
    document.getElementById('sceneDetailTitle').textContent = `Scene ${scene.number} (${scene.startTime} - ${scene.endTime})`;
    document.getElementById('sceneDetailImage').src = scene.imageUrl;
    document.getElementById('sceneDetailText').textContent = scene.text;
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  
  function closeSceneDetailModal() {
    const modal = document.getElementById('sceneDetailModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  
  // Open generated media modal
  function openGeneratedMediaModal() {
    const modal = document.getElementById('generatedMediaModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }
  
  function closeGeneratedMediaModal() {
    const modal = document.getElementById('generatedMediaModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  
  // Download all media as ZIP
  async function downloadAllMedia() {
    if (!currentProjectData) {
      alert('No media to download!');
      return;
    }
    
    const btn = document.getElementById('downloadAllMediaBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Preparing...';
    btn.disabled = true;
    
    try {
      // Load JSZip library
      if (typeof JSZip === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      }
      
      const zip = new JSZip();
      
      // Create folder name from first 3 words of SCRIPT (not title)
      const scriptWords = currentProjectData.script.trim().split(/\s+/);
      const displayName = scriptWords.slice(0, 3)
        .map(word => word.replace(/[^a-z0-9]/gi, ''))
        .filter(word => word.length > 0)
        .join(' ') || 'story';
      const folderName = displayName.replace(/\s+/g, '_'); // For internal use
      const folder = zip.folder(folderName + '_media');
      
      // Add script
      folder.file('script.txt', currentProjectData.script);
      
      // Add timestamps
      const timestamps = currentProjectData.scenes.map(s => 
        `Scene ${s.number}: ${s.startTime} - ${s.endTime}`
      ).join('\n');
      folder.file('timestamps.txt', timestamps);
      
      // Add images folder
      const imagesFolder = folder.folder('images');
      let successCount = 0;
      let failCount = 0;
      
      for (const scene of currentProjectData.scenes) {
        if (scene.imageUrl && scene.imageUrl !== 'error') {
          try {
            // Use server proxy to avoid CORS issues
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(scene.imageUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error('Fetch failed');
            
            const imageBlob = await response.blob();
            imagesFolder.file(`scene_${String(scene.number).padStart(3, '0')}.jpg`, imageBlob);
            successCount++;
          } catch (error) {
            console.warn(`Failed to download scene ${scene.number} image:`, error);
            failCount++;
            // Add a text file explaining the issue
            imagesFolder.file(`scene_${String(scene.number).padStart(3, '0')}_URL.txt`, 
              `Image URL (download manually if needed):\n${scene.imageUrl}`);
          }
        }
      }
      
      // Add audio if available
      if (generatedAudioUrl) {
        try {
          const audioFolder = folder.folder('audio');
          const audioBlob = await fetch(generatedAudioUrl).then(r => r.blob());
          audioFolder.file(displayName + ' voiceover.mp3', audioBlob);
        } catch (error) {
          console.warn('Failed to download audio:', error);
          // Add audio URL as text file
          folder.file('audio_URL.txt', `Audio URL:\n${generatedAudioUrl}`);
        }
      }
      
      // Add download info
      if (failCount > 0) {
        folder.file('DOWNLOAD_INFO.txt', 
          `Download Summary:\n` +
          `✅ Successfully downloaded: ${successCount} images\n` +
          `❌ Failed to download: ${failCount} images\n\n` +
          `Failed images have been saved as URL text files.\n` +
          `You can download them manually by opening the URLs in your browser.`
        );
      }
      
      // Generate and download zip
      btn.innerHTML = '<div class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating ZIP...';
      const content = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = displayName + ' media.zip'; // Use displayName with space
      link.click();
      
      URL.revokeObjectURL(link.href);
      
      // Show success message
      if (failCount > 0) {
        alert(`✅ Download Complete!\n\n` +
              `Successfully downloaded: ${successCount} images\n` +
              `Failed: ${failCount} images (URLs saved as text files)\n\n` +
              `Check the ZIP file for details.`);
      } else {
        alert('✅ Download Complete!\n\nAll media files have been packaged successfully.');
      }
    } catch (error) {
      alert('Error creating download: ' + error.message);
      console.error(error);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }
  
  // =====================================================================
  // VIDEO RENDERING - MIGRATED TO src/components/VideoRenderer.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // Render videos with FFmpeg (automatic MP4 generation)
  async function renderVideos() {
    if (window.renderVideosNew && typeof window.renderVideosNew === 'function' && currentProjectData) {
      try {
        const renderData = await window.renderVideosNew(currentProjectData);
        if (renderData) {
          // Show download modal
          if (window.showVideoDownloadModalNew && typeof window.showVideoDownloadModalNew === 'function') {
            window.showVideoDownloadModalNew(renderData, currentProjectData);
          }
          
          // Save full video to library (if rendered)
          if (renderData.renderFullVideo && renderData.finalVideo) {
            const styles = JSON.parse(localStorage.getItem('styles') || '[]');
            const currentStyleIdx = parseInt(localStorage.getItem('currentStyleIdx') || '0');
            const currentStyle = styles[currentStyleIdx];
            
            // Smart title: use input, or first 3 words from script, or default
            let videoTitle = document.getElementById('video-title')?.value?.trim() || '';
            if (!videoTitle) {
              const scriptEl = document.getElementById('scriptContent');
              const scriptText = scriptEl?.textContent || scriptEl?.innerText || '';
              if (scriptText) {
                const words = scriptText.trim().split(/\s+/);
                videoTitle = words.slice(0, 3).join(' ');
                if (words.length > 3) videoTitle += '...';
              }
            }
            if (!videoTitle) {
              videoTitle = 'Untitled Video';
            }
            
            const videoData = {
              id: renderData.sessionId,
              title: videoTitle,
              createdAt: new Date().toISOString(),
              duration: 'N/A',
              videoUrl: renderData.finalVideo,
              audioUrl: renderData.audio || null,
              script: renderData.script || '',
              images: renderData.images || [],
              wordCount: currentStyle?.wordCount || 0,
              styleId: currentStyleIdx,
              styleName: currentStyle?.name || 'Unknown Style',
              sessionId: renderData.sessionId,
              uploadedToYouTube: false,
              youtubeUrl: null
            };
            
            if (window.saveVideoToLibraryNew && typeof window.saveVideoToLibraryNew === 'function') {
              window.saveVideoToLibraryNew(videoData);
            }
          }
        }
        return;
      } catch (error) {
        console.error('Error in new renderVideos:', error);
        alert('❌ Error Rendering Videos\n\n' + error.message + '\n\nPlease try again or contact support.');
        return;
      }
    }
    // Fallback to old implementation
    if (!currentProjectData || !currentProjectData.scenes) {
      alert('⚠️ No media to render! Please generate images first.');
      return;
    }
    
    // Validate all scenes have images
    const missingImages = currentProjectData.scenes.filter(s => !s.imageUrl || s.imageUrl === 'error');
    if (missingImages.length > 0) {
      alert(`⚠️ Cannot render videos: ${missingImages.length} scene(s) are missing images.\n\nPlease regenerate missing images first.`);
      return;
    }
    
    const btn = document.getElementById('renderVideosBtn');
    const originalText = btn.innerHTML;
    
    try {
      // Step 1: Check if FFmpeg is available on server
      btn.innerHTML = '<div class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Checking FFmpeg...';
      btn.disabled = true;
      
      const statusResponse = await fetch(`${API_BASE_URL}/api/ffmpeg-status`);
      const statusData = await statusResponse.json();
      
      if (!statusData.installed) {
        // FFmpeg not available - offer manual download
        const userChoice = confirm(
          '⚠️ Automatic Video Rendering Not Available\n\n' +
          'FFmpeg is not installed on the server. You have two options:\n\n' +
          '1. Click OK to download images + audio + instructions for manual editing\n' +
          '2. Click Cancel and contact support to enable automatic rendering\n\n' +
          'Would you like to download the manual rendering package?'
        );
        
        if (userChoice) {
          await renderVideosManual(); // Fallback to old method
        }
        return;
      }
      
      // Step 2: Send render request with accurate scene data
      btn.innerHTML = '<div class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Rendering Videos...';
      
      console.log('🎬 Sending render request to server...');
      console.log('   Scenes:', currentProjectData.scenes.length);
      console.log('   Audio URL:', generatedAudioUrl ? 'Available' : 'None');
      
      // Validate all scene image URLs before sending
      console.log('🔍 Validating scene image URLs...');
      for (let i = 0; i < currentProjectData.scenes.length; i++) {
        const scene = currentProjectData.scenes[i];
        console.log(`   Scene ${i + 1}: imageUrl = ${scene.imageUrl ? scene.imageUrl.substring(0, 60) + '...' : 'MISSING'}`);
        
        if (!scene.imageUrl || scene.imageUrl === 'error' || scene.imageUrl === '') {
          throw new Error(`Scene ${i + 1} is missing a valid image URL. Please regenerate that scene's image.`);
        }
        
        if (!scene.imageUrl.startsWith('http://') && !scene.imageUrl.startsWith('https://')) {
          throw new Error(`Scene ${i + 1} has invalid image URL: ${scene.imageUrl.substring(0, 50)}`);
        }
      }
      console.log('✅ All scene images validated');
      
      // Get transition settings from localStorage (default: fade, 0.5s)
      const transitionType = localStorage.getItem('transitionType') || 'fade';
      const transitionDuration = parseFloat(localStorage.getItem('transitionDuration') || '0.5');
      
      // ✅ Read from localStorage (saved in Transition Settings modal)
      const enableTransitionsValue = localStorage.getItem('enableTransitions');
      console.log('🔍 DEBUG - localStorage enableTransitions:', enableTransitionsValue, typeof enableTransitionsValue);
      
      const enableTransitions = enableTransitionsValue === 'true';
      const renderFullVideo = enableTransitions; // Use transition checkbox state for full video
      
      console.log('🎬 Transition settings:', { type: transitionType, duration: transitionDuration });
      console.log('🎬 Render full merged video:', renderFullVideo ? '✅ YES' : '❌ NO (individual scenes only)');
      console.log('🔍 DEBUG - Project name being sent:', currentProjectData.title);
      
      if (renderFullVideo) {
        console.log('✨ You will get: Individual scenes + 1 merged video with transitions');
      } else {
        console.log('📹 You will get: Individual scenes only (no merged video)');
      }
      
      const renderResponse = await fetch(`${API_BASE_URL}/api/render-videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: currentProjectData.scenes.map(s => ({
            number: s.number,
            imageUrl: s.imageUrl,
            startTime: s.startTime,
            endTime: s.endTime,
            startSeconds: s.startSeconds,
            endSeconds: s.endSeconds,
            duration: (s.endSeconds - s.startSeconds).toFixed(3),
            text: s.text || '' // Include scene text for script.txt
          })),
          audioUrl: generatedAudioUrl,
          projectName: currentProjectData.title,
          renderFullVideo: renderFullVideo, // ✅ NEW: Send flag to backend
          transition: {
            type: transitionType,
            duration: transitionDuration
          }
        })
      });
      
      if (!renderResponse.ok) {
        const errorData = await renderResponse.json();
        throw new Error(errorData.message || 'Rendering failed');
      }
      
      const renderData = await renderResponse.json();
      
      if (!renderData.success) {
        throw new Error(renderData.message || 'Rendering failed');
      }
      
      console.log('✅ Videos rendered successfully!');
      console.log('   Session ID:', renderData.sessionId);
      
      // Save full video to library (if rendered)
      if (renderData.renderFullVideo && renderData.finalVideo) {
        const currentStyle = styles[currentStyleIdx];
        
        // Smart title: use input, or first 3 words from script, or default
        let videoTitle = document.getElementById('video-title')?.value?.trim() || '';
        if (!videoTitle) {
          // Get actual script text from DOM
          const scriptEl = document.getElementById('scriptContent');
          const scriptText = scriptEl?.textContent || scriptEl?.innerText || '';
          
          if (scriptText) {
            // Get first 3 words from script
            const words = scriptText.trim().split(/\s+/);
            videoTitle = words.slice(0, 3).join(' ');
            if (words.length > 3) videoTitle += '...';
          }
        }
        if (!videoTitle) {
          videoTitle = 'Untitled Video';
        }
        
        const videoData = {
          id: renderData.sessionId,
          title: videoTitle,
          createdAt: new Date().toISOString(),
          duration: 'N/A',
          videoUrl: renderData.finalVideo,
          audioUrl: renderData.audio || null,
          script: renderData.script || '',
          images: renderData.images || [],
          wordCount: currentStyle?.wordCount || 0,
          styleId: currentStyleIdx,
          styleName: currentStyle?.name || 'Unknown Style',
          sessionId: renderData.sessionId,
          uploadedToYouTube: false,
          youtubeUrl: null
        };
        saveVideoToLibrary(videoData);
        console.log('💾 Video saved to library:', videoData.title);
      }
      
      // Step 3: Show download modal
      btn.innerHTML = 'Complete!';
      
      // Build full video section conditionally
      const fullVideoSection = renderData.renderFullVideo && renderData.finalVideo ? `
        <div class="mb-6 p-4 bg-gradient-to-r from-[#5B7FFF]/5 to-[#5B7FFF]/10 dark:from-gray-700 dark:to-gray-600 rounded-lg border-2 border-[#5B7FFF]/20 dark:border-[#5B7FFF]/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-[#5B7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <div>
                <h4 class="font-bold text-lg text-gray-900 dark:text-white mb-1">Complete Video (with Audio)</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">All scenes combined with voiceover</p>
              </div>
            </div>
            <div class="flex gap-3">
              <a href="${renderData.finalVideo}" download 
                 class="px-6 py-3 bg-[#5B7FFF] hover:bg-[#4A6BFF] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                Download Full Video
              </a>
              <button onclick="openYouTubeUpload('${renderData.sessionId}')" 
                      class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Upload to YouTube
              </button>
            </div>
          </div>
        </div>
      ` : '';
      
      // Build audio link if available
      const audioSection = renderData.audio ? `
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-[#5B7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Audio File</span>
              <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">(MP3)</span>
            </div>
          </div>
          <a href="${renderData.audio}" download 
             class="px-4 py-2 bg-[#5B7FFF] hover:bg-[#4A6BFF] text-white rounded-lg text-sm font-medium transition-all">
            Download
          </a>
        </div>
      ` : '';
      
      // Create download modal
      const modalHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" id="videoDownloadModal">
          <div class="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-[#5B7FFF]/10 dark:bg-[#5B7FFF]/20 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-[#5B7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Videos Rendered Successfully!</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Folder: ${renderData.sessionId}</p>
                  </div>
                </div>
                <button onclick="document.getElementById('videoDownloadModal').remove()" 
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="p-6">
              <!-- Full Video (conditional) -->
              ${fullVideoSection}
              
              <!-- Script & Audio -->
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h4 class="font-bold text-gray-900 dark:text-white">Project Files:</h4>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#5B7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <div>
                    <span class="font-medium text-gray-900 dark:text-white">Script</span>
                    <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">(TXT with timestamps)</span>
                  </div>
                </div>
                <a href="${renderData.script}" download 
                   class="px-4 py-2 bg-[#5B7FFF] hover:bg-[#4A6BFF] text-white rounded-lg text-sm font-medium transition-all">
                  Download
                </a>
              </div>
              
              ${audioSection}
              
              <!-- Individual Scenes -->
              <div class="flex items-center gap-2 mb-3 mt-6">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <h4 class="font-bold text-gray-900 dark:text-white">Individual Scene Videos:</h4>
              </div>
              <div class="space-y-2 mb-6">
                ${renderData.sceneVideos.map(v => `
                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <span class="font-medium text-gray-900 dark:text-white">Scene ${v.scene}</span>
                      <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">(${v.duration}s)</span>
                    </div>
                    <a href="${v.url}" download 
                       class="px-4 py-2 bg-[#5B7FFF] hover:bg-[#4A6BFF] text-white rounded-lg text-sm font-medium transition-all">
                      Download
                    </a>
                  </div>
                `).join('')}
              </div>
              
              <!-- Download All Button -->
              <a href="${renderData.downloadAll}" download 
                 class="block w-full py-3 bg-[#5B7FFF] hover:bg-[#4A6BFF] text-white text-center font-semibold rounded-lg flex items-center justify-center gap-2 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download All Videos (ZIP)
              </a>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error rendering videos:', error);
      alert('❌ Error Rendering Videos\n\n' + error.message + '\n\nPlease try again or contact support.');
      btn.innerHTML = originalText;
    } finally {
      btn.disabled = false;
    }
  }
  
  // Fallback: Manual rendering package (when FFmpeg not available)
  async function renderVideosManual() {
    const btn = document.getElementById('renderVideosBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating Package...';
    btn.disabled = true;
    
    try {
      // Load JSZip library
      if (typeof JSZip === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      }
      
      const zip = new JSZip();
      
      // Create folder name from first 3 words of title
      const titleWords = currentProjectData.title.trim().split(/\s+/);
      const folderName = titleWords.slice(0, 3).join('_').replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'story';
      const folder = zip.folder(folderName + '_manual_render');
      
      // Add all media
      folder.file('script.txt', currentProjectData.script);
      folder.file('timestamps.txt', currentProjectData.scenes.map(s => 
        `Scene ${s.number}: ${s.startTime} - ${s.endTime} (Duration: ${(s.endSeconds - s.startSeconds).toFixed(2)}s)`
      ).join('\n'));
      
      // Add images
      const imagesFolder = folder.folder('images');
      let successCount = 0;
      let failCount = 0;
      
      for (const scene of currentProjectData.scenes) {
        if (scene.imageUrl && scene.imageUrl !== 'error') {
          try {
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(scene.imageUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error('Fetch failed');
            
            const imageBlob = await response.blob();
            imagesFolder.file(`scene_${String(scene.number).padStart(3, '0')}.jpg`, imageBlob);
            successCount++;
          } catch (error) {
            console.warn(`Failed to download scene ${scene.number} image:`, error);
            failCount++;
            imagesFolder.file(`scene_${String(scene.number).padStart(3, '0')}_URL.txt`, 
              `Image URL:\n${scene.imageUrl}`);
          }
        }
      }
      
      // Add rendering guide
      const videosFolder = folder.folder('videos');
      let renderGuide = '═══════════════════════════════════════════════════════\n';
      renderGuide += '   MANUAL VIDEO RENDERING INSTRUCTIONS\n';
      renderGuide += '═══════════════════════════════════════════════════════\n\n';
      renderGuide += 'Use CapCut, DaVinci Resolve, or Adobe Premiere:\n\n';
      
      currentProjectData.scenes.forEach(s => {
        const duration = (s.endSeconds - s.startSeconds).toFixed(2);
        renderGuide += `Scene ${s.number}: ${duration}s (${s.startTime} - ${s.endTime})\n`;
      });
      
      videosFolder.file('RENDERING_GUIDE.txt', renderGuide);
      
      // Add audio
      if (generatedAudioUrl) {
        try {
          const audioBlob = await fetch(generatedAudioUrl).then(r => r.blob());
          folder.file(folderName + '_voiceover.mp3', audioBlob);
        } catch (error) {
          console.warn('Failed to download audio:', error);
          folder.file('audio_URL.txt', `Audio URL:\n${generatedAudioUrl}`);
        }
      }
      
      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = folderName + '_manual_render.zip';
      link.click();
      URL.revokeObjectURL(link.href);
      
      alert('✅ Manual Render Package Downloaded!\n\nFollow the instructions in RENDERING_GUIDE.txt');
    } catch (error) {
      alert('Error creating package: ' + error.message);
      console.error(error);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }
  
  function restartGeneration() {
    if (confirm('Are you sure you want to restart? This will clear all generated media.')) {
      generatedScenes = [];
      currentProjectData = null;
      closeGeneratedMediaModal();
      openImageModal();
    }
  }
  
  // Helper to load external scripts
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }



  // =====================================================================
  // UI INITIALIZATION - MIGRATED TO src/components/AppInitializer.js
  // These functions are kept here for backward compatibility
  // They will use the new AppInitializer if available, otherwise fallback to old implementation
  // TODO: Remove after full migration to new structure
  // =====================================================================

  // Initialize UI after DOM is loaded
  // Note: This is now handled by src/app.js, but kept here for backward compatibility
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // New UI initializer will handle this, but we keep this as fallback
      if (!window.initializeUI || typeof window.initializeUI !== 'function') {
        initializeUI();
      }
    });
  } else {
    // DOM already loaded
    if (!window.initializeUI || typeof window.initializeUI !== 'function') {
      initializeUI();
    }
  }

  function initializeUI() {
    // Use new initializer if available
    if (window.initializeUI && typeof window.initializeUI === 'function' && window.initializeUI !== initializeUI) {
      return window.initializeUI();
    }
    
    // Fallback to old implementation
    // Dark mode
    if (localStorage.getItem('darkMode') === 'true') document.documentElement.classList.add('dark');
    updateDarkIcon();

    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', () => {
        profileDropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
          profileDropdown.classList.add('hidden');
        }
      });
    }

    // Features dropdown
    const featuresBtn = document.getElementById('featuresBtn');
    const featuresDropdown = document.getElementById('featuresDropdown');
    if (featuresBtn && featuresDropdown) {
      featuresBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        featuresDropdown.classList.toggle('hidden');
        // Close profile dropdown if open
        if (profileDropdown) profileDropdown.classList.add('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!featuresDropdown.contains(e.target) && !featuresBtn.contains(e.target)) {
          featuresDropdown.classList.add('hidden');
        }
      });
    }

    // Enable Generate when title has text
    const videoTitleInput = document.getElementById('video-title');
    const generateBtn = document.getElementById('generate-btn');
    if (videoTitleInput && generateBtn) {
      videoTitleInput.addEventListener('input', () => {
        generateBtn.disabled = videoTitleInput.value.trim() === '';
      });
      console.log('✅ Generate button listener attached');
    } else {
      console.error('❌ Could not find video-title or generate-btn elements');
    }

    // Credits from localStorage
    const creditBalanceEl = document.getElementById("creditBalance");
    if (creditBalanceEl) {
      const currentUserEmail = localStorage.getItem("currentUser");
      const userKey = `user_${currentUserEmail}`;
      const userData = JSON.parse(localStorage.getItem(userKey));
      creditBalanceEl.textContent = (userData && userData.credits !== undefined) ? userData.credits : 198;
    }
  }

  // Dark mode functions
  function toggleDarkMode() {
    // Use new function if available
    if (window.toggleDarkMode && typeof window.toggleDarkMode === 'function' && window.toggleDarkMode !== toggleDarkMode) {
      return window.toggleDarkMode();
    }
    
    // Fallback to old implementation
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem('darkMode', html.classList.contains('dark') ? 'true' : 'false');
    updateDarkIcon();
  }
  
  function updateDarkIcon() {
    // Use new function if available
    if (window.updateDarkIcon && typeof window.updateDarkIcon === 'function' && window.updateDarkIcon !== updateDarkIcon) {
      return window.updateDarkIcon();
    }
    
    // Fallback to old implementation
    const icon = document.getElementById('darkIcon');
    if (!icon) return;
    icon.innerHTML = document.documentElement.classList.contains('dark')
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
  }

  // =====================================================================
  // CREDIT BALANCE - MIGRATED TO src/utils/storage.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  function updateCreditBalance(newBalance) {
    if (window.creditStorage && window.creditStorage.updateBalance) {
      return window.creditStorage.updateBalance(newBalance);
    }
    // Fallback to old implementation
    if (isNaN(newBalance) || newBalance < 0) newBalance = 0;
    document.getElementById("creditBalance").textContent = newBalance;
    const cu = localStorage.getItem("currentUser");
    const uk = `user_${cu}`;
    const ud = JSON.parse(localStorage.getItem(uk));
    if (ud) {
      ud.credits = newBalance;
      localStorage.setItem(uk, JSON.stringify(ud));
    }
  }

  // Live estimate for script credits
  const wcInput = document.getElementById('mainWordCount');
  const estimate = document.getElementById('estimate');
  wcInput.addEventListener('input', () => {
    const wc = parseInt(wcInput.value.trim()) || 0;
    estimate.textContent = Math.round(wc / 100);
  });

  // Word count helpers
  const wcDisplay = document.getElementById('wordCount');
  function countWords(str){ return str.trim().split(/\s+/).filter(w => w.length).length; }
  function updateScriptWordCount(){
    if (window.updateScriptWordCountNew && typeof window.updateScriptWordCountNew === 'function') {
      return window.updateScriptWordCountNew();
    }
    // Fallback to old implementation
    const text = document.getElementById('scriptContent').innerText;
    if (wcDisplay) {
      wcDisplay.textContent = countWords(text);
    }
  }

  // =====================================================================
  // WORD COUNT MODAL - MIGRATED TO src/components/Modals.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // Word count modal with 8000 word limit
  function handleIconClick() {
    if (window.handleIconClickNew && typeof window.handleIconClickNew === 'function') {
      return window.handleIconClickNew();
    }
    // Fallback to old implementation
    showWordCountModal();
  }
  
  function showWordCountModal() {
    if (window.showWordCountModalNew && typeof window.showWordCountModalNew === 'function') {
      return window.showWordCountModalNew();
    }
    // Fallback to old implementation
    document.getElementById('word-count-modal').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
    const currentCount = document.getElementById('mainWordCount').value || '500';
    const input = document.getElementById('word-count-input');
    if (input) {
      input.value = currentCount;
      input.focus();
      input.select();
      input.addEventListener('input', liveUpdateWordCount);
    }
  }
  
  function hideWordCountModal() {
    if (window.hideWordCountModalNew && typeof window.hideWordCountModalNew === 'function') {
      return window.hideWordCountModalNew();
    }
    // Fallback to old implementation
    document.getElementById('word-count-modal').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
    const input = document.getElementById('word-count-input');
    if (input) {
      input.removeEventListener('input', liveUpdateWordCount);
    }
  }

  // =====================================================================
  // SCRIPT MANAGEMENT - MIGRATED TO src/components/ScriptManager.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  function setCopyDownloadEnabled(enabled) {
    if (window.setCopyDownloadEnabledNew && typeof window.setCopyDownloadEnabledNew === 'function') {
      return window.setCopyDownloadEnabledNew(enabled);
    }
    // Fallback to old implementation
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    [copyBtn, downloadBtn].forEach(btn => {
      if (!btn) return;
      btn.disabled = !enabled;
      btn.setAttribute('aria-disabled', String(!enabled));
    });
  }
  document.addEventListener('DOMContentLoaded', () => setCopyDownloadEnabled(false));

  // Copy script to clipboard
  function copyScript() {
    if (window.copyScriptNew && typeof window.copyScriptNew === 'function') {
      return window.copyScriptNew();
    }
    // Fallback to old implementation
    const scriptContent = document.getElementById('scriptContent');
    if (!scriptContent) return;
    
    const text = scriptContent.innerText || scriptContent.textContent;
    
    if (!text || text.trim() === '') {
      alert('No script to copy!');
      return;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      // Visual feedback
      const copyBtn = document.getElementById('copyBtn');
      const originalHTML = copyBtn.innerHTML;
      
      copyBtn.innerHTML = `
        <svg class="w-6 h-6 stroke-green-600 dark:stroke-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
      }, 2000);
      
      console.log('✅ Script copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy script. Please try selecting and copying manually.');
    });
  }

  // Download script as text file
  function downloadScript() {
    if (window.downloadScriptNew && typeof window.downloadScriptNew === 'function') {
      return window.downloadScriptNew();
    }
    // Fallback to old implementation
    const scriptContent = document.getElementById('scriptContent');
    const videoTitle = document.getElementById('video-title')?.value || 'script';
    
    if (!scriptContent) return;
    
    const text = scriptContent.innerText || scriptContent.textContent;
    
    if (!text || text.trim() === '') {
      alert('No script to download!');
      return;
    }
    
    // Create blob and download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Script downloaded!');
  }

  // =====================================================================
  // LIVE UPDATE WORD COUNT - MIGRATED TO src/components/Modals.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  function liveUpdateWordCount(e) {
    if (window.liveUpdateWordCountNew && typeof window.liveUpdateWordCountNew === 'function') {
      return window.liveUpdateWordCountNew(e);
    }
    // Fallback to old implementation
    let val = parseInt(e.target.value, 10);
    // Enforce 8000 word maximum
    if (val > 8000) {
      val = 8000;
      e.target.value = 8000;
      alert('Maximum word count is 8000 words.');
    }
    if (val && val > 0) {
      document.getElementById('mainWordCount').value = val;
      document.getElementById('count-text').textContent = val;
      document.getElementById('mainWordCount').dispatchEvent(new Event('input'));
    }
  }
  
  // Event listeners are now handled by initializeModals() in src/components/Modals.js
  // These are kept for backward compatibility
  const modalOverlay = document.getElementById('modal-overlay');
  const wordCountModal = document.getElementById('word-count-modal');
  if (modalOverlay && !modalOverlay.hasAttribute('data-listener-added')) {
    modalOverlay.addEventListener('click', hideWordCountModal);
    modalOverlay.setAttribute('data-listener-added', 'true');
  }
  if (wordCountModal && !wordCountModal.hasAttribute('data-listener-added')) {
    wordCountModal.addEventListener('click', (e) => e.stopPropagation());
    wordCountModal.setAttribute('data-listener-added', 'true');
  }

  // =====================================================================
  // CONTEXT MODAL INITIALIZATION - MIGRATED TO src/components/Modals.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // Context modal initialization
  // This is now handled by initializeModals() in src/components/Modals.js
  // Kept here for backward compatibility
  document.addEventListener('DOMContentLoaded', () => {
    // Only run if new modals haven't been initialized
    if (!window.modalsInitialized) {
      const savedContext = document.getElementById('additionalContextHidden')?.value?.trim() || '';
      const icon = document.getElementById('icon');
      if (icon) {
        if (savedContext.length > 0) {
          icon.classList.add('icon-active');
        } else {
          icon.classList.remove('icon-active');
        }
      }
    }
  });
  function showContextModal() {
    document.getElementById('context-modal').classList.remove('hidden');
    document.getElementById('context-modal-overlay').classList.remove('hidden');
    const textarea = document.getElementById('additional-context-input');
    textarea.focus(); textarea.select();
  }
  function hideContextModal() {
    document.getElementById('context-modal').classList.add('hidden');
    document.getElementById('context-modal-overlay').classList.add('hidden');
  }
  function saveAdditionalContext() {
    const input = document.getElementById('additional-context-input').value.trim();
    const hiddenInput = document.getElementById('additionalContextHidden');
    const icon = document.getElementById('icon');
    if (hiddenInput) hiddenInput.value = input; else window.additionalContext = input;
    if (input.length > 0) icon.classList.add('icon-active'); else icon.classList.remove('icon-active');
    hideContextModal();
  }

  // Handle text file upload
  function handleTextFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.name.endsWith('.txt')) {
      alert('Please upload only .txt files');
      event.target.value = ''; // Reset input
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const textContent = e.target.result;
      
      // Show the script wrapper if hidden
      const scriptWrapper = document.getElementById('scriptWrapper');
      if (scriptWrapper && scriptWrapper.classList.contains('hidden')) {
        scriptWrapper.classList.remove('hidden');
      }
      
      // Populate the script content (no word limit)
      const scriptContent = document.getElementById('scriptContent');
      if (scriptContent) {
        scriptContent.textContent = textContent;
      }
      
      // Update word count
      const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
      const wordCountElem = document.getElementById('wordCount');
      if (wordCountElem) {
        wordCountElem.textContent = wordCount;
      }
      
      // Set isGenerating to false so voice icon becomes enabled
      window.isGenerating = false;
      
      // Enable copy and download buttons
      setCopyDownloadEnabled(true);
      
      // ✅ FIX: Call onScriptGenerationComplete to properly enable voice icon
      if (typeof onScriptGenerationComplete === 'function') {
        onScriptGenerationComplete();
      } else {
        // Fallback if onScriptGenerationComplete isn't available yet
        if (typeof refreshVoiceIcon === 'function') refreshVoiceIcon();
      }
      
      // Enable image icon
      if (typeof refreshImageIcon === 'function') refreshImageIcon();
      
      // Scroll to the script output
      const scriptOutput = document.getElementById('scriptOutput');
      if (scriptOutput) {
        scriptOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      console.log('Text file uploaded successfully - Word count:', wordCount);
    };
    
    reader.onerror = function() {
      alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
    
    // Reset file input so same file can be uploaded again
    event.target.value = '';
  }

  // =====================================================================
  // SCRIPT GENERATION - MIGRATED TO src/components/ScriptGenerator.js
  // This function is kept here for backward compatibility
  // It will use the new ScriptGenerator if available, otherwise fallback to old implementation
  // TODO: Remove after full migration to new structure
  // =====================================================================
  
  // Generate script using Claude AI
 async function generateFullScript() {
  // Try to use new component if available
  if (window.generateFullScriptNew && typeof window.generateFullScriptNew === 'function') {
    try {
      setCopyDownloadEnabled(false);
      window.isGenerating = true;
      if (typeof refreshVoiceIcon === 'function') refreshVoiceIcon();

      const title = document.getElementById('video-title').value.trim();
      const inputWordCount = parseInt(document.getElementById('mainWordCount').value) || 500;
      const additionalContext = document.getElementById('additionalContextHidden')?.value || window.additionalContext || '';
      
      let currentStyleIdx = localStorage.getItem('currentStyleIdx');
      let styles = JSON.parse(localStorage.getItem('styles') || '[]');
      
      const button = document.querySelector('button[onclick="generateFullScript()"]');
      const originalText = button.innerHTML;
      button.innerHTML = '⏳ Generating...';
      button.disabled = true;

      const scriptOutput = document.getElementById("scriptOutput");
      const scriptContent = document.getElementById("scriptContent");
      const scriptWrapper = document.getElementById("scriptWrapper");
      
      scriptWrapper.classList.remove("hidden");
      scriptOutput.classList.remove("hidden");
      scriptContent.textContent = "✍️ Generating your video script…";
      scriptContent.style.opacity = "0.9";
      scriptOutput.scrollIntoView({ behavior: "smooth", block: "center" });

      // Use new component
      const scriptText = await window.generateFullScriptNew({
        title,
        wordCount: inputWordCount,
        additionalContext,
        styleIdx: currentStyleIdx,
        styles
      });

      // Use new typewriter effect if available
      if (window.typeWriterEffectNew) {
        window.typeWriterEffectNew(scriptText, scriptContent, () => {
          const wordCount = scriptText.trim().split(/\s+/).filter(w => w.length).length;
          document.getElementById('wordCount').textContent = wordCount;
          setCopyDownloadEnabled(true);
          if (typeof updateScriptWordCount === 'function') updateScriptWordCount();
          window.isGenerating = false;
          if (typeof refreshVoiceIcon === 'function') refreshVoiceIcon();
          if (typeof onScriptGenerationComplete === 'function') onScriptGenerationComplete();
        });
      } else {
        // Fallback to old typewriter
        scriptContent.textContent = scriptText;
        const wordCount = scriptText.trim().split(/\s+/).filter(w => w.length).length;
        document.getElementById('wordCount').textContent = wordCount;
        setCopyDownloadEnabled(true);
        window.isGenerating = false;
        if (typeof refreshVoiceIcon === 'function') refreshVoiceIcon();
        if (typeof onScriptGenerationComplete === 'function') onScriptGenerationComplete();
      }

      button.innerHTML = '✅ Generated';
      button.disabled = false;
      return;
    } catch (error) {
      console.error('Error with new script generator:', error);
      alert("Failed to generate script: " + error.message);
      const button = document.querySelector('button[onclick="generateFullScript()"]');
      if (button) {
        button.innerHTML = 'Generate';
        button.disabled = false;
      }
      window.isGenerating = false;
      if (typeof refreshVoiceIcon === 'function') refreshVoiceIcon();
      return;
    }
  }
  
  // Fallback to old implementation
  setCopyDownloadEnabled(false);
  window.isGenerating = true;
  if (typeof refreshVoiceIcon === 'function') refreshVoiceIcon();

  const title = document.getElementById('video-title').value.trim();
  const inputWordCount = parseInt(document.getElementById('mainWordCount').value) || 500;
  
  let mainWordCount = inputWordCount;
  let styleLang = "English";
  
  let currentStyleIdx = localStorage.getItem('currentStyleIdx');
  let styles = JSON.parse(localStorage.getItem('styles') || '[]');
  
  if (styles.length && currentStyleIdx !== null && styles[currentStyleIdx] && styles[currentStyleIdx].wordCount) {
    styleLang = styles[currentStyleIdx].lang || "English";
    mainWordCount = Math.min(styles[currentStyleIdx].wordCount, 8000);
  }
  
  if (!title || !mainWordCount) { 
    alert('Please enter both a title and word count.'); 
    window.isGenerating = false;
    return; 
  }

  const cost = Math.round(mainWordCount / 100);
  const currentCredits = parseInt(document.getElementById('creditBalance').textContent);
  
  if (currentCredits < cost) { 
    alert("Not enough credits to generate this script."); 
    window.isGenerating = false;
    return; 
  }

  const button = document.querySelector('button[onclick="generateFullScript()"]');
  const originalText = button.innerHTML;
  button.classList.add('loading');
  button.innerHTML = '<span style="opacity: 0;">Generating</span>';
  button.disabled = true;

  const scriptOutput = document.getElementById("scriptOutput");
  const scriptContent = document.getElementById("scriptContent");
  const scriptWrapper = document.getElementById("scriptWrapper");
  
  scriptWrapper.classList.remove("hidden");
  scriptOutput.classList.remove("hidden");
  scriptContent.textContent = "✍️ Generating your video script…";
  scriptContent.style.opacity = "0.9";
  scriptOutput.scrollIntoView({ behavior: "smooth", block: "center" });

  try {
    const additionalContext = document.getElementById('additionalContextHidden')?.value || window.additionalContext || '';
    let userPrompt = `Write a ${mainWordCount}-word story in ${styleLang} for this title: "${title}".`;
    
    // Add competitor video analysis if available
    if (styles.length && currentStyleIdx !== null && styles[currentStyleIdx]?.competitorUrl) {
      const compUrl = styles[currentStyleIdx].competitorUrl;
      userPrompt += `\n\nIMPORTANT: Analyze the structure and pacing style from this competitor video: ${compUrl}
Use similar narrative techniques, chapter flow, and emotional beats, but create completely original content. DO NOT copy any text word-for-word.`;
    }
    
    if (additionalContext.length > 0) {
      userPrompt += ` Additional context: ${additionalContext}`;
    }

    // Check if API key is set (already configured with your key!)
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Please set your Anthropic API key in the ANTHROPIC_API_KEY variable');
    }

    // Using CORS proxy for Claude API (required for browser access)
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = 'https://api.anthropic.com/v1/messages';
    
    const response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",  // ⚡ FASTER model (Haiku)
        max_tokens: 8000,
        messages: [
          {
            role: "user",
            content: `NARRATION RULES - STRICTLY FOLLOW:
- Write in pure narrative form only - NO subtitles, headings, or section breaks
- Do NOT use any special characters like #, *, _, or formatting symbols
- Do NOT include [Scene descriptions] or (parenthetical notes)
- NO chapter markers, timestamps, or labeled segments
- Write as one continuous flowing story from beginning to end
- Use natural paragraph breaks only
- Write EXACTLY as it should be spoken aloud by a narrator

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
${userPrompt}`
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Claude API error");
    }
    
    const scriptText = data.content[0].text;

    // ⚡ FASTER TYPEWRITER EFFECT (2ms per character instead of 5ms)
    scriptContent.textContent = "";
    scriptContent.style.opacity = "1";
    let i = 0;
    
    function typeWriter() {
      if (i < scriptText.length) {
        scriptContent.textContent += scriptText.charAt(i++);
        setTimeout(typeWriter, 2); // ⚡ Faster: 2ms per character
      } else {
        // Finished typing
        const text = scriptContent.textContent.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        document.getElementById('wordCount').textContent = wordCount;

        setCopyDownloadEnabled(true);
        if (typeof updateScriptWordCount === 'function') updateScriptWordCount();

        window.isGenerating = false;
        if (typeof refreshVoiceIcon === 'function') refreshVoiceIcon();
        if (typeof onScriptGenerationComplete === 'function') onScriptGenerationComplete();
        
        // Save session for recovery
        saveCurrentSession({
          title: title,
          script: text,
          wordCount: wordCount,
          styleId: currentStyleIdx,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    typeWriter();

    // Deduct credits
    updateCreditBalance(currentCredits - cost);
    
    button.classList.remove('loading');
    button.innerHTML = '✅ Generated';
    button.disabled = false;
    
    // Reset to original text after 2 seconds
    setTimeout(() => {
      button.innerHTML = originalText;
    }, 2000);
    
  } catch (error) {
    console.error('Error:', error);
    alert("Failed to generate script: " + error.message);
    scriptContent.textContent = "";
    button.classList.remove('loading');
    button.innerHTML = originalText;
    button.disabled = false;
    window.isGenerating = false;
    if (typeof refreshVoiceIcon === 'function') refreshVoiceIcon();
  }
}



  function openStyleModal() {
    const modal = document.getElementById('styleModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    showCreateStyle();
    initReferenceVideos();
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');
  }
  const _origClose = closeStyleModal;
  window.closeStyleModal = function () {
    _origClose && _origClose();
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');
  }



  // Voice dropdown state
  let selectedVoiceIdx = 0; // Juniper (safest default that always works)
  let selectedVoiceId = 'aMSt68OGf4xUZAnLpTU8'; // Juniper default - ALWAYS WORKS
  let currentVoiceProvider = 'premium'; // 'premium' (ElevenLabs) or 'non-premium' (Speechify)
  
  // Toggle voice dropdown modal
  function toggleVoiceDropdownModal() {
    const modal = document.getElementById('voiceDropdownModal');
    if (!modal) return;
    modal.classList.toggle('hidden');
  }
  
  // Close voice dropdown modal
  function closeVoiceDropdownModal() {
    if (window.closeVoiceDropdownModalNew && typeof window.closeVoiceDropdownModalNew === 'function') {
      return window.closeVoiceDropdownModalNew();
    }
    // Fallback to old implementation
    const modal = document.getElementById('voiceDropdownModal');
    if (modal) modal.classList.add('hidden');
  }
  
  // Select voice from modal
  function selectVoiceFromModal(voiceId, voiceName, voiceStyle) {
    if (window.selectVoiceFromModalNew && typeof window.selectVoiceFromModalNew === 'function') {
      return window.selectVoiceFromModalNew(voiceId, voiceName, voiceStyle);
    }
    // Fallback to old implementation
    selectedVoiceId = voiceId;
    
    // Update display
    const display = document.getElementById('selectedVoiceDisplay');
    if (display) {
      display.textContent = `${voiceName} - ${voiceStyle}`;
    }
    
    // Update hidden select if it exists
    const select = document.getElementById('styleVoiceSelect');
    if (select) {
      select.value = voiceId;
    }
    
    // Close modal
    closeVoiceDropdownModal();
    
    console.log(`✅ Selected voice: ${voiceName} (${voiceId})`);
  }
  
  // Play voice preview using ElevenLabs samples
  function playVoicePreview(voiceId, voiceName) {
    if (window.playVoicePreviewNew && typeof window.playVoicePreviewNew === 'function') {
      return window.playVoicePreviewNew(voiceId, voiceName);
    }
    // Fallback to old implementation
    // ElevenLabs preview URLs (you'll need to add your API key for actual previews)
    // For now, we'll show an alert with preview info
    console.log(`🔊 Playing preview for: ${voiceName} (${voiceId})`);
    
    // You can replace this with actual ElevenLabs API call or sample URLs
    const previewUrl = `https://api.elevenlabs.io/v1/voices/${voiceId}/preview`;
    
    // Create audio element and play
    const audio = new Audio();
    audio.src = previewUrl;
    audio.play().catch(err => {
      console.log('Preview not available, showing voice info instead');
      alert(`Voice Preview:\n\nName: ${voiceName}\nID: ${voiceId}\n\nNote: To enable voice previews, add your ElevenLabs API key.`);
    });
  }
  
  // Voice Provider Switching Functions
  function switchVoiceProvider() {
    if (window.switchVoiceProviderNew && typeof window.switchVoiceProviderNew === 'function') {
      const select = document.getElementById('voiceProvider');
      if (select) {
        return window.switchVoiceProviderNew(select.value);
      }
      return;
    }
    // Fallback to old implementation
    const select = document.getElementById('voiceProvider');
    if (!select) return;
    
    currentVoiceProvider = select.value;
    console.log('🔄 Switching to:', currentVoiceProvider);
    
    const voiceLabel = document.getElementById('voiceLabel');
    if (voiceLabel) {
      voiceLabel.textContent = currentVoiceProvider === 'premium' 
        ? 'Voice (21 ElevenLabs Voices)' 
        : 'Voice (Speechify Voices)';
    }
    
    // Toggle voice selection controls
    const elevenlabsControls = document.getElementById('elevenlabsVoiceControls');
    const speechifyControls = document.getElementById('speechifyVoiceControls');
    
    if (currentVoiceProvider === 'premium') {
      if (elevenlabsControls) elevenlabsControls.classList.remove('hidden');
      if (speechifyControls) speechifyControls.classList.add('hidden');
    } else {
      if (elevenlabsControls) elevenlabsControls.classList.add('hidden');
      if (speechifyControls) speechifyControls.classList.remove('hidden');
    }
    
    // Toggle advanced controls
    const elevenlabsAdvanced = document.getElementById('elevenlabsAdvancedControls');
    const speechifyAdvanced = document.getElementById('speechifyAdvancedControls');
    
    if (currentVoiceProvider === 'premium') {
      if (elevenlabsAdvanced) elevenlabsAdvanced.classList.remove('hidden');
      if (speechifyAdvanced) speechifyAdvanced.classList.add('hidden');
    } else {
      if (elevenlabsAdvanced) elevenlabsAdvanced.classList.add('hidden');
      if (speechifyAdvanced) speechifyAdvanced.classList.remove('hidden');
    }
    
    updateVoiceDisplay();
  }

  function updateVoiceDisplay() {
    const display = document.getElementById('selectedVoiceDisplay');
    if (!display) return;
    
    if (currentVoiceProvider === 'premium') {
      const selectedVoice = ELEVENLABS_VOICES.find(v => v.id === selectedVoiceId) || ELEVENLABS_VOICES[0];
      display.textContent = `${selectedVoice.name} - ${selectedVoice.style}`;
    } else {
      display.textContent = `${SPEECHIFY_VOICES[0].name} - ${SPEECHIFY_VOICES[0].style}`;
    }
  }

  function selectSpeechifyVoice(voiceId, voiceName, voiceStyle) {
    if (window.selectSpeechifyVoiceNew && typeof window.selectSpeechifyVoiceNew === 'function') {
      return window.selectSpeechifyVoiceNew(voiceId, voiceName, voiceStyle);
    }
    // Fallback to old implementation
    selectedVoiceId = voiceId;
    const display = document.getElementById('selectedVoiceDisplay');
    if (display) {
      display.textContent = `${voiceName} - ${voiceStyle}`;
    }
    closeSpeechifyVoiceModal();
    console.log(`✅ Selected Speechify voice: ${voiceName} (${voiceId})`);
  }

  function toggleSpeechifyVoiceModal() {
    if (window.toggleSpeechifyVoiceModalNew && typeof window.toggleSpeechifyVoiceModalNew === 'function') {
      return window.toggleSpeechifyVoiceModalNew();
    }
    // Fallback to old implementation
    const modal = document.getElementById('speechifyVoiceModal');
    if (!modal) return;
    modal.classList.toggle('hidden');
  }

  function closeSpeechifyVoiceModal() {
    if (window.closeSpeechifyVoiceModalNew && typeof window.closeSpeechifyVoiceModalNew === 'function') {
      return window.closeSpeechifyVoiceModalNew();
    }
    // Fallback to old implementation
    const modal = document.getElementById('speechifyVoiceModal');
    if (modal) modal.classList.add('hidden');
  }

  function toggleAdvancedSettings() {
    const panel = document.getElementById('advancedSettingsPanel');
    const arrow = document.getElementById('advancedArrow');
    
    if (!panel || !arrow) return;
    
    if (panel.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      arrow.style.transform = 'rotate(180deg)';
    } else {
      panel.classList.add('hidden');
      arrow.style.transform = 'rotate(0deg)';
    }
  }
  
  // =====================================================================
  // YOUTUBE INTEGRATION - MIGRATED TO src/components/YouTubeIntegration.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  // YouTube OAuth Connection Functions
  function connectYouTube(styleId) {
    if (window.connectYouTubeNew && typeof window.connectYouTubeNew === 'function') {
      return window.connectYouTubeNew(styleId);
    }
    // Fallback to old implementation
    console.log('🎥 Initiating YouTube OAuth connection for style:', styleId);
    
    // Open OAuth popup
    const width = 600;
    const height = 700;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);
    
    const popup = window.open(
      '/api/youtube/auth', 
      'youtube-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // Listen for OAuth callback
    window.addEventListener('message', function(event) {
      if (event.data.type === 'youtube-oauth-success') {
        const { channelId, channelName, channelAvatar, subscribers, accessToken, refreshToken } = event.data;
        
        console.log('✅ YouTube connected:', channelName);
        
        // Update UI
        const connectBtn = document.getElementById(`youtubeConnectBtn-${styleId}`);
        const connectedDisplay = document.getElementById(`youtubeConnectedDisplay-${styleId}`);
        const avatarImg = document.getElementById(`youtubeChannelAvatar-${styleId}`);
        const nameEl = document.getElementById(`youtubeChannelName-${styleId}`);
        const subsEl = document.getElementById(`youtubeChannelSubs-${styleId}`);
        
        if (connectBtn) connectBtn.classList.add('hidden');
        if (connectedDisplay) connectedDisplay.classList.remove('hidden');
        if (avatarImg) avatarImg.src = channelAvatar;
        if (nameEl) nameEl.textContent = channelName;
        if (subsEl) subsEl.textContent = `${subscribers} subscribers`;
        
        // Update hidden inputs
        document.getElementById(`youtubeConnected-${styleId}`).value = 'true';
        document.getElementById(`youtubeChannelId-${styleId}`).value = channelId;
        document.getElementById(`youtubeAccessToken-${styleId}`).value = accessToken;
        document.getElementById(`youtubeRefreshToken-${styleId}`).value = refreshToken;
        
        popup.close();
      }
    });
  }
  
  function disconnectYouTube(styleId) {
    console.log('🔌 Disconnecting YouTube for style:', styleId);
    
    const connectBtn = document.getElementById(`youtubeConnectBtn-${styleId}`);
    const connectedDisplay = document.getElementById(`youtubeConnectedDisplay-${styleId}`);
    
    if (connectBtn) connectBtn.classList.remove('hidden');
    if (connectedDisplay) connectedDisplay.classList.add('hidden');
    
    // Clear hidden inputs
    document.getElementById(`youtubeConnected-${styleId}`).value = '';
    document.getElementById(`youtubeChannelId-${styleId}`).value = '';
    document.getElementById(`youtubeAccessToken-${styleId}`).value = '';
    document.getElementById(`youtubeRefreshToken-${styleId}`).value = '';
  }
  
  function toggleVoiceDropdown() {
    const dropdown = document.getElementById('voiceDropdownList');
    if (!dropdown) return;
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    setTimeout(() => { document.addEventListener('click', closeVoiceDropdown, { once: true }); });
  }
  function closeVoiceDropdown() {
    const dropdown = document.getElementById('voiceDropdownList');
    if (dropdown) dropdown.style.display = 'none';
  }
  const PLAY_SVG = `
<svg id="fi_702132" viewBox="0 0 397.2 397.2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g>
    <path fill="currentColor" d="M284.2,178l-58-33.6l-57.6-33.2c-5.6-3.2-12-4-17.6-2.4c-5.6,1.6-10.8,5.2-14,10.8
      c-1.2,1.6-1.6,3.6-2.4,5.6c-0.4,1.2-0.4,2.8-0.8,4.4c0,0.4,0,1.2,0,1.6v68v68c0,6.4,2.8,12.4,6.8,16.4c4.4,4.4,10,6.8,16.4,6.8
      c3.6,0,11.2-3.2,13.2-4.4l56.8-32.8h0.4l0.4-0.4l58.8-34c5.6-3.2,9.2-8.4,10.8-14.4c0.4-1.2,0.4-2.8,0.4-4.4
      C297.8,186.8,284.2,178,284.2,178z M276.2,201.6l-58,33.6c-0.4,0-0.8,0.4-0.8,0.4l-56.8,32.8c-0.4,0.4-2.4,1.2-3.2,1.2
      s-1.6-0.4-2.4-0.8c-0.4-0.4-0.8-1.6-0.8-2.4v-67.6v-67.6v-0.4c0-0.4,0-0.4,0-0.8c0,0,0-0.4,0.4-0.4c0,0,0.4-0.4,0.4-0.8
      c0.4-0.4,1.2-0.8,1.6-1.2c0.8,0,1.6,0,2,0c0.4,0.4,0.8,0.4,1.2,0.8l56.8,32.8c0.4,0.4,0.8,0.4,0.8,0.4h0.4l58,33.6
      c0.8,0.4,2.4,1.6,2.4,2.8C278.2,199.6,277,201.2,276.2,201.6z"/>
    <path fill="currentColor" d="M339,58.4C300.6,19.6,249.8,0,199,0S97.4,19.2,58.6,58C19.8,97.2,0.2,148,0.2,198.8
      s19.2,101.6,58,140.4s89.6,58,140.4,58c50.8,0,101.6-19.2,140.4-58c38.8-38.8,58-89.6,58-140.4S377.8,97.2,339,58.4z M325,324.8
      c-34.8,34.8-80.4,52.4-126,52.4c-45.6,0-91.2-17.6-126-52.4c-35.2-34.8-52.4-80.4-52.4-126c0-45.6,17.6-91.2,52.4-126
      s80.4-52.4,126-52.4c45.6,0,91.2,17.6,126,52.4s52.4,80.4,52.4,126C377.4,244.4,360.2,290,325,324.8z"/>
  </g>
</svg>`;

  function selectVoice(idx) { selectedVoiceIdx = idx; renderCreateStyle(); }

  let styles = JSON.parse(localStorage.getItem('styles')||'[]');
  let currentStyleIdx = localStorage.getItem('currentStyleIdx') ? parseInt(localStorage.getItem('currentStyleIdx')) : null;
  let styleModalTab = 'create';
  let editingIdx = null;

  function closeStyleModal() { document.getElementById('styleModal').classList.add('hidden'); }
  function showCreateStyle() {
    styleModalTab = 'create';
    document.getElementById('tabCreateStyle').classList.add('active');
    document.getElementById('tabStyleList').classList.remove('active');
    document.getElementById('createStyleView').classList.remove('hidden');
    document.getElementById('styleListView').classList.add('hidden');
    renderCreateStyle();
    initReferenceVideos();
  }

  function showStyleList() {
    styleModalTab = 'list';
    document.getElementById('tabCreateStyle').classList.remove('active');
    document.getElementById('tabStyleList').classList.add('active');
    document.getElementById('createStyleView').classList.add('hidden');
    document.getElementById('styleListView').classList.remove('hidden');
    document.getElementById('styleListView').innerHTML = renderStyles();
  }
  // =====================================================================
  // STYLE STORAGE - MIGRATED TO src/utils/storage.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  function saveStyles() {
    if (window.appStorage && window.appStorage.saveStyles) {
      return window.appStorage.saveStyles(styles);
    }
    // Fallback to old implementation
    localStorage.setItem('styles', JSON.stringify(styles));
  }

  let previewPlayer = new Audio();
  function driveToStream(url) {
    try {
      if (url.includes('docs.google.com/uc?export=open&id=')) return url;
      const m = url.match(/\/d\/([A-Za-z0-9_-]+)/);
      if (m && m[1]) return `https://docs.google.com/uc?export=open&id=${m[1]}`;
      const id = new URL(url).searchParams.get('id');
      if (id) return `https://docs.google.com/uc?export=open&id=${id}`;
    } catch (e) {}
    return url;
  }
  function playPreview(url) {
    const stream = driveToStream(url);
    previewPlayer.pause(); previewPlayer.currentTime = 0; previewPlayer.src = stream;
    previewPlayer.play().catch(() => {
      alert('Could not play preview. Make sure the file is public and streams (docs.google.com/uc?export=open&id=...).');
    });
  }
  
  // YouTube video preview functions
  function getYouTubeVideoId(url) {
    if (!url) return null;
    
    // Match various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }
  
  function updateYouTubePreview(url) {
    const previewDiv = document.getElementById('youtubePreview');
    const embedIframe = document.getElementById('youtubeEmbed');
    
    if (!previewDiv || !embedIframe) return;
    
    const videoId = getYouTubeVideoId(url);
    
    if (videoId) {
      embedIframe.src = `https://www.youtube.com/embed/${videoId}`;
      previewDiv.classList.remove('hidden');
      console.log('✅ YouTube video loaded:', videoId);
    } else {
      previewDiv.classList.add('hidden');
      embedIframe.src = '';
    }
  }
  
  function clearYouTubePreview() {
    const input = document.getElementById('competitorVideoUrl');
    const previewDiv = document.getElementById('youtubePreview');
    const embedIframe = document.getElementById('youtubeEmbed');
    
    if (input) input.value = '';
    if (embedIframe) embedIframe.src = '';
    if (previewDiv) previewDiv.classList.add('hidden');
  }

  function renderCreateStyle(editing = false) {
    let style = { 
      name: '', 
      wordCount: 2000, 
      lang: 'English', 
      voice: 'aMSt68OGf4xUZAnLpTU8', 
      voiceSpeed: 1,
      voiceProvider: 'premium',
      similarity: 100,
      stability: 100,
      exaggeration: 0,
      speechifySpeed: 1,
      speechifyPitch: 0,
      speechifyVolume: 100,
      youtubeConnected: false,
      youtubeChannelId: '',
      youtubeChannelName: '',
      youtubeChannelAvatar: '',
      youtubeChannelSubs: '',
      youtubeAccessToken: '',
      youtubeRefreshToken: ''
    }; // Juniper - Works with AI33.pro
    if (editing && editingIdx !== null) style = styles[editingIdx];

    // Use the global ELEVENLABS_VOICES array (20 voices)
    let voices = ELEVENLABS_VOICES;

    let langs = ['English', 'Spanish', 'French', 'German'];

    document.getElementById('createStyleView').innerHTML = `
<form onsubmit="event.preventDefault();${editing ? 'submitEditStyle()' : 'submitCreateStyle()'}" class="flex flex-col gap-6">
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
    <div>
      <label class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">Style Name</label>
      <input id="styleName" type="text" required placeholder="Style Name *" value="${style.name || ''}"
        class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700
               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
               placeholder:text-gray-400 dark:placeholder:text-gray-500
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
    </div>
    <div>
      <label class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">Default Word Count (Max: 8000)</label>
      <input id="styleWordCount" type="number" min="1" max="8000" value="${style.wordCount || 2000}"
        class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700
               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
    </div>
    <div>
      <label class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">Language</label>
      <select id="styleLang"
        class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700
               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
        ${langs.map(l => `<option ${l === style.lang ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
    </div>
    <div>
      <label class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">Voice Provider</label>
      <select id="voiceProvider" onchange="switchVoiceProvider()"
        class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700
               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
        <option value="premium" ${(style.voiceProvider || 'premium') === 'premium' ? 'selected' : ''}>Premium (ElevenLabs)</option>
        <option value="non-premium" ${(style.voiceProvider || 'premium') === 'non-premium' ? 'selected' : ''}>Non-Premium (Speechify)</option>
      </select>
    </div>
  </div>
  
  <!-- YouTube Channel Connection & Voice in Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <!-- YouTube Channel Connection -->
    <div>
      <label class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
        🎥 YouTube Channel <span class="font-normal text-gray-500">(optional)</span>
      </label>
      
      <!-- Connected Channel Display -->
      <div id="youtubeConnectedDisplay-${editing ? editingIdx : 'new'}" 
           class="${style.youtubeConnected ? '' : 'hidden'} mb-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <div class="flex items-center gap-3">
          <img id="youtubeChannelAvatar-${editing ? editingIdx : 'new'}" 
               src="${style.youtubeChannelAvatar || ''}" 
               alt="Channel" 
               class="w-10 h-10 rounded-full border-2 border-green-500">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100" id="youtubeChannelName-${editing ? editingIdx : 'new'}">
              ${style.youtubeChannelName || 'Connected Channel'}
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400" id="youtubeChannelSubs-${editing ? editingIdx : 'new'}">
              ${style.youtubeChannelSubs || '0'} subscribers
            </p>
          </div>
          <button type="button" 
                  onclick="disconnectYouTube('${editing ? editingIdx : 'new'}')"
                  class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
            Disconnect
          </button>
        </div>
      </div>
      
      <!-- Connect Button -->
      <button type="button" 
              id="youtubeConnectBtn-${editing ? editingIdx : 'new'}"
              onclick="connectYouTube('${editing ? editingIdx : 'new'}')"
              class="${style.youtubeConnected ? 'hidden' : ''} w-full h-12 px-4 rounded-xl border-2 border-red-300 dark:border-red-700
                     bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20
                     text-gray-900 dark:text-gray-100 font-medium
                     focus:outline-none focus:ring-2 focus:ring-red-500 transition
                     flex items-center justify-center gap-2">
        <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        Connect YouTube Channel
      </button>
      
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Videos created with this style will automatically upload to this channel
      </p>
      
      <!-- Hidden inputs to store connection data -->
      <input type="hidden" id="youtubeConnected-${editing ? editingIdx : 'new'}" value="${style.youtubeConnected || ''}">
      <input type="hidden" id="youtubeChannelId-${editing ? editingIdx : 'new'}" value="${style.youtubeChannelId || ''}">
      <input type="hidden" id="youtubeAccessToken-${editing ? editingIdx : 'new'}" value="${style.youtubeAccessToken || ''}">
      <input type="hidden" id="youtubeRefreshToken-${editing ? editingIdx : 'new'}" value="${style.youtubeRefreshToken || ''}">
    </div>
    
    <!-- VOICE SELECTION (Narrower) -->
    <div>
      <label class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
        <span id="voiceLabel">Voice (21 ElevenLabs Voices)</span>
      </label>
      <div class="relative">
        <!-- Selected Voice Display -->
        <button type="button" onclick="toggleVoiceDropdownModal()" 
                class="w-full h-12 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       hover:border-gray-400 dark:hover:border-gray-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       flex items-center justify-between transition cursor-pointer">
          <span id="selectedVoiceDisplay">
            ${voices.find(v => v.id === (style.voice || 'aMSt68OGf4xUZAnLpTU8'))?.name || 'Juniper'} - 
            ${voices.find(v => v.id === (style.voice || 'aMSt68OGf4xUZAnLpTU8'))?.style || 'Calm and professional'}
          </span>
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <!-- Voice Dropdown Modal -->
        <div id="voiceDropdownModal" 
             class="hidden fixed inset-0 z-[70] bg-black/50 dark:bg-black/70 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
                      w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Select Voice</h3>
              <button type="button" onclick="closeVoiceDropdownModal()" 
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">
                ×
              </button>
            </div>
            
            <!-- Voice List -->
            <div class="flex-1 overflow-y-auto p-4">
              <div class="space-y-2">
                ${voices.map((v, idx) => `
                  <div onclick="selectVoiceFromModal('${v.id}', '${v.name}', '${v.style}')"
                       class="voice-option-card flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700
                              hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20
                              cursor-pointer transition group ${(style.voice || '21m00Tcm4TlvDq8ikWAM') === v.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}">
                    <!-- Avatar Icon -->
                    <div class="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 
                                flex items-center justify-center text-white font-bold text-lg">
                      ${v.name.charAt(0)}
                    </div>
                    
                    <!-- Voice Info -->
                    <div class="flex-1 min-w-0">
                      <h4 class="font-bold text-gray-900 dark:text-gray-100">${v.name}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">${v.style}</p>
                    </div>
                    
                    <!-- Play Preview Button -->
                    <button type="button" 
                            onclick="event.stopPropagation(); playVoicePreview('${v.id}', '${v.name}')"
                            class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 
                                   flex items-center justify-center text-white transition transform hover:scale-110"
                            title="Preview ${v.name}">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- Footer with info -->
            <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
                Click the play button (▶) to preview each voice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
      <input type="hidden" id="styleVoice" value="${style.voice || voices[0].id}">
    </div>
  </div>
  <!-- End YouTube Channel & Voice Grid -->

  <div class="mt-4">
    <div class="flex items-center gap-2 mb-2">
      <label class="text-sm font-semibold text-gray-800 dark:text-gray-200">
        📊 Competitor Video URL <span class="font-normal text-gray-500">(optional)</span>
      </label>
      <span class="cursor-help text-xs text-gray-500"
            title="AI will analyze the structure and style (not copy word-for-word) from this video">ⓘ</span>
    </div>
    <input id="competitorVideoUrl" type="url" placeholder="https://youtube.com/watch?v=..."
           value="${style.competitorUrl || ''}"
           oninput="updateYouTubePreview(this.value)"
           class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      AI will analyze this video's structure and pacing style, then create similar content (not word-for-word)
    </p>
    
    <!-- YouTube Video Preview -->
    <div id="youtubePreview" class="mt-3 hidden">
      <div class="relative w-full rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 shadow-lg" 
           style="padding-bottom: 56.25%;">
        <iframe id="youtubeEmbed" 
                class="absolute top-0 left-0 w-full h-full"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
      </div>
      <button type="button" onclick="clearYouTubePreview()" 
              class="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
        × Remove video
      </button>
    </div>
  </div>

  <div class="mt-1" id="additionalContextWrap">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <h1 class="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Additional Context <span class="font-normal text-gray-500">(optional)</span>
        </h1>
        <span class="cursor-help text-xs text-gray-500"
              title="Add any notes, background info, or specific instructions to guide the writing.">ⓘ</span>
      </div>
      <div class="flex items-center gap-3">
        <button type="button" id="ctxClearBtn"
                class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          Clear
        </button>
        <span class="text-xs tabular-nums text-gray-500 dark:text-gray-400">
          <span id="ctxCount">0</span>/<span id="ctxMax">2000</span>
        </span>
      </div>
    </div>
    <textarea id="additionalContext" placeholder="Write any background information or extra instructions here..."
              rows="4" data-maxlen="2000"
              class="mt-2 w-full h-40 rounded-2xl border border-gray-300 dark:border-gray-700
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     p-4 resize-none leading-6"></textarea>
    <p id="ctxHint" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      Tip: Include the target audience, tone, structure, must-include points, and any do/don't rules.
    </p>
  </div>

  <div>
    <button type="button" onclick="toggleAdvanced()" 
            class="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition">
      <span>Advanced Settings</span>
      <svg id="advancedArrow" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
    
    <div id="advancedSettings" class="mt-4 space-y-6 ${style.voiceSpeed && style.voiceSpeed !== 1 ? '' : 'hidden'}
                                      p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      
      <!-- Script Controls Section -->
      <div class="pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-4">Script Controls</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Control how the script is generated</p>
        
        <div class="space-y-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="provideOwnScript" 
                   class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500">
            <span class="text-sm text-gray-700 dark:text-gray-300">Provide my own script</span>
            <span class="text-xs text-gray-500">ⓘ</span>
          </label>
        </div>
        
        <div class="mt-4">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Script Writing Mode
            <span class="text-xs text-gray-500 ml-1">ⓘ</span>
          </label>
          <select id="scriptWritingMode" 
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="slow">Slow (Beta)</option>
            <option value="normal" selected>Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>
      
      <!-- Voice Controls Section -->
      <div>
        <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-4">Voice Controls</h3>
        
        <!-- ElevenLabs Controls (Premium) -->
        <div id="elevenlabsAdvancedControls" class="${(style.voiceProvider || 'premium') === 'premium' ? '' : 'hidden'}">
          <!-- Voice Speed -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Speed</label>
              <span id="speedLabel" class="text-sm font-semibold text-gray-900 dark:text-gray-100">${style.voiceSpeed || 1}x</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-500 w-10">80%</span>
              <input id="styleVoiceSpeed" type="range" min="0.8" max="1.2" step="0.01" value="${style.voiceSpeed || 1}"
                     oninput="document.getElementById('speedLabel').textContent=(this.value+'x')"
                     class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 
                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                            [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer">
              <span class="text-xs text-gray-500 w-10 text-right">120%</span>
            </div>
          </div>
          
          <!-- Similarity -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Similarity</label>
              <span id="similarityLabel" class="text-sm font-semibold text-gray-900 dark:text-gray-100">${style.similarity || 100}%</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-500 w-10">0%</span>
              <input id="styleSimilarity" type="range" min="0" max="100" step="1" value="${style.similarity || 100}"
                     oninput="document.getElementById('similarityLabel').textContent=(this.value+'%')"
                     class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 
                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                            [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer">
              <span class="text-xs text-gray-500 w-10 text-right">100%</span>
            </div>
          </div>
          
          <!-- Stability -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Stability</label>
              <span id="stabilityLabel" class="text-sm font-semibold text-gray-900 dark:text-gray-100">${style.stability || 100}%</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-500 w-10">0%</span>
              <input id="styleStability" type="range" min="0" max="100" step="1" value="${style.stability || 100}"
                     oninput="document.getElementById('stabilityLabel').textContent=(this.value+'%')"
                     class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 
                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                            [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer">
              <span class="text-xs text-gray-500 w-10 text-right">100%</span>
            </div>
          </div>
          
          <!-- Exaggeration -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Exaggeration</label>
              <span id="exaggerationLabel" class="text-sm font-semibold text-gray-900 dark:text-gray-100">${style.exaggeration || 0}%</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-500 w-10">0%</span>
              <input id="styleExaggeration" type="range" min="0" max="100" step="1" value="${style.exaggeration || 0}"
                     oninput="document.getElementById('exaggerationLabel').textContent=(this.value+'%')"
                     class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 
                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                            [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer">
              <span class="text-xs text-gray-500 w-10 text-right">100%</span>
            </div>
          </div>
        </div>
        
        <!-- Speechify Controls (Non-Premium) -->
        <div id="speechifyAdvancedControls" class="${(style.voiceProvider || 'premium') === 'non-premium' ? '' : 'hidden'}">
          <!-- Speed -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Speed</label>
              <span id="speechifySpeedLabel" class="text-sm font-semibold text-gray-900 dark:text-gray-100">${style.speechifySpeed || 1}x</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-500 w-10">0.5x</span>
              <input id="speechifySpeed" type="range" min="0.5" max="2" step="0.1" value="${style.speechifySpeed || 1}"
                     oninput="document.getElementById('speechifySpeedLabel').textContent=(this.value+'x')"
                     class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 
                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                            [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer">
              <span class="text-xs text-gray-500 w-10 text-right">2x</span>
            </div>
          </div>
          
          <!-- Pitch -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Pitch</label>
              <span id="speechifyPitchLabel" class="text-sm font-semibold text-gray-900 dark:text-gray-100">${style.speechifyPitch || 0}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-500 w-10">-10</span>
              <input id="speechifyPitch" type="range" min="-10" max="10" step="1" value="${style.speechifyPitch || 0}"
                     oninput="document.getElementById('speechifyPitchLabel').textContent=this.value"
                     class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 
                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                            [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer">
              <span class="text-xs text-gray-500 w-10 text-right">+10</span>
            </div>
          </div>
          
          <!-- Volume -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Volume</label>
              <span id="speechifyVolumeLabel" class="text-sm font-semibold text-gray-900 dark:text-gray-100">${style.speechifyVolume || 100}%</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-500 w-10">0%</span>
              <input id="speechifyVolume" type="range" min="0" max="100" step="1" value="${style.speechifyVolume || 100}"
                     oninput="document.getElementById('speechifyVolumeLabel').textContent=(this.value+'%')"
                     class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 
                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                            [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer">
              <span class="text-xs text-gray-500 w-10 text-right">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <button id="createStyleBtn" type="submit"
          class="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition">
    ${editing ? 'Save Changes' : 'Create Style'}
  </button>
</form>`;
    
    // Add voice preview functionality after form is rendered
    setTimeout(() => {
      const voiceSelect = document.getElementById('styleVoiceSelect');
      const previewBtn = document.getElementById('previewVoiceBtn');
      
      if (previewBtn && voiceSelect) {
        // ElevenLabs voice sample URLs
        const voiceSamples = {
          "21m00Tcm4TlvDq8ikWAM": "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/51827e1e-fe28-40bb-9677-54a5196b7ff7.mp3",
          "AZnzlk1XvdvUeBnXmlld": "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/5d0e8272-10de-4508-8f0e-aa98936b5db8.mp3",
          "EXAVITQu4vr4xnSDxMaL": "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/5e5d36f0-6e08-4f6d-94f4-e18b85c1b13d.mp3",
          "ErXwobaYiN019PkySvjV": "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/b554c2c1-dd66-4fe0-9e6e-2ee7b0c991a8.mp3",
          "MF3mGyEYCl7XYWbV9V6O": "https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/cb78816b-9d2d-4478-b2a8-b69dec13e04c.mp3",
          "TxGEqnHWrfWFTfGW9XjX": "https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/c6c80e1e-c725-43b0-a368-db21b9278a7f.mp3",
          "VR6AewLTigWG4xSOukaG": "https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/0db23d41-ad0d-4247-a3db-d21c42ff9c66.mp3",
          "pNInz6obpgDQGcFmaJgB": "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/98a34ef2-5c3d-4d4c-9a7a-b78cdc3e2a05.mp3",
          "yoZ06aMxZJJ28mfd3POQ": "https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/6c311dd8-d05d-48d8-b386-a2cf5e0d03ba.mp3",
          "CwhRBWXzGAHq8TQ4Fs17": "https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs17/64e24c7a-bd17-4b45-ab8e-d45d3e466bd8.mp3",
          "ODq5zmih8GrVes37Dizd": "https://storage.googleapis.com/eleven-public-prod/premade/voices/ODq5zmih8GrVes37Dizd/a502ae24-8b8d-4109-ae18-bbe6e9c4e9f8.mp3",
          "IKne3meq5aSn9XLyUdCD": "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-43e0-a1f1-111fa75c5481.mp3",
          "onwK4e9ZLuTAKqWW03F9": "https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/f998500f-6266-4274-a8de-b3d6f0e7407e.mp3",
          "pFZP5JQG7iQjIQuC4Bku": "https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68b35-e0ad-4889-8c38-733f73f593de.mp3",
          "XB0fDUnXU5powFXDhCwa": "https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/942356dc-f10d-4d89-bda5-4f8505ee038b.mp3",
          "iP95p4xoKVk53GoZ742B": "https://storage.googleapis.com/eleven-public-prod/premade/voices/iP95p4xoKVk53GoZ742B/c170d297-64fb-43e5-ad47-4009561f6c1d.mp3",
          "nPczCjzI2devNBz1zQrb": "https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/65d80f52-703f-4cae-a91d-75d4e200ed02.mp3",
          "N2lVS1w4EtoT3dr4eOWO": "https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/ac833bd8-ffda-4938-9ebc-b0f99ca25481.mp3",
          "Zlb1dXrM653N07WRdFW3": "https://storage.googleapis.com/eleven-public-prod/premade/voices/Zlb1dXrM653N07WRdFW3/bb0de50c-84c7-40cd-a09b-6ff7e1713d86.mp3",
          "ThT5KcBeYPX3keUQqHPh": "https://storage.googleapis.com/eleven-public-prod/premade/voices/ThT5KcBeYPX3keUQqHPh/28b5aa82-7ec9-4a70-a552-fdb17285b97a.mp3"
        };
        
        let currentAudio = null;
        
        previewBtn.onclick = function(e) {
          e.preventDefault();
          const selectedVoiceId = voiceSelect.value;
          const sampleUrl = voiceSamples[selectedVoiceId];
          
          if (!sampleUrl) {
            alert('Preview not available for this voice');
            return;
          }
          
          // Stop any currently playing audio
          if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
          }
          
          previewBtn.disabled = true;
          previewBtn.innerHTML = '<div class="inline-block w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div> Playing...';
          
          currentAudio = new Audio(sampleUrl);
          
          currentAudio.onended = function() {
            previewBtn.disabled = false;
            previewBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Preview Voice';
            currentAudio = null;
          };
          
          currentAudio.onerror = function() {
            previewBtn.disabled = false;
            previewBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Preview Voice';
            alert('Could not play preview audio');
            currentAudio = null;
          };
          
          currentAudio.play().catch(err => {
            previewBtn.disabled = false;
            previewBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Preview Voice';
            alert('Could not play preview: ' + err.message);
          });
        };
      }
    }, 100);
  }

  function renderStyles() {
    let html = '';
    if (styles.length === 0) {
      html = `<div class="py-8 text-center text-gray-500 dark:text-gray-400">
        No styles yet.<br>
        <button onclick="showCreateStyle()" class="mt-4 px-4 py-2 rounded-lg font-semibold
                        bg-primary-600 hover:bg-primary-700 text-white transition">
          Create Style
        </button>
      </div>`;
    } else {
      html += `<div class="flex flex-col gap-3 max-h-[270px] overflow-y-auto pr-1">`;
      styles.forEach((s, idx) => {
        const active = currentStyleIdx === idx;
        html += `
        <div class="group flex items-center justify-between gap-3 rounded-2xl border transition-all
          ${active ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800'
                   : 'bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700'}
          hover:shadow-md hover:-translate-y-[1px]">
          <div class="px-4 py-3">
            <div class="font-semibold text-gray-900 dark:text-gray-100">
              ${s.name}
              ${active ? '<span class="ml-2 align-[2px] text-[11px] px-2 py-[2px] rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Selected</span>' : ''}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              ${s.wordCount} words &nbsp;|&nbsp; ${s.lang} &nbsp;|&nbsp; ${s.voice} &nbsp;|&nbsp; ${parseFloat(s.voiceSpeed).toFixed(2)}x
            </div>
          </div>
          <div class="flex items-center gap-2 pr-3 pb-2 pt-2">
            ${active
              ? `<button onclick="useStyle(${idx})" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition">On</button>`
              : `<button onclick="useStyle(${idx})" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white transition">Off</button>`}
            <button onclick="editStyle(${idx})" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white transition">Edit</button>
            <button onclick="deleteStyle(${idx})" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition">Delete</button>
          </div>
        </div>`;
      });
      html += `</div>
      <button onclick="showCreateStyle()" class="mt-5 w-full px-4 py-2 rounded-xl font-semibold
                     bg-primary-600 hover:bg-primary-700 text-white transition">
        Create Style
      </button>`;
    }
    return html;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('styleModal');
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      const panel = modal.querySelector('.modal-panel');
      if (panel && !panel.contains(e.target)) closeStyleModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeStyleModal();
    });
  });

  function toggleAdvanced() {
    let el = document.getElementById('advancedSettings');
    let arrow = document.getElementById('advancedArrow');
    el.classList.toggle('hidden');
    if (arrow) {
      arrow.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  }

  function submitCreateStyle() {
    const referenceUrls = (window.getReferenceUrls ? window.getReferenceUrls() : []);
    let wordCount = parseInt(document.getElementById('styleWordCount').value) || 2000;
    if (wordCount > 8000) {
      alert('Maximum word count is 8000 words.');
      wordCount = 8000;
      document.getElementById('styleWordCount').value = 8000;
    }
    
    // Get voice ID from either the hidden input or global variable
    let voiceId = selectedVoiceId || document.getElementById('styleVoiceSelect')?.value || 'aMSt68OGf4xUZAnLpTU8'; // Juniper - Works with AI33.pro
    
    const s = {
      name: document.getElementById('styleName').value.trim(),
      wordCount: wordCount,
      lang: document.getElementById('styleLang').value,
      voice: voiceId,
      voiceSpeed: parseFloat(document.getElementById('styleVoiceSpeed')?.value || 1) || 1,
      voiceProvider: document.getElementById('voiceProvider')?.value || 'premium',
      similarity: parseInt(document.getElementById('styleSimilarity')?.value || 100) || 100,
      stability: parseInt(document.getElementById('styleStability')?.value || 100) || 100,
      exaggeration: parseInt(document.getElementById('styleExaggeration')?.value || 0) || 0,
      speechifySpeed: parseFloat(document.getElementById('speechifySpeed')?.value || 1) || 1,
      speechifyPitch: parseInt(document.getElementById('speechifyPitch')?.value || 0) || 0,
      speechifyVolume: parseInt(document.getElementById('speechifyVolume')?.value || 100) || 100,
      youtubeConnected: document.getElementById('youtubeConnected-new')?.value === 'true',
      youtubeChannelId: document.getElementById('youtubeChannelId-new')?.value || '',
      youtubeChannelName: document.getElementById('youtubeChannelName-new')?.textContent || '',
      youtubeChannelAvatar: document.getElementById('youtubeChannelAvatar-new')?.src || '',
      youtubeChannelSubs: document.getElementById('youtubeChannelSubs-new')?.textContent || '',
      youtubeAccessToken: document.getElementById('youtubeAccessToken-new')?.value || '',
      youtubeRefreshToken: document.getElementById('youtubeRefreshToken-new')?.value || '',
      competitorUrl: document.getElementById('competitorVideoUrl')?.value.trim() || '',
      referenceUrls,
      context: document.getElementById('additionalContext').value.trim()
    };
    
    console.log('=== Saving New Style ===');
    console.log('Style data:', s);
    console.log('Voice settings:', {
      id: s.voice,
      speed: s.voiceSpeed,
      similarity: s.similarity,
      stability: s.stability,
      exaggeration: s.exaggeration
    });
    
    styles.push(s);
    saveStyles();
    currentStyleIdx = styles.length - 1;
    localStorage.setItem('currentStyleIdx', currentStyleIdx);
    showStyleList();
  }

  function useStyle(idx) {
    if (currentStyleIdx === idx) {
      currentStyleIdx = null;
      localStorage.removeItem('currentStyleIdx');
      document.getElementById('additionalContextHidden').value = '';
      window.additionalContext = '';
      document.getElementById('icon').classList.remove('icon-active');
    } else {
      currentStyleIdx = idx;
      localStorage.setItem('currentStyleIdx', idx);
      const s = styles[idx];
      if (document.getElementById('mainWordCount')) {
        document.getElementById('mainWordCount').value = s.wordCount;
        document.getElementById('mainWordCount').dispatchEvent(new Event('input'));
      }
      document.getElementById('count-text').textContent = s.wordCount;
      const ctxVal = s.context || '';
      document.getElementById('additionalContextHidden').value = ctxVal;
      window.additionalContext = ctxVal;
      const icon = document.getElementById('icon');
      if (ctxVal.length > 0) icon.classList.add('icon-active');
      else icon.classList.remove('icon-active');
    }
    document.getElementById('styleListView').innerHTML = renderStyles();
    closeStyleModal();
  }

  function deleteStyle(idx) {
    if(confirm("Delete this style?")) {
      styles.splice(idx,1);
      if(currentStyleIdx>=styles.length) currentStyleIdx = styles.length-1;
      saveStyles();
      localStorage.setItem('currentStyleIdx',currentStyleIdx);
      document.getElementById('styleListView').innerHTML = renderStyles();
    }
  }

  function editStyle(idx) {
    editingIdx = idx;
    showCreateStyle();
    renderCreateStyle(true);
    const btn = document.getElementById('createStyleBtn');
    if (btn) btn.disabled = false;
  }

  function submitEditStyle() {
    let wordCount = parseInt(document.getElementById('styleWordCount').value) || 2000;
    if (wordCount > 8000) {
      alert('Maximum word count is 8000 words.');
      wordCount = 8000;
    }
    const s = {
      name: document.getElementById('styleName').value.trim(),
      wordCount: wordCount,
      lang: document.getElementById('styleLang').value,
      voice: selectedVoiceId || document.getElementById('styleVoiceSelect')?.value || 'aMSt68OGf4xUZAnLpTU8',
      voiceSpeed: parseFloat(document.getElementById('styleVoiceSpeed')?.value || 1) || 1,
      voiceProvider: document.getElementById('voiceProvider')?.value || 'premium',
      similarity: parseInt(document.getElementById('styleSimilarity')?.value || 100) || 100,
      stability: parseInt(document.getElementById('styleStability')?.value || 100) || 100,
      exaggeration: parseInt(document.getElementById('styleExaggeration')?.value || 0) || 0,
      speechifySpeed: parseFloat(document.getElementById('speechifySpeed')?.value || 1) || 1,
      speechifyPitch: parseInt(document.getElementById('speechifyPitch')?.value || 0) || 0,
      speechifyVolume: parseInt(document.getElementById('speechifyVolume')?.value || 100) || 100,
      youtubeConnected: document.getElementById(`youtubeConnected-${editingIdx}`)?.value === 'true',
      youtubeChannelId: document.getElementById(`youtubeChannelId-${editingIdx}`)?.value || '',
      youtubeChannelName: document.getElementById(`youtubeChannelName-${editingIdx}`)?.textContent || '',
      youtubeChannelAvatar: document.getElementById(`youtubeChannelAvatar-${editingIdx}`)?.src || '',
      youtubeChannelSubs: document.getElementById(`youtubeChannelSubs-${editingIdx}`)?.textContent || '',
      youtubeAccessToken: document.getElementById(`youtubeAccessToken-${editingIdx}`)?.value || '',
      youtubeRefreshToken: document.getElementById(`youtubeRefreshToken-${editingIdx}`)?.value || '',
      competitorUrl: document.getElementById('competitorVideoUrl')?.value.trim() || '',
      context: document.getElementById('additionalContext').value.trim(),
    };
    styles[editingIdx] = s;
    saveStyles();
    showStyleList();
    editingIdx = null;
  }

  function cancelEdit() { editingIdx = null; showStyleList(); }

  document.addEventListener('DOMContentLoaded', () => {
    showCreateStyle();
    if(styles.length && currentStyleIdx!==null && styles[currentStyleIdx]) useStyle(currentStyleIdx);
  });



function getOrCreatePill(row) {
  let el = row.querySelector(".status-pill");
  if (!el) {
    el = document.createElement("span");
    el.className = "status-pill inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
    row.appendChild(el);
  }
  return el;
}

function setPill(el, tone, text) {
  el.textContent = text;
  el.className = "status-pill inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium " +
    (tone === "good" ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
      : tone === "bad" ? "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800"
      : tone === "warn" ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800"
      : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700");
}

function getYouTubeIdFast(str) {
  if (!str) return null;
  if (!/(youtu\.be|youtube\.com)/i.test(str)) return null;
  let m = str.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
  if (m) return m[1];
  m = str.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
  if (m) return m[1];
  m = str.match(/\/shorts\/([A-Za-z0-9_-]{6,})/i);
  if (m) return m[1];
  return null;
}

function normalizeYouTubeFast(url) {
  const id = getYouTubeIdFast(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}



function initReferenceVideos() {
  const CREATE_BTN_ID = "createStyleBtn";
  const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
  const refWarn = document.getElementById("refWarn");
  const refList = document.getElementById("refList");
  const addBtn = document.getElementById("refAddBtn");
  const createBtn = document.getElementById(CREATE_BTN_ID);
  if (!refList || !addBtn) return;
  if (createBtn) createBtn.disabled = false;

  function pill(text, tone = "info") {
    const colors = {
      info: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      bad: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
      warn: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
      good: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800",
    };
    const span = document.createElement("span");
    span.className = `inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors[tone] || colors.info}`;
    span.textContent = text;
    return span;
  }

  function normalizeYouTube(url) {
    try {
      const u = new URL(url);
      if (!YT_REGEX.test(u.href)) return null;
      return u.href;
    } catch { return null; }
  }

  function addRow(initialValue = "") {
    const row = document.createElement("div");
    row.className = "flex items-center gap-2 rounded-xl border border-gray-200 p-2 dark:border-gray-700";
    const input = document.createElement("input");
    input.type = "url";
    input.placeholder = "https://www.youtube.com/watch?v=...";
    input.value = initialValue;
    input.className = "flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
    const status = pill("Optional", "info");
    status.classList.add("status-pill");
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.title = "Remove";
    removeBtn.className = "rounded-lg px-2 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800";
    removeBtn.textContent = "➖";
    row.appendChild(input);
    row.appendChild(status);
    row.appendChild(removeBtn);
    refList.appendChild(row);

    const pillEl = getOrCreatePill(row);
    setPill(pillEl, "info", "Optional");

    function validate() {
      const v = input.value.trim();
      let pillEl = row.querySelector(".status-pill");
      if (!pillEl) {
        pillEl = pill("Optional", "info");
        pillEl.classList.add("status-pill");
        row.appendChild(pillEl);
      }
      if (!v) {
        const fresh = pill("Optional", "info");
        fresh.classList.add("status-pill");
        row.replaceChild(fresh, pillEl);
        return;
      }
      const norm = normalizeYouTube(v);
      if (norm) {
        input.value = norm;
        const fresh = pill("OK", "good");
        fresh.classList.add("status-pill");
        row.replaceChild(fresh, pillEl);
      } else {
        const fresh = pill("Invalid URL", "bad");
        fresh.classList.add("status-pill");
        row.replaceChild(fresh, pillEl);
      }
    }

    input.addEventListener("input", () => {
      let pillEl = row.querySelector(".status-pill");
      if (!pillEl) {
        pillEl = pill("Optional", "info");
        pillEl.classList.add("status-pill");
        row.appendChild(pillEl);
      }
      const v = input.value.trim();
      const fresh = pill(v ? "Checking…" : "Optional", v ? "warn" : "info");
      fresh.classList.add("status-pill");
      row.replaceChild(fresh, pillEl);
    });

    removeBtn.addEventListener("click", () => row.remove());
    validate();
  }

  window.getReferenceUrls = () => {
    const urls = [];
    refList.querySelectorAll("input[type='url']").forEach(i => {
      const v = i.value.trim();
      const norm = normalizeYouTube(v);
      if (norm) urls.push(norm);
    });
    return urls;
  };

  if (createBtn) createBtn.disabled = false;
  addBtn.addEventListener("click", () => addRow(""));
  addRow("");
}


(() => {
  // =====================================================================
  // TITLE GENERATION COSTS - MIGRATED TO src/utils/constants.js
  // TODO: Remove after full migration to new structure
  // =====================================================================
  const COST_CHANNEL = 5;
  const COST_SAMPLES = 3;
  const btn = document.getElementById('titleHelperBtn');
  const menu = document.getElementById('titleMenu');
  const overlay = document.getElementById('titleOverlay');
  const channelModal = document.getElementById('channelModal');
  const channelUrl = document.getElementById('channelUrl');
  const genFromChannelBtn = document.getElementById('genFromChannel');
  const channelResults = document.getElementById('channelResults');
  const samplesModal = document.getElementById('samplesModal');
  const samplesList = document.getElementById('samplesList');
  const addSampleBtn = document.getElementById('addSample');
  const genFromSamplesBtn = document.getElementById('genFromSamples');
  const samplesResults = document.getElementById('samplesResults');
  const videoTitleInput = document.getElementById('video-title');

  function uiBalance() {
    return parseInt(document.getElementById('creditBalance')?.textContent || '0', 10);
  }
  function setUiBalance(v) {
    const el = document.getElementById('creditBalance');
    if (el) el.textContent = v;
  }
  function persistBalance(v) {
    const cu = localStorage.getItem('currentUser');
    if (!cu) return;
    const key = `user_${cu}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    data.credits = v;
    localStorage.setItem(key, JSON.stringify(data));
  }
  function debitCredits(amount) {
    const newBal = Math.max(0, uiBalance() - amount);
    if (typeof window.updateCreditBalance === 'function') {
      window.updateCreditBalance(newBal);
    } else {
      setUiBalance(newBal);
      persistBalance(newBal);
    }
  }
  function ensureCredits(amount) {
    const bal = uiBalance();
    if (bal < amount) {
      alert(`Not enough credits. Need ${amount}, you have ${bal}.`);
      return false;
    }
    return true;
  }

  function isValidHttpUrl(s){
    try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
  }
  function isYouTubeUrl(s){
    try {
      const h = new URL(s).hostname.replace(/^www\./,'').toLowerCase();
      return ['youtube.com','m.youtube.com','youtu.be'].includes(h);
    } catch { return false; }
  }
  function looksLikeUrl(s){
    return /(https?:\/\/|www\.|youtu\.be|youtube\.com|v=|shorts\/)/i.test(s);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });
  document.addEventListener('click', () => menu.classList.add('hidden'));

  document.getElementById('openChannelModal').addEventListener('click', () => {
    openModal(channelModal);
    channelUrl.focus();
  });
  document.getElementById('openSamplesModal').addEventListener('click', () => {
    openModal(samplesModal);
    samplesList.querySelector('input')?.focus();
  });

  function openModal(el) {
    menu.classList.add('hidden');
    overlay.classList.remove('hidden');
    el.classList.remove('hidden');
    el.classList.add('flex');
    document.addEventListener('keydown', escClose);
  }
  function closeModal(el) {
    overlay.classList.add('hidden');
    el.classList.add('hidden');
    el.classList.remove('flex');
    document.removeEventListener('keydown', escClose);
  }
  function escClose(e){
    if(e.key === 'Escape'){
      [channelModal, samplesModal].forEach(m => m.classList.contains('hidden') || closeModal(m));
    }
  }
  overlay.addEventListener('click', () => {
    [channelModal, samplesModal].forEach(m => m.classList.contains('hidden') || closeModal(m));
  });
  document.querySelectorAll('[data-close]').forEach(x => {
    x.addEventListener('click', () => {
      const modal = x.closest('#channelModal, #samplesModal');
      if (modal) closeModal(modal);
    });
  });

  channelUrl.addEventListener('input', () => {
    genFromChannelBtn.disabled = channelUrl.value.trim().length < 8;
  });

  samplesList.addEventListener('input', () => {
    enforceSamplesTextOnly();
    const values = getSampleValues().filter(Boolean);
    const hasUrl = values.some(v => looksLikeUrl(v) || isValidHttpUrl(v));
    genFromSamplesBtn.disabled = values.length === 0 || hasUrl;
  });

  addSampleBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2';
    row.innerHTML = `
      <div class="flex-1">
        <input type="text" placeholder="Type a sample title… (text only)"
               class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
               data-sample>
      </div>
      <button class="px-2 py-2 rounded border" data-remove title="Remove">−</button>`;
    samplesList.appendChild(row);
    row.querySelector('input').focus();
  });
  samplesList.addEventListener('click', (e) => {
    if (e.target.closest('[data-remove]')) {
      const row = e.target.closest('.flex.items-center.gap-2');
      if (row && samplesList.children.length > 1) row.remove();
      const values = getSampleValues().filter(Boolean);
      const hasUrl = values.some(v => looksLikeUrl(v) || isValidHttpUrl(v));
      genFromSamplesBtn.disabled = values.length === 0 || hasUrl;
    }
  });

  function enforceSamplesTextOnly(){
    samplesList.querySelectorAll('input').forEach(inp => {
      const val = (inp.value || '').trim();
      const isUrl = looksLikeUrl(val) || isValidHttpUrl(val);
      inp.classList.toggle('border-red-500', isUrl);
      inp.classList.toggle('ring-1', isUrl);
      inp.classList.toggle('ring-red-400', isUrl);
      inp.title = isUrl ? 'Text only here (no links)' : '';
    });
  }

  genFromChannelBtn.addEventListener('click', async () => {
    const url = channelUrl.value.trim();
    if (!isValidHttpUrl(url) || !isYouTubeUrl(url)) {
      alert('Please enter a valid YouTube channel URL.');
      return;
    }
    if (!ensureCredits(COST_CHANNEL)) return;

    genFromChannelBtn.disabled = true;
    channelResults.classList.remove('hidden');
    channelResults.innerHTML = renderLoading();

    try {
      const ideas = await callClaude(buildChannelPrompt(url));
      const ranked = rankTitles(ideas);
      channelResults.innerHTML = renderTitleChips(ranked, 'channel');
      debitCredits(COST_CHANNEL);
    } catch (e) {
      channelResults.innerHTML = renderError(e);
    } finally {
      genFromChannelBtn.disabled = false;
    }
  });

  genFromSamplesBtn.addEventListener('click', async () => {
    const values = getSampleValues().filter(Boolean);
    const hasUrl = values.some(v => looksLikeUrl(v) || isValidHttpUrl(v));
    if (values.length === 0 || hasUrl) {
      alert('Samples must be text only (no links).');
      return;
    }
    if (!ensureCredits(COST_SAMPLES)) return;

    genFromSamplesBtn.disabled = true;
    samplesResults.classList.remove('hidden');
    samplesResults.innerHTML = renderLoading();

    try {
      const uniqueSamples = uniq(values);
      const ideas = await callClaude(buildSamplesPrompt(uniqueSamples));
      const ranked = rankTitles(ideas);
      samplesResults.innerHTML = renderTitleChips(ranked, 'samples');
      debitCredits(COST_SAMPLES);
    } catch (e) {
      samplesResults.innerHTML = renderError(e);
    } finally {
      genFromSamplesBtn.disabled = false;
    }
  });

  function getSampleValues() {
    return Array.from(samplesList.querySelectorAll('input')).map(i => i.value.trim());
  }
  function renderLoading(){
    return `<div class="text-sm text-gray-500">Generating…</div>`;
  }
  function renderError(e){
    return `<div class="text-sm text-red-500">Failed: ${e.message || 'Please try again.'}</div>`;
  }

  document.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-choose-title]');
    if (!chip) return;
    const title = decodeURIComponent(chip.getAttribute('data-choose-title'));
    videoTitleInput.value = title;
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) generateBtn.disabled = title.trim() === '';
    const src = chip.getAttribute('data-source');
    if (src === 'channel') closeModal(channelModal);
    if (src === 'samples') closeModal(samplesModal);
  });

  function buildSamplesPrompt(sampleTitles){
    const list = sampleTitles.map((t,i)=>`${i+1}. ${t}`).join('\n');
    return `
You are an expert YouTube strategist.
Given these example videos (titles only):
${list}

Propose 12 NEW, highly clickable video title ideas (not duplicates), optimized for 2025.

Rules:
- Prefer 35–65 characters
- Add curiosity/tension without clickbait
- Numbers, "you", brackets (), or year where it helps
- One idea per line; no numbering or extra text.`;
  }
  function buildChannelPrompt(channelLink){
    return `
You are a YouTube strategist. Analyze this channel: ${channelLink}
Infer its niche & current trends. Propose 12 NEW, highly clickable title ideas for the next upload.

- Prefer 35–65 chars, curiosity, fresh 2025 angles
- One idea per line; no numbering or extra text.`;
  }

  async function callClaude(userPrompt){
    const r = await fetch(`${API_BASE_URL}/api/claude`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        prompt: userPrompt,
        max_tokens: 1024
      })
    });
    const j = await r.json();
    if (!r.ok) {
      const msg = j?.error?.message || j?.error || 'Claude API error';
      throw new Error(msg);
    }
    const text = j.content?.[0]?.text || '';
    return splitTitles(text);
  }
  function splitTitles(text){
    return text
      .split('\n')
      .map(s => s.replace(/^\d+[\).\-\s]+/, '').trim())
      .filter(Boolean);
  }

  function scoreTitle(t){
    let score = 60;
    const len = t.length;
    if (len >= 35 && len <= 65) score += 15;
    else if (len >= 28 && len <= 75) score += 8;
    else score -= 8;
    if (/\b\d{1,3}\b/.test(t)) score += 6;
    if (/[()]/.test(t)) score += 4;
    const words = ['secret','truth','mistake','why','how','hack','strategy','danger','crazy','surprising','you','ultimate','2025'];
    const lower = t.toLowerCase();
    score += words.reduce((acc,w)=> acc + (lower.includes(w) ? 3 : 0), 0);
    if (/[A-Z]{6,}/.test(t)) score -= 5;
    return Math.max(0, Math.min(100, score));
  }
  function rankTitles(titles){
    const unique = uniq(titles);
    return unique
      .map(text => ({ text, score: scoreTitle(text) }))
      .sort((a,b) => b.score - a.score);
  }
  function uniq(arr){
    const seen = new Set();
    const out = [];
    for (const s of arr) {
      const k = s.trim().toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        out.push(s.trim());
      }
    }
    return out;
  }
  function renderTitleChips(items, source){
    if (!items || !items.length) return `<div class="text-sm text-gray-500">No ideas found.</div>`;
    return `
      <div class="text-sm text-gray-500 mb-1">Click a title to use it:</div>
      <div class="flex flex-wrap gap-2">
        ${items.map(({text, score}) => `
          <button class="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700
                         hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
                  data-choose-title="${encodeURIComponent(text)}"
                  data-source="${source}">
            <span>${text}</span>
            <span class="text-[10px] font-semibold px-2 py-[2px] rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              ${score}
            </span>
          </button>
        `).join('')}
      </div>`;
  }

  
  // ============ TRANSITION SETTINGS FUNCTIONS ============
  function openTransitionSettings() {
    const currentType = localStorage.getItem('transitionType') || 'fade';
    const currentDuration = localStorage.getItem('transitionDuration') || '0.5';
    
    // ✅ ALWAYS default to 'false' (unchecked) if not explicitly set to 'true'
    // User must manually enable - never auto-enable
    if (localStorage.getItem('enableTransitions') !== 'true') {
      localStorage.setItem('enableTransitions', 'false');
      console.log('🔧 Transitions defaulting to UNCHECKED in settings modal');
    }
    
    const transitionTypes = [
      // LEFT COLUMN - GIRLS (indices 0-9)
      { value: 'fade', name: 'Fade', description: 'Classic crossfade', recommended: '0.5s', useGirls: true },
      { value: 'fadeblack', name: 'Fade Black', description: 'Fade through black', recommended: '1.0s', useGirls: false },
      { value: 'fadewhite', name: 'Fade White', description: 'Fade through white', recommended: '0.8s', useGirls: true },
      { value: 'dissolve', name: 'Dissolve', description: 'Smooth blend', recommended: '0.8s', useGirls: false },
      { value: 'wipeleft', name: 'Wipe Left', description: 'Wipe from right to left', recommended: '0.4s', useGirls: true },
      { value: 'wiperight', name: 'Wipe Right', description: 'Wipe from left to right', recommended: '0.4s', useGirls: false },
      { value: 'wipeup', name: 'Wipe Up', description: 'Wipe from bottom to top', recommended: '0.4s', useGirls: true },
      { value: 'wipedown', name: 'Wipe Down', description: 'Wipe from top to bottom', recommended: '0.4s', useGirls: false },
      { value: 'slideleft', name: 'Slide Left', description: 'Slide left', recommended: '0.5s', useGirls: true },
      { value: 'slideright', name: 'Slide Right', description: 'Slide right', recommended: '0.5s', useGirls: false },
      { value: 'slideup', name: 'Slide Up', description: 'Slide up', recommended: '0.5s', useGirls: true },
      { value: 'slidedown', name: 'Slide Down', description: 'Slide down', recommended: '0.5s', useGirls: false },
      { value: 'circlecrop', name: 'Circle Crop', description: 'Circular crop', recommended: '0.6s', useGirls: true },
      { value: 'circleopen', name: 'Circle Open', description: 'Circle opens', recommended: '0.7s', useGirls: false },
      { value: 'circleclose', name: 'Circle Close', description: 'Circle closes', recommended: '0.7s', useGirls: true },
      { value: 'radial', name: 'Radial', description: 'Radial transition', recommended: '0.6s', useGirls: false },
      { value: 'smoothleft', name: 'Smooth Left', description: 'Smooth slide left', recommended: '0.6s', useGirls: true },
      { value: 'smoothright', name: 'Smooth Right', description: 'Smooth slide right', recommended: '0.6s', useGirls: false },
      { value: 'distance', name: 'Distance', description: 'Distance transform', recommended: '0.8s', useGirls: true },
      { value: 'pixelize', name: 'Pixelize', description: 'Pixelization effect', recommended: '0.5s', useGirls: false }
    ];
    
    // Image URLs
    const girlImage1 = 'https://i.ibb.co/jkCs8Cbv/Untitled-design-27.webp';
    const girlImage2 = 'https://i.ibb.co/Z1R9T33s/Untitled-design-28.webp';
    const boyImage1 = 'https://i.ibb.co/xtvHPKQ2/Untitled-design-21.webp';
    const boyImage2 = 'https://i.ibb.co/spK0PXNW/Untitled-design-22.webp';
    
    const modalHTML = `
      <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" id="transitionModal" onclick="if(event.target.id === 'transitionModal') closeTransitionSettings();">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onclick="event.stopPropagation();">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">🎬 Transition Settings</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose how scenes blend together in your video</p>
              </div>
              <button onclick="closeTransitionSettings()" 
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">
                ×
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            
            <!-- Duration Slider -->
            <div class="mb-8 p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
              <label class="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                Transition Duration: <span id="durationValue" class="text-primary-600 dark:text-primary-400">${currentDuration}s</span>
              </label>
              <input type="range" id="transitionDuration" 
                     min="0.2" max="2.0" step="0.1" value="${currentDuration}"
                     oninput="document.getElementById('durationValue').textContent = this.value + 's'"
                     class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                            [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-primary-600 
                            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer">
              <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                <span>0.2s (Quick)</span>
                <span>1.0s (Balanced)</span>
                <span>2.0s (Dramatic)</span>
              </div>
            </div>
            
            <!-- Enable Transitions Checkbox -->
            <div class="mb-6 p-5 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl">
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" id="enableTransitionsCheckbox" 
                       ${localStorage.getItem('enableTransitions') === 'true' ? 'checked' : ''}
                       class="w-6 h-6 rounded border-2 border-purple-500 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer transition">
                <div class="flex-1">
                  <div class="font-extrabold text-xl text-purple-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-200 transition">
                    Enable Transitions for Full Video
                  </div>
                  <div class="text-sm text-purple-800 dark:text-gray-200 mt-1 font-semibold">
                    Check this box to create a full merged video with transitions. Leave unchecked for individual scenes only.
                  </div>
                </div>
              </label>
            </div>
            
            <!-- Transition Types Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${transitionTypes.map(t => `
                <div id="transition_${t.value}"
                     onclick="selectTransition('${t.value}')"
                     class="transition-card cursor-pointer p-5 rounded-xl border-2 transition-all hover:scale-[1.02] group
                            ${currentType === t.value 
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30' 
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-primary-300 dark:hover:border-primary-600'}">
                  <div class="flex items-start gap-4">
                    <!-- Radio Button -->
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                  ${currentType === t.value 
                                    ? 'border-primary-500 bg-primary-500' 
                                    : 'border-gray-400 dark:border-gray-500 bg-transparent'}">
                        ${currentType === t.value ? '<div class="w-2 h-2 rounded-full bg-white"></div>' : ''}
                      </div>
                    </div>
                    
                    <!-- Info (Left side) -->
                    <div class="flex-1 min-w-0">
                      <h4 class="font-extrabold text-lg mb-1 transition-colors
                                 ${currentType === t.value 
                                   ? 'text-primary-900 dark:text-white group-hover:text-white dark:group-hover:text-white' 
                                   : 'text-gray-900 dark:text-white'}">${t.name}</h4>
                      <p class="text-sm mb-2 font-medium transition-colors
                                ${currentType === t.value 
                                  ? 'text-primary-800 dark:text-gray-300 group-hover:text-white dark:group-hover:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-400'}">${t.description}</p>
                      <div class="inline-block px-2 py-1 rounded text-xs font-bold transition-colors
                                  ${currentType === t.value 
                                    ? 'bg-primary-200 dark:bg-primary-800 text-primary-900 dark:text-primary-100 group-hover:bg-white group-hover:text-primary-700 dark:group-hover:bg-primary-700 dark:group-hover:text-white' 
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}">
                        Recommended: ${t.recommended}
                      </div>
                    </div>
                    
                    <!-- 🎬 REAL IMAGE PREVIEW (Right side) -->
                    <div class="flex-shrink-0">
                      <div class="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <!-- Image 1 (Background) -->
                        <div class="absolute inset-0 transition-preview-img1-${t.value}">
                          <img src="${t.useGirls ? girlImage1 : boyImage1}" 
                               alt="${t.useGirls ? 'Girl 1' : 'Boy 1'}"
                               loading="lazy"
                               class="w-full h-full object-cover object-top" />
                        </div>
                        <!-- Image 2 (Foreground) -->
                        <div class="absolute inset-0 transition-preview-img2-${t.value}">
                          <img src="${t.useGirls ? girlImage2 : boyImage2}" 
                               alt="${t.useGirls ? 'Girl 2' : 'Boy 2'}"
                               loading="lazy"
                               class="w-full h-full object-cover object-top" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <!-- Content Type Recommendations -->
            <div class="mt-8 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <h4 class="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                Recommendations by Content Type
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex gap-2">
                  <span class="font-semibold text-blue-900 dark:text-blue-300 min-w-[140px]">Dramatic Stories:</span>
                  <span class="text-blue-800 dark:text-blue-400">Fade Black (1.0s)</span>
                </div>
                <div class="flex gap-2">
                  <span class="font-semibold text-blue-900 dark:text-blue-300 min-w-[140px]">Fast-Paced:</span>
                  <span class="text-blue-800 dark:text-blue-400">Fade (0.3s)</span>
                </div>
                <div class="flex gap-2">
                  <span class="font-semibold text-blue-900 dark:text-blue-300 min-w-[140px]">Cinematic:</span>
                  <span class="text-blue-800 dark:text-blue-400">Dissolve (0.8s)</span>
                </div>
                <div class="flex gap-2">
                  <span class="font-semibold text-blue-900 dark:text-blue-300 min-w-[140px]">Modern/Creative:</span>
                  <span class="text-blue-800 dark:text-blue-400">Circle Open (0.7s)</span>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                 Save To Create Full Merged Video.
              </p>
              <div class="flex gap-3">
                <button onclick="closeTransitionSettings()" 
                        class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                               text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                               font-medium transition">
                  Cancel
                </button>
                <button onclick="saveTransitionSettings()" 
                        class="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl
                               font-medium transition shadow-lg shadow-primary-500/30">
                  Save 
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Add event delegation for card clicks
    setTimeout(() => {
      const modal = document.getElementById('transitionModal');
      if (modal) {
        // Add click handlers to all cards
        const cards = modal.querySelectorAll('.transition-card');
        cards.forEach(card => {
          card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const transitionType = this.id.replace('transition_', '');
            selectTransition(transitionType);
            
            return false;
          }, true); // Use capture phase
        });
      }
    }, 50);
  }
  
  function closeTransitionSettings() {
    const modal = document.getElementById('transitionModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  }
  
  function selectTransition(type) {
    // Remove selection from all cards
    document.querySelectorAll('.transition-card').forEach(card => {
      // Remove selected classes
      card.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20', 'dark:border-primary-400');
      card.classList.add('border-gray-300', 'dark:border-gray-600', 'bg-white', 'dark:bg-gray-700/50');
      
      // Update radio button
      const radioContainer = card.querySelector('.flex-shrink-0');
      if (radioContainer) {
        const radio = radioContainer.querySelector('.rounded-full');
        if (radio) {
          radio.innerHTML = '';
          radio.classList.remove('border-primary-500', 'bg-primary-500');
          radio.classList.add('border-gray-400', 'dark:border-gray-500', 'bg-transparent');
        }
      }
    });
    
    // Add selection to clicked card
    const selectedCard = document.getElementById(`transition_${type}`);
    if (selectedCard) {
      // Add selected classes
      selectedCard.classList.remove('border-gray-300', 'dark:border-gray-600', 'bg-white', 'dark:bg-gray-700/50');
      selectedCard.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20', 'dark:border-primary-400');
      
      // Update radio button
      const radioContainer = selectedCard.querySelector('.flex-shrink-0');
      if (radioContainer) {
        const radio = radioContainer.querySelector('.rounded-full');
        if (radio) {
          radio.classList.remove('border-gray-400', 'dark:border-gray-500', 'bg-transparent');
          radio.classList.add('border-primary-500', 'bg-primary-500');
          radio.innerHTML = '<div class="w-2 h-2 rounded-full bg-white"></div>';
        }
      }
    }
    
    return false;
  }
  
  function saveTransitionSettings() {
    // Find selected card by checking classes
    let selectedCard = null;
    document.querySelectorAll('.transition-card').forEach(card => {
      if (card.classList.contains('border-primary-500')) {
        selectedCard = card;
      }
    });
    
    // If no card selected, use default 'fade'
    let transitionType = 'fade';
    if (selectedCard) {
      transitionType = selectedCard.id.replace('transition_', '');
    }
    
    const duration = document.getElementById('transitionDuration').value;
    const checkboxElement = document.getElementById('enableTransitionsCheckbox');
    
    // 🔍 DEBUG: Log checkbox state
    console.log('🔍 DEBUG - Checkbox element:', checkboxElement);
    console.log('🔍 DEBUG - Checkbox checked:', checkboxElement ? checkboxElement.checked : 'ELEMENT NOT FOUND!');
    
    const enableTransitions = checkboxElement ? checkboxElement.checked : false;
    
    localStorage.setItem('transitionType', transitionType);
    localStorage.setItem('transitionDuration', duration);
    localStorage.setItem('enableTransitions', String(enableTransitions)); // Explicitly convert to string
    
    console.log('✅ Transition settings saved:', { 
      type: transitionType, 
      duration: duration + 's',
      enableTransitions: enableTransitions,
      enableTransitionsString: String(enableTransitions)
    });
    
    // Verify it was saved
    console.log('🔍 Verification - localStorage value:', localStorage.getItem('enableTransitions'));
    
    // Show success message
    const btn = document.querySelector('#transitionModal button[onclick="saveTransitionSettings()"]');
    const originalText = btn.textContent;
    btn.innerHTML = '✅ Saved!';
    btn.disabled = true;
    
    setTimeout(() => {
      closeTransitionSettings();
    }, 800);
  }

  // ============ SCRIPT HELPER FUNCTIONS ============
  function copyScriptToClipboard(buttonElement) {
    if (!currentProjectData || !currentProjectData.script) {
      alert('No script to copy!');
      return;
    }
    
    navigator.clipboard.writeText(currentProjectData.script).then(() => {
      // Show temporary success message with better visual feedback
      const btn = buttonElement || event?.target?.closest('button');
      if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
        }, 1500);
      }
      console.log('✅ Script copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy script:', err);
      alert('Failed to copy script: ' + err.message);
    });
  }
  
  function downloadScriptFile() {
    if (!currentProjectData || !currentProjectData.script) {
      alert('No script to download!');
      return;
    }
    
    // Get the first 3 words of the script
    const words = currentProjectData.script.trim().split(/\s+/);
    const firstThreeWords = words.slice(0, 3).join('-');
    
    // Clean the filename (remove special characters, make lowercase)
    const cleanFilename = firstThreeWords.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    const blob = new Blob([currentProjectData.script], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFilename + '.txt';
    link.click();
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Script downloaded as:', cleanFilename + '.txt');
  }
  
  // ============ REGENERATE MODAL FUNCTIONS ============
  let currentRegenerateIndex = null;
  
  function openRegenerateModal(index) {
    // 🚨 FIX #3: Better error handling for regenerate
    if (!generatedScenes) {
      console.error('❌ No scenes available - generatedScenes is null/undefined');
      alert('⚠️ No scenes available. Please generate images first!');
      return;
    }
    
    if (!generatedScenes[index]) {
      console.error(`❌ Invalid scene index: ${index} (total scenes: ${generatedScenes.length})`);
      alert(`⚠️ Scene ${index + 1} not found. Please try generating images again.`);
      return;
    }
    
    currentRegenerateIndex = index;
    const scene = generatedScenes[index];
    
    console.log(`🔄 Opening regenerate modal for scene ${index + 1}/${generatedScenes.length}`);
    
    const modal = document.getElementById('regenerateModal');
    const promptInput = document.getElementById('regeneratePromptInput');
    
    if (modal && promptInput) {
      promptInput.value = scene.prompt;
      modal.classList.remove('hidden');
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      console.error('❌ Regenerate modal elements not found in DOM');
      alert('⚠️ Modal not found. Please refresh the page and try again.');
    }
  }
  
  function closeRegenerateModal() {
    const modal = document.getElementById('regenerateModal');
    if (modal) {
      modal.classList.add('hidden');
      currentRegenerateIndex = null;
      // Unlock body scroll
      document.body.style.overflow = '';
    }
  }
  
  async function confirmRegenerate() {
    if (currentRegenerateIndex === null || !generatedScenes[currentRegenerateIndex]) return;
    
    const promptInput = document.getElementById('regeneratePromptInput');
    const newPrompt = promptInput.value.trim();
    
    if (!newPrompt) {
      alert('Please enter a prompt!');
      return;
    }
    
    // Update the prompt in the scene
    generatedScenes[currentRegenerateIndex].prompt = newPrompt;
    
    // Close modal
    closeRegenerateModal();
    
    // Regenerate with new prompt
    await regenerateScene(currentRegenerateIndex);
  }

  // ============ YOUTUBE UPLOAD FUNCTIONS ============
  let youtubeSessionId = null;
  let youtubeChannelInfo = null;

  // Check URL for YouTube auth callback
  function checkYouTubeAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('youtube_success')) {
      const channelName = urlParams.get('channel');
      const channelId = urlParams.get('channelId');
      
      youtubeChannelInfo = { channelTitle: channelName, channelId };
      localStorage.setItem('youtubeChannel', JSON.stringify(youtubeChannelInfo));
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success message
      alert(`✅ YouTube connected: ${channelName}`);
    } else if (urlParams.get('youtube_error')) {
      alert('❌ YouTube connection failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Check YouTube connection status
  async function checkYouTubeConnection() {
    const saved = localStorage.getItem('youtubeChannel');
    if (!saved) return null;
    
    try {
      const info = JSON.parse(saved);
      const response = await fetch(`${API_BASE_URL}/api/youtube/status?channelId=${info.channelId}`);
      const data = await response.json();
      
      if (data.connected) {
        youtubeChannelInfo = info;
        return info;
      } else {
        localStorage.removeItem('youtubeChannel');
        return null;
      }
    } catch (error) {
      console.error('Error checking YouTube connection:', error);
      return null;
    }
  }

  // Connect to YouTube
  async function connectYouTube() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/youtube/auth`);
      const data = await response.json();
      
      if (data.error) {
        alert('❌ ' + data.message);
        return;
      }
      
      // Open OAuth popup
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting YouTube:', error);
      alert('Failed to connect YouTube. Please try again.');
    }
  }

  // Disconnect YouTube
  async function disconnectYouTube() {
    if (!youtubeChannelInfo) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/youtube/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: youtubeChannelInfo.channelId })
      });
      
      youtubeChannelInfo = null;
      localStorage.removeItem('youtubeChannel');
      
      alert('✅ YouTube disconnected');
      closeYouTubeModal();
    } catch (error) {
      console.error('Error disconnecting YouTube:', error);
    }
  }

  // Open YouTube upload modal
  async function openYouTubeUpload(sessionId) {
    youtubeSessionId = sessionId;
    
    // Get current style
    const currentStyle = styles[currentStyleIdx];
    
    // Check if style has YouTube channel connected
    if (!currentStyle || !currentStyle.youtubeConnected) {
      // Show "connect channel" modal
      showYouTubeConnectionRequired();
      return;
    }
    
    // Show upload modal with channel info
    showYouTubeUploadModal(currentStyle);
  }
  
  function showYouTubeConnectionRequired() {
    // Use new function if available
    if (window.showYouTubeConnectionRequiredNew && typeof window.showYouTubeConnectionRequiredNew === 'function') {
      return window.showYouTubeConnectionRequiredNew();
    }
    
    // Fallback to old implementation
    const modal = document.getElementById('youtubeConnectionRequiredModal');
    if (!modal) {
      createYouTubeConnectionRequiredModal();
    }
    const createdModal = document.getElementById('youtubeConnectionRequiredModal');
    if (createdModal) {
      createdModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }
  
  function createYouTubeConnectionRequiredModal() {
    const modalHTML = `
      <div id="youtubeConnectionRequiredModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 hidden">
        <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
          <div class="p-6">
            <!-- Warning Icon -->
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            
            <!-- Title & Message -->
            <h3 class="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              YouTube Channel Not Connected
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-center mb-6">
              Please connect your YouTube channel in your style settings to upload videos automatically.
            </p>
            
            <!-- Buttons -->
            <div class="flex flex-col gap-3">
              <button onclick="goToStyleSettings(); closeYouTubeConnectionRequiredModal();"
                      class="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Go to Style Settings
              </button>
              <button onclick="closeYouTubeConnectionRequiredModal()"
                      class="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  function closeYouTubeConnectionRequiredModal() {
    document.getElementById('youtubeConnectionRequiredModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
  
  function goToStyleSettings() {
    // Open style modal and switch to edit tab
    showStyleList();
    document.getElementById('styleModal').classList.remove('hidden');
  }
  
  function showYouTubeUploadModal(style) {
    // Show upload modal
    const modal = document.getElementById('youtubeUploadModal');
    if (!modal) {
      createYouTubeModal();
    }
    
    // Update channel name in modal
    const channelNameEl = document.getElementById('youtubeChannelName');
    if (channelNameEl && style.youtubeChannelName) {
      channelNameEl.textContent = `Channel: ${style.youtubeChannelName}`;
    }
    
    document.getElementById('youtubeUploadModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Set default title from project
    if (currentProjectData && currentProjectData.title) {
      document.getElementById('youtubeTitle').value = currentProjectData.title;
    }
  }

  // Create YouTube upload modal
  function createYouTubeModal() {
    const modalHTML = `
      <div id="youtubeUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 hidden">
        <div class="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Upload to YouTube</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400" id="youtubeChannelName">Channel: Loading...</p>
                </div>
              </div>
              <button onclick="closeYouTubeModal()" 
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="p-6">
            <form id="youtubeUploadForm" onsubmit="uploadToYouTube(event)" class="space-y-4">
              <!-- Video Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Title *
                </label>
                <input type="text" id="youtubeTitle" required maxlength="100"
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                       placeholder="Enter video title (max 100 characters)">
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span id="titleCharCount">0</span>/100 characters
                </p>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea id="youtubeDescription" rows="4" maxlength="5000"
                          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter video description (optional)"></textarea>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span id="descCharCount">0</span>/5000 characters
                </p>
              </div>

              <!-- Tags -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (Keywords)
                </label>
                <input type="text" id="youtubeTags"
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                       placeholder="Enter tags separated by commas (e.g., vlog, travel, adventure)">
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate tags with commas
                </p>
              </div>

              <!-- Privacy Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Privacy
                </label>
                <select id="youtubePrivacy"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5B7FFF] dark:bg-gray-700 dark:text-white">
                  <option value="private">Private (only you can see)</option>
                  <option value="unlisted">Unlisted (anyone with link can see)</option>
                  <option value="public">Public (everyone can see)</option>
                </select>
              </div>

              <!-- Buttons -->
              <div class="flex gap-3 pt-4">
                <button type="submit" id="youtubeUploadBtn"
                        class="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all">
                  Upload to YouTube
                </button>
                <button type="button" onclick="disconnectYouTube()"
                        class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all">
                  Disconnect
                </button>
              </div>
            </form>

            <!-- Upload Progress -->
            <div id="youtubeUploadProgress" class="hidden mt-4">
              <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div id="youtubeProgressBar" class="bg-red-600 h-full transition-all duration-300" style="width: 0%"></div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center" id="youtubeProgressText">
                Uploading...
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add character counters
    document.getElementById('youtubeTitle').addEventListener('input', (e) => {
      document.getElementById('titleCharCount').textContent = e.target.value.length;
    });
    
    document.getElementById('youtubeDescription').addEventListener('input', (e) => {
      document.getElementById('descCharCount').textContent = e.target.value.length;
    });
    
    // Update channel name
    if (youtubeChannelInfo) {
      document.getElementById('youtubeChannelName').textContent = `Channel: ${youtubeChannelInfo.channelTitle}`;
    }
  }

  // Close YouTube modal
  function closeYouTubeModal() {
    const modal = document.getElementById('youtubeUploadModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  // Upload to YouTube
  async function uploadToYouTube(event) {
    event.preventDefault();
    
    // Get current style
    const currentStyle = styles[currentStyleIdx];
    
    if (!currentStyle || !currentStyle.youtubeConnected) {
      alert('YouTube channel not connected. Please connect in style settings.');
      return;
    }
    
    if (!youtubeSessionId) {
      alert('Missing video session. Please try again.');
      return;
    }
    
    const btn = document.getElementById('youtubeUploadBtn');
    const progress = document.getElementById('youtubeUploadProgress');
    const progressBar = document.getElementById('youtubeProgressBar');
    const progressText = document.getElementById('youtubeProgressText');
    
    const title = document.getElementById('youtubeTitle').value.trim();
    const description = document.getElementById('youtubeDescription').value.trim();
    const tagsInput = document.getElementById('youtubeTags').value.trim();
    const privacy = document.getElementById('youtubePrivacy').value;
    
    if (!title) {
      alert('Please enter a video title');
      return;
    }
    
    // Parse tags
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Show progress
    btn.disabled = true;
    btn.textContent = 'Uploading...';
    progress.classList.remove('hidden');
    progressBar.style.width = '20%';
    progressText.textContent = 'Preparing upload...';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/youtube/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: currentStyle.youtubeAccessToken,
          refreshToken: currentStyle.youtubeRefreshToken,
          channelId: currentStyle.youtubeChannelId,
          sessionId: youtubeSessionId,
          title,
          description,
          tags,
          privacyStatus: privacy
        })
      });
      
      progressBar.style.width = '80%';
      progressText.textContent = 'Uploading to YouTube...';
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }
      
      progressBar.style.width = '100%';
      progressText.textContent = '✅ Upload complete!';
      
      console.log('✅ Video uploaded to YouTube!');
      console.log('   Video URL:', data.youtubeUrl);
      
      // Show success message with link
      alert(`✅ Video uploaded successfully to YouTube!\n\nVideo URL: ${data.videoUrl}`);
      
      // Open video in new tab
      window.open(data.videoUrl, '_blank');
      
      // Close modal after delay
      setTimeout(() => {
        closeYouTubeModal();
      }, 1500);
      
    } catch (error) {
      console.error('❌ YouTube upload error:', error);
      alert('❌ Upload failed: ' + error.message);
      
      progressBar.style.width = '0%';
      progress.classList.add('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Upload to YouTube';
    }
  }

  // Initialize YouTube on page load
  checkYouTubeAuth();
  checkYouTubeConnection();

  // ==================================================================================
  // EXPOSE FUNCTIONS TO GLOBAL SCOPE (for HTML onclick/onchange handlers)
  // ==================================================================================
  window.handleTextFileUpload = handleTextFileUpload;
  window.generateFullScript = generateFullScript;
  window.showContextModal = showContextModal;
  window.hideContextModal = hideContextModal;
  window.saveAdditionalContext = saveAdditionalContext;
  window.toggleDarkMode = toggleDarkMode;
  window.handleIconClick = handleIconClick;
  window.copyScript = copyScript;
  window.downloadScript = downloadScript;
  window.openStyleModal = openStyleModal;
  window.closeStyleModal = closeStyleModal;
  window.selectImageStyle = selectImageStyle;
  window.openStyleSelector = openStyleSelector;
  window.closeStyleSelector = closeStyleSelector;
  window.showStyleList = showStyleList;
  window.showCreateStyle = showCreateStyle;
  window.previousStylePage = previousStylePage;
  window.nextStylePage = nextStylePage;
  window.closeImageModal = closeImageModal;
  window.closeGeneratedMediaModal = closeGeneratedMediaModal;
  window.downloadAllMedia = downloadAllMedia;
  window.restartGeneration = restartGeneration;
  window.renderVideos = renderVideos;
  window.openRegenerateModal = openRegenerateModal;
  window.closeRegenerateModal = closeRegenerateModal;
  window.confirmRegenerate = confirmRegenerate;
  window.regenerateScene = regenerateScene;
  window.downloadScene = downloadScene;
  window.toggleScene = toggleScene;
  window.toggleAllRemainingScenes = toggleAllRemainingScenes;
  window.viewSceneDetail = viewSceneDetail;
  window.closeSceneDetailModal = closeSceneDetailModal;
  window.generateRemainingImages = generateRemainingImages;
  window.copyScriptToClipboard = copyScriptToClipboard;
  window.downloadScriptFile = downloadScriptFile;
  window.toggleScriptVisibility = toggleScriptVisibility;
  window.toggleFirstSceneText = toggleFirstSceneText;
  window.toggleSceneText = toggleSceneText;
  window.toggleVoiceDropdownModal = toggleVoiceDropdownModal;
  window.closeVoiceDropdownModal = closeVoiceDropdownModal;
  window.selectVoiceFromModal = selectVoiceFromModal;
  window.playVoicePreview = playVoicePreview;
  window.openTransitionSettings = openTransitionSettings;
  window.closeTransitionSettings = closeTransitionSettings;
  window.selectTransition = selectTransition;
  window.saveTransitionSettings = saveTransitionSettings;
  window.connectYouTube = connectYouTube;
  window.disconnectYouTube = disconnectYouTube;
  window.openYouTubeUpload = openYouTubeUpload;
  window.closeYouTubeModal = closeYouTubeModal;
  window.uploadToYouTube = uploadToYouTube;
  window.goToStyleSettings = goToStyleSettings;
  window.closeYouTubeConnectionRequiredModal = closeYouTubeConnectionRequiredModal;
  window.logout = function() {
    localStorage.clear();
    window.location.href = 'Login.html.html';
  };

  console.log('✅ All functions exposed to global scope for HTML event handlers');
})();
// Voice Provider Function Exports
window.switchVoiceProvider = switchVoiceProvider;
window.selectSpeechifyVoice = selectSpeechifyVoice;
window.toggleSpeechifyVoiceModal = toggleSpeechifyVoiceModal;
window.closeSpeechifyVoiceModal = closeSpeechifyVoiceModal;
window.toggleAdvancedSettings = toggleAdvancedSettings;
window.SPEECHIFY_VOICES = SPEECHIFY_VOICES;

// ========================================
// VIDEO LIBRARY SYSTEM
// ========================================

// Get video library from localStorage
function getVideoLibrary() {
  const library = localStorage.getItem('videoLibrary');
  return library ? JSON.parse(library) : [];
}

// Save video to library
function saveVideoToLibrary(videoData) {
  if (window.saveVideoToLibraryNew && typeof window.saveVideoToLibraryNew === 'function') {
    window.saveVideoToLibraryNew(videoData);
    if (typeof updateLibraryCount === 'function') {
      updateLibraryCount();
    }
    return;
  }
  // Fallback to old implementation
  const library = getVideoLibrary();
  library.unshift(videoData); // Add to beginning
  localStorage.setItem('videoLibrary', JSON.stringify(library));
  updateLibraryCount();
  console.log('✅ Video saved to library:', videoData.title);
}

// Update library count badge
function updateLibraryCount() {
  const library = getVideoLibrary();
  const countEl = document.getElementById('libraryCount');
  if (countEl) {
    if (library.length > 0) {
      countEl.textContent = library.length;
      countEl.classList.remove('hidden');
    } else {
      countEl.classList.add('hidden');
    }
  }
}

// Open Video Library modal
function openVideoLibrary() {
  const library = getVideoLibrary();
  
  // Create modal if doesn't exist
  if (!document.getElementById('videoLibraryModal')) {
    createVideoLibraryModal();
  }
  
  // Update content
  renderVideoLibrary(library);
  
  // Show modal
  document.getElementById('videoLibraryModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Close Video Library modal
function closeVideoLibrary() {
  document.getElementById('videoLibraryModal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Create Video Library modal
function createVideoLibraryModal() {
  const modalHTML = `
    <div id="videoLibraryModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 hidden">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                Video Library
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Your saved videos and projects</p>
            </div>
            <button onclick="closeVideoLibrary()" 
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div id="libraryContent" class="flex-1 overflow-y-auto p-6 min-h-0">
          <!-- Content will be rendered here -->
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Render video library content
function renderVideoLibrary(library) {
  const contentEl = document.getElementById('libraryContent');
  
  if (library.length === 0) {
    contentEl.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <svg class="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
        </svg>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No videos yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Generate your first video to see it here</p>
        <button onclick="closeVideoLibrary()" 
                class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition">
          Create Video
        </button>
      </div>
    `;
    return;
  }
  
  const videosHTML = library.map((video, index) => `
    <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 transition">
      <div class="flex items-start gap-6">
        <!-- Video Player Thumbnail -->
        <div class="flex-shrink-0">
          ${video.videoUrl ? `
            <video class="w-48 h-28 rounded-lg object-cover cursor-pointer" 
                   onclick="playVideoInLibrary('${video.videoUrl}')"
                   poster="">
              <source src="${video.videoUrl}" type="video/mp4">
            </video>
          ` : `
            <div class="w-48 h-28 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center cursor-pointer"
                 onclick="playVideoInLibrary('${video.videoUrl}')">
              <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          `}
        </div>
        
        <!-- Video Info -->
        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${video.title}</h3>
          <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span>📅 ${new Date(video.createdAt).toLocaleDateString()} ${new Date(video.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-wrap gap-2">
            ${video.videoUrl ? `
              <a href="${video.videoUrl}" download class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition inline-flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download
              </a>
            ` : ''}
            
            <button onclick="openUploadWithStyleSelection(${index})" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition inline-flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Upload to YouTube
            </button>
            
            <button onclick="deleteVideoFromLibrary(${index})" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium rounded-lg transition inline-flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  contentEl.innerHTML = `
    <div class="space-y-4">
      ${videosHTML}
    </div>
  `;
}

// View video details
function viewVideoDetails(index) {
  const library = getVideoLibrary();
  const video = library[index];
  
  alert(`Video Details:\n\nTitle: ${video.title}\nCreated: ${new Date(video.createdAt).toLocaleString()}\nWords: ${video.wordCount || 0}\nStyle: ${video.styleName || 'N/A'}`);
}

// Upload video from library to YouTube
function uploadVideoFromLibrary(index) {
  const library = getVideoLibrary();
  const video = library[index];
  
  // Get the style used
  const style = video.styleId !== undefined ? styles[video.styleId] : null;
  
  // Check if style has YouTube connected
  if (!style || !style.youtubeConnected) {
    showYouTubeConnectionRequired();
    return;
  }
  
  // Set session ID and open upload modal
  youtubeSessionId = video.sessionId;
  showYouTubeUploadModal(style);
}

// Delete video from library
function deleteVideoFromLibrary(index) {
  if (window.deleteVideoFromLibraryNew && typeof window.deleteVideoFromLibraryNew === 'function') {
    return window.deleteVideoFromLibraryNew(index);
  }
  // Fallback to old implementation
  if (!confirm('Are you sure you want to delete this video from your library?')) {
    return;
  }
  
  const library = getVideoLibrary();
  library.splice(index, 1);
  localStorage.setItem('videoLibrary', JSON.stringify(library));
  
  // Re-render
  renderVideoLibrary(library);
  updateLibraryCount();
}

// Play video in library
function playVideoInLibrary(videoUrl) {
  if (window.playVideoInLibraryNew && typeof window.playVideoInLibraryNew === 'function') {
    return window.playVideoInLibraryNew(videoUrl);
  }
  // Fallback to old implementation
  if (!videoUrl) {
    alert('Video URL not available');
    return;
  }
  
  // Create video player modal
  const modalHTML = `
    <div id="videoPlayerModal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div class="relative w-full max-w-4xl">
        <button onclick="closeVideoPlayer()" 
                class="absolute -top-12 right-0 text-white hover:text-gray-300 transition">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <video controls autoplay class="w-full rounded-lg shadow-2xl">
          <source src="${videoUrl}" type="video/mp4">
        </video>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close video player
function closeVideoPlayer() {
  const modal = document.getElementById('videoPlayerModal');
  if (modal) modal.remove();
}

// Open upload with style selection
function openUploadWithStyleSelection(videoIndex) {
  const library = getVideoLibrary();
  const video = library[videoIndex];
  
  // Get all styles
  const styles = JSON.parse(localStorage.getItem('styles') || '[]');
  
  if (styles.length === 0) {
    alert('Please create a style first in Settings');
    return;
  }
  
  // Create style selection modal
  const stylesHTML = styles.map((style, idx) => `
    <div onclick="selectStyleForUpload(${videoIndex}, ${idx})" 
         class="cursor-pointer p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 bg-white dark:bg-gray-700 transition">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h4 class="font-bold text-gray-900 dark:text-white">${style.name || 'Unnamed Style'}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ${style.lang || 'ENGLISH'} • ${style.wordCount || 0} words
          </p>
          ${style.youtubeConnected ? `
            <div class="mt-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-sm text-green-600 dark:text-green-400 font-medium">YouTube Connected</span>
            </div>
          ` : `
            <div class="mt-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-sm text-gray-500 dark:text-gray-400">Not Connected</span>
            </div>
          `}
        </div>
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </div>
  `).join('');
  
  const modalHTML = `
    <div id="styleSelectionModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Select Style for Upload</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose which YouTube channel to upload to</p>
            </div>
            <button onclick="closeStyleSelection()" 
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="space-y-3">
            ${stylesHTML}
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Select style for upload
function selectStyleForUpload(videoIndex, styleIdx) {
  const library = getVideoLibrary();
  const video = library[videoIndex];
  const styles = JSON.parse(localStorage.getItem('styles') || '[]');
  const style = styles[styleIdx];
  
  // Close style selection
  closeStyleSelection();
  
  // Check if style has YouTube connected
  if (!style.youtubeConnected) {
    showYouTubeConnectionRequired();
    return;
  }
  
  // Set session ID and open upload modal
  youtubeSessionId = video.sessionId;
  showYouTubeUploadModal(style);
}

// Close style selection
function closeStyleSelection() {
  const modal = document.getElementById('styleSelectionModal');
  if (modal) modal.remove();
}

// Initialize library count on page load
document.addEventListener('DOMContentLoaded', updateLibraryCount);

// ========================================
// SESSION RECOVERY SYSTEM
// ========================================
// MIGRATED TO src/utils/storage.js
// These functions are kept here for backward compatibility
// They will use the new storage utilities if available, otherwise fallback to old implementation
// TODO: Remove after full migration to new structure

// Save current session
function saveCurrentSession(sessionData) {
  if (window.appStorage && window.appStorage.saveCurrentSession) {
    return window.appStorage.saveCurrentSession(sessionData);
  }
  // Fallback to old implementation
  localStorage.setItem('currentSession', JSON.stringify(sessionData));
  localStorage.setItem('sessionTimestamp', new Date().toISOString());
  console.log('💾 Session saved:', sessionData);
}

// Get saved session
function getSavedSession() {
  if (window.appStorage && window.appStorage.getSavedSession) {
    return window.appStorage.getSavedSession();
  }
  // Fallback to old implementation
  const session = localStorage.getItem('currentSession');
  const timestamp = localStorage.getItem('sessionTimestamp');
  
  if (!session || !timestamp) return null;
  
  // Check if session is less than 24 hours old
  const sessionTime = new Date(timestamp);
  const now = new Date();
  const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) {
    // Session too old, clear it
    clearCurrentSession();
    return null;
  }
  
  return JSON.parse(session);
}

// Clear current session
function clearCurrentSession() {
  if (window.appStorage && window.appStorage.clearCurrentSession) {
    return window.appStorage.clearCurrentSession();
  }
  // Fallback to old implementation
  localStorage.removeItem('currentSession');
  localStorage.removeItem('sessionTimestamp');
}

// Show recovery prompt
function showRecoveryPrompt() {
  const session = getSavedSession();
  if (!session) return;
  
  const promptHTML = `
    <div id="recoveryPrompt" class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
      <div class="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl shadow-2xl p-4 max-w-2xl">
        <div class="flex items-center gap-4">
          <svg class="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="flex-1">
            <p class="font-bold text-gray-900 dark:text-white text-lg">
              You have a previously generated session. Would you like to recover it?
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              ${session.title || 'Untitled'} • ${new Date(session.timestamp).toLocaleString()}
            </p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button onclick="recoverSession()" 
                    class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg">
              RECOVER
            </button>
            <button onclick="dismissRecovery()" 
                    class="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', promptHTML);
}

// Recover session
function recoverSession() {
  const session = getSavedSession();
  if (!session) {
    alert('Session expired or not found');
    return;
  }
  
  // Restore title
  if (session.title) {
    const titleInput = document.getElementById('video-title');
    if (titleInput) titleInput.value = session.title;
  }
  
  // Restore script and show it
  if (session.script) {
    const scriptContent = document.getElementById('scriptContent');
    const scriptOutput = document.getElementById('scriptOutput');
    const scriptWrapper = document.getElementById('scriptWrapper');
    
    if (scriptContent) {
      scriptContent.textContent = session.script;
      scriptContent.style.opacity = "1";
    }
    
    // Show script section
    if (scriptWrapper) scriptWrapper.classList.remove('hidden');
    if (scriptOutput) scriptOutput.classList.remove('hidden');
    
    // Update word count
    const wordCount = session.script.split(/\s+/).length;
    const wordCountEl = document.getElementById('wordCount');
    if (wordCountEl) wordCountEl.textContent = wordCount;
    
    // Enable copy/download buttons
    if (typeof setCopyDownloadEnabled === 'function') {
      setCopyDownloadEnabled(true);
    }
    
    // Scroll to script
    if (scriptOutput) {
      scriptOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  // Restore style
  if (session.styleId !== undefined) {
    const styles = JSON.parse(localStorage.getItem('styles') || '[]');
    if (styles[session.styleId]) {
      localStorage.setItem('currentStyleIdx', session.styleId);
      if (typeof useStyle === 'function') {
        useStyle(session.styleId);
      }
    }
  }
  
  console.log('✅ Session recovered!');
  console.log('   Title:', session.title);
  console.log('   Script length:', session.script?.length || 0);
  
  dismissRecovery();
  
  // Show success message
  setTimeout(() => {
    alert('✅ Session recovered!\n\nYour work has been restored:\n• Title\n• Script\n• Style');
  }, 500);
}

// Dismiss recovery prompt
function dismissRecovery() {
  const prompt = document.getElementById('recoveryPrompt');
  if (prompt) prompt.remove();
  clearCurrentSession();
}

// Check for recovery on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(showRecoveryPrompt, 1000); // Show after 1 second
});

// YouTube OAuth Function Exports
// Direct click handlers for icons (fallback - works even if event listeners fail)
window.handleVoiceIconClickDirect = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  console.log('🎤 Voice icon clicked via DIRECT onclick handler');
  const voiceIcon = document.getElementById('voiceIcon');
  if (voiceIcon) {
    voiceIcon.style.pointerEvents = 'auto';
    voiceIcon.style.cursor = 'pointer';
    voiceIcon.classList.remove('disabled');
    voiceIcon.setAttribute('aria-disabled', 'false');
    
    const scriptContent = document.getElementById('scriptContent')?.innerText?.trim() || '';
    if (!scriptContent) {
      alert('Please generate a script first.');
      return;
    }
    
    // Try to use new voice generator if available
    if (window.generateVoiceFromTextNew && typeof window.generateVoiceFromTextNew === 'function') {
      console.log('🎤 Using new voice generator');
      window.generateVoiceFromTextNew(scriptContent).catch(err => {
        console.error('Error with new voice generator:', err);
        // Fall through to old handler
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        voiceIcon.dispatchEvent(clickEvent);
      });
    } else {
      // Try to trigger the main handler
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      voiceIcon.dispatchEvent(clickEvent);
    }
  }
};

window.handleImageIconClickDirect = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  console.log('🖼️ Image icon clicked via DIRECT onclick handler');
  const imageIcon = document.getElementById('imageIcon');
  if (imageIcon) {
    imageIcon.style.pointerEvents = 'auto';
    imageIcon.style.cursor = 'pointer';
    imageIcon.classList.remove('disabled');
    imageIcon.setAttribute('aria-disabled', 'false');
    
    // Try to open modal
    if (typeof window.openImageModal === 'function') {
      window.openImageModal();
    } else if (typeof openImageModal === 'function') {
      openImageModal();
    } else {
      // Direct modal opening
      const modal = document.getElementById('imageGenerationModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        console.log('✅ Image modal opened via direct handler');
      } else {
        alert('Image modal not found. Please refresh the page.');
      }
    }
  }
};

window.connectYouTube = connectYouTube;
window.disconnectYouTube = disconnectYouTube;
window.openYouTubeUpload = openYouTubeUpload;
// Use new function if available, otherwise use old one
window.showYouTubeConnectionRequired = window.showYouTubeConnectionRequired || showYouTubeConnectionRequired;
// goToStyleSettings and closeYouTubeConnectionRequiredModal are already exposed inside the IIFE above

// Video Library Function Exports
window.openVideoLibrary = openVideoLibrary;
window.closeVideoLibrary = closeVideoLibrary;
window.saveVideoToLibrary = saveVideoToLibrary;
window.viewVideoDetails = viewVideoDetails;
window.uploadVideoFromLibrary = uploadVideoFromLibrary;
window.deleteVideoFromLibrary = deleteVideoFromLibrary;
window.updateLibraryCount = updateLibraryCount;
window.playVideoInLibrary = playVideoInLibrary;
window.closeVideoPlayer = closeVideoPlayer;
window.openUploadWithStyleSelection = openUploadWithStyleSelection;
window.selectStyleForUpload = selectStyleForUpload;
window.closeStyleSelection = closeStyleSelection;

// Session Recovery Function Exports
window.recoverSession = recoverSession;
window.dismissRecovery = dismissRecovery;
window.saveCurrentSession = saveCurrentSession;
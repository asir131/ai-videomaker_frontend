// =====================================================================
// LocalStorage Helpers - Centralized storage utilities
// =====================================================================

// Generic storage helpers
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Get raw string value (no JSON parsing)
  getString(key, defaultValue = null) {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.error(`Error reading string from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  // Set raw string value (no JSON stringify)
  setString(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing string to localStorage key "${key}":`, error);
      return false;
    }
  }
};

// =====================================================================
// App-specific storage helpers
// =====================================================================

export const appStorage = {
  // Dark mode
  getDarkMode() {
    return localStorage.getItem('darkMode') === 'true';
  },

  setDarkMode(enabled) {
    localStorage.setItem('darkMode', enabled ? 'true' : 'false');
  },

  // Transitions
  getEnableTransitions() {
    return localStorage.getItem('enableTransitions') === 'true';
  },

  setEnableTransitions(enabled) {
    localStorage.setItem('enableTransitions', enabled ? 'true' : 'false');
  },

  // Word count
  getWordCount() {
    const count = localStorage.getItem('wordCount');
    return count ? parseInt(count, 10) : 500;
  },

  setWordCount(count) {
    localStorage.setItem('wordCount', count.toString());
  },

  // Styles management
  getStyles() {
    return storage.get('styles', []);
  },

  saveStyles(styles) {
    return storage.set('styles', styles);
  },

  getCurrentStyleIdx() {
    const idx = localStorage.getItem('currentStyleIdx');
    return idx !== null ? parseInt(idx, 10) : null;
  },

  setCurrentStyleIdx(idx) {
    if (idx === null || idx === undefined) {
      localStorage.removeItem('currentStyleIdx');
    } else {
      localStorage.setItem('currentStyleIdx', idx.toString());
    }
  },

  // User data and credits
  getCurrentUser() {
    return localStorage.getItem('currentUser');
  },

  getUserData(userEmail = null) {
    const email = userEmail || this.getCurrentUser();
    if (!email) return null;
    const key = `user_${email}`;
    return storage.get(key, null);
  },

  setUserData(userEmail, userData) {
    const key = `user_${userEmail}`;
    return storage.set(key, userData);
  },

  updateUserCredits(userEmail, credits) {
    const userData = this.getUserData(userEmail);
    if (userData) {
      userData.credits = credits;
      return this.setUserData(userEmail, userData);
    }
    return false;
  },

  // Session recovery
  saveCurrentSession(sessionData) {
    storage.set('currentSession', sessionData);
    storage.setString('sessionTimestamp', new Date().toISOString());
    console.log('💾 Session saved:', sessionData);
  },

  getSavedSession() {
    const session = storage.get('currentSession', null);
    const timestamp = storage.getString('sessionTimestamp', null);
    
    if (!session || !timestamp) return null;
    
    // Check if session is less than 24 hours old
    const sessionTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      // Session too old, clear it
      this.clearCurrentSession();
      return null;
    }
    
    return session;
  },

  clearCurrentSession() {
    storage.remove('currentSession');
    storage.remove('sessionTimestamp');
  },

  // Transition settings
  getTransitionType() {
    return localStorage.getItem('transitionType') || 'fade';
  },

  setTransitionType(type) {
    localStorage.setItem('transitionType', type);
  },

  getTransitionDuration() {
    return parseFloat(localStorage.getItem('transitionDuration') || '0.5');
  },

  setTransitionDuration(duration) {
    localStorage.setItem('transitionDuration', duration.toString());
  },

  // Additional context
  getAdditionalContext() {
    return localStorage.getItem('additionalContext') || '';
  },

  setAdditionalContext(context) {
    localStorage.setItem('additionalContext', context);
  }
};

// =====================================================================
// Credit management helpers
// =====================================================================

export const creditStorage = {
  // Get current balance from UI (for backward compatibility)
  getUiBalance() {
    const balanceEl = document.getElementById('creditBalance');
    if (!balanceEl) return 0;
    return parseInt(balanceEl.textContent || '0', 10);
  },

  // Set balance in UI
  setUiBalance(balance) {
    const balanceEl = document.getElementById('creditBalance');
    if (balanceEl) {
      balanceEl.textContent = Math.max(0, balance);
    }
  },

  // Persist balance to user data
  persistBalance(balance, userEmail = null) {
    const email = userEmail || appStorage.getCurrentUser();
    if (!email) return false;
    return appStorage.updateUserCredits(email, balance);
  },

  // Update balance (UI + storage)
  updateBalance(newBalance, userEmail = null) {
    if (isNaN(newBalance) || newBalance < 0) newBalance = 0;
    this.setUiBalance(newBalance);
    return this.persistBalance(newBalance, userEmail);
  },

  // Debit credits
  debitCredits(amount, userEmail = null) {
    const currentBalance = this.getUiBalance();
    const newBalance = Math.max(0, currentBalance - amount);
    return this.updateBalance(newBalance, userEmail);
  },

  // Check if user has enough credits
  ensureCredits(amount) {
    const balance = this.getUiBalance();
    if (balance < amount) {
      alert(`Not enough credits. Need ${amount}, you have ${balance}.`);
      return false;
    }
    return true;
  }
};


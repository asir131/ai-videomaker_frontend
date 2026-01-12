// UI state management (modals, loading, etc.)
class UIStore {
  constructor() {
    this.darkMode = false;
    this.modals = {
      imageGeneration: false,
      styleSelector: false,
      transitionSettings: false,
      youtubeUpload: false,
      context: false,
      wordCount: false
    };
    this.loading = {
      script: false,
      images: false,
      voice: false,
      video: false
    };
    this.listeners = [];
    this.initializeDarkMode();
  }

  initializeDarkMode() {
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }

  setDarkMode(enabled) {
    this.darkMode = enabled;
    localStorage.setItem('darkMode', enabled ? 'true' : 'false');
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.notify();
  }

  toggleDarkMode() {
    this.setDarkMode(!this.darkMode);
  }

  openModal(modalName) {
    this.modals[modalName] = true;
    this.notify();
  }

  closeModal(modalName) {
    this.modals[modalName] = false;
    this.notify();
  }

  setLoading(key, isLoading) {
    this.loading[key] = isLoading;
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  getState() {
    return {
      darkMode: this.darkMode,
      modals: { ...this.modals },
      loading: { ...this.loading }
    };
  }
}

export const uiStore = new UIStore();


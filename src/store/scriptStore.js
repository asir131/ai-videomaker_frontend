// Script state management
class ScriptStore {
  constructor() {
    this.script = '';
    this.wordCount = 0;
    this.isGenerating = false;
    this.listeners = [];
  }

  setScript(script) {
    this.script = script;
    this.wordCount = this.calculateWordCount(script);
    this.notify();
  }

  setGenerating(isGenerating) {
    this.isGenerating = isGenerating;
    this.notify();
  }

  calculateWordCount(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
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
      script: this.script,
      wordCount: this.wordCount,
      isGenerating: this.isGenerating
    };
  }
}

export const scriptStore = new ScriptStore();


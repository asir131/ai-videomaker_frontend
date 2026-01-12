// Image generation state management
class ImageStore {
  constructor() {
    this.images = [];
    this.isGenerating = false;
    this.generationProgress = 0;
    this.listeners = [];
  }

  addImage(image) {
    this.images.push(image);
    this.notify();
  }

  setImages(images) {
    this.images = images;
    this.notify();
  }

  setGenerating(isGenerating) {
    this.isGenerating = isGenerating;
    this.notify();
  }

  setProgress(progress) {
    this.generationProgress = progress;
    this.notify();
  }

  clear() {
    this.images = [];
    this.isGenerating = false;
    this.generationProgress = 0;
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
      images: this.images,
      isGenerating: this.isGenerating,
      generationProgress: this.generationProgress
    };
  }
}

export const imageStore = new ImageStore();


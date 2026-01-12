// Video rendering state management
class VideoStore {
  constructor() {
    this.isRendering = false;
    this.renderProgress = 0;
    this.renderStatus = '';
    this.renderedVideos = [];
    this.listeners = [];
  }

  setRendering(isRendering) {
    this.isRendering = isRendering;
    this.notify();
  }

  setProgress(progress) {
    this.renderProgress = progress;
    this.notify();
  }

  setStatus(status) {
    this.renderStatus = status;
    this.notify();
  }

  setRenderedVideos(videos) {
    this.renderedVideos = videos;
    this.notify();
  }

  clear() {
    this.isRendering = false;
    this.renderProgress = 0;
    this.renderStatus = '';
    this.renderedVideos = [];
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
      isRendering: this.isRendering,
      renderProgress: this.renderProgress,
      renderStatus: this.renderStatus,
      renderedVideos: this.renderedVideos
    };
  }
}

export const videoStore = new VideoStore();


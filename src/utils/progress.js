// Progress bar utilities
export function createProgressBar(container, options = {}) {
  const {
    showPercentage = true,
    animated = true,
    color = 'primary'
  } = options;

  const progressContainer = document.createElement('div');
  progressContainer.className = 'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5';

  const progressBar = document.createElement('div');
  progressBar.className = `h-2.5 rounded-full transition-all duration-300 ${
    color === 'primary' ? 'bg-[#5B7FFF]' : 
    color === 'success' ? 'bg-green-500' :
    color === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  progressBar.style.width = '0%';

  const percentageText = document.createElement('div');
  percentageText.className = 'text-sm font-medium text-gray-700 dark:text-gray-300 mt-1 text-center';
  percentageText.textContent = '0%';

  progressContainer.appendChild(progressBar);

  const wrapper = document.createElement('div');
  wrapper.className = 'w-full';
  wrapper.appendChild(progressContainer);
  if (showPercentage) {
    wrapper.appendChild(percentageText);
  }

  if (container) {
    container.appendChild(wrapper);
  }

  return {
    element: wrapper,
    setProgress: (percentage) => {
      const clamped = Math.max(0, Math.min(100, percentage));
      progressBar.style.width = `${clamped}%`;
      if (showPercentage) {
        percentageText.textContent = `${Math.round(clamped)}%`;
      }
    },
    remove: () => {
      if (wrapper.parentElement) {
        wrapper.remove();
      }
    }
  };
}

export function createProgressIndicator(message, container) {
  const indicator = document.createElement('div');
  indicator.className = 'flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800';
  
  const spinner = document.createElement('div');
  spinner.className = 'animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent';
  
  const text = document.createElement('span');
  text.className = 'text-blue-900 dark:text-blue-100 font-medium';
  text.textContent = message;
  
  indicator.appendChild(spinner);
  indicator.appendChild(text);
  
  if (container) {
    container.appendChild(indicator);
  }
  
  return {
    element: indicator,
    updateMessage: (newMessage) => {
      text.textContent = newMessage;
    },
    remove: () => {
      if (indicator.parentElement) {
        indicator.remove();
      }
    }
  };
}


import React, { useState, useEffect } from 'react';
import {
  FileText,
  Edit,
  Image as ImageIcon,
  Mic,
  Video,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useScript } from '../../context/ScriptContext';
import { useMedia } from '../../context/MediaContext';
import ScriptGenerator from '../ScriptGenerator';
import ScriptEditor from '../ScriptEditor';
import ImageGenerator from '../ImageGenerator';
import VoiceGenerator from '../VoiceGenerator';
import VideoRenderer from '../VideoRenderer';

const VideoCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasAutoAdvanced, setHasAutoAdvanced] = useState({});
  const [manualNavigation, setManualNavigation] = useState(false);
  const { script, scenes } = useScript();
  const { images, generatedAudioUrl } = useMedia();

  const steps = [
    {
      id: 'script',
      title: 'Script',
      icon: FileText,
      component: ScriptGenerator,
      description: 'Generate & edit your script',
      completed: !!script
    },
    // {
    //   id: 'edit',
    //   title: 'Edit',
    //   icon: Edit,
    //   component: ScriptEditor,
    //   description: 'Review and edit your script',
    //   completed: !!scenes && scenes.length > 0
    // },
    {
      id: 'images',
      title: 'Images',
      icon: ImageIcon,
      component: ImageGenerator,
      description: 'Generate scene images',
      completed: images && images.length > 0 && images.every(img => img.url && img.status !== 'error')
    },
    {
      id: 'voice',
      title: 'Voice',
      icon: Mic,
      component: VoiceGenerator,
      description: 'Generate voiceover',
      completed: !!generatedAudioUrl
    },
    {
      id: 'render',
      title: 'Render',
      icon: Video,
      component: VideoRenderer,
      description: 'Render final video',
      completed: false
    }
  ];

  const CurrentComponent = steps[currentStep].component;
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;

  const handleNext = () => {
    if (canGoNext) {
      setManualNavigation(true);
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setManualNavigation(true);
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (index) => {
    setManualNavigation(true);
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-navigate to next step when current step is completed
  useEffect(() => {
    const currentStepData = steps[currentStep];
    const stepId = currentStepData?.id;

    // Don't auto-navigate on the last step
    if (currentStep >= steps.length - 1) return;

    //Don't auto-navigate if user manually navigated backwards
    if (manualNavigation) {
      setManualNavigation(false);
      return;
    }

    // Don't auto-navigate if we've already auto-advanced from this step
    if (hasAutoAdvanced[stepId]) return;

    // Check if current step is completed
    if (currentStepData.completed && stepId !== 'script') {
      // Wait a bit to show the completion state, then move to next
      const timer = setTimeout(() => {
        setHasAutoAdvanced(prev => ({ ...prev, [stepId]: true }));
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000); // 2 second delay to review completion

      return () => clearTimeout(timer);
    }
  }, [steps[currentStep]?.completed, currentStep, steps.length, manualNavigation, hasAutoAdvanced]);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Your Video</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = step.completed;
            const isPast = index < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className="flex flex-col items-center gap-2 relative z-10 group"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-110'
                    : isCompleted || isPast
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>
                <div className="text-center min-w-[80px]">
                  <p
                    className={`text-xs font-medium ${isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isCompleted || isPast
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <CurrentComponent handleNext={handleNext} handlePrev={handlePrev} />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${canGoPrev
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                ? 'bg-indigo-500 w-8'
                : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
                }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${canGoNext
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default VideoCreationWizard;


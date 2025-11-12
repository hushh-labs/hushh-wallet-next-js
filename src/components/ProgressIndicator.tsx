'use client';

import { useEffect, useState } from 'react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  details: string[];
}

interface ProgressIndicatorProps {
  currentStep: number;
  steps: ProgressStep[];
  isComplete?: boolean;
  onComplete?: () => void;
}

export function ProgressIndicator({ 
  currentStep, 
  steps, 
  isComplete = false,
  onComplete 
}: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [detailIndex, setDetailIndex] = useState(0);

  // Calculate progress percentage
  useEffect(() => {
    const targetProgress = isComplete ? 100 : ((currentStep) / steps.length) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const increment = isComplete ? 5 : 2;
        const newProgress = prev + increment;
        
        if (newProgress >= targetProgress) {
          clearInterval(timer);
          if (isComplete && onComplete) {
            setTimeout(onComplete, 500);
          }
          return targetProgress;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStep, steps.length, isComplete, onComplete]);

  // Cycle through current step details
  useEffect(() => {
    if (!isComplete && currentStep < steps.length && currentStep >= 0) {
      const currentStepData = steps[currentStep];
      const timer = setInterval(() => {
        setDetailIndex(prev => (prev + 1) % currentStepData.details.length);
      }, 2000);

      return () => clearInterval(timer);
    }
  }, [currentStep, steps, isComplete]);

  const currentStepData = currentStep < steps.length && currentStep >= 0 ? steps[currentStep] : null;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-ink">
          {isComplete ? 'Card Created Successfully!' : 'Creating Your Personal Data Card'}
        </h2>
        <p className="text-muted">
          {isComplete 
            ? 'Your card is ready for Apple Wallet' 
            : 'Please wait while we prepare your digital identity card'
          }
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted">
            {isComplete ? 'Complete' : `Step ${currentStep + 1} of ${steps.length}`}
          </span>
          <span className="font-medium text-ink">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold to-yellow-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Step Info */}
      {!isComplete && currentStepData && (
        <div className="space-y-4 p-6 bg-paper rounded-lg border">
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">Currently: {currentStepData.title}</h3>
            <p className="text-muted text-sm leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Cycling Detail */}
          <div className="bg-white p-4 rounded border-l-4 border-gold">
            <p className="text-sm text-ink font-medium">
              {currentStepData.details[detailIndex]}
            </p>
          </div>
        </div>
      )}

      {/* Steps Overview */}
      <div className="space-y-3">
        <h4 className="font-medium text-ink">Progress Overview:</h4>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-start space-x-3 p-3 rounded transition-colors ${
                index < currentStep || isComplete
                  ? 'bg-green-50 border border-green-200' 
                  : index === currentStep 
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`mt-1 w-4 h-4 rounded-full flex-shrink-0 ${
                index < currentStep || isComplete
                  ? 'bg-green-500' 
                  : index === currentStep 
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-gray-300'
              }`} />
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  index < currentStep || isComplete
                    ? 'text-green-800' 
                    : index === currentStep 
                      ? 'text-yellow-800'
                      : 'text-gray-600'
                }`}>
                  {step.title}
                </p>
                <p className={`text-xs mt-1 ${
                  index < currentStep || isComplete
                    ? 'text-green-600' 
                    : index === currentStep 
                      ? 'text-yellow-600'
                      : 'text-gray-500'
                }`}>
                  {index < currentStep || isComplete
                    ? 'Completed' 
                    : index === currentStep 
                      ? 'In progress...'
                      : 'Pending'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Message */}
      {isComplete && (
        <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 font-medium">
            Your personal data card has been created and is ready to download!
          </p>
        </div>
      )}
    </div>
  );
}

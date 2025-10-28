'use client';

import { useState } from 'react';
import { AllergyPayload, ALLERGY_SCREEN_CONFIGS } from '@/types';

enum AllergyFlowState {
  SCREEN_1 = 'screen_1', // Allergens
  SCREEN_2 = 'screen_2', // Severity
  SCREEN_3 = 'screen_3', // Cross-contamination
  SCREEN_4 = 'screen_4', // Emergency Note
  SCREEN_5 = 'screen_5', // Front Consent
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}

const TOTAL_SCREENS = 5;

export default function AllergyCardPage() {
  const [flowState, setFlowState] = useState<AllergyFlowState>(AllergyFlowState.SCREEN_1);
  const [currentScreen, setCurrentScreen] = useState(1);
  const [formData, setFormData] = useState<Partial<AllergyPayload>>({
    allergens: [],
    severity: undefined,
    xcontam: undefined,
    emergencyNote: '',
    frontConsent: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Progress calculation
  const progress = (currentScreen / TOTAL_SCREENS) * 100;

  // Navigation functions
  const goToNextScreen = () => {
    if (currentScreen < TOTAL_SCREENS) {
      const nextScreen = currentScreen + 1;
      setCurrentScreen(nextScreen);
      setFlowState(`screen_${nextScreen}` as AllergyFlowState);
    }
  };

  const goToPrevScreen = () => {
    if (currentScreen > 1) {
      const prevScreen = currentScreen - 1;
      setCurrentScreen(prevScreen);
      setFlowState(`screen_${prevScreen}` as AllergyFlowState);
    }
  };

  // Form validation (pure function without state updates)
  const isCurrentScreenValid = (): boolean => {
    const config = ALLERGY_SCREEN_CONFIGS[currentScreen - 1];

    if (config.required) {
      if (config.id === 'allergens') {
        return !!(formData.allergens && formData.allergens.length > 0);
      } else if (config.id === 'severity') {
        return !!formData.severity;
      } else if (config.id === 'xcontam') {
        return !!formData.xcontam;
      } else if (config.id === 'frontConsent') {
        return !!formData.frontConsent;
      }
    }

    return true;
  };

  // Validation with error setting (only called on user action)
  const validateAndSetErrors = (): boolean => {
    const config = ALLERGY_SCREEN_CONFIGS[currentScreen - 1];
    setErrors(prev => ({ ...prev, [config.id]: '' }));

    if (config.required) {
      if (config.id === 'allergens') {
        if (!formData.allergens || formData.allergens.length === 0) {
          setErrors(prev => ({ ...prev, [config.id]: 'Please select at least one allergen' }));
          return false;
        }
      } else if (config.id === 'severity' && !formData.severity) {
        setErrors(prev => ({ ...prev, [config.id]: 'Please select severity level' }));
        return false;
      } else if (config.id === 'xcontam' && !formData.xcontam) {
        setErrors(prev => ({ ...prev, [config.id]: 'Please select cross-contamination preference' }));
        return false;
      } else if (config.id === 'frontConsent' && !formData.frontConsent) {
        setErrors(prev => ({ ...prev, [config.id]: 'Please select visibility preference' }));
        return false;
      }
    }

    return true;
  };

  // Check if we can proceed or generate
  const canProceed = (): boolean => {
    return isCurrentScreenValid();
  };

  const canGenerate = (): boolean => {
    // Must have required fields
    return !!(formData.allergens && formData.allergens.length > 0 && 
              formData.severity && formData.xcontam && formData.frontConsent);
  };

  // Handle form updates for chip selections
  const handleChipToggle = (field: string, value: string) => {
    if (field === 'allergens') {
      const currentAllergens = formData.allergens || [];
      const isSelected = currentAllergens.includes(value);
      
      if (isSelected) {
        setFormData(prev => ({
          ...prev,
          allergens: currentAllergens.filter((item: string) => item !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          allergens: [...currentAllergens, value]
        }));
      }
    }
  };

  // Handle radio selections
  const handleRadioSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle text inputs
  const handleTextInput = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle card generation
  const handleGenerate = async () => {
    if (!canGenerate()) return;

    setIsGenerating(true);
    setFlowState(AllergyFlowState.GENERATING);

    try {
      // This would call the allergy card API when implemented
      console.log('Generating Allergy Safety Card with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFlowState(AllergyFlowState.SUCCESS);
    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage('Failed to generate allergy safety card');
      setFlowState(AllergyFlowState.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  // Render current screen
  const renderCurrentScreen = () => {
    const config = ALLERGY_SCREEN_CONFIGS[currentScreen - 1];
    const error = errors[config.id];

    return (
      <div className="screen-container">
        <div className="screen-header">
          <h1 className="screen-title">{config.title}</h1>
          <p className="screen-helper">{config.helper}</p>
        </div>

        <div className="screen-content">
          {/* Allergen chip selection screen */}
          {config.type === 'chips' && (
            <div className="chips-grid">
              {config.options?.map((option) => {
                const isSelected = (formData.allergens || []).includes(option);
                
                return (
                  <button
                    key={option}
                    type="button"
                    className={`outline-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleChipToggle(config.id, option)}
                  >
                    {option.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          )}

          {/* Radio selection screens */}
          {config.type === 'radio' && (
            <div className="radio-group">
              {config.options?.map((option) => (
                <label key={option} className="radio-option">
                  <input
                    type="radio"
                    name={config.id}
                    value={option}
                    checked={formData[config.id as keyof AllergyPayload] === option}
                    onChange={(e) => handleRadioSelect(config.id, e.target.value)}
                    className="radio-input"
                  />
                  <span className="radio-label">
                    {option === 'severe_doctor_diagnosed' ? 'Severe (Doctor Diagnosed)' :
                     option === 'mild_intolerance' ? 'Mild Intolerance' :
                     option === 'show_alert_large' ? 'Show Alert Large' :
                     option === 'show_discreet' ? 'Show Discreetly' :
                     option === 'back_only' ? 'Back Only' :
                     option.replace('_', ' ').charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Emergency note input */}
          {config.type === 'textarea' && (
            <textarea
              value={formData.emergencyNote || ''}
              onChange={(e) => handleTextInput(config.id, e.target.value)}
              placeholder="e.g., 'Carry EpiPen', 'Lactaid in bag'"
              className={`text-input ${error ? 'error' : ''}`}
              rows={4}
              autoFocus
            />
          )}

          {error && <div className="field-error">{error}</div>}
          
          {/* Help text for different screens */}
          {currentScreen === 1 && (
            <div className="mt-4 p-3 bg-[#2A3036] rounded-lg">
              <p className="text-sm text-[#C6C7C9]">
                💡 <strong>Tip:</strong> Select all allergens that apply to you.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#14191E]">
      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-text">
          {currentScreen}/{TOTAL_SCREENS}
        </div>
      </div>

      {/* Main Content */}
      <div className="card-flow-content">
        <div className="container-narrow">
          
          {/* Header */}
          <div className="flow-header">
            <div className="flow-breadcrumb">
              <button 
                onClick={() => window.history.back()}
                className="breadcrumb-link"
              >
                ← Dashboard
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Allergy Safety Card</span>
            </div>
            
            <div className="flow-title-section">
              <h1 className="flow-title">
                Build your <span className="font-black">Allergy Safety Card</span>
              </h1>
              <p className="flow-subtitle">
                Critical safety information for emergencies. Complete all 5 steps to generate your card.
              </p>
            </div>
          </div>

          {/* Screen Content */}
          {flowState.startsWith('screen_') && renderCurrentScreen()}

          {/* Generating State */}
          {flowState === AllergyFlowState.GENERATING && (
            <div className="generating-state">
              <div className="generating-spinner"></div>
              <h2 className="generating-title">Generating Your Allergy Card...</h2>
              <p className="generating-subtitle">Creating your safety information pass</p>
            </div>
          )}

          {/* Success State */}
          {flowState === AllergyFlowState.SUCCESS && (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h2 className="success-title">Allergy Safety Card Generated!</h2>
              <p className="success-subtitle">Your critical safety information is now available in Apple Wallet.</p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Error State */}
          {flowState === AllergyFlowState.ERROR && (
            <div className="error-state">
              <div className="error-icon">✕</div>
              <h2 className="error-title">Generation Failed</h2>
              <p className="error-subtitle">{errorMessage}</p>
              <div className="error-actions">
                <button 
                  onClick={() => setFlowState(`screen_${currentScreen}` as AllergyFlowState)}
                  className="btn-primary"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="btn-secondary"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      {flowState.startsWith('screen_') && (
        <div className="sticky-action-bar">
          <div className="container-narrow">
            <div className="action-bar-content">
              <div className="action-bar-info">
                {currentScreen < TOTAL_SCREENS && (
                  <span className="action-hint">
                    {canProceed() ? 'Ready to continue' : 'Complete this step to continue'}
                  </span>
                )}
                {currentScreen === TOTAL_SCREENS && (
                  <span className="action-hint">
                    {canGenerate() ? 'Ready to generate your safety card' : 'Add emergency contact to continue'}
                  </span>
                )}
              </div>
              
              <div className="action-bar-buttons">
                {currentScreen > 1 && (
                  <button 
                    onClick={goToPrevScreen}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                )}
                
                {currentScreen < TOTAL_SCREENS && (
                  <button 
                    onClick={goToNextScreen}
                    disabled={!canProceed()}
                    className={`btn-primary ${!canProceed() ? 'disabled' : ''}`}
                  >
                    Next
                  </button>
                )}
                
                {currentScreen === TOTAL_SCREENS && (
                  <button 
                    onClick={handleGenerate}
                    disabled={!canGenerate() || isGenerating}
                    className={`btn-primary ${!canGenerate() || isGenerating ? 'disabled' : ''}`}
                  >
                    {isGenerating ? 'Generating...' : 'Add to Apple Wallet'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

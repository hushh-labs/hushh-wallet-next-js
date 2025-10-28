'use client';

import { useState } from 'react';
import { BrandPayload, BRAND_SCREEN_CONFIGS } from '@/types';

enum BrandFlowState {
  SCREEN_1 = 'screen_1', // Style Vibe
  SCREEN_2 = 'screen_2', // Favorite Brands
  SCREEN_3 = 'screen_3', // Budget Band
  SCREEN_4 = 'screen_4', // Sizes (optional)
  SCREEN_5 = 'screen_5', // Leanings (optional)
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}

const TOTAL_SCREENS = 5;

export default function BrandCardPage() {
  const [flowState, setFlowState] = useState<BrandFlowState>(BrandFlowState.SCREEN_1);
  const [currentScreen, setCurrentScreen] = useState(1);
  const [formData, setFormData] = useState<Partial<BrandPayload>>({
    styles: [],
    favBrands: [],
    budgetBand: '',
    sizes: {},
    lean: {}
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
      setFlowState(`screen_${nextScreen}` as BrandFlowState);
    }
  };

  const goToPrevScreen = () => {
    if (currentScreen > 1) {
      const prevScreen = currentScreen - 1;
      setCurrentScreen(prevScreen);
      setFlowState(`screen_${prevScreen}` as BrandFlowState);
    }
  };

  // Form validation
  const validateCurrentScreen = (): boolean => {
    const config = BRAND_SCREEN_CONFIGS[currentScreen - 1];
    setErrors(prev => ({ ...prev, [config.id]: '' }));

    if (config.required) {
      if (config.id === 'styles') {
        if (!formData.styles || formData.styles.length === 0) {
          setErrors(prev => ({ ...prev, [config.id]: 'Pick at least one style vibe' }));
          return false;
        }
      } else if (config.id === 'budgetBand') {
        if (!formData.budgetBand) {
          setErrors(prev => ({ ...prev, [config.id]: 'Select a budget band' }));
          return false;
        }
      }
    }

    return true;
  };

  // Check if we can proceed or generate
  const canProceed = (): boolean => {
    return validateCurrentScreen();
  };

  const canGenerate = (): boolean => {
    return !!(formData.styles && formData.styles.length > 0 && formData.budgetBand !== '');
  };

  // Handle form updates for chip selections
  const handleChipToggle = (field: string, value: string) => {
    const config = BRAND_SCREEN_CONFIGS.find(c => c.id === field);
    if (!config) return;

    if (field === 'styles') {
      const currentStyles = formData.styles || [];
      const isSelected = currentStyles.includes(value);
      
      if (isSelected) {
        setFormData(prev => ({
          ...prev,
          styles: currentStyles.filter(item => item !== value)
        }));
      } else {
        if (currentStyles.length < (config.maxSelections || 2)) {
          setFormData(prev => ({
            ...prev,
            styles: [...currentStyles, value]
          }));
        }
      }
    } else if (field === 'favBrands') {
      const currentBrands = formData.favBrands || [];
      const isSelected = currentBrands.includes(value);
      
      if (isSelected) {
        setFormData(prev => ({
          ...prev,
          favBrands: currentBrands.filter(item => item !== value)
        }));
      } else {
        if (currentBrands.length < (config.maxSelections || 3)) {
          setFormData(prev => ({
            ...prev,
            favBrands: [...currentBrands, value]
          }));
        }
      }
    }
  };

  // Handle radio selections
  const handleRadioSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle card generation
  const handleGenerate = async () => {
    if (!canGenerate()) return;

    setIsGenerating(true);
    setFlowState(BrandFlowState.GENERATING);

    try {
      const response = await fetch('/api/passes/brand/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate card');
      }

      // Check if response is binary .pkpass file
      const contentType = response.headers.get('content-type');
      if (contentType === 'application/vnd.apple.pkpass') {
        const blob = await response.blob();
        const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'HushOne-BrandCard.pkpass';
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setFlowState(BrandFlowState.SUCCESS);
      } else {
        const data = await response.json();
        // Handle JSON response (fallback/demo mode)
        setFlowState(BrandFlowState.SUCCESS);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate card');
      setFlowState(BrandFlowState.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  // Render current screen
  const renderCurrentScreen = () => {
    const config = BRAND_SCREEN_CONFIGS[currentScreen - 1];
    const error = errors[config.id];

    return (
      <div className="screen-container">
        <div className="screen-header">
          <h1 className="screen-title">{config.title}</h1>
          <p className="screen-helper">{config.helper}</p>
        </div>

        <div className="screen-content">
          {config.type === 'radio' && (
            <div className="radio-group">
              {config.options?.map((option) => (
                <label key={option} className="radio-option">
                  <input
                    type="radio"
                    name={config.id}
                    value={option}
                    checked={formData.budgetBand === option}
                    onChange={(e) => handleRadioSelect(config.id, e.target.value)}
                    className="radio-input"
                  />
                  <span className="radio-label">{option}</span>
                </label>
              ))}
            </div>
          )}

          {config.type === 'chips' && (
            <div className="chips-grid">
              {config.options?.map((option) => {
                const isSelected = config.id === 'styles' 
                  ? (formData.styles || []).includes(option)
                  : (formData.favBrands || []).includes(option);
                
                const currentCount = config.id === 'styles' 
                  ? (formData.styles || []).length
                  : (formData.favBrands || []).length;
                
                const isDisabled = !isSelected && currentCount >= (config.maxSelections || 3);

                return (
                  <button
                    key={option}
                    type="button"
                    className={`outline-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && handleChipToggle(config.id, option)}
                    disabled={isDisabled}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {(config.id === 'sizes' || config.id === 'lean') && (
            <div className="text-center py-8">
              <p className="text-[#C6C7C9]">Optional field - Coming soon</p>
              <p className="text-sm text-[#8AA0B2]">Skip for now to continue</p>
            </div>
          )}

          {error && <div className="field-error">{error}</div>}
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
              <span className="breadcrumb-current">Brand Preference Card</span>
            </div>
            
            <div className="flow-title-section">
              <h1 className="flow-title">
                Build your <span className="font-black">Brand Preference Card</span>
              </h1>
              <p className="flow-subtitle">
                Style & budget signals at a glance. Complete all 5 steps to generate your card.
              </p>
            </div>
          </div>

          {/* Screen Content */}
          {flowState.startsWith('screen_') && renderCurrentScreen()}

          {/* Generating State */}
          {flowState === BrandFlowState.GENERATING && (
            <div className="generating-state">
              <div className="generating-spinner"></div>
              <h2 className="generating-title">Generating Your Brand Card...</h2>
              <p className="generating-subtitle">Creating your Apple Wallet pass</p>
            </div>
          )}

          {/* Success State */}
          {flowState === BrandFlowState.SUCCESS && (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h2 className="success-title">Brand Card Generated!</h2>
              <p className="success-subtitle">Your style preference card is ready.</p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Error State */}
          {flowState === BrandFlowState.ERROR && (
            <div className="error-state">
              <div className="error-icon">✕</div>
              <h2 className="error-title">Generation Failed</h2>
              <p className="error-subtitle">{errorMessage}</p>
              <div className="error-actions">
                <button 
                  onClick={() => setFlowState(`screen_${currentScreen}` as BrandFlowState)}
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
                    {canGenerate() ? 'Ready to generate your card' : 'Complete required fields'}
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

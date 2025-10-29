'use client';

import { useState, useEffect } from 'react';
import { PersonalPayload, PERSONAL_SCREEN_CONFIGS } from '@/types';

enum PersonalFlowState {
  SCREEN_1 = 'screen_1', // Gender
  SCREEN_2 = 'screen_2', // Legal Name
  SCREEN_3 = 'screen_3', // Preferred Name
  SCREEN_4 = 'screen_4', // Phone
  SCREEN_5 = 'screen_5', // Date of Birth
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}

const TOTAL_SCREENS = 5;

export default function PersonalCardPage() {
  const [flowState, setFlowState] = useState<PersonalFlowState>(PersonalFlowState.SCREEN_1);
  const [currentScreen, setCurrentScreen] = useState(1);
  const [formData, setFormData] = useState<Partial<PersonalPayload>>({});
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
      setFlowState(`screen_${nextScreen}` as PersonalFlowState);
    }
  };

  const goToPrevScreen = () => {
    if (currentScreen > 1) {
      const prevScreen = currentScreen - 1;
      setCurrentScreen(prevScreen);
      setFlowState(`screen_${prevScreen}` as PersonalFlowState);
    }
  };

  // Form validation
  const validateCurrentScreen = (): boolean => {
    const config = PERSONAL_SCREEN_CONFIGS[currentScreen - 1];
    const value = formData[config.id as keyof PersonalPayload];
    
    setErrors(prev => ({ ...prev, [config.id]: '' }));

    if (config.required && (!value || value.toString().trim() === '')) {
      setErrors(prev => ({ ...prev, [config.id]: config.errorMessage || 'This field is required' }));
      return false;
    }

    // Additional validation based on field type
    if (config.validation && value) {
      const val = value.toString();
      
      if (config.validation.min && val.length < config.validation.min) {
        setErrors(prev => ({ ...prev, [config.id]: config.errorMessage || `Minimum ${config.validation?.min} characters required` }));
        return false;
      }
      
      if (config.validation.max && val.length > config.validation.max) {
        setErrors(prev => ({ ...prev, [config.id]: config.errorMessage || `Maximum ${config.validation?.max} characters allowed` }));
        return false;
      }
    }

    // Phone validation
    if (config.id === 'phone' && value) {
      const phoneRegex = /^\+[1-9]\d{8,14}$/;
      if (!phoneRegex.test(value.toString().trim())) {
        setErrors(prev => ({ ...prev, [config.id]: config.errorMessage || 'Please enter a valid phone number with country code' }));
        return false;
      }
    }

    // Date validation
    if (config.id === 'dob' && value) {
      const birthDate = new Date(value.toString());
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 1 || age > 120 || birthDate > today) {
        setErrors(prev => ({ ...prev, [config.id]: config.errorMessage || 'Please enter a valid date of birth' }));
        return false;
      }
    }

    return true;
  };

  // Check if we can proceed to next screen or generate
  const canProceed = (): boolean => {
    const config = PERSONAL_SCREEN_CONFIGS[currentScreen - 1];
    const value = formData[config.id as keyof PersonalPayload];
    
    if (config.required && (!value || value.toString().trim() === '')) {
      return false;
    }

    // Additional validation based on field type
    if (config.validation && value) {
      const val = value.toString();
      
      if (config.validation.min && val.length < config.validation.min) {
        return false;
      }
      
      if (config.validation.max && val.length > config.validation.max) {
        return false;
      }
    }

    // Phone validation
    if (config.id === 'phone' && value) {
      const phoneRegex = /^\+[1-9]\d{8,14}$/;
      if (!phoneRegex.test(value.toString().trim())) {
        return false;
      }
    }

    // Date validation
    if (config.id === 'dob' && value) {
      const birthDate = new Date(value.toString());
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 1 || age > 120 || birthDate > today) {
        return false;
      }
    }

    return true;
  };

  // Check if all required fields are filled for final generation
  const canGenerate = (): boolean => {
    const requiredFields = PERSONAL_SCREEN_CONFIGS
      .filter(config => config.required)
      .map(config => config.id);
    
    return requiredFields.every(field => {
      const value = formData[field as keyof PersonalPayload];
      return value && value.toString().trim() !== '';
    });
  };

  // Handle form field updates
  const updateFormData = (field: string, value: string) => {
    // Special handling for date fields
    if (field === 'dob') {
      console.log('Date input received:', value, typeof value);
      
      // If value is empty, clear the field
      if (!value || value.trim() === '') {
        setFormData(prev => ({ ...prev, [field]: '' }));
        return;
      }
      
      // Only accept complete dates in YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        console.warn('Ignoring incomplete date:', value);
        return; // Don't update if format is invalid or incomplete
      }
      
      // Additional validation for realistic date
      const testDate = new Date(value);
      const currentYear = new Date().getFullYear();
      
      if (isNaN(testDate.getTime()) || 
          testDate.getFullYear() < 1900 || 
          testDate.getFullYear() > currentYear ||
          testDate > new Date()) {
        console.warn('Ignoring unrealistic date:', value);
        return;
      }
      
      console.log('Valid date accepted:', value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fill preferred name from legal name
    if (field === 'legalName' && !formData.preferredName) {
      const firstName = value.split(' ')[0];
      setFormData(prev => ({ ...prev, preferredName: firstName }));
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle card generation
  const handleGenerate = async () => {
    if (!canGenerate()) return;

    setIsGenerating(true);
    setFlowState(PersonalFlowState.GENERATING);

    try {
      const response = await fetch('/api/passes/personal/create', {
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
        const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'HushOne-PersonalCard.pkpass';
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setFlowState(PersonalFlowState.SUCCESS);
      } else {
        const data = await response.json();
        // Handle JSON response (fallback/demo mode)
        setFlowState(PersonalFlowState.SUCCESS);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate card');
      setFlowState(PersonalFlowState.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  // Render current screen
  const renderCurrentScreen = () => {
    const config = PERSONAL_SCREEN_CONFIGS[currentScreen - 1];
    const value = formData[config.id as keyof PersonalPayload] || '';
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
                    checked={value === option}
                    onChange={(e) => updateFormData(config.id, e.target.value)}
                    className="radio-input"
                  />
                  <span className="radio-label">{option.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          )}

          {config.type === 'text' && (
            <input
              type="text"
              value={value}
              onChange={(e) => updateFormData(config.id, e.target.value)}
              placeholder={config.id === 'legalName' ? 'e.g., Anita Sharma' : config.id === 'preferredName' ? 'Anita' : ''}
              className={`text-input ${error ? 'error' : ''}`}
              autoFocus
            />
          )}

          {config.type === 'phone' && (
            <input
              type="tel"
              value={value}
              onChange={(e) => updateFormData(config.id, e.target.value)}
              placeholder="+91 98••• 1234"
              className={`text-input ${error ? 'error' : ''}`}
              autoFocus
            />
          )}

          {config.type === 'date' && (
            <input
              type="date"
              value={value}
              onChange={(e) => updateFormData(config.id, e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Today's date as max
              min="1900-01-01" // Minimum realistic birth year
              className={`text-input ${error ? 'error' : ''}`}
              autoFocus
            />
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
              <span className="breadcrumb-current">Personal Data Card</span>
            </div>
            
            <div className="flow-title-section">
              <h1 className="flow-title">
                Build your <span className="font-black">Personal Data Card</span>
              </h1>
              <p className="flow-subtitle">
                Your identity, elegantly minimal. Complete all 5 steps to generate your card.
              </p>
            </div>
          </div>

          {/* Screen Content */}
          {flowState.startsWith('screen_') && renderCurrentScreen()}

          {/* Generating State */}
          {flowState === PersonalFlowState.GENERATING && (
            <div className="generating-state">
              <div className="generating-spinner"></div>
              <h2 className="generating-title">Generating Your Personal Card...</h2>
              <p className="generating-subtitle">Creating your Apple Wallet pass</p>
            </div>
          )}

          {/* Success State */}
          {flowState === PersonalFlowState.SUCCESS && (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h2 className="success-title">Personal Card Generated!</h2>
              <p className="success-subtitle">Your card has been downloaded and can be added to Apple Wallet.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Error State */}
          {flowState === PersonalFlowState.ERROR && (
            <div className="error-state">
              <div className="error-icon">✕</div>
              <h2 className="error-title">Generation Failed</h2>
              <p className="error-subtitle">{errorMessage}</p>
              <div className="error-actions">
                <button 
                  onClick={() => setFlowState(`screen_${currentScreen}` as PersonalFlowState)}
                  className="btn-primary"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
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
                    {canGenerate() ? 'Ready to generate your card' : 'Complete all required fields'}
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

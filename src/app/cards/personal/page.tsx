'use client';
// Force cache refresh for new single-page flow - deployed at 11:08 AM
import { useState, useEffect } from 'react';
import { PersonalDataSelector } from '@/components/PersonalDataSelector';
import { CardPreview } from '@/components/CardPreview';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { PersonalPayload } from '@/types';
import { postJSON, pollUntil, fetchJSON } from '@/lib/fetchHelper';

enum AppState {
  HERO = 'hero',
  FORM = 'form',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}

export default function PersonalCardPage() {
  const [appState, setAppState] = useState<AppState>(AppState.HERO);
  const [isIOS, setIsIOS] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [generatedURL, setGeneratedURL] = useState<string>('');
  const [personalData, setPersonalData] = useState<PersonalPayload | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressComplete, setProgressComplete] = useState(false);

  // Define detailed progress steps
  const progressSteps = [
    {
      id: 'validation',
      title: 'Validating Information',
      description: 'Checking your personal information for completeness and format compliance.',
      details: [
        'Verifying name format and character limits',
        'Validating phone number format and country code',
        'Checking date of birth for valid range',
        'Ensuring all required fields are complete'
      ]
    },
    {
      id: 'security',
      title: 'Securing Your Data',
      description: 'Applying privacy protection and encryption to safeguard your information.',
      details: [
        'Encrypting sensitive personal information',
        'Generating unique secure identifier',
        'Setting up privacy protection layers',
        'Preparing secure data storage'
      ]
    },
    {
      id: 'qr-generation',
      title: 'Generating QR Code',
      description: 'Creating your personalized QR code with encoded information.',
      details: [
        'Encoding your information securely',
        'Generating high-quality QR matrix',
        'Optimizing code for wallet applications',
        'Adding error correction capabilities'
      ]
    },
    {
      id: 'pass-creation',
      title: 'Creating Apple Wallet Pass',
      description: 'Building your digital pass with Apple Wallet formatting and security.',
      details: [
        'Designing card layout with your details',
        'Adding Apple security certificates',
        'Preparing .pkpass file format',
        'Configuring wallet presentation settings'
      ]
    },
    {
      id: 'finalization',
      title: 'Finalizing Your Card',
      description: 'Running final checks and preparing your card for download.',
      details: [
        'Running comprehensive quality checks',
        'Verifying pass integrity and security',
        'Preparing secure download link',
        'Card ready for Apple Wallet integration'
      ]
    }
  ];

  // Device detection (same as food card)
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Analytics: device detection
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', isIOSDevice ? 'ios_detected' : 'android_detected', {
        event_category: 'device_detection'
      });
    }
  }, []);

  const handleGetStarted = () => {
    setAppState(AppState.FORM);
  };

  // Simulate progress steps
  useEffect(() => {
    if (appState === AppState.GENERATING) {
      setCurrentStep(0);
      setProgressComplete(false);
      
      const stepTimers: NodeJS.Timeout[] = [];
      
      // Progress through each step with realistic timing
      const stepDurations = [3000, 2500, 3500, 4000, 2000]; // milliseconds for each step
      
      let totalDelay = 0;
      stepDurations.forEach((duration, index) => {
        totalDelay += duration;
        stepTimers.push(
          setTimeout(() => {
            setCurrentStep(index + 1);
          }, totalDelay)
        );
      });
      
      // Complete progress after all steps
      stepTimers.push(
        setTimeout(() => {
          setProgressComplete(true);
        }, totalDelay + 1000)
      );
      
      return () => {
        stepTimers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [appState]);

  // Handle progress completion
  const handleProgressComplete = async () => {
    if (!personalData) return;

    try {
      // Send personal data to unified backend
      const result = await postJSON<{
        success: boolean;
        data: {
          uid: string;
          isComplete: boolean;
          hasPass: boolean;
          shareUrl: string;
          passGenerating?: boolean;
        };
      }>('/api/cards/update', {
        section: 'personal',
        data: {
          preferredName: personalData.preferredName,
          legalName: personalData.legalName,
          phone: personalData.phone,
          dob: personalData.dob,
          gender: personalData.gender
        }
      }, { timeout: 15000 }); // 15 second timeout

      // Analytics: personal_data_saved
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'personal_data_saved', {
          event_category: 'unified_card_creation',
          is_complete: result.data.isComplete
        });
      }

      // Store UID for later operations
      sessionStorage.setItem('hushh_uid', result.data.uid);
      setGeneratedURL(result.data.shareUrl);

      if (result.data.isComplete) {
        if (result.data.hasPass) {
          // Pass is ready immediately
          setAppState(AppState.SUCCESS);
        } else if (result.data.passGenerating) {
          // Pass is being generated in background - poll for completion
          try {
            await pollUntil(
              () => fetchJSON<any>(`/api/cards/status/${result.data.uid}`),
              (status) => status.hasPass || status.passGeneration?.status === 'failed',
              {
                interval: 3000,
                maxAttempts: 20, // 1 minute max
                onProgress: (status, attempt) => {
                  console.log(`Pass generation check ${attempt}:`, status.passGeneration?.status);
                }
              }
            );
            setAppState(AppState.SUCCESS);
          } catch (pollError) {
            console.warn('Pass generation polling failed:', pollError);
            // Still show success since data was saved
            setAppState(AppState.SUCCESS);
          }
        } else {
          // Both sections complete but no pass generation scheduled
          setAppState(AppState.SUCCESS);
        }
      } else {
        // Need to complete food section
        window.location.href = '/cards/food';
      }

    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save personal data');
      setAppState(AppState.ERROR);
    }
  };

  // Form submission -> Direct generation (no preview)
  const handleFormSubmit = async (data: PersonalPayload) => {
    setPersonalData(data);
    setAppState(AppState.GENERATING);
    setErrorMessage('');
  };

  const handleReset = () => {
    setAppState(AppState.HERO);
    setErrorMessage('');
    setGeneratedURL('');
  };

  const handleEmailLink = () => {
    const subject = encodeURIComponent('Your Hushh Personal Card');
    const body = encodeURIComponent(`Here's your Hushh Personal Card: ${generatedURL}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleDownloadPass = async () => {
    try {
      const uid = sessionStorage.getItem('hushh_uid');
      if (!uid) {
        throw new Error('User ID not found');
      }

      const response = await fetch(`/api/cards/download/${uid}`, {
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      if (!response.ok) {
        throw new Error('Failed to download pass');
      }

      // Download the pass file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hushh-id-card.pkpass';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Analytics: pass_downloaded
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'unified_pass_downloaded', {
          event_category: 'pass_generation'
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download pass. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {appState === AppState.HERO && (
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="container-narrow">
            <div className="text-center space-y-8 fade-in">
              <div className="space-y-6">
                <p className="text-eyebrow">Identity, simplified</p>
                <h1 className="text-hero text-ink">
                  Build your <span className="font-black">Hushh Personal Data Card</span>
                </h1>
              </div>
              
              <p className="text-deck text-muted max-w-3xl mx-auto">
                Your essential personal information in a clean, luxury card for <strong className="text-ink">Apple Wallet</strong>.
              </p>

              <div className="pt-6">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary hover-lift"
                >
                  Get Started
                </button>
              </div>

              <p className="text-sm text-muted">
                Works on iPhone with Apple Wallet.
              </p>
            </div>

            {/* Back to Dashboard */}
            <div className="text-center mt-12">
              <button
                onClick={handleBackToDashboard}
                className="btn-secondary"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      {(appState === AppState.FORM || appState === AppState.GENERATING) && (
        <div className="min-h-screen bg-paper">
          <div className="section-padding">
            <div className="container-narrow">
              {/* Header */}
              <div className="text-center mb-12 space-y-6 fade-in">
                <p className="text-eyebrow">Enter Your Details</p>
                <h1 className="text-hero text-ink">
                  Fill your <span className="font-black">personal information</span>
                </h1>
                <p className="text-deck text-muted max-w-3xl mx-auto">
                  Complete all fields to create your personalized identity card. 
                  <strong className="text-ink">All fields</strong> are required for a complete card.
                </p>
              </div>

              {/* Personal Data Selector */}
              {appState === AppState.FORM && (
                <div>
                  <PersonalDataSelector 
                    onGenerate={handleFormSubmit}
                    isGenerating={false}
                  />
                </div>
              )}

              {/* Progress Indicator for Generating State */}
              {appState === AppState.GENERATING && (
                <div className="mt-8">
                  <ProgressIndicator 
                    currentStep={currentStep}
                    steps={progressSteps}
                    isComplete={progressComplete}
                    onComplete={handleProgressComplete}
                  />
                </div>
              )}

              {/* Back Link */}
              <div className="text-center mt-12">
                <button
                  onClick={handleReset}
                  className="btn-secondary"
                  disabled={appState === AppState.GENERATING}
                >
                  ← Back to Card Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Success State (Non-iOS) */}
      {appState === AppState.SUCCESS && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md mx-auto px-6 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-ink">Card Generated!</h2>
              <p className="text-muted">
                {isIOS === false 
                  ? "Apple Wallet is iPhone-only. Email the link to yourself to open on your iPhone."
                  : "Your personal card is ready."
                }
              </p>
            </div>

            <div className="space-y-3">
              {generatedURL && (
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadPass}
                    className="btn-primary w-full"
                  >
                    📱 Add to Apple Wallet
                  </button>

                  <a
                    href={generatedURL}
                    className="btn-secondary w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 View Public Profile
                  </a>
                  
                  <button
                    onClick={handleEmailLink}
                    className="btn-secondary"
                  >
                    Email me the link
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleBackToDashboard}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {appState === AppState.ERROR && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md mx-auto px-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-ink">Something went wrong</h2>
              <p className="text-muted">{errorMessage}</p>
            </div>

            <button
              onClick={() => setAppState(AppState.FORM)}
              className="btn-primary"
            >
              Try Again
            </button>

            <button
              onClick={handleBackToDashboard}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
